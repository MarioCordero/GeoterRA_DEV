<?php
    require_once 'cors.inc.php';
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    
    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $apiResponse = [
            "response" => "Error",
            "message" => "",
            "errors" => [],
            "data" => [],
            "debug" => []
        ];

        try {
            require_once 'dbhandler.inc.php';

            // Get all requests from solicitudes table
            $stmt = $pdo->prepare("SELECT * FROM solicitudes ORDER BY fecha DESC");
            $stmt->execute();
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $apiResponse["response"] = "Ok";
            $apiResponse["message"] = "Solicitudes obtenidas exitosamente";
            $apiResponse["data"] = $requests;
            
            header("Content-Type: application/json");
            echo json_encode($apiResponse);
            die();

        } catch (PDOException $e) {
            $apiResponse["message"] = "Query failed";
            $apiResponse["errors"][] = "Database error";
            $apiResponse["debug"]["sql_error"] = $e->getMessage();
            header("Content-Type: application/json");
            echo json_encode($apiResponse);
            die();
        }
    } else {
        header("Content-Type: application/json");
        echo json_encode([
            "response" => "Error",
            "message" => "Invalid request method",
            "errors" => ["Only GET method allowed"],
            "data" => [],
            "debug" => ["method_received" => $_SERVER["REQUEST_METHOD"]]
        ]);
        die();
    }
?>