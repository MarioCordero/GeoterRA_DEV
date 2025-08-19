// API Configuration for Complete Virtual Host Setup
const API_CONFIG = {
  // Switch between 'local' and 'production' for development
  environment: 'production',
  
  baseUrls: {
    production: 'http://163.178.171.105/API',
    // Direct calls to your virtual host (no proxy needed)
    local: 'http://geoterra.com/API'
  }
};

// Get the current base URL based on environment
export const getApiBaseUrl = () => {
  return API_CONFIG.baseUrls[API_CONFIG.environment];
};

// Helper function to build full API endpoint URLs
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Ensure no double slashes
  return `${baseUrl}/${endpoint}`.replace(/\/+/g, '/').replace(':/', '://');
};

// Debug function to log current configuration
export const debugApiConfig = () => {
  console.log('🔧 API Configuration:', {
    environment: API_CONFIG.environment,
    baseUrl: getApiBaseUrl(),
    exampleUrl: buildApiUrl('login.inc.php')
  });
};

export default API_CONFIG;