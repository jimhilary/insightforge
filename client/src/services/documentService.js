import api from './api';

export const documentService = {
  // Upload and summarize a PDF
  summarizeDocument: async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    
    const response = await api.post('/documents/summarize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Get all documents for a project
  getDocuments: async (projectId) => {
    const response = await api.get(`/documents/${projectId}`);
    return response.data;
  },
  
  // Get a specific document
  getDocument: async (documentId) => {
    const response = await api.get(`/documents/doc/${documentId}`);
    return response.data;
  },
  
  // Delete a document
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/doc/${documentId}`);
    return response.data;
  },
};

export default documentService;

