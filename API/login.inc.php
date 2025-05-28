<?php
    require_once 'cors.inc.php';
    session_start();
    require 'conf_sess.inc.php';

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

                    if ($passwordVerified) {
                        $_SESSION['user'] = $email;
                        header("Content-Type: application/json");
                        echo json_encode([
                            'status' => 'logged_in',
                            'errors' => $errors,
                            'session' => $_SESSION['user'],
                            'debug' => $debug
                        ]);
                        die();
                    } else {
                        $errors[] = ['type' => 'invalid_cred', 'message' => 'Credenciales erroneas'];
                    }
                } else {
                    $errors[] = ['type' => 'invalid_cred', 'message' => 'Credenciales erroneas'];
                }
            }

            // Output errors and debug info
            header("Content-Type: application/json");
            echo json_encode([
                'status' => 'logged_out',
                'errors' => $errors,
                'debug' => $debug
            ]);
            die();

        } catch (PDOException $e) {
            header("Content-Type: application/json");
            echo json_encode([
                'status' => 'error',
                'message' => 'Database error',
                'error_details' => $e->getMessage()
            ]);
            die();
        }
    } else {
        header("Content-Type: application/json");
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
        die();
    }
?>