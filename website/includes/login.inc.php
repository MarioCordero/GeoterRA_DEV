<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  echo "Hello<br>";

  $username = $_POST["username"];
  $pass = $_POST["pass"];

  try {
    require_once 'dbhandler.inc.php';
    require_once 'conf_sess.inc.php';

  } catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
  }
  
} else {
  header("Location: ../login.html");
  die();
}

?>
