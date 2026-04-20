import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  Pending as PendingIcon,
  TrendingDown as DebitIcon,
  TrendingUp as CreditIcon,
  AccountBalance as NetIcon,
  ShowChart as AvgIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const KpiCards = ({ 
  data = [], 
  isLoading = false
}) => {

  // Calculate metrics from current data
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.length;
  const success = safeData.filter(d => d.status?.toLowerCase() === 'success').length;
  const failed = safeData.filter(d => d.status?.toLowerCase() === 'failed').length;
  const pending = safeData.filter(d => d.status?.toLowerCase() === 'pending').length;
  const totalAmount = safeData.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  // Calculate debit and credit based on amount sign
  const debitTransactions = safeData.filter(d => (d.amount || 0) < 0);
  const creditTransactions = safeData.filter(d => (d.amount || 0) > 0);
  const totalDebit = Math.abs(debitTransactions.reduce((sum, d) => sum + (d.amount || 0), 0));
  const totalCredit = creditTransactions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const netAmount = totalCredit - totalDebit;
  const avgAmount = total > 0 ? totalAmount / total : 0;
  const successRate = total > 0 ? (success / total) * 100 : 0;

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0';
    return `₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  // Helper function to format number
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  // KPI Cards Configuration
  const kpiCards = [
    {
      title: "Total Transactions",
      value: formatNumber(total),
      icon: <ReceiptIcon sx={{ fontSize: 32 }} />,
      color: "#4361ee",
      bgColor: "#e8eeff",
      subtitle: "All transactions",
      tooltip: "Total number of transactions in the system"
    },
    {
      title: "Success Count",
      value: formatNumber(success),
      icon: <SuccessIcon sx={{ fontSize: 32 }} />,
      color: "#2e7d32",
      bgColor: "#e8f5e9",
      subtitle: `${successRate.toFixed(1)}% of total`,
      tooltip: "Number of successful transactions"
    },
    {
      title: "Failed Count",
      value: formatNumber(failed),
      icon: <FailedIcon sx={{ fontSize: 32 }} />,
      color: "#d32f2f",
      bgColor: "#ffebee",
      subtitle: `${failed} transactions`,
      tooltip: "Number of failed transactions"
    },
    {
      title: "Pending Count",
      value: formatNumber(pending),
      icon: <PendingIcon sx={{ fontSize: 32 }} />,
      color: "#ed6c02",
      bgColor: "#fff3e0",
      subtitle: `${pending} transactions`,
      tooltip: "Number of pending transactions"
    },
    {
      title: "Total Debit",
      value: formatCurrency(totalDebit),
      icon: <DebitIcon sx={{ fontSize: 32 }} />,
      color: "#dc3545",
      bgColor: "#ffebee",
      subtitle: "Outgoing amount",
      tooltip: "Total debit amount (money sent out)"
    },
    {
      title: "Total Credit",
      value: formatCurrency(totalCredit),
      icon: <CreditIcon sx={{ fontSize: 32 }} />,
      color: "#28a745",
      bgColor: "#e8f5e9",
      subtitle: "Incoming amount",
      tooltip: "Total credit amount (money received)"
    },
    {
      title: "Net Amount",
      value: formatCurrency(netAmount),
      icon: <NetIcon sx={{ fontSize: 32 }} />,
      color: netAmount >= 0 ? "#28a745" : "#dc3545",
      bgColor: netAmount >= 0 ? "#e8f5e9" : "#ffebee",
      subtitle: "Credit - Debit",
      tooltip: "Net position (Total Credit - Total Debit)"
    },
    {
      title: "Avg Transaction",
      value: formatCurrency(avgAmount),
      icon: <AvgIcon sx={{ fontSize: 32 }} />,
      color: "#ff6d00",
      bgColor: "#fff3e0",
      subtitle: "Average amount",
      tooltip: "Average amount per transaction"
    },
    {
      title: "Total Amount",
      value: formatCurrency(totalAmount),
      icon: <MoneyIcon sx={{ fontSize: 32 }} />,
      color: "#9c27b0",
      bgColor: "#f3e5f5",
      subtitle: "Sum of all amounts",
      tooltip: "Total sum of all transaction amounts"
    }
  ];

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mb: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 1, textAlign: 'center', color: '#666' }}>
          Loading KPI data...
        </Typography>
      </Box>
    );
  }

  if (total === 0 && !isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fff8e1' }}>
        <Typography variant="h6" color="warning.main" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No transactions match your current filters. Try adjusting your criteria.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {kpiCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={index}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
                cursor: 'pointer'
              },
              borderTop: `4px solid ${card.color}`,
              position: 'relative'
            }}
          >
            <Tooltip title={card.tooltip} arrow placement="top">
              <IconButton 
                size="small" 
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8,
                  opacity: 0.5,
                  '&:hover': { opacity: 1 }
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {card.icon}
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: card.color,
                  textAlign: 'right'
                }}
              >
                {card.value}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {card.title}
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {card.subtitle}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiCards;