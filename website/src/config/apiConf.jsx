const API_CONFIG = {
  environment: 'local',
  
  baseUrls: {
    production: 'http://163.178.171.105/API',
    local: '/API'  // Using relative path for local development
  }
};

export const getApiBaseUrl = () => {
  return API_CONFIG.baseUrls[API_CONFIG.environment];
};

export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  
  if (baseUrl.startsWith('/')) {
    return `${baseUrl}/${endpoint}`.replace(/\/+/g, '/');
  }
  
  return `${baseUrl}/${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
};

export const debugApiConfig = () => {
  console.log('🔧 API Configuration:', {
    environment: API_CONFIG.environment,
    baseUrl: getApiBaseUrl(),
    exampleUrl: buildApiUrl('login.inc.php')
  });
};

export const autoDetectEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === 'geoterra.com') {
    API_CONFIG.environment = 'local';
  } else {
    API_CONFIG.environment = 'production';
  }
  
  console.log(`🔄 Auto-detected environment: ${API_CONFIG.environment}`);
};

export default API_CONFIG;