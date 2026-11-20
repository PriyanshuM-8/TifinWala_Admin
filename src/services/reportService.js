import api from './api';

export const reportService = {
  getOrderReport: async ({ startDate, endDate, groupBy = 'day' } = {}) => {
    const params = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/reports/orders', { params });
    return response.data;
  },

  getRevenueReport: async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/reports/revenue', { params });
    return response.data;
  },

  getChefReport: async ({ startDate, endDate, limit = 20 } = {}) => {
    const params = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/reports/chefs', { params });
    return response.data;
  },

  getCustomerReport: async ({ startDate, endDate, limit = 20 } = {}) => {
    const params = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/reports/customers', { params });
    return response.data;
  },

  getFoodReport: async ({ limit = 20 } = {}) => {
    const response = await api.get('/api/admin/reports/foods', { params: { limit } });
    return response.data;
  },

  getSubscriptionReport: async () => {
    const response = await api.get('/api/admin/reports/subscriptions');
    return response.data;
  },

  getPaymentReport: async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/reports/payments', { params });
    return response.data;
  },

  getCancellationReport: async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/reports/cancellations', { params });
    return response.data;
  },
};

export default reportService;
