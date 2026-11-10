<?php
declare(strict_types=1);

namespace Controllers;

use Http\Response;
use Http\ErrorType;
use Core\Logger;
use PDO;
use Throwable;

final class AppController
{
  public function __construct(private ?PDO $pdo = null)
  {
  }

  /**
   * GET /app/download-apk
   * 
   * Streams the current Android APK installer for direct download.
   */
  public function downloadApk(): void
  {
    try {
      $apkPath = $this->resolveApkPath();

      if ($apkPath === null) {
        Logger::error('❌ [AppController::downloadApk] APK file not found in any candidate path.');
        Response::error(
          ErrorType::notFound('El archivo instalador APK de GeoterRA no se encuentra disponible temporalmente.'),
          404
        );
        return;
      }

      Response::download(
        $apkPath,
        'geoterraApp.apk',
        'application/vnd.android.package-archive'
      );
    } catch (Throwable $e) {
      Logger::error('❌ [AppController::downloadApk] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /app/version
   * 
   * Returns metadata for the current Android release (file size, date, availability).
   */
  public function getVersionInfo(): void
  {
    try {
      $apkPath = $this->resolveApkPath();

      if ($apkPath === null) {
        Response::success([
          'available' => false,
          'message' => 'Instalador APK no disponible temporalmente',
        ]);
        return;
      }

      $fileSize = filesize($apkPath);
      $lastModified = filemtime($apkPath);

      Response::success([
        'available' => true,
        'fileName' => 'geoterraApp.apk',
        'fileSizeBytes' => $fileSize !== false ? $fileSize : 0,
        'fileSizeMB' => $fileSize !== false ? round($fileSize / (1024 * 1024), 2) : 0,
        'lastModified' => $lastModified ? date('c', $lastModified) : null,
        'downloadUrl' => '/api/app/download-apk',
      ]);
    } catch (Throwable $e) {
      Logger::error('❌ [AppController::getVersionInfo] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * Resolves the APK location across candidate paths.
   */
  private function resolveApkPath(): ?string
  {
    $candidatePaths = [];

    // 1. Environment variable if configured
    if (!empty($_ENV['MOBILE_APK_PATH'])) {
      $candidatePaths[] = (string) $_ENV['MOBILE_APK_PATH'];
    }
    if (getenv('MOBILE_APK_PATH')) {
      $candidatePaths[] = (string) getenv('MOBILE_APK_PATH');
    }

    // 2. Relative to repository root (from API/src/Controllers)
    $repoRoot = dirname(__DIR__, 3);
    $candidatePaths[] = $repoRoot . '/Mobile/Releases/Android/current-release/geoterraApp.apk';
    $candidatePaths[] = dirname(__DIR__, 2) . '/Mobile/Releases/Android/current-release/geoterraApp.apk';

    // 3. Known absolute production path on reforesta01
    $candidatePaths[] = '/home/proyecto/GeoterRA_DEV/Mobile/Releases/Android/current-release/geoterraApp.apk';

    foreach ($candidatePaths as $path) {
      if (file_exists($path) && is_readable($path)) {
        return $path;
      }
    }

    return null;
  }
}