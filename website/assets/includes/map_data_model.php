<?php

declare(strict_types=1);

function request_table_data(object $pdo, string $region) {
  $query = "SELECT * FROM puntos_estudiados WHERE region = :region;";
  $stmt = $pdo->prepare($query);
  $stmt->bindParam(":region", $region);
  $stmt->execute();

  $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
  return $result;
}

?>
