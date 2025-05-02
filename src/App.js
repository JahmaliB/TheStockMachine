import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SearchStock from './components/SearchStock';
import StockDisplay from './components/StockDisplay';
import FavoritesList from './components/FavoritesList';
import './App.css';

function App() {
  const [stockData, setStockData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = '4MAYKRBW4APEJCXZ';

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteStocks')) || [];
    setFavorites(savedFavorites);
    setFilteredFavorites(savedFavorites);
  }, []);

  const calculateGrowthRate = (currentValue, previousValue) => {
    if (!currentValue || !previousValue || previousValue === 0) return 'N/A';
    return (((currentValue - previousValue) / Math.abs(previousValue)) * 100).toFixed(2);
  };

  const handleSearch = async (ticker) => {
    if (!ticker) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get all required data in parallel
      const [quoteResponse, overviewResponse, earningsResponse] = await Promise.all([
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`),
        fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`),
        fetch(`https://www.alphavantage.co/query?function=EARNINGS&symbol=${ticker}&apikey=${apiKey}`)
      ]);

      const [quoteData, overviewData, earningsData] = await Promise.all([
        quoteResponse.json(),
        overviewResponse.json(),
        earningsResponse.json()
      ]);

      // Check for API errors
      if (quoteData['Error Message'] || overviewData['Error Message'] || earningsData['Error Message']) {
        throw new Error(quoteData['Error Message'] || overviewData['Error Message'] || earningsData['Error Message']);
      }

      // Get price
      const price = quoteData['Global Quote']?.['05. price'] 
        ? parseFloat(quoteData['Global Quote']['05. price']).toFixed(2)
        : 'N/A';

      // Get P/E Ratio
      const peRatio = overviewData.PERatio 
        ? parseFloat(overviewData.PERatio).toFixed(2)
        : 'N/A';

      // Calculate Growth Rate (using quarterly earnings)
      let growthRate = 'N/A';
      if (earningsData.quarterlyEarnings?.length >= 4) {
        const currentEPS = parseFloat(earningsData.quarterlyEarnings[0]?.reportedEPS);
        const previousEPS = parseFloat(earningsData.quarterlyEarnings[4]?.reportedEPS);
        growthRate = calculateGrowthRate(currentEPS, previousEPS);
      }

      // Calculate Growth P/E
      const growthPE = (growthRate !== 'N/A' && peRatio !== 'N/A')
        ? (peRatio / growthRate).toFixed(2)
        : 'N/A';

      // Get 52-week range
      const week52High = overviewData['52WeekHigh'] 
        ? parseFloat(overviewData['52WeekHigh']).toFixed(2)
        : 'N/A';
      const week52Low = overviewData['52WeekLow'] 
        ? parseFloat(overviewData['52WeekLow']).toFixed(2)
        : 'N/A';

      const transformedData = {
        symbol: ticker.toUpperCase(),
        name: overviewData.Name || ticker.toUpperCase(),
        price: price,
        peRatio: peRatio,
        growthRate: growthRate,
        growthPE: growthPE,
        week52High: week52High,
        week52Low: week52Low,
        industry: overviewData.Industry || 'N/A',
        currency: overviewData.Currency || 'USD',
        lastUpdated: new Date().toISOString()
      };

      setStockData(transformedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data. Please try again later.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = (stock) => {
    if (!stock?.symbol) return;
    
    if (!favorites.some(fav => fav.symbol === stock.symbol)) {
      const updatedFavorites = [...favorites, {
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        price: stock.price,
        peRatio: stock.peRatio,
        growthRate: stock.growthRate,
        growthPE: stock.growthPE,
        week52High: stock.week52High,
        week52Low: stock.week52Low,
        industry: stock.industry || 'N/A',
        addedAt: new Date().toISOString()
      }];
      
      setFavorites(updatedFavorites);
      setFilteredFavorites(updatedFavorites);
      localStorage.setItem('favoriteStocks', JSON.stringify(updatedFavorites));
    }
  };

  const handleRemoveFavorite = (symbol) => {
    const updatedFavorites = favorites.filter(stock => stock.symbol !== symbol);
    setFavorites(updatedFavorites);
    setFilteredFavorites(updatedFavorites);
    localStorage.setItem('favoriteStocks', JSON.stringify(updatedFavorites));
  };

  const handleFilterByIndustry = (industry) => {
    setFilteredFavorites(
      industry 
        ? favorites.filter(stock => stock.industry === industry) 
        : favorites
    );
  };

  return (
    <Layout>
      <div className="app-content">
        <SearchStock 
          onSearch={handleSearch} 
          disabled={loading}
        />
        
        {loading && (
          <div className="loading">
            Loading... (API has 5 requests/minute limit)
          </div>
        )}
        
        {error && (
          <div className="error">
            {error}
            {error.includes('rate limit') && (
              <p>Please wait 1 minute before trying again</p>
            )}
          </div>
        )}
        
        <div className="stock-content">
          <StockDisplay 
            stockData={stockData} 
            onFavorite={handleAddFavorite} 
            isFavorite={favorites.some(fav => fav.symbol === stockData?.symbol)}
          />
          
          <FavoritesList 
            favorites={filteredFavorites} 
            onRemoveFavorite={handleRemoveFavorite}
            onFilterByIndustry={handleFilterByIndustry}
          />
        </div>
      </div>
    </Layout>
  );
}

export default App;