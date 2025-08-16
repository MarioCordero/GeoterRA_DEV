<?php
    require_once 'cors.inc.php';
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

      if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $user_params["first_name"] = $_POST["first_name"];
        $user_params["last_name"] = $_POST["last_name"];
        $user_params["password"] = $_POST["password"];
        $user_params["email"] = $_POST["email"];
        $user_params["phone_num"] = $_POST["phone_num"];
        $user_params["rol"] = "usr";

        // Prepare protocol response structure
        $apiResponse = [
            "response" => "Error",
            "message" => "",
            "errors" => [],
            "data" => [],
            "debug" => []
        ];

        try {
            require_once 'dbhandler.inc.php';
            require_once 'register_model.inc.php';
            require_once 'register_cont.php';

            $errors = array();

            if(params_empty($user_params)) {
                $errors["empty_input"] = "Rellene todos los campos";
            }

            $input_validation_res = input_valid($user_params, $errors);

            if(is_email_used($pdo, $user_params["email"])) {
                $errors["email_used"] = "El correo ingresado ya ha sido utilizado";
            }


            if($errors) {
                $_SESSION["error_register"] = $errors;
                $apiResponse["response"] = "Error";
                $apiResponse["message"] = "Error en los datos enviados";
                $apiResponse["errors"] = $errors;
                header("Content-Type: application/json");
                echo json_encode($apiResponse);
                die();
            }

            if(insert_user($pdo, $user_params)) {
                $apiResponse["response"] = "Ok";
                $apiResponse["message"] = "Usuario registrado exitosamente";
                $apiResponse["data"] = [];
                header("Content-Type: application/json");
                echo json_encode($apiResponse);
                die();
            } else {
                $apiResponse["response"] = "Error";
                $apiResponse["message"] = "No se pudo registrar el usuario";
                $apiResponse["errors"][] = "No se pudo registrar el usuario";
                header("Content-Type: application/json");
                echo json_encode($apiResponse);
                die();
            }

        } catch (PDOException $e) {
            $apiResponse["response"] = "Error";
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