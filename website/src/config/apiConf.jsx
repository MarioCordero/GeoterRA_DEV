const API_CONFIG = {
  environment: import.meta.env.MODE === 'production' ? 'production' : 'local',
  
  baseUrls: {
    production: 'http://163.178.171.105/API/public',
    local: 'http://localhost:8000/API/public' // NEW COOKIES
    //local: 'http://geoterra.com/API/public', (OLD)
  },

  endpoints: {
    auth: {
      refresh: '/auth/refresh',
      login: '/auth/login',
      logout: '/auth/logout',
    },
    users: {
      me: '/users/me',
      register: '/users/register',
      meSession: `/users/me/session`,
    },
    analysisRequest: {
      indexAll: '/analysis-request?all',
      index: '/analysis-request',
      store: '/analysis-request',
      update: (id) => `/analysis-request/${id}`,
      delete: (id) => `/analysis-request/${id}`,
      adminIndex: '/admin/analysis-requests',
      adminUpdate: (id) => `/admin/analysis-request/${id}`,
      adminDelete: (id) => `/admin/analysis-request/${id}`,
    },
    registeredManifestations: {
      index: '/registered-manifestations?region=all',
      store: '/registered-manifestations',
      update: (id) => `/registered-manifestations/${id}`,
      delete: (id) => `/registered-manifestations/${id}`,
    },
    Regions: {
      index: '/regions',
    },
    logs: {
      system: '/maintenance/system',
    },
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

// ============================================
// AUTH ENDPOINTS
// ============================================
export const auth = {
  login: () => buildApiUrl(API_CONFIG.endpoints.auth.login),
  refresh: () => buildApiUrl(API_CONFIG.endpoints.auth.refresh),
  logout: () => buildApiUrl(API_CONFIG.endpoints.auth.logout),
};

// ============================================
// USER ENDPOINTS
// ============================================
export const users = {
  me: () => buildApiUrl(API_CONFIG.endpoints.users.me),
  meSession: () => buildApiUrl(API_CONFIG.endpoints.users.meSession),
  register: () => buildApiUrl(API_CONFIG.endpoints.users.register),
};

// ============================================
// ANALYSIS REQUEST ENDPOINTS
// ============================================
export const analysisRequest = {
  index: () => buildApiUrl(API_CONFIG.endpoints.analysisRequest.index),
  store: () => buildApiUrl(API_CONFIG.endpoints.analysisRequest.store),
  update: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.update(id)),
  delete: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.delete(id)),
  adminIndex: () => buildApiUrl(API_CONFIG.endpoints.analysisRequest.adminIndex),
  adminUpdate: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.adminUpdate(id)),
  adminDelete: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.adminDelete(id)),
};

// ============================================
// REGISTERED MANIFESTATIONS ENDPOINTS
// ============================================
export const registeredManifestations = {
  index: () => buildApiUrl(API_CONFIG.endpoints.registeredManifestations.index),
  store: () => buildApiUrl(API_CONFIG.endpoints.registeredManifestations.store),
  update: (id) => buildApiUrl(API_CONFIG.endpoints.registeredManifestations.update(id)),
  delete: (id) => buildApiUrl(API_CONFIG.endpoints.registeredManifestations.delete(id)),
};

// ============================================
// LOGS ENDPOINTS
// ============================================
export const logs = {
  system: () => buildApiUrl(API_CONFIG.endpoints.logs.system),
};

// ============================================
// DEBUG & CONFIG
// ============================================
export const debugApiConfig = () => {
  console.log('🔧 API Configuration:', {
    environment: API_CONFIG.environment,
    baseUrl: getApiBaseUrl(),
    endpoints: {
      auth,
      users,
      analysisRequest,
      registeredManifestations,
      logs,
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