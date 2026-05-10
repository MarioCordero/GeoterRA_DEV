# Frontend
## Introducción
El frontend se encarga de la interfaz de usuario y se encuentra en el directorio ./website.
## Tecnologías
Se utiliza la tecnología React para el desarrollo del frontend.
## Arquitectura
La arquitectura del frontend se basa en el patrón de arquitectura de componentes.
## Dependencias
Se utilizan las siguientes dependencias:
- React
- React DOM
- React Router DOM
- Leaflet
- Ant Design
- Recharts
## Patrones de diseño
Se utilizan los siguientes patrones de diseño:
- Singleton
- Factory
- Repository
## Distribución de componentes
Los componentes del frontend se distribuyen de la siguiente manera:
- Components
- Containers
- Services

## Gestión de endpoints API
### Estructura centralizada
Todos los endpoints de la API deben definirse en [website/src/config/apiConf.jsx](../../../website/src/config/apiConf.jsx). Esto permite:
- Cambiar fácilmente entre ambientes (local/production)
- Mantener un repositorio centralizado de todas las rutas
- Evitar hardcoding de URLs en los componentes

### Convención de nomenclatura
1. Cada recurso debe tener su propia sección en `endpoints`
2. Las funciones exportadas deben usar el patrón `nombre_recurso` (ej: `auth`, `users`, `logs`)
3. Los métodos dentro de cada sección deben representar la acción (ej: `login()`, `me()`, `system()`)

### Ejemplo de implementación
```jsx
// En apiConf.jsx
endpoints: {
  logs: {
    system: '/maintenance/system',
  },
}

export const logs = {
  system: () => buildApiUrl(API_CONFIG.endpoints.logs.system),
};

// En componentes
import { logs } from '../../config/apiConf';
const response = await fetch(logs.system(), { credentials: 'include' });
```

## Request Management Components

### Overview
The request management system has been refactored into a single, unified component: **RequestModal**. This component consolidates the previous split implementation (UserRequests + AddPointModal + UserRequestsList) into a cohesive, feature-rich interface.

### Component Architecture

#### RequestModal (Current - ✅ Use This)
**Location**: `website/src/components/common/RequestModal.jsx`

**Purpose**: Unified component for all request-related operations:
- ✅ List user's analysis requests with view details modal
- ✅ Create new requests with interactive map location picker
- ✅ Delete requests with confirmation dialog
- ✅ Mandatory coordinate selection via map or manual input
- ✅ Geolocation API integration
- ✅ Fullscreen map mode for precise coordinate selection
- ✅ Form caching with localStorage
- ✅ Mobile-responsive (table view on desktop, card view on mobile)

**Props**:
```javascript
<RequestModal 
  mode="list-and-create"    // 'list-and-create' (default) or 'create-only'
  onRequestAdded={callback}  // Optional callback after successful creation
  isAdmin={false}           // Show admin mode features
  useTokenAuth={false}      // Use token-based auth for standalone use
/>
```

**Usage Examples**:
```jsx
// In Dashboard (list + create interface)
import RequestModal from '../common/RequestModal';
<RequestModal mode="list-and-create" />

// In Admin Panel (create-only mode)
<RequestModal mode="create-only" isAdmin={true} />
```

**Key Features**:
1. **Tab-based navigation**: Users switch between "My Requests" list and "New Request" form
2. **Map integration**: Leaflet map for selecting precise coordinates
3. **Coordinate validation**: Forces users to select location (mandatory requirement)
4. **Modern API**: Uses `/analysis-request` endpoint with centralized `analysisRequest*` functions from `apiConf.jsx`
5. **Error handling**: User-friendly error messages for all operations
6. **Mobile responsive**: Adapts UI based on screen size (table ↔ card view)

---

### Deprecated Components

| Component | Location | Status | Migration |
|-----------|----------|--------|-----------|
| **UserRequestsList** | `website/src/components/loggedComponents/views/requests/UserRequestsList.jsx` | ❌ DELETED | Use `RequestModal` |
| **UserRequests** | `website/src/components/common/UserRequests.jsx` | ❌ MERGED | Functionality integrated into `RequestModal` |
| **AddPointModal** | `website/src/components/common/AddPointModal.jsx` | ⚠️ @deprecated | Use `RequestModal mode="create-only"` |

