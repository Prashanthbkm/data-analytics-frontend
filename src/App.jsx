
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert, Backdrop, CircularProgress } from '@mui/material';
import DashboardPage from './pages/DashboardPage';

// ❌ REMOVED apiService import (THIS WAS CAUSING ERROR)

// Theme (same as yours)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#007bff' },
    secondary: { main: '#6c757d' },
    success: { main: '#28a745' },
    error: { main: '#dc3545' },
    warning: { main: '#ffc107' },
    info: { main: '#17a2b8' },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  shape: { borderRadius: 8 },
});

function App() {
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // ✅ NO BACKEND INIT NEEDED HERE (Dashboard handles it)

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* MAIN DASHBOARD */}
      <DashboardPage showNotification={showNotification} />

      {/* NOTIFICATION */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>

      {/* LOADING BACKDROP */}
      <Backdrop open={loading} sx={{ zIndex: 9998 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </ThemeProvider>
  );
}

export default App;