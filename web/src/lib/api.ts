import axios from 'axios';

/**
 * Axios instance configured for E7-Hub API.
 * Uses environment variable for API URL.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for Sanctum cookies
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // Optionally redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API function helpers
export const heroApi = {
  list: (params?: Record<string, string>) =>
    api.get('/heroes', { params }),
  get: (slug: string) =>
    api.get(`/heroes/${slug}`),
  getBuilds: (slug: string) =>
    api.get(`/heroes/${slug}/builds`),
};

export const buildApi = {
  getByHero: (heroSlug: string) =>
    api.get(`/heroes/${heroSlug}/builds`),
  get: (id: number) =>
    api.get(`/builds/${id}`),
  create: (data: any) =>
    api.post('/builds', data),
  update: (id: number, data: any) =>
    api.put(`/builds/${id}`, data),
  delete: (id: number) =>
    api.delete(`/builds/${id}`),
};

export const guideApi = {
  list: (params?: Record<string, string | number>) =>
    api.get('/guides', { params }),
  get: (slug: string) =>
    api.get(`/guides/${slug}`),
  create: (data: FormData) =>
    api.post('/guides', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id: number, data: FormData) =>
    api.put(`/guides/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id: number) =>
    api.delete(`/guides/${id}`),
  vote: (id: number, value: 1 | -1) =>
    api.post(`/guides/${id}/vote`, { value }),
};

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () =>
    api.post('/auth/logout'),
  user: () =>
    api.get('/auth/user'),
};
