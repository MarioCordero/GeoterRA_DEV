-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 01-09-2024 a las 01:41:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

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
('Termal CTP-1', 'Guanacaste', 367863.9425, 1180305.1572, 41, 6.51, 685, 6.37, 665, 12.2, 59.8, 389, 42.1, '< 0.07', 142, '< 1,0', '< 1', '< 0.5', 68.8, 15.5, 32.7),
('Termal CTP-2', 'Guanacaste', 367812.5554, 1179988.5986, 46, 6.7, 940, 6.74, 915, 16.2, 78.4, 578, 58.1, '< 0.07', 150, '< 1,0', '< 1', '< 0.5', 104.2, 10.6, 46.3),
('Termal CTP-3', 'Guanacaste', 367834, 1179987, 46, 6, 1070, 6, 912, 15, 79, 551, 57, '< 0.07', 150, '< 1,0', '< 1', '< 0.5', 107, 14, 45),
('Termal Guayabal', 'Guanacaste', 370116, 1189156, 59, 0, 0, 2, 7480, 728, 104, 0, 3344, '103,0', 265, '4,0', '< 1', '< 0.5', 55, 3, 37),
('Termal Guayacan', 'Guanacaste', 369370, 1185373, 39, 5, 420, 5, 416, 8, 46, 201, 43, '< 0.07', 124, '< 1,0', '< 1', '< 0.5', 41, 14, 14),
('Termal Josue Ulate', 'Guanacaste', 369588, 1187588, 36, 2, 0, 2, 2770, 188, 203, 0, 1383, '2,92', 162, '2,0', '< 1', '< 0.5', 56, 9, 65),
('Termal R. Perdido-1', 'Guanacaste', 368600, 1171843, 42, 6, 1100, 6, 876, 75, 58, 443, 14, '< 0.07', 156, '4,0', '< 1', '< 0.5', 167, 17, 26),
('Termal R. Perdido-2', 'Guanacaste', 368605, 1171824, 44, 6, 1080, 6, 900, 80, 59, 447, 14, '< 0.07', 155, '< 1,0', '< 1', '< 0.5', 184, 16, 26),
('Termal R. Perdido-3', 'Guanacaste', 368614, 1171802, 0, 6, 0, 6, 482, 6, 45, 327, 5, '< 0.07', 131, '< 1,0', '< 1', '< 0.5', 59, 8, 21),
('Termal R. Perdido-4', 'Guanacaste', 368607, 1171767, 31, 6, 0, 6, 368, 5, 36, 251, 2, '< 0.07', 120, '< 1,0', '< 1', '< 0.5', 40, 8, 17),
('Termal Sitio U-1', 'Guanacaste', 36940.1865, 1184319.003, 46.5, 6.8, 532, 6.96, 523, 9.8, 58.9, 246, 60.8, '< 0.07', 157, '1.0', '< 1', '< 0.5', 57.7, 11.2, 16.9);

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
  `phone_number` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reg_usr`
--

INSERT INTO `reg_usr` (`id`, `email`, `password`, `first_name`, `last_name`, `phone_number`) VALUES
(394, 'mcolls0@cargocollective.com', 'fQ1|<U*v0sCh', 'Melli', 'Colls', '3252338213'),
(395, 'atorre1@un.org', 'aG2!1.gnU8Y&$<', 'Angelo', 'Torre', '3869834587'),
(396, 'npiegrome2@dailymotion.com', 'jJ0+\".a3gDzzTL', 'Nikki', 'Piegrome', '8533930682'),
(397, 'fleece3@nytimes.com', 'fP9\'#W4D.r', 'Finlay', 'Leece', '1521935366'),
(398, 'kwheatley4@pbs.org', 'bZ7}0gPLT9Si(=', 'Kiersten', 'Wheatley', '6592142198'),
(399, 'gscottesmoor5@nsw.gov.au', 'pL0|`<$Q$jt', 'Gene', 'Scottesmoor', '3386788735'),
(400, 'slaurent6@bizjournals.com', 'zJ6{PWk*Ea', 'Susette', 'Laurent', '1088106907'),
(401, 'rvlasyev7@berkeley.edu', 'pB8>G1,r', 'Reynold', 'Vlasyev', '7626731392'),
(402, 'sdanson8@sogou.com', 'tB1<.?<)HMSIkRe~', 'Storm', 'Danson', '8871713198'),
(403, 'emompesson9@ebay.co.uk', 'vQ4_G{iOr', 'Ephrayim', 'Mompesson', '4493591801'),
(404, 'mjancya@seattletimes.com', 'bR6)q1kj', 'Mariann', 'Jancy', '1761977507'),
(405, 'erihanekb@phoca.cz', 'zI4+M9*gCy|', 'Elijah', 'Rihanek', '9085347035'),
(406, 'remlenc@springer.com', 'pN4#_B|ac*BlyUp', 'Ruthi', 'Emlen', '9627676911'),
(407, 'wchasled@senate.gov', 'vV5,S6LeLe%', 'Wilmette', 'Chasle', '6892624853'),
(408, 'ndwelleye@shinystat.com', 'pP4)UxBA%', 'Nil', 'Dwelley', '3164865866'),
(409, 'gwallheadf@go.com', 'aH2?+dIB8', 'Grata', 'Wallhead', '5257395908'),
(410, 'eelflaing@jiathis.com', 'eG1%FEo3tDV', 'Ekaterina', 'Elflain', '1247889371'),
(411, 'pcartmaleh@booking.com', 'yL3.$aQ\"', 'Pen', 'Cartmale', '8468850822'),
(412, 'hbygatei@last.fm', 'lO7&Cx0', 'Hunt', 'Bygate', '9861065885'),
(413, 'bmassardj@taobao.com', 'dP0|d~Yjv31', 'Brietta', 'Massard', '3827107030'),
(414, 'bskeldonk@ask.com', 'dE5/\"PJm(qP\'7O', 'Babita', 'Skeldon', '3906903806'),
(415, 'lmalenfantl@mashable.com', 'oI8>)4|!!+', 'Lexie', 'Malenfant', '5185123422'),
(416, 'mrizziellom@sakura.ne.jp', 'gG4<X4h{Q9!2GDU', 'Moyna', 'Rizziello', '6014108455'),
(417, 'aschimonn@ca.gov', 'kD9$M(Ws>4_T6\"c', 'Alleyn', 'Schimon', '5687278146'),
(418, 'mduffillo@ning.com', 'iF1`N$2,', 'Melessa', 'Duffill', '2243569729'),
(419, 'mwasmuthp@foxnews.com', 'jO7WVuKCOZ&0AM', 'Manon', 'Wasmuth', '9322387774'),
(420, 'otathamq@youtube.com', 'mO0,L#q(k>IR%2Xh', 'Olympe', 'Tatham', '5154733236'),
(421, 'kmadginr@hubpages.com', 'wY6>J{u<EmDXjp9', 'Kalindi', 'Madgin', '4925700879'),
(422, 'cblacklidges@barnesandnoble.com', 'pH2@`l+)VoMvs9@\'', 'Corny', 'Blacklidge', '9286044568'),
(423, 'hlightowlert@whitehouse.gov', 'vM8/L1Hn)Sw>mS', 'Helene', 'Lightowler', '2735240730'),
(424, 'ewoodfineu@walmart.com', 'uH9=zp\"C~3', 'Ede', 'Woodfine', '3401054393'),
(425, 'mmcallasterv@whitehouse.gov', 'dY2>_q!&6', 'Miller', 'McAllaster', '4209349252'),
(426, 'rfedynskiw@icq.com', 'uK6<RS,r.j`}', 'Rosalinde', 'Fedynski', '7607795359'),
(427, 'gantonoczykx@ehow.com', 'mX0`RlAk', 'Goldia', 'Antonoczyk', '9901959652'),
(428, 'fbutchery@msu.edu', 'hD2#(\"@tF%I/(zp', 'Floria', 'Butcher', '1141176217'),
(429, 'tculshawz@gov.uk', 'bE2@H<,E~>Z7', 'Tandi', 'Culshaw', '7466119402'),
(430, 'belsey10@wsj.com', 'vA1+%*%pi', 'Brande', 'Elsey', '2646036181'),
(431, 'hslocom11@de.vu', 'eU5.wg)t+8/r', 'Hilde', 'Slocom', '8595729551'),
(432, 'jdabbes12@house.gov', 'fR8?0qPVhV0&}>i', 'Jelene', 'Dabbes', '6377116898'),
(433, 'jalebrooke13@netscape.com', 'rH0}n$tJ2B(', 'Joey', 'Alebrooke', '6795661165'),
(434, 'ebenezeit14@nih.gov', 'oQ7)JbchQ1', 'Esdras', 'Benezeit', '7182184857'),
(435, 'skrates15@mediafire.com', 'dT8~5tOEJR}#s', 'Sara-ann', 'Krates', '8541912355'),
(436, 'rabbott16@yelp.com', 'cF4@UL~4<%phZ%tT', 'Raul', 'Abbott', '6321569369'),
(437, 'lwoollons17@sourceforge.net', 'uA3?}_ErhL', 'Lacee', 'Woollons', '6389473722'),
(438, 'wmeenehan18@dion.ne.jp', 'fW6!x{WAj|&d4h', 'Waldemar', 'Meenehan', '4444568899'),
(439, 'plandes19@omniture.com', 'qI3$Lj<D/73JF', 'Preston', 'Landes', '2845394969'),
(440, 'akettle1a@storify.com', 'qH1)(~lztUSj%SE', 'Angie', 'Kettle', '1847740165'),
(441, 'squaltro1b@shareasale.com', 'zP9<k1iBbgB|\"aVE', 'Swen', 'Qualtro', '1613555051'),
(442, 'llower1c@biglobe.ne.jp', 'qD8!<|4=0', 'Luce', 'Lower', '7569086054'),
(443, 'mcarlo1d@netscape.com', 'kB4/%On\'&9', 'Mollie', 'Carlo', '8838281420'),
(444, 'test@test.com', 'test', 'Christopher', 'Acosta Madrigal', '86473533');

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
(19, 'test@test.com', 'Prueba', '2024-08-30', 'Chris', '88888888', 9.936886826338672, -84.04367208480836, 'Por ahi', 'Ninguno', '1', 1, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `puntos_estudiados`
--
ALTER TABLE `puntos_estudiados`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `reg_usr`
--
ALTER TABLE `reg_usr`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=445;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id_soli` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `fk_solicitudes_email` FOREIGN KEY (`email`) REFERENCES `reg_usr` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
