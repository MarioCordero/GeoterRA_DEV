<?php

function insert_to_sol(object $pdo, array $request_fields)
{
  $query = "INSERT INTO solicitudes (id, region, fecha, propietario, num_telefono, direccion, uso_actual, sens_termica, burbujeo) 
           VALUES (:id, :region, :fecha, :propietario, :num_telefono, :direccion, :uso_actual, :sens_termica, :burbujeo)";
  $stmt = $pdo->prepare($query);

  $stmt->bindParam(":id", $request_fields["IDPoint"]);
  $stmt->bindParam(":region", $request_fields["region"]);
  $stmt->bindParam(":fecha", $request_fields["fecha"]);
  $stmt->bindParam(":propietario", $request_fields["propietario"]);
  $stmt->bindParam(":num_telefono", $request_fields["num_telefono"]);
  $stmt->bindParam(":direccion", $request_fields["direccion"]);
  $stmt->bindParam(":uso_actual", $request_fields["uso_actual"]);
  $stmt->bindParam(":sens_termica", $request_fields["sens_termica"]);
  $stmt->bindParam(":burbujeo", $request_fields["burbujeo"]);

  return $stmt->execute();
}

?>
