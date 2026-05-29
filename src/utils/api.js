import axios from 'axios';

const LOCAL_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/p/manga';
const DEPLOY_URL = import.meta.env.VITE_API_DEPLOY_URL || 'https://app-backend-kappa-sandy.vercel.app/';

// Check if localhost is available
const checkLocalhost = async () => {
  try {
    await axios.get(LOCAL_URL.replace('/p/manga', '/health'), { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};

// Determine BASE_URL based on localhost availability
let BASE_URL = DEPLOY_URL;

// Try localhost first on app startup
checkLocalhost().then((isAvailable) => {
  if (isAvailable) {
    BASE_URL = LOCAL_URL;
    api.defaults.baseURL = BASE_URL;
  }
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased timeout to 60 seconds
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
