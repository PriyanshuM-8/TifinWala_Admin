import api from './api';

export const reviewComplaintService = {
  listReviews: async ({ page = 1, limit = 20, isFlagged = '' } = {}) => {
    const params = { page, limit };
    if (isFlagged !== '') params.isFlagged = isFlagged;
    const response = await api.get('/api/admin/reviews', { params });
    return response.data;
  },

  moderateReview: async (reviewId, { isFlagged, isHidden, adminNotes } = {}) => {
    const response = await api.patch(`/api/admin/reviews/${reviewId}/moderation`, {
      isFlagged,
      isHidden,
      adminNotes,
    });
    return response.data;
  },

  listComplaints: async ({ page = 1, limit = 20, status = '' } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/api/admin/complaints', { params });
    return response.data;
  },

  getComplaintDetails: async (complaintId) => {
    const response = await api.get(`/api/admin/complaints/${complaintId}`);
    return response.data;
  },

  resolveComplaint: async (complaintId, { status, resolutionNotes, refundAction } = {}) => {
    const response = await api.patch(`/api/admin/complaints/${complaintId}/status`, {
      status,
      resolutionNotes,
      refundAction,
    });
    return response.data;
  },
};

export default reviewComplaintService;
