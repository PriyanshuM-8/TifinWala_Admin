import api from './api';

export const auditLogService = {
  listAuditLogs: async ({ page = 1, limit = 20, action = '', targetModel = '' } = {}) => {
    const params = { page, limit };
    if (action) params.action = action;
    if (targetModel) params.targetModel = targetModel;
    const response = await api.get('/api/admin/audit-logs', { params });
    return response.data;
  },

  getAuditLogById: async (logId) => {
    const response = await api.get(`/api/admin/audit-logs/${logId}`);
    return response.data;
  },
};

export default auditLogService;
