# 🛡️ Sistema de Gestión de Roles y Alcances (RBAC) - GeoterRA

Para garantizar la integridad científica y la seguridad de la plataforma GeoterRA, se define una estructura de **Control de Acceso Basado en Roles (RBAC)**. El objetivo es asegurar que solo los datos verificados por personal experto sean publicados en el mapa oficial. Recordemos que GeoterRA está pensada en un inicio para ofrecer características de manera gratuita, la cuales son:

- Consulta de mapa
- Uso del form de contacto
- Uso de los filtros de capa del mapa
- Visualización de la información y exportación en PDF de la misma

---

## 👥 Definición de Roles y Permisos

### 1. **User (Investigador / Técnico de Campo)**

Es el encargado de la recolección de datos primarios. Su flujo de trabajo se centra en el ingreso de información desde el campo por medio de la app móvil, no obstante, se puede hacer desde la app web sin problema alguno.

**Permisos:**
- `CREATE_REQUESTS` - Crear nuevas "Solicitudes de Análisis"
- `VIEW_OWN_REQUESTS` - Visualizar únicamente sus propias solicitudes

**Funcionalidades:**
- ✅ Crear solicitudes de análisis con coordenadas, temperatura, fotos y observaciones
- ✅ Editar sus propias solicitudes mientras estén en estado `Pendiente`
- ✅ Eliminar sus propias solicitudes
- ❌ No puede ver solicitudes de otros usuarios
- ❌ No puede aprobar solicitudes
- ❌ No puede acceder a la sección de administración

**Vistas Disponibles:**
- Perfil de usuario
- Mis Solicitudes
- Mapa interactivo
- Formulario de nueva solicitud

---

### 2. **Admin (Coordinador Científico / Verificador)**

Actúa como el curador de los datos. Es el rol con mayor responsabilidad sobre la veracidad científica de la plataforma. Es la persona que decide qué información entra o no a la Aplicación final.

**Permisos:**
- `CREATE_REQUESTS` - Crear solicitudes de análisis
- `VIEW_OWN_REQUESTS` - Ver sus propias solicitudes
- `REVIEW_REQUESTS` - Revisar todas las solicitudes pendientes
- `APPROVE_REQUESTS` - Aprobar solicitudes y convertirlas en Manifestaciones Registradas
- `EDIT_REQUEST_COORDINATES` - Corregir coordenadas de cualquier solicitud
- `EDIT_REQUEST_CHEMISTRY` - Corregir valores químicos (pH, conductividad, etc.)
- `DELETE_REQUESTS` - Eliminar solicitudes
- `VIEW_USERS` - Ver lista de usuarios del sistema

**Funcionalidades:**
- ✅ Crear y gestionar sus propias solicitudes
- ✅ Revisar todas las solicitudes del sistema
- ✅ Aprobar solicitudes verificadas científicamente
- ✅ Editar coordenadas en cualquier solicitud
- ✅ Editar parámetros químicos (pH, conductividad, temperatura)
- ✅ Eliminar solicitudes inapropiadas o duplicadas
- ✅ Ver información de otros usuarios
- ❌ No puede gestionar usuarios
- ❌ No puede acceder a logs del sistema
- ❌ No puede ver infraestructura

**Vistas Disponibles:**
- Todas las de User
- Todas las Solicitudes del Sistema (Admin Panel)
- Editor de solicitudes
- Vista de verificación científica
- Base de Datos (Lectura de todas las tablas)

---

### 3. **Maintenance (Administrador de Sistemas / DevOps)**

Encargado de la salud de la infraestructura y el rendimiento técnico de la plataforma. No interviene en la lógica científica, pero puede consultar y editar usuarios.

**Permisos:**
- `VIEW_USERS` - Ver lista de todos los usuarios
- `MANAGE_USERS` - Crear, editar y eliminar usuarios
- `ASSIGN_ROLES` - Asignar y cambiar roles de usuarios
- `VIEW_INFRASTRUCTURE` - Ver estado de infraestructura e información del dashboard
- `VIEW_SYSTEM_LOGS` - Acceder a los logs de sistema de PHP
- `EXPORT_DATA` - Exportar datos de la base de datos

**Funcionalidades:**
- ✅ Ver información de todos los usuarios
- ✅ Crear nuevas cuentas de usuario
- ✅ Editar datos de usuarios
- ✅ Eliminar cuentas de usuario
- ✅ Asignar y modificar roles de usuarios
- ✅ Monitorear estado del servidor (Online/Offline)
- ✅ Ver usuarios activos en tiempo real
- ✅ Ver solicitudes pendientes del sistema
- ✅ Revisar logs del sistema (últimas 500 líneas)
- ✅ Ver información de todas las tablas de la base de datos
- ✅ Exportar datos para análisis
- ❌ No puede aprobar solicitudes
- ❌ No puede editar valores de solicitudes científicamente
- ❌ No puede acceder a lógica de verificación

**Vistas Disponibles:**
- Perfil de usuario
- Dashboard de Mantenimiento (stats del sistema)
- Gestión de Usuarios (tabla de todos los usuarios)
- Base de Datos (lectura completa de todas las tablas)
- Visualizador de Logs del Sistema
- Mapa interactivo (solo consulta)

---

## 📊 Matriz de Permisos

| Permiso | User | Admin | Maintenance |
|---------|------|-------|-------------|
| CREATE_REQUESTS | ✅ | ✅ | ❌ |
| VIEW_OWN_REQUESTS | ✅ | ✅ | ❌ |
| REVIEW_REQUESTS | ❌ | ✅ | ❌ |
| APPROVE_REQUESTS | ❌ | ✅ | ❌ |
| EDIT_REQUEST_COORDINATES | ❌ | ✅ | ❌ |
| EDIT_REQUEST_CHEMISTRY | ❌ | ✅ | ❌ |
| DELETE_REQUESTS | ❌ | ✅ | ❌ |
| VIEW_USERS | ❌ | ✅ | ✅ |
| MANAGE_USERS | ❌ | ❌ | ✅ |
| ASSIGN_ROLES | ❌ | ❌ | ✅ |
| VIEW_INFRASTRUCTURE | ❌ | ❌ | ✅ |
| VIEW_SYSTEM_LOGS | ❌ | ❌ | ✅ |

---

## 🔐 Flujo de Datos y Seguridad

### Ciclo de Vida de una Solicitud de Análisis

1. **User crea solicitud** → Estado: `Pendiente`
2. **Admin revisa solicitud** → Valida datos científicamente
3. **Admin aprueba o rechaza**
   - Si ✅ Aprueba → Convierte a `Manifestación Registrada` → Aparece en mapa
   - Si ❌ Rechaza → Permanece como `Pendiente` o se elimina
4. **Admin puede editar** cualquier dato verificado

### Responsabilidades por Rol

**User:**
- Responsable de la exactitud de datos de campo
- Debe usar credenciales personales (no compartibles)

**Admin:**
- Responsable de la verificación científica
- Responsable de mantener integridad de datos publicados
- Auditable en el historial de cambios

**Maintenance:**
- Responsable de disponibilidad del sistema
- Responsable de integridad de backups
- Responsable de seguridad de acceso

---

## 🛠️ Implementación Técnica

Los permisos se verifican en tiempo de ejecución mediante:
- `PermissionService::hasPermission(role, permission)` - Verifica un permiso
- `PermissionService::hasAnyPermission(role, permissions)` - Verifica al menos uno
- `PermissionService::hasAllPermissions(role, permissions)` - Verifica todos

Definición de permisos en: `/API/src/DTO/PermissionsDTO.php`
Mapeo de roles en: `/API/src/Services/PermissionService.php`