-- ==============================================================================
-- GeoterRA - Migración 003: Módulo de Salidas de Campo, Comentarios y Vistas
-- ==============================================================================
-- Archivo:      003_add_field_trips_and_comments.sql
-- Descripción:  Asegura índices en catálogos, agrega las tablas field_trips,
--               field_trip_participants, comments, la relación field_trip_id
--               en geomanifestations y la vista view_logs_entries.
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

SET @dbname = DATABASE();

-- ------------------------------------------------------------------------------
-- 1. Asegurar índices en catálogos (requeridos para llaves foráneas)
-- ------------------------------------------------------------------------------

-- Índice en provinces (province_snit_code)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'provinces' AND COLUMN_NAME = 'province_snit_code'
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `provinces` ADD UNIQUE KEY `unique_province_snit_code` (`province_snit_code`);"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en cantons (canton_snit_code)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'cantons' AND COLUMN_NAME = 'canton_snit_code'
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `cantons` ADD UNIQUE KEY `unique_canton_snit_code` (`canton_snit_code`);"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en districts (district_snit_code)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'districts' AND COLUMN_NAME = 'district_snit_code'
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `districts` ADD UNIQUE KEY `unique_district_snit_code` (`district_snit_code`);"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------------------------
-- 2. Tabla: field_trips (Salidas de Campo)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `field_trips` (
  `field_trip_id` char(26) NOT NULL,
  `field_trip_name` varchar(110) NOT NULL,
  `field_trip_scheduled_date` datetime NOT NULL,
  `field_trip_start_date` datetime DEFAULT NULL,
  `field_trip_finish_date` datetime DEFAULT NULL,
  `field_trip_creator_id` char(26) NOT NULL,
  `field_trip_is_active` tinyint(1) NOT NULL DEFAULT 1,
  `province_snit_code` mediumint(9) UNSIGNED DEFAULT NULL,
  `canton_snit_code` mediumint(9) UNSIGNED DEFAULT NULL,
  `district_snit_code` mediumint(9) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`field_trip_id`),
  KEY `fk_ft_creator_id` (`field_trip_creator_id`),
  KEY `fk_ft_province_snit_code` (`province_snit_code`),
  KEY `fk_ft_canton_snit_code` (`canton_snit_code`),
  KEY `fk_ft_district_snit_code` (`district_snit_code`),
  KEY `idx_ft_is_active` (`field_trip_is_active`),
  CONSTRAINT `fk_ft_canton_snit_code` FOREIGN KEY (`canton_snit_code`) REFERENCES `cantons` (`canton_snit_code`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ft_creator_id` FOREIGN KEY (`field_trip_creator_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ft_district_snit_code` FOREIGN KEY (`district_snit_code`) REFERENCES `districts` (`district_snit_code`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ft_province_snit_code` FOREIGN KEY (`province_snit_code`) REFERENCES `provinces` (`province_snit_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------------------------
-- 3. Tabla: field_trip_participants (Participantes de Salidas de Campo)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `field_trip_participants` (
  `field_trip_id` char(26) NOT NULL,
  `user_id` char(26) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`field_trip_id`,`user_id`),
  KEY `fk_ftp_user_id` (`user_id`),
  CONSTRAINT `fk_ftp_field_trip_id` FOREIGN KEY (`field_trip_id`) REFERENCES `field_trips` (`field_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ftp_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------------------------
-- 4. Tabla: comments (Comentarios en Entidades)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comments` (
  `comment_id` char(26) NOT NULL,
  `entity_type` enum('field_trip','request','geomanifestation') NOT NULL,
  `entity_id` char(26) NOT NULL,
  `user_id` char(26) NOT NULL,
  `comment_text` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`comment_id`),
  KEY `idx_comments_entity` (`entity_type`,`entity_id`),
  KEY `fk_comments_user_id` (`user_id`),
  CONSTRAINT `fk_comments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------------------------
-- 5. Modificación: Agregar field_trip_id a geomanifestations (si no existe)
-- ------------------------------------------------------------------------------
SET @tablename = "geomanifestations";
SET @columnname = "field_trip_id";

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `geomanifestations` ADD COLUMN `field_trip_id` char(26) DEFAULT NULL AFTER `visibility`;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar llave foránea fk_gm_field_trip_id (si no existe)
SET @constraintname = "fk_gm_field_trip_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND CONSTRAINT_NAME = @constraintname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE `geomanifestations` ADD KEY `fk_gm_field_trip_id` (`field_trip_id`), ADD CONSTRAINT `fk_gm_field_trip_id` FOREIGN KEY (`field_trip_id`) REFERENCES `field_trips` (`field_trip_id`) ON DELETE SET NULL ON UPDATE CASCADE;"
));
PREPARE addFkIfNotExists FROM @preparedStatement;
EXECUTE addFkIfNotExists;
DEALLOCATE PREPARE addFkIfNotExists;

-- ------------------------------------------------------------------------------
-- 6. Vista: view_logs_entries
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW `view_logs_entries` AS 
SELECT 
    `le`.`id` AS `id`, 
    `le`.`log_id` AS `log_id`, 
    `le`.`field_name` AS `field_name`, 
    `le`.`old_value` AS `old_value`, 
    `le`.`new_value` AS `new_value`, 
    `l`.`auto_id` AS `auto_id`, 
    `l`.`table_name` AS `table_name`, 
    `l`.`updated_at` AS `updated_at`, 
    `l`.`updated_by` AS `updated_by`, 
    `l`.`updated_by_name` AS `updated_by_name` 
FROM (`logs_entries` `le` LEFT JOIN `logs` `l` ON(`le`.`log_id` = `l`.`id`));

SET FOREIGN_KEY_CHECKS = 1;
