import axios from 'axios';

// AUTOMATIC CONFIGURATION:
// 1. If VITE_API_URL is set manually (e.g. .env), use it.
// 2. If running in PROD (Vercel deployment), use the Live Backend.
// 3. Otherwise (Local dev), use Localhost.

const PROD_BACKEND = 'https://app-backend-alpha.vercel.app/p/manga';
const LOCAL_BACKEND = 'http://localhost:5000/p/manga';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_BACKEND : LOCAL_BACKEND);

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
