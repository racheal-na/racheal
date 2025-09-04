import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/updatedetails'),
  updatePassword: (passwordData) => api.put('/auth/updatepassword'),
  logout: () => api.get('/auth/logout'),
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }
};


export const casesAPI = {
  getAll: (params = {}) => api.get('/cases', { params }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (caseData) => api.post('/cases', caseData),
  update: (id, caseData) => api.put(`/cases/${id}`, caseData),
  delete: (id) => api.delete(`/cases/${id}`),
  addDocument: (caseId, formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post(`/cases/${caseId}/documents`, formData, config);
  },
  addNote: (caseId, noteData) => api.post(`/cases/${caseId}/notes`, noteData),
  getDocuments: (caseId) => api.get(`/cases/${caseId}/documents`),
  deleteDocument: (caseId, docId) => api.delete(`/cases/${caseId}/documents/${docId}`)
};

// Appointments API endpoints
export const appointmentsAPI = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getUpcoming: () => api.get('/appointments/upcoming'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  delete: (id) => api.delete(`/appointments/${id}`),
  sendReminder: (id) => api.post(`/appointments/${id}/send-reminder`),
};

// Constitutions API endpoints
export const constitutionsAPI = {
  getAll: (params = {}) => api.get('/constitutions', { params }),
  getById: (id) => api.get(`/constitutions/${id}`),
  create: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/constitutions', formData, config);
  },
  download: (id) => api.get(`/constitutions/${id}/download`, {
    responseType: 'blob' // Important for file downloads
  }),
  delete: (id) => api.delete(`/constitutions/${id}`),
  getByCategory: (category) => api.get(`/constitutions/category/${category}`),
};

// Notifications API endpoints
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread/count'),
};

// Utility function for handling API errors
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'Network error. Please check your connection.',
      status: null
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An unexpected error occurred',
      status: null
    };
  }
};

export default api;