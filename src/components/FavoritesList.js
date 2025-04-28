import React from 'react';
import IndustryFilter from './IndustryFilter';

const FavoritesList = ({ favorites, onRemoveFavorite, onFilterByIndustry, currentIndustry }) => {
  const industries = [...new Set(favorites.map(fav => fav.industry))];

  return (
    <div className="favorites-list">
      <h2>Your Favorite Stocks</h2>
      
      <IndustryFilter
        industries={industries}
        currentIndustry={currentIndustry}
        onFilterChange={onFilterByIndustry}
        onClearFilter={() => onFilterByIndustry('')}
      />

      {favorites.length === 0 ? (
        <p className="no-favorites">No favorites yet. Search for stocks to add some!</p>
      ) : (
        <ul className="favorites-grid">
          {favorites.map(stock => (
            <li key={stock.symbol} className="favorite-item">
              <div className="stock-info">
                <span className="stock-symbol">{stock.symbol}</span>
                <span className="stock-price">${stock.price}</span>
                <span className="stock-growth">{stock.growthRate}%</span>
              </div>
              <button 
                onClick={() => onRemoveFavorite(stock.symbol)}
                className="remove-btn"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesList;