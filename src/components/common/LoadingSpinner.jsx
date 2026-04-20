import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Fade,
  Backdrop,
  LinearProgress,
} from '@mui/material';

const LoadingSpinner = ({
  loading = true,
  type = 'circular',
  message = '',
  size = 40,
  color = 'primary',
  fullScreen = false,
  withBackdrop = true,
  thickness = 3.6,
  centered = true,
  children = null,
}) => {

  // ✅ FULL SCREEN LOADER
  if (fullScreen && loading) {
    return (
      <Fade in={loading} unmountOnExit>
        <Backdrop
          open={loading}
          sx={{
            zIndex: 9999,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: withBackdrop ? 'rgba(0,0,0,0.7)' : 'transparent',
          }}
        >
          <CircularProgress size={size * 1.5} thickness={thickness} />

          {message && (
            <Typography sx={{ mt: 2 }}>{message}</Typography>
          )}
        </Backdrop>
      </Fade>
    );
  }

  // ✅ LINEAR LOADER
  if (type === 'linear' && loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        {message && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // ✅ SKELETON STYLE
  if (type === 'skeleton') {
    if (!loading) return <>{children}</>;

    return (
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            height: 100,
            bgcolor: '#eee',
            borderRadius: 2,
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        />
      </Box>
    );
  }

  // ✅ DEFAULT SPINNER
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: centered ? 'center' : 'flex-start',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <CircularProgress size={size} color={color} thickness={thickness} />

        {message && (
          <Typography sx={{ mt: 2 }}>{message}</Typography>
        )}
      </Box>
    );
  }

  return null;
};

// ✅ WRAPPER
export const LoadingWrapper = ({ loading, children, spinnerProps = {} }) => {
  if (loading) return <LoadingSpinner loading {...spinnerProps} />;
  return <>{children}</>;
};

// ✅ PLACEHOLDER
export const LoadingPlaceholder = ({ loading, placeholder, children }) => {
  if (loading) return placeholder || <LoadingSpinner loading />;
  return <>{children}</>;
};

// ✅ PAGE LOADER
export const PageLoader = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}
  >
    <CircularProgress size={80} />
    <Typography sx={{ mt: 2 }}>{message}</Typography>
  </Box>
);

// ✅ TABLE LOADER
export const TableLoader = ({ rows = 5 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, i) => (
      <Box
        key={i}
        sx={{
          height: 40,
          bgcolor: i % 2 ? '#f5f5f5' : '#eee',
          mb: 1,
          borderRadius: 1,
        }}
      />
    ))}
  </Box>
);

// ✅ CHART LOADER
export const ChartLoader = ({ height = 300 }) => (
  <Box
    sx={{
      height,
      bgcolor: '#f5f5f5',
      borderRadius: 2,
    }}
  />
);

export default LoadingSpinner;