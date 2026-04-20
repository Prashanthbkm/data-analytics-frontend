import React, { useState, useEffect, useMemo } from 'react';
import './TableView.css';

const TableView = ({
  data = [],
  selectedColumns = [],
  isLoading = false,
  totalElements = 0,
  page = 0,
  rowsPerPage = 500,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  onRefresh
}) => {
  // Column definitions
  const columns = [
    { field: "baIdentifier", headerName: "BA Identifier", type: "text", sortable: true },
    { field: "transactionId", headerName: "Transaction ID", type: "text", sortable: true },
    { field: "customerId", headerName: "Customer ID", type: "text", sortable: true },
    { field: "transactionDate", headerName: "Transaction Date", type: "date", sortable: true },
    { field: "amount", headerName: "Amount", type: "currency", sortable: true },
    { field: "status", headerName: "Status", type: "status", sortable: true },
    { field: "currency", headerName: "Currency", type: "text", sortable: true },
    { field: "paymentMethod", headerName: "Payment Method", type: "text", sortable: true },
    { field: "transactionType", headerName: "Transaction Type", type: "text", sortable: true },
    { field: "baRecoStatus", headerName: "BA Reco Status", type: "text", sortable: true },
    { field: "baBatchId", headerName: "BA Batch ID", type: "text", sortable: true },
    { field: "uploadDate", headerName: "Upload Date", type: "date", sortable: true },
    { field: "recoDate", headerName: "Reco Date", type: "date", sortable: true },
    { field: "recoAmount", headerName: "Reco Amount", type: "currency", sortable: true },
    { field: "tolerance", headerName: "Tolerance", type: "percentage", sortable: true },
    { field: "remarks", headerName: "Remarks", type: "text", sortable: false }
  ];

  // State management
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRow, setSelectedRow] = useState(null);

  // Get rows
  const rows = Array.isArray(data) ? data : [];
  
  // Sort data
  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    
    const sorted = [...rows];
    const column = columns.find(col => col.field === sortField);
    
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (column?.type === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (column?.type === 'currency') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [rows, sortField, sortDirection]);

  // Visible columns based on selection
  const visibleColumns = columns.filter(col => selectedColumns.includes(col.field));

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    if (onPageChange) onPageChange(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const size = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) onRowsPerPageChange(size);
  };

  // Format cell value based on type
  const formatValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    
    switch (column.type) {
      case 'currency':
        return `₹${Number(value).toLocaleString('en-IN')}`;
      case 'date':
        return new Date(value).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      case 'percentage':
        return `${value}%`;
      case 'status':
        return renderStatusBadge(value);
      default:
        return String(value);
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusClass = 
      status === 'SUCCESS' || status === 'COMPLETED' ? 'status-success' :
      status === 'PENDING' || status === 'PROCESSING' ? 'status-pending' :
      status === 'FAILED' || status === 'REJECTED' ? 'status-failed' :
      'status-default';
    
    return (
      <span className={`status-badge ${statusClass}`}>
        {status || 'UNKNOWN'}
      </span>
    );
  };

  // Render amount with color based on value
  const renderAmount = (amount) => {
    const numAmount = Number(amount) || 0;
    const amountClass = 
      numAmount > 0 ? 'amount-positive' :
      numAmount < 0 ? 'amount-negative' :
      'amount-neutral';
    
    return <span className={amountClass}>₹{numAmount.toLocaleString('en-IN')}</span>;
  };

  // Handle row click
  const handleRowClick = (row, index) => {
    setSelectedRow(index);
    if (onRowClick) onRowClick(row);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalElements / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, totalElements);
  
  // Pagination component
  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="table-pagination">
        <div className="pagination-info">
          <div className="rows-per-page">
            <span>Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={handleChangeRowsPerPage}
              className="rows-select"
            >
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
            </select>
          </div>
          <span className="pagination-range">
            {startIndex.toLocaleString()} - {endIndex.toLocaleString()} of {totalElements.toLocaleString()}
          </span>
          <span className="pagination-pages">
            Page {page + 1} of {totalPages.toLocaleString()}
          </span>
        </div>
        
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handleChangePage(0)}
            disabled={page === 0}
          >
            «
          </button>
          <button
            className="pagination-btn"
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 0}
          >
            ‹
          </button>
          
          <div className="page-numbers">
            {pageNumbers.map(pageNum => (
              <button
                key={pageNum}
                className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
                onClick={() => handleChangePage(pageNum)}
              >
                {pageNum + 1}
              </button>
            ))}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => handleChangePage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            ›
          </button>
          <button
            className="pagination-btn"
            onClick={() => handleChangePage(totalPages - 1)}
            disabled={page >= totalPages - 1}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  // Empty state
  if (rows.length === 0 && !isLoading && totalElements === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-title">No Data Available</div>
        <div className="empty-description">
          No transactions found matching your criteria. Try adjusting your filters or refresh the data.
        </div>
        {onRefresh && (
          <button className="empty-action" onClick={onRefresh}>
            Refresh Data
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="table-view-container">
      {/* Info Bar */}
      <div className="table-info-bar">
        <div className="info-stats">
          <span className="info-label">📊 Total Records:</span>
          <span className="info-value">{totalElements.toLocaleString()}</span>
          <span className="info-separator">|</span>
          <span className="info-label">Showing:</span>
          <span className="info-value">{startIndex.toLocaleString()} - {endIndex.toLocaleString()}</span>
          <span className="info-separator">|</span>
          <span className="info-label">Pages:</span>
          <span className="info-value">{page + 1} of {totalPages.toLocaleString()}</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.field}>
                  <div 
                    className="th-content"
                    onClick={() => column.sortable && handleSort(column.field)}
                  >
                    {column.headerName}
                    {column.sortable && (
                      <span className={`sort-icon ${sortField === column.field ? 'active' : ''}`}>
                        {sortField === column.field && sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr 
                key={row.transactionId || row.baIdentifier || index}
                onClick={() => handleRowClick(row, index)}
                className={selectedRow === index ? 'selected' : ''}
              >
                {visibleColumns.map((column) => {
                  let value = row[column.field];
                  
                  if (column.field === 'amount' || column.field === 'recoAmount') {
                    return (
                      <td key={column.field}>
                        {renderAmount(value)}
                      </td>
                    );
                  }
                  
                  if (column.field === 'status') {
                    return (
                      <td key={column.field}>
                        {renderStatusBadge(value)}
                      </td>
                    );
                  }
                  
                  return (
                    <td key={column.field}>
                      {formatValue(value, column)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalElements > 0 && renderPagination()}
    </div>
  );
};

export default TableView;