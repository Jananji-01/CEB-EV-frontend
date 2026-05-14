import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8088/EV/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Session APIs
export const sessionAPI = {
    // Get all sessions
    getAllSessions: () => api.get('/sessions/all'),
    
    // Filter sessions
    filterSessions: (filters) => api.post('/sessions/filter', filters),
    
    // Get session details
    getSessionDetail: (sessionId) => api.get(`/sessions/${sessionId}/detail`),
    
    // Get session report HTML
    getSessionReport: (sessionId) => api.get(`/sessions/${sessionId}/report`),
    
    // Download session report
    downloadSessionReport: (sessionId) => api.get(`/sessions/${sessionId}/download`, {
        responseType: 'blob'
    }),
};

export default api;