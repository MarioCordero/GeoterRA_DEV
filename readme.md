# 🌋 GeoterRA - Geological Information Platform

Una plataforma integral que proporciona información geológica especializada y validada, además de herramientas de planificación y previsualización para actividades económicas relacionadas con recursos geotérmicos.

## 🎯 Descripción del Proyecto

GeoterRA es una aplicación multiplataforma que permite a usuarios especializados:
- Visualizar datos geotérmicos y puntos de análisis en mapas interactivos
- Solicitar análisis geológicos de ubicaciones específicas
- Gestionar sesiones de usuario y autenticación segura
- Acceder a información detallada sobre propiedades geológicas

---

## 👥 Equipo de Desarrollo

| Desarrollador | Rol | Contacto |
|---------------|-----|----------|
| **Mario Cordero** | Lead Developer & Project Manager | [@MarioCordero](https://github.com/MarioCordero) |
| **Aaron Carmona** | Backend Developer | - |
| **Christopher Mora** | Frontend Developer | - |

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
geoterRA_dev/
├── Android/                    # Aplicación móvil Android
│   └── Development/
│       ├── app/               # Código fuente de la app
│       ├── gradle/            # Configuración Gradle
│       └── build.gradle.kts   # Build script principal
├── API/                       # Backend PHP REST API
│   ├── *.inc.php             # Endpoints de la API
│   ├── *.php                 # Controladores y modelos
│   └── dbhandler.inc.php     # Gestor de base de datos
├── database/                  # Scripts y documentación de BD
│   ├── GeoterRA.sql          # Schema de base de datos
│   └── database.md           # Documentación de BD
├── website/                   # Frontend web React
│   ├── src/                  # Código fuente React
│   ├── public/               # Archivos estáticos
│   ├── package.json          # Dependencias Node.js
│   └── vite.config.js        # Configuración Vite
└── .github/                   # CI/CD workflows
    └── workflows/
        └── deploy.yml         # Workflow de despliegue
```

### Stack Tecnológico

#### 📱 Android (Kotlin)
- **SDK Version**: API 34 (Android 14)
- **Language**: Kotlin 1.9.23
- **Architecture**: MVVM + Hilt DI
- **Key Libraries**:
  - Hilt 2.51 - Dependency Injection
  - Retrofit 2.11.0 - HTTP Client
  - OSMDroid 6.1.18 - Maps
  - Timber 5.0.1 - Logging
  - AndroidX Lifecycle 2.8.3
  - Proj4J 1.1.0 - Coordinate Conversion

#### 🌐 Web Frontend (React)
- **Framework**: React 18.3.1 + Vite
- **UI Library**: Ant Design 5.25.1
- **Styling**: Tailwind CSS 4.1.7
- **Maps**: Leaflet 1.9.4 + React Leaflet 4.2.1
- **Routing**: React Router DOM 7.6.1
- **Icons**: React Icons 5.5.0

#### ⚙️ Backend (PHP)
- **Language**: PHP 8.1+
- **Architecture**: REST API en capas (Controllers → Services → Repositories)
- **Frameworks**: Manejo nativo de PDO
- **Autenticación**: JWT tokens (Access + Refresh)
- **Database**: MySQL/MariaDB
- **CORS**: Configurado para multi-dominio
- **Key Features**:
  - Soft deletes con auditoría completa
  - ULIDs para generación de IDs
  - Password hashing con bcrypt
  - Manejo centralizado de errores con ErrorType

#### 🗄️ Base de Datos
- **Engine**: MySQL/MariaDB
- **Schema**: `GeoterRA.sql` (refactorizado a `GeoterRa-refact.sql`)
- **Features**: Datos geotérmicos, usuarios, solicitudes, manifestaciones
- **Audit Trail**: Soft deletes, created_by, modified_by, deleted_by

---

## 🔌 Arquitectura del Backend

### Estructura de Carpetas (API/src)

```
API/src/
├── Controllers/                    # Capa HTTP - Manejo de requests/responses
│   ├── AuthController.php         # POST /register, /login, /logout
│   ├── UserController.php         # GET /users/me
│   ├── AnalysisRequestController.php
│   └── RegisteredManifestationController.php
├── Services/                       # Capa de Lógica de Negocio
│   ├── AuthService.php
│   ├── UserService.php
│   ├── AnalysisRequestService.php
│   ├── RegisteredManifestationService.php
│   └── PasswordService.php
├── Repositories/                   # Capa de Persistencia - Acceso a Datos
│   ├── UserRepository.php
│   ├── AnalysisRequestRepository.php
│   └── RegisteredManifestationRepository.php
├── DTO/                            # Data Transfer Objects - Validación
│   ├── LoginUserDTO.php
│   ├── RegisterUserDTO.php
│   ├── AnalysisRequestDTO.php
│   ├── RegisteredManifestationDTO.php
│   └── AllowedRegions.php
├── Http/                           # Utilidades HTTP
│   ├── Response.php               # Respuestas JSON estandarizadas
│   ├── Request.php                # Parseo de requests
│   ├── ApiException.php           # Excepciones de API
│   └── ErrorType.php              # Tipos de error definidos
└── config/                         # Configuración
    └── database.php               # Conexión PDO
```

### Flujo de una Solicitud

```
1. HTTP Request → public/index.php
        ↓
2. Router → Controller (AuthController, UserController, etc)
        ↓
3. DTO Validation (LoginUserDTO::validate())
        ↓
4. Service Logic (AuthService, UserService, etc)
        ↓
5. Repository Access (UserRepository, etc)
        ↓
6. Database Query (PDO prepared statements)
        ↓
7. Response Object → JSON Response
```

### Endpoints Disponibles (Resumen)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Crear nuevo usuario | ❌ |
| POST | `/login` | Autenticarse | ❌ |
| POST | `/logout` | Cerrar sesión | ✅ |
| GET | `/users/me` | Datos del usuario autenticado | ✅ |
| POST | `/analysis-request` | Crear solicitud de análisis | ✅ |
| GET | `/analysis-request` | Listar análisis del usuario | ✅ |
| PUT | `/analysis-request/{id}` | Actualizar análisis | ✅ |
| DELETE | `/analysis-request/{id}` | Eliminar análisis | ✅ |
| PUT | `/registered-manifestations` | Registrar manifestación | ✅ |
| GET | `/registered-manifestations?region=X` | Listar manifestaciones | ✅ |

Para documentación completa, ver [API/README.md](API/README.md)

### Autenticación

**Flujo de Login:**
1. Usuario POST `/login` con email y password
2. API verifica credenciales
3. Genera `access_token` (1 hora) y `refresh_token` (30 días)
4. Cliente almacena tokens
5. Cada request incluye: `Authorization: Bearer <access_token>`

**Revocación de Sesión:**
- Al hacer logout, el `access_token` se marca como revocado
- Cliente descarta tokens locales

---

## 🔄 Flujo de Desarrollo (Git Flow)

### Ramas Principales
- **`main`**: Código en producción (solo builds compilados)
- **`headerWeb`**: Rama de desarrollo principal
- **`feature/*`**: Ramas para nuevas funcionalidades
- **`hotfix/*`**: Correcciones urgentes

### Reglas de Contribución

#### 📝 Convención de Commits
Para mantener un historial claro y organizado:

| **Tipo** | **Descripción** | **Ejemplo** |
|----------|-----------------|-------------|
| **FEAT** | Nueva funcionalidad | `FEAT: Agregar autenticación biométrica` |
| **FIX** | Corrección de errores | `FIX: Resolver crash en carga de mapas` |
| **STYLE** | Cambios de estilo/formato | `STYLE: Actualizar tema de la aplicación` |
| **REFACTOR** | Refactorización de código | `REFACTOR: Optimizar consultas de BD` |
| **TEST** | Pruebas unitarias/integración | `TEST: Agregar tests para API endpoints` |
| **DOCS** | Actualización documentación | `DOCS: Actualizar README con nuevas APIs` |
| **CHORE** | Mantenimiento/dependencias | `CHORE: Actualizar dependencias Gradle` |
| **API** | Cambios en APIs | `API: Implementar endpoint de regiones` |

#### 🔀 Pull Request Workflow
1. Crear rama desde `headerWeb`: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar y hacer commits siguiendo convenciones
3. Push a rama remota: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request hacia `headerWeb`
5. Code Review y aprobación
6. Merge automático ejecuta CI/CD

---

## � CI/CD Pipeline

### Trigger de Despliegue
- **Pull Request** → `headerWeb` (ejecuta tests y validaciones)
- **Merge a headerWeb** → Automáticamente actualiza `main` con build de producción

### Proceso de Build
1. **Checkout** del código desde `headerWeb`
2. **Setup** Node.js 20
3. **Install** dependencias del frontend
4. **Build** aplicación React con Vite
5. **Deploy** a rama `main` con estructura optimizada
6. **Trigger** actualización en servidor de producción

### Configuración Requerida
- **Repository Secret**: `GH_PAT` (Personal Access Token)
- **Server Endpoint**: `http://163.178.171.105/pull.sh`

---

## 🛠️ Guía de Desarrollo

### Requisitos del Sistema
- **Android Studio**: Arctic Fox o superior
- **Node.js**: 18.x o superior
- **PHP**: 8.0 o superior
- **MySQL**: 8.0 o superior
- **Git**: 2.30 o superior

### Configuración del Entorno

#### Android Development
```bash
cd Android/Development
./gradlew build
```

#### Web Development
```bash
cd website
npm install
npm run dev        # Desarrollo
npm run build      # Producción
```

#### API Setup (Backend PHP)

**1. Requisitos del Sistema:**
- PHP 8.1 o superior
- Apache con mod_rewrite habilitado (o Nginx)
- MySQL/MariaDB 8.0+
- extensiones: pdo_mysql, json, mbstring

**2. Configuración de BD:**
```bash
# Importar schema en MySQL
mysql -u usuario -p < database/GeoterRa-refact.sql
```

**3. Configurar API:**
```bash
# Crear archivo de configuración
cp API/config/config.example.ini API/config/config.ini

# Editar config.ini con credenciales
[database]
host = localhost
name = GeoterRa
user = geouser
pass = secure_password
```

**4. Apache Configuration (.htaccess en public/):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /api/index.php [L]
</IfModule>
```

**5. Estructura de Carpetas (asegurarse):**
```
API/
├── public/               # DocumentRoot del servidor web
│   └── index.php        # Punto de entrada
├── src/                 # Código fuente (no accesible vía web)
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── DTO/
│   └── Http/
└── config/
    └── config.ini       # ⚠️ NO subir a repositorio
```

### Testing

#### Android
```bash
./gradlew test
./gradlew connectedAndroidTest
```

#### Web
```bash
npm run test
npm run lint
```

#### API (Backend PHP)

**Test Endpoints usando cURL o Postman:**

```bash
# Registro
curl -X POST http://localhost/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","lastname":"Pérez","email":"juan@test.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","password":"SecurePass123"}'

# Obtener usuario (requiere token)
curl -X GET http://localhost/api/users/me \
  -H "Authorization: Bearer <token_aqui>"

# Crear solicitud de análisis
curl -X POST http://localhost/api/analysis-request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","region":"norte","email":"test@test.com",...}'
```

**Scripts de Test (en /API/tests/):**
```bash
bash tests/login_endpoint_test.sh
bash tests/register_endpoint_test.sh
bash tests/analysis_request_endpoint.sh
```

---

## 📚 Documentación Adicional

- [Database Schema](database/README.md) - Tablas modernas y legacy
- [API Documentation](API/README.md) - Endpoints, DTOs, Servicios, Repositorios
- [Issues & Roadmap](issues/) - Tareas y funcionalidades planificadas
- [Manual de Identidad](GeoterRA%20Manual%20de%20identidad%202024.pdf)

### Recursos Rápidos

**Backend (API):**
- Endpoints: [API/README.md - Endpoints Disponibles](API/README.md#endpoints-disponibles)
- Autenticación: [API/README.md - Token Flow](API/README.md#flujo-completo-de-ejemplo-registro-de-usuario)
- DTOs y Validación: [API/README.md - DTOs](API/README.md#dtos-data-transfer-objects)
- Repositorios: [API/README.md - Repositorios](API/README.md#repositorios)

**Base de Datos:**
- Tablas Modernas: [database/README.md - Tablas Modernas](database/README.md#tablas-modernas-refactorizado)
- Tablas Legacy: [database/README.md - Tablas Legacy](database/README.md#tablas-legacy)
- Relaciones: [database/README.md - Relaciones](database/README.md#relaciones)

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'FEAT: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

**📞 Contacto**: Para consultas técnicas, contactar al equipo de desarrollo a través de GitHub Issues.