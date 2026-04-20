import axios from "axios";

const BASE_URL = "https://data-analytics-dashboard-r965.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= KPI =================
export const fetchKPI = async () => {
  const res = await api.get("/kpi");
  return res.data;
};

// ================= TRANSACTIONS =================
export const getTransactions = async (page = 0, size = 100) => {
  const res = await api.get(`/transactions?page=${page}&size=${size}`);
  return res.data;
};

// ================= CHARTS =================
export const fetchStatusChart = async () => {
  const res = await api.get("/charts/status");
  return res.data;
};

export const fetchDateChart = async () => {
  const res = await api.get("/charts/date");
  return res.data;
};

export const fetchAmountChart = async () => {
  const res = await api.get("/charts/amount");
  return res.data;
};

// ================= BACKEND FILTER - WITH ALL FILTERS =================
export const filterTransactions = async (filters, columns, page = 0, size = 100) => {
  const requestBody = {};
  
  // TEXT FILTERS
  if (filters.baIdentifier && filters.baIdentifier.trim() !== "") {
    requestBody.baIdentifier = filters.baIdentifier;
  }
  if (filters.transactionId && filters.transactionId.trim() !== "") {
    requestBody.transactionId = filters.transactionId;
  }
  if (filters.customerId && filters.customerId.trim() !== "") {
    requestBody.customerId = filters.customerId;
  }
  if (filters.baBatchId && filters.baBatchId.trim() !== "") {
    requestBody.baBatchId = filters.baBatchId;
  }
  if (filters.remarks && filters.remarks.trim() !== "") {
    requestBody.remarks = filters.remarks;
  }
  
  // DATE FILTERS
  if (filters.transactionDate && filters.transactionDate.trim() !== "") {
    requestBody.transactionDate = filters.transactionDate;
  }
  if (filters.uploadDate && filters.uploadDate.trim() !== "") {
    requestBody.uploadDate = filters.uploadDate;
  }
  if (filters.recoDate && filters.recoDate.trim() !== "") {
    requestBody.recoDate = filters.recoDate;
  }
  
  // NUMBER FILTERS
  if (filters.amount && filters.amount.toString().trim() !== "") {
    requestBody.amount = parseFloat(filters.amount);
  }
  if (filters.recoAmount && filters.recoAmount.toString().trim() !== "") {
    requestBody.recoAmount = parseFloat(filters.recoAmount);
  }
  if (filters.tolerance && filters.tolerance.toString().trim() !== "") {
    requestBody.tolerance = parseFloat(filters.tolerance);
  }
  
  // SELECT FILTERS
  if (filters.status && filters.status.trim() !== "") {
    requestBody.status = filters.status;
  }
  if (filters.currency && filters.currency.trim() !== "") {
    requestBody.currency = filters.currency;
  }
  if (filters.paymentMethod && filters.paymentMethod.trim() !== "") {
    requestBody.paymentMethod = filters.paymentMethod;
  }
  if (filters.baRecoStatus && filters.baRecoStatus.trim() !== "") {
    requestBody.baRecoStatus = filters.baRecoStatus;
  }
  
  console.log("📤 Sending to backend:", requestBody);
  
  if (Object.keys(requestBody).length === 0) {
    return { content: [], totalElements: 0 };
  }
  
  const res = await api.post(`/transactions/filter?page=${page}&size=${size}`, requestBody);
  return res.data;
};

// 🔥 NEW: CURSOR-BASED FILTER (FAST)
export const filterTransactionsCursor = async (filters, cursor = null, limit = 100) => {
  const requestBody = {};
  
  // TEXT FILTERS
  if (filters.baIdentifier && filters.baIdentifier.trim() !== "") {
    requestBody.baIdentifier = filters.baIdentifier;
  }
  if (filters.transactionId && filters.transactionId.trim() !== "") {
    requestBody.transactionId = filters.transactionId;
  }
  if (filters.customerId && filters.customerId.trim() !== "") {
    requestBody.customerId = filters.customerId;
  }
  if (filters.baBatchId && filters.baBatchId.trim() !== "") {
    requestBody.baBatchId = filters.baBatchId;
  }
  if (filters.remarks && filters.remarks.trim() !== "") {
    requestBody.remarks = filters.remarks;
  }
  
  // DATE FILTERS
  if (filters.transactionDate && filters.transactionDate.trim() !== "") {
    requestBody.transactionDate = filters.transactionDate;
  }
  if (filters.uploadDate && filters.uploadDate.trim() !== "") {
    requestBody.uploadDate = filters.uploadDate;
  }
  if (filters.recoDate && filters.recoDate.trim() !== "") {
    requestBody.recoDate = filters.recoDate;
  }
  
  // NUMBER FILTERS
  if (filters.amount && filters.amount.toString().trim() !== "") {
    requestBody.amount = parseFloat(filters.amount);
  }
  if (filters.recoAmount && filters.recoAmount.toString().trim() !== "") {
    requestBody.recoAmount = parseFloat(filters.recoAmount);
  }
  if (filters.tolerance && filters.tolerance.toString().trim() !== "") {
    requestBody.tolerance = parseFloat(filters.tolerance);
  }
  
  // SELECT FILTERS
  if (filters.status && filters.status.trim() !== "") {
    requestBody.status = filters.status;
  }
  if (filters.currency && filters.currency.trim() !== "") {
    requestBody.currency = filters.currency;
  }
  if (filters.paymentMethod && filters.paymentMethod.trim() !== "") {
    requestBody.paymentMethod = filters.paymentMethod;
  }
  if (filters.baRecoStatus && filters.baRecoStatus.trim() !== "") {
    requestBody.baRecoStatus = filters.baRecoStatus;
  }
  
  console.log("📤 Cursor filter - Sending to backend:", requestBody);
  
  if (Object.keys(requestBody).length === 0) {
    return { content: [], nextCursor: null, hasMore: false };
  }
  
  let url = `/transactions/filter/cursor?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  
  const res = await api.post(url, requestBody);
  return res.data;
};

// ================= AGGREGATE API =================
export const getTransactionAggregates = async (filters) => {
  const requestBody = {};
  
  if (filters.status && filters.status.trim() !== "") {
    requestBody.status = filters.status;
  }
  if (filters.customerId && filters.customerId.trim() !== "") {
    requestBody.customerId = filters.customerId;
  }
  if (filters.transactionId && filters.transactionId.trim() !== "") {
    requestBody.transactionId = filters.transactionId;
  }
  if (filters.currency && filters.currency.trim() !== "") {
    requestBody.currency = filters.currency;
  }
  
  const res = await api.post("/transactions/aggregate", requestBody);
  return res.data;
};

// ================= DATABASE EXPLORER FUNCTIONS =================
export const getAllTables = async (page = 0, size = 100) => {
  try {
    const res = await api.get(`/database/all-tables-paginated?page=${page}&size=${size}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching tables:", err);
    return { content: [], totalElements: 0 };
  }
};

export const getTableData = async (tableName, page = 0, size = 100, sortBy = null, sortDirection = 'asc') => {
  try {
    let url = `/database/table-data?tableName=${encodeURIComponent(tableName)}&page=${page}&size=${size}`;
    if (sortBy) {
      url += `&sortBy=${sortBy}&sortDirection=${sortDirection}`;
    }
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching table data:", err);
    return { content: [], totalElements: 0, pageNumber: page, pageSize: size };
  }
};

export const getTableColumns = async (tableName) => {
  try {
    const res = await api.get(`/database/table-columns?tableName=${encodeURIComponent(tableName)}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching table columns:", err);
    return [];
  }
};

export default api;