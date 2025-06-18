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
		<!-- CUSTOM CSS REACT -->
		<link rel="stylesheet" href="./react-components/dist/assets/css/GeoterRA-ReactComponents.css">
		<!--ICON-->
		<link rel="shortcut icon" type="image/x-icon" href="./GeoterRA.ico">

		<title>GeoterRA</title>

	</head>

	<body>

		<div class="general-container">

			<!-- NAVBAR -->
      		<?php include './assets/partials/navbar.php'; ?>
			<!-- NAVBAR -->

			<!-- BODY -->
			<div class="index-container Montserrat-Regular">

				<!--------------------------------LOADER----------------------------------->
				<div class="web-loader" id="loader">
					<img src="./assets/images/GeoterRA/GeoterRA-Logo.svg" class="logoWelcome" id="logoWelcome">
					<div id="carga_pagina">

					</div>
				</div>
				<!--------------------------------END LOADER------------------------------->

				<!-- WELCOME REACT COMPONENT -->
				<div id="Welcome-card"></div>

				<!-- ABOUT US SECTION -->
				<div id="About-us-card"></div>
				
				<!-- HOW WORKS SECTION -->					
				<div id="How-works-card"></div>
				
				<!-- CONTACT US SECTION -->
				<div class="A-container" id="contact-us">

					<!-- The principal section of contact-us -->
					<div class="contact-us">

						<div>
							<h1>Contactá con nosotros</h1>

							<p>
								Gracias por su interés en GeoterRA. Estamos aquí para ayudarle con cualquier pregunta, 
								comentario o apoyo que pueda necesitar. No dude en comunicarse con nosotros rellenando 
								este formulario:
							</p>

							<div class="contact-us-form">
								<!-- USAR FORMSPREE -->
								<form action="" method="POST" class="Montserrat-Regular">
									
									<span>
										<label>
											<p>
												Nombre
											</p>
											<input type="text" class="Montserrat-Regular" name="name" placeholder="Escribí tu nombre">
										</label>
									</span>
									
									<span>
										<label>
											<p>
												Contacto
											</p>
											<input type="text" class="Montserrat-Regular" name="contact" placeholder="Escribí tu teléfono o correo">
										</label>
									</span>
									
									<span>
										<label>
											<p>
												Mensaje
											</p>
											<textarea name="message" class="Montserrat-Regular" placeholder="Escribí un mensaje para nosotros"></textarea>
										</label>
									</span>
									
									<span>
										<button type="submit" class="Montserrat-Regular"> Enviar </button>
									</span>
									
								</form>
							</div>
						</div>
						
						<div>
							<img src="./assets/images/index-background.png" alt="">
						</div>

					</div>

					<!-- An alternative screen of how-works section -->
					<div class="contact-us-alt">

						<h1>Contactá con nosotros</h1>

						<p>
							Gracias por su interés en GeoterRA. Estamos aquí para ayudarle con cualquier pregunta, 
							comentario o apoyo que pueda necesitar. No dude en comunicarse con nosotros rellenando 
							este formulario:
						</p>

						<div>
							<div class="contact-us-form">
								<!-- USAR FORMSPREE -->
								<form action="" method="POST" class="Montserrat-Regular">
									
									<span>
										<label>
											<p>
												Nombre
											</p>
											<input type="text" class="Montserrat-Regular" name="name" placeholder="Escribí tu nombre">
										</label>
									</span>
									
									<span>
										<label>
											<p>
												Contacto
											</p>
											<input type="text" class="Montserrat-Regular" name="contact" placeholder="Escribí tu teléfono o correo">
										</label>
									</span>
									
									<span>
										<label>
											<p>
												Mensaje
											</p>
											<textarea name="message" class="Montserrat-Regular" placeholder="Escribí un mensaje para nosotros"></textarea>
										</label>
									</span>
									
									<span>
										<button type="submit" class="Montserrat-Regular"> Enviar </button>
									</span>
									
								</form>
							</div>

							<img src="./assets/images/index-background.png" alt="">
							
						</div>

					</div>

				</div>
				<!-- CONTACT US SECTION -->
				
			</div>
			<!-- BODY -->

			<!-- FOOTER -->
      <?php include './assets/partials/footer.php'; ?>
			<!-- FOOTER -->

			<!-- JS INCLUDES -->
			<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
			<script src="./assets/js/check-session.js" defer></script>

			<script src="./assets/js/web-loader.js"></script>
			<script src="./assets/js/menu-bars.js"></script>
			<!-- REACT INCLUDES -->
			<script src="./react-components/dist/assets/js/GeoterRA-ReactComponents.js" type="module" defer></script>
		</div>
	</body>
</html>
