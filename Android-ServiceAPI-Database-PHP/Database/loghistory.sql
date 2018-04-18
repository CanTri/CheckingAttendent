
-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 09, 2018 at 02:18 PM
-- Server version: 10.1.22-MariaDB
-- PHP Version: 5.2.17

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `u702024024_demo`
--

-- --------------------------------------------------------

--
-- Table structure for table `loghistory`
--

CREATE TABLE IF NOT EXISTS `loghistory` (
  `name` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `log` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `loghistory`
--

INSERT INTO `loghistory` (`name`, `log`) VALUES
('To Bach Tung Hiep', 'Toa do: (10.7895719,106.7024624)  - Method: QRCode - Time: Wed Apr 04 16:59:05 GMT+07:00 2018$Toa do: (10.7895644,106.7024484)  - Method: Quiz - Time: Wed Apr 04 18:48:50 GMT+07:00 2018$Diem danh: Nguyen Duc Vy - Toa do: (10.7895408,106.7024788)  - Method: Check List  - Time: Wed Apr 04 19:17:51 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7894696,106.7025362)  - Method: Check List  - Time: Wed Apr 04 19:18:03 GMT+07:00 2018$Diem danh: Le Quang Tien - Toa do: (10.789417,106.7024676)  - Method: Check List  - Time: Wed Apr 04 19:18:07 GMT+07:00 2018$Diem danh: Dang Dinh Quoc Trung - Toa do: (10.789417,106.7024676)  - Method: Check List  - Time: Wed Apr 04 19:18:08 GMT+07:00 2018$Diem danh: Le Van Tam - Toa do: (10.789417,106.7024676)  - Method: Check List  - Time: Wed Apr 04 19:18:12 GMT+07:00 2018$Toa do: (10.7896455,106.7024372)  - Method: QRCode - Time: Thu Apr 05 22:30:57 GMT+07:00 2018$Toa do: (10.7894285,106.7024873)  - Method: Quiz - Time: Thu Apr 05 22:32:44 GMT+07:00 2018$Toa do: (10.7624665,106.6820483)  - Method: QRCode - Time: Fri Apr 06 08:10:23 GMT+07:00 2018$'),
('Dinh Ba Tien', 'Diem danh: To Bach Tung Hiep - Toa do: (10.7891943,106.7026637)  - Method: Face Detection  - Time: Mon Apr 02 21:43:57 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7892488,106.7026373)  - Method: Face Detection  - Time: Mon Apr 02 21:44:47 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7894951,106.7024969)  - Method: Face Detection  - Time: Mon Apr 02 21:44:56 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7894951,106.7024969)  - Method: Face Detection  - Time: Mon Apr 02 22:02:37 GMT+07:00 2018$Diem danh: Le Van Tam - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 13:37:12 GMT+07:00 2018$Diem danh: Le Van Tam - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 13:37:27 GMT+07:00 2018$Diem danh: Le Van Tam - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 13:38:20 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 14:21:17 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 14:21:27 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 14:21:34 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7896455,106.7024372)  - Method: Face Detection  - Time: Tue Apr 03 19:57:50 GMT+07:00 2018$Diem danh: Le Van Tam - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 20:04:05 GMT+07:00 2018$Diem danh: Le Van Tam - Toa do: (Error,Error)  - Method: Face Detection  - Time: Tue Apr 03 20:04:50 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7893873,106.7025177)  - Method: Face Detection  - Time: Tue Apr 03 21:06:04 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7893873,106.7025177)  - Method: Face Detection  - Time: Tue Apr 03 21:11:04 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7893873,106.7025177)  - Method: Face Detection  - Time: Tue Apr 03 21:14:21 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7895437,106.7024186)  - Method: Face Detection  - Time: Tue Apr 03 21:16:35 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7896215,106.7024325)  - Method: Face Detection  - Time: Tue Apr 03 21:23:38 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7896455,106.7024372)  - Method: Face Detection  - Time: Tue Apr 03 21:29:21 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7896455,106.7024372)  - Method: Face Detection  - Time: Tue Apr 03 21:29:35 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7896455,106.7024372)  - Method: Face Detection  - Time: Tue Apr 03 21:39:22 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.789081,106.7030663)  - Method: Face Detection  - Time: Tue Apr 03 21:39:37 GMT+07:00 2018$Diem danh: Dang Dinh Quoc Trung - Toa do: (10.7896455,106.7024372)  - Method: Check List  - Time: Tue Apr 03 22:13:38 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7896335,106.7022943)  - Method: Face Detection  - Time: Thu Apr 05 14:27:08 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7624814,106.6820162)  - Method: Face Detection  - Time: Thu Apr 05 14:36:31 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7624814,106.6820162)  - Method: Face Detection  - Time: Thu Apr 05 14:36:50 GMT+07:00 2018$Diem danh: Le Quang Tien - Toa do: (10.7624814,106.6820162)  - Method: Check List  - Time: Thu Apr 05 14:38:09 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7624744,106.6820169)  - Method: Face Detection  - Time: Thu Apr 05 22:28:28 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7894693,106.7025056)  - Method: Face Detection  - Time: Thu Apr 05 22:29:37 GMT+07:00 2018$Diem danh: Dang Dinh Quoc Trung - Toa do: (10.7895419,106.7025147)  - Method: Check List  - Time: Thu Apr 05 22:29:57 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7893667,106.7025714)  - Method: Face Detection  - Time: Thu Apr 05 22:35:33 GMT+07:00 2018$Diem danh: To Bach Tung Hiep - Toa do: (10.7624774,106.682046)  - Method: Face Detection  - Time: Fri Apr 06 08:05:14 GMT+07:00 2018$Diem danh: Bui Nhat Khoi - Toa do: (10.7624614,106.6820569)  - Method: Face Detection  - Time: Fri Apr 06 08:06:01 GMT+07:00 2018$'),
('Le Phan Truong An', ''),
('Pham Nguyen Quoc Anh', ''),
('Luu Dinh Huan', ''),
('Dao Vu Dat', ''),
('Tran Quang Hien', ''),
('Ho Nhat Hoai', ''),
('Van Lien Huong', ''),
('Che Vu Gia Hy', ''),
('Do Tri Khai', ''),
('Dam Tuan Khoi', ''),
('Bui Nhat Khoi', ''),
('Tran Nhat Minh', ''),
('Pham Thi Bich Ngoc', ''),
('Pham Hoang Phat', ''),
('Doan Nguyen Trung Quan', ''),
('Le Van Tam', ''),
('Nguyen Trong Tan', ''),
('Vo Phu Thanh', ''),
('Le Quang Tien', ''),
('Dang Dinh Quoc Trung', ''),
('Nguyen Duc Vy', '');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
