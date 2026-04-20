import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as ExcelIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TableExplorerView = ({ 
  data = [], 
  columns = [],
  tableName = '',
  totalRecords = 0,
  isLoading = false,
  page = 0,
  rowsPerPage = 100,
  onPageChange,
  onRowsPerPageChange
}) => {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Ensure data is array
  const safeData = Array.isArray(data) ? data : [];
  
  // Filter data based on search
  const filteredData = searchTerm 
    ? safeData.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : safeData;

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value);
  };

  // 🔥 FIXED: Export to Excel with proper formatting
  const handleExportExcel = async () => {
    if (safeData.length === 0) {
      setSnackbar({ open: true, message: 'No data to export', severity: 'warning' });
      return;
    }
    
    setExporting(true);
    
    try {
      // Prepare data for export
      const exportData = safeData.map(row => {
        const exportRow = {};
        const displayCols = columns.length > 0 ? columns : Object.keys(safeData[0] || {});
        displayCols.forEach(col => {
          let value = row[col];
          if (value === null || value === undefined) {
            exportRow[col] = '-';
          } else if (value instanceof Date) {
            exportRow[col] = value.toLocaleDateString();
          } else if (typeof value === 'object') {
            exportRow[col] = JSON.stringify(value);
          } else {
            exportRow[col] = value;
          }
        });
        return exportRow;
      });
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns
      const maxWidth = 50;
      const colWidths = {};
      exportData.forEach(row => {
        Object.keys(row).forEach(col => {
          const cellLength = String(row[col]).length;
          if (!colWidths[col] || cellLength > colWidths[col]) {
            colWidths[col] = Math.min(cellLength, maxWidth);
          }
        });
      });
      ws['!cols'] = Object.keys(colWidths).map(col => ({ wch: colWidths[col] + 2 }));
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, tableName || 'Table Data');
      
      // Generate filename with date
      const fileName = `${tableName || 'table_export'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      
      // Download
      XLSX.writeFile(wb, fileName);
      
      setSnackbar({ open: true, message: `Excel exported successfully! ${exportData.length} records`, severity: 'success' });
      
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({ open: true, message: 'Failed to export Excel', severity: 'error' });
    } finally {
      setExporting(false);
    }
  };

  // 🔥 FIXED: Export to PDF with proper formatting
  const handleExportPdf = async () => {
    if (safeData.length === 0) {
      setSnackbar({ open: true, message: 'No data to export', severity: 'warning' });
      return;
    }
    
    setExporting(true);
    
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(67, 97, 238);
      doc.text(`Table: ${tableName || 'Data Export'}`, 14, 22);
      
      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
      doc.text(`Total Records: ${safeData.length.toLocaleString()}`, 14, 38);
      
      // Prepare table data
      const displayCols = columns.length > 0 ? columns : Object.keys(safeData[0] || {});
      const headers = displayCols;
      const rows = safeData.map(row => 
        headers.map(h => formatValue(row[h]))
      );
      
      // Calculate dynamic column widths
      const colWidths = headers.map((header, idx) => {
        const maxHeaderLength = header.length;
        const maxDataLength = Math.max(...rows.map(row => String(row[idx]).length), 0);
        return Math.min(Math.max(maxHeaderLength, maxDataLength) * 1.5, 40);
      });
      
      // Add table
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 45,
        theme: 'striped',
        styles: { 
          fontSize: 8, 
          cellPadding: 3,
          font: 'helvetica',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [67, 97, 238], 
          textColor: 255, 
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: headers.reduce((acc, _, idx) => {
          acc[idx] = { cellWidth: colWidths[idx] };
          return acc;
        }, {})
      });
      
      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Data Analytics Platform`, 14, doc.internal.pageSize.getHeight() - 10);
      }
      
      // Save PDF
      const fileName = `${tableName || 'table_export'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
      doc.save(fileName);
      
      setSnackbar({ open: true, message: `PDF exported successfully! ${rows.length} records`, severity: 'success' });
      
    } catch (error) {
      console.error('PDF export error:', error);
      setSnackbar({ open: true, message: 'Failed to export PDF', severity: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading table data...</Typography>
      </Paper>
    );
  }

  if (safeData.length === 0 && !isLoading) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          📊 No data available in this table
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The table "{tableName}" exists but has no records or you don't have permission.
        </Typography>
      </Paper>
    );
  }

  const displayColumns = columns.length > 0 ? columns : Object.keys(safeData[0] || {});

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6">
            📊 Table: <strong>{tableName}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Records: {totalRecords.toLocaleString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ width: 250 }}
          />
          
          <Tooltip title="Export to Excel">
            <span>
              <IconButton 
                onClick={handleExportExcel} 
                color="success"
                disabled={exporting || safeData.length === 0}
              >
                {exporting ? <CircularProgress size={24} /> : <ExcelIcon />}
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Export to PDF">
            <span>
              <IconButton 
                onClick={handleExportPdf} 
                color="error"
                disabled={exporting || safeData.length === 0}
              >
                {exporting ? <CircularProgress size={24} /> : <PdfIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa', width: 60 }}>#</TableCell>
                {displayColumns.map((col) => (
                  <TableCell 
                    key={col}
                    onClick={() => handleSort(col)}
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#f8f9fa',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e0e0e0' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {col}
                      {sortField === col && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  {displayColumns.map((col) => (
                    <TableCell key={col}>
                      {formatValue(row[col])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(e, newPage) => onPageChange && onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange && onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[50, 100, 500, 1000]}
          labelRowsPerPage="Rows per page:"
        />
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TableExplorerView;