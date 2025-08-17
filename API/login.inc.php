<?php
    require_once 'cors.inc.php'; 
    ini_set('session.cookie_httponly', 0); // Allow JavaScript access for debugging
    ini_set('session.cookie_secure', 0);   // Set to 0 for HTTP (localhost)
    ini_set('session.cookie_samesite', 'Lax'); 
    ini_set('session.use_cookies', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_domain', ''); // Empty for localhost
    ini_set('session.cookie_path', '/');

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }     // Only sets headers, no output

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $rawPostData = file_get_contents("php://input");
        $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
        $input = [];
        $email = '';
        $password = '';

        // Support both JSON and form-data
        if (stripos($contentType, 'application/json') !== false) {
            $input = json_decode($rawPostData, true) ?: [];
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
        } else {
            $email = $_POST["email"] ?? '';
            $password = $_POST["password"] ?? '';
        }

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
            require_once 'login_model.inc.php';

            $debug = [
                'content_type' => $contentType,
                'raw_post_data' => $rawPostData,
                'post_data' => $_POST,
                'json_input' => $input,
                'email_used' => $email,
                'password_used' => $password,
                'user_found' => null,
                'password_check_method' => null,
                'password_verified' => null,
                'password_comparison' => null,
                'input_password_bin' => null,
                'db_password_bin' => null
            ];

            if (empty($email) || empty($password)) {
                $errors[] = ['type' => 'empty_input', 'message' => 'Rellene todos los campos'];
                $apiResponse["message"] = "Faltan campos obligatorios";
            } else {
                $user = get_user_by_email($pdo, $email);
                $debug['user_found'] = $user;

                if ($user) {
                    $debug['db_password'] = $user['password'];
                    $debug['input_password'] = $password;
                    $debug['input_password_bin'] = bin2hex($password);
                    $debug['db_password_bin'] = bin2hex($user['password']);

                    // Use regex to detect bcrypt hashes, otherwise treat as plain text
                    if (preg_match('/^\$2[ayb]\$/', $user['password'])) {
                        $debug['password_check_method'] = 'hashed';
                        $passwordVerified = password_verify($password, $user['password']);
                        $debug['password_comparison'] = [
                            'input' => $password,
                            'db' => $user['password'],
                            'result' => $passwordVerified
                        ];
                    } else {
                        $debug['password_check_method'] = 'plain_text';
                        $passwordVerified = ($password === $user['password']);
                        $debug['password_comparison'] = [
                            'input' => $password,
                            'db' => $user['password'],
                            'result' => $passwordVerified
                        ];
                    }
                    $debug['password_verified'] = $passwordVerified;

                    // LOGGED PROPERLY
                    if ($passwordVerified) {
                        $_SESSION['user'] = $email;

                        // Enhanced debugging for session
                        $debug_session = [
                            'session_id_after_login' => session_id(),
                            'session_status' => session_status(),
                            'session_user_set' => isset($_SESSION['user']),
                            'session_user_value' => $_SESSION['user'] ?? null,
                            'session_data' => $_SESSION,
                            'cookies_sent' => headers_list(),
                            'session_save_path' => session_save_path(),
                            'session_name' => session_name(),
                            'php_session_id' => session_id(),
                            'server_name' => $_SERVER['SERVER_NAME'] ?? null,
                            'http_host' => $_SERVER['HTTP_HOST'] ?? null,
                            'request_uri' => $_SERVER['REQUEST_URI'] ?? null
                        ];

                        // Check if session is properly started and user is set
                        if (isset($_SESSION['user']) && $_SESSION['user'] === $email) {
                            $session_status = "Session started successfully";
                            $session_ok = true;
                        } else {
                            $session_status = "Session NOT started";
                            $session_ok = false;
                        }

                        $apiResponse["response"] = "Ok";
                        $apiResponse["message"] = "Inicio de sesión exitoso";
                        $apiResponse["data"] = [
                            "session" => $_SESSION['user'],
                            "session_ok" => $session_ok,
                            "session_status" => $session_status,
                            "debug_session" => $debug_session,  // Add this detailed session debugging
                            "user" => [
                                "email" => $user['email'],
                                "first_name" => $user['first_name'] ?? null,
                                "last_name" => $user['last_name'] ?? null,
                                "rol" => $user['rol'] ?? null
                            ]
                        ];
                        $apiResponse["errors"] = [];
                        $apiResponse["debug"] = $debug;
                        header("Content-Type: application/json");
                        echo json_encode($apiResponse);
                        die();
                    } else {
                        $errors[] = ['type' => 'invalid_cred', 'message' => 'Credenciales erroneas'];
                        $apiResponse["message"] = "Credenciales erroneas";
                    }
                } else {
                    $errors[] = ['type' => 'invalid_cred', 'message' => 'Credenciales erroneas'];
                    $apiResponse["message"] = "Credenciales erroneas";
                }
            }

            $apiResponse["errors"] = $errors;
            $apiResponse["debug"] = $debug;
            header("Content-Type: application/json");
            echo json_encode($apiResponse);
            die();

        } catch (PDOException $e) {
            $apiResponse["response"] = "Error";
            $apiResponse["message"] = "Database error";
            $apiResponse["errors"][] = "Database error";
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