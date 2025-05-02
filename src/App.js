import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SearchStock from './components/SearchStock';
import StockDisplay from './components/StockDisplay';
import FavoritesList from './components/FavoritesList';
import './App.css';
import './style.css';

function App() {
  const [currentIndustry, setCurrentIndustry] = useState('');
  // State for storing the currently displayed stock data
  const [stockData, setStockData] = useState(null);
  // State for storing favorite stocks
  const [favorites, setFavorites] = useState([]);
  // State for storing filtered favorites (by industry)
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  // Error state for API errors
  const [error, setError] = useState(null);
  // API key for Alpha Vantage
  const apiKey = '4MAYKRBW4APEJCXZ'; // api call from website

  // Effect hook to load favorites from localStorage when component mounts
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteStocks')) || [];
    setFavorites(savedFavorites);
    setFilteredFavorites(savedFavorites);
  }, []);

  // Helper function to calculate growth rate between two values
  const calculateGrowthRate = (currentValue, previousValue) => {
    if (!currentValue || !previousValue || previousValue === 0) return 'N/A';
    return (((currentValue - previousValue) / Math.abs(previousValue)) * 100).toFixed(2);
  };

  // Handler for stock search functionality
  const handleSearch = async (ticker) => {
    if (!ticker) {
      setError('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch all required data in parallel using Promise.all
      const [quoteResponse, overviewResponse, earningsResponse] = await Promise.all([
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`),
        fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`),
        fetch(`https://www.alphavantage.co/query?function=EARNINGS&symbol=${ticker}&apikey=${apiKey}`)
      ]);

      // Parse all responses
      const [quoteData, overviewData, earningsData] = await Promise.all([
        quoteResponse.json(),
        overviewResponse.json(),
        earningsResponse.json()
      ]);

      // Check for API errors in any of the responses
      if (quoteData['Error Message'] || overviewData['Error Message'] || earningsData['Error Message']) {
        throw new Error(quoteData['Error Message'] || overviewData['Error Message'] || earningsData['Error Message']);
      }

      // Extract and format price data
      const price = quoteData['Global Quote']?.['05. price'] 
        ? parseFloat(quoteData['Global Quote']['05. price']).toFixed(2)
        : 'N/A';

      // Extract and format P/E ratio
      const peRatio = overviewData.PERatio 
        ? parseFloat(overviewData.PERatio).toFixed(2)
        : 'N/A';

      // Calculate growth rate from quarterly earnings data
      let growthRate = 'N/A';
      if (earningsData.quarterlyEarnings?.length >= 4) {
        const currentEPS = parseFloat(earningsData.quarterlyEarnings[0]?.reportedEPS);
        const previousEPS = parseFloat(earningsData.quarterlyEarnings[4]?.reportedEPS);
        growthRate = calculateGrowthRate(currentEPS, previousEPS);
      }

      // Calculate Growth P/E ratio (PEG ratio)
      const growthPE = (growthRate !== 'N/A' && peRatio !== 'N/A')
        ? (peRatio / growthRate).toFixed(2)
        : 'N/A';

      // Extract and format 52-week high/low
      const week52High = overviewData['52WeekHigh'] 
        ? parseFloat(overviewData['52WeekHigh']).toFixed(2)
        : 'N/A';
      const week52Low = overviewData['52WeekLow'] 
        ? parseFloat(overviewData['52WeekLow']).toFixed(2)
        : 'N/A';

      // Transform all data into a unified format
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

      // Update state with the transformed data
      setStockData(transformedData);
    } catch (err) {
      // Handle any errors that occur during the API calls
      setError(err.message || 'Failed to fetch stock data. Please try again later.');
      console.error('API Error:', err);
    } finally {
      // Reset loading state regardless of success/failure
      setLoading(false);
    }
  };

  // Handler for adding a stock to favorites
  const handleAddFavorite = (stock) => {
    if (!stock?.symbol) return;
    
    // Check if stock is already in favorites
    if (!favorites.some(fav => fav.symbol === stock.symbol)) {
      // Create new favorites array with the added stock
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
      
      // Update both favorites and filtered favorites
      setFavorites(updatedFavorites);
      setFilteredFavorites(updatedFavorites);
      localStorage.setItem('favoriteStocks', JSON.stringify(updatedFavorites));
    }
  };

  // Handler for removing a stock from favorites
  const handleRemoveFavorite = (symbol) => {
    const updatedFavorites = favorites.filter(stock => stock.symbol !== symbol);
    setFavorites(updatedFavorites);
    setFilteredFavorites(updatedFavorites);
    localStorage.setItem('favoriteStocks', JSON.stringify(updatedFavorites));
  };

  // Handler for filtering favorites by industry
  const handleFilterByIndustry = (industry) => {
    setCurrentIndustry(industry);
    const updatedList = industry
      ? favorites.filter(stock => stock.industry === industry)
      : favorites;
    setFilteredFavorites(updatedList);
  };
  

  // Main component render
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
        
        {/* Main content area with stock display and favorites list */}
        <div className="stock-content">
          {/* Component to display current stock data */}
          <StockDisplay 
            stockData={stockData} 
            onFavorite={handleAddFavorite} 
            isFavorite={favorites.some(fav => fav.symbol === stockData?.symbol)}
          />
          
          <FavoritesList 
            favorites={filteredFavorites} 
            onRemoveFavorite={handleRemoveFavorite}
            onFilterByIndustry={handleFilterByIndustry}
            currentIndustry={currentIndustry}
          />
        </div>
      </div>
    </Layout>
  );
}

export default App;