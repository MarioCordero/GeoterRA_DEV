<?php

$config = parse_ini_file('/path/to/config.ini', true);
$host = $config['database']['host'];
$dbname = $config['database']['name'];
$user = $config['database']['user'];
$pass = $config['database']['pass'];

try {
    // Attempt to create a PDO connection using the extracted credentials
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connection successful!";
    
} catch (PDOException $e) {
    // Handle the error by displaying the error message (can be logged as well)
    echo "Connection failed: " . $e->getMessage();
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
