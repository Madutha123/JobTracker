import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request when available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  /**
   * Register a new user.
   * @param {{ username: string, email: string, password: string }} data
   */
  register: (data) => api.post('/api/auth/register', data),

  /**
   * Login with email + password.
   * Backend receives { username: email, password } because the backend
   * UserDetailsService loads by username; we store the email as the lookup key
   * via the email-accepting login flow.
   * @param {{ email: string, password: string }} data
   */
  login: (data) => api.post('/api/auth/login', { username: data.email, password: data.password }),

  /**
   * Sign in with Google OAuth access token.
   * @param {string} credential - access token from Google
   */
  googleLogin: (credential) => api.post('/api/auth/oauth/google', { credential }),
};

export const companyApi = {
  search: (query) => api.get('/api/companies', { params: { search: query } }),
  create: (data) => api.post('/api/companies', data),
};

export const applicationApi = {
  getAll: () => api.get('/api/applications'),
  getOne: (id) => api.get(`/api/applications/${id}`),
  create: (data) => api.post('/api/applications', data),
  update: (id, data) => api.put(`/api/applications/${id}`, data),
  delete: (id) => api.delete(`/api/applications/${id}`),
};

export const attachmentApi = {
  upload: (applicationId, file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    return api.post(`/api/applications/${applicationId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: (applicationId) => api.get(`/api/applications/${applicationId}/attachments`),
  delete: (applicationId, attachmentId) =>
    api.delete(`/api/applications/${applicationId}/attachments/${attachmentId}`),
};

export default api;

