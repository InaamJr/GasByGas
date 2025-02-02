CREATE DATABASE GasByGas;

USE GasByGas;

-- Cylinder types lookup table
CREATE TABLE `cylinder_types` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` varchar(100),
  `weight_kg` decimal(5,2) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Base consumer table
CREATE TABLE `consumer` (
  `consumer_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `nic` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contact_no` varchar(13) NOT NULL,
  `consumer_type` ENUM('general', 'business') NOT NULL,
  `joined_date` datetime NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`consumer_id`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `contact_no_UNIQUE` (`contact_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- General consumer authentication
CREATE TABLE `general_consumer` (
  `general_consumer_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`general_consumer_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  CONSTRAINT `fk_general_consumer` FOREIGN KEY (`general_consumer_id`) REFERENCES `consumer` (`consumer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Head office administrators
CREATE TABLE `head_office_admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `nic` varchar(15) NOT NULL,
  `contact` varchar(13) NOT NULL,
  `email` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `is_super_admin` BOOLEAN NOT NULL DEFAULT FALSE,
  `profile_image` blob NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `contact_UNIQUE` (`contact`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Business/Industrial consumer extension
CREATE TABLE `business_consumer` (
  `business_consumer_id` int NOT NULL,
  `business_name` varchar(50) NOT NULL,
  `business_reg_no` varchar(20) NOT NULL,
  `certification_document` blob NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `verification_status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  `verification_date` datetime,
  `verified_by` int,
  PRIMARY KEY (`business_consumer_id`),
  UNIQUE KEY `business_reg_no_UNIQUE` (`business_reg_no`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  CONSTRAINT `fk_business_consumer` FOREIGN KEY (`business_consumer_id`) REFERENCES `consumer` (`consumer_id`),
  CONSTRAINT `fk_business_verified_by_admin` FOREIGN KEY (`verified_by`) REFERENCES `head_office_admin` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Outlet managers
CREATE TABLE `outlet_manager` (
  `manager_id` int NOT NULL AUTO_INCREMENT,
  `outlet_registration_id` varchar(15) NOT NULL,
  `outlet_name` varchar(50) NOT NULL,
  `outlet_address` varchar(100) NOT NULL,
  `outlet_certificate` blob NOT NULL,
  `manager_name` varchar(50) NOT NULL,
  `nic` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contact_no` varchar(13) NOT NULL,
  `password` varchar(255) NOT NULL,
  `verification_status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  `verification_date` datetime,
  `verified_by` int,
  PRIMARY KEY (`manager_id`),
  UNIQUE KEY `contact_no_UNIQUE` (`contact_no`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `outlet_registration_id_UNIQUE` (`outlet_registration_id`),
  CONSTRAINT `fk_verified_by_admin` FOREIGN KEY (`verified_by`) REFERENCES `head_office_admin` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Outlets
CREATE TABLE `outlet` (
  `outlet_id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `outlet_name` varchar(50) NOT NULL,
  `district` varchar(25) NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`outlet_id`),
  KEY `manager_id_idx` (`manager_id`),
  CONSTRAINT `fk_outlet_manager` FOREIGN KEY (`manager_id`) REFERENCES `outlet_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Gas requests
CREATE TABLE `gas_request` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `consumer_id` int NOT NULL,
  `outlet_id` int NOT NULL,
  `request_date` datetime NOT NULL,
  `expected_pickup_date` date NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected', 'reallocated', 'completed', 'expired') NOT NULL DEFAULT 'pending',
  `reallocation_status` ENUM('original', 'reallocated', 'reallocated_from') NOT NULL DEFAULT 'original',
  PRIMARY KEY (`request_id`),
  KEY `consumer_id_idx` (`consumer_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  CONSTRAINT `fk_request_consumer` FOREIGN KEY (`consumer_id`) REFERENCES `consumer` (`consumer_id`),
  CONSTRAINT `fk_request_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Gas request details
CREATE TABLE `gas_request_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `request_id_idx` (`request_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  CONSTRAINT `fk_request_details` FOREIGN KEY (`request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_cylinder_type` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Request reallocations
CREATE TABLE `request_reallocation` (
  `reallocation_id` int NOT NULL AUTO_INCREMENT,
  `original_request_id` int NOT NULL,
  `new_request_id` int NOT NULL,
  `reallocation_date` datetime NOT NULL,
  `reason` text,
  `reallocated_by` int NOT NULL,
  PRIMARY KEY (`reallocation_id`),
  KEY `original_request_id_idx` (`original_request_id`),
  KEY `new_request_id_idx` (`new_request_id`),
  KEY `reallocated_by_idx` (`reallocated_by`),
  CONSTRAINT `fk_original_request` FOREIGN KEY (`original_request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_new_request` FOREIGN KEY (`new_request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_reallocated_by` FOREIGN KEY (`reallocated_by`) REFERENCES `outlet_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tokens
CREATE TABLE `token` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `token_no` varchar(15) NOT NULL,
  `generated_by` int NOT NULL,
  `generated_date` datetime NOT NULL,
  `expiry_date` date NOT NULL,
  `status` ENUM('valid', 'used', 'expired', 'reallocated') NOT NULL DEFAULT 'valid',
  `reallocated_to` int DEFAULT NULL,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token_no_UNIQUE` (`token_no`),
  KEY `request_id_idx` (`request_id`),
  KEY `generated_by_idx` (`generated_by`),
  KEY `reallocated_to_idx` (`reallocated_to`),
  CONSTRAINT `fk_token_request` FOREIGN KEY (`request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_token_admin` FOREIGN KEY (`generated_by`) REFERENCES `head_office_admin` (`admin_id`),
  CONSTRAINT `fk_token_reallocated` FOREIGN KEY (`reallocated_to`) REFERENCES `gas_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Outlet stock
CREATE TABLE `outlet_stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `outlet_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  `last_updated` datetime NOT NULL,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `outlet_cylinder_UNIQUE` (`outlet_id`, `cylinder_type_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  CONSTRAINT `fk_stock_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`),
  CONSTRAINT `fk_stock_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Outlet orders
CREATE TABLE `outlet_order` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `outlet_id` int NOT NULL,
  `order_date` datetime NOT NULL,
  `expected_delivery_date` date NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  CONSTRAINT `fk_order_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Order details
CREATE TABLE `order_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  `status` ENUM('pending', 'scheduled', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`detail_id`),
  KEY `order_id_idx` (`order_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  CONSTRAINT `fk_order_details` FOREIGN KEY (`order_id`) REFERENCES `outlet_order` (`order_id`),
  CONSTRAINT `fk_order_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Stock transactions
CREATE TABLE `stock_transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `outlet_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `transaction_type` ENUM('in', 'out') NOT NULL,
  `quantity` int NOT NULL,
  `transaction_date` datetime NOT NULL,
  `reference_request_id` int,
  `reference_order_id` int,
  PRIMARY KEY (`transaction_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  KEY `reference_request_id_idx` (`reference_request_id`),
  KEY `reference_order_id_idx` (`reference_order_id`),
  CONSTRAINT `fk_transaction_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`),
  CONSTRAINT `fk_transaction_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`),
  CONSTRAINT `fk_transaction_request` FOREIGN KEY (`reference_request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_transaction_order` FOREIGN KEY (`reference_order_id`) REFERENCES `outlet_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Delivery schedules
CREATE TABLE `delivery_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `scheduled_by` int NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `delivery_date` date NOT NULL,
  `status` ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  PRIMARY KEY (`schedule_id`),
  KEY `order_id_idx` (`order_id`),
  KEY `scheduled_by_idx` (`scheduled_by`),
  CONSTRAINT `fk_schedule_order` FOREIGN KEY (`order_id`) REFERENCES `outlet_order` (`order_id`),
  CONSTRAINT `fk_schedule_admin` FOREIGN KEY (`scheduled_by`) REFERENCES `head_office_admin` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Empty cylinder returns
CREATE TABLE `cylinder_return` (
  `return_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `return_date` datetime NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  `received_by` int NOT NULL,
  PRIMARY KEY (`return_id`),
  KEY `request_id_idx` (`request_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  KEY `received_by_idx` (`received_by`),
  CONSTRAINT `fk_return_request` FOREIGN KEY (`request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_return_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`),
  CONSTRAINT `fk_return_manager` FOREIGN KEY (`received_by`) REFERENCES `outlet_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `password_reset_tokens` ( 
  `id` int NOT NULL AUTO_INCREMENT, 
  `email` varchar(100) NOT NULL, 
  `token` varchar(255) NOT NULL, 
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  `expires_at` datetime NOT NULL, 
  `used` boolean NOT NULL DEFAULT FALSE, PRIMARY KEY (`id`), KEY `email_token_idx` (`email`, `token`)) 
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



-- OTP verifications table
CREATE TABLE `otp_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token_id` int NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Notifications table
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `outlet_id` int NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`notification_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  CONSTRAINT `fk_notification_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
