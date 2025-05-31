<?php
    // TODO: IMPLEMENT SECURITY MEASURES
    require_once 'cors.inc.php';
    require_once 'dbhandler.inc.php';
    $stmt = $pdo->query("SELECT DISTINCT region FROM puntos_estudiados ORDER BY region");
    $regions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    header('Content-Type: application/json');
    echo json_encode($regions);
?>