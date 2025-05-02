import React from 'react';

const IndustryFilter = ({ 
  industries, 
  currentIndustry, 
  onFilterChange,
  onClearFilter 
}) => {
  return (
    <div className="industry-filter">
      <label htmlFor="industry-select">Filter by Industry: </label>
      <select
        id="industry-select"
        onChange={(e) => {
          const value = e.target.value;
          if (value === "") {
            onClearFilter();
          } else {
            onFilterChange(value); 
          }
        }}
        value={currentIndustry || ''}
      >
        <option value="">All Industries</option>
        {industries.map(industry => (
          <option key={industry} value={industry}>{industry}</option>
        ))}
      </select>
      {currentIndustry && (
        <button 
          onClick={onClearFilter}
          className="clear-filter"
        >
          Clear Filter
        </button>
      )}
    </div>
  );
};

export default IndustryFilter;