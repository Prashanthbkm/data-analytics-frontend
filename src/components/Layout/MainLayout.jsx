import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './MainLayout.css';

const MainLayout = ({
  children,
  viewType = 'dashboard',
  onViewTypeChange = () => {},
  onExport = () => {},
  onExportPdf = () => {},
  onExportExcel = () => {},
  onRefresh = () => {},
  dataCount = 0,
  totalRecords = 0,
  isLoading = false,
  columns = [],
  selectedColumns = [],
  onColumnToggle = () => {},
  filters = {},
  onFilterChange = () => {},
  onApply = () => {},
  onClear = () => {},
  error = null,
  onErrorClose = () => {},
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen && !event.target.closest('.layout-sidebar') && !event.target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="main-layout">
      {/* Mobile Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? '' : 'hidden'}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`layout-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar
          columns={columns}
          selectedColumns={selectedColumns}
          onColumnToggle={onColumnToggle}
          filters={filters}
          onFilterChange={onFilterChange}
          onApply={onApply}
          onClear={onClear}
          isLoading={isLoading}
          hasActiveFilters={Object.keys(filters).length > 0}
        />
      </div>

      {/* Main Content Area */}
      <div className="layout-main">
        {/* Top Bar */}
        <div className="layout-topbar">
          <TopBar
            viewType={viewType}
            onViewTypeChange={onViewTypeChange}
            onExport={onExport}
            onExportPdf={onExportPdf}
            onExportExcel={onExportExcel}
            onRefresh={onRefresh}
            dataCount={dataCount}
            totalRecords={totalRecords}
            isLoading={isLoading}
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
            </div>
            <button className="error-close" onClick={onErrorClose} aria-label="Close error">
              ✕
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="layout-content">
          <div className="content-container">
            {children}
          </div>
        </div>

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="layout-loading">
            <div className="loading-spinner-large"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;