const API_CONFIG = {
  environment: import.meta.env.MODE === 'production' ? 'production' : 'local',

  baseUrls: {
    production: 'https://geoterra.inii.ucr.ac.cr/api',
    local: 'http://localhost:8000/api'
  },

  defaultHeaders: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
  },

  endpoints: {
    // ==========================================
    // 1. Auth (Autenticación y sesiones)
    // ==========================================
    auth: {
      login: '/auth/login',                           // 1.1 POST - Autentica usuario [No requerida]
      refresh: '/auth/refresh',                       // 1.2 POST - Renueva tokens [No requerida]
      logout: '/auth/logout',                         // 1.3 POST - Cierra sesión [Requerida]
      passwordResetRequest: '/auth/password-reset/request', // 1.4 POST - Solicita reset [No requerida]
      passwordResetReset: '/auth/password-reset/reset',     // 1.5 POST - Cambia contraseña OTP [No requerida]
    },

    // ==========================================
    // 2. Users (Gestión de usuarios)
    // ==========================================
    users: {
      register: '/users/register',                    // 2.1 POST  - Crea cuenta [No requerida]
      me: '/users/me',                                // 2.2 GET   - Datos usuario [Requerida]
                                                      // 2.3 PUT   - Actualiza perfil [Requerida]
                                                      // 2.5 DELETE - Soft-delete cuenta [Requerida]
      mePassword: '/users/me/password',               // 2.4 PUT   - Actualiza contraseña [Requerida]
      restore: '/users/restore',                      // 2.6 POST  - Restaura cuenta eliminada [No requerida]
      meSession: '/users/me/session',                 // 2.7 GET   - Datos de sesión [Requerida]
      adminUpdateRole: (id) => `/admin/users/${id}/role`, // 2.8 PUT - Actualiza rol [Admin]
    },

    // ==========================================
    // 3. Investigation Requests (Solicitudes)
    // ==========================================
    analysisRequest: {
      store: '/analysis-requests',                    // 3.1 POST   - Crea solicitud [Requerida]
      index: '/analysis-requests',                    // 3.2 GET    - Lista propias [Requerida]
      show: (id) => `/analysis-requests/${id}`,       // 3.3 GET    - Detalle propia [Requerida]
      update: (id) => `/analysis-requests/${id}`,     // 3.4 PUT    - Actualiza solicitud [Requerida]
      delete: (id) => `/analysis-requests/${id}`,     // 3.5 DELETE - Elimina solicitud [Requerida]
      states: (id) => `/analysis-requests/${id}/states`,    // 3.6 GET - Historial estados [Requerida]
      adminIndex: '/admin/analysis-requests',               // 3.7 GET  - Todas las solicitudes [Admin]
      adminShow: (id) => `/admin/analysis-requests/${id}`,  // 3.8 GET  - Solicitud por ID [Admin]
      adminStates: (id) => `/admin/analysis-requests/${id}/states`, // 3.9 GET - Estados [Admin]
      adminAddState: (id) => `/admin/analysis-requests/${id}/states`, // 3.10 POST - Agregar estado [Admin]
    },

    // ==========================================
    // 4. Provinces (Provincias)
    // ==========================================
    provinces: {
      index: '/provinces',                                    // 4.1 GET    - Todas las provincias [Público]
      adminShow: (id) => `/admin/provinces/${id}`,            // 4.2 GET    - Provincia por ULID [Admin]
      adminShowBySnit: (code) => `/admin/provinces/snit/${code}`, // 4.3 GET - Provincia por SNIT [Admin]
      adminStore: '/admin/provinces',                         // 4.4 POST   - Crea provincia [Admin]
      adminUpdate: (id) => `/admin/provinces/${id}`,          // 4.5 PUT    - Actualiza provincia [Admin]
      adminDelete: (id) => `/admin/provinces/${id}`,          // 4.6 DELETE - Elimina provincia [Admin]
    },

    // ==========================================
    // 5. Cantons (Cantones)
    // ==========================================
    cantons: {
      index: (provinceSnitCode) => provinceSnitCode
        ? `/cantons?province_snit_code=${provinceSnitCode}`
        : '/cantons',                                         // 5.1 GET    - Todos los cantones [Público]
      adminShow: (id) => `/admin/cantons/${id}`,              // 5.2 GET    - Cantón por ULID [Admin]
      adminShowBySnit: (code) => `/admin/cantons/snit/${code}`, // 5.3 GET  - Cantón por SNIT [Admin]
      adminStore: '/admin/cantons',                           // 5.4 POST   - Crea cantón [Admin]
      adminUpdate: (id) => `/admin/cantons/${id}`,            // 5.5 PUT    - Actualiza cantón [Admin]
      adminDelete: (id) => `/admin/cantons/${id}`,            // 5.6 DELETE - Elimina cantón [Admin]
    },

    // ==========================================
    // 6. Districts (Distritos)
    // ==========================================
    districts: {
      index: (cantonSnitCode) => cantonSnitCode
        ? `/districts?canton_snit_code=${cantonSnitCode}`
        : '/districts',                                       // 6.1 GET    - Todos los distritos [Público]
      adminShow: (id) => `/admin/districts/${id}`,            // 6.2 GET    - Distrito por ULID [Admin]
      adminShowBySnit: (code) => `/admin/districts/snit/${code}`, // 6.3 GET - Distrito por SNIT [Admin]
      adminStore: '/admin/districts',                         // 6.4 POST   - Crea distrito [Admin]
      adminUpdate: (id) => `/admin/districts/${id}`,          // 6.5 PUT    - Actualiza distrito [Admin]
      adminDelete: (id) => `/admin/districts/${id}`,          // 6.6 DELETE - Elimina distrito [Admin]
    },

    // ==========================================
    // 7. Geomanifestations (Geomanifestaciones)
    // ==========================================
    geomanifestations: {
      index: (params) => {
        const merged = { limit: 1000, ...(params || {}) };
        return `/geomanifestations?${new URLSearchParams(merged).toString()}`;
      },
      show: (id) => `/geomanifestations/${id}`,
      adminIndex: (params) => {
        const merged = { show_all: 'true', limit: 1000, ...(params || {}) };
        return `/admin/geomanifestations?${new URLSearchParams(merged).toString()}`;
      },
      adminShow: (id) => `/admin/geomanifestations/${id}`,
      adminStore: '/admin/geomanifestations',
      adminUpdate: (id) => `/admin/geomanifestations/${id}`,
      adminDelete: (id) => `/admin/geomanifestations/${id}`,
      adminSetVisibility: (id) => `/admin/geomanifestations/${id}/visibility`,
    },

    // ==========================================
    // 8. In-Situ Tests (Pruebas In-Situ)
    // ==========================================
    insituTests: {
      index: '/admin/insitu-tests',                           // 8.1 GET    - Listar pruebas [Admin]
      show: (id) => `/admin/insitu-tests/${id}`,              // 8.2 GET    - Detalle prueba [Admin]
      store: '/admin/insitu-tests',                           // 8.3 POST   - Crea prueba [Admin]
      update: (id) => `/admin/insitu-tests/${id}`,            // 8.4 PUT    - Actualiza prueba [Admin]
      delete: (id) => `/admin/insitu-tests/${id}`,            // 8.5 DELETE - Elimina prueba [Admin]
    },

    // ==========================================
    // 9. In-Lab Tests (Pruebas de Laboratorio)
    // ==========================================
    inlabTests: {
      index: '/admin/inlab-tests',                            // 9.1 GET    - Listar pruebas [Admin]
      show: (id) => `/admin/inlab-tests/${id}`,               // 9.2 GET    - Detalle prueba [Admin]
      store: '/admin/inlab-tests',                            // 9.3 POST   - Crea prueba [Admin]
      update: (id) => `/admin/inlab-tests/${id}`,             // 9.4 PUT    - Actualiza prueba [Admin]
      delete: (id) => `/admin/inlab-tests/${id}`,             // 9.5 DELETE - Elimina prueba [Admin]
    },

    // ==========================================
    // 10. Georeports (Georeportes)
    // ==========================================
    georeports: {
      current: '/georeports',                                 // 10.1 GET    - Reporte vigente [Público]
      adminIndex: '/admin/georeports',                        // 10.2 GET    - Listar georeportes [Admin]
      adminShow: (id) => `/admin/georeports/${id}`,           // 10.3 GET    - Detalle georeporte [Admin]
      adminStore: '/admin/georeports',                        // 10.4 POST   - Crea georeporte [Admin]
      adminUpdate: (id) => `/admin/georeports/${id}`,         // 10.5 PUT    - Actualiza georeporte [Admin]
      adminDelete: (id) => `/admin/georeports/${id}`,         // 10.6 DELETE - Elimina georeporte [Admin]
    },

    // ==========================================
    // 11. Maintenance (Mantenimiento)
    // ==========================================
    maintenance: {
      dashboardInfo: '/maintenance/dashboard',                // 11.1 GET - Dashboard info [Admin/Maintenance]
      allUsers: '/maintenance/users',                         // 11.2 GET - Lista usuarios [Admin/Maintenance]
      systemLogs: '/maintenance/system/logs',                 // 11.3 GET - Logs del sistema [Admin/Maintenance]
      allTables: '/maintenance/database/tables',              // 11.4 GET - Tablas BD [Admin/Maintenance]
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
// 1. AUTH ENDPOINTS
// ============================================
export const auth = {
  login: () => buildApiUrl(API_CONFIG.endpoints.auth.login),
  refresh: () => buildApiUrl(API_CONFIG.endpoints.auth.refresh),
  logout: () => buildApiUrl(API_CONFIG.endpoints.auth.logout),
  passwordResetRequest: () => buildApiUrl(API_CONFIG.endpoints.auth.passwordResetRequest),
  passwordResetReset: () => buildApiUrl(API_CONFIG.endpoints.auth.passwordResetReset),
};

// ============================================
// 2. USER ENDPOINTS
// ============================================
export const users = {
  register: () => buildApiUrl(API_CONFIG.endpoints.users.register),
  me: () => buildApiUrl(API_CONFIG.endpoints.users.me),
  mePassword: () => buildApiUrl(API_CONFIG.endpoints.users.mePassword),
  restore: () => buildApiUrl(API_CONFIG.endpoints.users.restore),
  meSession: () => buildApiUrl(API_CONFIG.endpoints.users.meSession),
  adminUpdateRole: (id) => buildApiUrl(API_CONFIG.endpoints.users.adminUpdateRole(id)),
};

// ============================================
// 3. ANALYSIS REQUEST ENDPOINTS
// ============================================
export const analysisRequest = {
  store: () => buildApiUrl(API_CONFIG.endpoints.analysisRequest.store),
  index: () => buildApiUrl(API_CONFIG.endpoints.analysisRequest.index),
  show: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.show(id)),
  update: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.update(id)),
  delete: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.delete(id)),
  states: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.states(id)),
  adminIndex: () => buildApiUrl(API_CONFIG.endpoints.analysisRequest.adminIndex),
  adminShow: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.adminShow(id)),
  adminStates: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.adminStates(id)),
  adminAddState: (id) => buildApiUrl(API_CONFIG.endpoints.analysisRequest.adminAddState(id)),
};

