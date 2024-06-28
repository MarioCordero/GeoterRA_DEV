<?php

$host = 'localhost';
$dbname = 'GeoterRA';
$credentials = [
    ['user' => 'root', 'pass' => ''],
    ['user' => 'mario', 'pass' => '2003']
];

foreach ($credentials as $cred) {
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;", $cred['user'], $cred['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $usedCred = $cred; // Guarda las credenciales exitosas
        break; // Si la conexión tiene éxito, sal del bucle
    } catch (PDOException $e) {
        // Captura la excepción si la conexión falla y continúa con el siguiente conjunto de credenciales
    }
}

if ($pdo) {
    // Aquí puedes realizar operaciones con $pdo
} else {
    die("No se pudo establecer una conexión válida con la base de datos.");
}

// Hacemos accesible la variable $usedCred fuera de este archivo
$GLOBALS['usedCred'] = $usedCred;

// For anyone
// $host = 'localhost';
// $dbname = 'GeoterRA';
// $user = 'root';
// $pass = '';

// For Mario :D
// $host = 'localhost';
// $dbname = 'GeoterRA';
// $user = 'mario';
// $pass = '2003';

// try {
//   $pdo = new PDO("mysql:host=$host;dbname=$dbname;", $user, $pass);
//   $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// } catch (PDOException $e) {
//   die("Connection failed: " . $e->getMessage());
// }

?>