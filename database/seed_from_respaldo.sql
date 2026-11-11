-- ===========================================================================
-- SEED DE RECUPERACIÓN DE DATOS HISTÓRICOS DE GeoterRA
-- Generado a partir de respaldo_geoterra.sql
-- Incluye: Usuarios, Solicitudes (Requests + Requests_State), Manifestaciones,
--          Pruebas In-Situ, Pruebas In-Lab y Georeportes.
-- Excluye: Tablas cartográficas (provincias, cantones, distritos).
-- ===========================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1. USUARIOS (7 registros recuperados)
-- ---------------------------------------------------------------------------
INSERT INTO `users` (
  `user_id`, `email`, `phone_number`, `first_name`, `last_name`, `password_hash`,
  `role`, `is_deleted`, `is_verified`, `failed_login_attempts`, `last_login_at`,
  `deleted_at`, `created_at`
) VALUES
('06E0TGS8ZBFNSVB2J8KA01NSZC', 'test4@test.com', '88881234', 'Carlos', 'PerezEdited', '$2y$10$xbVsgsejIq/RLpdzq4jBR.CoZn.JDAk8nSIGMb3hxqOLKpc7kvevm', 'admin', 1, 0, 0, NULL, '2026-04-24 13:12:25', '2026-01-29 22:57:11'),
('06E9GJ4K61A8H6CC3C5WRWJFY4', 'mario@user.com', '87654321', 'Mario', 'Updated', '$2y$10$hRvqu/lf9ghaWtNxNeuozuHRYE2LgjrGkg5Wjh1bgfdM6a/OtCSH.', 'user', 0, 0, 0, NULL, NULL, '2026-02-25 22:50:19'),
('06EJ2JM5Z1QVHV5HFD64S07W5W', 'mario@developer.com', '888888889', 'MarioCo', 'DeveloperEdited', '$2y$10$hRvqu/lf9ghaWtNxNeuozuHRYE2LgjrGkg5Wjh1bgfdM6a/OtCSH.', 'maintenance', 0, 0, 0, NULL, NULL, '2026-03-24 13:20:25'),
('06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', 'mario@admin.com', '84264310', 'Mario', 'Admin', '$2y$10$hRvqu/lf9ghaWtNxNeuozuHRYE2LgjrGkg5Wjh1bgfdM6a/OtCSH.', 'admin', 0, 0, 0, NULL, NULL, '2026-04-28 14:32:20'),
('06F4DFX7YMATBA2RSSXRFR4YJC', 'jerc315@gmail.com', '84685416', 'Eduardo Jorge', 'Campos Rodríguez', '$2y$10$zTEX2vlU4JGQrEpb9yQs6OCp.eoxAnNDtZrR5yYv1YtNVwGCN5j1G', 'user', 0, 0, 0, NULL, NULL, '2026-05-20 12:57:06'),
('06F6XDMMWZJ2RAH61B07Q49HRW', 'pedro.rojas@ucr.ac.cr', '88316646', 'Pedro Antonio', 'Rojas Camacho', '$2y$10$Leb3t6M2XQDAn.aGCdUbLOJ4YEWqrqWSxAkws0/x7HHXuNDS9M9Qy', 'user', 0, 0, 0, NULL, NULL, '2026-05-28 07:11:59'),
('06F6XEY9K5JT77TSKXKFHGAN6W', 'pedro.casanova@ucr.ac.cr', '83545065', 'Pedro', 'Casanova', '$2y$10$SAGRBoLrvoh9Ohb03ZDkwu/aQXZQ839KAVNjVgmvYGu/2kfYdLrF.', 'user', 0, 0, 0, NULL, NULL, '2026-05-28 07:17:41')
ON DUPLICATE KEY UPDATE
  `first_name` = VALUES(`first_name`),
  `last_name` = VALUES(`last_name`),
  `phone_number` = VALUES(`phone_number`),
  `role` = VALUES(`role`),
  `is_deleted` = VALUES(`is_deleted`);

