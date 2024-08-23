<?php

function select_from_dbj(object $pdo, array $request_fields)
{
  $query = "SELECT * FROM solicitudes WHERE email = :email";
  $stmt = $pdo->prepare($query);

  $stmt->bindParam(":email", $request_fields["email"]);
  return $stmt->execute();
}

?>
