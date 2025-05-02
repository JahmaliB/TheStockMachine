import React, { useState } from 'react';

const SearchStock = ({ onSearch }) => {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.toUpperCase());
      setTicker('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Enter stock ticker (e.g., AAPL)"
        required
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchStock;