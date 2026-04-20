import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Grid,
  Paper,
  Tooltip,
  Slider,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Search as SearchIcon,
  ClearAll as ClearIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

const FilterModal = ({
  open = false,
  onClose,
  filters = {},
  onApplyFilters,
  columns = [],
}) => {
  const [localFilters, setLocalFilters] = useState({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters || {});
    }
  }, [open, filters]);

  useEffect(() => {
    const count = Object.values(localFilters).filter(Boolean).length;
    setActiveFilterCount(count);
  }, [localFilters]);

  const handleFilterChange = (columnName, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const clearAllFilters = () => {
    setLocalFilters({});
  };

  // ✅🔥 FIXED FOR SPRING BOOT BACKEND
  const handleApply = () => {
    if (onApplyFilters) {
      const cleanedFilters = {};

      Object.entries(localFilters).forEach(([key, value]) => {
        if (!value) return;

        // TEXT
        if (typeof value === 'string' && value.trim() !== '') {
          cleanedFilters[key] = value;
        }

        // NUMBER RANGE
        if (value.min || value.max) {
          if (value.min) cleanedFilters.minAmount = value.min;
          if (value.max) cleanedFilters.maxAmount = value.max;
        }

        // DATE RANGE
        if (value.start || value.end) {
          if (value.start) cleanedFilters.startDate = value.start;
          if (value.end) cleanedFilters.endDate = value.end;
        }

        // MULTI SELECT
        if (Array.isArray(value) && value.length > 0) {
          cleanedFilters[key] = value.join(',');
        }
      });

      onApplyFilters(cleanedFilters);
    }

    onClose && onClose();
  };

  const renderInput = (column) => {
    const value = localFilters[column.name] || {};

    if (column.type === 'date') {
      return (
        <Box display="flex" gap={1}>
          <TextField
            type="date"
            label="From"
            size="small"
            value={value.start || ''}
            onChange={(e) =>
              handleFilterChange(column.name, { ...value, start: e.target.value })
            }
          />
          <TextField
            type="date"
            label="To"
            size="small"
            value={value.end || ''}
            onChange={(e) =>
              handleFilterChange(column.name, { ...value, end: e.target.value })
            }
          />
        </Box>
      );
    }

    if (column.type === 'number') {
      return (
        <Box display="flex" gap={1}>
          <TextField
            type="number"
            label="Min"
            size="small"
            value={value.min || ''}
            onChange={(e) =>
              handleFilterChange(column.name, { ...value, min: e.target.value })
            }
          />
          <TextField
            type="number"
            label="Max"
            size="small"
            value={value.max || ''}
            onChange={(e) =>
              handleFilterChange(column.name, { ...value, max: e.target.value })
            }
          />
        </Box>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        value={value || ''}
        onChange={(e) => handleFilterChange(column.name, e.target.value)}
        placeholder={`Search ${column.name}`}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon />
            <Typography>Filters ({activeFilterCount})</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {columns.map((col) => (
            <Grid item xs={12} md={6} key={col.name}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" mb={1}>
                  {col.displayName || col.name}
                </Typography>
                {renderInput(col)}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button startIcon={<ClearIcon />} onClick={clearAllFilters}>
          Clear
        </Button>
        <Button variant="contained" onClick={handleApply}>
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;