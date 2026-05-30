import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request para inyectar la cabecera de autenticación simulada
api.interceptors.request.use(
  (config) => {
    config.headers['x-user-id'] = 'operator-123';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;