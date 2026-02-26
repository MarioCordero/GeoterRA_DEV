<?php
require_once 'cors.inc.php'; // Include CORS configuration
// test_db_connection.php

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // Load configuration
    $configFilePath = __DIR__ . '/config.ini';
    if (!file_exists($configFilePath)) {
        throw new Exception("Config file not found at: $configFilePath");
    }
    
    $config = parse_ini_file($configFilePath, true);
    if (!$config) {
        throw new Exception("Failed to parse config file");
    }

    // Extract database credentials
    $host = $config['database']['host'] ?? 'localhost';
    $dbname = $config['database']['name'] ?? '';
    $user = $config['database']['user'] ?? '';
    $pass = $config['database']['pass'] ?? '';

    // Test MySQL connection
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Test query
    $stmt = $pdo->query("SELECT 1 AS connection_test");
    $result = $stmt->fetch();
    
    // Check MySQL user permissions
    $stmt = $pdo->query("SELECT user, host FROM mysql.user WHERE user = '$user'");
    $users = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'connection_test' => $result['connection_test'],
        'mysql_users' => $users,
        'config' => [
            'host' => $host,
            'dbname' => $dbname,
            'user' => $user,
            'pass' => '***' // Don't expose password in output
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => get_class($e),
        'message' => $e->getMessage(),
        'config_file_path' => $configFilePath,
        'config_file_exists' => file_exists($configFilePath),
        'config_file_readable' => is_readable($configFilePath)
    ], JSON_PRETTY_PRINT);
}