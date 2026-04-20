import React, { useState } from 'react';
import TableSelector from '../TableSelector';
import './TopBar.css';

const TopBar = ({
  viewType = 'dashboard',
  onViewTypeChange = () => {},
  onExport = () => {},
  onExportPdf = () => {},
  onExportExcel = () => {},
  onRefresh = () => {},
  onTableSelect = () => {},
  dataCount = 0,
  totalRecords = 0,
  selectedTable = '',
  isLoading = false
}) => {
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isLoading || isRefreshing) return;
    
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportClick = () => {
    setShowExportMenu(!showExportMenu);
  };

  const handleExportClose = () => {
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    } else if (onExport) {
      onExport('excel');
    }
    handleExportClose();
  };

  const handleExportPdf = () => {
    if (onExportPdf) {
      onExportPdf();
    } else if (onExport) {
      onExport('pdf');
    }
    handleExportClose();
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu') && !event.target.closest('.export-btn')) {
        setShowExportMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  return (
    <div className="topbar-container">
      <div className="topbar-toolbar">
        {/* Left Section - Brand Area */}
        <div className="topbar-left">
          <div className="brand-icon">
            📊
          </div>
          <div>
            <div className="brand-title">
              Data Analytics Platform
            </div>
            <div className="brand-subtitle">
              Real-time Transaction Analytics
            </div>
          </div>
        </div>

        {/* Center Section - Table Selector */}
        <div className="topbar-center">
          <TableSelector onTableSelect={onTableSelect} currentTable={selectedTable} />
        </div>

        {/* Right Section - Actions Area */}
        <div className="topbar-right">
          {/* Statistics Container */}
          <div className="stats-container">
            <div className="stat-card">
              <span className="stat-icon">🗄️</span>
              <div className="stat-content">
                <span className="stat-label">Total in DB</span>
                <span className="stat-value">
                  {totalRecords.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="topbar-divider"></div>

            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <div className="stat-content">
                <span className="stat-label">Filtered Results</span>
                <span className="stat-value highlight">
                  {dataCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {/* Refresh Button */}
            <div className="tooltip-wrapper">
              <button
                className={`icon-btn ${isRefreshing ? 'loading spinning' : ''}`}
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
              >
                {isRefreshing ? (
                  <div className="spinner-small"></div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              <div className="tooltip-content">Refresh Data</div>
            </div>

            {/* Export Button */}
            <div className="tooltip-wrapper">
              <button
                className="export-btn"
                onClick={handleExportClick}
                disabled={isLoading || dataCount === 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export Data</span>
              </button>
              <div className="tooltip-content">
                {dataCount === 0 ? "No data to export" : "Export data"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dropdown Menu */}
      {showExportMenu && dataCount > 0 && (
        <div className="export-menu">
          <div className="export-menu-header">
            <h4>Export Options</h4>
          </div>
          
          <div className="export-menu-item" onClick={handleExportExcel}>
            <div className="menu-item-left">
              <div className="menu-icon excel">
                📊
              </div>
              <div className="menu-text">
                <span className="menu-title">Excel Format</span>
                <span className="menu-subtitle">.xlsx - Spreadsheet format</span>
              </div>
            </div>
            <div className="menu-badge">
              {dataCount} records
            </div>
          </div>
          
          <div className="export-menu-item" onClick={handleExportPdf}>
            <div className="menu-item-left">
              <div className="menu-icon pdf">
                📄
              </div>
              <div className="menu-text">
                <span className="menu-title">PDF Format</span>
                <span className="menu-subtitle">.pdf - Print ready format</span>
              </div>
            </div>
            <div className="menu-badge">
              {dataCount} records
            </div>
          </div>
          
          <div className="export-menu-divider"></div>
          
          <div className="export-menu-item disabled">
            <div className="menu-item-left">
              <div className="menu-icon cloud">
                ☁️
              </div>
              <div className="menu-text">
                <span className="menu-title">Export Summary</span>
                <span className="menu-subtitle">
                  Total {dataCount} records will be exported
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;