// ============================================
// 4. PROVINCES ENDPOINTS
// ============================================
export const provinces = {
  index: () => buildApiUrl(API_CONFIG.endpoints.provinces.index),
  adminShow: (id) => buildApiUrl(API_CONFIG.endpoints.provinces.adminShow(id)),
  adminShowBySnit: (code) => buildApiUrl(API_CONFIG.endpoints.provinces.adminShowBySnit(code)),
  adminStore: () => buildApiUrl(API_CONFIG.endpoints.provinces.adminStore),
  adminUpdate: (id) => buildApiUrl(API_CONFIG.endpoints.provinces.adminUpdate(id)),
  adminDelete: (id) => buildApiUrl(API_CONFIG.endpoints.provinces.adminDelete(id)),
};

// ============================================
// 5. CANTONS ENDPOINTS
// ============================================
export const cantons = {
  index: (provinceSnitCode) => buildApiUrl(API_CONFIG.endpoints.cantons.index(provinceSnitCode)),
  adminShow: (id) => buildApiUrl(API_CONFIG.endpoints.cantons.adminShow(id)),
  adminShowBySnit: (code) => buildApiUrl(API_CONFIG.endpoints.cantons.adminShowBySnit(code)),
  adminStore: () => buildApiUrl(API_CONFIG.endpoints.cantons.adminStore),
  adminUpdate: (id) => buildApiUrl(API_CONFIG.endpoints.cantons.adminUpdate(id)),
  adminDelete: (id) => buildApiUrl(API_CONFIG.endpoints.cantons.adminDelete(id)),
};

