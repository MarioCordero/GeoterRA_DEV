Aquí tienes una guía completa en formato Markdown que consolida todo el proceso desde cero. Puedes guardarla como un archivo `.md` (por ejemplo, `setup_phpmyadmin_arch.md`) para tus futuras instalaciones.

---

# Guía de Configuración: Entorno Web con Apache, PHP y phpMyAdmin en Arch Linux

Esta guía detalla los pasos necesarios para configurar un entorno de desarrollo web local (Stack LAMP parcial) enfocado en hacer funcionar **phpMyAdmin** bajo **Apache** en Arch Linux, solucionando problemas comunes como la visualización de código fuente PHP o la falta de directorios de configuración.

## 1. Instalación de Paquetes Base

Asegúrate de instalar todos los componentes necesarios: el servidor web, PHP, el módulo de PHP para Apache, el motor de base de datos y phpMyAdmin.

```bash
sudo pacman -S apache php php-apache mariadb phpmyadmin

```

## 2. Configuración de PHP

phpMyAdmin requiere que ciertas extensiones de PHP estén habilitadas para funcionar correctamente.

Edita el archivo de configuración de PHP:

```bash
sudo nano /etc/php/php.ini

```

Busca las siguientes líneas y **descoméntalas** (quítales el `;` al inicio):

* `extension=bz2`
* `extension=iconv`
* `extension=mysqli`
* `extension=pdo_mysql`
* `extension=zip`

*(Alternativamente, puedes usar este comando para hacerlo automáticamente):*

```bash
sudo sed -i 's/^;extension=bz2/extension=bz2/' /etc/php/php.ini
sudo sed -i 's/^;extension=iconv/extension=iconv/' /etc/php/php.ini
sudo sed -i 's/^;extension=mysqli/extension=mysqli/' /etc/php/php.ini
sudo sed -i 's/^;extension=pdo_mysql/extension=pdo_mysql/' /etc/php/php.ini
sudo sed -i 's/^;extension=zip/extension=zip/' /etc/php/php.ini

```

## 3. Configuración de Apache para interpretar PHP

Para evitar que el navegador muestre el código fuente en texto plano, Apache necesita el módulo correcto para procesar PHP.

Abre la configuración principal de Apache:

```bash
sudo nano /etc/httpd/conf/httpd.conf

```

Realiza los siguientes **tres cambios** en este archivo:

**A. Cambiar el módulo MPM:**
El módulo de PHP en Arch usa `prefork`.

* **Comenta** esta línea (ponle un `#`):
`#LoadModule mpm_event_module modules/mod_mpm_event.so`
* **Descomenta** esta línea (quítale el `#`):
`LoadModule mpm_prefork_module modules/mod_mpm_prefork.so`

**B. Cargar el módulo PHP:**
En la lista de módulos (junto a los demás `LoadModule`), añade:

```apache
LoadModule php_module modules/libphp.so

```

**C. Incluir la configuración de PHP:**
Ve al final del archivo y añade:

```apache
Include conf/extra/php_module.conf

```

## 4. Configuración de Apache para phpMyAdmin

Debemos indicarle a Apache dónde encontrar los archivos de phpMyAdmin y cómo servirlos.

**A. Crear el archivo de configuración:**
Verifica que el directorio exista (crearlo previene el error `Directory does not exist` al usar nano):

```bash
sudo mkdir -p /etc/httpd/conf/extra
sudo nano /etc/httpd/conf/extra/phpmyadmin.conf

```

**B. Agregar las directivas:**
Pega el siguiente contenido y guarda el archivo:

```apache
Alias /phpmyadmin "/usr/share/webapps/phpMyAdmin"
<Directory "/usr/share/webapps/phpMyAdmin">
    DirectoryIndex index.php
    AllowOverride All
    Options FollowSymlinks
    Require all granted
</Directory>

```

**C. Incluir esta configuración en Apache:**
Vuelve al archivo principal de Apache:

```bash
sudo nano /etc/httpd/conf/httpd.conf

```

Al final del archivo (justo debajo de donde incluiste `php_module.conf`), añade:

```apache
Include conf/extra/phpmyadmin.conf

```

## 5. Inicialización de Servicios

Para que puedas iniciar sesión en phpMyAdmin, el motor de base de datos debe estar corriendo. *(Nota: Si es la primera vez que instalas MariaDB, primero deberás inicializar el directorio de datos con `sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql`).*

Inicia y habilita MariaDB:

```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb

```

Reinicia Apache para aplicar absolutamente todos los cambios de configuración y módulos:

```bash
sudo systemctl restart httpd

```

## 6. Verificación Final

Abre tu navegador web e ingresa a la siguiente dirección:

**`http://localhost/phpmyadmin`**

Ya deberías ver la pantalla gráfica de inicio de sesión de phpMyAdmin, lista para recibir tus credenciales de MariaDB/MySQL.