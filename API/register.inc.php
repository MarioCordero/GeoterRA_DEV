<?php
    require_once 'cors.inc.php';
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

      if ($_SERVER["REQUEST_METHOD"] === "POST") {

        // Handle multiple first names - clean and validate
        $first_name = isset($_POST["first_name"]) ? trim($_POST["first_name"]) : "";
        if (!empty($first_name)) {
            // Remove extra spaces and keep only letters, spaces, hyphens, and apostrophes
            $first_name = preg_replace('/\s+/', ' ', $first_name); // Replace multiple spaces with single space
            $first_name = preg_replace('/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-\']/u', '', $first_name); // Remove invalid characters
            $first_name = trim($first_name);
        }
        
        $user_params["first_name"] = $first_name;
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

            // Additional validation for first_name field
            if (!empty($user_params["first_name"])) {
                // Check if name contains only valid characters
                if (!preg_match('/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-\']+$/u', $user_params["first_name"])) {
                    $errors["invalid_first_name"] = "El nombre contiene caracteres inválidos";
                }
                
                // Check minimum length
                if (strlen($user_params["first_name"]) < 2) {
                    $errors["short_first_name"] = "El nombre debe tener al menos 2 caracteres";
                }
                
                // Check maximum length
                if (strlen($user_params["first_name"]) > 100) {
                    $errors["long_first_name"] = "El nombre es demasiado largo";
                }
            }

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