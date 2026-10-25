import { Platform } from 'react-native';

/**
 * Environment configuration for mobile API requests.
 * 
 * - Android Emulator: Uses 10.0.2.2 to point to host machine localhost
 * - iOS Simulator / Web: Uses localhost (127.0.0.1)
 * - Physical Device: Replace with your development machine's local IP (e.g., http://192.168.1.X:5000)
 * - Production: Render deployed backend URL
 */

const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

// Production Render backend URL placeholder
const PROD_API_URL = 'https://dgecommerce-backend.onrender.com';

export const ENV = {
  IS_PRODUCTION: false,
  API_BASE_URL: false ? PROD_API_URL : DEV_API_URL,
};

export default ENV;
