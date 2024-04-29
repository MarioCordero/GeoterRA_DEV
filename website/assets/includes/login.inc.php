<?php
// Receives a post method from the request
if ($_SERVER["REQUEST_METHOD"] === "POST") {

  // Catches the username and password
  $username = $_POST["username"];
  $password = $_POST["password"];

  echo "Hola desde php, login.inc.php line 9";

  try {
    // Brings the files for the databse connection and the MVC pattern
    // MVC: Patron modelo vista controlador
    require_once 'dbhandler.inc.php';
    require_once 'login_model.inc.php';
    require_once 'login_cont.php';

    $errors = [];

    if(input_empty($username, $password)) {
      $errors["empty_input"] = "Rellene todos los campos";
    }

    if(is_username_valid($pdo, $username) && is_pass_valid($pdo, $password)) {
      // Redirects to the html with a succesful login
      echo "Hello $username<br>";
    } else {
      // Stays on the login page
      $errors["invalid_cred"] = "Credenciales erroneas";
    }

    require_once 'conf_sess.inc.php';

    if ($errors) {
      $_SESSION["error_login"] = $errors;
      header("Content-Type: application/json");
      json_encode($errors);
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
