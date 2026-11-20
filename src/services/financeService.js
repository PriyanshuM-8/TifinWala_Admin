import api from './api';

export const financeService = {
  getOverview: async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/finance/overview', { params });
    return response.data;
  },

  getTransactions: async ({ page = 1, limit = 20, transactionType, startDate, endDate } = {}) => {
    const params = { page, limit };
    if (transactionType) params.transactionType = transactionType;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/finance/transactions', { params });
    return response.data;
  },

  getCommissionBreakdown: async () => {
    const response = await api.get('/api/admin/finance/commission');
    return response.data;
  },

  getCodFeeBreakdown: async () => {
    const response = await api.get('/api/admin/finance/cod-fees');
    return response.data;
  },

  getRefunds: async ({ page = 1, limit = 20, status = '' } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/api/admin/finance/refunds', { params });
    return response.data;
  },

  listWithdrawals: async ({ page = 1, limit = 20, status = '' } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/api/admin/wallets/withdrawals', { params });
    return response.data;
  },

  getWithdrawalDetails: async (withdrawalId) => {
    const response = await api.get(`/api/admin/wallets/withdrawals/${withdrawalId}/details`);
    return response.data;
  },

  approveWithdrawal: async (withdrawalId, remarks = '') => {
    const response = await api.post(`/api/admin/wallets/withdrawals/${withdrawalId}/approve`, { remarks });
    return response.data;
  },

  rejectWithdrawal: async (withdrawalId, rejectionReason) => {
    const response = await api.post(`/api/admin/wallets/withdrawals/${withdrawalId}/reject`, { rejectionReason });
    return response.data;
  },

  recordManualPayout: async (withdrawalId, { paymentReference, remarks } = {}) => {
    const response = await api.post(`/api/admin/wallets/withdrawals/${withdrawalId}/pay`, {
      paymentReference,
      remarks,
    });
    return response.data;
  },

  refundDisputeOrder: async ({ orderId, refundType, reason } = {}) => {
    const response = await api.post('/api/admin/wallets/refunds/dispute', {
      orderId,
      refundType,
      reason,
    });
    return response.data;
  },

  getConfig: async () => {
    const response = await api.get('/api/admin/wallets/config');
    return response.data;
  },

  getAnalytics: async ({ days, startDate, endDate } = {}) => {
    const params = {};
    if (days) params.days = days;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/finance/analytics', { params });
    return response.data;
  },

  reconcileLedger: async () => {
    const response = await api.post('/api/admin/finance/reconcile-ledger');
    return response.data;
  },

  updateConfig: async (configData) => {
    const response = await api.put('/api/admin/wallets/config', configData);
    return response.data;
  },
};

export default financeService;
