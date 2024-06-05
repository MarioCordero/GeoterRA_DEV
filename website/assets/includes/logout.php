<?php
    session_start();
    // Elimina todas las variables de sesión
    session_unset();
    // Destruye la sesión
    session_destroy();
?>