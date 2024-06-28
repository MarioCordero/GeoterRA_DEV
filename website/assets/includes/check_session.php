<?php
    session_start();

    // Check if a specific session variable is set
    if (isset($_SESSION['user'])) {
        echo json_encode(['status' => 'logged_in']);
    } else {
        echo json_encode(['status' => 'not_logged_in']);
    }
?>
