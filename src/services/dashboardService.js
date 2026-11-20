import api from './api';

export const dashboardService = {
  getOverview: async ({ period, startDate, endDate } = {}) => {
    const params = {};
    if (period) params.period = period;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/dashboard/overview', { params });
    return response.data;
  },
};

export default dashboardService;
