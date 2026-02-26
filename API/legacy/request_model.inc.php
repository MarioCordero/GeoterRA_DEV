<?php

function insert_to_sol(object $pdo, array $request_fields)
{

  $query = "INSERT INTO solicitudes (email, region, fecha, propietario, num_telefono, coord_x, coord_y, direccion, uso_actual, sens_termica, burbujeo) 
           VALUES (:email, :region, :fecha, :propietario, :num_telefono, :coord_x, :coord_y, :direccion, :uso_actual, :sens_termica, :burbujeo)";
  $stmt = $pdo->prepare($query);
  
  $stmt->bindParam(":email", $request_fields['email']);
  $stmt->bindParam(":region", $request_fields["region"]);
  $stmt->bindParam(":fecha", $request_fields["fecha"]);

  $stmt->bindParam(":propietario", $request_fields["propietario"]);
  $stmt->bindParam(":uso_actual", $request_fields["usoActual"]);
  $stmt->bindParam(":direccion", $request_fields["direccion"]);
  $stmt->bindParam(":num_telefono", $request_fields["contactNumber"]);

  $stmt->bindParam(":coord_x", $request_fields["coord_x"]);
  $stmt->bindParam(":coord_y", $request_fields["coord_y"]);

  $stmt->bindParam(":sens_termica", $request_fields["sensTermica"]);
  $stmt->bindParam(":burbujeo", $request_fields["burbujeo"]);

  return $stmt->execute();
}

?>