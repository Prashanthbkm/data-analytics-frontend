import React, { useState, useEffect } from 'react';
import { Dashboard as DashboardIcon, TableChart as TableIcon, SmartToy as AiIcon } from '@mui/icons-material';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Stack
} from '@mui/material';
import { FilterList, ClearAll, CheckCircle } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import DashboardView from '../components/Dashboard/DashboardView';
import TableView from '../components/Dashboard/TableView';
import TableExplorerView from '../components/Dashboard/TableExplorerView';
import AIAssistant from '../components/AIAssistant/AIAssistant';

import {
  getTransactions,
  filterTransactions,
  getTransactionAggregates,
  fetchStatusChart,
  fetchDateChart,
  getTableData,
  getTableColumns
} from '../services/api';

import './DashboardPage.css';

const DashboardPage = () => {
  const [tableData, setTableData] = useState([]);
  const [statusChart, setStatusChart] = useState([]);
  const [dateChart, setDateChart] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalFilteredElements, setTotalFilteredElements] = useState(0);
  const [aggregates, setAggregates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('dashboard');
  const [selectedColumns, setSelectedColumns] = useState([
    "transactionId",
    "customerId",
    "amount"
  ]);
  const [filters, setFilters] = useState({});
  const [tempFilters, setTempFilters] = useState({});
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  // Table Explorer states
  const [selectedTable, setSelectedTable] = useState('');
  const [isTableMode, setIsTableMode] = useState(false);
  const [tableColumns, setTableColumns] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const fieldLabels = {
    baIdentifier: "BA Identifier",
    transactionId: "Transaction ID",
    customerId: "Customer ID",
    transactionDate: "Transaction Date",
    amount: "Amount",
    status: "Status",
    currency: "Currency",
    paymentMethod: "Payment Method",
    baRecoStatus: "BA Reco Status",
    baBatchId: "BA Batch ID",
    uploadDate: "Upload Date",
    recoDate: "Reco Date",
    recoAmount: "Reco Amount",
    tolerance: "Tolerance",
    remarks: "Remarks"
  };

  useEffect(() => {
    loadTotalCount();
  }, []);

  const loadTotalCount = async () => {
    try {
      const txRes = await getTransactions(0, 1);
      const total = txRes.totalElements || 0;
      setTotalRecords(total);
      console.log(`📊 Total records in database: ${total.toLocaleString()}`);
    } catch (err) {
      console.error('Error loading count:', err);
      setTotalRecords(6291000);
    }
  };

  // Handle table selection from TopBar - THIS LOADS THE TABLE DATA
  const handleTableSelect = async (tableName) => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      setSelectedTable(tableName);
      setIsTableMode(true);
      setHasAppliedFilters(false);
      setTempFilters({});
      setFilters({});
      
      console.log(`🟢 Loading table: ${tableName}`);
      
      // Fetch data from selected table
      const result = await getTableData(tableName, 0, rowsPerPage);
      setTableData(result.content || []);
      setTotalFilteredElements(result.totalElements || 0);
      
      console.log(`✅ Loaded ${result.content?.length || 0} records from table: ${tableName}`);
      console.log(`📊 Total records in table: ${result.totalElements || 0}`);
      
      // Get columns for this table
      const columns = await getTableColumns(tableName);
      if (columns && columns.length > 0) {
        setTableColumns(columns);
        setSelectedColumns(columns.slice(0, 6));
        console.log(`📋 Columns found: ${columns.length}`);
      }
      
      setError(null);
      
    } catch (err) {
      console.error("Error loading table:", err);
      setError(`Failed to load table: ${tableName}. Please check if you have permission.`);
      setIsTableMode(false);
      setSelectedTable('');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMainTable = () => {
    setIsTableMode(false);
    setSelectedTable('');
    setTableColumns([]);
    setSelectedColumns(["transactionId", "customerId", "amount"]);
    setTempFilters({});
    setFilters({});
    setHasAppliedFilters(false);
    setCurrentPage(0);
    setError(null);
    setTableData([]);
    setTotalFilteredElements(0);
    loadTotalCount();
    // Reload main table data
    const loadMainData = async () => {
      try {
        setLoading(true);
        const result = await filterTransactions({}, selectedColumns, 0, rowsPerPage);
        setTableData(result.content || []);
        setTotalFilteredElements(result.totalElements || 0);
      } catch (err) {
        console.error("Error reloading main data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMainData();
  };

  const fetchFilteredData = async (page, size, filterValues) => {
    try {
      const result = await filterTransactions(filterValues, selectedColumns, page, size);
      setTableData(result.content || []);
      setTotalFilteredElements(result.totalElements || 0);
      return result;
    } catch (err) {
      console.error("Error fetching data:", err);
      throw err;
    }
  };

  const fetchAggregates = async (filterValues) => {
    try {
      const aggregatesResult = await getTransactionAggregates(filterValues);
      setAggregates(aggregatesResult);
      console.log("📊 Aggregates:", aggregatesResult);
      return aggregatesResult;
    } catch (err) {
      console.error("Error fetching aggregates:", err);
      setAggregates(null);
    }
  };

  const handleApply = async () => {
    if (isTableMode) {
      setError("Filters are not available in Table Explorer mode. Please switch back to main dashboard.");
      return;
    }
    
    const hasFilters = Object.keys(tempFilters).some(key => 
      tempFilters[key] !== "" && tempFilters[key] !== null && tempFilters[key] !== undefined
    );
    
    if (!hasFilters) {
      setError("Please select at least one filter before applying.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setFilters(tempFilters);
      setCurrentPage(0);

      const cleanedFilters = {};
      Object.keys(tempFilters).forEach(key => {
        if (tempFilters[key] !== "" && tempFilters[key] !== null && tempFilters[key] !== undefined) {
          cleanedFilters[key] = tempFilters[key];
        }
      });

      console.log("⏳ Applying filters...");
      
      await fetchAggregates(cleanedFilters);
      const result = await fetchFilteredData(0, rowsPerPage, cleanedFilters);
      
      const filteredData = result.content || [];
      const totalFiltered = result.totalElements || 0;
      
      console.log(`✅ Loaded ${filteredData.length} records out of ${totalFiltered.toLocaleString()} total matches`);

      if (filteredData.length === 0 && totalFiltered === 0) {
        setError(`No results found. Try different filter values.`);
        setTableData([]);
        setHasAppliedFilters(true);
      } else {
        setTableData(filteredData);
        setHasAppliedFilters(true);
        setError(null);
      }

      const statusMap = new Map();
      const dateMap = new Map();
      
      filteredData.forEach(item => {
        const status = item.status || 'Unknown';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
        
        if (item.transactionDate) {
          const date = new Date(item.transactionDate).toLocaleDateString();
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      });
      
      setStatusChart(Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })));
      setDateChart(Array.from(dateMap.entries()).map(([date, count]) => ({ transactionDate: date, count })).slice(0, 15));

    } catch (err) {
      console.error("Apply error:", err);
      setError("Filter failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (isTableMode) {
      const loadTablePage = async () => {
        try {
          setLoading(true);
          const result = await getTableData(selectedTable, newPage, rowsPerPage);
          setTableData(result.content || []);
          setTotalFilteredElements(result.totalElements || 0);
        } catch (err) {
          console.error("Error loading table page:", err);
        } finally {
          setLoading(false);
        }
      };
      loadTablePage();
    } else {
      const cleanedFilters = {};
      Object.keys(tempFilters).forEach(key => {
        if (tempFilters[key] !== "" && tempFilters[key] !== null && tempFilters[key] !== undefined) {
          cleanedFilters[key] = tempFilters[key];
        }
      });
      fetchFilteredData(newPage, rowsPerPage, cleanedFilters);
    }
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(0);
    if (isTableMode) {
      const loadTablePage = async () => {
        try {
          setLoading(true);
          const result = await getTableData(selectedTable, 0, newSize);
          setTableData(result.content || []);
          setTotalFilteredElements(result.totalElements || 0);
        } catch (err) {
          console.error("Error loading table page:", err);
        } finally {
          setLoading(false);
        }
      };
      loadTablePage();
    } else {
      const cleanedFilters = {};
      Object.keys(tempFilters).forEach(key => {
        if (tempFilters[key] !== "" && tempFilters[key] !== null && tempFilters[key] !== undefined) {
          cleanedFilters[key] = tempFilters[key];
        }
      });
      fetchFilteredData(0, newSize, cleanedFilters);
    }
  };

  const handleClear = () => {
    setTempFilters({});
    setFilters({});
    setTableData([]);
    setTotalFilteredElements(0);
    setAggregates(null);
    setHasAppliedFilters(false);
    setCurrentPage(0);
    setError(null);
    setStatusChart([]);
    setDateChart([]);
    if (!isTableMode) {
      loadTotalCount();
    }
  };

  const handleFilterChange = (newFilters) => {
    setTempFilters(newFilters);
  };

  const handleColumnToggle = (cols) => {
    setSelectedColumns(cols);
  };

  const handleRemoveFilter = (key) => {
    const newFilters = { ...tempFilters };
    delete newFilters[key];
    setTempFilters(newFilters);
  };

  const handleExportExcel = () => {
    if (tableData.length === 0) {
      setError("No data available to export. Please apply filters first.");
      return;
    }

    try {
      const exportData = tableData.map(row => {
        const exportRow = {};
        selectedColumns.forEach(col => {
          let value = row[col];
          if (col.includes('Date') && value) {
            value = new Date(value).toLocaleDateString();
          }
          if (col === 'amount' || col === 'recoAmount') {
            value = `₹${value?.toLocaleString() || 0}`;
          }
          exportRow[col] = value || '-';
        });
        return exportRow;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
      
      const fileName = `transactions_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export Excel file");
    }
  };

  const handleExportPdf = () => {
    if (tableData.length === 0) {
      setError("No data available to export. Please apply filters first.");
      return;
    }

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(67, 97, 238);
      doc.text('Transactions Report', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
      
      let startY = 50;
      if (Object.keys(filters).length > 0) {
        doc.setFontSize(9);
        let filterText = 'Filters: ';
        const filterEntries = Object.entries(filters);
        filterText += filterEntries.map(([key, value]) => `${key}=${value}`).join(', ');
        
        const splitText = doc.splitTextToSize(filterText, 180);
        doc.text(splitText, 14, 40);
        startY = 55;
      }
      
      const rows = tableData.map(row => {
        return selectedColumns.map(col => {
          let value = row[col];
          if (col.includes('Date') && value) {
            value = new Date(value).toLocaleDateString();
          }
          if (col === 'amount' || col === 'recoAmount') {
            value = `₹${value?.toLocaleString() || 0}`;
          }
          return value || '-';
        });
      });
      
      doc.autoTable({
        head: [selectedColumns],
        body: rows,
        startY: startY,
        theme: 'striped',
        styles: { 
          fontSize: 8, 
          cellPadding: 3,
          font: 'helvetica'
        },
        headStyles: { 
          fillColor: [67, 97, 238], 
          textColor: 255, 
          fontSize: 9,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 249, 250] }
      });
      
      const fileName = `transactions_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
      doc.save(fileName);
      
    } catch (err) {
      console.error("PDF export error:", err);
      setError("Failed to export PDF file");
    }
  };

  const renderSelectedFilters = () => {
    if (isTableMode) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Filters are disabled in Table Explorer mode.
          </Typography>
        </Box>
      );
    }
    
    const activeFilters = Object.keys(tempFilters).filter(key => 
      tempFilters[key] !== "" && tempFilters[key] !== null && tempFilters[key] !== undefined
    );
    
    if (activeFilters.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FilterList sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Filters Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select filters from the sidebar and they will appear here
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {activeFilters.map(key => (
            <Chip
              key={key}
              label={`${fieldLabels[key] || key}: ${tempFilters[key]}`}
              onDelete={() => handleRemoveFilter(key)}
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<CheckCircle />}
            onClick={handleApply}
            disabled={loading}
            sx={{ bgcolor: '#28a745', '&:hover': { bgcolor: '#218838' } }}
          >
            Apply Filters
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ClearAll />}
            onClick={handleClear}
            disabled={loading}
          >
            Clear All
          </Button>
        </Box>
      </Box>
    );
  };

  const renderLoadingState = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading-text">
        ⏳ Loading data...
        <div className="loading-subtext">Please wait</div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="error-alert">
      <span className="error-icon">⚠️</span>
      <span>{error}</span>
      <button className="error-retry-btn" onClick={handleClear}>Clear Filters</button>
    </div>
  );

  const renderFilterCard = () => (
    <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterList />
        {isTableMode ? 'Table Explorer' : 'Selected Filters'}
      </Typography>
      {renderSelectedFilters()}
    </Paper>
  );

  const renderEmptyState = () => (
    <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 3 }}>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {isTableMode ? '📊 Select a Table to View' : '📊 Ready to Explore Data'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {isTableMode 
          ? 'Choose a table from the dropdown above to view its data'
          : `Database has <strong>${totalRecords.toLocaleString()}</strong> total records`
        }
      </Typography>
      {!isTableMode && (
        <Typography variant="body2" color="text.secondary">
          Select filters from the sidebar, then click "Apply Filters" to see results
        </Typography>
      )}
    </Paper>
  );

  const renderContent = () => {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();
    
    if ((!hasAppliedFilters && !isTableMode) || (isTableMode && tableData.length === 0)) {
      return (
        <>
          {renderFilterCard()}
          {renderEmptyState()}
        </>
      );
    }
    
    if (tableData.length === 0) {
      return (
        <>
          {renderFilterCard()}
          <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 3 }}>
            <Typography variant="h6" color="warning.main">
              No Results Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No data matches your criteria. Try different values.
            </Typography>
            <Button variant="outlined" onClick={handleClear} sx={{ mt: 2 }}>
              Clear
            </Button>
          </Paper>
        </>
      );
    }

    // 🔥 TABLE EXPLORER MODE - Show TableExplorerView for both dashboard and table views
    if (isTableMode) {
      return (
        <>
          {renderFilterCard()}
          <TableExplorerView
            data={tableData}
            columns={tableColumns}
            tableName={selectedTable}
            totalRecords={totalFilteredElements}
            isLoading={loading}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      );
    }

    if (viewType === 'dashboard') {
      return (
        <>
          {renderFilterCard()}
          <DashboardView 
            data={tableData}
            selectedColumns={selectedColumns}
            isLoading={loading}
            error={error}
            onRefresh={handleClear}
            totalElements={totalFilteredElements}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            aggregates={aggregates}
          />
        </>
      );
    }

    if (viewType === 'table') {
      return (
        <>
          {renderFilterCard()}
          <TableView
            data={tableData}
            selectedColumns={selectedColumns}
            isLoading={loading}
            totalElements={totalFilteredElements}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onRefresh={handleClear}
          />
        </>
      );
    }

    return null;
  };

  const handleViewChange = (newView) => {
    if (newView !== viewType) {
      setViewType(newView);
    }
  };
  

  return (
    <div className="dashboard-container">
      <Sidebar
        selectedColumns={selectedColumns}
        onColumnToggle={handleColumnToggle}
        filters={tempFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApply}
        onClear={handleClear}
        hasActiveFilters={Object.keys(tempFilters).length > 0}
      />

      <div className="dashboard-main">
        <TopBar
          viewType={viewType}
          onViewTypeChange={setViewType}
          onRefresh={handleClear}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onTableSelect={handleTableSelect}
          dataCount={tableData.length}
          totalRecords={totalRecords}
          selectedTable={selectedTable}
          isLoading={loading}
        />

        <div className="dashboard-content">
          <div className="view-toggle-section">
            <div className="view-toggle-card">
              <div className="view-toggle-group">
                <button
                  className={`view-toggle-btn ${viewType === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleViewChange('dashboard')}
                >
                  <DashboardIcon />
                  <span>Dashboard View</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewType === 'table' ? 'active' : ''}`}
                  onClick={() => handleViewChange('table')}
                >
                  <TableIcon />
                  <span>Table View</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Mode Indicator */}
          {isTableMode && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                📊 Currently viewing table: <strong>{selectedTable}</strong> | Total Records: {totalFilteredElements.toLocaleString()}
              </Typography>
              <Button size="small" variant="outlined" onClick={handleBackToMainTable}>
                Back to Main Dashboard
              </Button>
            </Paper>
          )}

          {hasAppliedFilters && tableData.length > 0 && !isTableMode && (
            <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Show records:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select value={rowsPerPage} onChange={(e) => handleRowsPerPageChange(e.target.value)}>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={500}>500</MenuItem>
                  <MenuItem value={1000}>1000</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="textSecondary">
                Showing {tableData.length} of {totalFilteredElements.toLocaleString()} records
              </Typography>
            </Paper>
          )}

          <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
            <Button
              variant="contained"
              onClick={() => setShowAI(true)}
              sx={{
                borderRadius: 50,
                minWidth: 'auto',
                width: 56,
                height: 56,
                bgcolor: '#4361ee',
                boxShadow: 3,
                '&:hover': {
                  bgcolor: '#3a56d4',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <AiIcon sx={{ fontSize: 28 }} />
            </Button>
          </Box>

          {renderContent()}
        </div>
      </div>

      <AIAssistant
        kpiData={aggregates}
        filters={filters}
        isOpen={showAI}
        onClose={() => setShowAI(false)}
      />
    </div>
  );
};

export default DashboardPage;