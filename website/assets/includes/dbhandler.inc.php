<?php

// For anyone
// $host = 'localhost';
// $dbname = 'GeoterRA';
// $user = 'root';
// $pass = '';

// For Mario :D
$host = 'localhost';
$dbname = 'GeoterRA';
$user = 'mario';
$pass = '2003';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;", $user, $pass);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  die("Connection failed: " . $e->getMessage());
}
?>
