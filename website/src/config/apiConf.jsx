// API Configuration for Complete Virtual Host Setup
const API_CONFIG = {
  // Switch between 'local' and 'production' for development
  environment: 'local', // Changed to 'local' since you're using proxy
  
  baseUrls: {
    production: 'http://163.178.171.105/API',
    // Use relative path for local development with Vite proxy
    local: '/API'
  }
};

// Get the current base URL based on environment
export const getApiBaseUrl = () => {
  return API_CONFIG.baseUrls[API_CONFIG.environment];
};

// Helper function to build full API endpoint URLs
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  
  // Handle relative paths (local development with proxy)
  if (baseUrl.startsWith('/')) {
    return `${baseUrl}/${endpoint}`.replace(/\/+/g, '/');
  }
  
  // Handle absolute URLs (production)
  return `${baseUrl}/${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
};

// Debug function to log current configuration
export const debugApiConfig = () => {
  console.log('🔧 API Configuration:', {
    environment: API_CONFIG.environment,
    baseUrl: getApiBaseUrl(),
    exampleUrl: buildApiUrl('login.inc.php')
  });
};

// Auto-detect environment based on hostname (optional enhancement)
export const autoDetectEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === 'geoterra.com') {
    API_CONFIG.environment = 'local';
  } else {
    API_CONFIG.environment = 'production';
  }
  
  console.log(`🔄 Auto-detected environment: ${API_CONFIG.environment}`);
};

// Call this in your app initialization if you want auto-detection
// autoDetectEnvironment();

export default API_CONFIG;