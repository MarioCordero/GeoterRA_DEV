#!/usr/bin/env php
<?php
/**
 * Import territorial divisions (provinces, cantons, districts) from a CSV file.
 *
 * Usage: php import_territories.php
 *
 * Expected CSV structure (first row headers, data rows):
 *   col0: (empty), col1: CODIGO CATALOGO, col2: CODIGO PROVINCIA, col3: PROVINCIA,
 *   col4: CODIGO CANTON, col5: CANTON, col6: CODIGO DISTRITO, col7: DISTRITO, col8: AREA (km2)
 *
 * The script will insert provinces, then cantons, then districts,
 * skipping those that already exist (based on SNIT codes).
 * Uses repositories directly to avoid authentication requirements.
 */
use Core\UlidGenerator;

// Locate Composer autoloader
$autoloadPaths = [
  __DIR__ . '/../vendor/autoload.php',
  __DIR__ . '/vendor/autoload.php',
  __DIR__ . '/../../vendor/autoload.php',
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
  fwrite(STDERR, "Autoloader not found. Please run 'composer install' in the project root.\n");
  exit(1);
}

use Repositories\ProvinceRepository;
use Repositories\CantonRepository;
use Repositories\DistrictRepository;
use DTO\ProvinceDTO;
use DTO\CantonDTO;
use DTO\DistrictDTO;

// Load database connection
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
  fwrite(STDERR, "Database connection not found.\n");
  exit(1);
}

// Initialize repositories (no authentication needed)
$provinceRepo = new ProvinceRepository($pdo);
$cantonRepo = new CantonRepository($pdo);
$districtRepo = new DistrictRepository($pdo);

// Get or create system admin user (for created_by)
$systemUserId = null;
$stmt = $pdo->query("SELECT user_id FROM users WHERE role = 'admin' LIMIT 1");
$systemUserId = $stmt->fetchColumn();
if (!$systemUserId) {
  $passwordHash = password_hash('System@123', PASSWORD_DEFAULT);
  $userId = UlidGenerator::generate();
  $stmt = $pdo->prepare("INSERT INTO users (user_id, email, first_name, last_name, password_hash, role, is_active, is_verified) 
                           VALUES (:id, 'system@geoterra.com', 'System', 'Importer', :hash, 'admin', 1, 1)");
  $stmt->execute([':id' => $userId, ':hash' => $passwordHash]);
  $systemUserId = $userId;
  echo "Created system admin user with ID: $systemUserId\n";
}
echo "Using user ID: $systemUserId\n";

// Locate CSV file
$possibleFileNames = [
  'territorial.csv',
  'DTA-TABLA POR PROVINCIA-CANTÓN-DISTRITO 2026 (1) - CUADRO_DISTRITO.csv',
  'districts.csv'
];
$filePath = null;
foreach ($possibleFileNames as $name) {
  $fullPath = __DIR__ . '/' . $name;
  if (file_exists($fullPath)) {
    $filePath = $fullPath;
    break;
  }
}
if (!$filePath) {
  die("CSV file not found. Tried: " . implode(', ', $possibleFileNames) . "\n");
}

echo "Reading CSV file: $filePath\n";

// Open CSV file
$handle = fopen($filePath, 'r');
if (!$handle) {
  die("Could not open CSV file.\n");
}

// Skip header row (first line)
$header = fgetcsv($handle, 0, ',', '"', "\\");
if ($header === false) {
  die("Empty CSV file.\n");
}

// Data rows storage
$provinces = [];
$cantons = [];
$districts = [];

while (($row = fgetcsv($handle, 0, ',', '"', "\\")) !== false) {
  if (count($row) < 8)
    continue;

  $provSnit = (int) trim($row[2]);
  $provName = trim($row[3]);
  $cantonSnit = (int) trim($row[4]);
  $cantonName = trim($row[5]);
  $districtSnit = (int) trim($row[6]);
  $districtName = trim($row[7]);

  if ($provSnit <= 0 || $provName === '')
    continue;
  if ($cantonSnit <= 0 || $cantonName === '')
    continue;
  if ($districtSnit <= 0 || $districtName === '')
    continue;

  if (!isset($provinces[$provSnit])) {
    $provinces[$provSnit] = $provName;
  }

  $cantonKey = $cantonSnit;
  if (!isset($cantons[$cantonKey])) {
    $cantons[$cantonKey] = [
      'province_snit' => $provSnit,
      'name' => $cantonName
    ];
  }

  $districtKey = $districtSnit;
  if (!isset($districts[$districtKey])) {
    $districts[$districtKey] = [
      'canton_snit' => $cantonSnit,
      'name' => $districtName
    ];
  }
}
fclose($handle);

echo "Found " . count($provinces) . " provinces, " . count($cantons) . " cantons, " . count($districts) . " districts.\n";

// -------------------------------------------------------------------
// 1. Import provinces
// -------------------------------------------------------------------
echo "\n[Provinces]\n";
foreach ($provinces as $snit => $name) {
  if ($provinceRepo->existsBySnitCode($snit)) {
    echo "Province $name (SNIT $snit) already exists, skipping.\n";
    continue;
  }
  $dto = new ProvinceDTO(null, $snit, $name, '');
  $provinceRepo->create($dto, $systemUserId);
  echo "Inserted province: $name (SNIT $snit)\n";
}

// -------------------------------------------------------------------
// 2. Import cantons
// -------------------------------------------------------------------
echo "\n[Cantons]\n";
foreach ($cantons as $snit => $data) {
  if ($cantonRepo->existsBySnitCode($snit)) {
    echo "Canton {$data['name']} (SNIT $snit) already exists, skipping.\n";
    continue;
  }
  $dto = new CantonDTO(null, $data['province_snit'], $snit, $data['name'], '');
  $cantonRepo->create($dto, $systemUserId);
  echo "Inserted canton: {$data['name']} (Province SNIT {$data['province_snit']}, Canton SNIT $snit)\n";
}

// -------------------------------------------------------------------
// 3. Import districts
// -------------------------------------------------------------------
echo "\n[Districts]\n";
foreach ($districts as $snit => $data) {
  if ($districtRepo->existsBySnitCode($snit)) {
    echo "District {$data['name']} (SNIT $snit) already exists, skipping.\n";
    continue;
  }
  $dto = new DistrictDTO(null, $data['canton_snit'], $snit, $data['name'], '');
  $districtRepo->create($dto, $systemUserId);
  echo "Inserted district: {$data['name']} (Canton SNIT {$data['canton_snit']}, District SNIT $snit)\n";
}

echo "\nImport completed.\n";