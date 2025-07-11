<?php
    require_once 'cors.inc.php';
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // Initialize API response structure
    $apiResponse = [
        "response" => "Error",
        "message" => "",
        "errors" => [],
        "data" => [],
        "debug" => []
    ];

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        $apiResponse["message"] = "Invalid request method";
        $apiResponse["errors"][] = "Invalid request method";
        header("Content-Type: application/json");
        echo json_encode($apiResponse);
        exit;
    }

    // Debug session information
    $apiResponse["debug"][] = "Session ID: " . session_id();
    $apiResponse["debug"][] = "Session user set: " . (isset($_SESSION['user']) ? "yes" : "no");
    $apiResponse["debug"][] = "Session user value: " . ($_SESSION['user'] ?? 'null');

    // Check if user is logged in
    if (!isset($_SESSION['user'])) {
        $apiResponse["message"] = "Unauthorized access - No user session";
        $apiResponse["errors"][] = "User not logged in";
        header("Content-Type: application/json");
        echo json_encode($apiResponse);
        exit;
    }

    try {
        require_once 'dbhandler.inc.php';

        // Check if user is admin
        $user_email = $_SESSION['user'];
        $stmt = $pdo->prepare("SELECT rol FROM reg_usr WHERE email = ?");
        $stmt->execute([$user_email]);
        $user_data = $stmt->fetch();

        if (!$user_data || $user_data['rol'] !== 'admin') {
            $apiResponse["message"] = "Unauthorized access - Admin privileges required";
            $apiResponse["errors"][] = "Admin privileges required";
            $apiResponse["debug"][] = "User role: " . ($user_data['rol'] ?? 'not found');
            header("Content-Type: application/json");
            echo json_encode($apiResponse);
            exit;
        }

        $apiResponse["debug"][] = "Admin access granted for user: " . $user_email;

        // Validate required fields
        if (!isset($_POST['id_soli']) || empty($_POST['id_soli'])) {
            $apiResponse["message"] = "Request ID is required";
            $apiResponse["errors"][] = "Request ID is required";
            header("Content-Type: application/json");
            echo json_encode($apiResponse);
            exit;
        }

        $id_soli = intval($_POST['id_soli']);
        $apiResponse["debug"][] = "Attempting to delete request ID: $id_soli";

        // Verify the request exists before attempting to delete
        $checkStmt = $pdo->prepare("SELECT id_soli FROM solicitudes WHERE id_soli = ?");
        $checkStmt->execute([$id_soli]);
        
        if (!$checkStmt->fetch()) {
            $apiResponse["message"] = "Request not found";
            $apiResponse["errors"][] = "Request not found";
            $apiResponse["debug"][] = "Request ID: $id_soli does not exist in database";
            header("Content-Type: application/json");
            echo json_encode($apiResponse);
            exit;
        }

        // Prepare and execute delete statement
        $stmt = $pdo->prepare("DELETE FROM solicitudes WHERE id_soli = ?");
        $result = $stmt->execute([$id_soli]);

        if ($result && $stmt->rowCount() > 0) {
            $apiResponse["response"] = "Ok";
            $apiResponse["message"] = "Request deleted successfully";
            $apiResponse["data"] = ["deleted_id" => $id_soli];
            $apiResponse["errors"] = [];
            $apiResponse["debug"][] = "Successfully deleted request ID: $id_soli";
        } else {
            $apiResponse["message"] = "Failed to delete request";
            $apiResponse["errors"][] = "No rows affected during deletion";
            $apiResponse["debug"][] = "Request ID: $id_soli - Delete operation returned no affected rows";
        }

        header("Content-Type: application/json");
        echo json_encode($apiResponse);

    } catch (PDOException $e) {
        $apiResponse["message"] = "Database error";
        $apiResponse["errors"][] = "Database error";
        $apiResponse["debug"][] = $e->getMessage();
        header("Content-Type: application/json");
        echo json_encode($apiResponse);
    } catch (Exception $e) {
        $apiResponse["message"] = "Failed to delete request";
        $apiResponse["errors"][] = $e->getMessage();
        $apiResponse["debug"][] = $e->getMessage();
        header("Content-Type: application/json");
        echo json_encode($apiResponse);
    }
?>