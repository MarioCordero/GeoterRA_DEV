-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 03, 2024 at 04:29 PM
-- Server version: 8.0.36-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.15

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
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `nombre` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reg_usr`
--

CREATE TABLE `reg_usr` (
  `id` int NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `phone_number` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reg_usr`
--

INSERT INTO `reg_usr` (`id`, `email`, `password`, `first_name`, `last_name`, `phone_number`) VALUES
(5, 'bsalerno1@vimeo.com', 'hK4@+Vg\'1{', 'Beck', 'Salerno', '4031857564'),
(6, 'atoffoloni2@imdb.com', 'qV9=<%', 'Annis', 'Toffoloni', '1099926942'),
(7, 'irubroe3@paypal.com', 'gY2\'\'J', 'Igor', 'Rubroe', '5755695862'),
(8, 'hgoodacre4@reddit.com', 'uG8$sp.bJ6~$', 'Hervey', 'Goodacre', '7175799188'),
(9, 'landrysek5@sourceforge.net', 'uI7|(U?Rm', 'Lilah', 'Andrysek', '8879659069'),
(10, 'dwarcop6@bluehost.com', 'oS1|{B=z', 'Dex', 'Warcop', '6253573363'),
(11, 'aruler7@vinaora.com', 'qZ4#&}1h1M%H', 'Alanna', 'Ruler', '6542857380'),
(12, 'sstading8@msn.com', 'fC1/qjB%x', 'Sheilah', 'Stading', '7998725633'),
(13, 'hstealfox9@ca.gov', 'mO0&\'0', 'Haze', 'Stealfox', '6197830377'),
(14, 'sfillera@china.com.cn', 'mE0~1&4', 'Sigismundo', 'Filler', '1291366818'),
(15, 'astrobanb@icio.us', 'mZ4|Gf2Kca++', 'Ambros', 'Stroban', '3364239261'),
(16, 'cvalentinoc@cam.ac.uk', 'hC9/=1s9', 'Che', 'Valentino', '7738613632'),
(17, 'tpearsed@friendfeed.com', 'uE9(R61uFcd`', 'Tania', 'Pearse', '7726502190'),
(18, 'ncympere@livejournal.com', 'iC3(c`y', 'Nanice', 'Cymper', '8963503775'),
(19, 'vmcalinionf@simplemachines.org', 'bO6.\"5Ct', 'Vaughn', 'McAlinion', '5782615449'),
(20, 'eimmingsg@360.cn', 'jC6.HI$=KaK\'', 'Estrellita', 'Immings', '5288346345'),
(21, 'tcollingeh@xinhuanet.com', 'rH8<=<$6|', 'Therese', 'Collinge', '4043529715'),
(22, 'dbrailsfordi@comcast.net', 'lR0(|V>_3M', 'Dolley', 'Brailsford', '2324221972'),
(23, 'mhockellj@cyberchimps.com', 'vB0~ZpA9}|', 'Marlena', 'Hockell', '5595642353'),
(24, 'pcroizierk@hostgator.com', 'zM6)D|/(', 'Phoebe', 'Croizier', '6759542762'),
(25, 'bfernezl@mac.com', 'uG9}Z9LN1<)', 'Bertrando', 'Fernez', '5139508566'),
(26, 'sbernardeschim@etsy.com', 'hZ6&jG8RD~', 'Sonni', 'Bernardeschi', '6397114451'),
(27, 'rdugon@unicef.org', 'uL4$%N9}=#7', 'Rachael', 'D\'Ugo', '6337297290'),
(28, 'ablindeo@uol.com.br', 'hQ9~|A165', 'Annabella', 'Blinde', '4162045496'),
(29, 'clovingp@gnu.org', 'oG0=ui', 'Corey', 'Loving', '6527762428'),
(30, 'gickeringillq@sakura.ne.jp', 'fO2`&Td1(~ss', 'Garry', 'Ickeringill', '7169415501'),
(31, 'rsturdyr@amazon.de', 'oM9@t%KzEj!', 'Rhetta', 'Sturdy', '2503318069'),
(32, 'mswindalls@wikimedia.org', 'hA6*#05/i4', 'Monika', 'Swindall', '3832100603'),
(33, 'sfilipsont@paginegialle.it', 'qG3.E%', 'Sarita', 'Filipson', '1069521382'),
(34, 'bfarmloeu@moonfruit.com', 'uL1\"s1XSQ&w.', 'Berkie', 'Farmloe', '2451533455'),
(35, 'ccleatonv@forbes.com', 'nI7~1s', 'Cacilie', 'Cleaton', '7338698504'),
(36, 'pallderw@smugmug.com', 'hI2)DuFMa&8', 'Pip', 'Allder', '2305201358'),
(37, 'cspofforthx@reuters.com', 'bF5@tqOpF', 'Carmina', 'Spofforth', '9361784862'),
(38, 'oorhrty@tiny.cc', 'vP2\"_(+a_', 'Odella', 'Orhrt', '4411710102'),
(39, 'gmckeefryz@sohu.com', 'uN4.Wr', 'Griselda', 'McKeefry', '6798526804'),
(40, 'kalywen10@blogtalkradio.com', 'fJ0=9P', 'Kenna', 'Alywen', '7676651749'),
(41, 'bjeans11@w3.org', 'iG2`RF=~3', 'Blanche', 'Jeans', '8369505374'),
(42, 'eviccars12@army.mil', 'dU7(wY', 'Erskine', 'Viccars', '3812714844'),
(43, 'glinnit13@free.fr', 'rP4&ebE`', 'Gertie', 'Linnit', '6837058927'),
(44, 'arouke14@lycos.com', 'xF3#}8', 'Alaric', 'Rouke', '7582609191'),
(45, 'nrosengart15@springer.com', 'rH9!8i!!.y', 'Nicki', 'Rosengart', '8309390117'),
(46, 'xclavering16@walmart.com', 'cE5?k%ETP5s', 'Xenos', 'Clavering', '9124982995'),
(47, 'habramowsky17@mashable.com', 'rC2}5_.w,Z', 'Horton', 'Abramowsky', '1573847222'),
(48, 'fhullot18@tumblr.com', 'aY8|G=#', 'Felicio', 'Hullot', '7344281853'),
(49, 'lglenny19@wikispaces.com', 'hB5$kHH', 'Lorenza', 'Glenny', '2354256496'),
(50, 'sstoppard1a@admin.ch', 'cX5.r`A1i*', 'Selia', 'Stoppard', '1715129311'),
(51, 'hrowsell1b@army.mil', 'nG8!mHmza', 'Honey', 'Rowsell', '5335675250'),
(52, 'rthresh2a@ebay.co.uk', 'gH0&9M$|', 'Rosabelle', 'Thresh', '8607672546'),
(53, 'cwinter2b@tinyurl.com', 'uJ2!1*a', 'Candie', 'Winter', '8599375524'),
(54, 'bsalerno1@vimeo.com', 'hK4@+Vg\'1{', 'Beck', 'Salerno', '4031857564'),
(55, 'atoffoloni2@imdb.com', 'qV9=<%', 'Annis', 'Toffoloni', '1099926942'),
(56, 'irubroe3@paypal.com', 'gY2\'\'J', 'Igor', 'Rubroe', '5755695862'),
(57, 'hgoodacre4@reddit.com', 'uG8$sp.bJ6~$', 'Hervey', 'Goodacre', '7175799188'),
(58, 'landrysek5@sourceforge.net', 'uI7|(U?Rm', 'Lilah', 'Andrysek', '8879659069'),
(59, 'dwarcop6@bluehost.com', 'oS1|{B=z', 'Dex', 'Warcop', '6253573363'),
(60, 'aruler7@vinaora.com', 'qZ4#&}1h1M%H', 'Alanna', 'Ruler', '6542857380'),
(61, 'sstading8@msn.com', 'fC1/qjB%x', 'Sheilah', 'Stading', '7998725633'),
(62, 'hstealfox9@ca.gov', 'mO0&\'0', 'Haze', 'Stealfox', '6197830377'),
(63, 'sfillera@china.com.cn', 'mE0~1&4', 'Sigismundo', 'Filler', '1291366818'),
(64, 'astrobanb@icio.us', 'mZ4|Gf2Kca++', 'Ambros', 'Stroban', '3364239261'),
(65, 'cvalentinoc@cam.ac.uk', 'hC9/=1s9', 'Che', 'Valentino', '7738613632'),
(66, 'tpearsed@friendfeed.com', 'uE9(R61uFcd`', 'Tania', 'Pearse', '7726502190'),
(67, 'ncympere@livejournal.com', 'iC3(c`y', 'Nanice', 'Cymper', '8963503775'),
(68, 'vmcalinionf@simplemachines.org', 'bO6.\"5Ct', 'Vaughn', 'McAlinion', '5782615449'),
(69, 'eimmingsg@360.cn', 'jC6.HI$=KaK\'', 'Estrellita', 'Immings', '5288346345'),
(70, 'tcollingeh@xinhuanet.com', 'rH8<=<$6|', 'Therese', 'Collinge', '4043529715'),
(71, 'dbrailsfordi@comcast.net', 'lR0(|V>_3M', 'Dolley', 'Brailsford', '2324221972'),
(72, 'mhockellj@cyberchimps.com', 'vB0~ZpA9}|', 'Marlena', 'Hockell', '5595642353'),
(73, 'pcroizierk@hostgator.com', 'zM6)D|/(', 'Phoebe', 'Croizier', '6759542762'),
(74, 'bfernezl@mac.com', 'uG9}Z9LN1<)', 'Bertrando', 'Fernez', '5139508566'),
(75, 'sbernardeschim@etsy.com', 'hZ6&jG8RD~', 'Sonni', 'Bernardeschi', '6397114451'),
(76, 'rdugon@unicef.org', 'uL4$%N9}=#7', 'Rachael', 'D\'Ugo', '6337297290'),
(77, 'ablindeo@uol.com.br', 'hQ9~|A165', 'Annabella', 'Blinde', '4162045496'),
(78, 'clovingp@gnu.org', 'oG0=ui', 'Corey', 'Loving', '6527762428'),
(79, 'gickeringillq@sakura.ne.jp', 'fO2`&Td1(~ss', 'Garry', 'Ickeringill', '7169415501'),
(80, 'rsturdyr@amazon.de', 'oM9@t%KzEj!', 'Rhetta', 'Sturdy', '2503318069'),
(81, 'mswindalls@wikimedia.org', 'hA6*#05/i4', 'Monika', 'Swindall', '3832100603'),
(82, 'sfilipsont@paginegialle.it', 'qG3.E%', 'Sarita', 'Filipson', '1069521382'),
(83, 'bfarmloeu@moonfruit.com', 'uL1\"s1XSQ&w.', 'Berkie', 'Farmloe', '2451533455'),
(84, 'ccleatonv@forbes.com', 'nI7~1s', 'Cacilie', 'Cleaton', '7338698504'),
(85, 'pallderw@smugmug.com', 'hI2)DuFMa&8', 'Pip', 'Allder', '2305201358'),
(86, 'cspofforthx@reuters.com', 'bF5@tqOpF', 'Carmina', 'Spofforth', '9361784862'),
(87, 'oorhrty@tiny.cc', 'vP2\"_(+a_', 'Odella', 'Orhrt', '4411710102'),
(88, 'gmckeefryz@sohu.com', 'uN4.Wr', 'Griselda', 'McKeefry', '6798526804'),
(89, 'kalywen10@blogtalkradio.com', 'fJ0=9P', 'Kenna', 'Alywen', '7676651749'),
(90, 'bjeans11@w3.org', 'iG2`RF=~3', 'Blanche', 'Jeans', '8369505374'),
(91, 'eviccars12@army.mil', 'dU7(wY', 'Erskine', 'Viccars', '3812714844'),
(92, 'glinnit13@free.fr', 'rP4&ebE`', 'Gertie', 'Linnit', '6837058927'),
(93, 'arouke14@lycos.com', 'xF3#}8', 'Alaric', 'Rouke', '7582609191'),
(94, 'nrosengart15@springer.com', 'rH9!8i!!.y', 'Nicki', 'Rosengart', '8309390117'),
(95, 'xclavering16@walmart.com', 'cE5?k%ETP5s', 'Xenos', 'Clavering', '9124982995'),
(96, 'habramowsky17@mashable.com', 'rC2}5_.w,Z', 'Horton', 'Abramowsky', '1573847222'),
(97, 'fhullot18@tumblr.com', 'aY8|G=#', 'Felicio', 'Hullot', '7344281853'),
(98, 'lglenny19@wikispaces.com', 'hB5$kHH', 'Lorenza', 'Glenny', '2354256496'),
(99, 'sstoppard1a@admin.ch', 'cX5.r`A1i*', 'Selia', 'Stoppard', '1715129311'),
(100, 'hrowsell1b@army.mil', 'nG8!mHmza', 'Honey', 'Rowsell', '5335675250'),
(101, 'bsalerno1@vimeo.com', 'hK4@+Vg\'1{', 'Beck', 'Salerno', '4031857564'),
(102, 'atoffoloni2@imdb.com', 'qV9=<%', 'Annis', 'Toffoloni', '1099926942'),
(103, 'irubroe3@paypal.com', 'gY2\'\'J', 'Igor', 'Rubroe', '5755695862'),
(104, 'hgoodacre4@reddit.com', 'uG8$sp.bJ6~$', 'Hervey', 'Goodacre', '7175799188'),
(105, 'landrysek5@sourceforge.net', 'uI7|(U?Rm', 'Lilah', 'Andrysek', '8879659069'),
(106, 'dwarcop6@bluehost.com', 'oS1|{B=z', 'Dex', 'Warcop', '6253573363'),
(107, 'aruler7@vinaora.com', 'qZ4#&}1h1M%H', 'Alanna', 'Ruler', '6542857380'),
(108, 'sstading8@msn.com', 'fC1/qjB%x', 'Sheilah', 'Stading', '7998725633'),
(109, 'hstealfox9@ca.gov', 'mO0&\'0', 'Haze', 'Stealfox', '6197830377'),
(110, 'sfillera@china.com.cn', 'mE0~1&4', 'Sigismundo', 'Filler', '1291366818'),
(111, 'som@somewhere.com', '12313', 'carlos', 'acosta', '1231313'),
(112, '23@cas', '323', 'Christopher', 'Acosta Madrigal', NULL),
(113, '23@casi', '323', 'Christopher', 'Tercero', NULL),
(114, '23@casiquew12', '1231', 'Christopher', 'Tercero', NULL),
(115, '23@casiquew12', '1231', 'Christopher', 'Tercero', NULL),
(116, '23@cas.com', '131231231', 'Christopher', 'Acosta Madrigal', NULL),
(117, 'forntie@cas.com', '1231313121213', 'Christopher', 'Acosta Madrigal', NULL),
(118, '23@cas.ocmo', '13123131', 'Christopher', 'Acosta Madrigal', NULL),
(119, 'me@son.com', '', 'Christopher', 'Acosta Madrigal', NULL),
(120, 'me@son.com', '1231', 'Christopher', 'Acosta Madrigal', NULL),
(121, 'me@son.com', '1231', 'Christopher', 'Acosta Madrigal', NULL),
(122, 'chris@google.com', '12345678', 'Christopher', 'Acosta Madrigal', NULL),
(123, 'me@somewhere.com', '123557', 'Christopher', 'Acosta Madrigal', NULL),
(124, 'me@somewh.com', '123557', 'Christopher', 'Acosta Madrigal', NULL),
(125, 'me@somh.com', '123557', 'Christopher', 'Acosta Madrigal', NULL),
(126, 'me@sh.com', '123557', 'Christopher', 'Acosta Madrigal', '12345666'),
(127, 'me@s.com', '123557', 'Christopher', 'Acosta Madrigal', '12345666'),
(128, 'me@sonmali.com', '1231231', 'Christopher', 'Acosta Madrigal', '86473533'),
(129, 'me@sonma.com', '1231231', 'Christopher', 'Acosta Madrigal', '86473533'),
(130, 'me@soma.com', '1231231', 'Christopher', 'Acosta Madrigal', '86473533'),
(131, 'me@som.com', '1231231', 'Christopher', 'Acosta Madrigal', '86473533'),
(132, 'me@sm.com', '1231231', 'Christopher', 'Acosta Madrigal', '86473533'),
(133, 'me@sasdsm.com', '1231231', 'Christopher', 'Acosta Madrigal', '86473533'),
(134, 'me@sonnnn.com', '123131', 'Christopher', 'Acosta Madrigal', '86473533'),
(135, 'me@sonnmn.com', '123131', 'Christopher', 'Acosta Madrigal', '86473533'),
(136, 'me@also.com', '12312', 'Christopher', 'Acosta Madrigal', '86473533'),
(137, 'me@alsome.com', '12312', 'Christopher', 'Acosta Madrigal', '86473533'),
(138, 'me@sonia.com', '12', 'Christopher', 'Acosta Madrigal', '86473533'),
(139, 'me@sonia.com21', '1231', 'Christopher', 'Acosta Madrigal', '86473533'),
(140, 'me@sonia.com21', '1231', 'Christopher', 'Acosta Madrigal', '86473533'),
(141, 'me@sonia.com21131', '1231311', 'Christopher', 'Acosta Madrigal', '86473533'),
(142, 'me@son1231.com', '123', 'Christopher', 'Acosta Madrigal', '86478888');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reg_usr`
--
ALTER TABLE `reg_usr`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `reg_usr`
--
ALTER TABLE `reg_usr`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