// ============================================
// 6. DISTRICTS ENDPOINTS
// ============================================
export const districts = {
  index: (cantonSnitCode) => buildApiUrl(API_CONFIG.endpoints.districts.index(cantonSnitCode)),
  adminShow: (id) => buildApiUrl(API_CONFIG.endpoints.districts.adminShow(id)),
  adminShowBySnit: (code) => buildApiUrl(API_CONFIG.endpoints.districts.adminShowBySnit(code)),
  adminStore: () => buildApiUrl(API_CONFIG.endpoints.districts.adminStore),
  adminUpdate: (id) => buildApiUrl(API_CONFIG.endpoints.districts.adminUpdate(id)),
  adminDelete: (id) => buildApiUrl(API_CONFIG.endpoints.districts.adminDelete(id)),
};

// ============================================
// 7. GEOMANIFESTATIONS ENDPOINTS
// ============================================
export const geomanifestations = {
  index: (params) => buildApiUrl(API_CONFIG.endpoints.geomanifestations.index(params)),
  show: (id) => buildApiUrl(API_CONFIG.endpoints.geomanifestations.show(id)),
  adminIndex: (params) => buildApiUrl(API_CONFIG.endpoints.geomanifestations.adminIndex(params)),
  adminShow: (id) => buildApiUrl(API_CONFIG.endpoints.geomanifestations.adminShow(id)),
  adminStore: () => buildApiUrl(API_CONFIG.endpoints.geomanifestations.adminStore),
  adminUpdate: (id) => buildApiUrl(API_CONFIG.endpoints.geomanifestations.adminUpdate(id)),
  adminDelete: (id) => buildApiUrl(API_CONFIG.endpoints.geomanifestations.adminDelete(id)),
  adminSetVisibility: (id) => buildApiUrl(API_CONFIG.endpoints.geomanifestations.adminSetVisibility(id)),
};

