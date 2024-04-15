<?php
// Receives a post method from the request
if ($_SERVER["REQUEST_METHOD"] === "POST") {

  // Catches the username and password
  $username = $_POST["username"];
  $password = $_POST["password"];

  try {
    // Brings the files for the databse connection and the MVC pattern
    // MVC: Patron modelo vista controlador
    require_once 'dbhandler.inc.php';
    require_once 'login_model.inc.php';
    require_once 'login_cont.php';

    if(input_empty($username, $password)) {
    }
    if(is_username_valid($pdo, $username) && is_pass_valid($pdo, $password)) {
      // Redirects to the html with a succesful login
      echo "Hello $username<br>";
    } else {
      // Stays on the login page
      echo "Invalid Credentials<br>";
    }

  } catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
  }
  
} else {
  header("Location: ../login.html");
  die();
}

?>
