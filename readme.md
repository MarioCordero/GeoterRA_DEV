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
- **Language**: PHP 8.x
- **Architecture**: REST API
- **Database**: MySQL/MariaDB
- **Session Management**: PHP Sessions + Tokens
- **CORS**: Configurado para multi-dominio

#### 🗄️ Base de Datos
- **Engine**: MySQL/MariaDB
- **Schema**: `GeoterRA.sql`
- **Features**: Datos geotérmicos, usuarios, solicitudes

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

#### API Setup
1. Configurar servidor web (Apache/Nginx)
2. Importar `database/GeoterRA.sql`
3. Configurar credenciales en `API/dbhandler.inc.php`

### Testing
```bash
# Android
./gradlew test
./gradlew connectedAndroidTest

# Web
npm run test
npm run lint
```

---

## 📚 Documentación Adicional

- [Database Schema](database/database.md)
- [API Documentation](API/README.md)
- [Issues & Roadmap](issues/)
- [Manual de Identidad](GeoterRA%20Manual%20de%20identidad%202024.pdf)

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