// ============================================
// 8. IN-SITU TESTS ENDPOINTS
// ============================================
export const insituTests = {
  index: () => buildApiUrl(API_CONFIG.endpoints.insituTests.index),
  show: (id) => buildApiUrl(API_CONFIG.endpoints.insituTests.show(id)),
  store: () => buildApiUrl(API_CONFIG.endpoints.insituTests.store),
  update: (id) => buildApiUrl(API_CONFIG.endpoints.insituTests.update(id)),
  delete: (id) => buildApiUrl(API_CONFIG.endpoints.insituTests.delete(id)),
};

// ============================================
// 9. IN-LAB TESTS ENDPOINTS
// ============================================
export const inlabTests = {
  index: () => buildApiUrl(API_CONFIG.endpoints.inlabTests.index),
  show: (id) => buildApiUrl(API_CONFIG.endpoints.inlabTests.show(id)),
  store: () => buildApiUrl(API_CONFIG.endpoints.inlabTests.store),
  update: (id) => buildApiUrl(API_CONFIG.endpoints.inlabTests.update(id)),
  delete: (id) => buildApiUrl(API_CONFIG.endpoints.inlabTests.delete(id)),
};

// ============================================
// 10. GEOREPORTS ENDPOINTS
// ============================================
export const georeports = {
  current: () => buildApiUrl(API_CONFIG.endpoints.georeports.current),
  adminIndex: () => buildApiUrl(API_CONFIG.endpoints.georeports.adminIndex),
  adminShow: (id) => buildApiUrl(API_CONFIG.endpoints.georeports.adminShow(id)),
  adminStore: () => buildApiUrl(API_CONFIG.endpoints.georeports.adminStore),
  adminUpdate: (id) => buildApiUrl(API_CONFIG.endpoints.georeports.adminUpdate(id)),
  adminDelete: (id) => buildApiUrl(API_CONFIG.endpoints.georeports.adminDelete(id)),
};

// ============================================
// 11. MAINTENANCE ENDPOINTS
// ============================================
export const maintenance = {
  dashboardInfo: () => buildApiUrl(API_CONFIG.endpoints.maintenance.dashboardInfo),
  allUsers: () => buildApiUrl(API_CONFIG.endpoints.maintenance.allUsers),
  systemLogs: () => buildApiUrl(API_CONFIG.endpoints.maintenance.systemLogs),
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

// --- Token Refresh Interceptor State ---
let _isRefreshing = false;
let _refreshQueue = []; // Queue of { resolve, reject } for requests waiting on refresh

/**
 * Process the queue of pending requests after a refresh attempt.
 * @param {boolean} success - Whether the refresh succeeded
 */
const _processRefreshQueue = (success) => {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (success) {
      resolve();
    } else {
      reject(new Error('Session expired'));
    }
  });
  _refreshQueue = [];
};

