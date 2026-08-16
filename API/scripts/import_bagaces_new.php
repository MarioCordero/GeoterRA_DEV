#!/usr/bin/env php
<?php
/**
 * Import Bagaces test data from CSV file using repositories.
 * Coordinates are assumed to be already in WGS84 (Latitude, Longitude).
 * If a site already exists, its coordinates are updated.
 */

declare(strict_types=1);

// Autoloader
$autoloadPaths = [
  __DIR__ . '/../vendor/autoload.php',
  __DIR__ . '/vendor/autoload.php',
];
$autoloadFound = false;
foreach ($autoloadPaths as $path) {
  if (file_exists($path)) {
    require_once $path;
    $autoloadFound = true;
    break;
  }
}
if (!$autoloadFound) {
  fwrite(STDERR, "Autoloader no encontrado. Ejecute 'composer install'.\n");
  exit(1);
}

use Repositories\GeomanifestationRepository;
use Repositories\InsituTestRepository;
use Repositories\InlabTestRepository;
use Repositories\GeoreportRepository;
use Core\UlidGenerator;
use DTO\RegisterInsituTestDTO;
use DTO\RegisterInlabTestDTO;
use DTO\RegisterGeoreportDTO;

// Códigos SNIT territoriales fijados para Bagaces, Guanacaste
$snitConfig = [
  'province_snit_code' => 5,     // Guanacaste
  'canton_snit_code'   => 504,   // Bagaces
  'district_snit_code' => 50401, // Bagaces
];

// Conexión a Base de Datos
$configPaths = [
  __DIR__ . '/../config/database.php',
  __DIR__ . '/config/database.php',
];
$pdo = null;
foreach ($configPaths as $path) {
  if (file_exists($path)) {
    $pdo = require $path;
    break;
  }
}
if (!$pdo) {
  fwrite(STDERR, "Conexión a la base de datos no encontrada.\n");
  exit(1);
}

