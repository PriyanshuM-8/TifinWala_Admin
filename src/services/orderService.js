import api from './api';

export const orderService = {
  listOrders: async ({
    page = 1,
    limit = 20,
    search = '',
    orderStatus = '',
    paymentStatus = '',
    paymentMethod = '',
    startDate = '',
    endDate = '',
  } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (orderStatus) params.orderStatus = orderStatus;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    if (paymentMethod) params.paymentMethod = paymentMethod;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/orders', { params });
    return response.data;
  },

  getOrderStatistics: async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/api/admin/orders/statistics', { params });
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/api/admin/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId, { cancellationReason, refundType } = {}) => {
    const response = await api.post(`/api/admin/orders/${orderId}/cancel`, {
      cancellationReason,
      refundType,
    });
    return response.data;
  },
};

export default orderService;
