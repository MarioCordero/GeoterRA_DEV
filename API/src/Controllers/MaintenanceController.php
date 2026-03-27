<?php
namespace Controllers;

use Http\Request;
use Http\Response;
use DTO\PermissionsDTO as Permissions;
use Services\PermissionService;

class MaintenanceController {
    // REFACT, too much BLL here
    public function getSystemLogs(): void {
        try {
            $user = Request::getUser();
            
            if (!$user) {
                Response::error('Not authenticated', 403);
                return;
            }
            
            if (!PermissionService::hasPermission($user['role'], Permissions::VIEW_SYSTEM_LOGS)) {
                Response::error('Permission denied', 403);
                return;
            }
            
            $logFile = __DIR__ . '/../../logs/system.log';
            
            error_log('🔍 [MaintenanceController] Looking for log file at: ' . $logFile);
            error_log('🔍 [MaintenanceController] File exists: ' . (file_exists($logFile) ? 'YES' : 'NO'));
            
            if (!file_exists($logFile)) {
                Response::success(['logs' => [], 'message' => 'No logs available']);
                return;
            }
            
            // Read last 500 lines
            $logs = file($logFile);
            if ($logs === false) {
                Response::error('Unable to read log file', 500);
                return;
            }
            
            $logs = array_slice($logs, -500);
            Response::success(['logs' => $logs]);
            
        } catch (\Throwable $e) {
            error_log('❌ [LogController] Error: ' . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }
    
}