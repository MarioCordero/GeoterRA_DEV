<?php
    // Receives a post method from the request
    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        // Catches the username and password
        $email = $_POST["email"];
        $password = $_POST["password"];

        try {
            // Brings the files for the databse connection and the MVC pattern
            // MVC: Patron modelo vista controlador
            require_once 'dbhandler.inc.php';
            require_once 'login_model.inc.php';
            require_once 'login_cont.php';


            $errors = [];

            if(input_empty($email, $password)) {
                $errors["empty_input"] = "Rellene todos los campos";
            }

            require_once 'conf_sess.inc.php';

            //The credentials are ok
            if(is_email_valid($pdo, $email) && is_pass_valid($pdo, $password)) {
                $_SESSION['user'] = $email;
                // Resends the info back to login.html
                header("Content-Type: application/json");
                echo json_encode($errors);
                die();
            } else {
                $errors["invalid_cred"] = "Credenciales erroneas";
            }

            if ($errors) {
                $_SESSION["error_login"] = $errors;
                header("Content-Type: application/json");
                echo json_encode($errors);
                die();
            }

        } catch (PDOException $e) {
            die("Query failed: " . $e->getMessage());
        }

    } else {
        header("Location: ../../login.html");
        die();
    }
?>
