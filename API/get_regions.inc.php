<?php
    require_once 'cors.inc.php';
	session_start();
	require 'conf_sess.inc.php';

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    require_once 'dbhandler.inc.php'; // include your DB connection script

    $apiResponse = [
        "response" => "Error",
        "message" => "",
        "errors" => [],
        "data" => [],
        "debug" => []
    ];

    try {
        $stmt = $pdo->query("SELECT DISTINCT region FROM puntos_estudiados ORDER BY region");
        $regions = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $apiResponse["response"] = "Ok";
        $apiResponse["message"] = "Regiones obtenidas correctamente";
        $apiResponse["data"] = $regions;
    } catch (PDOException $e) {
        $apiResponse["message"] = "Query failed";
        $apiResponse["errors"][] = "Query failed";
        $apiResponse["debug"][] = $e->getMessage();
    }

    header('Content-Type: application/json');
    echo json_encode($apiResponse);
?>