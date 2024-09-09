<?php
require_once 'dbhandler.inc.php'; // archivo donde configuras PDO

// Establece el Content-Type para que sea JSON
header("Content-Type: application/json");

try {
    // Captura el cuerpo de la solicitud
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    // Verifica si el JSON contiene el campo 'email'
    if (!isset($input['email'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Email no proporcionado.'
        ]);
        die();
    }

    // Extrae el email del JSON
    $email = $input['email'];

    // Consulta SQL para obtener la información del usuario
    $sql = "SELECT * FROM reg_usr WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    // Verifica si se encontró el usuario
    if ($stmt->rowCount() > 0) {
        // Si el usuario existe, devuelve los datos del usuario
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            'status' => 'success',
            'user' => $user
        ]);
    } else {
        // Si no se encuentra el usuario, devolver un mensaje de error
        echo json_encode([
            'status' => 'error',
            'message' => 'Usuario no encontrado.'
        ]);
    }
} catch (PDOException $e) {
    // Manejo de errores en la conexión o consulta
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la consulta: ' . $e->getMessage()
    ]);
}
?>