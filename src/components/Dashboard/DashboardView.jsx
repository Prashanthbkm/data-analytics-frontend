import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CheckCircle,
  Cancel,
  Pending,
  People,
  Receipt,
  ShowChart,
  BarChart,
  AccessTime,
  DateRange,
  AccountBalance as NetIcon,
  Info as InfoIcon,
  NavigateBefore,
  NavigateNext,
  FirstPage,
  LastPage,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import KpiCards from './KpiCards';
import ChartsContainer from './ChartsContainer';

const DashboardView = ({ 
  data = [], 
  selectedColumns = [],
  isLoading = false,
  error = null,
  onRefresh,
  totalElements = 0,
  page = 0,
  rowsPerPage = 500,
  onPageChange,
  onRowsPerPageChange,
  aggregates = null  // ← NEW: Aggregate data from backend
}) => {

  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Prepare chart data based on selected columns
  const chartData = useMemo(() => {
    if (!selectedColumns || selectedColumns.length === 0) {
      return safeData;
    }
    
    if (selectedColumns.includes('amount')) {
      return safeData;
    }
    
    return safeData.map(row => ({
      status: row.status,
      transactionDate: row.transactionDate,
      amount: row.amount || 0
    }));
  }, [safeData, selectedColumns]);

  // Format currency helper
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0';
    return `₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  // Format number helper
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  // Aggregate KPI Cards (from ALL filtered records)
  const aggregateKpiCards = aggregates ? [
    {
      title: "Total Transactions",
      value: formatNumber(aggregates.totalTransactions),
      icon: <Receipt sx={{ fontSize: 28 }} />,
      color: "#4361ee",
      bgColor: "#e8eeff",
      subtitle: "From all matching records"
    },
    {
      title: "Success Count",
      value: formatNumber(aggregates.successCount),
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: "#2e7d32",
      bgColor: "#e8f5e9",
      subtitle: `${aggregates.successRate?.toFixed(1) || ((aggregates.successCount / aggregates.totalTransactions) * 100).toFixed(1)}% of total`
    },
    {
      title: "Failed Count",
      value: formatNumber(aggregates.failedCount),
      icon: <Cancel sx={{ fontSize: 28 }} />,
      color: "#d32f2f",
      bgColor: "#ffebee",
      subtitle: `${aggregates.failedCount} transactions`
    },
    {
      title: "Pending Count",
      value: formatNumber(aggregates.pendingCount),
      icon: <Pending sx={{ fontSize: 28 }} />,
      color: "#ed6c02",
      bgColor: "#fff3e0",
      subtitle: `${aggregates.pendingCount} transactions`
    },
    {
      title: "Total Debit",
      value: formatCurrency(aggregates.totalDebit),
      icon: <TrendingDown sx={{ fontSize: 28 }} />,
      color: "#dc3545",
      bgColor: "#ffebee",
      subtitle: "Outgoing amount"
    },
    {
      title: "Total Credit",
      value: formatCurrency(aggregates.totalCredit),
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      color: "#28a745",
      bgColor: "#e8f5e9",
      subtitle: "Incoming amount"
    },
    {
      title: "Net Amount",
      value: formatCurrency(aggregates.netAmount),
      icon: <NetIcon sx={{ fontSize: 28 }} />,
      color: aggregates.netAmount >= 0 ? "#28a745" : "#dc3545",
      bgColor: aggregates.netAmount >= 0 ? "#e8f5e9" : "#ffebee",
      subtitle: "Credit - Debit"
    },
    {
      title: "Avg Transaction",
      value: formatCurrency(aggregates.avgAmount),
      icon: <ShowChart sx={{ fontSize: 28 }} />,
      color: "#ff6d00",
      bgColor: "#fff3e0",
      subtitle: "Average amount"
    },
    {
      title: "Total Amount",
      value: formatCurrency(aggregates.totalAmount),
      icon: <AttachMoney sx={{ fontSize: 28 }} />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      subtitle: "Sum of all amounts"
    }
  ] : [];

  // Calculate pagination values
  const totalPages = Math.ceil(totalElements / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, totalElements);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    if (onPageChange) onPageChange(newPage - 1);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    if (onRowsPerPageChange) onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  // If loading, show loader
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 2 }}
        action={
          onRefresh && (
            <button onClick={onRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Retry
            </button>
          )
        }
      >
        {error}
      </Alert>
    );
  }

  // If no data, show empty state
  if (safeData.length === 0 && totalElements === 0) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#fff3e0', m: 2 }}>
        <Typography variant="h6" color="warning.main" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No transactions match your current filters or selected columns.
          <br />
          Try adjusting your filter criteria or select different columns.
        </Typography>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Refresh Data
          </button>
        )}
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      
      {/* Pagination Info Bar */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: 2,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt sx={{ fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Total Records:</strong> {totalElements.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChart sx={{ fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Showing:</strong> {startIndex.toLocaleString()} - {endIndex.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChart sx={{ fontSize: 20 }} />
              <Typography variant="body2">
                <strong>Pages:</strong> {page + 1} of {totalPages.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Show:</Typography>
              <FormControl size="small" sx={{ minWidth: 80, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1 }}>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' } }}
                >
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={500}>500</MenuItem>
                  <MenuItem value={1000}>1,000</MenuItem>
                  <MenuItem value={5000}>5,000</MenuItem>
                  <MenuItem value={10000}>10,000</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="First Page">
                <IconButton 
                  onClick={() => onPageChange && onPageChange(0)} 
                  disabled={page === 0}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <FirstPage />
                </IconButton>
              </Tooltip>
              <Tooltip title="Previous Page">
                <IconButton 
                  onClick={() => onPageChange && onPageChange(page - 1)} 
                  disabled={page === 0}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <NavigateBefore />
                </IconButton>
              </Tooltip>
              
              <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'center' }}>
                Page {page + 1} of {totalPages}
              </Typography>
              
              <Tooltip title="Next Page">
                <IconButton 
                  onClick={() => onPageChange && onPageChange(page + 1)} 
                  disabled={page >= totalPages - 1}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <NavigateNext />
                </IconButton>
              </Tooltip>
              <Tooltip title="Last Page">
                <IconButton 
                  onClick={() => onPageChange && onPageChange(totalPages - 1)} 
                  disabled={page >= totalPages - 1}
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <LastPage />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Selected Columns Info Banner */}
      {selectedColumns && selectedColumns.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" color="primary">
            📊 Displaying data for selected columns:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedColumns.map(col => (
              <Chip key={col} label={col} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            (Total: {selectedColumns.length} columns)
          </Typography>
        </Paper>
      )}
      
      {/* Existing KPI Cards - Shows current page data */}
      <KpiCards 
        data={safeData} 
        isLoading={isLoading}
      />
      
      {/* Charts Container */}
      <Box sx={{ mt: 4 }}>
        <ChartsContainer 
          statusData={chartData}
          dateData={chartData}
          selectedColumns={selectedColumns}
        />
      </Box>
      
      {/* Dashboard Summary Section - NEW AGGREGATE SECTION */}
      {aggregates && aggregates.totalTransactions > 0 && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AnalyticsIcon sx={{ color: '#4361ee' }} />
            📊 Dashboard Summary - Aggregate Totals (All Filtered Records)
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Aggregate KPI Cards Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {aggregateKpiCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={index}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    p: 1.5, 
                    bgcolor: 'white',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      cursor: 'pointer'
                    },
                    borderTop: `3px solid ${card.color}`,
                    position: 'relative'
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      color: card.color, 
                      bgcolor: card.bgColor, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 1,
                      borderRadius: 2,
                      mb: 1
                    }}>
                      {card.icon}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {card.title}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: card.color, mt: 0.5 }}>
                      {card.value}
                    </Typography>
                    {card.subtitle && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {card.subtitle}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Summary Info Row */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <DateRange fontSize="small" />
                  Date Range
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 1 }}>
                  {safeData.length > 0 ? (
                    <>
                      {new Date(Math.min(...safeData.map(d => new Date(d.transactionDate)))).toLocaleDateString()}
                      {' - '}
                      {new Date(Math.max(...safeData.map(d => new Date(d.transactionDate)))).toLocaleDateString()}
                    </>
                  ) : '-'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" />
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 1 }}>
                  {new Date().toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <People fontSize="small" />
                  Selected Columns
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 1 }}>
                  {selectedColumns.length} columns selected
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}
      
    </Box>
  );
};

export default DashboardView;