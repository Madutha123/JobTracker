import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
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
};

export default api;