/**
 * Check if an endpoint is an auth endpoint (to avoid refresh loops).
 * @param {string} endpoint
 * @returns {boolean}
 */
const _isAuthEndpoint = (endpoint) => {
  const authPaths = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/password-reset'];
  return authPaths.some(path => endpoint.includes(path));
};

/**
 * Low-level fetch wrapper (no interceptor). Used internally to avoid recursion.
 */
const _rawCallApi = async (endpoint, method = 'GET', payload = null, customHeaders = {}) => {
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

    let finalEndpoint = endpoint;
    if (method === 'GET' && payload && typeof payload === 'object') {
      const queryParams = new URLSearchParams(payload).toString();
      if (queryParams) {
        finalEndpoint = finalEndpoint.includes('?') ? `${finalEndpoint}&${queryParams}` : `${finalEndpoint}?${queryParams}`;
      }
    }

    const options = {
      method,
      credentials: 'include',
      headers,
    };

    // Add body for POST/PUT/PATCH with payload
    if (payload && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(finalEndpoint, options);
    const data = await response.json().catch(() => ({}));
    console.log(`📡 [API RES] ${method} ${endpoint} (Status: ${response.status})`, data);

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
      raw: data,
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

/**
 * Generic API call handler with automatic token refresh on 401.
 *
 * When a 401 is received on a non-auth endpoint:
 * 1. Calls POST /auth/refresh (refresh token travels via HttpOnly cookie automatically)
 * 2. If refresh succeeds → retries the original request with the renewed session cookie
 * 3. If refresh fails → returns the 401 (session is truly expired, UI should redirect to login)
 *
 * Uses a mutex pattern: if multiple requests get 401 simultaneously,
 * only one refresh call is made and all others wait in a queue.
 *
 * @param {string} endpoint - Full API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {object} payload - Request body data
 * @param {object} customHeaders - Additional headers to override defaults (optional)
 * @returns {Promise<{ok: boolean, status: number, data: object, error: string|null}>}
 */
export const callApi = async (endpoint, method = 'GET', payload = null, customHeaders = {}) => {
  const result = await _rawCallApi(endpoint, method, payload, customHeaders);

  // If not a 401, or it's an auth endpoint, return immediately (no refresh loop)
  if (result.status !== 401 || _isAuthEndpoint(endpoint)) {
    return result;
  }

  // --- 401 on a protected endpoint: attempt silent refresh ---

  if (_isRefreshing) {
    // Another refresh is already in progress — wait for it
    try {
      await new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject });
      });
      // Refresh succeeded — retry original request
      return _rawCallApi(endpoint, method, payload, customHeaders);
    } catch {
      // Refresh failed — return original 401
      return result;
    }
  }

  // We are the first to detect 401 — start the refresh
  _isRefreshing = true;

  try {
    const refreshUrl = buildApiUrl(API_CONFIG.endpoints.auth.refresh);
    const refreshResult = await _rawCallApi(refreshUrl, 'POST');

    if (refreshResult.ok) {
      // Refresh succeeded — new access cookie is already set by the backend
      _processRefreshQueue(true);
      // Retry the original request
      return _rawCallApi(endpoint, method, payload, customHeaders);
    } else {
      // Refresh failed — session truly expired
      _processRefreshQueue(false);
      console.warn('⚠️ [callApi] Session expired. Refresh token is invalid or expired.');
      return result;
    }
  } catch (err) {
    _processRefreshQueue(false);
    console.error('❌ [callApi] Error during token refresh:', err);
    return result;
  } finally {
    _isRefreshing = false;
  }
};

// ============================================
// 1. AUTH API FUNCTIONS
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

export const authPasswordResetRequest = async (payload) => {
  return callApi(auth.passwordResetRequest(), 'POST', payload);
};

export const authPasswordResetReset = async (payload) => {
  return callApi(auth.passwordResetReset(), 'POST', payload);
};

