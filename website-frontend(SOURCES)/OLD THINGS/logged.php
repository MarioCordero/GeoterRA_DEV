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
		<link rel="stylesheet" href="./assets/css/dist/tailwindO.css">

		<!-- CUSTOM CSS REACT -->
		<link rel="stylesheet" href="./react-components/dist/assets/css/GeoterRA-ReactComponents.css">
		<!--ICON-->
		<link rel="shortcut icon" type="image/x-icon" href="./GeoterRA.ico">

		<title id="title-page"></title>

	</head>

  	<body>
		<div class="general-container">

			<!-- NAVBAR -->
      <?php include './assets/partials/navbar.php'; ?>
			<!-- NAVBAR -->

			<!-- BODY -->
			<div class="logged-in-container Montserrat-Regular">

				<!--------------------------------LOADER----------------------------------->
				<div class="web-loader" id="loader">
					<img src="./assets/images/GeoterRA/GeoterRA-Logo.svg" class="logoWelcome" id="logoWelcome">
					<div id="carga_pagina">

					</div>
				</div>
				<!--------------------------------END LOADER------------------------------->

        <!-------------------------------- Sidebar Navigation -------------------------------->
          <div id="Sidebar-ant"></div>
        <!-------------------------------- Sidebar Navigation -------------------------------->

			<!-- FOOTER -->
			<footer class="footer-container footer-logged">
				<div class="footer center-text Montserrat-Regular">
					
					<p> © 2021 Instituto de Investigaciones en Ingeniería - Universidad de Costa Rica.Ciudad Universitaria Rodrigo Facio </p>
					<p> San Pedro, Montes de Oca.Tel: (506) 2511-6641 (506) 2511-6642 Fax: (506) 2224-2619 Apdo. postal: 3620-60 </p>
					<p> Correo electrónico: inii@ucr.ac.cr </p> 
					<p>Un Tema de SiteOrigin </p>
					
				</div>
			</footer>
			<!-- FOOTER -->

			<!-- JS INCLUDES -->
			<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
			<script src="./assets/js/check-session.js" defer></script>	
			<script src="./assets/js/web-loader.js"></script>
			<script src="./assets/js/menu-bars.js"></script>
			<script src="./assets/js/get-user-info.js"></script>
			<script src="./assets/js/logout.js"></script>
			<script src="./assets/js/section-switcher.js"></script>
			<script src="./assets/js/edit-user-info.js"></script>

			<!-- REACT INCLUDES -->
			<script src="./react-components/dist/assets/js/GeoterRA-ReactComponents.js" type="module" defer></script>
		</div>
	</body>
</html>
