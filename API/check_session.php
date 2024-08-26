<?php

    if (session_status() == PHP_SESSION_NONE) {
      session_start();
    }

    session_start(); // Asegúrate de iniciar la sesión

    if (isset($_SESSION['user'])) {
        echo json_encode(['status' => 'logged_in', 'user' => $_SESSION['user']]);
    } else {
        echo json_encode(['status' => 'not_logged_in']);
    }

?>
