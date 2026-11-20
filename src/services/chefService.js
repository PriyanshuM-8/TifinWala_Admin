import api from './api';

export const chefService = {
  listChefs: async ({ page = 1, limit = 20, search = '', approvalStatus = '', status = '', city = '', isActive } = {}) => {
    const params = { page, limit };
    const effectiveStatus = approvalStatus || status;
    if (effectiveStatus) {
      params.status = effectiveStatus;
      params.approvalStatus = effectiveStatus;
    }
    if (search) params.search = search;
    if (city) params.city = city;
    if (isActive !== undefined && isActive !== '') params.isActive = isActive;
    const response = await api.get('/api/admin/chefs', { params });
    return response.data;
  },

  getChefDetails: async (chefId) => {
    const response = await api.get(`/api/admin/chefs/${chefId}`);
    return response.data;
  },

  approveChef: async (chefId, reviewNotes = '') => {
    const response = await api.patch(`/api/admin/chefs/${chefId}/approve`, { reviewNotes });
    return response.data;
  },

  rejectChef: async (chefId, rejectionReason = '') => {
    const response = await api.patch(`/api/admin/chefs/${chefId}/reject`, { rejectionReason });
    return response.data;
  },

  updateChefStatus: async (chefId, isActive) => {
    const response = await api.patch(`/api/admin/chefs/${chefId}/status`, { isActive });
    return response.data;
  },

  getChefOrders: async (chefId, { page = 1, limit = 10 } = {}) => {
    const response = await api.get(`/api/admin/chefs/${chefId}/orders`, { params: { page, limit } });
    return response.data;
  },

  getChefFoods: async (chefId) => {
    const response = await api.get(`/api/admin/chefs/${chefId}/foods`);
    return response.data;
  },

  getChefEarnings: async (chefId) => {
    const response = await api.get(`/api/admin/chefs/${chefId}/earnings`);
    return response.data;
  },

  getChefWallets: async (chefId) => {
    const response = await api.get(`/api/admin/chefs/${chefId}/wallets`);
    return response.data;
  },

  getChefTransactions: async (chefId, { page = 1, limit = 20 } = {}) => {
    const response = await api.get(`/api/admin/chefs/${chefId}/transactions`, { params: { page, limit } });
    return response.data;
  },
};

export default chefService;
