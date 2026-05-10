# Guía de Ejecución de Pruebas

Este documento explica cómo ejecutar los casos de prueba (especialmente los de Playwright para el frontend) en el proyecto GeoterRA.

## Requisitos Previos

1. Asegúrate de que el servidor de desarrollo esté corriendo:
   ```bash
   cd website
   npm run dev
   ```
   *Nota: Por defecto, los tests están configurados para apuntar a `http://localhost:5173`.*

2. Instala las dependencias si no lo has hecho:
   ```bash
   cd website
   npm install
   ```

## Ejecución de Pruebas (Playwright)

Debes estar en el directorio `website` para ejecutar estos comandos.

### 1. Ejecutar todas las pruebas (Modo Headless)
Corre todos los archivos [.spec.js](file:///home/mario/Desktop/JOB/GeoterRA_DEV/website/tests/session.spec.js) en la carpeta `tests`.
```bash
npx playwright test
```

### 2. Ejecutar con Interfaz Gráfica (Recomendado)
Abre una ventana interactiva donde puedes ver cada paso del test, hacer debug y ver capturas de pantalla.
```bash
npx playwright test --ui
```

### 3. Ejecutar un archivo específico
Si solo quieres probar el registro o la sesión:
```bash
# Para el registro
npx playwright test tests/register.spec.js

# Para la sesión
npx playwright test tests/session.spec.js
```

### 4. Ver el reporte detallado
Si los tests fallan o quieres ver el resultado después de una ejecución normal:
```bash
npx playwright show-report
```

## Notas Adicionales
- **Base de Datos**: El test de registro ([register.spec.js](file:///home/mario/Desktop/JOB/GeoterRA_DEV/website/tests/register.spec.js)) crea un usuario con un email aleatorio (usando el timestamp actual) para evitar conflictos de "email duplicado" en ejecuciones sucesivas.
- **Configuración**: Puedes ajustar navegadores y otros parámetros en [website/playwright.config.js](file:///home/mario/Desktop/JOB/GeoterRA_DEV/website/playwright.config.js).