// Obtener o crear usuario del sistema
$stmt = $pdo->query("SELECT user_id FROM users WHERE role = 'admin' AND email = 'system@geoterra.com' LIMIT 1");
$systemUserId = $stmt->fetchColumn();
if (!$systemUserId) {
  $passwordHash = password_hash('System@123', PASSWORD_DEFAULT);
  $userId = UlidGenerator::generate();
  $stmt = $pdo->prepare("INSERT INTO users (user_id, email, first_name, last_name, password_hash, role, is_deleted, is_verified) 
                           VALUES (:id, 'system@geoterra.com', 'System', 'Importer', :hash, 'admin', 0, 1)");
  $stmt->execute([':id' => $userId, ':hash' => $passwordHash]);
  $systemUserId = $userId;
  echo "Usuario administrador de sistema creado: $systemUserId\n";
}
echo "Usando ID de usuario: $systemUserId\n";

// Inicializar Repositorios
$geomanifestationRepo = new GeomanifestationRepository($pdo);
$insituRepo = new InsituTestRepository($pdo);
$inlabRepo = new InlabTestRepository($pdo);
$georeportRepo = new GeoreportRepository($pdo);

// Localizar archivo CSV
$possibleFiles = [
  __DIR__ . '/bagaces_transformed.csv'
];
$csvFile = null;
foreach ($possibleFiles as $file) {
  if (file_exists($file)) {
    $csvFile = $file;
    break;
  }
}

if (!$csvFile) {
  die("Archivo CSV de datos no encontrado.\n");
}

echo "Leyendo archivo CSV: $csvFile\n";
$handle = fopen($csvFile, 'r');
if (!$handle) {
  die("No se pudo abrir el archivo CSV.\n");
}

// Detección de encabezado y delimitador
$firstLine = fgets($handle);
if ($firstLine === false) {
  die("El archivo CSV está vacío.\n");
}
if (substr($firstLine, 0, 3) === "\xEF\xBB\xBF") {
  $firstLine = substr($firstLine, 3);
}

$delimiter = (strpos($firstLine, ';') !== false) ? ';' : ',';
$header = str_getcsv($firstLine, $delimiter, '"', "\\");

if (strtoupper(trim($header[0])) !== 'SITIO') {
  die("No se identificó la columna principal 'SITIO'.\n");
}
echo "Delimitador detectado: '$delimiter'\n";

// Funciones auxiliares de limpieza y plantillas
$cleanNumber = function ($val): float {
  if ($val === null || $val === '***' || $val === '') {
    return 0.0;
  }
  $val = trim((string)$val);
  if (strpos($val, '<') === 0) {
    return 0.0;
  }
  $val = str_replace(',', '.', $val);
  $val = preg_replace('/[^0-9.-]/', '', $val);
  return $val !== '' ? (float)$val : 0.0;
};

$buildInsituDescription = function (string $site, float $temp, float $cond, float $ph): string {
  $details = [];
  $details[] = ($temp > 0) ? "Temperatura: {$temp} °C" : "Temperatura no registrada o en 0";
  $details[] = ($ph > 0) ? "pH: {$ph}" : "pH sin medición de campo";
  $details[] = ($cond > 0) ? "Conductividad: {$cond} µS/cm" : "Conductividad no reportada";

  return sprintf("Mediciones in-situ registradas para el sitio %s. [%s]", $site, implode(' | ', $details));
};

$buildInlabDescription = function (string $site, array $components): string {
  $zeroed = [];
  $active = [];
  foreach ($components as $key => $val) {
    if ($val <= 0.0) {
      $zeroed[] = strtoupper($key);
    } else {
      $active[] = strtoupper($key) . ": {$val}";
    }
  }

  $desc = "Análisis fisicoquímico de laboratorio para " . $site . ".";
  if (!empty($zeroed)) {
    $desc .= " Parámetros sin detección/no medidos (registrados en 0): " . implode(', ', $zeroed) . ".";
  }
  return $desc;
};

$inserted = 0;
$updated = 0;
$skipped = 0;

while (($line = fgets($handle)) !== false) {
  $line = rtrim($line, "\r\n");
  if (empty($line)) {
    continue;
  }

  $row = str_getcsv($line, $delimiter, '"', "\\");
  if (count($row) < 3) {
    continue;
  }

  $siteName = trim($row[0]);
  if ($siteName === '') {
    continue;
  }

  $latitude  = $cleanNumber($row[1] ?? 0);
  $longitude = $cleanNumber($row[2] ?? 0);

  // Verificar si la geomanifestación ya existe
  $existing = $geomanifestationRepo->findByName($siteName);
  if ($existing) {
    // Actualizar coordenadas
    $id = $existing['geomanifestation_id'];
    $updateStmt = $pdo->prepare("UPDATE geomanifestations SET latitude = :lat, longitude = :lon WHERE geomanifestation_id = :id");
    $updateStmt->execute([':lat' => $latitude, ':lon' => $longitude, ':id' => $id]);
    echo "Actualizadas coordenadas para '$siteName' (ID: $id) [Lat: $latitude, Lon: $longitude]\n";
    $updated++;
    continue; // No crear nuevos tests/reportes
  }

  // Extracción de parámetros (solo si es nuevo)
  $temp     = $cleanNumber($row[3] ?? null);
  $phField  = $cleanNumber($row[4] ?? null);
  $condField = $cleanNumber($row[5] ?? null);
  $phLab    = $cleanNumber($row[6] ?? null);
  $condLab  = $cleanNumber($row[7] ?? null);
  $cl       = $cleanNumber($row[8] ?? null);
  $ca       = $cleanNumber($row[9] ?? null);
  $hco3     = $cleanNumber($row[10] ?? null);
  $so4      = $cleanNumber($row[11] ?? null);
  $fe       = $cleanNumber($row[12] ?? null);
  $si       = $cleanNumber($row[13] ?? null);
  $b        = $cleanNumber($row[14] ?? null);
  $li       = $cleanNumber($row[15] ?? null);
  $f        = $cleanNumber($row[16] ?? null);
  $na       = $cleanNumber($row[17] ?? null);
  $k        = $cleanNumber($row[18] ?? null);
  $mg       = $cleanNumber($row[19] ?? null);

  try {
    // 1. Crear Geomanifestation
    $manifestationData = [
      'geomanifestation_name' => $siteName,
      'latitude'              => $latitude,
      'longitude'             => $longitude,
      'province_snit_code'    => $snitConfig['province_snit_code'],
      'canton_snit_code'      => $snitConfig['canton_snit_code'],
      'district_snit_code'    => $snitConfig['district_snit_code'],
      'description'           => "Manifestación geotérmica registrada en el sector de Bagaces, Guanacaste (Sitio: {$siteName}).",
      'visibility'            => 1,
      'current_georeport_id'  => null,
      'request_id'            => null
    ];

    $manifestation = $geomanifestationRepo->create($manifestationData, $systemUserId);
    $manifestationId = $manifestation['geomanifestation_id'];

    echo "Geomanifestación creada: {$siteName} (ID: {$manifestationId}) [Lat: {$latitude}, Lon: {$longitude}]\n";

    // 2. Crear Insitu Test
    $insituDesc = $buildInsituDescription($siteName, $temp, $condField, $phField);
    $insituDto = new RegisterInsituTestDTO(
      geomanifestationId: $manifestationId,
      temperature: $temp,
      conductivity: $condField,
      ph: $phField,
      description: $insituDesc
    );
    $insituTest = $insituRepo->create($insituDto, $systemUserId);
    $insituId = $insituTest['insitu_test_id'];

    // 3. Crear Inlab Test
    $labComponents = [
      'ph' => $phLab, 'cond' => $condLab, 'cl' => $cl, 'ca' => $ca,
      'hco3' => $hco3, 'so4' => $so4, 'fe' => $fe, 'si' => $si,
      'b' => $b, 'li' => $li, 'f' => $f, 'na' => $na, 'k' => $k, 'mg' => $mg
    ];
    $inlabDesc = $buildInlabDescription($siteName, $labComponents);

    $inlabDto = new RegisterInlabTestDTO(
      geomanifestationId: $manifestationId,
      ph: $phLab,
      conductivity: $condLab,
      cl: $cl,
      ca: $ca,
      hco3: $hco3,
      so4: $so4,
      fe: $fe,
      si: $si,
      b: $b,
      li: $li,
      f: $f,
      na: $na,
      k: $k,
      mg: $mg,
      description: $inlabDesc
    );
    $inlabTest = $inlabRepo->create($inlabDto, $systemUserId);
    $inlabId = $inlabTest['inlab_test_id'];

    // 4. Crear Georeport
    $reportDetails = sprintf(
      "Informe geotérmico consolidado para %s (Bagaces, Guanacaste). Registra parámetros in-situ (ID: %s) y resultados hidroquímicos de laboratorio (ID: %s).",
      $siteName,
      $insituId,
      $inlabId
    );
    $georeportDto = new RegisterGeoreportDTO(
      geomanifestationId: $manifestationId,
      insituTestId: $insituId,
      inlabTestId: $inlabId,
      details: $reportDetails
    );
    $georeport = $georeportRepo->create($georeportDto, $systemUserId);
    $georeportId = $georeport['georeport_id'];

    // 5. Vincular como georeporte actual de la manifestación
    $georeportRepo->setAsCurrentForManifestation($manifestationId, $georeportId);

    $inserted++;
    echo "  -> Insitu Test ID: {$insituId}\n";
    echo "  -> Inlab Test ID: {$inlabId}\n";
    echo "  -> Georeport ID: {$georeportId} (Establecido como actual)\n";

  } catch (Exception $e) {
    echo "Error procesando el sitio '{$siteName}': " . $e->getMessage() . "\n";
  }
}

fclose($handle);

echo "\nProceso finalizado con éxito: {$inserted} registros insertados, {$updated} actualizados, {$skipped} omitidos.\n";