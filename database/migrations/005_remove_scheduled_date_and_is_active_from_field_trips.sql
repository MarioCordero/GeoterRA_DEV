-- ==============================================================================
-- GeoterRA - Migración 005: Eliminación de columnas scheduled_date e is_active de field_trips
-- ==============================================================================
-- Archivo:      005_remove_scheduled_date_and_is_active_from_field_trips.sql
-- Descripción:  Elimina de forma segura e idempotente las columnas field_trip_scheduled_date
--               y field_trip_is_active (junto con su índice asociado) de la tabla field_trips.
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SET @dbname = DATABASE();
SET @tablename = "field_trips";

-- ------------------------------------------------------------------------------
-- 1. Eliminar índice idx_ft_is_active si existe
-- ------------------------------------------------------------------------------
SET @indexname = "idx_ft_is_active";

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = @indexname
  ) > 0,
  "ALTER TABLE `field_trips` DROP INDEX `idx_ft_is_active`;",
  "SELECT 1;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------------------------
-- 2. Eliminar columna field_trip_scheduled_date si existe
-- ------------------------------------------------------------------------------
SET @columnname = "field_trip_scheduled_date";

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "ALTER TABLE `field_trips` DROP COLUMN `field_trip_scheduled_date`;",
  "SELECT 1;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------------------------
-- 3. Eliminar columna field_trip_is_active si existe
-- ------------------------------------------------------------------------------
SET @columnname = "field_trip_is_active";

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "ALTER TABLE `field_trips` DROP COLUMN `field_trip_is_active`;",
  "SELECT 1;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;