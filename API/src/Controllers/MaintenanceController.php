<?php
declare(strict_types=1);

namespace Controllers;

use Http\Request;
use Http\Response;
use Http\ErrorType;
use Http\ApiException;
use Core\Logger;
use Services\AuthService;
use DTO\UpdateUserRoleDTO;
use Services\PermissionService;
use Services\MaintenanceService;
use DTO\PermissionsDTO as Permissions;


final class MaintenanceController
{
  private MaintenanceService $service;
  private AuthService $authService;

  public function __construct(private \PDO $pdo)
  {
    $this->service = new MaintenanceService($pdo);
    $this->authService = new AuthService($pdo);
  }
  
  // GET /maintenance/system/logs
  public function getSystemLogs(): void
  {
    try {
      $user = $this->authService->requireAuth();

      if (!PermissionService::hasPermission($user['role'], Permissions::VIEW_SYSTEM_LOGS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $logs = $this->service->getSystemLogs();
      Response::success(['logs' => $logs]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Logger::error('❌ [MaintenanceController::getSystemLogs] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // GET /maintenance/dashboard
  public function getDashboardInfo(): void
  {
    try {
      $user = $this->authService->requireAuth();
      if (!PermissionService::hasPermission($user['role'], Permissions::VIEW_INFRASTRUCTURE)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $dashboardInfo = $this->service->getDashboardInfo();
      Response::success($dashboardInfo);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Logger::error('❌ [MaintenanceController::getDashboardInfo] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // GET /maintenance/users
  public function showAllUsers(): void
  {
    try {
      $user = $this->authService->requireAuth();

      if (!PermissionService::hasPermission($user['role'], Permissions::VIEW_USERS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $result = $this->service->getAllUsers();
      Response::success($result['data'], $result['meta'], 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Logger::error('❌ [MaintenanceController::showAllUsers] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // GET /maintenance/database/tables
  public function getAllDatabaseTables(): void
  {
    try {
      $user = $this->authService->requireAuth();

      if (!PermissionService::hasPermission($user['role'], Permissions::VIEW_INFRASTRUCTURE)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $tables = $this->service->getAllDatabaseTables();
      Response::success($tables);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Logger::error('❌ [MaintenanceController::getAllDatabaseTables] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  // PUT /maintenance/users/{id}
  public function updateUserRole(string $id): void
  {
    try {
      $user = $this->authService->requireAuth();

      // Check if user has permission to assign roles
      if (!PermissionService::hasPermission($user['role'], Permissions::ASSIGN_ROLES)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

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
    } catch (\Throwable $e) {
      Logger::error('❌ [MaintenanceController::updateUserRole] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}