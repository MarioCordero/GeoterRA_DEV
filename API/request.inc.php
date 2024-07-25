<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {

  // Catches the username and password
  $request_fields["IDPoint"] = $_POST["point_id"];
  $request_fields["region"] = $_POST["region"];
  $request_fields["fecha"] = $_POST["date"];

  $request_fields["propietario"] = $_POST["owner"];
  $request_fields["uso_actual"] = $_POST["current_usage"];
  $request_fields["direccion"] = $_POST["address"];
  $request_fields["num_telefono"] = $_POST["contact_number"];     

  $request_fields["gps"] = $_POST["coordinates"];

  $request_fields["sens_termica"] = $_POST["thermal_sensation"];
  $request_fields["burbujeo"] = $_POST["bubbles"];

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
