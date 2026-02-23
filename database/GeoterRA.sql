-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 23-02-2026 a las 17:51:06
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
-- Base de datos: `GeoterRa`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `access_tokens`
--

CREATE TABLE `access_tokens` (
  `user_id` char(26) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `access_tokens`
--

INSERT INTO `access_tokens` (`user_id`, `token_hash`, `expires_at`, `updated_at`, `revoked_at`, `created_at`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'b19527b931ec52dcac38ddf72565ef0c2858222ab51959be7c2ccc966ec90975', '2026-02-20 21:11:28', '2026-02-20 19:41:28', NULL, '2026-02-21 01:41:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `analysis_requests`
--

CREATE TABLE `analysis_requests` (
  `id` char(26) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'SOLI-XXXXX',
  `region` enum('Alajuela','San_José','Cartago','Heredia','Limón','Puntarenas','Guanacaste') DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `owner_contact_number` varchar(50) DEFAULT NULL,
  `owner_name` varchar(255) NOT NULL,
  `temperature_sensation` varchar(50) DEFAULT NULL,
  `bubbles` tinyint(1) DEFAULT 0,
  `details` text DEFAULT NULL,
  `current_usage` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `state` enum('Pendiente','En revisi?n','Analizada','Eliminada') CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT 'Pendiente',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL,
  `modified_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `analysis_requests`
--

INSERT INTO `analysis_requests` (`id`, `name`, `region`, `email`, `owner_contact_number`, `owner_name`, `temperature_sensation`, `bubbles`, `details`, `current_usage`, `latitude`, `longitude`, `state`, `created_at`, `created_by`, `modified_at`, `deleted_at`) VALUES
('06E0TWE4XKV5TX5NC6GZVKC9CG', 'SOLI-06E', 'San_José', 'propietario@example.com', '88881234', 'Juan Pérez', 'Frío', 1, 'Se observa presencia de burbujeo cerca del pozo', 'Riego agrícola', 9.9333300, -84.0833300, 'Pendiente', '2026-01-29 23:48:05', '06E0TGS8ZBFNSVB2J8KA01NSZC', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puntos_estudiados`
--

CREATE TABLE `puntos_estudiados` (
  `id` varchar(30) NOT NULL,
  `region` varchar(50) NOT NULL,
  `coord_x` double NOT NULL,
  `coord_y` double NOT NULL,
  `temp` double NOT NULL,
  `pH_campo` double NOT NULL,
  `cond_campo` double NOT NULL,
  `pH_lab` double NOT NULL,
  `cond_lab` double NOT NULL,
  `Cl` double NOT NULL,
  `Ca+` double NOT NULL,
  `HCO3` double NOT NULL,
  `SO4` double NOT NULL,
  `Fe` varchar(10) NOT NULL,
  `Si` double NOT NULL,
  `B` varchar(10) NOT NULL,
  `Li` varchar(10) NOT NULL,
  `F` varchar(10) NOT NULL,
  `Na` double NOT NULL,
  `K` double NOT NULL,
  `MG+` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `puntos_estudiados`
--

INSERT INTO `puntos_estudiados` (`id`, `region`, `coord_x`, `coord_y`, `temp`, `pH_campo`, `cond_campo`, `pH_lab`, `cond_lab`, `Cl`, `Ca+`, `HCO3`, `SO4`, `Fe`, `Si`, `B`, `Li`, `F`, `Na`, `K`, `MG+`) VALUES
('POINT-0026', 'Prueba', -84.1278076171875, 9.893098633379584, 25, 7, 500, 7, 500, 10, 20, 30, 40, '< 0.07', 50, '< 1.0', '< 1', '< 0.5', 60, 70, 80),
('POINT-0027', 'Prueba', -84.02343750000001, 10.152746165571939, 40, 7, 500, 7, 500, 10, 20, 30, 40, '< 0.07', 50, '< 1.0', '< 1', '< 0.5', 60, 70, 80),
('PRUEBA1', 'Heredia', -87.3937, 8.9276, 25, 7.1, 500, 7, 500, 10, 20, 30, 40, '0.1', 50, '0.2', '0.3', '0.4', 60, 70, 80),
('PRUEBA2', 'San José', -86.1102, 7.9272, 27, 6.8, 600, 7.2, 600, 11, 21, 31, 41, '0.2', 51, '0.3', '0.4', '0.5', 61, 71, 81),
('Termal CTP-1', 'Guanacaste', -85.3477, 10.7476, 41, 6.51, 685, 6.37, 665, 12.2, 59.8, 389, 42.1, '< 0.07', 142, '< 1,0', '< 1', '< 0.5', 68.8, 15.5, 32.7),
('Termal CTP-2', 'Guanacaste', -85.3482, 10.7448, 46, 6.7, 940, 6.74, 915, 16.2, 78.4, 578, 58.1, '< 0.07', 150, '< 1,0', '< 1', '< 0.5', 104.2, 10.6, 46.3),
('Termal CTP-3', 'Guanacaste', -85.348, 10.7448, 46, 6, 1070, 6, 912, 15, 79, 551, 57, '< 0.07', 150, '< 1,0', '< 1', '< 0.5', 107, 14, 45),
('Termal Guayabal', 'Guanacaste', -85.3202, 10.8262, 59, 0, 0, 2, 7480, 728, 104, 0, 3344, '103,0', 265, '4,0', '< 1', '< 0.5', 55, 3, 37),
('Termal Guayacan', 'Guanacaste', -85.3282, 10.7922, 39, 5, 420, 5, 416, 8, 46, 201, 43, '< 0.07', 124, '< 1,0', '< 1', '< 0.5', 41, 14, 14),
('Termal Josue Ulate', 'Guanacaste', -85.3257, 10.8127, 36, 2, 0, 2, 2770, 188, 203, 0, 1383, '2,92', 162, '2,0', '< 1', '< 0.5', 56, 9, 65),
('Termal R. Perdido-1', 'Guanacaste', -85.3362, 10.6702, 42, 6, 1100, 6, 876, 75, 58, 443, 14, '< 0.07', 156, '4,0', '< 1', '< 0.5', 167, 17, 26),
('Termal R. Perdido-2', 'Guanacaste', -85.3361, 10.67, 44, 6, 1080, 6, 900, 80, 59, 447, 14, '< 0.07', 155, '< 1,0', '< 1', '< 0.5', 184, 16, 26),
('Termal R. Perdido-3', 'Guanacaste', -85.336, 10.6698, 0, 6, 0, 6, 482, 6, 45, 327, 5, '< 0.07', 131, '< 1,0', '< 1', '< 0.5', 59, 8, 21),
('Termal R. Perdido-4', 'Guanacaste', -85.3361, 10.6695, 31, 6, 0, 6, 368, 5, 36, 251, 2, '< 0.07', 120, '< 1,0', '< 1', '< 0.5', 40, 8, 17),
('Termal Sitio U-1', 'Guanacaste', -85.3932, 10.7821, 46.5, 6.8, 532, 6.96, 523, 9.8, 58.9, 246, 60.8, '< 0.07', 157, '1.0', '< 1', '< 0.5', 57.7, 11.2, 16.9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `user_id` char(26) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL DEFAULT current_timestamp(),
  `revoked_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`user_id`, `token_hash`, `expires_at`, `revoked_at`, `updated_at`, `created_at`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'ceae1ccf2c7b3436a6e2a866fd35b6c7f98f58adcdcd3fd42af39be68c856332', '2026-03-22 19:41:28', NULL, '2026-02-20 19:41:28', '2026-02-21 01:41:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registered_geothermal_manifestations`
--

CREATE TABLE `registered_geothermal_manifestations` (
  `id` char(26) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'SOLI-XXXXX',
  `region` enum('Guanacaste','Alajuela','San_José','Puntarenas','Limón','Heredia','Cartago') NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `description` text DEFAULT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` char(26) NOT NULL,
  `modified_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `modified_by` char(26) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` char(26) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registered_geothermal_manifestations`
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
-- Estructura de tabla para la tabla `reg_usr`
--

CREATE TABLE `reg_usr` (
  `id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `rol` varchar(10) NOT NULL DEFAULT 'usr'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reg_usr`
--

INSERT INTO `reg_usr` (`id`, `email`, `password`, `first_name`, `last_name`, `phone_number`, `rol`) VALUES
(394, 'mcolls0@cargocollective.com', 'fQ1|<U*v0sCh', 'Melli', 'Colls', '3252338213', ''),
(395, 'atorre1@un.org', 'aG2!1.gnU8Y&$<', 'Angelo', 'Torre', '3869834587', ''),
(396, 'npiegrome2@dailymotion.com', 'jJ0+\".a3gDzzTL', 'Nikki', 'Piegrome', '8533930682', ''),
(397, 'fleece3@nytimes.com', 'fP9\'#W4D.r', 'Finlay', 'Leece', '1521935366', ''),
(398, 'kwheatley4@pbs.org', 'bZ7}0gPLT9Si(=', 'Kiersten', 'Wheatley', '6592142198', ''),
(399, 'gscottesmoor5@nsw.gov.au', 'pL0|`<$Q$jt', 'Gene', 'Scottesmoor', '3386788735', ''),
(400, 'slaurent6@bizjournals.com', 'zJ6{PWk*Ea', 'Susette', 'Laurent', '1088106907', ''),
(401, 'rvlasyev7@berkeley.edu', 'pB8>G1,r', 'Reynold', 'Vlasyev', '7626731392', ''),
(402, 'sdanson8@sogou.com', 'tB1<.?<)HMSIkRe~', 'Storm', 'Danson', '8871713198', ''),
(403, 'emompesson9@ebay.co.uk', 'vQ4_G{iOr', 'Ephrayim', 'Mompesson', '4493591801', ''),
(404, 'mjancya@seattletimes.com', 'bR6)q1kj', 'Mariann', 'Jancy', '1761977507', ''),
(405, 'erihanekb@phoca.cz', 'zI4+M9*gCy|', 'Elijah', 'Rihanek', '9085347035', ''),
(406, 'remlenc@springer.com', 'pN4#_B|ac*BlyUp', 'Ruthi', 'Emlen', '9627676911', ''),
(407, 'wchasled@senate.gov', 'vV5,S6LeLe%', 'Wilmette', 'Chasle', '6892624853', ''),
(408, 'ndwelleye@shinystat.com', 'pP4)UxBA%', 'Nil', 'Dwelley', '3164865866', ''),
(409, 'gwallheadf@go.com', 'aH2?+dIB8', 'Grata', 'Wallhead', '5257395908', ''),
(410, 'eelflaing@jiathis.com', 'eG1%FEo3tDV', 'Ekaterina', 'Elflain', '1247889371', ''),
(411, 'pcartmaleh@booking.com', 'yL3.$aQ\"', 'Pen', 'Cartmale', '8468850822', ''),
(412, 'hbygatei@last.fm', 'lO7&Cx0', 'Hunt', 'Bygate', '9861065885', ''),
(413, 'bmassardj@taobao.com', 'dP0|d~Yjv31', 'Brietta', 'Massard', '3827107030', ''),
(414, 'bskeldonk@ask.com', 'dE5/\"PJm(qP\'7O', 'Babita', 'Skeldon', '3906903806', ''),
(415, 'lmalenfantl@mashable.com', 'oI8>)4|!!+', 'Lexie', 'Malenfant', '5185123422', ''),
(416, 'mrizziellom@sakura.ne.jp', 'gG4<X4h{Q9!2GDU', 'Moyna', 'Rizziello', '6014108455', ''),
(417, 'aschimonn@ca.gov', 'kD9$M(Ws>4_T6\"c', 'Alleyn', 'Schimon', '5687278146', ''),
(418, 'mduffillo@ning.com', 'iF1`N$2,', 'Melessa', 'Duffill', '2243569729', ''),
(419, 'mwasmuthp@foxnews.com', 'jO7WVuKCOZ&0AM', 'Manon', 'Wasmuth', '9322387774', ''),
(420, 'otathamq@youtube.com', 'mO0,L#q(k>IR%2Xh', 'Olympe', 'Tatham', '5154733236', ''),
(421, 'kmadginr@hubpages.com', 'wY6>J{u<EmDXjp9', 'Kalindi', 'Madgin', '4925700879', ''),
(422, 'cblacklidges@barnesandnoble.com', 'pH2@`l+)VoMvs9@\'', 'Corny', 'Blacklidge', '9286044568', ''),
(423, 'hlightowlert@whitehouse.gov', 'vM8/L1Hn)Sw>mS', 'Helene', 'Lightowler', '2735240730', ''),
(424, 'ewoodfineu@walmart.com', 'uH9=zp\"C~3', 'Ede', 'Woodfine', '3401054393', ''),
(425, 'mmcallasterv@whitehouse.gov', 'dY2>_q!&6', 'Miller', 'McAllaster', '4209349252', ''),
(426, 'rfedynskiw@icq.com', 'uK6<RS,r.j`}', 'Rosalinde', 'Fedynski', '7607795359', ''),
(427, 'gantonoczykx@ehow.com', 'mX0`RlAk', 'Goldia', 'Antonoczyk', '9901959652', ''),
(428, 'fbutchery@msu.edu', 'hD2#(\"@tF%I/(zp', 'Floria', 'Butcher', '1141176217', ''),
(429, 'tculshawz@gov.uk', 'bE2@H<,E~>Z7', 'Tandi', 'Culshaw', '7466119402', ''),
(430, 'belsey10@wsj.com', 'vA1+%*%pi', 'Brande', 'Elsey', '2646036181', ''),
(431, 'hslocom11@de.vu', 'eU5.wg)t+8/r', 'Hilde', 'Slocom', '8595729551', ''),
(432, 'jdabbes12@house.gov', 'fR8?0qPVhV0&}>i', 'Jelene', 'Dabbes', '6377116898', ''),
(433, 'jalebrooke13@netscape.com', 'rH0}n$tJ2B(', 'Joey', 'Alebrooke', '6795661165', ''),
(434, 'ebenezeit14@nih.gov', 'oQ7)JbchQ1', 'Esdras', 'Benezeit', '7182184857', ''),
(435, 'skrates15@mediafire.com', 'dT8~5tOEJR}#s', 'Sara-ann', 'Krates', '8541912355', ''),
(436, 'rabbott16@yelp.com', 'cF4@UL~4<%phZ%tT', 'Raul', 'Abbott', '6321569369', ''),
(437, 'lwoollons17@sourceforge.net', 'uA3?}_ErhL', 'Lacee', 'Woollons', '6389473722', ''),
(438, 'wmeenehan18@dion.ne.jp', 'fW6!x{WAj|&d4h', 'Waldemar', 'Meenehan', '4444568899', ''),
(439, 'plandes19@omniture.com', 'qI3$Lj<D/73JF', 'Preston', 'Landes', '2845394969', ''),
(440, 'akettle1a@storify.com', 'qH1)(~lztUSj%SE', 'Angie', 'Kettle', '1847740165', ''),
(441, 'squaltro1b@shareasale.com', 'zP9<k1iBbgB|\"aVE', 'Swen', 'Qualtro', '1613555051', ''),
(442, 'llower1c@biglobe.ne.jp', 'qD8!<|4=0', 'Luce', 'Lower', '7569086054', ''),
(443, 'mcarlo1d@netscape.com', 'kB4/%On\'&9', 'Mollie', 'Carlo', '8838281420', ''),
(444, 'test@test.com', 'test', 'Christopher', 'Acosta Madrigal', '86473533', 'admin'),
(446, 'cordero@gmail.com', '2003', 'Mario', 'Cordero', '83443610', 'usr');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id_soli` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `region` varchar(50) NOT NULL,
  `fecha` date DEFAULT NULL,
  `propietario` varchar(50) DEFAULT NULL,
  `num_telefono` varchar(8) DEFAULT NULL,
  `coord_x` double DEFAULT NULL,
  `coord_y` double DEFAULT NULL,
  `direccion` varchar(100) NOT NULL,
  `uso_actual` varchar(80) DEFAULT NULL,
  `sens_termica` set('1','2','3') NOT NULL,
  `burbujeo` tinyint(1) DEFAULT NULL,
  `pH_campo` double DEFAULT NULL,
  `cond_campo` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`id_soli`, `email`, `region`, `fecha`, `propietario`, `num_telefono`, `coord_x`, `coord_y`, `direccion`, `uso_actual`, `sens_termica`, `burbujeo`, `pH_campo`, `cond_campo`) VALUES
(19, 'test@test.com', 'Prueba', '2024-08-30', 'Chris', '88888888', 9.936886826338672, -84.04367208480836, 'Por ahi', 'Ninguno', '1', 1, NULL, NULL),
(20, 'test@test.com', 'Prueba', '2024-08-23', 'Chris', '88888888', 9.936543822567252, -84.04560679726674, 'Por ahi', 'Ninguno', '1', 0, NULL, NULL),
(21, 'test@test.com', 'Prueba', '2024-08-29', 'Chris', '88888888', 9.936272925409632, -84.04428899288179, 'Por ahi', 'Ninguno', '1', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `user_id` char(26) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','user','moderator') NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `failed_login_attempts` int(11) NOT NULL DEFAULT 0,
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` char(26) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `phone_number`, `password_hash`, `role`, `is_active`, `is_verified`, `failed_login_attempts`, `last_login_at`, `password_changed_at`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'Carlos', 'Perez', 'test4@test.com', '88881234', '$2y$10$lS8KHIMbRLD.SK0f/R4e4e1X4cWyPiYJ6YITNB4Rn94KdCogjd6Fm', 'admin', 1, 0, 0, NULL, NULL, '2026-01-29 22:57:11', '2026-02-12 19:26:17', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD UNIQUE KEY `user_id` (`user_id`) USING BTREE;

--
-- Indices de la tabla `analysis_requests`
--
ALTER TABLE `analysis_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_analysis_requests_user` (`created_by`);

--
-- Indices de la tabla `puntos_estudiados`
--
ALTER TABLE `puntos_estudiados`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`);

--
-- Indices de la tabla `registered_geothermal_manifestations`
--
ALTER TABLE `registered_geothermal_manifestations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `fk_rgm_created_by_user` (`created_by`),
  ADD KEY `fk_rgm_modified_by_user` (`modified_by`);

--
-- Indices de la tabla `reg_usr`
--
ALTER TABLE `reg_usr`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id_soli`),
  ADD KEY `fk_solicitudes_email` (`email`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `fk_deleted_by_user` (`deleted_by`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `reg_usr`
--
ALTER TABLE `reg_usr`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=447;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id_soli` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD CONSTRAINT `fk_access_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `analysis_requests`
--
ALTER TABLE `analysis_requests`
  ADD CONSTRAINT `fk_analysis_requests_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `registered_geothermal_manifestations`
--
ALTER TABLE `registered_geothermal_manifestations`
  ADD CONSTRAINT `fk_rgm_created_by_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rgm_modified_by_user` FOREIGN KEY (`modified_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `fk_solicitudes_email` FOREIGN KEY (`email`) REFERENCES `reg_usr` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_deleted_by_user` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
