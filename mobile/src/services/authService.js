import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@dg_auth_token';
const USER_KEY = '@dg_auth_user';

export const authService = {
  /**
   * Register a new client account.
   */
  async register(name, email, password) {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });
    const { token, user } = response.data;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return response.data;
  },

  /**
   * Log in user (client or seller).
   */
  async login(email, password) {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    const { token, user } = response.data;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return response.data;
  },

  /**
   * Fetch current user profile.
   */
  async getMe() {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  },

  /**
   * Request password recovery instructions.
   */
  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Retrieve saved session from AsyncStorage.
   */
  async getSavedSession() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userStr = await AsyncStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  },

  /**
   * Log out by clearing stored credentials.
   */
  async logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  },
};

export default authService;
