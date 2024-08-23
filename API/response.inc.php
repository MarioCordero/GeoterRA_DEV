<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {

  // Obtains the username associated to the current session
  $request_fields["email"] = $_POST["email"];

  try {
    $errors = [];
    // Brings the files for the databse connection and the MVC pattern
    // MVC: Patron modelo vista controlador
    require_once 'dbhandler.inc.php';
    require_once 'request_model.inc.php';
    require_once 'request_cont.php';


    // If none of the previous errors happened it insert the user on the db
    if(check_email($pdo, $request_fields)) {
      header("Content-Type: application/json");
      echo json_encode(['status' => 'response_succeded', 'errors' => $errors]);
    }
    echo json_encode(['status' => 'response_failed', 'errors' => $errors]);

  } catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
  }
}

?>
