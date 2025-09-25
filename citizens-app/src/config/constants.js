import Constants from 'expo-constants';

// Get environment variables from Expo config
const getEnvVar = (key, fallback = null) => {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || fallback;
};

export const ENV = {
  API_BASE_URL: getEnvVar('API_BASE_URL', 'http://localhost:3000/api'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
};

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(key => !ENV[key]);

if (missingEnvVars.length > 0) {
  console.warn('Missing required environment variables:', missingEnvVars);
}

export default ENV;