-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 04, 2026 at 11:28 PM
-- Server version: 8.0.45-0ubuntu0.24.04.1
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
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'b19527b931ec52dcac38ddf72565ef0c2858222ab51959be7c2ccc966ec90975', '2026-02-20 21:11:28', '2026-02-20 19:41:28', NULL, '2026-02-21 01:41:28'),
('06E9GJ4K61A8H6CC3C5WRWJFY4', '5391ede6a9fcbc59b9a0ea8c65cb0eff0b8c9bccb07f7d11d0ae04f82db604a8', '2026-03-04 18:49:10', '2026-03-04 17:19:10', NULL, '2026-03-04 23:10:38');

-- --------------------------------------------------------

--
-- Table structure for table `analysis_requests`
--

CREATE TABLE `analysis_requests` (
  `id` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SOLI-XXXXX',
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
  `deleted_at` datetime DEFAULT NULL,
  `region_id` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `analysis_requests`
--

INSERT INTO `analysis_requests` (`id`, `name`, `email`, `owner_contact_number`, `owner_name`, `temperature_sensation`, `bubbles`, `details`, `current_usage`, `latitude`, `longitude`, `state`, `created_at`, `created_by`, `modified_at`, `deleted_at`, `region_id`) VALUES
('06E0TWE4XKV5TX5NC6GZVKC9CG', 'SOLI-06E', 'propietario@example.com', '88881234', 'Juan Pérez', 'Frío', 1, 'Se observa presencia de burbujeo cerca del pozo', 'Riego agrícola', 9.9333300, -84.0833300, 'Pendiente', '2026-01-29 23:48:05', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-03-03 14:20:42', NULL, 3),
('06EBAR4J053T4TS52TTJRMKM1W', 'SOLI-MKM1W', 'owner@example.com', '+56912345678', 'Juan Pérez', 'hot', 1, 'Some details about the manifestation', 'agricultural', -33.4569000, -70.6483000, 'Pendiente', '2026-03-03 14:25:30', '06E9GJ4K61A8H6CC3C5WRWJFY4', NULL, NULL, 1);

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
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'ceae1ccf2c7b3436a6e2a866fd35b6c7f98f58adcdcd3fd42af39be68c856332', '2026-03-22 19:41:28', NULL, '2026-02-20 19:41:28', '2026-02-21 01:41:28'),
('06E9GJ4K61A8H6CC3C5WRWJFY4', '49cfc61fcd778d003b4471a3c0ec999f7d9f8fff972633773f70c6b6ff5278df', '2026-04-03 17:19:11', NULL, '2026-03-04 17:19:11', '2026-03-04 23:10:38');

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `id` tinyint NOT NULL,
  `name` enum('Guanacaste','Alajuela','San José','Puntarenas','Limón','Heredia','Cartago') COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `regions`
--

INSERT INTO `regions` (`id`, `name`, `created_at`) VALUES
(1, 'Guanacaste', '2026-02-27 00:30:59'),
(2, 'Alajuela', '2026-02-27 00:30:59'),
(3, 'San José', '2026-02-27 00:30:59'),
(4, 'Puntarenas', '2026-02-27 00:30:59'),
(5, 'Limón', '2026-02-27 00:30:59'),
(6, 'Heredia', '2026-02-27 00:30:59'),
(7, 'Cartago', '2026-02-27 00:30:59');

-- --------------------------------------------------------

--
-- Table structure for table `registered_geothermal_manifestations`
--

CREATE TABLE `registered_geothermal_manifestations` (
  `id` char(26) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SOLI-XXXXX',
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
  `deleted_by` char(26) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `region_id` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registered_geothermal_manifestations`
--

INSERT INTO `registered_geothermal_manifestations` (`id`, `name`, `latitude`, `longitude`, `description`, `temperature`, `field_pH`, `field_conductivity`, `lab_pH`, `lab_conductivity`, `cl`, `ca`, `hco3`, `so4`, `fe`, `si`, `b`, `li`, `f`, `na`, `k`, `mg`, `created_at`, `created_by`, `modified_at`, `modified_by`, `deleted_at`, `deleted_by`, `region_id`) VALUES
('06E0V246K7DNDQQM9NXREH6FT0', 'RGM-007', 9.9333300, -84.0833300, 'Manifestación geotérmica superficial', 72.50, 6.80, 850.50, 6.90, 870.00, 120.4500, 35.2000, 180.7500, 45.1000, 0.8500, 32.4000, 1.2000, 0.4500, 0.9000, 95.6000, 8.2500, 18.4000, '2026-01-30 06:12:57', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL, NULL, '', NULL),
('06E103HQ1PJRQ99B1T68P9SF14', 'Test Manifestation 002 - Updated', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 17:58:13', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-30 12:22:14', '06E0TGS8ZBFNSVB2J8KA01NSZC', 1),
('06E10555Q4AFB4NZVK8E89SJ58', 'Test Manifestation 0111 - Updated', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:05:14', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-30 21:44:38', '06E0TGS8ZBFNSVB2J8KA01NSZC', 1),
('06E106K4M6755SQVWA4PE5Q7YG', 'Test Manifestation 0112 - Updated', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:11:31', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-01-30 21:48:58', '06E0TGS8ZBFNSVB2J8KA01NSZC', 1),
('06E107KVTS9FT4BT3S0N2ANGGC', 'Test Manifestation 02222 - Updated', 10.5555550, -85.1111110, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:15:59', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-03 17:42:48', '06E0TGS8ZBFNSVB2J8KA01NSZC', 1),
('06E1091PJ1KGV44CZQXRPW13NC', 'Test Manifestation 99', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 18:22:14', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E143XZDYM1G3SRM9PK97EMDR', 'Test Manifestation 00056', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:19:07', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E1448N1F2KPK2AAZEHMY50Z8', 'Test Manifestation 00877S', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:20:35', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E144MVT0AV7M3YZSRS1BM610', 'Test Manifestation 088', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:22:15', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E145YNGPACVT37V793KB6KG4', 'Test Manifestation 0976', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:27:57', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E146JRGFD7X5MQ285SDD9HAG', 'Test Manifestation 0977', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:30:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E146JRQZ8H288EA7BCS25YKW', 'Test Manifestation 0977 - Updated', 10.0000000, -85.0000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:30:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E146WZET4S99715W068RPP84', 'Test Manifestation 09888', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:32:06', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E146WZPYH3JYBK3NWWQ7EJ00', 'Test Manifestation 09888 - Updated', 10.0000000, -85.0000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:32:06', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E147YP1A1AQZPZ34MVTNRJ5G', 'Test Manifestation 09889', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:36:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E147YP9J6QG0PFAQ8AR1T6JM', 'Test Manifestation 09889 - Updated', 10.0000000, -85.0000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:36:42', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E14873XHXYMPGXRSK8490XAG', 'Test Manifestation 0100', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:37:51', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E149RV6FWSVGY0M3A521PZSR', 'Test Manifestation 0111', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:44:38', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E14ARHF9E3Y5D79WV94FR1ZW', 'Test Manifestation 0112', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-31 03:48:58', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06E2BRS3KDM3ER76JV2W9PATMC', 'Test Manifestation 02222', 10.1234560, -85.6543210, 'Test geothermal manifestation', 95.50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-03 23:42:48', '06E0TGS8ZBFNSVB2J8KA01NSZC', '2026-02-27 00:31:01', NULL, NULL, NULL, 1),
('06EBCG9ABY9EZJZAQF28ZA9XKC', 'Manifestación Test Marito O por Dios pero otra vez', -20.1234000, -69.5678000, 'Test description marito updated', 45.50, 7.20, 1200.00, 7.00, 1150.00, 10.5000, 5.2000, 3.1000, 2.8000, 0.1000, 1.5000, 0.3000, 0.0500, 0.2000, 8.0000, 1.2000, 0.9000, '2026-03-04 00:30:49', '06E9GJ4K61A8H6CC3C5WRWJFY4', '2026-03-04 01:13:52', '06E9GJ4K61A8H6CC3C5WRWJFY4', NULL, NULL, 1),
('06EBCGC9X1BA2V0JHAT10EAH9R', 'Manifestación Test Marito O por Dios', -20.1234000, -69.5678000, 'Test description marito', 45.50, 7.20, 1200.00, 7.00, 1150.00, 10.5000, 5.2000, 3.1000, 2.8000, 0.1000, 1.5000, 0.3000, 0.0500, 0.2000, 8.0000, 1.2000, 0.9000, '2026-03-04 00:31:14', '06E9GJ4K61A8H6CC3C5WRWJFY4', '2026-03-04 01:12:03', NULL, '2026-03-03 19:12:03', '06E9GJ4K61A8H6CC3C5WRWJFY4', 1);

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
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'Carlos', 'Perez', 'test4@test.com', '88881234', '$2y$10$lS8KHIMbRLD.SK0f/R4e4e1X4cWyPiYJ6YITNB4Rn94KdCogjd6Fm', 'admin', 1, 0, 0, NULL, NULL, '2026-01-29 22:57:11', '2026-02-12 19:26:17', NULL, NULL),
('06E9GJ4K61A8H6CC3C5WRWJFY4', 'Mario', 'Updated', 'mario@gmail.com', '87654321', '$2y$10$xbVsgsejIq/RLpdzq4jBR.CoZn.JDAk8nSIGMb3hxqOLKpc7kvevm', 'admin', 1, 0, 0, NULL, NULL, '2026-02-25 22:50:19', '2026-03-03 18:30:38', NULL, NULL);

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
  ADD KEY `fk_analysis_requests_user` (`created_by`),
  ADD KEY `fk_analysis_region` (`region_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`);

--
-- Indexes for table `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `registered_geothermal_manifestations`
--
ALTER TABLE `registered_geothermal_manifestations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_rgm_created_by_user` (`created_by`),
  ADD KEY `fk_rgm_modified_by_user` (`modified_by`),
  ADD KEY `region_id` (`region_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `id` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  ADD CONSTRAINT `fk_analysis_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`),
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
  ADD CONSTRAINT `fk_rgm_modified_by_user` FOREIGN KEY (`modified_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `registered_geothermal_manifestations_ibfk_1` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_deleted_by_user` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