// ============================================
// 2. USER API FUNCTIONS
// ============================================
export const userRegister = async (payload) => {
  return callApi(users.register(), 'POST', payload);
};

export const userMe = async () => {
  return callApi(users.me(), 'GET');
};

export const userMeUpdate = async (payload) => {
  return callApi(users.me(), 'PUT', payload);
};

export const userUpdatePassword = async (payload) => {
  return callApi(users.mePassword(), 'PUT', payload);
};

export const userMeDelete = async () => {
  return callApi(users.me(), 'DELETE');
};

export const userRestore = async (payload) => {
  return callApi(users.restore(), 'POST', payload);
};

export const userMeSession = async () => {
  return callApi(users.meSession(), 'GET');
};

export const userAdminUpdateRole = async (id, payload) => {
  return callApi(users.adminUpdateRole(id), 'PUT', payload);
};

// ============================================
// 3. ANALYSIS REQUEST API FUNCTIONS
// ============================================
export const analysisRequestStore = async (payload) => {
  return callApi(analysisRequest.store(), 'POST', payload);
};

export const analysisRequestIndex = async () => {
  return callApi(analysisRequest.index(), 'GET');
};

export const analysisRequestShow = async (id) => {
  return callApi(analysisRequest.show(id), 'GET');
};

export const analysisRequestUpdate = async (id, payload) => {
  return callApi(analysisRequest.update(id), 'PUT', payload);
};

export const analysisRequestDelete = async (id) => {
  return callApi(analysisRequest.delete(id), 'DELETE');
};

export const analysisRequestStates = async (id) => {
  return callApi(analysisRequest.states(id), 'GET');
};

export const analysisRequestAdminIndex = async () => {
  return callApi(analysisRequest.adminIndex(), 'GET');
};

export const analysisRequestAdminShow = async (id) => {
  return callApi(analysisRequest.adminShow(id), 'GET');
};

export const analysisRequestAdminStates = async (id) => {
  return callApi(analysisRequest.adminStates(id), 'GET');
};

export const analysisRequestAdminAddState = async (id, payload) => {
  return callApi(analysisRequest.adminAddState(id), 'POST', payload);
};

export const analysisRequestAdminUpdate = analysisRequestUpdate;
export const analysisRequestAdminDelete = analysisRequestDelete;
export const analysisRequestAdminGetStates = analysisRequestAdminStates;

// ============================================
// 4. PROVINCES API FUNCTIONS
// ============================================
export const provincesIndex = async () => {
  return callApi(provinces.index(), 'GET');
};

export const provincesAdminShow = async (id) => {
  return callApi(provinces.adminShow(id), 'GET');
};

export const provincesAdminShowBySnit = async (code) => {
  return callApi(provinces.adminShowBySnit(code), 'GET');
};

export const provincesAdminStore = async (payload) => {
  return callApi(provinces.adminStore(), 'POST', payload);
};

export const provincesAdminUpdate = async (id, payload) => {
  return callApi(provinces.adminUpdate(id), 'PUT', payload);
};

export const provincesAdminDelete = async (id) => {
  return callApi(provinces.adminDelete(id), 'DELETE');
};

// ============================================
// 5. CANTONS API FUNCTIONS
// ============================================
export const cantonsIndex = async (provinceSnitCode) => {
  return callApi(cantons.index(provinceSnitCode), 'GET');
};

export const cantonsAdminShow = async (id) => {
  return callApi(cantons.adminShow(id), 'GET');
};

export const cantonsAdminShowBySnit = async (code) => {
  return callApi(cantons.adminShowBySnit(code), 'GET');
};

export const cantonsAdminStore = async (payload) => {
  return callApi(cantons.adminStore(), 'POST', payload);
};

export const cantonsAdminUpdate = async (id, payload) => {
  return callApi(cantons.adminUpdate(id), 'PUT', payload);
};

export const cantonsAdminDelete = async (id) => {
  return callApi(cantons.adminDelete(id), 'DELETE');
};

// ============================================
// 6. DISTRICTS API FUNCTIONS
// ============================================
export const districtsIndex = async (cantonSnitCode) => {
  return callApi(districts.index(cantonSnitCode), 'GET');
};

export const districtsAdminShow = async (id) => {
  return callApi(districts.adminShow(id), 'GET');
};

