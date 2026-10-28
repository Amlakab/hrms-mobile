import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const API_URL_STORAGE_KEY = '@hrms_custom_api_url';
export const TOKEN_STORAGE_KEY = '@hrms_auth_token';
export const USER_STORAGE_KEY = '@hrms_auth_user';

export const PRODUCTION_API_URL = 'https://houses-rental-management-system-backend-1.onrender.com/api';

// Default backend server URL pointing directly to production Render host
export const getDefaultApiUrl = () => {
  return PRODUCTION_API_URL;
};

export let CURRENT_API_BASE_URL = PRODUCTION_API_URL;

const api = axios.create({
  baseURL: CURRENT_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const updateApiBaseUrl = async (newUrl: string) => {
  let cleaned = newUrl.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  if (!cleaned.endsWith('/api')) {
    cleaned += '/api';
  }
  CURRENT_API_BASE_URL = cleaned;
  api.defaults.baseURL = cleaned;
  await AsyncStorage.setItem(API_URL_STORAGE_KEY, cleaned);
};

// Initialize URL from stored preference if present
AsyncStorage.getItem(API_URL_STORAGE_KEY).then((storedUrl) => {
  if (storedUrl) {
    CURRENT_API_BASE_URL = storedUrl;
    api.defaults.baseURL = storedUrl;
  }
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve token from AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const reqUrl = (error.config?.url || '').toLowerCase();
      const isAuthRequest =
        reqUrl.includes('/auth/login') ||
        reqUrl.includes('/auth/login-otp') ||
        reqUrl.includes('/auth/register');

      if (!isAuthRequest) {
        // Token has expired or is invalid
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
