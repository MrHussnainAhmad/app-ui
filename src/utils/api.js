import axios from 'axios';

// RUNTIME DETECTION
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base points to the project root namespace "/p"
const BASE_URL = isLocal 
    ? 'http://localhost:5000/p' 
    : 'https://app-backend-alpha.vercel.app/p';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
