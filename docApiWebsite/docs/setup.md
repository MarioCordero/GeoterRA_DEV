# GeoterRA Development Setup Guide

This guide will help you set up a local development environment for GeoterRA using Apache virtual hosts.

## Configuration Variables

Before starting, set these variables according to your setup:

```bash
# Project configuration - MODIFY THESE AS NEEDED
PROJECT_NAME="geoterra"
DOMAIN_NAME="geoterra.com"
PROJECT_PATH="/home/mario/Desktop/JOB/GeoterRA_DEV"
REACT_PORT="5173"
API_FOLDER="API"
WEBSITE_FOLDER="website"
```

## Prerequisites

- Apache2 web server
- Node.js and npm
- PHP (for API)

## Step 1: Install Required Apache Modules

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
```

## Step 2: Create Virtual Host Configuration

Create a new Apache configuration file:

```bash
sudo nano /etc/apache2/sites-available/${PROJECT_NAME}.conf
```

Add the following configuration (replace variables with your actual values):

```apache
<VirtualHost *:80>
    # Domain configuration
    ServerName ${DOMAIN_NAME}                    # Main domain: geoterra.com
    ServerAlias www.${DOMAIN_NAME}               # Alias: www.geoterra.com
    
    # Project root directory
    DocumentRoot ${PROJECT_PATH}                 # /home/mario/Desktop/JOB/GeoterRA_DEV
    
    # ROUTE 1: React Development Server Proxy
    # Proxies /website/ requests to React dev server
    ProxyPass /${WEBSITE_FOLDER}/ http://localhost:${REACT_PORT}/
    ProxyPassReverse /${WEBSITE_FOLDER}/ http://localhost:${REACT_PORT}/
    ProxyPreserveHost On
    # Access: http://geoterra.com/website/ → React app
    
    # ROUTE 2: API Direct Access
    # Serves PHP files directly from API folder
    Alias /${API_FOLDER} ${PROJECT_PATH}/${API_FOLDER}
    <Directory "${PROJECT_PATH}/${API_FOLDER}">
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
        Options Indexes FollowSymLinks
    </Directory>
    # Access: http://geoterra.com/API/ → PHP API
    
    # ROUTE 3: Static Files (Optional)
    # Serves built React files for production
    Alias /static ${PROJECT_PATH}/${WEBSITE_FOLDER}/dist
    <Directory "${PROJECT_PATH}/${WEBSITE_FOLDER}/dist">
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks
    </Directory>
    # Access: http://geoterra.com/static/ → Built React files
    
    # ROUTE 4: Root Directory Permissions
    # Main project directory access control
    <Directory "${PROJECT_PATH}">
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks
    </Directory>
    # Access: http://geoterra.com/ → Project root
    
    # ROUTE 5: Root Redirect (Optional)
    # Redirects root requests to React app
    RedirectMatch ^/$ /${WEBSITE_FOLDER}/
    # Access: http://geoterra.com → redirects to http://geoterra.com/website/
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/${PROJECT_NAME}_error.log
    CustomLog ${APACHE_LOG_DIR}/${PROJECT_NAME}_access.log combined
</VirtualHost>
```

**Example with actual values:**

```apache
<VirtualHost *:80>
    # Domain configuration
    ServerName geoterra.com
    ServerAlias www.geoterra.com
    
    # Project root directory
    DocumentRoot /home/mario/Desktop/JOB/GeoterRA_DEV
    
    # ROUTE 1: React Development Server Proxy
    ProxyPass /website/ http://localhost:5173/
    ProxyPassReverse /website/ http://localhost:5173/
    ProxyPreserveHost On
    
    # ROUTE 2: API Direct Access
    Alias /API /home/mario/Desktop/JOB/GeoterRA_DEV/API
    <Directory "/home/mario/Desktop/JOB/GeoterRA_DEV/API">
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
        Options Indexes FollowSymLinks
    </Directory>
    
    # ROUTE 3: Static Files (Optional)
    Alias /static /home/mario/Desktop/JOB/GeoterRA_DEV/website/dist
    <Directory "/home/mario/Desktop/JOB/GeoterRA_DEV/website/dist">
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks
    </Directory>
    
    # ROUTE 4: Root Directory Permissions
    <Directory "/home/mario/Desktop/JOB/GeoterRA_DEV">
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks
    </Directory>
    
    # ROUTE 5: Root Redirect (Optional)
    RedirectMatch ^/$ /website/
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/geoterra_error.log
    CustomLog ${APACHE_LOG_DIR}/geoterra_access.log combined
