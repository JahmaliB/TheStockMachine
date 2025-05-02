import React from 'react';
import IndustryFilter from './IndustryFilter';

const FavoritesList = ({ 
  favorites, 
  onRemoveFavorite, 
  onFilterByIndustry, 
  currentIndustry 
}) => {
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
                <span className="stock-symbol">{stock.symbol}:</span><br />
                <span className="stock-price">Stock Price: ${stock.price}</span><br />
                <span className="stock-pe">Stock P/E Ratio: {stock.peRatio}</span><br />
                <span className="stock-growth">Stock Growth Rate: {stock.growthRate}%</span><br />
                <span className="stock-growth-pe">
                  Growth/P/E: {stock.peRatio !== 0 ? (stock.growthRate / stock.peRatio).toFixed(2) : "N/A"}
                </span><br />
                <span className="stock-week52">
                  52 Week Range: ${stock.week52Low} - ${stock.week52High}
                </span><br />
                <span className="stock-industry">Industry: {stock.industry}</span><br />
              </div>
              <button onClick={() => onRemoveFavorite(stock.symbol)} className="remove-btn">
                Remove
              </button>
              <span className='blank'> </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesList;
