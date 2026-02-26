-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 23, 2026 at 08:40 PM
-- Server version: 8.0.44-0ubuntu0.24.04.2
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `GeoterRA`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_tokens`
--

CREATE TABLE `access_tokens` (
  `user_id` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `access_tokens`
--

INSERT INTO `access_tokens` (`user_id`, `token_hash`, `expires_at`, `updated_at`, `revoked_at`, `created_at`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'b19527b931ec52dcac38ddf72565ef0c2858222ab51959be7c2ccc966ec90975', '2026-02-20 21:11:28', '2026-02-20 19:41:28', NULL, '2026-02-21 01:41:28');

-- --------------------------------------------------------

--
-- Table structure for table `analysis_requests`
--

CREATE TABLE `analysis_requests` (
  `id` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SOLI-XXXXX',
  `region` enum('Alajuela','San_José','Cartago','Heredia','Limón','Puntarenas','Guanacaste') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `owner_contact_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `temperature_sensation` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bubbles` tinyint(1) DEFAULT '0',
  `details` text COLLATE utf8mb4_general_ci,
  `current_usage` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `state` enum('Pendiente','En revisi?n','Analizada','Eliminada') CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT 'Pendiente',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `modified_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `analysis_requests`
--

INSERT INTO `analysis_requests` (`id`, `name`, `region`, `email`, `owner_contact_number`, `owner_name`, `temperature_sensation`, `bubbles`, `details`, `current_usage`, `latitude`, `longitude`, `state`, `created_at`, `created_by`, `modified_at`, `deleted_at`) VALUES
('06E0TWE4XKV5TX5NC6GZVKC9CG', 'SOLI-06E', 'San_José', 'propietario@example.com', '88881234', 'Juan Pérez', 'Frío', 1, 'Se observa presencia de burbujeo cerca del pozo', 'Riego agrícola', 9.9333300, -84.0833300, 'Pendiente', '2026-01-29 23:48:05', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `user_id` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`user_id`, `token_hash`, `expires_at`, `revoked_at`, `updated_at`, `created_at`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'ceae1ccf2c7b3436a6e2a866fd35b6c7f98f58adcdcd3fd42af39be68c856332', '2026-03-22 19:41:28', NULL, '2026-02-20 19:41:28', '2026-02-21 01:41:28');

-- --------------------------------------------------------

--
-- Table structure for table `registered_geothermal_manifestations`
--

