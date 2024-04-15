<?php

declare(strict_types=1);

function get_user(object $pdo, string $username)
{
  $query = "SELECT username FROM reg_usr WHERE username = :username;";
  $stmt = $pdo->prepare($query);
  $stmt->bindParam(":username", $username);
  $stmt->execute();

  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  return $result;
}

function get_pass(object $pdo, string $password)
{
  $query = "SELECT password FROM reg_usr WHERE password = :password;";
  $stmt = $pdo->prepare($query);
  $stmt->bindParam(":password", $password);
  $stmt->execute();

  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  return $result;
}

?>
