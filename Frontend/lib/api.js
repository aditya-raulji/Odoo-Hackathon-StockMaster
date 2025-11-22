import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data || { error: { message: error.message } };
    throw {
      status: error.response?.status,
      payload,
    };
  }
);

export const api = {
  get: (path, params) => axiosInstance.get(path, { params }),
  post: (path, body) => axiosInstance.post(path, body),
  put: (path, body) => axiosInstance.put(path, body),
  patch: (path, body) => axiosInstance.patch(path, body),
  del: (path) => axiosInstance.delete(path),
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};
