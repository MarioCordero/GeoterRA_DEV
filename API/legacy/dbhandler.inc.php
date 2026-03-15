<?php
    require_once 'cors.inc.php'; // Include CORS configuration
    $configFilePath = __DIR__ . '../../config.ini';
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
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Connection failed',
            'message' => $e->getMessage()
        ]);
        exit;
    }
?>