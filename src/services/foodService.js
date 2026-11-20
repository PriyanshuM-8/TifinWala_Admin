import api from './api';

export const foodService = {
  listFoods: async ({ page = 1, limit = 20, search = '', categoryId = '', isActive = '', isAvailable = '' } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (isActive !== '') params.isActive = isActive;
    if (isAvailable !== '') params.isAvailable = isAvailable;
    const response = await api.get('/api/admin/foods', { params });
    return response.data;
  },

  getFoodDetails: async (foodId) => {
    const response = await api.get(`/api/admin/foods/${foodId}`);
    return response.data;
  },

  moderateFood: async (foodId, { isActive, availability, moderationNotes }) => {
    const response = await api.patch(`/api/admin/foods/${foodId}/status`, {
      isActive,
      availability,
      moderationNotes,
    });
    return response.data;
  },
};

export default foodService;
