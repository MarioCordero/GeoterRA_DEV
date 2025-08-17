<?php
    require_once 'cors.inc.php';
    if (session_status() == PHP_SESSION_NONE) {
        session_start();                // 2. Session start second
    }

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    require_once 'dbhandler.inc.php'; // include your DB connection script

    // Debug information
    $debug = [
        'session_id' => session_id(),
        'session_status' => session_status(),
        'session_data' => $_SESSION,
        'cookies_received' => $_COOKIE,
        'session_user_set' => isset($_SESSION['user']),
        'session_user_value' => $_SESSION['user'] ?? null,
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'post_data' => $_POST
    ];

    $apiResponse = [
        "response" => "Error",
        "message" => "",
        "errors" => [],
        "data" => [],
        "debug" => $debug
    ];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = $_POST['email'] ?? null;

        if (!empty($email)) {
            try {
                $stmt = $pdo->prepare("SELECT first_name, last_name, email, phone_number, rol FROM reg_usr WHERE email = :email");
                $stmt->bindParam(':email', $email);
                $stmt->execute();

                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    $apiResponse["response"] = "Ok";
                    $apiResponse["message"] = "Usuario encontrado";
                    $apiResponse["data"] = [
                        "name" => $user['first_name'] . ' ' . $user['last_name'],
                        "email" => $user['email'],
                        "phone" => $user['phone_number'],
                        "rol" => $user['rol']
                    ];
                } else {
                    $apiResponse["message"] = "Usuario no encontrado";
                    $apiResponse["errors"][] = "Usuario no encontrado";
                }
            } catch (PDOException $e) {
                $apiResponse["message"] = "Database error";
                $apiResponse["errors"][] = "Database error";
                $apiResponse["debug"]["db_error"] = $e->getMessage();
            }
        } else {
            $apiResponse["message"] = "Email is required";
            $apiResponse["errors"][] = "Email is required";
        }
    } else {
        $apiResponse["message"] = "Invalid request method";
        $apiResponse["errors"][] = "Invalid request method";
    }

    header('Content-Type: application/json');
    echo json_encode($apiResponse);
?>