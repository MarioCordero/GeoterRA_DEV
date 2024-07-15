<?php

	error_reporting(E_ALL);
	ini_set('display_errors', 1);

	if ($_SERVER["REQUEST_METHOD"] === "POST") {
		try {
			// Verify if the region was send by POST method
			if (isset($_POST["region"])) {
				$region = $_POST["region"];
			} else {
				throw new Exception("No region provided");
			}

			// Brings the files for the databse connection and the MVC pattern
			// MVC: Patron modelo vista controlador
			require_once 'dbhandler.inc.php';
			require_once 'map_data_model.php';
			require_once 'map_data_cont.php';

			// Array used to catch and save all the errors
			$errors = array();

			require_once 'conf_sess.inc.php';

			//Verify if the region exists in the DB
			if (!region_exists($pdo, $region)) {
				throw new Exception("Region not found");
			}

			$values = request_points($pdo, $region);

			// Check if there were any errors caught
			if(!$errors) {
				header("Content-Type: application/json");
				echo json_encode($values);
				
			}

		} catch (PDOException $e) {
			die(json_encode(["error" => "Query failed: " . $e->getMessage()]));
		} catch (Exception $e) {
			die(json_encode(["error" => $e->getMessage()]));
		}
	
	} else {
		//header("Location: ../../login.html");
		die();
	}

	// Function to verify if the regions exists in the DB
	function region_exists($pdo, $region) {
		// A string that contains the query
		$query = "SELECT COUNT(*) FROM `puntos_estudiados` WHERE region = :region";
		// Prepare the query
		$stmt = $pdo->prepare($query);
		// Bind the parameter given with the region col
		$stmt->bindParam(':region', $region, PDO::PARAM_STR);
		// Execute the query
		$stmt->execute();
		// Return a boolen to answer the question, the region exists?
		// In other words, count if the rows with the region param are greater than 0
		return $stmt->fetchColumn() > 0;
	}
?>
