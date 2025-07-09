<?php
    require_once 'cors.inc.php';
	if (session_status() == PHP_SESSION_NONE) {
        session_start();                // 2. Session start second
    }

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
	if ($_SERVER["REQUEST_METHOD"] === "POST") {

	$request_fields["email"] = $_POST["email"] ?? null;

	$apiResponse = [
		"response" => "Error",
		"message" => "",
		"errors" => [],
		"data" => [],
		"debug" => []
	];

	try {
		require_once 'dbhandler.inc.php';
		require_once 'get_request_model.inc.php';
		require_once 'get_request_cont.php';

		$solicitudes = get_requests($pdo, $request_fields);

		if ($solicitudes) {
		$apiResponse["response"] = "Ok";
		$apiResponse["message"] = "Solicitudes obtenidas correctamente";
		$apiResponse["data"] = $solicitudes;
		} else {
		$apiResponse["message"] = "No se encontraron solicitudes";
		$apiResponse["errors"][] = "No se encontraron solicitudes";
		}

		header("Content-Type: application/json");
		echo json_encode($apiResponse);
		die();

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