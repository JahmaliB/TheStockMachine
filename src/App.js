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

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteStocks')) || [];
    setFavorites(savedFavorites);
    setFilteredFavorites(savedFavorites);
  }, []);

  const handleSearch = async (ticker) => {
    setLoading(true);
    setError(null);
    try {
      // This will be replaced with actual API calls by your API team member
      const mockData = {
        symbol: ticker,
        price: 150.42,
        peRatio: 25,
        growthRate: 30,
        growthToPE: 1.2,
        week52High: 165.32,
        week52Low: 120.54,
        industry: 'Technology'
      };
      setStockData(mockData);
    } catch (err) {
      setError('Failed to fetch stock data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = (stock) => {
    const updatedFavorites = [...favorites, stock];
    setFavorites(updatedFavorites);
    setFilteredFavorites(updatedFavorites);
    localStorage.setItem('favoriteStocks', JSON.stringify(updatedFavorites));
  };

  const handleRemoveFavorite = (symbol) => {
    const updatedFavorites = favorites.filter(stock => stock.symbol !== symbol);
    setFavorites(updatedFavorites);
    setFilteredFavorites(updatedFavorites);
    localStorage.setItem('favoriteStocks', JSON.stringify(updatedFavorites));
  };

  const handleFilterByIndustry = (industry) => {
    if (!industry) {
      setFilteredFavorites(favorites);
    } else {
      setFilteredFavorites(favorites.filter(stock => stock.industry === industry));
    }
  };

  return (
    <Layout>
      <div className="app-content">
        <SearchStock onSearch={handleSearch} />
        
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        
        <div className="stock-content">
          <StockDisplay 
            stockData={stockData} 
            onFavorite={handleAddFavorite} 
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