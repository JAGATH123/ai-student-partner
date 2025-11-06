import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

// Invite APIs
export const inviteAPI = {
  createInvite: (data) => api.post('/invite/create', data),
  listInvites: () => api.get('/invite/list'),
  validateCode: (code) => api.get(`/invite/validate/${code}`),
  joinWithInvite: (data) => api.post('/invite/join', data),
  quickLogin: (sessionToken) => api.post('/invite/quick-login', { sessionToken }),
  deactivateInvite: (id) => api.delete(`/invite/${id}`),
};

// Quiz APIs
export const quizAPI = {
  getSubjects: () => api.get('/quiz/subjects'),
  getSubject: (slug) => api.get(`/quiz/subjects/${slug}`),
  getTopic: (topicId) => api.get(`/quiz/topics/${topicId}`),
  getRandomQuestion: (topicId, answeredIds = []) => {
    const params = answeredIds.length > 0 ? { answered: answeredIds.join(',') } : {};
    return api.get(`/quiz/topics/${topicId}/question`, { params });
  },
};

// Progress APIs
export const progressAPI = {
  submitAnswer: (data) => api.post('/progress/submit-answer', data),
  getMyProgress: () => api.get('/progress/my-progress'),
  getTopicProgress: (topicId) => api.get(`/progress/topic/${topicId}`),
  resetTopic: (topicId) => api.delete(`/progress/topic/${topicId}/reset`),
};

// Recommendation APIs
export const recommendationAPI = {
  getRecommendations: (n = 3) => api.get(`/recommendations?n=${n}`),
  getWeakAreas: () => api.get('/recommendations/weak-areas'),
  getReadyForReview: () => api.get('/recommendations/ready-for-review'),
};

// User APIs
export const userAPI = {
  getStats: () => api.get('/users/stats'),
  getLeaderboard: (period = '30') => api.get(`/users/leaderboard?period=${period}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/toggle-status`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAnalytics: (period = '30') => api.get(`/admin/analytics/overview?period=${period}`),
};

export default api;