**Why consolidated?**
- Reduced code duplication (658 lines + 833 lines → single cohesive component)
- Single source of truth for request management business logic
- Improved maintainability and testing
- Consistent UI/UX experience
- Standardized API integration

---

### API Integration

#### Endpoints Used
All request operations use the modern `/analysis-request` endpoint via centralized `apiConf.jsx` functions:

```javascript
// Fetch user's requests
const { data, ok, error } = await analysisRequestIndex();

// Create new request (coordinates REQUIRED)
const { data, ok, error } = await analysisRequestStore({
  email: "user@example.com",           // required
  owner_name: "John Doe",              // required
  latitude: 9.933333,                  // required
  longitude: -84.083333,               // required
  region: "central_valley",            // optional
  temperature_sensation: "hot",        // optional: 'hot' | 'warm' | 'cold'
  bubbles: true,                       // optional
  current_usage: "agricultural",       // optional
  owner_contact_number: "+506...",     // optional
  details: "Additional info...",       // optional
});

// Delete request
const { ok, error } = await analysisRequestDelete(requestId);
```

#### Backend API Contract
**Endpoint**: `POST /analysis-request`

**Required Fields**:
- `region` (string)
- `email` (string, valid email format)
- `owner_name` (string)
- `latitude` (number, -90 to 90)
- `longitude` (number, -180 to 180)

**Optional Fields**:
- `owner_contact_number` (string)
- `temperature_sensation` (string: 'hot' | 'warm' | 'cold')
- `bubbles` (boolean, default: false)
- `current_usage` (string)
- `details` (string)

See [API/docs/contratos.md](../../../../API/docs/contratos.md#post-analysis-request) for full API documentation.

---

### Component Usage in Dashboard

**File**: `website/src/components/dashboard/DashboardContentController.jsx`

```javascript
// Case 2: "My Requests" - show to all users
case '2':
  return <RequestModal mode="list-and-create" />;
```

The dashboard automatically renders RequestModal when users navigate to the "My Requests" section (case 2).

---

### Styling & Responsiveness

RequestModal uses:
- **Tailwind CSS** for utility classes (responsive layout, spacing, colors)
- **Ant Design** components (Modal, Form, Button, Table, etc.)
- **Mobile-first design**: 
  - Desktop: Full table view with action buttons
  - Mobile (≤768px): Card-based view for better readability

---

### Form State Management

#### localStorage Caching
Form data is cached to localStorage with key `analysisRequestFormCache` to prevent data loss:
```javascript
// Automatically saves on every field change
handleFormValuesChange = (_, allValues) => {
  localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(allValues));
};

// Automatically restores when creating new request
useEffect(() => {
  const cached = localStorage.getItem(FORM_CACHE_KEY);
  if (cached) createForm.setFieldsValue(JSON.parse(cached));
}, [activeTab]);
```

---

### Geolocation Integration

RequestModal provides three ways to set coordinates:

1. **Click on Map**: Click anywhere on the Leaflet map to place a marker
2. **Current Location Button**: Requests browser's Geolocation API
3. **Manual Input**: Type latitude/longitude directly

All three methods update form state and are validated:
- Latitude: -90 to 90
- Longitude: -180 to 180

---

### Testing Checklist

When testing RequestModal in the dashboard:
- ✅ Navigate to "My Requests" (case 2)
- ✅ List displays existing user requests
- ✅ Click "Nueva Solicitud" → Create tab shows
- ✅ Click map to select location → marker appears
- ✅ Current location button → geolocation works
- ✅ Manual coordinate input → validation works
- ✅ Fullscreen map mode → boundaries work correctly
- ✅ Submit form with all required fields → request created
- ✅ New request appears in list after creation
- ✅ Delete request → confirmation modal shows
- ✅ Mobile view → card layout displays correctly
- ✅ Form caching → reload page → cached data persists

## Seguridad
La seguridad del frontend se garantiza mediante el uso de HTTPS y la implementación de medidas de seguridad en el código.
