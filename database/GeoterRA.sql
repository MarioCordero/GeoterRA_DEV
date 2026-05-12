-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 12, 2026 at 01:40 AM
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
  `user_id` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token_hash` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `access_tokens`
--

INSERT INTO `access_tokens` (`user_id`, `token_hash`, `expires_at`, `updated_at`, `revoked_at`, `created_at`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'ef5bb3511835c8b499266d28267e1bee53057b7cefb93fdecae50f4c303211e1', '2026-04-24 14:43:06', '2026-04-24 13:13:06', NULL, '2026-02-21 01:41:28');

-- --------------------------------------------------------

--
-- Table structure for table `analysis_requests`
--

CREATE TABLE `analysis_requests` (
  `id` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SOLI-XXXXX',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `owner_contact_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `temperature_sensation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bubbles` tinyint(1) DEFAULT '0',
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `current_usage` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `state` enum('Pendiente','En revisi?n','Analizada','Eliminada') CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT 'Pendiente',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `modified_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `region_id` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `user_id` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`user_id`, `token_hash`, `expires_at`, `revoked_at`, `updated_at`, `created_at`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'e9b78bb15489268d7112dd728d26581f56340066ce3f7989a97a6c8858df137c', '2026-05-24 13:13:07', NULL, '2026-04-24 13:13:07', '2026-02-21 01:41:28');

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `id` tinyint NOT NULL,
  `name` enum('Guanacaste','Alajuela','San José','Puntarenas','Limón','Heredia','Cartago') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
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
(7, 'Cartago', '2026-03-17 02:30:54');

-- --------------------------------------------------------

--
-- Table structure for table `registered_geothermal_manifestations`
--

CREATE TABLE `registered_geothermal_manifestations` (
  `id` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'SOLI-XXXXX',
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
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
  `created_by` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `modified_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `region_id` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registered_geothermal_manifestations`
--

INSERT INTO `registered_geothermal_manifestations` (`id`, `name`, `latitude`, `longitude`, `description`, `temperature`, `field_pH`, `field_conductivity`, `lab_pH`, `lab_conductivity`, `cl`, `ca`, `hco3`, `so4`, `fe`, `si`, `b`, `li`, `f`, `na`, `k`, `mg`, `created_at`, `created_by`, `modified_at`, `modified_by`, `deleted_at`, `deleted_by`, `region_id`) VALUES
('06F1FA5F486WEWTCRGSVZYJT6R', 'Termal Sitio U1', 10.9401065, -85.1931900, 'Geothermal manifestation', 46.50, 6.80, 532.00, 6.95, 523.00, 9.8000, 58.9000, 246.0000, 60.8000, 0.0700, 157.0000, 1.0000, NULL, 0.5000, 57.7000, 11.2000, 16.9000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 1),
('06F1FA5F486WEWTCRGSVZYJT6S', 'Termal CTP1', 9.8663925, -83.1830515, 'Geothermal manifestation', 41.00, 6.51, 685.00, 6.37, 665.00, 12.2000, 59.8000, 389.0000, 42.1000, 0.0700, 142.0000, 10.0000, NULL, 0.5000, 68.8000, 15.5000, 32.7000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 3),
('06F1FA5F486WEWTCRGSVZYJT6T', 'Termal CTP2', 9.8812554, -83.1799590, 'Geothermal manifestation', 46.00, 6.70, 940.00, 6.74, 915.00, 16.2000, 78.4000, 578.0000, 58.1000, 0.0700, 150.0000, 10.0000, NULL, 0.5000, 104.2000, 10.6000, 46.3000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 3),
('06F1FA5F486WEWTCRGSVZYJT6U', 'Termal CTP3', 9.8894680, -83.1796559, 'Geothermal manifestation', 46.00, 6.25, 1070.00, 6.33, 912.00, 15.9000, 73.2000, 551.5000, 57.4000, 0.0700, 150.0000, 10.0000, NULL, 0.5000, 107.1000, 14.1000, 45.9000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 3),
('06F1FA5F486WEWTCRGSVZYJT6V', 'Termal Guayacan', 9.7016162, -83.1895091, 'Geothermal manifestation', 59.00, NULL, NULL, 2.17, 7460.00, 78.0000, 104.0000, 0.0000, 3944.0000, 103.0000, 266.0000, 4.0000, 1.0000, 0.5000, 55.0000, 3.0000, 37.0000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 7),
('06F1FA5F486WEWTCRGSVZYJT6W', 'Termal Josue Ujate', 9.9498760, -83.1605745, 'Geothermal manifestation', 36.00, 2.83, NULL, 2.78, 2770.00, 188.0000, 213.0000, 0.0000, 1383.0000, 2.9200, 162.0000, 2.0000, 1.0000, 0.5000, 56.0000, 9.0000, 65.0000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 3),
('06F1FA5F486WEWTCRGSVZYJT6X', 'Termal R Prados1', 9.8800241, -83.1718535, 'Geothermal manifestation', 42.00, 6.20, 1100.00, 6.17, 876.00, 75.9000, 58.8000, 443.5000, 14.3000, 0.0700, 156.0000, 4.0000, 1.0000, 0.5000, 157.0000, 17.5000, 28.7000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 7),
('06F1FA5F486WEWTCRGSVZYJT6Y', 'Termal R Prados2', 9.8805682, -83.1718862, 'Geothermal manifestation', 44.60, 6.15, 1080.00, 6.24, 900.00, 80.1000, 59.4000, 447.0000, 14.2000, 0.0700, 150.0000, 10.0000, 1.0000, 0.5000, 184.3000, 15.6000, 26.8000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 7),
('06F1FA5F486WEWTCRGSVZYJT6Z', 'Termal R Prados3', 9.8814163, -83.1752232, 'Geothermal manifestation', NULL, 6.05, NULL, 6.09, 482.00, 6.2000, 45.3000, 327.5000, 5.6000, 0.0700, 131.0000, 10.0000, 1.0000, 0.5000, 59.6000, 8.8000, 21.0000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 7),
('06F1FA5F486WEWTCRGSVZYJT70', 'Termal R Prados4', 9.8807762, -83.1757882, 'Geothermal manifestation', 31.20, 6.04, NULL, 6.05, 368.00, 5.6000, 36.8000, 251.0000, 2.9000, 0.0700, 120.0000, 10.0000, 1.0000, 0.5000, 40.0000, 8.7000, 17.0000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 7),
('06F1FA5F486WEWTCRGSVZYJT71', 'Termal Guayacan Alt', 9.9350359, -83.1853346, 'Geothermal manifestation', 39.00, 5.85, 420.00, 5.85, 416.00, 8.1000, 46.5000, 201.0000, 43.5000, 0.0700, 124.0000, 10.0000, 1.0000, 0.5000, 41.9000, 14.5000, 14.3000, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', NULL, NULL, NULL, NULL, 6);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `failed_login_attempts` int NOT NULL DEFAULT '0',
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` char(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `phone_number`, `password_hash`, `role`, `is_active`, `is_verified`, `failed_login_attempts`, `last_login_at`, `password_changed_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'Carlos', 'PerezEdited', 'test4@test.com', '88881234', '$2y$10$xbVsgsejIq/RLpdzq4jBR.CoZn.JDAk8nSIGMb3hxqOLKpc7kvevm', 'admin', 0, 0, 0, NULL, NULL, '2026-01-29 22:57:11', '2026-04-24 13:12:25', '2026-04-24 13:12:25', '06E0TGS8ZBFNSVB2J8KA01NSZC'),
('06E9GJ4K61A8H6CC3C5WRWJFY4', 'Mario', 'Updated', 'mario@user.com', '87654321', '$2y$10$hRvqu/lf9ghaWtNxNeuozuHRYE2LgjrGkg5Wjh1bgfdM6a/OtCSH.', 'user', 1, 0, 0, NULL, NULL, '2026-02-25 22:50:19', '2026-05-11 18:38:59', NULL, NULL),
('06EJ2JM5Z1QVHV5HFD64S07W5W', 'MarioCo', 'DeveloperEdited', 'mario@developer.com', '888888889', '$2y$10$hRvqu/lf9ghaWtNxNeuozuHRYE2LgjrGkg5Wjh1bgfdM6a/OtCSH.', 'maintenance', 1, 0, 0, NULL, NULL, '2026-03-24 13:20:25', '2026-04-28 14:15:36', NULL, NULL),
('06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', 'Mario', 'Admin', 'mario@admin.com', '84264310', '$2y$10$hRvqu/lf9ghaWtNxNeuozuHRYE2LgjrGkg5Wjh1bgfdM6a/OtCSH.', 'admin', 1, 0, 0, NULL, NULL, '2026-04-28 14:32:20', '2026-05-11 18:38:04', NULL, NULL);

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
  MODIFY `id` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
