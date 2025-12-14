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

export const artifactApi = {
  list: (params?: Record<string, string>) =>
    api.get('/artifacts', { params }),
  get: (id: number) =>
    api.get(`/artifacts/${id}`),
};

export const buildApi = {
  list: (params?: Record<string, string>) =>
    api.get('/builds', { params }),
  getByHero: (heroSlug: string) =>
    api.get(`/heroes/${heroSlug}/builds`),
  get: (id: number) =>
    api.get(`/builds/${id}`),
  create: (data: FormData) =>
    api.post('/builds', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id: number, data: FormData) =>
    api.put(`/builds/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id: number) =>
    api.delete(`/builds/${id}`),
  vote: (id: number) =>
    api.post(`/builds/${id}/vote`),
  checkLike: (id: number) =>
    api.get(`/builds/${id}/like-status`),
  getComments: (id: number) =>
    api.get(`/builds/${id}/comments`),
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
  update: (slug: string, data: FormData) =>
    api.put(`/guides/${slug}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (slug: string) =>
    api.delete(`/guides/${slug}`),
  vote: (slug: string) =>
    api.post(`/guides/${slug}/vote`),
  checkLike: (slug: string) =>
    api.get(`/guides/${slug}/like-status`),
  getComments: (slug: string) =>
    api.get(`/guides/${slug}/comments`),
};

export const guildApi = {
  list: (params?: Record<string, string>) =>
    api.get('/guilds', { params }),
  options: () =>
    api.get('/guilds/options'),
  get: (slug: string) =>
    api.get(`/guilds/${slug}`),
  create: (data: FormData) =>
    api.post('/guilds', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id: number, data: FormData) =>
    api.put(`/guilds/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id: number) =>
    api.delete(`/guilds/${id}`),
};

export const commentApi = {
  create: (data: { type: 'build' | 'guide'; id: number; content: string; is_anonymous?: boolean }) =>
    api.post('/comments', data),
  delete: (id: number) =>
    api.delete(`/comments/${id}`),
};

export const reportApi = {
  create: (data: { reportable_type: string; reportable_id: number; reason: string }) =>
    api.post('/reports', data),
};

export const authApi = {
  getUser: () =>
    api.get('/user'),
  logout: () =>
    api.post('/logout'),
  getOAuthUrl: (provider: string) =>
    api.get(`/auth/${provider}`),
};

