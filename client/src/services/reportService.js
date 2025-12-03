import api from './api';

const reportService = {
  // Generate a new report
  generateReport: async (data) => {
    const response = await api.post('/reports/generate', data);
    return response.data;
  },

  // Get all reports for a project
  getReports: async (projectId) => {
    const response = await api.get(`/reports/${projectId}`);
    return response.data;
  },

  // Get a specific report
  getReport: async (reportId) => {
    const response = await api.get(`/reports/view/${reportId}`);
    return response.data;
  },

  // Delete a report
  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  }
};

export default reportService;

