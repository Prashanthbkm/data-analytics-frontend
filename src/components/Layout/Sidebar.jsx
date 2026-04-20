import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({
  selectedColumns = [],
  onColumnToggle,
  filters = {},
  onFilterChange,
  onApply,
  onClear,
  hasActiveFilters = false
}) => {
  // ALL filter options with predefined values for each field
  const filterOptions = [
    { key: "status", label: "Status", icon: "⚡", type: "select", options: ["Success", "Failed", "Pending"] },
    { key: "currency", label: "Currency", icon: "💱", type: "select", options: ["USD", "EUR", "GBP", "INR", "JPY", "CAD"] },
    { key: "paymentMethod", label: "Payment Method", icon: "💳", type: "select", options: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash", "Wire Transfer"] },
    { key: "baRecoStatus", label: "BA Reco Status", icon: "✅", type: "select", options: ["Matched", "Unmatched", "Partial", "Pending", "Completed"] },
  ];

  // ALL text input filters
  const textFilters = [
    { key: "baIdentifier", label: "BA Identifier", icon: "🏢", type: "text", placeholder: "Enter BA Identifier..." },
    { key: "transactionId", label: "Transaction ID", icon: "🔢", type: "text", placeholder: "Enter Transaction ID..." },
    { key: "customerId", label: "Customer ID", icon: "👤", type: "text", placeholder: "Enter Customer ID..." },
    { key: "baBatchId", label: "BA Batch ID", icon: "📦", type: "text", placeholder: "Enter Batch ID..." },
    { key: "remarks", label: "Remarks", icon: "📝", type: "text", placeholder: "Enter remarks..." },
  ];

  // Number range filters
  const numberFilters = [
    { key: "amount", label: "Amount", icon: "💰", type: "number", placeholder: "Min Amount" },
    { key: "recoAmount", label: "Reco Amount", icon: "💵", type: "number", placeholder: "Min Reco Amount" },
    { key: "tolerance", label: "Tolerance", icon: "🎯", type: "number", placeholder: "Tolerance value" },
  ];

  // Date filters
  const dateFilters = [
    { key: "transactionDate", label: "Transaction Date", icon: "📅", type: "date" },
    { key: "uploadDate", label: "Upload Date", icon: "⬆️", type: "date" },
    { key: "recoDate", label: "Reco Date", icon: "📊", type: "date" },
  ];

  const columns = [
    { key: "baIdentifier", label: "BA Identifier", icon: "🏢" },
    { key: "transactionId", label: "Transaction ID", icon: "🔢" },
    { key: "customerId", label: "Customer ID", icon: "👤" },
    { key: "transactionDate", label: "Transaction Date", icon: "📅" },
    { key: "amount", label: "Amount", icon: "💰" },
    { key: "status", label: "Status", icon: "⚡" },
    { key: "currency", label: "Currency", icon: "💱" },
    { key: "paymentMethod", label: "Payment Method", icon: "💳" },
    { key: "baRecoStatus", label: "BA Reco Status", icon: "✅" },
    { key: "baBatchId", label: "BA Batch ID", icon: "📦" },
    { key: "uploadDate", label: "Upload Date", icon: "⬆️" },
    { key: "recoDate", label: "Reco Date", icon: "📊" },
    { key: "recoAmount", label: "Reco Amount", icon: "💵" },
    { key: "tolerance", label: "Tolerance", icon: "🎯" },
    { key: "remarks", label: "Remarks", icon: "📝" }
  ];

  const [expandedSections, setExpandedSections] = useState({
    columns: true,
    selectFilters: true,
    textFilters: true,
    numberFilters: true,
    dateFilters: true
  });
  
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({});
  const [textFilterValues, setTextFilterValues] = useState({});
  const [numberFilterValues, setNumberFilterValues] = useState({});
  const [dateFilterValues, setDateFilterValues] = useState({});

  useEffect(() => {
    setSelectedFilterOptions(filters || {});
    setTextFilterValues(filters || {});
    setNumberFilterValues(filters || {});
    setDateFilterValues(filters || {});
  }, [filters]);

  const handleColumnSelect = (columnKey) => {
    const updated = selectedColumns.includes(columnKey)
      ? selectedColumns.filter(c => c !== columnKey)
      : [...selectedColumns, columnKey];
    onColumnToggle(updated);
  };

  const handleFilterOptionSelect = (filterKey, value) => {
    const newSelection = { ...selectedFilterOptions };
    
    if (newSelection[filterKey] === value) {
      delete newSelection[filterKey];
    } else {
      newSelection[filterKey] = value;
    }
    
    setSelectedFilterOptions(newSelection);
    
    const allFilters = {
      ...newSelection,
      ...textFilterValues,
      ...numberFilterValues,
      ...dateFilterValues
    };
    
    if (onFilterChange) {
      onFilterChange(allFilters);
    }
  };

  const handleTextFilterChange = (key, value) => {
    const newValues = { ...textFilterValues, [key]: value };
    if (!value || value === "") {
      delete newValues[key];
    }
    setTextFilterValues(newValues);
    
    const allFilters = {
      ...selectedFilterOptions,
      ...newValues,
      ...numberFilterValues,
      ...dateFilterValues
    };
    
    if (onFilterChange) {
      onFilterChange(allFilters);
    }
  };

  const handleNumberFilterChange = (key, value) => {
    const newValues = { ...numberFilterValues, [key]: value };
    if (!value || value === "") {
      delete newValues[key];
    }
    setNumberFilterValues(newValues);
    
    const allFilters = {
      ...selectedFilterOptions,
      ...textFilterValues,
      ...newValues,
      ...dateFilterValues
    };
    
    if (onFilterChange) {
      onFilterChange(allFilters);
    }
  };

  const handleDateFilterChange = (key, value) => {
    const newValues = { ...dateFilterValues, [key]: value };
    if (!value || value === "") {
      delete newValues[key];
    }
    setDateFilterValues(newValues);
    
    const allFilters = {
      ...selectedFilterOptions,
      ...textFilterValues,
      ...numberFilterValues,
      ...newValues
    };
    
    if (onFilterChange) {
      onFilterChange(allFilters);
    }
  };

  const clearFilters = () => {
    setSelectedFilterOptions({});
    setTextFilterValues({});
    setNumberFilterValues({});
    setDateFilterValues({});
    if (onFilterChange) {
      onFilterChange({});
    }
    if (onClear) onClear();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.keys(selectedFilterOptions).length + 
           Object.keys(textFilterValues).length + 
           Object.keys(numberFilterValues).length + 
           Object.keys(dateFilterValues).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-container">
        {/* Header */}
        <div className="sidebar-header">
          <div className="header-icon">🎛️</div>
          <div className="header-content">
            <h6>Controls Panel</h6>
            <span className="sidebar-subtitle">Select columns & filters</span>
          </div>
        </div>

        {/* Columns Section */}
        <div className="sidebar-section">
          <div className="section-header" onClick={() => toggleSection('columns')}>
            <div className="section-title">
              <span className="section-icon-left">📊</span>
              <span>Columns</span>
              <span className="selected-count">
                {selectedColumns.length}/{columns.length}
              </span>
            </div>
            <span className={`section-arrow ${expandedSections.columns ? 'rotated' : ''}`}>
              ▼
            </span>
          </div>
          
          {expandedSections.columns && (
            <div className="columns-list">
              {columns.map(column => (
                <div
                  key={column.key}
                  className={`column-item ${selectedColumns.includes(column.key) ? 'selected' : ''}`}
                  onClick={() => handleColumnSelect(column.key)}
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => {}}
                    className="column-checkbox"
                  />
                  <span className="column-label">
                    <span className="column-icon">{column.icon}</span>
                    {column.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Select Filter Options */}
        <div className="sidebar-section">
          <div className="section-header" onClick={() => toggleSection('selectFilters')}>
            <div className="section-title">
              <span className="section-icon-left">🔽</span>
              <span>Select Filters</span>
            </div>
            <span className={`section-arrow ${expandedSections.selectFilters ? 'rotated' : ''}`}>
              ▼
            </span>
          </div>
          
          {expandedSections.selectFilters && (
            <div className="filters-container">
              {filterOptions.map(filter => (
                <div key={filter.key} className="filter-group">
                  <div className="filter-group-label">
                    <span className="filter-icon">{filter.icon}</span>
                    {filter.label}
                  </div>
                  <div className="filter-options">
                    {filter.options.map(option => (
                      <button
                        key={option}
                        className={`filter-option-btn ${selectedFilterOptions[filter.key] === option ? 'active' : ''}`}
                        onClick={() => handleFilterOptionSelect(filter.key, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text Filter Options */}
        <div className="sidebar-section">
          <div className="section-header" onClick={() => toggleSection('textFilters')}>
            <div className="section-title">
              <span className="section-icon-left">📝</span>
              <span>Text Filters</span>
            </div>
            <span className={`section-arrow ${expandedSections.textFilters ? 'rotated' : ''}`}>
              ▼
            </span>
          </div>
          
          {expandedSections.textFilters && (
            <div className="text-filters-container">
              {textFilters.map(filter => (
                <div key={filter.key} className="filter-field">
                  <label className="filter-label">
                    <span className="filter-icon">{filter.icon}</span>
                    {filter.label}
                  </label>
                  <input
                    type="text"
                    value={textFilterValues[filter.key] || ''}
                    onChange={(e) => handleTextFilterChange(filter.key, e.target.value)}
                    className="filter-input"
                    placeholder={filter.placeholder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Number Filter Options */}
        <div className="sidebar-section">
          <div className="section-header" onClick={() => toggleSection('numberFilters')}>
            <div className="section-title">
              <span className="section-icon-left">🔢</span>
              <span>Number Filters (Min Value)</span>
            </div>
            <span className={`section-arrow ${expandedSections.numberFilters ? 'rotated' : ''}`}>
              ▼
            </span>
          </div>
          
          {expandedSections.numberFilters && (
            <div className="text-filters-container">
              {numberFilters.map(filter => (
                <div key={filter.key} className="filter-field">
                  <label className="filter-label">
                    <span className="filter-icon">{filter.icon}</span>
                    {filter.label}
                  </label>
                  <input
                    type="number"
                    value={numberFilterValues[filter.key] || ''}
                    onChange={(e) => handleNumberFilterChange(filter.key, e.target.value)}
                    className="filter-input"
                    placeholder={filter.placeholder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Filter Options */}
        <div className="sidebar-section">
          <div className="section-header" onClick={() => toggleSection('dateFilters')}>
            <div className="section-title">
              <span className="section-icon-left">📅</span>
              <span>Date Filters</span>
            </div>
            <span className={`section-arrow ${expandedSections.dateFilters ? 'rotated' : ''}`}>
              ▼
            </span>
          </div>
          
          {expandedSections.dateFilters && (
            <div className="text-filters-container">
              {dateFilters.map(filter => (
                <div key={filter.key} className="filter-field">
                  <label className="filter-label">
                    <span className="filter-icon">{filter.icon}</span>
                    {filter.label}
                  </label>
                  <input
                    type="date"
                    value={dateFilterValues[filter.key] || ''}
                    onChange={(e) => handleDateFilterChange(filter.key, e.target.value)}
                    className="filter-input"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply & Clear Buttons at bottom of sidebar */}
        <div className="sidebar-actions">
          <button 
            className="btn-apply-sidebar"
            onClick={onApply}
            disabled={activeFiltersCount === 0}
          >
            <span className="btn-icon">✓</span>
            Apply Filters
          </button>
          
          <button 
            className="btn-clear-sidebar"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
          >
            <span className="btn-icon">🗑️</span>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;