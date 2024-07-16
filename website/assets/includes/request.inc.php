<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {

  // Catches the username and password
  $request_fields["pointId"] = $_POST["pointId"];
  $request_fields["contactNumber"] = $_POST["contactNumber"];
  $request_fields["fecha"] = $_POST["fecha"];
  $request_fields["sens_termica"] = $_POST["sens_termica"];
  $request_fields["propietario"] = $_POST["propietario"];
  $request_fields["usoActual"] = $_POST["usoActual"];
  $request_fields["burbujeo"] = $_POST["burbujeo"];
  $request_fields["direccion"] = $_POST["direccion"];
  $request_fields["foto"] = $_POST["foto"];
  $request_fields["gps"] = $_POST["gps"];

  try {
    $errors = [];
    // Brings the files for the databse connection and the MVC pattern
    // MVC: Patron modelo vista controlador
    require_once 'dbhandler.inc.php';
    require_once 'request_model.inc.php';
    require_once 'request_cont.php';

    if(check_fields($request_fields, $errors)) {
      echo json_encode(['status' => 'fields_wrong', 'errors' => $errors]);
      die();
    }

    // If none of the previous errors happened it insert the user on the db
    if(insert_request($pdo, $request_fields)) {
      header("Content-Type: application/json");
      echo json_encode(['status' => 'request_created', 'errors' => $errors]);
    }

  } catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
  }
}

?>
