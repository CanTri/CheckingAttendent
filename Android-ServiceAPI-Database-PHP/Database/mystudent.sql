
-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 09, 2018 at 02:19 PM
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
-- Table structure for table `mystudent`
--

CREATE TABLE IF NOT EXISTS `mystudent` (
  `name` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `imagelink` varchar(800) COLLATE utf8_unicode_ci NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `mystudent`
--

INSERT INTO `mystudent` (`name`, `imagelink`) VALUES
('To Bach Tung Hiep', 'https://i.imgur.com/fhmA3rV.png$https://i.imgur.com/UgFUYWJ.png$https://i.imgur.com/guXGfgL.png$https://i.imgur.com/N8Jv7fd.png$https://i.imgur.com/ypXCEjV.png$'),
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
('Le Van Tam', 'https://i.imgur.com/0d5WkYc.png$https://i.imgur.com/ZBfdiFE.png$https://i.imgur.com/OYdjmTa.png$https://i.imgur.com/AFrmmk6.png$'),
('Nguyen Trong Tan', ''),
('Vo Phu Thanh', ''),
('Le Quang Tien', ''),
('Dang Dinh Quoc Trung', ''),
('Nguyen Duc Vy', '');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
