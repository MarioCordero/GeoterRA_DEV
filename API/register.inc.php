<?php
	require_once 'cors.inc.php';
  	session_start();
  	require 'conf_sess.inc.php';

	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

  	if ($_SERVER["REQUEST_METHOD"] === "POST") {

		// Catches the username and password
		$user_params["first_name"] = $_POST["first_name"];
		$user_params["last_name"] = $_POST["last_name"];
		$user_params["password"] = $_POST["password"];
		$user_params["email"] = $_POST["email"];
		$user_params["phone_num"] = $_POST["phone_num"];
		$user_params["rol"] = "usr";

		try {
			// Brings the files for the databse connection and the MVC pattern
			// MVC: Patron modelo vista controlador
			require_once 'dbhandler.inc.php';
			require_once 'register_model.inc.php';
			require_once 'register_cont.php';

			// Array used to catch and save all the errors
			$errors = array();

			// Checks if all of the input given by the user weren't empty
			if(params_empty($user_params)) {
				$errors["empty_input"] = "Rellene todos los campos";
			}

			// Checks if all the input on the register form are valid
			$input_validation_res = input_valid($user_params, $errors);

			// Checks if the email inputed has already been used
			if(is_email_used($pdo, $user_params["email"])) {
				$errors["email_used"] = "El correo ingresado ya ha sido utilizado";
			}

			require_once 'conf_sess.inc.php';

			// Check if there were any errors caught
			if($errors) {
				$_SESSION["error_register"] = $errors;
				header("Content-Type: application/json");
				echo json_encode($errors);
				die();
			}

			// If none of the previous errors happened it insert the user on the db
			if(insert_user($pdo, $user_params)) {
				header("Content-Type: application/json");
				echo json_encode([
					"status" => "registered",
					"message" => "Usuario registrado exitosamente"
				]);
				die();
			}

		} catch (PDOException $e) {
			header("Content-Type: application/json");
			echo json_encode([
				"status" => "error",
				"message" => "Query failed: " . $e->getMessage()
			]);
			die();
		}
		
    } else {
        header("Content-Type: application/json");
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
        die();
    }
?>