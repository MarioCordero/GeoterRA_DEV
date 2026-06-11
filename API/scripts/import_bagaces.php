#!/usr/bin/env php
<?php
/**
 * Import Bagaces test data from CSV file using repositories.
 * Converts coordinates from CRTM05 (Costa Rica) to WGS84 (lat/lon).
 *
 * Usage: php import_bagaces.php
 *
 * Expected CSV: semicolon separated, comma as decimal point.
 * Columns: SITIO;X;Y;Temp;pH_campo;Cond_campo;pH_Lab;Cond_Lab;Cl;Ca+;HCO3-;SO4;Fe;Si;B;Li;F;Na;K;Mg+
 */

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
    fwrite(STDERR, "Autoloader not found. Run 'composer install'.\n");
    exit(1);
}

use Repositories\GeomanifestationRepository;
use Repositories\InsituTestRepository;
use Repositories\InlabTestRepository;
use Repositories\GeoreportRepository;
use DTO\RegisterGeomanifestationDTO;
use DTO\InsituTestDTO;
use DTO\InlabTestDTO;
use DTO\GeoreportDTO;
use proj4php\Proj4php;
use proj4php\Proj;
use proj4php\Point;

// Initialize coordinate transformation
$proj4 = new Proj4php();
// CRTM05 definition (official Costa Rica projection)
$projCRTM05 = new Proj('+proj=tmerc +lat_0=0 +lon_0=-84.3216666666667 +k=0.9999 +x_0=500000 +y_0=271820.622 +datum=WGS84 +units=m +no_defs', $proj4);
$projWGS84 = new Proj('EPSG:4326', $proj4);

// Database connection
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

