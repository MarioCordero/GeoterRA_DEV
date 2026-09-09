-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 09-08-2026 a las 02:17:06
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `GeoterRA`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `access_tokens`
--

CREATE TABLE `access_tokens` (
  `access_token_id` char(26) NOT NULL,
  `user_id` char(26) NOT NULL,
  `access_token_hash` char(64) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cantons`
--

CREATE TABLE `cantons` (
  `canton_id` char(26) NOT NULL,
  `province_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `canton_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `canton_name` varchar(55) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `districts`
--

CREATE TABLE `districts` (
  `district_id` char(26) NOT NULL,
  `canton_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `district_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `district_name` varchar(55) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `geomanifestations`
--

CREATE TABLE `geomanifestations` (
  `geomanifestation_id` char(26) NOT NULL,
  `province_snit_code` mediumint(9) UNSIGNED DEFAULT NULL,
  `canton_snit_code` mediumint(9) UNSIGNED DEFAULT NULL,
  `district_snit_code` mediumint(9) UNSIGNED DEFAULT NULL,
  `current_georeport_id` char(26) DEFAULT NULL,
  `geomanifestation_name` varchar(110) NOT NULL DEFAULT 'GM - Sin Nombre',
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `visibility` tinyint(1) NOT NULL DEFAULT 0,
  `request_id` char(26) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `georeports`
--

CREATE TABLE `georeports` (
  `georeport_id` char(26) NOT NULL,
  `geomanifestation_id` char(26) NOT NULL,
  `insitu_test_id` char(26) NOT NULL,
  `inlab_test_id` char(26) NOT NULL,
  `details` varchar(500) DEFAULT NULL,
  `visibility` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` char(26) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inlab_tests`
--

CREATE TABLE `inlab_tests` (
  `inlab_test_id` char(26) NOT NULL,
  `geomanifestation_id` char(26) NOT NULL,
  `ph` double(10,2) NOT NULL DEFAULT 0.00,
  `conductivity` double(10,4) NOT NULL DEFAULT 0.0000,
  `cl` double(10,4) NOT NULL DEFAULT 0.0000,
  `ca` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `hco3` double(10,4) NOT NULL DEFAULT 0.0000,
  `so4` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `fe` double(10,4) NOT NULL DEFAULT 0.0000,
  `si` double(10,4) NOT NULL DEFAULT 0.0000,
  `b` double(10,4) NOT NULL DEFAULT 0.0000,
  `li` double(10,4) NOT NULL DEFAULT 0.0000,
  `f` double(10,4) NOT NULL DEFAULT 0.0000,
  `na` double(10,4) NOT NULL DEFAULT 0.0000,
  `k` double(10,4) NOT NULL DEFAULT 0.0000,
  `mg` double(10,4) NOT NULL DEFAULT 0.0000,
  `description` varchar(255) DEFAULT NULL,
  `visibility` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insitu_tests`
--

CREATE TABLE `insitu_tests` (
  `insitu_test_id` char(26) NOT NULL,
  `geomanifestation_id` char(26) NOT NULL,
  `temperature` double(6,2) NOT NULL DEFAULT 0.00,
  `conductivity` double(10,2) NOT NULL DEFAULT 0.00,
  `ph` double(4,2) NOT NULL DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `visibility` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs`
--

CREATE TABLE `logs` (
  `id` bigint(20) NOT NULL,
  `auto_id` bigint(20) NOT NULL DEFAULT 0,
  `table_name` varchar(100) NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` bigint(20) NOT NULL DEFAULT 0,
  `updated_by_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_entries`
--

CREATE TABLE `logs_entries` (
  `id` bigint(20) NOT NULL,
  `log_id` bigint(20) NOT NULL DEFAULT 0,
  `field_name` varchar(100) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `user_id` varchar(36) NOT NULL,
  `token` varchar(128) NOT NULL,
  `token_expiry` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provinces`
--

CREATE TABLE `provinces` (
  `province_id` char(26) NOT NULL,
  `province_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `province_name` varchar(55) NOT NULL,
  `created_by` char(26) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `refresh_token_id` char(26) NOT NULL,
  `user_id` char(26) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `family_id` char(26) DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `is_rotated` tinyint(1) NOT NULL DEFAULT 0,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `replaced_by` char(26) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

--
-- Disparadores `refresh_tokens`
--
DELIMITER $$
CREATE TRIGGER `prevent_double_use_before_insert` BEFORE UPDATE ON `refresh_tokens` FOR EACH ROW BEGIN
    IF OLD.used_at IS NOT NULL AND NEW.used_at IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot unset used_at on a token';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requests`
--

CREATE TABLE `requests` (
  `request_id` char(26) NOT NULL,
  `province_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `canton_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `district_snit_code` mediumint(9) UNSIGNED NOT NULL,
  `user_id` char(26) NOT NULL,
  `request_name` varchar(110) NOT NULL DEFAULT 'SOLI-XXXXX',
  `owner_name` varchar(110) DEFAULT NULL,
  `owner_phone_number` varchar(14) DEFAULT NULL,
  `owner_email` varchar(255) DEFAULT NULL,
  `current_usage` enum('Residencial','Comercial','Turístico','Conservación','Ganadería','Otro') NOT NULL DEFAULT 'Otro',
  `temperature_sensation` enum('Hirviendo','Muy Caliente','Caliente','Templado','Natural','Sin Especificar') NOT NULL DEFAULT 'Sin Especificar',
  `bubbles` tinyint(1) DEFAULT 0,
  `details` varchar(255) DEFAULT NULL,
  `exact_address` varchar(500) DEFAULT NULL,
  `latitude` double(10,7) DEFAULT NULL,
  `longitude` double(10,7) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `relation_with_owner` enum('Familiar','Empleado','Socio','Conocido','Titular') DEFAULT 'Titular'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requests_state`
--

CREATE TABLE `requests_state` (
  `request_status_id` char(26) NOT NULL,
  `request_id` char(26) NOT NULL,
  `value` enum('Pendiente','Revisión','Procesada','') NOT NULL DEFAULT 'Pendiente',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `user_id` char(26) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(14) DEFAULT NULL,
  `first_name` varchar(55) NOT NULL,
  `last_name` varchar(110) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','user','maintenance','investigator','field_investigator') NOT NULL DEFAULT 'user',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `failed_login_attempts` tinyint(1) UNSIGNED DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `view_logs_entries`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `view_logs_entries` (
`id` bigint(20)
,`log_id` bigint(20)
,`field_name` varchar(100)
,`old_value` text
,`new_value` text
,`auto_id` bigint(20)
,`table_name` varchar(100)
,`updated_at` datetime
,`updated_by` bigint(20)
,`updated_by_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `view_logs_entries`
--
DROP TABLE IF EXISTS `view_logs_entries`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_logs_entries`  AS SELECT `le`.`id` AS `id`, `le`.`log_id` AS `log_id`, `le`.`field_name` AS `field_name`, `le`.`old_value` AS `old_value`, `le`.`new_value` AS `new_value`, `l`.`auto_id` AS `auto_id`, `l`.`table_name` AS `table_name`, `l`.`updated_at` AS `updated_at`, `l`.`updated_by` AS `updated_by`, `l`.`updated_by_name` AS `updated_by_name` FROM (`logs_entries` `le` left join `logs` `l` on(`le`.`log_id` = `l`.`id`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD PRIMARY KEY (`access_token_id`),
  ADD UNIQUE KEY `unique_accesst_hash` (`access_token_hash`) USING BTREE,
  ADD KEY `fk_accesst_user_id` (`user_id`) USING BTREE;

--
-- Indices de la tabla `cantons`
--
ALTER TABLE `cantons`
  ADD PRIMARY KEY (`canton_id`),
  ADD UNIQUE KEY `unique_canton_snit_code` (`canton_snit_code`),
  ADD KEY `fk_canton_created_by` (`created_by`),
  ADD KEY `fk_canton_province_snit_code` (`province_snit_code`);

--
-- Indices de la tabla `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`district_id`),
  ADD UNIQUE KEY `unique_district_snit_code` (`district_snit_code`),
  ADD KEY `fk_district_created_by` (`created_by`),
  ADD KEY `fk_district_canton_snit_code` (`canton_snit_code`);

--
-- Indices de la tabla `geomanifestations`
--
ALTER TABLE `geomanifestations`
  ADD PRIMARY KEY (`geomanifestation_id`),
  ADD KEY `fk_gm_created_by_user` (`created_by`) USING BTREE,
  ADD KEY `fk_gm_canton_snit_code` (`canton_snit_code`) USING BTREE,
  ADD KEY `fk_gm_province_snit_code` (`province_snit_code`) USING BTREE,
  ADD KEY `fk_gm_district_snit_code` (`district_snit_code`) USING BTREE,
  ADD KEY `idx_gm_visibility` (`visibility`) USING BTREE,
  ADD KEY `fk_gm_current_georeport_id` (`current_georeport_id`) USING BTREE,
  ADD KEY `idx_request_id` (`request_id`);

--
-- Indices de la tabla `georeports`
--
ALTER TABLE `georeports`
  ADD PRIMARY KEY (`georeport_id`),
  ADD KEY `fk_gr_created_by` (`created_by`),
  ADD KEY `fk_gr_geomanifestation_id` (`geomanifestation_id`),
  ADD KEY `fk_gr_inlab_test_id` (`inlab_test_id`),
  ADD KEY `fk_gr_insitu_test_id` (`insitu_test_id`),
  ADD KEY `idx_gr_visibility` (`visibility`) USING BTREE;

--
-- Indices de la tabla `inlab_tests`
--
ALTER TABLE `inlab_tests`
  ADD PRIMARY KEY (`inlab_test_id`),
  ADD KEY `fk_inlabt_geomanifestation_id` (`geomanifestation_id`) USING BTREE,
  ADD KEY `fk_inlabt_created_by` (`created_by`) USING BTREE,
  ADD KEY `idx_inlabt_visibility` (`visibility`) USING BTREE;

--
-- Indices de la tabla `insitu_tests`
--
ALTER TABLE `insitu_tests`
  ADD PRIMARY KEY (`insitu_test_id`),
  ADD KEY `fk_insitut_created_by` (`created_by`) USING BTREE,
  ADD KEY `fk_insitut_manifestation_id` (`geomanifestation_id`) USING BTREE,
  ADD KEY `idx_insitut_visibility` (`visibility`) USING BTREE;

--
-- Indices de la tabla `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `logs_entries`
--
ALTER TABLE `logs_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `log_id` (`log_id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`user_id`,`token`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indices de la tabla `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`province_id`),
  ADD UNIQUE KEY `unique_province_name` (`province_name`) USING BTREE,
  ADD UNIQUE KEY `unique_province_snit_code` (`province_snit_code`) USING BTREE,
  ADD KEY `fk_province_created_by` (`created_by`) USING BTREE;

--
-- Indices de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`refresh_token_id`),
  ADD UNIQUE KEY `unique_refresht_hash` (`token_hash`) USING BTREE,
  ADD KEY `fk_refresht_replaced_by` (`replaced_by`),
  ADD KEY `idx_refresh_family` (`family_id`),
  ADD KEY `idx_refresh_user_family` (`user_id`,`family_id`);

--
-- Indices de la tabla `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_r_temperature_sensation` (`temperature_sensation`) USING BTREE,
  ADD KEY `fk_r_canton_snit_code` (`canton_snit_code`) USING BTREE,
  ADD KEY `fk_r_province_snit_code` (`province_snit_code`) USING BTREE,
  ADD KEY `idx_r_current_usage` (`current_usage`) USING BTREE,
  ADD KEY `fk_r_user` (`user_id`) USING BTREE,
  ADD KEY `fk_r_district_snit_code` (`district_snit_code`) USING BTREE;

--
-- Indices de la tabla `requests_state`
--
ALTER TABLE `requests_state`
  ADD PRIMARY KEY (`request_status_id`),
  ADD KEY `fk_rs_request_id` (`request_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_active` (`deleted_at`,`is_deleted`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `logs`
--
ALTER TABLE `logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3870;

--
-- AUTO_INCREMENT de la tabla `logs_entries`
--
ALTER TABLE `logs_entries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7212;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cantons`
--
ALTER TABLE `cantons`
  ADD CONSTRAINT `fk_canton_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_canton_province_snit_code` FOREIGN KEY (`province_snit_code`) REFERENCES `provinces` (`province_snit_code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `fk_district_canton_snit_code` FOREIGN KEY (`canton_snit_code`) REFERENCES `cantons` (`canton_snit_code`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_district_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `geomanifestations`
--
ALTER TABLE `geomanifestations`
  ADD CONSTRAINT `fk_gm_canton_snit_code` FOREIGN KEY (`canton_snit_code`) REFERENCES `cantons` (`canton_snit_code`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gm_current_georeport_id` FOREIGN KEY (`current_georeport_id`) REFERENCES `georeports` (`georeport_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gm_district_snit_code` FOREIGN KEY (`district_snit_code`) REFERENCES `districts` (`district_snit_code`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gm_province_snit_code` FOREIGN KEY (`province_snit_code`) REFERENCES `provinces` (`province_snit_code`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `georeports`
--
ALTER TABLE `georeports`
  ADD CONSTRAINT `fk_gr_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gr_geomanifestation_id` FOREIGN KEY (`geomanifestation_id`) REFERENCES `geomanifestations` (`geomanifestation_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gr_inlab_test_id` FOREIGN KEY (`inlab_test_id`) REFERENCES `inlab_tests` (`inlab_test_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gr_insitu_test_id` FOREIGN KEY (`insitu_test_id`) REFERENCES `insitu_tests` (`insitu_test_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `inlab_tests`
--
ALTER TABLE `inlab_tests`
  ADD CONSTRAINT `fk_inlab_tests_manifestation_id` FOREIGN KEY (`geomanifestation_id`) REFERENCES `geomanifestations` (`geomanifestation_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inlabt_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `insitu_tests`
--
ALTER TABLE `insitu_tests`
  ADD CONSTRAINT `fk_insitu_test_manifestation_id` FOREIGN KEY (`geomanifestation_id`) REFERENCES `geomanifestations` (`geomanifestation_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_insitut_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `logs_entries`
--
ALTER TABLE `logs_entries`
  ADD CONSTRAINT `logs_entries_ibfk_1` FOREIGN KEY (`log_id`) REFERENCES `logs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresht_replaced_by` FOREIGN KEY (`replaced_by`) REFERENCES `refresh_tokens` (`refresh_token_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_refresht_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `fk_r_canton_snit_code` FOREIGN KEY (`canton_snit_code`) REFERENCES `cantons` (`canton_snit_code`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_r_district_snit_code` FOREIGN KEY (`district_snit_code`) REFERENCES `districts` (`district_snit_code`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_r_province_snit_code` FOREIGN KEY (`province_snit_code`) REFERENCES `provinces` (`province_snit_code`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_r_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `requests_state`
--
ALTER TABLE `requests_state`
  ADD CONSTRAINT `fk_rs_request_id` FOREIGN KEY (`request_id`) REFERENCES `requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
