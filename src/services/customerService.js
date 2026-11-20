import api from './api';

export const customerService = {
  listCustomers: async ({ page = 1, limit = 20, search = '', status } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (status !== undefined && status !== '') params.status = status;
    const response = await api.get('/api/admin/customers', { params });
    return response.data;
  },

  getCustomerDetails: async (customerId) => {
    const response = await api.get(`/api/admin/customers/${customerId}`);
    return response.data;
  },

  updateCustomerStatus: async (customerId, isActive) => {
    const response = await api.patch(`/api/admin/customers/${customerId}/status`, { isActive });
    return response.data;
  },

  getCustomerOrders: async (customerId, { page = 1, limit = 10 } = {}) => {
    const response = await api.get(`/api/admin/customers/${customerId}/orders`, {
      params: { page, limit },
    });
    return response.data;
  },

  getCustomerSubscriptions: async (customerId) => {
    const response = await api.get(`/api/admin/customers/${customerId}/subscriptions`);
    return response.data;
  },

  getCustomerRewards: async (customerId) => {
    const response = await api.get(`/api/admin/customers/${customerId}/rewards`);
    return response.data;
  },
};

export default customerService;
