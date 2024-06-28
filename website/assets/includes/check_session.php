<?php


// NEW

    session_start(); // Asegúrate de iniciar la sesión

    if (isset($_SESSION['user'])) {
        echo json_encode(['status' => 'logged_in', 'user' => $_SESSION['user']]);
    } else {
        echo json_encode(['status' => 'not_logged_in']);
    }

// OLD
    // Check if a specific session variable is set
    // if (isset($_SESSION['user'])) {
    //     echo json_encode(['status' => 'logged_in']);
    // } else {
    //     echo json_encode(['status' => 'not_logged_in']);
    // }
    
?>