<?php


if ($_SERVER["REQUEST_METHOD"] === "POST") {

  // Catches the username and password
  $request_fields["point_id"] = $_POST["point_id"];
  $request_fields["email"] = $_POST["email"];
  $request_fields["region"] = "Prueba";
  $request_fields["num_telefono"] = $_POST["num_telefono"];
  $request_fields["fecha"] = $_POST["fecha"];
  $request_fields["sens_termica"] = $_POST["sens_termica"];
  $request_fields["propietario"] = $_POST["propietario"];
  $request_fields["uso_actual"] = $_POST["uso_actual"];
  $request_fields["burbujeo"] = $_POST["burbujeo"];
  $request_fields["direccion"] = $_POST["direccion"];
  // $request_fields["foto"] = $_POST["foto"];
  // $request_fields["gps"] = $_POST["gps"];
  $request_fields["coord_x"] = $_POST["lat"];
  $request_fields["coord_y"] = $_POST["lng"];

  try {
    $errors = [];
    // Brings the files for the databse connection and the MVC pattern
    // MVC: Patron modelo vista controlador
    require_once 'dbhandler.inc.php';
    require_once 'request_model.inc.php';
    require_once 'request_cont.php';

    if(!check_fields($request_fields, $errors)) {
      header("Content-Type: application/json");
      echo json_encode(['status' => 'fields_wrong', 'errors' => $errors]);
      die();
    }

    // If none of the previous errors happened it insert the user on the db
    if(insert_request($pdo, $request_fields)) {
      header("Content-Type: application/json");
      echo json_encode(['status' => 'request_created', 'errors' => $errors]);
    }

  } catch (PDOException $e) {
    header("Content-Type: application/json");
    echo json_encode(['status' => 'query_failed', 'errors' => $errors]);
  }
}

?>
