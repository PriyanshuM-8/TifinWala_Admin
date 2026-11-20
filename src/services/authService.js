import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      // First try dedicated admin endpoint
      const response = await api.post('/api/auth/admin/login', { email, password });
      return response.data;
    } catch (err) {
      // Fallback to unified login endpoint if needed
      if (err.response?.status === 404) {
        const response = await api.post('/api/auth/login', { email, password });
        return response.data;
      }
      throw err;
    }
  },

  getProfile: async () => {
    // /api/auth/me is the canonical endpoint
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('gharkaswad_admin_token');
    localStorage.removeItem('gharkaswad_admin_user');
  },
};

export default authService;
