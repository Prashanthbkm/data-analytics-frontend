import React, { useState, useEffect } from 'react';
import './FilterActionBar.css';

const FilterActionBar = ({ 
  onApply, 
  onClear, 
  hasActiveFilters = false,
  activeFiltersCount = 0,
  isLoading = false,
  totalFilters = 0
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [countAnimation, setCountAnimation] = useState(false);

  // Trigger animation when active filters count changes
  useEffect(() => {
    if (activeFiltersCount > 0) {
      setCountAnimation(true);
      const timer = setTimeout(() => setCountAnimation(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeFiltersCount]);

  const handleApply = async () => {
    if (isApplying || isLoading) return;
    
    setIsApplying(true);
    if (onApply) {
      await onApply();
    }
    setTimeout(() => setIsApplying(false), 500);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="filter-action-bar">
      {/* Header Section */}
      <div className="action-header">
        <div className="action-icon">🎯</div>
        <h3 className="action-title">Quick Actions</h3>
        <span className="action-subtitle">Manage your filters</span>
      </div>

      {/* Stats Section */}
      <div className="action-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{totalFilters}</div>
            <div className="stat-label">Total Filters</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div 
              className={`stat-value ${countAnimation ? 'filter-count-change' : ''}`}
              style={{ color: activeFiltersCount > 0 ? '#ef476f' : '#6c757d' }}
            >
              {activeFiltersCount}
            </div>
            <div className="stat-label">Active Filters</div>
          </div>
        </div>
        
        {/* Active Filters Badge */}
        {activeFiltersCount > 0 && (
          <div className="active-filters-badge">
            <div className="badge-dot"></div>
            <span className="badge-text">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="action-buttons">
        <button 
          className={`btn-primary ${isApplying ? 'loading' : ''}`}
          onClick={handleApply}
          disabled={isApplying || isLoading}
        >
          <span className="btn-icon">✓</span>
          <span className="btn-text">
            {isApplying ? 'Applying...' : 'Apply Filters'}
          </span>
        </button>
        
        <button 
          className="btn-secondary"
          onClick={handleClear}
          disabled={!hasActiveFilters && activeFiltersCount === 0}
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-text">Clear All Filters</span>
        </button>
      </div>

      {/* Footer Section */}
      <div className="action-footer">
        <div className="footer-text">
          <span className="footer-icon">⚡</span>
          <span>Click Apply to see results instantly</span>
        </div>
        <div className="footer-note">
          Filters are applied in real-time
        </div>
      </div>
    </div>
  );
};

export default FilterActionBar;