<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use Repositories\UserRepository;

/**
 * Service for handling maintenance and infrastructure operations
 */
final class MaintenanceService
{
  private UserRepository $userRepository;

  public function __construct(private PDO $pdo)
  {
    $this->userRepository = new UserRepository($pdo);
  }

  /**
   * Get system logs (last 500 lines)
   * 
   * @return array Array of log lines
   * @throws ApiException
   */
  public function getSystemLogs(): array
  {
    try {
      $logFile = __DIR__ . '/../../logs/system.log';

      if (!file_exists($logFile)) {
        return [];
      }

      $logs = file($logFile);
      if ($logs === false) {
        throw new ApiException(ErrorType::internal('Unable to read log file'), 500);
      }

      // Return last 500 lines
      return array_slice($logs, -500);
    } catch (ApiException $e) {
      throw $e;
    } catch (\Throwable $e) {
      throw new ApiException(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * Get system dashboard information
   * 
   * @return array Dashboard data with system status
   */
  public function getDashboardInfo(): array
  {
    try {
      return [
        'serverStatus' => 'Online',
        'activeUsers' => $this->userRepository->getActiveUsersCount(),
        'pendingRequests' => 5,
        'systemLoad' => 'Moderate',
      ];
    } catch (\Throwable $e) {
      throw new ApiException(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * Get all users in the system
   * 
   * @return array List of all users
   * @throws ApiException
   */
  public function getAllUsers(): array
  {
    try {
      $users = $this->userRepository->getAllUsers();
      
      return [
        'data' => $users,
        'meta' => [
          'total' => count($users),
          'count' => count($users),
        ],
      ];
    } catch (\Throwable $e) {
      throw new ApiException(ErrorType::internal($e->getMessage()), 500);
    }
  }
}
