<?php
declare(strict_types=1);

namespace Controllers;

use Http\Request;
use Http\Response;
use Http\ApiException;
use Http\ErrorType;
use Services\AuthService;
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
      error_log('❌ [MaintenanceController::getSystemLogs] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
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
      error_log('❌ [MaintenanceController::getDashboardInfo] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

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
      error_log('❌ [MaintenanceController::showAllUsers] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

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
      error_log('❌ [MaintenanceController::getAllDatabaseTables] Error: ' . $e->getMessage());
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}