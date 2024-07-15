<?php
require 'conf_sess.inc.php';  // Include session configuration

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];

    try {
        $errors = [];

        require_once 'dbhandler.inc.php';
        require_once 'login_model.inc.php';
        require_once 'login_cont.php';

        if (input_empty($email, $password)) {
            $errors[] = ['type' => 'empty_input', 'message' => 'Rellene todos los campos'];
        }

        if (empty($errors) && is_email_valid($pdo, $email) && is_pass_valid($pdo, $password)) {
            $_SESSION['user'] = $email;
            header("Content-Type: application/json");
            echo json_encode(['status' => 'logged_in', 'errors' => $errors, 'session' => $_SESSION['user']]);
            die();
        } else {
            $errors[] = ['type' => 'invalid_cred', 'message' => 'Credenciales erroneas'];
        }

        if ($errors) {
            $_SESSION["error_login"] = $errors;
            header("Content-Type: application/json");
            echo json_encode(['status' => 'logged_out', 'errors' => $errors]);
            die();
        }

    } catch (PDOException $e) {
        die("Query failed: " . $e->getMessage());
    }

} else {
    die();
}
?>
