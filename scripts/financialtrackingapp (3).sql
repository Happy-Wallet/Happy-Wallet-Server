-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 02, 2025 at 03:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `financialtrackingapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `icon_res` varchar(11) NOT NULL,
  `color_res` varchar(11) NOT NULL,
  `type` enum('income','expense','savingGoal') NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `user_id`, `icon_res`, `color_res`, `type`, `name`) VALUES
(29, 2, 'ic_bell', 'color_1', 'expense', 'Cfe'),
(30, NULL, 'ic_house', 'color_1', 'expense', 'Tiền nhà'),
(31, NULL, 'ic_wallet', 'color_2', 'expense', 'Ăn uống'),
(32, NULL, 'ic_paper_pl', 'color_3', 'expense', 'Di chuyển'),
(33, NULL, 'ic_chats_ci', 'color_4', 'expense', 'Giải trí'),
(34, NULL, 'ic_gear_six', 'color_5', 'expense', 'Mua sắm'),
(35, NULL, 'ic_users_th', 'color_6', 'expense', 'Sức khỏe'),
(36, NULL, 'ic_bell', 'color_7', 'expense', 'Giáo dục'),
(37, NULL, 'ic_arrow_le', 'color_8', 'expense', 'Hóa đơn'),
(38, NULL, 'ic_image_sq', 'color_9', 'expense', 'Đồ dùng gia đình'),
(39, NULL, 'ic_plus_sol', 'color_10', 'expense', 'Khác'),
(40, NULL, 'ic_wallet', 'color_11', 'income', 'Lương'),
(41, NULL, 'ic_plus_sol', 'color_12', 'income', 'Thưởng'),
(42, NULL, 'ic_bell', 'color_13', 'income', 'Đầu tư'),
(43, NULL, 'ic_paper_pl', 'color_14', 'income', 'Tiền làm thêm'),
(44, NULL, 'ic_users_th', 'color_15', 'income', 'Quà tặng'),
(45, NULL, 'ic_arrow_le', 'color_16', 'income', 'Hoàn tiền'),
(46, NULL, 'ic_house', 'color_17', 'savingGoal', 'Mua nhà'),
(47, NULL, 'ic_wallet', 'color_18', 'savingGoal', 'Mua xe'),
(48, NULL, 'ic_paper_pl', 'color_19', 'savingGoal', 'Du lịch'),
(49, NULL, 'ic_chats_ci', 'color_20', 'savingGoal', 'Giáo dục con'),
(50, NULL, 'ic_gear_six', 'color_1', 'savingGoal', 'Nghỉ hưu'),
(51, NULL, 'ic_plus_sol', 'color_2', 'savingGoal', 'Quỹ khẩn cấp');

-- --------------------------------------------------------

--
-- Table structure for table `funds`
--

CREATE TABLE `funds` (
  `fund_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_by_user_id` int(10) UNSIGNED NOT NULL,
  `current_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `has_target` tinyint(1) NOT NULL DEFAULT 0,
  `target_amount` decimal(15,2) DEFAULT NULL,
  `target_end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `funds`
--

INSERT INTO `funds` (`fund_id`, `category_id`, `name`, `description`, `created_by_user_id`, `current_amount`, `has_target`, `target_amount`, `target_end_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, NULL, 'Quỹ Gia đình Hạnh Phúc', 'Quản lý chi tiêu chung của gia đình hàng tháng.', 3, 0.00, 0, NULL, NULL, '2025-07-02 19:59:15', '2025-07-02 19:59:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `funds_members`
--

CREATE TABLE `funds_members` (
  `fund_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `role` varchar(50) NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `funds_members`
--

INSERT INTO `funds_members` (`fund_id`, `user_id`, `role`, `status`, `created_at`, `deleted_at`) VALUES
(2, 2, 'Member', 'pending', '2025-07-02 20:05:07', NULL),
(2, 3, 'Admin', 'accepted', '2025-07-02 19:59:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `funds_transactions`
--

CREATE TABLE `funds_transactions` (
  `transaction_id` int(10) UNSIGNED NOT NULL,
  `fund_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('income','expense') NOT NULL DEFAULT 'expense',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saving_goals`
--

CREATE TABLE `saving_goals` (
  `goal_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `current_amount` decimal(15,2) NOT NULL,
  `target_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `target_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `type` enum('income','expense','savingGoal') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `user_id`, `category_id`, `amount`, `description`, `date`, `type`) VALUES
(1, 2, 34, 500000.00, 'Mua sắm tại siêu thị', '2025-07-01 15:30:00', 'expense');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `avatar_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `username`, `hashed_password`, `date_of_birth`, `created_at`, `updated_at`, `deleted_at`, `avatar_url`) VALUES
(2, 'hoanghaiyencbm@gmail.com', 'hhy', '$2b$10$dWFvMM3n4Jdm/7y6WkbWi.ONVO8U3EiaY1FtZepGQJMNS/gJgir.y', '2025-06-30', '2025-06-30 19:29:32', '2025-07-02 19:26:15', NULL, 'https://res.cloudinary.com/dmutcpoey/image/upload/v1751459174/avatars/czqhv9aezboassu62qna.jpg'),
(3, 'mochihoang@gmail.com', 'tester', '$2b$10$Nqn7CKgXhpO1ZEKEY6sCiuPvt2TOB/uBZr0u5fx4RVKkuzp1FBWv6', '2000-01-01', '2025-07-02 19:47:48', '2025-07-02 19:47:48', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `funds`
--
ALTER TABLE `funds`
  ADD PRIMARY KEY (`fund_id`),
  ADD KEY `fk_funds_created_by_user_id` (`created_by_user_id`),
  ADD KEY `fk_funds_category_id` (`category_id`);

--
-- Indexes for table `funds_members`
--
ALTER TABLE `funds_members`
  ADD PRIMARY KEY (`fund_id`,`user_id`),
  ADD KEY `fk_funds_members_user_id` (`user_id`);

--
-- Indexes for table `funds_transactions`
--
ALTER TABLE `funds_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `fk_funds_transactions_fund_id` (`fund_id`),
  ADD KEY `fk_funds_transactions_user_id` (`user_id`),
  ADD KEY `fk_funds_transactions_category_id` (`category_id`);

--
-- Indexes for table `saving_goals`
--
ALTER TABLE `saving_goals`
  ADD PRIMARY KEY (`goal_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `funds`
--
ALTER TABLE `funds`
  MODIFY `fund_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `funds_transactions`
--
ALTER TABLE `funds_transactions`
  MODIFY `transaction_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saving_goals`
--
ALTER TABLE `saving_goals`
  MODIFY `goal_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `funds`
--
ALTER TABLE `funds`
  ADD CONSTRAINT `fk_funds_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_funds_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `funds_members`
--
ALTER TABLE `funds_members`
  ADD CONSTRAINT `fk_funds_members_fund_id` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`fund_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_funds_members_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `funds_transactions`
--
ALTER TABLE `funds_transactions`
  ADD CONSTRAINT `fk_funds_transactions_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_funds_transactions_fund_id` FOREIGN KEY (`fund_id`) REFERENCES `funds` (`fund_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_funds_transactions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `saving_goals`
--
ALTER TABLE `saving_goals`
  ADD CONSTRAINT `saving_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saving_goals_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
