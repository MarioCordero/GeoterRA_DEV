<?php
// Iniciar sesión si aún no se ha iniciado

session_start();


// Borra la cookie de sesión si está definida
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Limpiar todas las variables de sesión
$_SESSION = [];

// Finalizar la sesión
session_destroy();

// Responder con un JSON indicando éxito
header('Content-Type: application/json');
echo json_encode(['status' => 'logged_out', 'message' => 'Sesión cerrada correctamente']);
?>