-- ---------------------------------------------------------------------------
-- 2. SOLICITUDES DE ANÁLISIS (25 registros recuperados)
-- ---------------------------------------------------------------------------
INSERT INTO `requests` (
  `request_id`, `province_snit_code`, `canton_snit_code`, `district_snit_code`,
  `user_id`, `request_name`, `owner_name`, `owner_phone_number`, `owner_email`,
  `current_usage`, `temperature_sensation`, `bubbles`, `details`, `exact_address`,
  `latitude`, `longitude`, `created_at`, `relation_with_owner`
) VALUES
('06F4DGEYKWH3T1DRVGCZGYGTJC', 5, 501, 50101, '06F4DFX7YMATBA2RSSXRFR4YJC', 'SOLI-YGTJC', 'Eduardo Jorge Rodríguez Campos', '84685416', 'jerc315@gmail.com', 'Residencial', 'Muy Caliente', 1, 'Zona de alta temperatura', NULL, 9.9365200, -84.0437900, '2026-05-20 12:59:31', 'Titular'),
('06F4NQM3BTG6KHHZN5RNZA05DR', 5, 501, 50101, '06F4DFX7YMATBA2RSSXRFR4YJC', 'SOLI-A05DR', 'Jorge Eduardo Prueba 1', '84685416', 'jerc315@gmail.com', 'Comercial', 'Muy Caliente', 1, 'Prueba 1', NULL, 9.4669930, -83.7029300, '2026-05-21 08:09:17', 'Titular'),
('06F4PTE91NA1HBF28K0HMCPMFM', 4, 401, 40101, '06F4DFX7YMATBA2RSSXRFR4YJC', 'SOLI-CPMFM', 'Jorge Prueba 2', '84685416', 'jerc315@gmail.com', 'Comercial', 'Muy Caliente', 1, 'Alta temperatura', NULL, 8.9611410, -83.4594000, '2026-05-21 10:41:24', 'Titular'),
('06F4YPBYXMGX47MSM0P6SN3AF0', 4, 401, 40101, '06F4DFX7YMATBA2RSSXRFR4YJC', 'SOLI-N3AF0', 'Jorge Prueba IV', '84685416', 'jerc315@gmail.com', 'Comercial', 'Muy Caliente', 1, 'Alta temperatura', NULL, 8.6254650, -83.1544800, '2026-05-22 05:02:05', 'Titular'),
('06F6VATKWFH8AMDS659NMBNPC8', 5, 501, 50101, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', 'SOLI-BNPC8', 'Pedro Cassanova', '8344 3610', 'mario@admin.com', 'Otro', 'Templado', 0, '', NULL, 9.9421270, -84.0456300, '2026-05-28 02:20:05', 'Titular'),
('06F70MB55J5BN9R36AY26AJ10W', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-AJ10W', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 0, 'Hay presencia de Azufre, Mario Cordero', NULL, 10.7133380, -85.1768700, '2026-05-28 14:40:43', 'Titular'),
('06F70MH9JM8KX1Y0PZ969YXX10', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-YXX10', 'PEDRO CASANOVA', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'OLET AZUFRE\nPEDRO ANTONIO ROJAS CAMACHO', NULL, 10.7135780, -85.1769940, '2026-05-28 14:41:33', 'Titular'),
('06F70N6T3J7JWKHWWWKZXQ83Q0', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-Q83Q0', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 0, 'Presencia de Azufre GT3, Mario', NULL, 10.7184630, -85.1931300, '2026-05-28 14:44:29', 'Titular'),
('06F70NN9S3D13A465WP8CN37H4', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-N37H4', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'GT3\nPEDRO ANTONIO ROJAS CAMACHO', NULL, 10.7135280, -85.1769600, '2026-05-28 14:46:28', 'Titular'),
('06F70PS0NKQ6CM1C0AMGX5840G', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-5840G', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 0, 'Hay agua y Azufre, GT4, Mario', NULL, 10.7133390, -85.1768500, '2026-05-28 14:51:20', 'Titular'),
('06F70PTTEBTBZA7A5EW5X5AR28', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-5AR28', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'Olof Azufre', NULL, 10.7134370, -85.1771700, '2026-05-28 14:51:35', 'Titular'),
('06F70QMD4K0HNPJT0T2WN490XM', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-490XM', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 0, 'Hay humo, GT5, Mario', NULL, 10.7133310, -85.1769000, '2026-05-28 14:55:05', 'Titular'),
('06F70QNYJQMD103YFPG0AGKH78', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-GKH78', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'Olor Azufre', NULL, 10.7134600, -85.1772160, '2026-05-28 14:55:17', 'Titular'),
('06F70T3H8WDBMTBMA3H2VG3198', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-G3198', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 0, 'GT6, vapor, Mario', NULL, 10.7133350, -85.1768950, '2026-05-28 15:05:53', 'Titular'),
('06F70T8FYRWKR9GNJZP93DQVRC', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-DQVRC', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'Cerca del pozo', NULL, 10.7136270, -85.1771700, '2026-05-28 15:06:34', 'Titular'),
('06F70W8DA114XWDMV8J03XHRZ8', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-XHRZ8', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 1, 'GT7, Mario, pasillo volcanico', NULL, 10.7133300, -85.1769300, '2026-05-28 15:15:17', 'Titular'),
('06F70WZFKKX6638NMDZWRYT7VW', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-YT7VW', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'Burbuja en agua, olor Azufre', NULL, 10.7131150, -85.1772100, '2026-05-28 15:18:26', 'Titular'),
('06F70Z2VCZZAW97J8A777JQVHC', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-JQVHC', 'Pedro', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 0, 'GT8, Mario, azufre', NULL, 10.7184580, -85.1928000, '2026-05-28 15:27:38', 'Titular'),
('06F70Z77R60D2QDFT8P02VBFEC', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-VBFEC', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'Olor Azufre', NULL, 10.7128260, -85.1772000, '2026-05-28 15:28:14', 'Titular'),
('06F710FVGP93J7Y8ANQY3TJ71W', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-TJ71W', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 1, 'GT9, Mario, burbujas', NULL, 10.7133290, -85.1769300, '2026-05-28 15:33:47', 'Titular'),
('06F710JCDX52A9S1VX6S28XEFG', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-8XEFG', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Muy Caliente', 0, 'Burbujas en agua', NULL, 10.7129260, -85.1773600, '2026-05-28 15:34:07', 'Titular'),
('06F711GQH3DCCXRB6BF0S015G4', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-015G4', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Muy Caliente', 0, 'Gt10 Mario, afluente', NULL, 10.7133230, -85.1769300, '2026-05-28 15:38:16', 'Titular'),
('06F711RNN2DV8T8RP3Z34FB1V4', 7, 701, 70101, '06F6XDMMWZJ2RAH61B07Q49HRW', 'SOLI-FB1V4', 'PEDRO ANTONIO ROJAS CAMACHO', '88316646', 'pedro.rojas@ucr.ac.cr', 'Turístico', 'Caliente', 0, 'Mínimo río', NULL, 10.7128400, -85.1774200, '2026-05-28 15:39:21', 'Titular'),
('06F78A7TTPXWE46J6N717T2EP8', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-T2EP8', 'Pedro Casanova', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Caliente', 0, 'GT11, Mario, Ulate', NULL, 10.7190920, -85.2112600, '2026-05-29 08:35:03', 'Titular'),
('06F78CYV8SBRT0J8S5D87QFQ4M', 7, 701, 70101, '06E9GJ4K61A8H6CC3C5WRWJFY4', 'SOLI-QFQ4M', 'Pedro', '83443610', 'corderomariogabriel@gmail.com', 'Turístico', 'Templado', 0, 'PUNTO EN EL LAGO, MARIO, GT12', NULL, 10.7152930, -85.2154700, '2026-05-29 08:46:56', 'Titular')
ON DUPLICATE KEY UPDATE
  `request_name` = VALUES(`request_name`),
  `current_usage` = VALUES(`current_usage`),
  `temperature_sensation` = VALUES(`temperature_sensation`);

-- ---------------------------------------------------------------------------
-- 3. HISTORIAL DE ESTADOS DE SOLICITUDES (25 registros)
-- ---------------------------------------------------------------------------
INSERT INTO `requests_state` (
  `request_status_id`, `request_id`, `value`, `description`, `created_at`, `created_by`
) VALUES
('01KS3C3QHR000193C71HZTXV6P', '06F4DGEYKWH3T1DRVGCZGYGTJC', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-20 12:59:31', '06F4DFX7YMATBA2RSSXRFR4YJC'),
('01KS5DX0P800020EGYQHHXCRG0', '06F4NQM3BTG6KHHZN5RNZA05DR', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-21 08:09:17', '06F4DFX7YMATBA2RSSXRFR4YJC'),
('01KS5PKHS00003DN4GCB0PJE51', '06F4PTE91NA1HBF28K0HMCPMFM', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-21 10:41:24', '06F4DFX7YMATBA2RSSXRFR4YJC'),
('01KS7NJYY8000435E25DRN0VD5', '06F4YPBYXMGX47MSM0P6SN3AF0', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-22 05:02:05', '06F4DFX7YMATBA2RSSXRFR4YJC'),
('01KSPTPMR80005KTKPXAW4JJ5R', '06F6VATKWFH8AMDS659NMBNPC8', 'Procesada', 'Estado inicial recuperado: Analizada', '2026-05-28 02:20:05', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KSR52S7R0006HF9YKV5EJQW0', '06F70MB55J5BN9R36AY26AJ10W', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:40:43', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR54A280007X7F5J0DQEBR1', '06F70MH9JM8KX1Y0PZ969YXX10', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:41:33', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR59NY80008CWQ6A2KWS9B4', '06F70N6T3J7JWKHWWWKZXQ83Q0', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:44:29', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR5DA5000097TDV87JMAWPQ', '06F70NN9S3D13A465WP8CN37H4', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:46:28', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR5P7A00010N15HT3S7RKC5', '06F70PS0NKQ6CM1C0AMGX5840G', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:51:20', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR5PNYR0011GMB68GNSC84G', '06F70PTTEBTBZA7A5EW5X5AR28', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:51:35', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR5X3180012NC5RCSD6YBRB', '06F70QMD4K0HNPJT0T2WN490XM', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:55:05', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR5XER80013ZC8CTKJPN5WF', '06F70QNYJQMD103YFPG0AGKH78', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 14:55:17', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR6GVV80014H20KTNZ4C6PM', '06F70T3H8WDBMTBMA3H2VG3198', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:05:53', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR6J3WG0015NW197F6RKTD6', '06F70T8FYRWKR9GNJZP93DQVRC', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:06:34', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR722M80016WJW52AH54CAF', '06F70W8DA114XWDMV8J03XHRZ8', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:15:17', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR77V6G0017D1D4FD2P5QDJ', '06F70WZFKKX6638NMDZWRYT7VW', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:18:26', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR7RP8G0018XFJDA9N0EGK1', '06F70Z2VCZZAW97J8A777JQVHC', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:27:38', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR7SSDG00195EQ55VZDQ83W', '06F70Z77R60D2QDFT8P02VBFEC', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:28:14', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR83YKR0020FE2QW45J0HBR', '06F710FVGP93J7Y8ANQY3TJ71W', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:33:47', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR84J4R00212C2HZJP6VCQW', '06F710JCDX52A9S1VX6S28XEFG', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:34:07', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KSR8C5A00022Y4KWGFYGWT1M', '06F711GQH3DCCXRB6BF0S015G4', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:38:16', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KSR8E4S80023A02Y412JEJ3C', '06F711RNN2DV8T8RP3Z34FB1V4', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-28 15:39:21', '06F6XDMMWZJ2RAH61B07Q49HRW'),
('01KST2HYER0024YW5W81ZPJP1M', '06F78A7TTPXWE46J6N717T2EP8', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-29 08:35:03', '06E9GJ4K61A8H6CC3C5WRWJFY4'),
('01KST37PR00025S5EBKPRYTXSC', '06F78CYV8SBRT0J8S5D87QFQ4M', 'Pendiente', 'Estado inicial recuperado: Pendiente', '2026-05-29 08:46:56', '06E9GJ4K61A8H6CC3C5WRWJFY4')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ---------------------------------------------------------------------------
-- 4. GEOMANIFESTACIONES, PRUEBAS Y REPORTES (13 registros recuperados)
-- ---------------------------------------------------------------------------
INSERT INTO `geomanifestations` (
  `geomanifestation_id`, `province_snit_code`, `canton_snit_code`, `district_snit_code`,
  `current_georeport_id`, `geomanifestation_name`, `latitude`, `longitude`,
  `description`, `visibility`, `field_trip_id`, `request_id`, `created_at`, `created_by`
) VALUES
('06F1FA5F486WEWTCRGSVZYJT6R', 5, 501, 50101, '01KRDE5ME80028TCEXPYK2APNR', 'Termal Sitio U1', 10.9401065, -85.1931900, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6S', 1, 101, 10101, '01KRDE5ME800314V4ZHN45A3SM', 'Termal CTP1', 9.8663925, -83.1830515, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6T', 1, 101, 10101, '01KRDE5ME8003413WSS3HCJA0D', 'Termal CTP2', 9.8812554, -83.1799590, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6U', 1, 101, 10101, '01KRDE5ME80037PC2YRS420BFN', 'Termal CTP3', 9.8894680, -83.1796559, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6V', 3, 301, 30101, '01KRDE5ME8004072SS3N0YBM4W', 'Termal Guayacan', 9.7016162, -83.1895091, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6W', 1, 101, 10101, '01KRDE5ME80043FN2GFJRFHZXN', 'Termal Josue Ujate', 9.9498760, -83.1605745, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6X', 3, 301, 30101, '01KRDE5ME80046BJV9E17V3BG6', 'Termal R Prados1', 9.8800241, -83.1718535, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6Y', 3, 301, 30101, '01KRDE5ME800495M8QW4FJ7XTR', 'Termal R Prados2', 9.8805682, -83.1718862, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT6Z', 3, 301, 30101, '01KRDE5ME80052MC7A1D66X2JG', 'Termal R Prados3', 9.8814163, -83.1752232, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT70', 3, 301, 30101, '01KRDE5ME80055QQKN2P7FZAJ4', 'Termal R Prados4', 9.8807762, -83.1757882, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F1FA5F486WEWTCRGSVZYJT71', 4, 401, 40101, '01KRDE5ME80058AG5M75AWF8WV', 'Termal Guayacan Alt', 9.9350359, -83.1853346, 'Geothermal manifestation', 1, NULL, NULL, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F6TVCGVHVGZKQ3GEKEYBKZ0M', 5, 501, 50101, '01KSQBE9C80061PCTGRMXTJ7M3', 'SOLI-A9A54', 9.9416560, -84.0459600, NULL, 1, NULL, NULL, '2026-05-28 07:12:37', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('06F6VAYV2R0KSSNQ65CW10PAG8', 5, 501, 50101, '01KSQFAVPR00640WEMBXSJXA6B', 'SOLI-BNPC8', 9.9421270, -84.0456300, NULL, 1, NULL, '06F6VATKWFH8AMDS659NMBNPC8', '2026-05-28 08:20:39', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8')
ON DUPLICATE KEY UPDATE
  `geomanifestation_name` = VALUES(`geomanifestation_name`),
  `current_georeport_id` = VALUES(`current_georeport_id`),
  `visibility` = 1;

INSERT INTO `insitu_tests` (
  `insitu_test_id`, `insitu_test_name`, `geomanifestation_id`, `temperature`, `conductivity`, `ph`,
  `description`, `visibility`, `created_at`, `created_by`
) VALUES
('01KRDE5ME80026SRVZTHVXZZSG', 'In-Situ Termal Sitio U1', '06F1FA5F486WEWTCRGSVZYJT6R', 46.50, 532.00, 6.80, 'Medición in-situ oficial recuperada para Termal Sitio U1', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80029BMNV6FCCRARR', 'In-Situ Termal CTP1', '06F1FA5F486WEWTCRGSVZYJT6S', 41.00, 685.00, 6.51, 'Medición in-situ oficial recuperada para Termal CTP1', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME800320CAWF76WMVRC', 'In-Situ Termal CTP2', '06F1FA5F486WEWTCRGSVZYJT6T', 46.00, 940.00, 6.70, 'Medición in-situ oficial recuperada para Termal CTP2', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80035KHTCKBX5A6RA', 'In-Situ Termal CTP3', '06F1FA5F486WEWTCRGSVZYJT6U', 46.00, 1070.00, 6.25, 'Medición in-situ oficial recuperada para Termal CTP3', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME800380BJQPBQ7PQ83', 'In-Situ Termal Guayacan', '06F1FA5F486WEWTCRGSVZYJT6V', 59.00, 0.00, 0.00, 'Medición in-situ oficial recuperada para Termal Guayacan', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80041E4CFQKCX7M4Q', 'In-Situ Termal Josue Ujate', '06F1FA5F486WEWTCRGSVZYJT6W', 36.00, 0.00, 2.83, 'Medición in-situ oficial recuperada para Termal Josue Ujate', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80044M24FGSX3A0E1', 'In-Situ Termal R Prados1', '06F1FA5F486WEWTCRGSVZYJT6X', 42.00, 1100.00, 6.20, 'Medición in-situ oficial recuperada para Termal R Prados1', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80047A2WN1X8MHMT2', 'In-Situ Termal R Prados2', '06F1FA5F486WEWTCRGSVZYJT6Y', 44.60, 1080.00, 6.15, 'Medición in-situ oficial recuperada para Termal R Prados2', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80050YFXH4Q91FYKA', 'In-Situ Termal R Prados3', '06F1FA5F486WEWTCRGSVZYJT6Z', 0.00, 0.00, 6.05, 'Medición in-situ oficial recuperada para Termal R Prados3', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80053SFSF5FB24ZNX', 'In-Situ Termal R Prados4', '06F1FA5F486WEWTCRGSVZYJT70', 31.20, 0.00, 6.04, 'Medición in-situ oficial recuperada para Termal R Prados4', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80056CVVXXVVGK2T0', 'In-Situ Termal Guayacan Alt', '06F1FA5F486WEWTCRGSVZYJT71', 39.00, 420.00, 5.85, 'Medición in-situ oficial recuperada para Termal Guayacan Alt', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KSQBE9C80059EZ462MD397MX', 'In-Situ SOLI-A9A54', '06F6TVCGVHVGZKQ3GEKEYBKZ0M', 25.00, 500.00, 7.00, 'Medición in-situ oficial recuperada para SOLI-A9A54', 1, '2026-05-28 07:12:37', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KSQFAVPR0062MHHJTZWFRMPN', 'In-Situ SOLI-BNPC8', '06F6VAYV2R0KSSNQ65CW10PAG8', 25.00, 500.00, 7.00, 'Medición in-situ oficial recuperada para SOLI-BNPC8', 1, '2026-05-28 08:20:39', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8')
ON DUPLICATE KEY UPDATE
  `insitu_test_name` = VALUES(`insitu_test_name`),
  `temperature` = VALUES(`temperature`);

INSERT INTO `inlab_tests` (
  `inlab_test_id`, `inlab_test_name`, `geomanifestation_id`, `ph`, `conductivity`, `cl`, `ca`, `hco3`, `so4`,
  `fe`, `si`, `b`, `li`, `f`, `na`, `k`, `mg`, `description`, `visibility`, `created_at`, `created_by`
) VALUES
('01KRDE5ME80027YXW3AAKCZV7M', 'Lab Termal Sitio U1', '06F1FA5F486WEWTCRGSVZYJT6R', 6.95, 523.00, 9.8000, 58.9000, 246.0000, 60.8000, 0.0700, 157.0000, 1.0000, 0.0000, 0.5000, 57.7000, 11.2000, 16.9000, 'Análisis químico de laboratorio recuperado para Termal Sitio U1', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80030XTZJHAQ2S046', 'Lab Termal CTP1', '06F1FA5F486WEWTCRGSVZYJT6S', 6.37, 665.00, 12.2000, 59.8000, 389.0000, 42.1000, 0.0700, 142.0000, 10.0000, 0.0000, 0.5000, 68.8000, 15.5000, 32.7000, 'Análisis químico de laboratorio recuperado para Termal CTP1', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME800332ER3MSVHA61T', 'Lab Termal CTP2', '06F1FA5F486WEWTCRGSVZYJT6T', 6.74, 915.00, 16.2000, 78.4000, 578.0000, 58.1000, 0.0700, 150.0000, 10.0000, 0.0000, 0.5000, 104.2000, 10.6000, 46.3000, 'Análisis químico de laboratorio recuperado para Termal CTP2', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME800361009S4T6M45E', 'Lab Termal CTP3', '06F1FA5F486WEWTCRGSVZYJT6U', 6.33, 912.00, 15.9000, 73.2000, 551.5000, 57.4000, 0.0700, 150.0000, 10.0000, 0.0000, 0.5000, 107.1000, 14.1000, 45.9000, 'Análisis químico de laboratorio recuperado para Termal CTP3', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80039T4KHYAJEX528', 'Lab Termal Guayacan', '06F1FA5F486WEWTCRGSVZYJT6V', 2.17, 7460.00, 78.0000, 104.0000, 0.0000, 3944.0000, 103.0000, 266.0000, 4.0000, 1.0000, 0.5000, 55.0000, 3.0000, 37.0000, 'Análisis químico de laboratorio recuperado para Termal Guayacan', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80042MPNN4XE3DJ9P', 'Lab Termal Josue Ujate', '06F1FA5F486WEWTCRGSVZYJT6W', 2.78, 2770.00, 188.0000, 213.0000, 0.0000, 1383.0000, 2.9200, 162.0000, 2.0000, 1.0000, 0.5000, 56.0000, 9.0000, 65.0000, 'Análisis químico de laboratorio recuperado para Termal Josue Ujate', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME800450NWCAB8VSNEK', 'Lab Termal R Prados1', '06F1FA5F486WEWTCRGSVZYJT6X', 6.17, 876.00, 75.9000, 58.8000, 443.5000, 14.3000, 0.0700, 156.0000, 4.0000, 1.0000, 0.5000, 157.0000, 17.5000, 28.7000, 'Análisis químico de laboratorio recuperado para Termal R Prados1', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80048GKEK44CAPJY5', 'Lab Termal R Prados2', '06F1FA5F486WEWTCRGSVZYJT6Y', 6.24, 900.00, 80.1000, 59.4000, 447.0000, 14.2000, 0.0700, 150.0000, 10.0000, 1.0000, 0.5000, 184.3000, 15.6000, 26.8000, 'Análisis químico de laboratorio recuperado para Termal R Prados2', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80051SP65FY29Y1G8', 'Lab Termal R Prados3', '06F1FA5F486WEWTCRGSVZYJT6Z', 6.09, 482.00, 6.2000, 45.3000, 327.5000, 5.6000, 0.0700, 131.0000, 10.0000, 1.0000, 0.5000, 59.6000, 8.8000, 21.0000, 'Análisis químico de laboratorio recuperado para Termal R Prados3', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80054JJGB2GZ5TJ8Q', 'Lab Termal R Prados4', '06F1FA5F486WEWTCRGSVZYJT70', 6.05, 368.00, 5.6000, 36.8000, 251.0000, 2.9000, 0.0700, 120.0000, 10.0000, 1.0000, 0.5000, 40.0000, 8.7000, 17.0000, 'Análisis químico de laboratorio recuperado para Termal R Prados4', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KRDE5ME80057HEAHY390P5SZ', 'Lab Termal Guayacan Alt', '06F1FA5F486WEWTCRGSVZYJT71', 5.85, 416.00, 8.1000, 46.5000, 201.0000, 43.5000, 0.0700, 124.0000, 10.0000, 1.0000, 0.5000, 41.9000, 14.5000, 14.3000, 'Análisis químico de laboratorio recuperado para Termal Guayacan Alt', 1, '2026-05-12 00:32:13', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KSQBE9C8006098VW0VSD4J2G', 'Lab SOLI-A9A54', '06F6TVCGVHVGZKQ3GEKEYBKZ0M', 7.00, 500.00, 10.0000, 20.0000, 30.0000, 40.0000, 0.0700, 50.0000, 1.0000, 1.0000, 0.5000, 60.0000, 70.0000, 80.0000, 'Análisis químico de laboratorio recuperado para SOLI-A9A54', 1, '2026-05-28 07:12:37', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8'),
('01KSQFAVPR0063XMW4EW6AAQ89', 'Lab SOLI-BNPC8', '06F6VAYV2R0KSSNQ65CW10PAG8', 7.00, 500.00, 10.0000, 20.0000, 30.0000, 40.0000, 0.0700, 50.0000, 1.0000, 1.0000, 0.5000, 60.0000, 70.0000, 80.0000, 'Análisis químico de laboratorio recuperado para SOLI-BNPC8', 1, '2026-05-28 08:20:39', '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8')
ON DUPLICATE KEY UPDATE
  `inlab_test_name` = VALUES(`inlab_test_name`),
  `ph` = VALUES(`ph`);

INSERT INTO `georeports` (
  `georeport_id`, `georeport_name`, `geomanifestation_id`, `insitu_test_id`, `inlab_test_id`,
  `details`, `visibility`, `created_by`, `created_at`
) VALUES
('01KRDE5ME80028TCEXPYK2APNR', 'GeoReporte Termal Sitio U1', '06F1FA5F486WEWTCRGSVZYJT6R', '01KRDE5ME80026SRVZTHVXZZSG', '01KRDE5ME80027YXW3AAKCZV7M', 'Georeporte técnico oficial consolidado para Termal Sitio U1', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME800314V4ZHN45A3SM', 'GeoReporte Termal CTP1', '06F1FA5F486WEWTCRGSVZYJT6S', '01KRDE5ME80029BMNV6FCCRARR', '01KRDE5ME80030XTZJHAQ2S046', 'Georeporte técnico oficial consolidado para Termal CTP1', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME8003413WSS3HCJA0D', 'GeoReporte Termal CTP2', '06F1FA5F486WEWTCRGSVZYJT6T', '01KRDE5ME800320CAWF76WMVRC', '01KRDE5ME800332ER3MSVHA61T', 'Georeporte técnico oficial consolidado para Termal CTP2', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME80037PC2YRS420BFN', 'GeoReporte Termal CTP3', '06F1FA5F486WEWTCRGSVZYJT6U', '01KRDE5ME80035KHTCKBX5A6RA', '01KRDE5ME800361009S4T6M45E', 'Georeporte técnico oficial consolidado para Termal CTP3', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME8004072SS3N0YBM4W', 'GeoReporte Termal Guayacan', '06F1FA5F486WEWTCRGSVZYJT6V', '01KRDE5ME800380BJQPBQ7PQ83', '01KRDE5ME80039T4KHYAJEX528', 'Georeporte técnico oficial consolidado para Termal Guayacan', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME80043FN2GFJRFHZXN', 'GeoReporte Termal Josue Ujate', '06F1FA5F486WEWTCRGSVZYJT6W', '01KRDE5ME80041E4CFQKCX7M4Q', '01KRDE5ME80042MPNN4XE3DJ9P', 'Georeporte técnico oficial consolidado para Termal Josue Ujate', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME80046BJV9E17V3BG6', 'GeoReporte Termal R Prados1', '06F1FA5F486WEWTCRGSVZYJT6X', '01KRDE5ME80044M24FGSX3A0E1', '01KRDE5ME800450NWCAB8VSNEK', 'Georeporte técnico oficial consolidado para Termal R Prados1', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME800495M8QW4FJ7XTR', 'GeoReporte Termal R Prados2', '06F1FA5F486WEWTCRGSVZYJT6Y', '01KRDE5ME80047A2WN1X8MHMT2', '01KRDE5ME80048GKEK44CAPJY5', 'Georeporte técnico oficial consolidado para Termal R Prados2', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME80052MC7A1D66X2JG', 'GeoReporte Termal R Prados3', '06F1FA5F486WEWTCRGSVZYJT6Z', '01KRDE5ME80050YFXH4Q91FYKA', '01KRDE5ME80051SP65FY29Y1G8', 'Georeporte técnico oficial consolidado para Termal R Prados3', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME80055QQKN2P7FZAJ4', 'GeoReporte Termal R Prados4', '06F1FA5F486WEWTCRGSVZYJT70', '01KRDE5ME80053SFSF5FB24ZNX', '01KRDE5ME80054JJGB2GZ5TJ8Q', 'Georeporte técnico oficial consolidado para Termal R Prados4', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KRDE5ME80058AG5M75AWF8WV', 'GeoReporte Termal Guayacan Alt', '06F1FA5F486WEWTCRGSVZYJT71', '01KRDE5ME80056CVVXXVVGK2T0', '01KRDE5ME80057HEAHY390P5SZ', 'Georeporte técnico oficial consolidado para Termal Guayacan Alt', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-12 00:32:13'),
('01KSQBE9C80061PCTGRMXTJ7M3', 'GeoReporte SOLI-A9A54', '06F6TVCGVHVGZKQ3GEKEYBKZ0M', '01KSQBE9C80059EZ462MD397MX', '01KSQBE9C8006098VW0VSD4J2G', 'Georeporte técnico oficial consolidado para SOLI-A9A54', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-28 07:12:37'),
('01KSQFAVPR00640WEMBXSJXA6B', 'GeoReporte SOLI-BNPC8', '06F6VAYV2R0KSSNQ65CW10PAG8', '01KSQFAVPR0062MHHJTZWFRMPN', '01KSQFAVPR0063XMW4EW6AAQ89', 'Georeporte técnico oficial consolidado para SOLI-BNPC8', 1, '06EXBJQHAGA0Y4ZRF3ZKZ7KPJ8', '2026-05-28 08:20:39')
ON DUPLICATE KEY UPDATE
  `georeport_name` = VALUES(`georeport_name`),
  `details` = VALUES(`details`);

SET FOREIGN_KEY_CHECKS = 1;
