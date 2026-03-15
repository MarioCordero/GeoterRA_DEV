<?php
    require_once 'cors.inc.php';
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $apiResponse = [
            "response" => "Error",
            "message" => "",
            "errors" => [],
            "data" => [],
            "debug" => []
        ];

        try {
            require_once 'dbhandler.inc.php';

            // Get all the required fields for puntos_estudiados table
            $id = $_POST['id'] ?? '';
            $region = $_POST['region'] ?? '';
            $coord_x = $_POST['coord_x'] ?? '';
            $coord_y = $_POST['coord_y'] ?? '';
            $temp = $_POST['temp'] ?? '';
            $pH_campo = $_POST['pH_campo'] ?? '';
            $cond_campo = $_POST['cond_campo'] ?? '';
            $pH_lab = $_POST['pH_lab'] ?? '';
            $cond_lab = $_POST['cond_lab'] ?? '';
            $Cl = $_POST['Cl'] ?? '';
            $Ca_plus = $_POST['Ca+'] ?? '';
            $HCO3 = $_POST['HCO3'] ?? '';
            $SO4 = $_POST['SO4'] ?? '';
            $Fe = $_POST['Fe'] ?? '';
            $Si = $_POST['Si'] ?? '';
            $B = $_POST['B'] ?? '';
            $Li = $_POST['Li'] ?? '';
            $F = $_POST['F'] ?? '';
            $Na = $_POST['Na'] ?? '';
            $K = $_POST['K'] ?? '';
            $MG_plus = $_POST['MG+'] ?? '';

            // Validate required fields
            if (empty($id) || empty($region) || empty($coord_x) || empty($coord_y)) {
                $apiResponse["message"] = "Campos requeridos faltantes";
                $apiResponse["errors"][] = "ID, región y coordenadas son obligatorios";
                header("Content-Type: application/json");
                echo json_encode($apiResponse);
                die();
            }

            // Insert into puntos_estudiados table
            $stmt = $pdo->prepare("INSERT INTO puntos_estudiados 
                (id, region, coord_x, coord_y, temp, pH_campo, cond_campo, pH_lab, cond_lab, 
                 Cl, `Ca+`, HCO3, SO4, Fe, Si, B, Li, F, Na, K, `MG+`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $result = $stmt->execute([
                $id, $region, $coord_x, $coord_y, $temp, $pH_campo, $cond_campo, $pH_lab, $cond_lab,
                $Cl, $Ca_plus, $HCO3, $SO4, $Fe, $Si, $B, $Li, $F, $Na, $K, $MG_plus
            ]);

            if ($result) {
                $apiResponse["response"] = "Ok";
                $apiResponse["message"] = "Punto aprobado y agregado exitosamente";
                $apiResponse["data"] = ["id" => $id];
            } else {
                $apiResponse["message"] = "No se pudo agregar el punto";
                $apiResponse["errors"][] = "Error al insertar en la base de datos";
            }

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
            "errors" => ["Only POST method allowed"],
            "data" => [],
            "debug" => ["method_received" => $_SERVER["REQUEST_METHOD"]]
        ]);
        die();
    }
?>