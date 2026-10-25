import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/environment';

export const CUSTOM_API_URL_KEY = '@dg_custom_api_url';

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get active API base URL (custom stored or default).
 */
export async function getApiBaseUrl() {
  try {
    const custom = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
    if (custom && custom.trim() !== '') {
      return custom.trim();
    }
  } catch (e) {
    // ignore
  }
  return ENV.API_BASE_URL;
}

/**
 * Set custom API base URL in storage and update axios default.
 */
export async function setApiBaseUrl(newUrl) {
  const sanitized = (newUrl || '').trim().replace(/\/+$/, '');
  if (!sanitized) return;
  await AsyncStorage.setItem(CUSTOM_API_URL_KEY, sanitized);
  api.defaults.baseURL = sanitized;
  return sanitized;
}

/**
 * Revert API base URL to build default.
 */
export async function resetApiBaseUrl() {
  await AsyncStorage.removeItem(CUSTOM_API_URL_KEY);
  api.defaults.baseURL = ENV.API_BASE_URL;
  return ENV.API_BASE_URL;
}

/**
 * Test connectivity to any server URL by calling /health.
 */
export async function testServerConnection(targetUrl) {
  const sanitized = (targetUrl || '').trim().replace(/\/+$/, '');
  const startTime = Date.now();
  try {
    const response = await axios.get(`${sanitized}/health`, {
      timeout: 6000,
      headers: { Accept: 'application/json' },
    });
    const latency = Date.now() - startTime;
    return {
      success: true,
      status: response.status,
      data: response.data,
      latencyMs: latency,
      url: sanitized,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      error: error.message || 'Connection failed',
      details: error.response?.data || null,
      latencyMs: latency,
      url: sanitized,
    };
  }
}

// Request interceptor: attach dynamic baseURL and JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      // Apply custom base URL if configured
      const customUrl = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
      if (customUrl && customUrl.trim() !== '') {
        config.baseURL = customUrl.trim();
      }

      // Attach token
      const token = await AsyncStorage.getItem('@dg_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error in request interceptor:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors uniformly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      try {
        await AsyncStorage.removeItem('@dg_auth_token');
        await AsyncStorage.removeItem('@dg_auth_user');
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;
