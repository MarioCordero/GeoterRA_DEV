// API Configuration
const API_CONFIG = {
  // Switch between 'local' and 'server' for development
  environment: 'local', // Change this to 'local' for local development
  
  baseUrls: {
    server: 'http://163.178.171.105/API',
    local: 'http://geoterra.com/API' // You must have installed and configured the virtual host first
  }
};

// Get the current base URL based on environment
export const getApiBaseUrl = () => {
  return API_CONFIG.baseUrls[API_CONFIG.environment];
};

// Helper function to build full API endpoint URLs
export const buildApiUrl = (endpoint) => {
  return `${getApiBaseUrl()}/${endpoint}`;
};

export default API_CONFIG;