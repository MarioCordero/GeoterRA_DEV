<?php
declare(strict_types=1);

namespace Controllers;

use Http\Request;
use Http\Response;
use Http\ErrorType;
use Http\ApiException;
use Core\Logger;
use PDO;
use Services\AuthService;
use DTO\UpdateUserRoleDTO;
use Services\MaintenanceService;
use Throwable;


final class MaintenanceController
{
  private MaintenanceService $service;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->service = new MaintenanceService($pdo);
    $this->authService = new AuthService($pdo);
  }

  // GET /maintenance/system/logs
  public function getSystemLogs(): void
  {
    try {
      $logs = $this->service->getSystemLogs();
      Response::success(['logs' => $logs]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Logger::error(
        '❌ [MaintenanceController::getSystemLogs] Error: ' . $e->getMessage()
      );
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // GET /maintenance/dashboard
  public function getDashboardInfo(): void
  {
    try {
      $dashboardInfo = $this->service->getDashboardInfo();
      Response::success(
        $dashboardInfo
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Logger::error(
        '❌ [MaintenanceController::getDashboardInfo] Error: ' . $e->getMessage()
      );
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // GET /maintenance/users
  public function showAllUsers(): void
  {
    try {
      $result = $this->service->getAllUsers();
      Response::success(
        $result['data'],
        $result['meta'],
        200
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Logger::error(
        '❌ [MaintenanceController::showAllUsers] Error: ' . $e->getMessage()
      );
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // GET /maintenance/database/tables
  public function getAllDatabaseTables(): void
  {
    try {
      $tables = $this->service->getAllDatabaseTables();
      Response::success($tables);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Logger::error(
        '❌ [MaintenanceController::getAllDatabaseTables] Error: ' . $e->getMessage()
      );
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // PUT /maintenance/users/{id}
  public function updateUserRole(string $id): void
  {
    try {
      $user = Request::getUser();

      // Validate user ID parameter
      if (empty($id)) {
        Response::error(ErrorType::missingField('id'), 400);
        return;
      }

      // Parse request body
      $body = Request::parseJsonRequest();
      $dto = UpdateUserRoleDTO::fromArray($body, $id);

      // Update user role
      $result = $this->service->updateUserRole($dto, $user['role']);
      Response::success($result['data'], $result['meta'], 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Logger::error(
        '❌ [MaintenanceController::updateUserRole] Error: ' . $e->getMessage()
      );
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}