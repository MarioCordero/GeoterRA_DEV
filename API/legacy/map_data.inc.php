<?php
	require_once 'cors.inc.php';
	if (session_status() == PHP_SESSION_NONE) {
        session_start();                // 2. Session start second
    }

	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

	if ($_SERVER["REQUEST_METHOD"] === "POST") {

		$apiResponse = [
			"response" => "Error",
			"message" => "",
			"errors" => [],
			"data" => [],
			"debug" => []
		];

		try {
			// Verify if the region was sent by POST method
			if (isset($_POST["region"])) {
				$region = $_POST["region"];
			} else {
				throw new Exception("No region provided");
			}

			require_once 'dbhandler.inc.php';
			require_once 'map_data_model.php';
			require_once 'map_data_cont.php';

			//Verify if the region exists in the DB
			if (!region_exists($pdo, $region)) {
				$apiResponse["message"] = "Region not found";
				$apiResponse["errors"][] = "Region not found";
				header("Content-Type: application/json");
				echo json_encode($apiResponse);
				die();
			}

			$values = request_points($pdo, $region);

			$apiResponse["response"] = "Ok";
			$apiResponse["message"] = "Datos obtenidos correctamente";
			$apiResponse["data"] = $values;
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
		} catch (Exception $e) {
			$apiResponse["message"] = $e->getMessage();
			$apiResponse["errors"][] = $e->getMessage();
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

	// Function to verify if the region exists in the DB
	function region_exists($pdo, $region) {
		$query = "SELECT COUNT(*) FROM `puntos_estudiados` WHERE region = :region";
		$stmt = $pdo->prepare($query);
		$stmt->bindParam(':region', $region, PDO::PARAM_STR);
		$stmt->execute();
		return $stmt->fetchColumn() > 0;
	}
?>