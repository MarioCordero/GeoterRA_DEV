<?php
    require_once 'cors.inc.php';
	if (session_status() == PHP_SESSION_NONE) {
        session_start();                // 2. Session start second
    }

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
	
	if ($_SERVER["REQUEST_METHOD"] === "POST") {

		$request_fields["pointId"] = $_POST["pointId"];
		$request_fields["email"] = $_POST["email"];
		$request_fields["region"] = "Prueba";
		$request_fields["contactNumber"] = $_POST["contactNumber"];
		$request_fields["fecha"] = $_POST["fecha"];
		$request_fields["sensTermica"] = $_POST["sensTermica"];
		$request_fields["propietario"] = $_POST["propietario"];
		$request_fields["usoActual"] = $_POST["usoActual"];
		$request_fields["burbujeo"] = $_POST["burbujeo"];
		$request_fields["direccion"] = $_POST["direccion"];
		$request_fields["coord_x"] = $_POST["lat"];
		$request_fields["coord_y"] = $_POST["lng"];

		$apiResponse = [
			"response" => "Error",
			"message" => "",
			"errors" => [],
			"data" => [],
			"debug" => []
		];

		try {
			$errors = [];
			require_once 'dbhandler.inc.php';
			require_once 'request_model.inc.php';
			require_once 'request_cont.php';

			if(!check_fields($request_fields, $errors)) {
				$apiResponse["message"] = "Error en los datos enviados";
				$apiResponse["errors"] = $errors;
				header("Content-Type: application/json");
				echo json_encode($apiResponse);
				die();
			}

			if(insert_request($pdo, $request_fields)) {
				$apiResponse["response"] = "Ok";
				$apiResponse["message"] = "Solicitud creada exitosamente";
				$apiResponse["data"] = [];
				header("Content-Type: application/json");
				echo json_encode($apiResponse);
				die();
			} else {
				$apiResponse["message"] = "No se pudo crear la solicitud";
				$apiResponse["errors"][] = "No se pudo crear la solicitud";
				header("Content-Type: application/json");
				echo json_encode($apiResponse);
				die();
			}

		} catch (PDOException $e) {
			$apiResponse["message"] = "Query failed";
			$apiResponse["errors"][] = "Query failed";
			$apiResponse["debug"][] = $e->getMessage();
			header("Content-Type: application/json");
			echo json_encode($apiResponse);
			die();
		}
	} else {
		header("Content-Type: application/json");
		echo json_encode([
			"response" => "Error",
			"message" => "Invalid request method",
			"errors" => ["Invalid request method"],
			"data" => [],
			"debug" => []
		]);
	die();
	}

?>