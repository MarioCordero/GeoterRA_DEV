-- ==============================================================================
-- GeoterRA - Migración 006: Adición y poblamiento de nombre en pruebas y reportes
-- ==============================================================================
-- Archivo:      006_add_name_to_tests_and_reports.sql
-- Descripción:  Agrega de forma segura la columna varchar(55) NOT NULL a insitu_tests,
--               inlab_tests y georeports, asignando un nombre automático a los 
--               registros existentes que no lo posean.
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SET @dbname = DATABASE();

-- ------------------------------------------------------------------------------
-- 1. Tabla: insitu_tests (insitu_test_name)
-- ------------------------------------------------------------------------------
SET @tablename = "insitu_tests";
SET @columnname = "insitu_test_name";

-- Agrega columna permitiendo NULL temporalmente si no existe
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1;",
  "ALTER TABLE `insitu_tests` ADD COLUMN `insitu_test_name` varchar(55) COLLATE utf8mb4_general_ci NULL AFTER `insitu_test_id`;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Paso B: Asignar un nombre automático a los registros existentes que estén vacíos/nulos
UPDATE `insitu_tests` 
SET `insitu_test_name` = CONCAT('Prueba In-Situ - ', LEFT(`insitu_test_id`, 8))
WHERE `insitu_test_name` IS NULL OR `insitu_test_name` = '';

-- Restringe la columna a NOT NULL
ALTER TABLE `insitu_tests` MODIFY COLUMN `insitu_test_name` varchar(55) COLLATE utf8mb4_general_ci NOT NULL;


-- ------------------------------------------------------------------------------
-- 2. Tabla: inlab_tests (inlab_test_name)
-- ------------------------------------------------------------------------------
SET @tablename = "inlab_tests";
SET @columnname = "inlab_test_name";

-- Agrega columna permitiendo NULL temporalmente si no existe
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1;",
  "ALTER TABLE `inlab_tests` ADD COLUMN `inlab_test_name` varchar(55) COLLATE utf8mb4_general_ci NULL AFTER `inlab_test_id`;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Asigna un nombre automático a los registros existentes
UPDATE `inlab_tests` 
SET `inlab_test_name` = CONCAT('Prueba Lab - ', LEFT(`inlab_test_id`, 8))
WHERE `inlab_test_name` IS NULL OR `inlab_test_name` = '';

-- Paso C: Restringir la columna a NOT NULL
ALTER TABLE `inlab_tests` MODIFY COLUMN `inlab_test_name` varchar(55) COLLATE utf8mb4_general_ci NOT NULL;


-- ------------------------------------------------------------------------------
-- 3. Tabla: georeports (georeport_name)
-- ------------------------------------------------------------------------------
SET @tablename = "georeports";
SET @columnname = "georeport_name";

-- Agrega columna permitiendo NULL temporalmente si no existe
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1;",
  "ALTER TABLE `georeports` ADD COLUMN `georeport_name` varchar(55) COLLATE utf8mb4_general_ci NULL AFTER `georeport_id`;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Asigna un nombre automático a los registros existentes
UPDATE `georeports` 
SET `georeport_name` = CONCAT('GeoReporte - ', LEFT(`georeport_id`, 8))
WHERE `georeport_name` IS NULL OR `georeport_name` = '';

-- Restringue la columna a NOT NULL
ALTER TABLE `georeports` MODIFY COLUMN `georeport_name` varchar(55) COLLATE utf8mb4_general_ci NOT NULL;


SET FOREIGN_KEY_CHECKS = 1;