// Get or create admin user
$stmt = $pdo->query("SELECT user_id FROM users WHERE role = 'admin' LIMIT 1");
$systemUserId = $stmt->fetchColumn();
if (!$systemUserId) {
    $passwordHash = password_hash('System@123', PASSWORD_DEFAULT);
    $userId = \DTO\Ulid::generate();
    $stmt = $pdo->prepare("INSERT INTO users (user_id, email, first_name, last_name, password_hash, role, is_active, is_verified) 
                           VALUES (:id, 'system@geoterra.com', 'System', 'Importer', :hash, 'admin', 1, 1)");
    $stmt->execute([':id' => $userId, ':hash' => $passwordHash]);
    $systemUserId = $userId;
    echo "Created system admin user with ID: $systemUserId\n";
}
echo "Using user ID: $systemUserId\n";

// Initialize repositories
$geomanifestationRepo = new GeomanifestationRepository($pdo);
$insituRepo = new InsituTestRepository($pdo);
$inlabRepo = new InlabTestRepository($pdo);
$georeportRepo = new GeoreportRepository($pdo);

// Locate CSV file
$csvFile = __DIR__ . '/Bagaces test 1.csv';
if (!file_exists($csvFile)) {
    die("CSV file not found: $csvFile\n");
}

echo "Reading CSV file: $csvFile\n";
$handle = fopen($csvFile, 'r');
if (!$handle) {
    die("Could not open CSV file.\n");
}

// Read first line as raw string to detect delimiter and remove BOM
$firstLine = fgets($handle);
if ($firstLine === false) {
    die("Empty CSV file.\n");
}
// Remove UTF-8 BOM if present
if (substr($firstLine, 0, 3) == "\xEF\xBB\xBF") {
    $firstLine = substr($firstLine, 3);
}
// Determine delimiter: look for semicolon or comma
if (strpos($firstLine, ';') !== false) {
    $delimiter = ';';
} elseif (strpos($firstLine, ',') !== false) {
    $delimiter = ',';
} else {
    die("Could not determine delimiter. Expected semicolon or comma.\n");
}
// Parse header
$header = str_getcsv($firstLine, $delimiter, '"', "\\");
// Verify header
if (strtoupper(trim($header[0])) !== 'SITIO') {
    die("Could not identify header row. Expected 'SITIO' as first column.\n");
}
echo "Detected delimiter: '$delimiter'\n";

$inserted = 0;
$skipped = 0;

// Process remaining lines
while (($line = fgets($handle)) !== false) {
    $line = rtrim($line, "\r\n");
    if (empty($line)) continue;
    $row = str_getcsv($line, $delimiter, '"', "\\");
    if (count($row) < 20) {
        // Some rows may be malformed; skip
        continue;
    }
    $siteName = trim($row[0]);
    if ($siteName === '') continue;

    // Check if manifestation already exists
    if ($geomanifestationRepo->existsByName($siteName)) {
        echo "Skipping '$siteName' (already exists).\n";
        $skipped++;
        continue;
    }

    // Helper to clean numeric values with comma as decimal, returns 0.0 if invalid or missing (because DB NOT NULL)
    $cleanNumber = function($val) {
        if ($val === null || $val === '***' || $val === '') return 0.0;
        $val = trim($val);
        if (strpos($val, '<') === 0) return 0.0;
        $val = str_replace(',', '.', $val);
        $val = preg_replace('/[^0-9.-]/', '', $val);
        return $val !== '' ? (float) $val : 0.0;
    };

    // Extract raw values
    $xRaw = $row[1] ?? '0';
    $yRaw = $row[2] ?? '0';
    $x = $cleanNumber($xRaw);
    $y = $cleanNumber($yRaw);

    // Convert coordinates from CRTM05 to WGS84 (lat/lon)
    try {
        $point = new Point($x, $y, $projCRTM05);
        $converted = $proj4->transform($projWGS84, $point);
        $longitude = $converted->x;
        $latitude  = $converted->y;
    } catch (Exception $e) {
        echo "Error converting coordinates for '$siteName': " . $e->getMessage() . "\n";
        continue;
    }

    if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
        echo "Invalid coordinates for '$siteName': lat={$latitude}, lon={$longitude}. Skipping.\n";
        continue;
    }

    $temp = $cleanNumber($row[3] ?? null);
    $phField = $cleanNumber($row[4] ?? null);
    $condField = $cleanNumber($row[5] ?? null);
    $phLab = $cleanNumber($row[6] ?? null);
    $condLab = $cleanNumber($row[7] ?? null);
    $cl = $cleanNumber($row[8] ?? null);
    $ca = $cleanNumber($row[9] ?? null);
    $hco3 = $cleanNumber($row[10] ?? null);
    $so4 = $cleanNumber($row[11] ?? null);
    $fe = $cleanNumber($row[12] ?? null);
    $si = $cleanNumber($row[13] ?? null);
    $b = $cleanNumber($row[14] ?? null);
    $li = $cleanNumber($row[15] ?? null);
    $f = $cleanNumber($row[16] ?? null);
    $na = $cleanNumber($row[17] ?? null);
    $k = $cleanNumber($row[18] ?? null);
    $mg = $cleanNumber($row[19] ?? null);

    try {
        // Create Geomanifestation with fixed territorial codes (Bagaces: 5, 504, 50401)
        $dtoManifest = new RegisterGeomanifestationDTO(
                null,
                5,
                504,
                50401,
                null,
                $siteName,
                $latitude,
                $longitude,
                "Imported from Bagaces test data",
                false
        );
        $manifestationId = $geomanifestationRepo->create($dtoManifest, $systemUserId);

        // Ensure the name is correctly stored (in case the repository overwrote it)
        $current = $geomanifestationRepo->findById($manifestationId);
        if ($current && $current->name !== $siteName) {
            $updateDto = new RegisterGeomanifestationDTO(
                    $manifestationId,
                    5,
                    504,
                    50401,
                    $current->currentGeoreportId,
                    $siteName,
                    $latitude,
                    $longitude,
                    $current->description,
                    $current->visibility,
                    $current->createdBy,
                    $current->createdAt
            );
            $geomanifestationRepo->update($manifestationId, $updateDto);
            echo "Updated manifestation name to: $siteName\n";
        }

        echo "Created manifestation: $siteName (ID: $manifestationId) [lat={$latitude}, lon={$longitude}]\n";

        // Create Insitu Test
        $insituDto = new InsituTestDTO(
                null,
                $manifestationId,
                $temp,
                $condField,
                $phField,
                "Field measurement"
        );
        $insituId = $insituRepo->create($insituDto, $systemUserId);

        // Create Inlab Test
        $inlabDto = new InlabTestDTO(
                null,
                $manifestationId,
                $phLab,
                $condLab,
                $cl,
                $ca,
                $hco3,
                $so4,
                $fe,
                $si,
                $b,
                $li,
                $f,
                $na,
                $k,
                $mg,
                "Laboratory analysis"
        );
        $inlabId = $inlabRepo->create($inlabDto, $systemUserId);

        // Create Georeport
        $georeportDto = new GeoreportDTO(
                null,
                $manifestationId,
                $insituId,
                $inlabId,
                "Initial import from Bagaces data"
        );
        $georeportId = $georeportRepo->create($georeportDto, $systemUserId);

        // Set as current georeport
        $georeportRepo->setAsCurrentForManifestation($manifestationId, $georeportId);

        $inserted++;
        echo "  -> Insitu test: $insituId, Inlab test: $inlabId, Georeport: $georeportId\n";
    } catch (Exception $e) {
        echo "Error processing '$siteName': " . $e->getMessage() . "\n";
    }
}
fclose($handle);

echo "\nImport completed: $inserted inserted, $skipped skipped.\n";