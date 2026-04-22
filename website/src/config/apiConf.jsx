const API_CONFIG = {
  environment: import.meta.env.MODE === 'production' ? 'production' : 'local',
  
  baseUrls: {
    production: 'http://163.178.171.105/API/public',
    local: 'http://localhost:8000/API/public'
  },

  // TODO: HIDE THE APIKEY
  defaultHeaders: {
    'Content-Type': 'application/json',
    'x-api-key': 'web-secret-key-789',
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
    maintenance: {
      systemLogs: '/maintenance/system/logs',
      dashboardInfo: '/maintenance/dashboard',
      allUsers: '/maintenance/users',
      allTables: '/maintenance/database/tables',
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
// MAINTENANCE ENDPOINTS
// ============================================
export const maintenance = {
  systemLogs: () => buildApiUrl(API_CONFIG.endpoints.maintenance.systemLogs),
  dashboardInfo: () => buildApiUrl(API_CONFIG.endpoints.maintenance.dashboardInfo),
  allUsers: () => buildApiUrl(API_CONFIG.endpoints.maintenance.allUsers),
  allTables: () => buildApiUrl(API_CONFIG.endpoints.maintenance.allTables),
};

// ============================================
// DEBUG & CONFIG
// ============================================
export const debugApiConfig = () => {
  // Debug function removed
};

export const autoDetectEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === 'geoterra.com') {
    API_CONFIG.environment = 'local';
  } else {
    API_CONFIG.environment = 'production';
  }
};

// ============================================
// API CALL ABSTRACTION LAYER
// ============================================

/**
 * Generic API call handler
 * @param {string} endpoint - Full API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} payload - Request body data
 * @param {object} customHeaders - Additional headers to override defaults (optional)
 * @returns {Promise<{ok: boolean, status: number, data: object, error: string|null}>}
 */
export const callApi = async (endpoint, method = 'GET', payload = null, customHeaders = {}) => {
  try {
    const headers = {
      ...API_CONFIG.defaultHeaders,
      ...customHeaders,
    };

    // Remove headers with empty string values (e.g., skip x-api-key for session requests)
    Object.keys(headers).forEach(key => {
      if (headers[key] === '') {
        delete headers[key];
      }
    });

    const options = {
      method,
      credentials: 'include',
      headers,
    };

    // Add body only for POST/PUT with payload
    if (payload && ['POST', 'PUT'].includes(method)) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(endpoint, options);
    const data = await response.json().catch(() => ({}));


    // Extract error message from different response formats
    const getErrorMessage = () => {
      if (data.message) return data.message;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors[0].message || data.errors[0].code;
      }
      return 'API Error';
    };

    return {
      ok: response.ok,
      status: response.status,
      data: data.data || data,
      error: response.ok ? null : getErrorMessage(),
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      data: null,
      error: error.message || 'Connection error',
    };
  }
};

// ============================================
// AUTH API FUNCTIONS
// ============================================
export const authLogin = async (payload) => {
  return callApi(auth.login(), 'POST', payload);
};

export const authRefresh = async () => {
  return callApi(auth.refresh(), 'POST');
};

export const authLogout = async () => {
  return callApi(auth.logout(), 'POST');
};

// ============================================
// USER API FUNCTIONS
// ============================================
export const userMe = async () => {
  return callApi(users.me(), 'GET');
};

export const userMeUpdate = async (payload) => {
  return callApi(users.me(), 'PUT', payload);
};

export const userMeSession = async () => {
  return callApi(users.meSession(), 'GET');
};

export const userRegister = async (payload) => {
  return callApi(users.register(), 'POST', payload);
};

// ============================================
// ANALYSIS REQUEST API FUNCTIONS
// ============================================
export const analysisRequestIndex = async () => {
  return callApi(analysisRequest.index(), 'GET');
};

export const analysisRequestStore = async (payload) => {
  return callApi(analysisRequest.store(), 'POST', payload);
};

export const analysisRequestUpdate = async (id, payload) => {
  return callApi(analysisRequest.update(id), 'PUT', payload);
};

export const analysisRequestDelete = async (id) => {
  return callApi(analysisRequest.delete(id), 'DELETE');
};

export const analysisRequestAdminIndex = async () => {
  return callApi(analysisRequest.adminIndex(), 'GET');
};

export const analysisRequestAdminUpdate = async (id, payload) => {
  return callApi(analysisRequest.adminUpdate(id), 'PUT', payload);
};

export const analysisRequestAdminDelete = async (id) => {
  return callApi(analysisRequest.adminDelete(id), 'DELETE');
};

// ============================================
// REGISTERED MANIFESTATIONS API FUNCTIONS
// ============================================
export const registeredManifestationsIndex = async () => {
  return callApi(registeredManifestations.index(), 'GET');
};

export const registeredManifestationsStore = async (payload) => {
  return callApi(registeredManifestations.store(), 'POST', payload);
};

export const registeredManifestationsUpdate = async (id, payload) => {
  return callApi(registeredManifestations.update(id), 'PUT', payload);
};

export const registeredManifestationsDelete = async (id) => {
  return callApi(registeredManifestations.delete(id), 'DELETE');
};

// ============================================
// MAINTENANCE API FUNCTIONS
// ============================================
export const maintenanceSystemLogs = async () => {
  return callApi(maintenance.systemLogs(), 'GET');
};

export const maintenanceDashboardInfo = async () => {
  return callApi(maintenance.dashboardInfo(), 'GET');
};

export const maintenanceAllUsers = async () => {
  return callApi(maintenance.allUsers(), 'GET');
};

export const maintenanceAllTables = async () => {
  return callApi(maintenance.allTables(), 'GET');
};

export default API_CONFIG;