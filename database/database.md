<h1>Como usar esta base de datos</h1>

> Paso 1 tener lamp
> Linux:
> Instalar LAMP (Revise los comentarios de este MD)
<!-- 

Install LAMP native in linux

- [] https://www.youtube.com/watch?v=ocwukh0gs8w&t=400s
In synaptics install

apache2
mysql-server
mysql-client
phpmyadmin

https://www.youtube.com/watch?v=MX4a8HSPR_8
CREAR USUARIO PARA PHPMYADMIN

sudo mysql -u root -p

CREATE USER 'USER'@'%' IDENTIFIED BY 'PASSWORD';

In this case
User:       USER
Password:   PASSWORD

GRANT ALL PRIVILEGES ON * . * TO 'USER'@'%';

 -->

> Windows:
> Tener Xammp (https://www.apachefriends.org/)

> <h2>Una vez con todo bien instalado</h2>
> 
> 1. Entrar a PHPMyAdmin (http://localhost/phpmyadmin/index.php) [Debe estar todo bien instalado]
> 2. Ingresar a la base de datos
> 3. Crear una nueva base de datos con el nombre "GeoterRA"
> 4. Importar el archivo SQL que está en este directorio