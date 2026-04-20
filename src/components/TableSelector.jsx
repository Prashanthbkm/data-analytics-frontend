import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { Storage as DatabaseIcon, TableChart as TableIcon, CheckCircle as WorkingIcon } from '@mui/icons-material';

// 🔥 YOUR WORKING TABLES - Add the exact table names here
const WORKING_TABLES = [
  "recoengine_load_testing_dummy_data_6",
  // Add more working tables here if any
];

// 🔥 OTHER TABLES (for display only - they won't load data)
const OTHER_TABLES = [
  "recoengine_custom_column_test",
  "1140116_Outstanding_dayageing",
  "2110116_curr_credit_dayageing",
  "auditlog_logentry",
  "auth_group",
  "auth_group_permissions",
  "auth_permission",
  "auth_usergroupspermission",
  // Add other table names here
];

const TableSelector = ({ onTableSelect, currentTable }) => {

  const isWorkingTable = (tableName) => {
    return WORKING_TABLES.includes(tableName);
  };

  const handleChange = (event) => {
    const tableName = event.target.value;
    
    // Only allow working tables to load data
    if (!isWorkingTable(tableName)) {
      alert(`⚠️ Table "${tableName}" has no data or you don't have permission.`);
      return;
    }
    
    if (tableName && onTableSelect) {
      onTableSelect(tableName);
    }
  };

  return (
    <Box sx={{ minWidth: 320, mr: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>
          <DatabaseIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Select Database Table
        </InputLabel>

        <Select
          value={currentTable || ""}
          onChange={handleChange}
          label="Select Database Table"
          renderValue={(selected) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TableIcon sx={{ fontSize: 18, color: "#4361ee" }} />
              <span>{selected}</span>
              {isWorkingTable(selected) && (
                <WorkingIcon sx={{ fontSize: 16, color: "#4caf50" }} />
              )}
            </Box>
          )}
        >
          {/* 🔥 WORKING TABLES SECTION - ON TOP */}
          <MenuItem disabled sx={{ opacity: 1, bgcolor: '#f5f5f5' }}>
            <Typography variant="caption" color="success.main" fontWeight="bold">
              ✅ WORKING TABLES (Click to load data)
            </Typography>
          </MenuItem>
          
          {WORKING_TABLES.map((table) => (
            <MenuItem key={table} value={table} sx={{ bgcolor: '#e8f5e9' }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TableIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{table}</span>
                </Box>
                <WorkingIcon sx={{ fontSize: 18, color: "#4caf50" }} />
              </Box>
            </MenuItem>
          ))}

          {/* DIVIDER */}
          <MenuItem disabled sx={{ opacity: 1 }}>
            <Typography variant="caption" color="text.secondary">
              ────────── OTHER TABLES (No Data) ──────────
            </Typography>
          </MenuItem>

          {/* OTHER TABLES */}
          {OTHER_TABLES.map((table) => (
            <MenuItem key={table} value={table}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TableIcon sx={{ fontSize: 18, color: "#999" }} />
                <span style={{ fontSize: "0.9rem", color: "#999" }}>{table}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Footer Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {WORKING_TABLES.length + OTHER_TABLES.length} total tables
        </Typography>
        <Typography variant="caption" color="success.main" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <WorkingIcon sx={{ fontSize: 12 }} />
          {WORKING_TABLES.length} working (on top)
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        ✅ Green tick tables will load data when clicked
      </Typography>
    </Box>
  );
};

export default TableSelector;