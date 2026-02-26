const API_CONFIG = {
  environment: 'local',
  
  baseUrls: {
    production: 'http://163.178.171.105/API/public',
    local: 'http://geoterra.com/API/public'
  },

  endpoints: {
    auth: {
      refresh: '/auth/refresh',
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
    },
    users: {
      me: '/users/me',
    },
    analysisRequest: {
      index: '/analysis-request',
      store: '/analysis-request',
      update: (id) => `/analysis-request/${id}`,
      delete: (id) => `/analysis-request/${id}`,
    },
    registeredManifestations: {
      index: '/registered-manifestations',
      store: '/registered-manifestations',
      update: (id) => `/registered-manifestations/${id}`,
      delete: (id) => `/registered-manifestations/${id}`,
    }
  }
};

export const getApiBaseUrl = () => {
  return API_CONFIG.baseUrls[API_CONFIG.environment];
};

export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  
  if (baseUrl.startsWith('/')) {
    return `${baseUrl}${endpoint}`.replace(/\/+/g, '/');
  }
  
  return `${baseUrl}${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
};

export const getAuthEndpoints = () => {
  return {
    refresh: buildApiUrl(API_CONFIG.endpoints.auth.refresh),
    register: buildApiUrl(API_CONFIG.endpoints.auth.register),
    login: buildApiUrl(API_CONFIG.endpoints.auth.login),
    logout: buildApiUrl(API_CONFIG.endpoints.auth.logout),
  };
};

export const getUsersEndpoints = () => {
  return {
    me: buildApiUrl(API_CONFIG.endpoints.users.me),
  };
};

export const getAnalysisRequestEndpoints = () => {
  return {
    index: buildApiUrl(API_CONFIG.endpoints.analysisRequest.index),
    store: buildApiUrl(API_CONFIG.endpoints.analysisRequest.store),
    update: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.update(id)),
    delete: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.delete(id)),
  };
};

export const getRegisteredManifestationsEndpoints = () => {
  return {
    index: buildApiUrl(API_CONFIG.endpoints.registeredManifestations.index),
    store: buildApiUrl(API_CONFIG.endpoints.registeredManifestations.store),
    update: (id) => buildApiUrl(API_CONFIG.endpoints.registeredManifestations.update(id)),
    delete: (id) => buildApiUrl(API_CONFIG.endpoints.registeredManifestations.delete(id)),
  };
};

export const debugApiConfig = () => {
  console.log('🔧 API Configuration:', {
    environment: API_CONFIG.environment,
    baseUrl: getApiBaseUrl(),
    endpoints: {
      auth: getAuthEndpoints(),
      users: getUsersEndpoints(),
      analysisRequest: getAnalysisRequestEndpoints(),
      registeredManifestations: getRegisteredManifestationsEndpoints(),
    }
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