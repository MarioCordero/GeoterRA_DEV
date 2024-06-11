<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] === "POST") {

  try {
    // $region = $_POST["region"];
    $region = "Guanacaste";

    // Brings the files for the databse connection and the MVC pattern
    // MVC: Patron modelo vista controlador
    require_once 'dbhandler.inc.php';
    require_once 'map_data_model.php';
    require_once 'map_data_cont.php';

    // Array used to catch and save all the errors
    $errors = array();

    require_once 'conf_sess.inc.php';

    $values = request_points($pdo, $region);

    // Check if there were any errors caught
    if(!$errors) {
      header("Content-Type: application/json");
      foreach ($values as $value) {
        echo json_encode($value);
      }
    }

  } catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
  }
  
} else {
  header("Location: ../../login.html");
  die();
}
  
?>
