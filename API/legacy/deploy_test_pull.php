<?php
// ===========================
// Configuración
// ===========================
$SECRET_TOKEN = "MI_TOKEN_SECRETO"; // Cambia esto por un valor seguro

// ===========================
// Validar token (en GET o POST)
// ===========================
$token = $_GET['token'] ?? $_POST['token'] ?? '';
if ($token !== $SECRET_TOKEN) {
    http_response_code(403);
    echo "Token inválido";
    exit;
}

// ===========================
// Ejecutar git pull seguro
// ===========================
$script_pull = '/home/proyecto/GeoterRA_DEV/pull.sh'; // Script bash que hace git pull

if (!file_exists($script_pull)) {
    echo "Error: no se encontró el script de pull en $script_pull\n";
    exit;
}

// Ejecutar el script como usuario 'proyecto' usando sudo sin contraseña
$output = shell_exec("sudo -u proyecto $script_pull 2>&1");

// Mostrar resultados
echo "Resultado de git pull:\n";
echo $output ?: "[Sin salida]\n";
?>
