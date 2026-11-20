import api from './api';

export const adminTreasuryService = {
  // Treasury & Withdrawable Balance Overview
  getOverview: async () => {
    const res = await api.get('/api/admin/treasury/overview');
    return res.data?.data || res.data;
  },

  // Bank Account Management
  listBankAccounts: async () => {
    const res = await api.get('/api/admin/bank-accounts');
    return res.data?.data || res.data;
  },

  addBankAccount: async (payload) => {
    const res = await api.post('/api/admin/bank-accounts', payload);
    return res.data?.data || res.data;
  },

  getBankAccount: async (id) => {
    const res = await api.get(`/api/admin/bank-accounts/${id}`);
    return res.data?.data || res.data;
  },

  verifyBankAccount: async (id, payload = {}) => {
    const res = await api.post(`/api/admin/bank-accounts/${id}/verify`, payload);
    return res.data?.data || res.data;
  },

  setDefaultBankAccount: async (id) => {
    const res = await api.patch(`/api/admin/bank-accounts/${id}/set-default`);
    return res.data?.data || res.data;
  },

  deleteBankAccount: async (id) => {
    const res = await api.delete(`/api/admin/bank-accounts/${id}`);
    return res.data;
  },

  // Withdrawal Requests & Lifecycle
  requestWithdrawal: async (payload) => {
    const res = await api.post('/api/admin/withdrawals/request', payload);
    return res.data;
  },

  listWithdrawals: async (params = {}) => {
    const res = await api.get('/api/admin/withdrawals', { params });
    return res.data;
  },

  getWithdrawalDetails: async (id) => {
    const res = await api.get(`/api/admin/withdrawals/${id}`);
    return res.data?.data || res.data;
  },

  cancelWithdrawal: async (id, reason) => {
    const res = await api.post(`/api/admin/withdrawals/${id}/cancel`, { reason });
    return res.data;
  },
};

export default adminTreasuryService;
