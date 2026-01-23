import axios from 'axios';

// RUNTIME DETECTION
// If the browser URL contains 'localhost', use local backend.
// Otherwise, assume we are on Vercel/Production and use the live backend.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const BASE_URL = isLocal 
    ? 'http://localhost:5000/p/manga' 
    : 'https://app-backend-alpha.vercel.app/p/manga';

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