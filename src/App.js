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
  const apiKey = '4MAYKRBW4APEJCXZ'; // Your Alpha Vantage API key

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteStocks')) || [];
    setFavorites(savedFavorites);
    setFilteredFavorites(savedFavorites);
  }, []);

  const handleSearch = async (ticker) => {
    if (!ticker) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First check if we have cached data
      const cachedData = sessionStorage.getItem(`stock_${ticker}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (Date.now() - parsedData.timestamp < 300000) { // 5 minute cache
          setStockData(parsedData.data);
          setLoading(false);
          return;
        }
      }

      // Get both quote and overview data in parallel
      const [quoteResponse, overviewResponse] = await Promise.all([
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`),
        fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`)
      ]);

      const [quoteData, overviewData] = await Promise.all([
        quoteResponse.json(),
        overviewResponse.json()
      ]);

      // Check for API errors
      if (quoteData['Error Message'] || overviewData['Error Message']) {
        throw new Error(quoteData['Error Message'] || overviewData['Error Message']);
      }

      // Check for rate limiting
      if (quoteData.Note || overviewData.Note) {
        throw new Error(quoteData.Note || overviewData.Note || 'API rate limit exceeded');
      }

      // Get price - prioritize GLOBAL_QUOTE
      const price = quoteData['Global Quote']?.['05. price'] 
        ? parseFloat(quoteData['Global Quote']['05. price']) 
        : 'N/A';

      // Get P/E Ratio with fallback to 'N/A'
      const peRatio = overviewData.PERatio 
        ? parseFloat(overviewData.PERatio).toFixed(2) 
        : 'N/A';

      // Get Growth Rate (using Quarterly Earnings Growth)
      const growthRate = overviewData.QuarterlyEarningsGrowth 
        ? parseFloat(overviewData.QuarterlyEarningsGrowth).toFixed(2) 
        : 'N/A';

      // Calculate Growth/P/E if both values are available
      const growthToPE = (growthRate !== 'N/A' && peRatio !== 'N/A') 
        ? (growthRate / peRatio).toFixed(2) 
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
        growthToPE: growthToPE,
        week52High: week52High,
        week52Low: week52Low,
        industry: overviewData.Industry || 'N/A',
        currency: overviewData.Currency || 'USD',
        lastUpdated: new Date().toISOString()
      };

      // Cache the data
      sessionStorage.setItem(`stock_${ticker}`, JSON.stringify({
        data: transformedData,
        timestamp: Date.now()
      }));

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
        growthToPE: stock.growthToPE,
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