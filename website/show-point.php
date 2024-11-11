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

		<title>LOCATION: xxxxxx</title>

	</head>

  	<body>

			<!-- NAVBAR -->
      <?php include './assets/partials/navbar.php'; ?>
			<!-- NAVBAR -->

			<!-- BODY -->
			<div class="show-point-container Montserrat-Regular">

				<!--------------------------------LOADER----------------------------------->
				<div class="web-loader" id="loader">
					<img src="./assets/images/GeoterRA/GeoterRA-Logo.svg" class="logoWelcome" id="logoWelcome">
					<div id="carga_pagina"></div>
				</div>
				<!--------------------------------END LOADER------------------------------->

				<div class="show-point-container-info Montserrat-Regular">

					<p id="resultChanged"></p>

					<h1>Información del Punto</h1>
					<form id="point-form">
						<label for="point-id">ID:</label>
						<input type="text" id="point-id" readonly>
			
						<label for="region">Región:</label>
						<input type="text" id="region" readonly>
			
						<label for="coord-x">Coordenada X:</label>
						<input type="text" id="coord-x" readonly>
			
						<label for="coord-y">Coordenada Y:</label>
						<input type="text" id="coord-y" readonly>
			
						<label for="temp">Temperatura:</label>
						<input type="text" id="temp" readonly>
			
						<label for="ph-campo">pH (Campo):</label>
						<input type="text" id="ph-campo" readonly>
			
						<label for="cond-campo">Conductividad (Campo):</label>
						<input type="text" id="cond-campo" readonly>
			
					</form>

					<svg id="piperDiagram" width="600" height="600"></svg>

					<button id="export-pdf">Exportar a PDF</button>

					
				</div>

			</div>
			<!-- BODY -->

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
			<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
			<script src="https://d3js.org/d3.v7.min.js"></script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js"></script>
			
			<script src="./assets/js/check-session.js" defer></script>
			<script src="./assets/js/web-loader.js"></script>
			<script src="./assets/js/show-point.js"></script>
			<script src="./assets/js/menu-bars.js"></script>
			
	</body>
</html>
