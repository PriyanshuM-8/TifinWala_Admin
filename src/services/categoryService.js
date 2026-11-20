import api from './api';

export const categoryService = {
  listCategories: async () => {
    const response = await api.get('/api/admin/categories');
    return response.data;
  },

  getCategory: async (id) => {
    const response = await api.get(`/api/admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (formData) => {
    const response = await api.post('/api/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateCategory: async (id, formData) => {
    const response = await api.put(`/api/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  toggleCategoryStatus: async (id) => {
    const response = await api.patch(`/api/admin/categories/${id}/status`);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/api/admin/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
