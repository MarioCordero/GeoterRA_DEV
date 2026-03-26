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
    system: '/logs/system',
  },
}

export const logs = {
  system: () => buildApiUrl(API_CONFIG.endpoints.logs.system),
};

// En componentes
import { logs } from '../../config/apiConf';
const response = await fetch(logs.system(), { credentials: 'include' });
```

## Seguridad
La seguridad del frontend se garantiza mediante el uso de HTTPS y la implementación de medidas de seguridad en el código.
