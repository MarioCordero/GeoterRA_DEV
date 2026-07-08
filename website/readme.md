# 📄 Configuración Local de GeoterRA (Linux - LAMP)

Esta guía explica cómo configurar GeoterRA en un entorno local usando Apache2 (LAMP stack) en Linux.

---

## 1. Editar el archivo `hosts`

Agregar el dominio local para tu proyecto:

```bash
sudo nano /etc/hosts
```
Añadí esta línea al final:

```
127.0.0.1    geoterra.com
```

---

## 2. Crear archivo de configuración en Apache

Moverse a la carpeta de sitios disponibles:

```bash
cd /etc/apache2/sites-available
```

Copiar tu archivo `.conf`:

```bash
sudo cp /home/mario/Desktop/geoterra.conf geoterra.conf
```

Habilitar el sitio:

```bash
sudo a2ensite geoterra.conf
```

Aplicar los cambios:

```bash
sudo systemctl restart apache2
```

---

## 3. Asignar permisos de lectura y escritura

Debido a que tu proyecto está en el Escritorio, es necesario darle permisos a Apache:

```bash
sudo chmod -R 755 /home/mario/Desktop/
sudo chown -R www-data:www-data /home/mario/Desktop/
```

(Modificar si querés otros permisos más específicos).





# Configurar `.htaccess` para ocultar `.php` en las URLs

Crear un archivo `.htaccess` en la raíz de tu proyecto con este contenido:

```apache
# Activar RewriteEngine
RewriteEngine On

# Redireccionar URLs terminadas en .php a sin .php
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^([a-zA-Z0-9_-]+)$ $1.php [L]
```

---

## 1. Habilitar `mod_rewrite` en Apache

Activar el módulo `rewrite`:

```bash
sudo a2enmod rewrite
```

Reiniciar Apache:

```bash
sudo systemctl restart apache2
```

---

## 2. Permitir `AllowOverride All`

Editar el archivo de configuración:

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

Dentro del bloque `<Directory /var/www/html>` (o el que uses), cambiar:

```apache
AllowOverride None
```
por:

```apache
AllowOverride All
```

Guardar cambios y reiniciar:

```bash
sudo systemctl restart apache2
```

---

# ⚡ Notas Adicionales

- El dominio `geoterra.com` solo funcionará en tu máquina local (por lo que agregamos en `/etc/hosts`).
- Si cambiás de carpeta el proyecto, deberías actualizar los paths en el `.conf`.
- Para usar React junto a esta configuración, debés correrlo en un servidor separado (por ejemplo `localhost:3000`) o integrarlo compilado dentro de PHP.

---


# Instalación de Tailwind y ReactJS

1. Instalar npm
sudo apt install npm
2. Instalar node js
sudo apt install node
3. ir a geoterRA_dev/website/config
npm list tailwindcss 