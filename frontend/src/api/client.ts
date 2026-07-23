import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('goopayrecon-auth');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state && parsed.state.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'arraybuffer' || response.config.responseType === 'blob') {
      return response;
    }
    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        return Promise.reject(new Error(response.data.message || 'API Error'));
      }
      if (response.data.data !== undefined) {
        return response.data.data;
      }
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
