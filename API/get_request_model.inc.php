<?php

function select_from_db(object $pdo, array $request_fields)
{
  $query = "SELECT * FROM solicitudes WHERE email = :email";
  $stmt = $pdo->prepare($query);

  $stmt->bindParam(":email", $request_fields['email']);
  $stmt->execute();

  $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
  return $results;
}

?>