</VirtualHost>
```

## Step 3: Add Domain to Hosts File

Edit your hosts file:

```bash
sudo nano /etc/hosts
```

Add these lines (replace with your domain):

```
127.0.0.1    ${DOMAIN_NAME}           # geoterra.com
127.0.0.1    www.${DOMAIN_NAME}       # www.geoterra.com
```

**Example:**
```
127.0.0.1    geoterra.com
127.0.0.1    www.geoterra.com
```

## Step 4: Enable the Virtual Host

```bash
sudo a2ensite ${PROJECT_NAME}.conf     # geoterra.conf
sudo systemctl reload apache2
```

## Step 5: Update Vite Configuration

Your `vite.config.js` should be updated to use localhost:

```javascript
// filepath: /home/mario/Desktop/JOB/GeoterRA_DEV/website/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),                          
  ],
  server: {
    host: 'localhost',  // Changed from 'geoterra.com'
    port: 5173,         // Must match REACT_PORT variable
    cors: true
  }
})
```

## Step 6: Start Development Servers

1. **Start React development server**:
```bash
cd ${PROJECT_PATH}/${WEBSITE_FOLDER}   # /home/mario/Desktop/JOB/GeoterRA_DEV/website
npm run dev
```

2. **Ensure Apache is running**:
```bash
sudo systemctl status apache2
sudo systemctl start apache2  # if not running
```

## Step 7: Access Your Application

Based on the route configuration:

| Route | URL | Description |
|-------|-----|-------------|
| **Root** | `http://${DOMAIN_NAME}/` | Redirects to React app |
| **React App** | `http://${DOMAIN_NAME}/${WEBSITE_FOLDER}/` | Proxied React development server |
| **API** | `http://${DOMAIN_NAME}/${API_FOLDER}/` | Direct PHP API access |
| **Static Files** | `http://${DOMAIN_NAME}/static/` | Built React files (production) |
| **Dev Server** | `http://localhost:${REACT_PORT}` | Direct React dev server access |

**Example URLs:**
- **Main site**: http://geoterra.com/
- **React app**: http://geoterra.com/website/
- **API**: http://geoterra.com/API/
- **Static files**: http://geoterra.com/static/
- **Direct dev server**: http://localhost:5173

## Troubleshooting

### If Apache won't start:
```bash
sudo apache2ctl configtest
sudo systemctl status apache2
```

### Check Apache error logs:
```bash
sudo tail -f /var/log/apache2/${PROJECT_NAME}_error.log
```

### If permissions are denied:
```bash
sudo chown -R www-data:www-data ${PROJECT_PATH}/${API_FOLDER}
sudo chmod -R 755 ${PROJECT_PATH}
```

### Test virtual host configuration:
```bash
curl -H "Host: ${DOMAIN_NAME}" http://localhost/${API_FOLDER}/
```

## API Configuration

Make sure your API configuration in `website/src/config/apiConf.jsx` uses the virtual host:

```javascript
const API_CONFIG = {
  environment: 'local',
  baseUrls: {
    production: 'http://163.178.171.105/API',
    local: 'http://${DOMAIN_NAME}/${API_FOLDER}'  // http://geoterra.com/API
  }
};
```

## Customization Guide

To adapt this setup for different projects, modify these key variables:

### Basic Configuration
```bash
PROJECT_NAME="myproject"           # Apache config filename
DOMAIN_NAME="myapp.local"         # Local development domain
PROJECT_PATH="/path/to/project"   # Absolute project path
REACT_PORT="3000"                 # React dev server port
API_FOLDER="api"                  # API directory name
WEBSITE_FOLDER="frontend"         # React app directory name
```

### Advanced Route Customization
- **Change API endpoint**: Modify `Alias /${API_FOLDER}` line
- **Change React proxy**: Modify `ProxyPass /${WEBSITE_FOLDER}/` line
- **Add new routes**: Add more `Alias` or `ProxyPass` directives
- **Change root behavior**: Modify `RedirectMatch ^/$` line

## Notes

- The virtual host setup eliminates CORS issues between React and PHP API
- Both frontend and backend appear to run on the same domain
- React development server runs on localhost but is proxied through Apache
- API requests go directly to Apache, which serves PHP files
- Route configuration is modular and easily customizable

This setup provides a production-like environment for development while maintaining hot-reload capabilities for React.