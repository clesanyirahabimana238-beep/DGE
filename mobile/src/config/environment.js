import { Platform } from 'react-native';

/**
 * Environment configuration for D&G E-Commerce Mobile App.
 *
 * - PC Wi-Fi IP (192.168.10.101): Allows physical Android & iOS devices on the same Wi-Fi
 *   to connect directly to the development backend server.
 * - Android Emulator (10.0.2.2): Host loopback alias for Android Virtual Devices.
 * - Production Render Cloud: Deployed Render backend URL with public HTTPS.
 */

export const PC_WIFI_IP = '192.168.10.101';
export const DEFAULT_DEV_URL = `http://${PC_WIFI_IP}:5000`;
export const EMULATOR_DEV_URL = 'http://10.0.2.2:5000';
export const PROD_API_URL = 'https://dgecommerce-api.onrender.com';

const DEFAULT_API_BASE_URL = Platform.select({
  // Physical phones connect via local Wi-Fi IP address
  android: DEFAULT_DEV_URL,
  ios: 'http://localhost:5000',
  default: DEFAULT_DEV_URL,
});

export const ENV = {
  IS_PRODUCTION: false,
  DEFAULT_API_URL: DEFAULT_API_BASE_URL,
  PC_WIFI_API_URL: DEFAULT_DEV_URL,
  EMULATOR_API_URL: EMULATOR_DEV_URL,
  PROD_API_URL,
  API_BASE_URL: DEFAULT_API_BASE_URL,
};

export default ENV;
