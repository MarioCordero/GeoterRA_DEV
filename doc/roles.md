# 🛡️ Sistema de Gestión de Roles y Alcances (RBAC) - GeoterRA

Para garantizar la integridad científica y la seguridad de la plataforma GeoterRA, se define una estructura de **Control de Acceso Basado en Roles (RBAC)**. El objetivo es asegurar que solo los datos verificados por personal experto sean publicados en el mapa oficial. Recordemos que GeoterRA está pensada en un inicio para ofrecer características de manera gratuita, la cuales son:

- Consulta de mapa
- Uso del form de contacto
- Uso de los filtros de capa del mapa
- Visualización de la información y exportación en PDF de la misma

---

## 👥 Definición de Roles

### 1. **User (Investigador / Técnico de Campo)**

Es el encargado de la recolección de datos primarios. Su flujo de trabajo se centra en el ingreso de información desde el campo por medio de la app móvil, no obstante, se puede hacer desde la app web sin problema alguno.

* **Creación:** Registro de nuevas "Solicitudes de Análisis" (Analysis Requests) incluyendo coordenadas, temperatura de campo, fotos y observaciones.
* **Gestión:** Capacidad de editar o eliminar sus propias solicitudes, siempre y cuando estas sigan en estado `Pendiente`.

### 2. **Admin (Coordinador Científico / Verificador)**

Actúa como el curador de los datos. Es el rol con mayor responsabilidad sobre la veracidad científica de la plataforma. es la persona que decide que información entra o no a la Aplicación final.

* **Verificación (Core):** Revisión de solicitudes pendientes. Una vez validados los datos (comparados con laboratorio), tiene el poder de **Aprobar** y convertir una solicitud en una **Manifestación Registrada**.
* **Edición Global:** Capacidad de corregir cualquier punto en el mapa (ajuste de coordenadas o valores químicos de iones).

### 3. **Maintenance (Administrador de Sistemas / DevOps)**

Encargado de la salud de la infraestructura y el rendimiento técnico de la plataforma. No interviene en la lógica científica, puede consultar y editar usuarios.

* **Infraestructura:** Monitoreo del servidor (**reforesta01**), revisión de logs de PHP y optimización de MySQL por medio de un módulo que le dará información rescatada directamente de la base de datos sin necesidad de usar otro software a modo de tratar de agilizar la depuración en caso de se necesaria.
* **Respaldo:** Ejecución de scripts de backup para asegurar la persistencia de los datos históricos.
* **Despliegue:** Supervisión del pipeline de CI/CD en GitHub Actions.
* **Gestión de Usuarios:** Creación y gestión de cuentas, asignación de roles y reseteo de credenciales.