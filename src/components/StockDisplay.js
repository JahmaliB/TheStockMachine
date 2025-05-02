import React from 'react';

const StockDisplay = ({ stockData, onFavorite }) => {
  if (!stockData) return null;

  const { 
    symbol, 
    price, 
    peRatio, 
    growthRate, 
    week52High, 
    week52Low,
    industry
  } = stockData;

  return (
    <div className="stock-display">
      <h2>{symbol}</h2>
      <div className="stock-metrics">
        <div className="metric">
          <span className="metric-label">Price:</span>
          <span className="metric-value"> ${price}</span>
        </div>
        <div className="metric">
          <span className="metric-label">P/E Ratio:</span>
          <span className="metric-value"> {peRatio}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Growth Rate:</span>
          <span className="metric-value"> {growthRate}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Growth/P/E:</span>
          <span className="metric-value"> {peRatio !== 0 ? ((growthRate / peRatio).toFixed(2)): "N/A"}</span>
        </div>
        <div className="metric">
          <span className="metric-label">52 Week Range:</span>
          <span className="metric-value">$ {parseFloat(week52Low) - parseFloat(week52High)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Industry:</span>
          <span className="metric-value">{industry}</span>
        </div>
      </div>
      <button 
        onClick={() => onFavorite(stockData)} 
        className="favorite-btn"
      >
        Add to Favorites
      </button>
    </div>
  );
};

export default StockDisplay;