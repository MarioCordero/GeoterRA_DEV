<!DOCTYPE html>
<html lang="en">

	<head>
			
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">

		<!--CUSTOM CSS-->
		<link rel="stylesheet" href="./assets/css/style.css">
		<link rel="stylesheet" href="./assets/css/fonts.css">
		<link rel="stylesheet" href="./assets/css/responsive.css">

		<!--ICON-->
		<link rel="shortcut icon" type="image/x-icon" href="./GeoterRA.ico">

		<title>User Register</title>

	</head>

	<body>

		<div class="general-container">

			<!-- NAVBAR -->
      <?php include './assets/partials/navbar.php'; ?>
			<!-- NAVBAR -->

			<!-- BODY -->
			<div class="register-container register-background">

				<!--------------------------------LOADER----------------------------------->
				<div class="web-loader" id="loader">
					<img src="./assets/images/GeoterRA/GeoterRA-Logo.svg" class="logoWelcome" id="logoWelcome">
					<div id="carga_pagina">

					</div>
				</div>
				<!--------------------------------END LOADER------------------------------->

				<div class="reg-user">
					<!-- REGISTER FORM -->
					<h1 class="Montserrat-SemiBold">Registrar usuario</h1>

					<form action="assets/includes/register.inc.php" method="post" id="reg-form" class="reg-user-form">
						
						<p>
							<label for="first_name" class="Poppins-Bold">Nombre</label>
							<input name="first_name" type="text" placeholder="Nombre" required>
						</p>
						
						<p>
							<label for="last_name" class="Poppins-Bold">Apellido</label>
							<input name="last_name" type="text" placeholder="Apellido" required>
						</p>

						<p>
							<label for="email" class="Poppins-Bold">Correo</label>
							<input name="email" type="text" placeholder="Correo electrónico" required>
						</p>

						<p>
							<label for="password" class="Poppins-Bold">Constraseña</label>
							<input name="password" type="password" placeholder="Contraseña" required>
						</p>
						
						<p>
							<label for="phone_num" class="Poppins-Bold">Número de teléfono</label>
							<input name="phone_num" type="text" placeholder="Teléfono" required>
						</p>
						
						<button type="submit" class="send-reg-user-form">Register</button>
						
					</form>
					<p id="result"></p>						
					<!-- REGISTER FORM -->
	
				</div>
			<!-- BODY -->
			</div>

			<!-- FOOTER -->
			<footer class="footer-container">
				<div class="footer center-text Montserrat-Regular">
					
					<p> © 2021 Instituto de Investigaciones en Ingeniería - Universidad de Costa Rica.Ciudad Universitaria Rodrigo Facio </p>
					<p> San Pedro, Montes de Oca.Tel: (506) 2511-6641 (506) 2511-6642 Fax: (506) 2224-2619 Apdo. postal: 3620-60 </p>
					<p> Correo electrónico: inii@ucr.ac.cr </p> 
					<p>Un Tema de SiteOrigin </p>
					
				</div>
			</footer>
			<!-- FOOTER -->
			

			<!-- JS INCLUDES -->
			<!-- AJAX info sent to php -->
			<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
			<script src="./assets/js/check-session.js" defer></script>

			<script src="./assets/js/send-register-php.js"></script>
			<script src="./assets/js/web-loader.js"></script>
			<script src="./assets/js/menu-bars.js"></script>

		</div>
	</body>
</html>