CREATE TABLE `registered_geothermal_manifestations` (
  `id` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SOLI-XXXXX',
  `region` enum('Guanacaste','Alajuela','San_José','Puntarenas','Limón','Heredia','Cartago') COLLATE utf8mb4_general_ci NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `temperature` decimal(6,2) DEFAULT NULL,
  `field_pH` decimal(4,2) DEFAULT NULL,
  `field_conductivity` decimal(10,2) DEFAULT NULL,
  `lab_pH` decimal(4,2) DEFAULT NULL,
  `lab_conductivity` decimal(10,2) DEFAULT NULL,
  `cl` decimal(10,4) DEFAULT NULL,
  `ca` decimal(10,4) DEFAULT NULL,
  `hco3` decimal(10,4) DEFAULT NULL,
  `so4` decimal(10,4) DEFAULT NULL,
  `fe` decimal(10,4) DEFAULT NULL,
  `si` decimal(10,4) DEFAULT NULL,
  `b` decimal(10,4) DEFAULT NULL,
  `li` decimal(10,4) DEFAULT NULL,
  `f` decimal(10,4) DEFAULT NULL,
  `na` decimal(10,4) DEFAULT NULL,
  `k` decimal(10,4) DEFAULT NULL,
  `mg` decimal(10,4) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `modified_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` char(26) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` char(26) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registered_geothermal_manifestations`
--

INSERT INTO `registered_geothermal_manifestations` (`id`, `name`, `region`, `latitude`, `longitude`, `description`, `temperature`, `field_pH`, `field_conductivity`, `lab_pH`, `lab_conductivity`, `cl`, `ca`, `hco3`, `so4`, `fe`, `si`, `b`, `li`, `f`, `na`, `k`, `mg`, `created_at`, `created_by`, `modified_at`, `modified_by`, `deleted_at`, `deleted_by`) VALUES
('06E0V246K7DNDQQM9NXREH6FT0', 'RGM-007', 'San_José', 9.9333300, -84.0833300, 'Manifestación geotérmica superficial', 72.50, 6.80, 850.50, 6.90, 870.00, 120.4500, 35.2000, 180.7500, 45.1000, 0.8500, 32.4000, 1.2000, 0.4500, 0.9000, 95.6000, 8.2500, 18.4000, '2026-01-30 06:12:57', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, ''),
('06E103HQ1PJRQ99B1T68P9SF14', 'Test Manifestation 002 - Updated', 'Guanacaste', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 17:58:13', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-30 18:22:14', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-30 12:22:14', '06E0TGS8ZBFNSVB2J8KA01NSZC'),
('06E10555Q4AFB4NZVK8E89SJ58', 'Test Manifestation 0111 - Updated', 'Guanacaste', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:05:14', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-31 03:44:38', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-30 21:44:38', '06E0TGS8ZBFNSVB2J8KA01NSZC'),
('06E106K4M6755SQVWA4PE5Q7YG', 'Test Manifestation 0112 - Updated', 'Guanacaste', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:11:31', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-31 03:48:58', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-30 21:48:58', '06E0TGS8ZBFNSVB2J8KA01NSZC'),
('06E107KVTS9FT4BT3S0N2ANGGC', 'Test Manifestation 02222 - Updated', 'Guanacaste', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:15:59', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-03 23:42:48', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-03 17:42:48', '06E0TGS8ZBFNSVB2J8KA01NSZC'),
('06E1091PJ1KGV44CZQXRPW13NC', 'Test Manifestation 99', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:22:14', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E143XZDYM1G3SRM9PK97EMDR', 'Test Manifestation 00056', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:19:07', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E1448N1F2KPK2AAZEHMY50Z8', 'Test Manifestation 00877S', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:20:35', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E144MVT0AV7M3YZSRS1BM610', 'Test Manifestation 088', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:22:15', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E145YNGPACVT37V793KB6KG4', 'Test Manifestation 0976', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:27:57', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E146JRGFD7X5MQ285SDD9HAG', 'Test Manifestation 0977', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:30:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E146JRQZ8H288EA7BCS25YKW', 'Test Manifestation 0977 - Updated', 'Guanacaste', 10.0000000, -85.0000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:30:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E146WZET4S99715W068RPP84', 'Test Manifestation 09888', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:32:06', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E146WZPYH3JYBK3NWWQ7EJ00', 'Test Manifestation 09888 - Updated', 'Guanacaste', 10.0000000, -85.0000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:32:06', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E147YP1A1AQZPZ34MVTNRJ5G', 'Test Manifestation 09889', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:36:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E147YP9J6QG0PFAQ8AR1T6JM', 'Test Manifestation 09889 - Updated', 'Guanacaste', 10.0000000, -85.0000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:36:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E14873XHXYMPGXRSK8490XAG', 'Test Manifestation 0100', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:37:51', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E149RV6FWSVGY0M3A521PZSR', 'Test Manifestation 0111', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:44:38', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E14ARHF9E3Y5D79WV94FR1ZW', 'Test Manifestation 0112', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:48:58', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL),
('06E2BRS3KDM3ER76JV2W9PATMC', 'Test Manifestation 02222', 'Guanacaste', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-03 23:42:48', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user','moderator') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `failed_login_attempts` int NOT NULL DEFAULT '0',
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` char(26) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `phone_number`, `password_hash`, `role`, `is_active`, `is_verified`, `failed_login_attempts`, `last_login_at`, `password_changed_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'Carlos', 'Perez', 'test4@test.com', '88881234', '$2y$10$lS8KHIMbRLD.SK0f/R4e4e1X4cWyPiYJ6YITNB4Rn94KdCogjd6Fm', 'admin', 1, 0, 0, NULL, NULL, '2026-01-29 22:57:11', '2026-02-12 19:26:17', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD UNIQUE KEY `user_id` (`user_id`) USING BTREE;

--
-- Indexes for table `analysis_requests`
--
ALTER TABLE `analysis_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_analysis_requests_user` (`created_by`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`);

--
-- Indexes for table `registered_geothermal_manifestations`
--
ALTER TABLE `registered_geothermal_manifestations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_rgm_created_by_user` (`created_by`),
  ADD KEY `fk_rgm_modified_by_user` (`modified_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `fk_deleted_by_user` (`deleted_by`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD CONSTRAINT `fk_access_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `analysis_requests`
--
ALTER TABLE `analysis_requests`
  ADD CONSTRAINT `fk_analysis_requests_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `registered_geothermal_manifestations`
--
ALTER TABLE `registered_geothermal_manifestations`
  ADD CONSTRAINT `fk_rgm_created_by_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rgm_modified_by_user` FOREIGN KEY (`modified_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_deleted_by_user` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
