-- ==============================================================================
-- GeoterRA - Migración 004: Adición de columna visibility a reportes y pruebas
-- ==============================================================================
-- Archivo:      004_add_visibility_to_georeports_and_tests.sql
-- Descripción:  Agrega de forma segura e idempotente la columna visibility y sus
--               respectivos índices a las tablas geomanifestations, georeports,
--               insitu_tests e inlab_tests. Además, sincroniza la visibilidad
--               de las pruebas/reportes asociados a geomanifestaciones públicas.
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SET @dbname = DATABASE();

-- ------------------------------------------------------------------------------
-- 1. Tabla: geomanifestations (Columna visibility e índice)
-- ------------------------------------------------------------------------------
SET @tablename = "geomanifestations";
SET @columnname = "visibility";

-- Columna visibility en geomanifestations
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `geomanifestations` ADD COLUMN `visibility` tinyint(1) NOT NULL DEFAULT 0 AFTER `description`;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_gm_visibility
SET @indexname = "idx_gm_visibility";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = @indexname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `geomanifestations` ADD KEY `idx_gm_visibility` (`visibility`) USING BTREE;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------------------------
-- 2. Tabla: georeports (Columna visibility e índice)
-- ------------------------------------------------------------------------------
SET @tablename = "georeports";
SET @columnname = "visibility";

-- Columna visibility en georeports
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `georeports` ADD COLUMN `visibility` tinyint(1) NOT NULL DEFAULT 0 AFTER `details`;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_gr_visibility
SET @indexname = "idx_gr_visibility";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = @indexname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `georeports` ADD KEY `idx_gr_visibility` (`visibility`) USING BTREE;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------------------------
-- 3. Tabla: insitu_tests (Columna visibility e índice)
-- ------------------------------------------------------------------------------
SET @tablename = "insitu_tests";
SET @columnname = "visibility";

-- Columna visibility en insitu_tests
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `insitu_tests` ADD COLUMN `visibility` tinyint(1) NOT NULL DEFAULT 0 AFTER `description`;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_insitut_visibility
SET @indexname = "idx_insitut_visibility";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = @indexname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `insitu_tests` ADD KEY `idx_insitut_visibility` (`visibility`) USING BTREE;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------------------------
-- 4. Tabla: inlab_tests (Columna visibility e índice)
-- ------------------------------------------------------------------------------
SET @tablename = "inlab_tests";
SET @columnname = "visibility";

-- Columna visibility en inlab_tests
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `inlab_tests` ADD COLUMN `visibility` tinyint(1) NOT NULL DEFAULT 0 AFTER `description`;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_inlabt_visibility
SET @indexname = "idx_inlabt_visibility";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = @indexname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `inlab_tests` ADD KEY `idx_inlabt_visibility` (`visibility`) USING BTREE;"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------------------------
-- 5. Sincronización de visibilidad para datos existentes
-- ------------------------------------------------------------------------------
-- Establecer visibility = 1 para el georeporte actual de geomanifestaciones visibles
UPDATE `georeports` gr
JOIN `geomanifestations` gm ON gm.current_georeport_id = gr.georeport_id
SET gr.visibility = 1
WHERE gm.visibility = 1;

-- Establecer visibility = 1 para pruebas in-situ de geomanifestaciones visibles
UPDATE `insitu_tests` ist
JOIN `georeports` gr ON gr.insitu_test_id = ist.insitu_test_id
JOIN `geomanifestations` gm ON gm.current_georeport_id = gr.georeport_id
SET ist.visibility = 1
WHERE gm.visibility = 1;

-- Establecer visibility = 1 para pruebas de laboratorio de geomanifestaciones visibles
UPDATE `inlab_tests` ilt
JOIN `georeports` gr ON gr.inlab_test_id = ilt.inlab_test_id
JOIN `geomanifestations` gm ON gm.current_georeport_id = gr.georeport_id
SET ilt.visibility = 1
WHERE gm.visibility = 1;

SET FOREIGN_KEY_CHECKS = 1;
