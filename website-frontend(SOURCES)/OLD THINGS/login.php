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
		<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

		<!--ICON-->
		<link rel="shortcut icon" type="image/x-icon" href="./GeoterRA.ico">

		<title>Login</title>

	</head>

	<body>

		<div class="general-container login-background">

			<!-- NAVBAR -->
      <?php include './assets/partials/navbar.php'; ?>
			<!-- NAVBAR -->

			<!-- BODY -->
			<div class="login-container">

				<!--------------------------------LOADER----------------------------------->
				<div class="web-loader" id="loader">
					<img src="./assets/images/GeoterRA/GeoterRA-Logo.svg" class="logoWelcome" id="logoWelcome">
					<div id="carga_pagina">

					</div>
				</div>
				<!--------------------------------END LOADER------------------------------->

				<div id="credential-error-container">
					<div class="error-msg Montserrat-Regular">
						<h3>Error</h3>
						<p>Credenciales incorrectas</p>
						<button id="close-error-msg" class="Montserrat-Regular">Ok</button>
					</div>
				</div>

				<div class="login Montserrat-Regular">
										
					<form id="login_form" class="login-form" action="assets/includes/login.inc.php" method="post">
						<h1 class="Montserrat-ExtraBold">Iniciar Sesión</h1>
					
						<div class="input-box Montserrat-Regular">
							<p>Correo</p>
							<input name="email" type="text" placeholder="Correo electrónico" required>
							<i class='bx bxs-user'></i>
						</div>

						<div class="input-box Montserrat-Regular">
							<p>Contraseña</p>
							<input name="password" type="password" placeholder="Contraseña" required>
							<i class='bx bxs-lock'></i>
						</div>

						<div class="remember-forgot">
							<label><input type="checkbox"> Recordar contraseña </label>
							<a href="#"> Recuperar contraseña </a>
						</div>
					
					
						<button type="submit" class="btn Montserrat-Bold">Acceder</button>
					
						<div class="register-link">
							<p>¿No tiene cuenta?
								<a href="register.php"> Registrarse </a>
							</p>
						</div>
					
					</form>
				
				</div>

				
			</div>
			<!-- BODY -->

			<!-- JS INCLUDES -->
			<!-- AJAX info sent to php -->
			<div id="result"></div>
			<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
			
			<script src="./assets/js/send-login-php.js"></script>
			<!-- <script src="./assets/js/check-session.js" defer></script> -->
			<script src="./assets/js/web-loader.js"></script>
			<script src="./assets/js/menu-bars.js"></script>

		</div>
	</body>
</html>