export const districtsAdminShowBySnit = async (code) => {
  return callApi(districts.adminShowBySnit(code), 'GET');
};

export const districtsAdminStore = async (payload) => {
  return callApi(districts.adminStore(), 'POST', payload);
};

export const districtsAdminUpdate = async (id, payload) => {
  return callApi(districts.adminUpdate(id), 'PUT', payload);
};

export const districtsAdminDelete = async (id) => {
  return callApi(districts.adminDelete(id), 'DELETE');
};

// ============================================
// 7. GEOMANIFESTATIONS API FUNCTIONS
// ============================================
export const geomanifestationsIndex = async (params) => {
  return callApi(geomanifestations.index(params), 'GET');
};

export const geomanifestationsShow = async (id) => {
  return callApi(geomanifestations.show(id), 'GET');
};

export const geomanifestationsAdminIndex = async (params) => {
  return callApi(geomanifestations.adminIndex(params), 'GET');
};

export const geomanifestationsAdminShow = async (id) => {
  return callApi(geomanifestations.adminShow(id), 'GET');
};

export const geomanifestationsAdminStore = async (payload) => {
  return callApi(geomanifestations.adminStore(), 'POST', payload);
};

export const geomanifestationsAdminUpdate = async (id, payload) => {
  return callApi(geomanifestations.adminUpdate(id), 'PUT', payload);
};

export const geomanifestationsAdminDelete = async (id) => {
  return callApi(geomanifestations.adminDelete(id), 'DELETE');
};

export const geomanifestationsAdminSetVisibility = async (id, payload) => {
  return callApi(geomanifestations.adminSetVisibility(id), 'PATCH', payload);
};

// ============================================
// 8. IN-SITU TESTS API FUNCTIONS
// ============================================
export const insituTestsIndex = async (payload) => {
  return callApi(insituTests.index(), 'GET', payload);
};

export const insituTestsShow = async (id) => {
  return callApi(insituTests.show(id), 'GET');
};

export const insituTestsStore = async (payload) => {
  return callApi(insituTests.store(), 'POST', payload);
};

export const insituTestsUpdate = async (id, payload) => {
  return callApi(insituTests.update(id), 'PUT', payload);
};

export const insituTestsDelete = async (id) => {
  return callApi(insituTests.delete(id), 'DELETE');
};

// ============================================
// 9. IN-LAB TESTS API FUNCTIONS
// ============================================
export const inlabTestsIndex = async (payload) => {
  return callApi(inlabTests.index(), 'GET', payload);
};

export const inlabTestsShow = async (id) => {
  return callApi(inlabTests.show(id), 'GET');
};

export const inlabTestsStore = async (payload) => {
  return callApi(inlabTests.store(), 'POST', payload);
};

export const inlabTestsUpdate = async (id, payload) => {
  return callApi(inlabTests.update(id), 'PUT', payload);
};

export const inlabTestsDelete = async (id) => {
  return callApi(inlabTests.delete(id), 'DELETE');
};

// ============================================
// 10. GEOREPORTS API FUNCTIONS
// ============================================
export const georeportsCurrent = async (payload) => {
  return callApi(georeports.current(), 'GET', payload);
};

export const georeportsAdminIndex = async (payload) => {
  return callApi(georeports.adminIndex(), 'GET', payload);
};

export const georeportsAdminShow = async (id) => {
  return callApi(georeports.adminShow(id), 'GET');
};

export const georeportsAdminStore = async (payload) => {
  return callApi(georeports.adminStore(), 'POST', payload);
};

export const georeportsAdminUpdate = async (id, payload) => {
  return callApi(georeports.adminUpdate(id), 'PUT', payload);
};

export const georeportsAdminDelete = async (id) => {
  return callApi(georeports.adminDelete(id), 'DELETE');
};

// ============================================
// 11. MAINTENANCE API FUNCTIONS
// ============================================
export const maintenanceDashboardInfo = async () => {
  return callApi(maintenance.dashboardInfo(), 'GET');
};

export const maintenanceAllUsers = async () => {
  return callApi(maintenance.allUsers(), 'GET');
};

export const maintenanceSystemLogs = async () => {
  return callApi(maintenance.systemLogs(), 'GET');
};

export const maintenanceAllTables = async () => {
  return callApi(maintenance.allTables(), 'GET');
};

export default API_CONFIG;