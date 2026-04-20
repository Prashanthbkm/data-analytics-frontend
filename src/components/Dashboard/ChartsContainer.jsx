import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Card,
  CardContent,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap
} from 'recharts';

import {
  BarChart as BarIcon,
  ShowChart as LineIcon,
  PieChart as PieIcon,
  ScatterPlot as ScatterIcon,
  DonutLarge as DonutIcon,
  TrendingUp as AreaIcon,
  Radar as RadarIcon,
  ViewModule as TreemapIcon,
  ZoomIn,
  ZoomOut,
  Refresh
} from '@mui/icons-material';

const ChartsContainer = ({ statusData = [] }) => {

  const [chartType, setChartType] = useState('bar');
  const [chartSize, setChartSize] = useState('medium');
  const [selectedDataView, setSelectedDataView] = useState('status');

  const colors = ['#4361ee', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0', '#00acc1', '#ff6d00', '#dc3545'];

  const sizeConfig = {
    small: { height: 350, pieSize: 150, fontSize: '0.75rem' },
    medium: { height: 450, pieSize: 200, fontSize: '0.85rem' },
    large: { height: 550, pieSize: 250, fontSize: '1rem' }
  };

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: <BarIcon />, color: '#4361ee' },
    { value: 'line', label: 'Line Chart', icon: <LineIcon />, color: '#2e7d32' },
    { value: 'pie', label: 'Pie Chart', icon: <PieIcon />, color: '#ed6c02' },
    { value: 'donut', label: 'Donut Chart', icon: <DonutIcon />, color: '#9c27b0' },
    { value: 'scatter', label: 'Scatter Chart', icon: <ScatterIcon />, color: '#00acc1' },
    { value: 'area', label: 'Area Chart', icon: <AreaIcon />, color: '#ff6d00' },
    { value: 'radar', label: 'Radar Chart', icon: <RadarIcon />, color: '#dc3545' },
    { value: 'treemap', label: 'Treemap', icon: <TreemapIcon />, color: '#20c997' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small', size: '350px' },
    { value: 'medium', label: 'Medium', size: '450px' },
    { value: 'large', label: 'Large', size: '550px' }
  ];

  // Process data
  const processedData = useMemo(() => {
    const dataArray = Array.isArray(statusData) ? statusData : [];

    if (dataArray.length === 0) {
      return {
        barData: [],
        lineData: [],
        scatterData: [],
        radarData: [],
        treeMapData: []
      };
    }

    // Status count
    const statusMap = new Map();
    dataArray.forEach(item => {
      const status = item.status || 'Unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const barData = Array.from(statusMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    // Date count
    const dateMap = new Map();
    dataArray.forEach(item => {
      if (item.transactionDate) {
        const date = new Date(item.transactionDate).toISOString().split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });

    const lineData = Array.from(dateMap.entries())
      .map(([date, transactions]) => ({ date, transactions }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);

    // Scatter data
    const scatterData = barData.map((item, index) => ({
      x: index,
      y: item.count,
      name: item.name
    }));

    // Radar data
    const radarData = barData;

    // Treemap data
    const treeMapData = barData.map(item => ({
      name: item.name,
      size: item.count
    }));

    return { barData, lineData, scatterData, radarData, treeMapData };
  }, [statusData]);

  const { barData, lineData, scatterData, radarData, treeMapData } = processedData;

  const getChartData = () => {
    if (selectedDataView === 'date') {
      return lineData;
    }
    return barData;
  };

  const data = getChartData();
  const currentChartType = chartTypes.find(t => t.value === chartType);
  const currentSize = sizeOptions.find(s => s.value === chartSize);
  const height = sizeConfig[chartSize].height;
  const pieSize = sizeConfig[chartSize].pieSize;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, bgcolor: 'white', boxShadow: 2, borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Count: {payload[0].value?.toLocaleString()}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card sx={{ textAlign: 'center', py: 6, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            📊 No chart data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apply filters to see charts update
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Render chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="count" fill={currentChartType?.color || '#8884d8'} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke={currentChartType?.color || '#82ca9d'} 
                strokeWidth={3}
                dot={{ r: 4, fill: currentChartType?.color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Area 
                type="monotone" 
                dataKey="transactions" 
                stroke={currentChartType?.color || '#8884d8'} 
                fill={currentChartType?.color || '#8884d8'} 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={barData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={pieSize}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={50} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );

      case 'donut':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={barData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={pieSize * 0.6}
                  outerRadius={pieSize}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={50} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid stroke="#e0e0e0" />
              <XAxis dataKey="x" name="Category" tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" name="Count" tick={{ fontSize: 11 }} />
              <RechartsTooltip formatter={(value, name, props) => [value, props.payload.name]} />
              <Legend verticalAlign="top" height={36} />
              <Scatter name="Transactions" data={scatterData} fill={currentChartType?.color || '#8884d8'} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 11 }} />
              <Radar name="Count" dataKey="count" stroke={currentChartType?.color || '#8884d8'} fill={currentChartType?.color || '#8884d8'} fillOpacity={0.5} />
              <Legend verticalAlign="top" height={36} />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <Treemap
              data={treeMapData}
              dataKey="size"
              nameKey="name"
              ratio={4 / 3}
              stroke="#fff"
              fill={currentChartType?.color || '#8884d8'}
            />
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const totalRecords = barData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card sx={{ borderRadius: 3, overflow: 'visible', boxShadow: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarIcon sx={{ color: '#4361ee' }} />
            Charts & Visualization
          </Typography>
          <Chip 
            label={`Total Records: ${totalRecords.toLocaleString()}`}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        {/* Chart Controls */}
        <Grid container spacing={2} alignItems="center">
          {/* Chart Type Selector */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Chart Type:
            </Typography>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, val) => val && setChartType(val)}
              size="small"
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {chartTypes.map((type) => (
                <ToggleButton key={type.value} value={type.value} size="small">
                  <Tooltip title={type.label} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {type.icon}
                      <Typography sx={{ fontSize: '0.7rem', display: { xs: 'none', sm: 'block' } }}>
                        {type.label}
                      </Typography>
                    </Box>
                  </Tooltip>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          {/* Chart Size Selector */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Chart Size:
            </Typography>
            <ToggleButtonGroup
              value={chartSize}
              exclusive
              onChange={(e, val) => val && setChartSize(val)}
              size="small"
            >
              {sizeOptions.map((size) => (
                <ToggleButton key={size.value} value={size.value}>
                  {size.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>

          {/* Data View Selector */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Data View:
            </Typography>
            <ToggleButtonGroup
              value={selectedDataView}
              exclusive
              onChange={(e, val) => val && setSelectedDataView(val)}
              size="small"
            >
              <ToggleButton value="status">Status</ToggleButton>
              <ToggleButton value="date">Date Trend</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Info Chips */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`${currentChartType?.label} | ${currentSize?.label}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`Data Points: ${data.length}`}
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Chart Display */}
        <Box sx={{ 
          minHeight: height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#fafafa',
          borderRadius: 2,
          p: 2
        }}>
          {renderChart()}
        </Box>

      </CardContent>
    </Card>
  );
};

export default ChartsContainer;