import api from './api';

export const researchService = {
  // Run AI research
  runResearch: async (data) => {
    const response = await api.post('/research', data);
    return response.data;
  },
  
  // Get all research sessions for a project
  getResearchSessions: async (projectId) => {
    const response = await api.get(`/research/${projectId}`);
    return response.data;
  },
  
  // Get a specific research session
  getResearchSession: async (sessionId) => {
    const response = await api.get(`/research/session/${sessionId}`);
    return response.data;
  },
  
  // Delete a research session
  deleteResearchSession: async (sessionId) => {
    const response = await api.delete(`/research/session/${sessionId}`);
    return response.data;
  },
};

export default researchService;

