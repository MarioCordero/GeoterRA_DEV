<?php
// Database connection parameters
$host = 'localhost';
$dbname = 'users';
$user = 'ch4f';
$pass = 'C1h8r0i4s';

echo "users connecetion";
try {
  $pdo = new PDO("mysql:host=$host;dbname=#$dbname, $user, $pass");
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  die("Connection failed: " . $e->getMessage());
}

?>
