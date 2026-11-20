import api from './api';

export const subscriptionService = {
  listSubscriptions: async ({
    page = 1,
    limit = 20,
    search = '',
    subscriptionStatus = '',
  } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (subscriptionStatus) params.subscriptionStatus = subscriptionStatus;
    const response = await api.get('/api/admin/subscriptions', { params });
    return response.data;
  },

  getSubscriptionStatistics: async () => {
    const response = await api.get('/api/admin/subscriptions/statistics');
    return response.data;
  },

  getSubscriptionDetail: async (id) => {
    const response = await api.get(`/api/admin/subscriptions/${id}`);
    return response.data;
  },

  getSubscriptionMeals: async (id) => {
    const response = await api.get(`/api/admin/subscriptions/${id}/meals`);
    return response.data;
  },
};

export default subscriptionService;
