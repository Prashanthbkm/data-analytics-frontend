/**
 * Dashboard Constants (UPDATED FOR SPRING BOOT)
 */

// ======================
// API CONFIGURATION
// ======================

// ✅ FIXED BASE URL (Spring Boot)
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : '/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ======================
// API ENDPOINTS (SPRING BOOT)
// ======================

export const API_ENDPOINTS = {
  HEALTH: '/health',

  // ✅ Your Spring Boot APIs
  KPI: '/kpi',
  TRANSACTIONS: '/transactions',
  STATUS_CHART: '/charts/status',
  DATE_CHART: '/charts/date',
  AMOUNT_CHART: '/charts/amount',

  // Filters
  FILTER: '/transactions/filter',
};

// ======================
// DEFAULT COLUMNS
// ======================

export const DEFAULT_COLUMNS = [
  'transactionId',
  'customerId',
  'transactionDate',
  'amount',
  'currency',
  'status',
  'paymentMethod',
  'baRecoStatus',
];

// ======================
// COLUMN METADATA (MATCH JAVA ENTITY)
// ======================

export const COLUMN_METADATA = {
  baIdentifier: { displayName: 'BA Identifier', type: 'text' },
  transactionId: { displayName: 'Transaction ID', type: 'text' },
  customerId: { displayName: 'Customer ID', type: 'text' },

  transactionDate: { displayName: 'Transaction Date', type: 'date' },

  amount: { displayName: 'Amount', type: 'number' },

  status: { displayName: 'Status', type: 'text' },
  baRecoStatus: { displayName: 'Reco Status', type: 'text' },

  currency: { displayName: 'Currency', type: 'text' },
  paymentMethod: { displayName: 'Payment Method', type: 'text' },
};

// ======================
// VIEW MODES
// ======================

export const VIEW_MODES = {
  DASHBOARD: 'dashboard',
  TABLE: 'table',
  CHARTS: 'charts',
};

// ======================
// PAGINATION
// ======================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

// ======================
// COLORS
// ======================

export const COLORS = {
  PRIMARY: '#007bff',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
};

// ======================
// ERROR MESSAGES (FIXED)
// ======================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Check your internet connection',
  SERVER_ERROR: 'Server error. Try again later',
  NO_DATA: 'No data available',
  BACKEND_NOT_FOUND:
    'Backend not running. Start Spring Boot on http://localhost:8080',
};

// ======================
// UTIL FUNCTIONS
// ======================

// Get display name
export const getColumnDisplayName = (column) => {
  return COLUMN_METADATA[column]?.displayName || column;
};

// Format currency
export const formatCurrency = (value) => {
  if (!value) return '$0';
  return `$${Number(value).toLocaleString()}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

// ======================
// EXPORT DEFAULT
// ======================

export default {
  API_CONFIG,
  API_ENDPOINTS,
  DEFAULT_COLUMNS,
  COLUMN_METADATA,
  VIEW_MODES,
  PAGINATION,
  COLORS,
  ERROR_MESSAGES,
  getColumnDisplayName,
  formatCurrency,
  formatDate,
};