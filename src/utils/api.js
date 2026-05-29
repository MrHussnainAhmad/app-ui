import axios from 'axios';

const normalizeApiBase = (url) => {
  const cleaned = (url || '').trim().replace(/\/+$/, '');
  if (!cleaned) return 'http://localhost:5000/p';
  if (cleaned.endsWith('/p/manga')) return cleaned.replace(/\/manga$/, '');
  if (cleaned.endsWith('/p')) return cleaned;
  return `${cleaned}/p`;
};

const LOCAL_URL = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
const DEPLOY_URL = normalizeApiBase(import.meta.env.VITE_API_DEPLOY_URL || 'https://app-backend-kappa-sandy.vercel.app');

// Check if localhost is available
const checkLocalhost = async () => {
  try {
    await axios.get(LOCAL_URL.replace(/\/p$/, '/'), { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};

// Prefer localhost API when UI is running locally to avoid race conditions.
const isLocalFrontend =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

let BASE_URL = isLocalFrontend ? LOCAL_URL : DEPLOY_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased timeout to 60 seconds
});

// If not local UI, we can still opportunistically switch to localhost when available.
if (!isLocalFrontend) {
  checkLocalhost().then((isAvailable) => {
    if (isAvailable) {
      api.defaults.baseURL = LOCAL_URL;
    }
  });
}

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
