<?php

$configFilePath = __DIR__ . '/.config.ini';
$config = parse_ini_file($configFilePath, true);

$host = $config['database']['host'];
$dbname = $config['database']['name'];
$user = $config['database']['user'];
$pass = $config['database']['pass'];

try {
    // Attempt to create a PDO connection using the extracted credentials
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    // Handle the error by displaying the error message (can be logged as well)
    echo "Connection failed: " . $e->getMessage();
}


