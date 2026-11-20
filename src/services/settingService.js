import api from './api';

export const settingService = {
  getSettings: async () => {
    const response = await api.get('/api/admin/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.patch('/api/admin/settings', settingsData);
    return response.data;
  },
};

export default settingService;
