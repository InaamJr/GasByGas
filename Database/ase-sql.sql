CREATE DATABASE  IF NOT EXISTS `gasbygas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gasbygas`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: gasbygas
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `business_consumer`
--

DROP TABLE IF EXISTS `business_consumer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_consumer` (
  `business_consumer_id` int NOT NULL,
  `business_name` varchar(50) NOT NULL,
  `business_reg_no` varchar(20) NOT NULL,
  `certification_document` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `verification_status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `verification_date` datetime DEFAULT NULL,
  `verified_by` int DEFAULT NULL,
  PRIMARY KEY (`business_consumer_id`),
  UNIQUE KEY `business_reg_no_UNIQUE` (`business_reg_no`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  CONSTRAINT `fk_business_consumer` FOREIGN KEY (`business_consumer_id`) REFERENCES `consumer` (`consumer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_consumer`
--

LOCK TABLES `business_consumer` WRITE;
/*!40000 ALTER TABLE `business_consumer` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_consumer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consumer`
--

DROP TABLE IF EXISTS `consumer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumer` (
  `consumer_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `nic` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contact_no` varchar(13) NOT NULL,
  `consumer_type` enum('general','business') NOT NULL,
  `joined_date` datetime NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`consumer_id`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `contact_no_UNIQUE` (`contact_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consumer`
--

LOCK TABLES `consumer` WRITE;
/*!40000 ALTER TABLE `consumer` DISABLE KEYS */;
/*!40000 ALTER TABLE `consumer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cylinder_return`
--

DROP TABLE IF EXISTS `cylinder_return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_return_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`),
  CONSTRAINT `fk_return_manager` FOREIGN KEY (`received_by`) REFERENCES `outlet_manager` (`manager_id`),
  CONSTRAINT `fk_return_request` FOREIGN KEY (`request_id`) REFERENCES `gas_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cylinder_return`
--

LOCK TABLES `cylinder_return` WRITE;
/*!40000 ALTER TABLE `cylinder_return` DISABLE KEYS */;
/*!40000 ALTER TABLE `cylinder_return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cylinder_types`
--

DROP TABLE IF EXISTS `cylinder_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cylinder_types` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `weight_kg` decimal(5,2) NOT NULL,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cylinder_types`
--

LOCK TABLES `cylinder_types` WRITE;
/*!40000 ALTER TABLE `cylinder_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `cylinder_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_schedule`
--

DROP TABLE IF EXISTS `delivery_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `scheduled_by` int NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `delivery_date` date NOT NULL,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  PRIMARY KEY (`schedule_id`),
  KEY `order_id_idx` (`order_id`),
  KEY `scheduled_by_idx` (`scheduled_by`),
  CONSTRAINT `fk_schedule_admin` FOREIGN KEY (`scheduled_by`) REFERENCES `head_office_admin` (`admin_id`),
  CONSTRAINT `fk_schedule_order` FOREIGN KEY (`order_id`) REFERENCES `outlet_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_schedule`
--

LOCK TABLES `delivery_schedule` WRITE;
/*!40000 ALTER TABLE `delivery_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gas_request`
--

DROP TABLE IF EXISTS `gas_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gas_request` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `consumer_id` int NOT NULL,
  `outlet_id` int NOT NULL,
  `request_date` datetime NOT NULL,
  `expected_pickup_date` date NOT NULL,
  `status` enum('pending','accepted','rejected','reallocated','completed','expired') NOT NULL DEFAULT 'pending',
  `reallocation_status` enum('original','reallocated','reallocated_from') NOT NULL DEFAULT 'original',
  PRIMARY KEY (`request_id`),
  KEY `consumer_id_idx` (`consumer_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  CONSTRAINT `fk_request_consumer` FOREIGN KEY (`consumer_id`) REFERENCES `consumer` (`consumer_id`),
  CONSTRAINT `fk_request_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gas_request`
--

LOCK TABLES `gas_request` WRITE;
/*!40000 ALTER TABLE `gas_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `gas_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gas_request_details`
--

DROP TABLE IF EXISTS `gas_request_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gas_request_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `request_id_idx` (`request_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  CONSTRAINT `fk_cylinder_type` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`),
  CONSTRAINT `fk_request_details` FOREIGN KEY (`request_id`) REFERENCES `gas_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gas_request_details`
--

LOCK TABLES `gas_request_details` WRITE;
/*!40000 ALTER TABLE `gas_request_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `gas_request_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_consumer`
--

DROP TABLE IF EXISTS `general_consumer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_consumer` (
  `general_consumer_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`general_consumer_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  CONSTRAINT `fk_general_consumer` FOREIGN KEY (`general_consumer_id`) REFERENCES `consumer` (`consumer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_consumer`
--

LOCK TABLES `general_consumer` WRITE;
/*!40000 ALTER TABLE `general_consumer` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_consumer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `head_office_admin`
--

DROP TABLE IF EXISTS `head_office_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `head_office_admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `nic` varchar(15) NOT NULL,
  `contact` varchar(13) NOT NULL,
  `email` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `contact_UNIQUE` (`contact`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `head_office_admin`
--

LOCK TABLES `head_office_admin` WRITE;
/*!40000 ALTER TABLE `head_office_admin` DISABLE KEYS */;
INSERT INTO `head_office_admin` VALUES (1,'Amal','28990382718V','07772899372','ama@gmail.com','amal_admin01','amal ','active'),(2,'Sunil','97662538201V','0777268835','sunil_P@gmail.com','Sunil_admin02','sunil','active');
/*!40000 ALTER TABLE `head_office_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `recipient_type` enum('consumer','outlet_manager') NOT NULL,
  `recipient_id` int NOT NULL,
  `type` enum('delivery_schedule','token_expiry','stock_alert','request_status') NOT NULL,
  `message` text NOT NULL,
  `sent_via` enum('email','sms','both') NOT NULL,
  `sent_date` datetime NOT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `reference_id` int DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `sent_date_idx` (`sent_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `order_id_idx` (`order_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  CONSTRAINT `fk_order_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`),
  CONSTRAINT `fk_order_details` FOREIGN KEY (`order_id`) REFERENCES `outlet_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outlet`
--

DROP TABLE IF EXISTS `outlet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outlet` (
  `outlet_id` int NOT NULL AUTO_INCREMENT,
  `manager_id` int NOT NULL,
  `outlet_name` varchar(50) NOT NULL,
  `district` varchar(25) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`outlet_id`),
  KEY `manager_id_idx` (`manager_id`),
  CONSTRAINT `fk_outlet_manager` FOREIGN KEY (`manager_id`) REFERENCES `outlet_manager` (`manager_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outlet`
--

LOCK TABLES `outlet` WRITE;
/*!40000 ALTER TABLE `outlet` DISABLE KEYS */;
INSERT INTO `outlet` VALUES (1,1,'EcoFriendly Gas Hub','Galle','active'),(2,4,'first','Galle','active');
/*!40000 ALTER TABLE `outlet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outlet_manager`
--

DROP TABLE IF EXISTS `outlet_manager`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `verification_status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `verification_date` datetime DEFAULT NULL,
  `verified_by` int DEFAULT NULL,
  PRIMARY KEY (`manager_id`),
  UNIQUE KEY `contact_no_UNIQUE` (`contact_no`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `outlet_registration_id_UNIQUE` (`outlet_registration_id`),
  KEY `fk_verified_by_admin` (`verified_by`),
  CONSTRAINT `fk_verified_by_admin` FOREIGN KEY (`verified_by`) REFERENCES `head_office_admin` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outlet_manager`
--

LOCK TABLES `outlet_manager` WRITE;
/*!40000 ALTER TABLE `outlet_manager` DISABLE KEYS */;
INSERT INTO `outlet_manager` VALUES (1,'LP_REG56789','EcoFriendly Gas Hub','123 Matara Road, Galle, Sri Lanka',_binary '�\��\�\0JFIF\0\0\0\0\0\0�\�\0�\0	( %!1!%)+...383-7(-.+\n\n\n\r.+770-.7++2-7-707+-6+777----+2+77+++--++--++++++.++��\0\0\�\0\"\0�\�\0\0\0\0\0\0\0\0\0\0\0\0\0\0�\�\0E\0\r\0\0\0\0\0!1AQ\"5RSaq����\�\�2�\�B�#Cb���$34r\�%Ec���\�\0\0\0\0\0\0\0\0\0\0\0\0\0�\�\0\'\0\0\0\0\0\0\0\0\0�Rr1cBCb!Q��\�\0\0\0?\0��I)�t���N�E�.�\�8�t�<\\HÈ���^�83�31#���AYK�Oh�|�����\�yw���\�=�ݫ!\"V\�\�<$\�=��N\��U�\�\�Mڴ�en\�=���J\�\�<$\�?X\���ݫIecI\��wt�\�\��+\�~*�v~\�.\�!e.\�=���E\�\'�x>Jw�������I��\�\'�x>H����\�;�\�V;Om7j\�%�����\�+�Oh�|���Uc��\�v�6������\�0\�\'�x>I\�~*�\�{i�T������\�+�Oh�|���Uc��\�v�+wI\��.\�=��N\��U�\�\�Mڲ���\�\'�x>H����\�;�\�V;Om7jJY[�Oh�S����\�;�\�V;?m7j�,�\�\'�x(����\�;�\�V;?m7j�,�n�\�<$�\�=���N\��U�\�\�Mڰ-����ڷ\Z\�[\�\�Z9\�ԯ\\,XĎ�:<q�g\n��f\'�u����S�\�Z\�\��\�1�\�\\�\�\�Z�\�I����}���B�*���T�\�a�E*����\�F*�١���6^��\��X8I�\�\��Rt\�j����zRՄ��lVg\�\�l�+֩N�\ZιU¥\�S}\0^E\�;J�Vc����P���!re\�\nr��BJ�4�M% \�E	��RB J@\n��s�P2��\�YxM�\�j\�V\�\�o\�?M�RV|���Kfs\�2���z�\�լ��S�\�c\�\��\�\�Z���^��L��憇\� ��,hZc\n�W��	\�/P�\�\�K�\�\�B�҆�\�Lӂ涕\�/^�8Ԫ�$\�\�+��m��V>�̴�z	]3x8dZD���Ch\�M\nu\�K\�:桦\�].y� �\�	;�\�\�(�\0�e<\�-�w��Z\�\�k\�f�;&뻧b�*�CYi\��\�\�t����\�7��\\Iĕ`m�\�����i�.j�\0Q\�\��.T��PB����,\�\�W�-kZ\�.{\�\�\�1��$���Y b��m\�\�Tn`�qi� \�33�@3\�LT�B�t�\rѴ�j{��sx^s\\C�5��#�W��NR���f�kn�!�SL8�cP<�B�\�~\�2�\�Z\�\�52\�L^m0	pm\�\�2\"$D� �^��\�57zw�\�����Gs�\�r\�\��޴wCKt�!X\�� <�(7]\�+\�\�hmAy��A �\���%\0�\0�!!�(M�)�Te,\�&���ڵN++f\�7��ժY�\�+\�-y\�8|!\�ɻ�:�\�\�\�\�;�:�ʙ��(\\�\�\�Z\�_ncZ\�\�\��\�\�K�\�j�\0�<!i�9Q5\�f��*L4s��\�\�\�\�^ػ4��U��#-�3�5tS]jN�z��\�\�b\�L9�4FCD/J�4\� ������v�\�hJjj:9�d\�+���a!i}\�M#J�p�湤1\�p{\�A\������\�R�\�Q���0\�KKH8�?1\�\"��\�Ⱦ\�٘�O�Ԃ-�E2�c]�׍\Zt.\�C)9\�l\0�\�h��a�~�/Æ��m\�s\�P��h���U����	�g�\�j��\�\��:b\�\�@U\r�Y�d:�4e8Du�{,\�de�׭���U\�L1\�\�I\�s�\�\�1\"����\�T1��\�Zt>��b�$\�#j���\�\�\'^uBeG�h�H_��d;~\�DrS�e�Q�)�]��4�\�s�6��\��ìv���b\�5\�L I&�D9I@ҔЊI!5Q��p��\�jլ���\�\�~�V�f\�x���g<\�񂅕<(:>\�լ��\�~�r���(2o	j���2(\�@\�H((B%4	P/M��<H\�Y3\\×�ízʃ�-n�H\�kC�OQ��\�\0߸d\0\�7\�\�t�&@1�(���\�CAq\r7��j\�\�RIi\�];\�ess\�s���\�U��\�ikkS\�✰�5)S-�f�4^�\�I�\�A\��t���\��\'�\�|c-aA-�\Z�޹�\�ə\�\���@\��ܻ-N��Dj\�I\'UE_jw1Wt�.�Ѻ1�\\׆\�}MX�\�X\�*4�\�C��\r�]E��.�^i0ڵh\�h\�\�.\�a\Z�Akb\��\�n`�\�2I\�c3\�T�Ei\rݮu\�0�\�Hp#�x\"�!\�P\�sLЊI4\�eD	.�@!\0&�!2��\�ٸM�\�j\�R\�\�?M�V�\�W\�[3�p�����GG\�Z��<+\��S1�\�O\�\�-QL��\�\�\nMUۍ�;�\�\�d����\�n\�<��{\�\�o}+�虜\�\�˨D\�9`�4�\\z`u�k��N��\� E�!T\Z��\�\�@I�\�p@���\�\�bu�g>iԧ\r$IȆ��\\nz�\0Y\�Pe��5i~R葑$\�7r��\�s\�1Y�{�V��\�N-`ˆ#�ghY$�� DD�5�U7Zp��L�\�q\�dn\�\�\���\0\0&��\�`\�f�ϯ�TO}�������q-i.h\�8\�#�������4\�Z\0\0��#^*\�Ԫo�^�p\�\�\�\�7?,\�N5Kn\�\�863\�q-&o�\�IV5��\��\�c�;\�؀@8�s\�WB�x�\�\�w�$����Z�n�� �d\�P`4|��w\\t.\�+��J0��\�$A3c�9(\'Y\�2��\�5�\��юx��6KF�\�``6A$\�\�&n\�\\\�\���b\�\�Hk轧�8��OL��E\�!U���u)jÚ7ѽ\�\�\�~\�6Y��� �\�\�r\�D��13�[&��Y�]y5�\�s\\�7�\Z.��\�dZr�fA8v�U\�,\�Yx\�9�H\r7Nz�\�g\Z�$�U;�d\��\\1��\�်�#�\0q̞b�@���&].��\Z��n�[�L�.Br�\r^�;��&[%\�\�a&��\0�v0.�\�V\r؃��!V\�\�?M�T��nA�mZ��\�W\�[3�p��YC_ekL�W\�L\�Ô?���At�B\�\�d���@Ѐ��FҨI{d�<]�Z���.=\�C�;۹�\�ݻ	VAYW@\�#���C��͊�\�L��\0$d\�\�`0\�0LIs�%�9\��̺\0$\�0�-\��\r\�7��m\"cY\�V(T@��\�\�ņI$\�$�ӌ�ot!�.�� Ʊ\'|%\��\�縈ȕ=$E}-	A�0\��<\�ߗ3��4\r\� 7\�\�\�\�\�*\�&��\Z\Z�\�AA�b\'�pt\Z\r<E\��\0&8\r|�J�) �n��?w�3�;>ܹ�N���\�\\��v7��u\��yH���H\�-\�\�K�84�9\�[@9�W�+6�Z\�[0q\�K��{�T�\�T)ABR�Ҡ�$�R\�\�o\�?M�W)f\�7��իY��+\�-�\�8| ,�\�Q��\�լ�\�A��\�f>�\���%�BI���&R�(�*�KR\rr\�\�]�T3DTl]�8\0>P\�vCCf/ds#i&r��qyq5I���Ie\�\�\�?�]\�mUPN�r7ˢ$\�A\�N\��7HV��\��\�`:�u\�\�炊�\Z�ĸNB\�X��8tt�R�U\�\\\�Aż���(�ڤZ\�X\�F\�-�I�q�F��p&5m��u\�<.�\0F\0d\'�TX[hn��Xe�8f\\ۈ6ʉd�=��.f;\�#i�̒H3�ˑ�aT\�dE�\��V3�	\�lc�gжV!\�FKbIߴ\�\��]00��aEwc\�\�&�\�Dџ\�/\�a0 \�J�WA\��\0:�M\�\�9\�ZN3���4H��M%^\�1���bcDe:��J�Z�=\�\�%�%\�\�\"#z$��b�`H��	(�@�%\n�9I6�I2�\�Y�Q�\�j�R\�\�o\�?M�T�\�W\�[3�p����w\n���r���?\\�f>�\���%�B���)�\0(�\0�SB(I�Z�~\�\�K��r�w������t�Dԕ�\�$\rW:D��\0�\�`���\�$\�\�{.-��w��\r@\n\� (*N�v\�jH�\�Ǧ]2gu\�\�\'\�?\��\r��\�reY&��e\��^^\\D\��5�8��I\�`����p��J�����!�p�)^\Z̞��Bj�! \�Y�M�\�j�V\�\�o\�?M�R�\�W\�Z�p�C�YC����YC_aL\�Ô.O\�\�-ZI���&I\�\0\0�p\0s��褡?I6�Z\�=\�\�|�v@/\�-\�5bH\��\�\n��]� ��\0	��0h\�1$�\�MxЮڍ�\�KL�$�:�\"�BhI\�9���T45*\0!P !5	�PBI��\n�\�\�m��qA\�pqpd\�!��\"\\p�F\"F*~����V�m\�#$F\�$	\�W\���[U�\�cQ�\��\�\�Fb@�osf����\r|ę\�=\"M�\�*W�N��\\\���\0��\��\0sh�L\�\ZLT\�\�Of\�s\\۠�~.\�9I\�W\�h\�\�\�\�R\���sE���{t\�X\Z\Z/N:ȍ��\�e�N�E\'��\�����\�]�$5�pzNj\�WU\���8\�\'\�\�PSIt\�\�Y�M�\�j\�V\�\�o\�?M�T�\�W\�[3�p�@+)?�A\��V�VP�\��)��r�\'�p����9Z\�V��\�Z\�\�\�0\�N�_Z�B\�\rq�\"����\�i\��s�gi*\�4U+Vn���\�7>\'	�\0��\�\�]�\0G�\�\�\�͎\r�@\�\�\���ｐ&��!3aj����\0�D���d`gX�^>\�o+[�t>P��\�ʀ\r\�\r\�\�&/�F�K�\0��L�b$\�\�j`�ZZ�n \rZ�W�^3� \�\�h\\m\�\�;\\�\�8�D\n��\0�\�?\�SL��D@BPPRP\�I5 �$�\�A\n>����)�\��p\�#��H\"B\�U�6��Ljh�u`5�\�E�v�[�A��^9���r�\��\�b\��>\�L�^Z�0���˩v\�\r�I�^qsn�X��\n*�kh9��\�V�wG�MJ�\�\�\�Y�\�\�ajt]F��\ZZ؆�ـ\�\�\�F�b�`E��@\�4��\��$�2\�حS���L�ܿ�t&��2�@\n6��Q�\"�M\�\�Hu\�\�@\�\�Ԥ�啳p��\�j\���nA�mZ��-\�Rٜ�\�	d\�\�\r\�w�C@�\0��\�\�O�}��Z��\�<t�0\0a-;X�UTS�\�OW\\J(��\�H�&.�4�Z�}�h��Z�}�j�\��z����\��z����u\�틻�\0[|\�o\�\Z<�>�|\���Z�}�j�\�\nz�����}=^\��SV>ع�-�l���Z�}�h��Z�}�j�\��z����\��z�����}�sF[|\�s\�\n<�>�|\�t�Z�}�j��C�W���|C�W���Տ�.h\�o�.��\�S\�\��\�S\�\�S�c\�q\���ҏ�\�q\���Қ��\�\�m�eϼh�\��\��K\�4yj}����\�q\���җ\�8�{[\�MX�b挶��\�\�yj}���i\n<�>�|\�0�>��k=)�C�W���׏�.�-�l�\ZB�-O�\�4\r#G��\�o��\�\�\�\�\�o�\�\�\�\�g�5c싚2\�\�˟x\�\��\�旼��\��\��T\�\�\nz����\��z�����}�sF[|\�q\�\Z<�>�|\�\�\n<�>�|\�?��8�{[\�@�>��k})�l\\і\�6\\{-O�\�4{Ə-O�\�5O�}=^\�zP}��ǫ\�\�Jj\�\�4e�͗�\�S\�\�H\�\��\�\���ǫ\�\�JG\��z�����}�sF[|\�s\�\n<�>�|\�\�\Z<�.�|\�?��8�{Y\�G��8�{Y\�MX�b挶��\�\�yj}���\�4yj]����\�q\���ҏ�\�q\���Қ��\�\�m�dK@\�$�\� �f܈Z\�U\Z7\�\�T*\n�s\�\0��i�\�Э\����buy�\�\�5�EuS�� ��K,�I�I	hnHB��!P&�(�P�`vZ\�BPP�	�9CrI;��*\ZHB��!\n�$�HBa�\�','John Eco','987654321V','ecofriendlyGas@gmail.com','0711234567','$2b$10$CZ3N8BQ0mTC/6inGARgE3ueCWRt0nkE0DklUkSYwyrUsQOefSE3Di','accepted','2025-01-07 15:45:30',1),(2,'LP_REG12345','GreenFuel Hub','123 Main Street, unawatuna',_binary '�\��\�\0JFIF\0\0\0\0\0\0�\�\0�\0	\r\r\r\r\r\r\r\"( \Z%!=!%5+.2. 3:3,7(-.+\n\n\n\r\r\r+%++-77,,77-0-/+-.++/.7+/+++7+--,77+78-++++-2++--+7+��\0\0\�\0�\"\0�\�\0\0\0\0\0\0\0\0\0\0\0\0\0\0�\�\0?\0	\0\0\0\0!1Q\"2ASq���3Rar�\�#s��Bb���\�$4Cc��\�\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0�\�\0\0\0\0\0\0\0\0\0\0\0\0!1q�\�\0\0\0?\0�>7)�K���7YP{I݅o)F\�\�a�\0u��X{̜Ψ+�I݅o)G��\�V�5\�E\�WP�I݅o)G��\�V�5\�E\�L5��\�V�{I݅o)S^x�^x�\�P�I݅o)G��\�V�5\�E\�L5��\�V�{I݅o)S^x�^x�\�P�I݅o)G��\�V�5\�E\�L5��\�V�{I݅o)S^x�^x�\�P�I݅o)G��\�V�5\�E\�L5��\�V�{I݅o)S^x�^x�\�P�I݅o)G��\�V�5\�E\�L5��\�V�{I݅o)S^x�^x�\�P�I݅o)G��\�V�5\�E\�L5��\�V�{I݅o)S^x�^x�\�P�I݅o)G��\�V�5\�E\�L5��\�V�g�Yx	\"\��I׊������ꢍ�\�\��\�}B��H��v�K���\nj�#ެJ��u�\�\��\�\�	l�\����?nb\�b7.\�`[oMͣYԨN��\��궃\��\�C\�J�ZA �#Lה��\�`f\Z�*v��\�x`uWR`{\�br�\�XI\�\0\'U�\�r�I\�\�\��\�_�^�g�ŀ\�u��u�0�2IVVW�7�\�R�7F�^�Jt`\�1\�i�\0�Z�ft��˻0\�M��&�I4 ��4��I\0��!	�I��\r$ЀI	�b�\�/p>�z�u�U��S�T�\�\�a�\0u��MS�{\�;W���\���5N�\�HTU\�s܁s\\\�\"@�\Zu�ڻ6��\Z��H,3L\�ihi��Gw�\�B���ú�u\�s��\�O���VP��I��\�\�b\0�T>���\�&�\�x#�lMIt�?Ӗe�;v��\�i\rNmW꿫U�\�\�\�u�\"T~\�u�?�u6\�{��o�\�q�.\Zq A�����`\�\�4)n�F�9��\�\��\� \����T�q̛m��\�s�\�6�\\	�1��N��\r�,<F٫I�\Zi����\rsZ\\\�\�\�\�t\�TA\�=JlѫR�i\�L\�.x \�\�n�\�\�84��Y=�A���1#z�\�9�\\Se���-D�\�I��<�C�\�j�M�\�U\�\��\�ҫP���$���6\�\�!6мö�cA�7��\�5j�w�WԌ�9��c\�jmW��	��M�n5\ZYT�\\$ Ne�Y�Pk&�\�\�u2�\�p,k\��2(bs �C�\01����F\�w/\�ӯT\�m\�Tm6R}�\�#��L��� \�IP�\�\�J\�i:\�a}�����l�	�F\��1+AP�I4	M\0���JZ���\��ުz:���a{��;\�J�m^��[\�\�\��\�\�a�\0u��MS�{\��M%P!4�4�I\0�F�!h\���\�uH0d @\�!t�	\�P^y\�\�+D\�	:�̦�\��0\�sf�G\Zw�ѫi,dG�h�\0QhԄ L�\�=q� \�4\0F���ͥF\�)5�9�ƛ\\\Z�S�L�\0�\����ЧegSs*��/}6�H\�^9Ĉ?t\�0\'I\��\�5���KlSptR�c\�CU���U���\���Nb\n�\�S�5�\�m�\�\�؎2��7�An\��x$X\�3�\�gW1�u�k\�6�\�\r�\�)P(\Z��)�\"p��M\0I0$\�z\�i&�BH@!@!4�IG_�U��S�U�Z���\��ުU�j���\0�\�P��\�=\��\�\��\�}B��H��)$�*��Ϊ1�δ\�s\�!\�>`\�\�:$u\�\�\�\�\�`R�,�:���A��\�\'9\n1\�\�q��b\">�k�G-.��\\ �yO�\�3��\�Y1J�`s�\�u\�u�QS8\�\��o۳\Z�6��\�M4�\��\�32w;L�\�+�ܲf\�[p!\�:u��_�\r_�mf��.�)V�\r��6�5\Z\\֟���Uy-������\�\�3v�H�-\�e�;v�t\�b�\�] o\�.�\�`P\�\rF���8M:a�Z)�^�\�Nc<�X��X\�Ui>\�\�Im\�鴲\�5�P��Ji�qy�\���F0�\�i��Y�\\%�\�\�[\�r��<nţX\�s�k\�S����z��8hde1�p��i�\\]T�]����I\�+c�B��\�6r޽\�\�\�7[�^��pG��O\�=w8�q�B8hS\�\\Xܚ\�\r\0�>r~eYY\�\�w�\�\Zw�88Ӹf?\��\�\�aǆ\�(夆D�\�\�?\�\��k*�\�go\'\0�Z\rĵ��n\�≎i\�da�\�\�q�Z,�ל�1���!����\�ч1|\�\\\'>l��} z�M�\r�Fmu\��\�\�פ\�����\�a\�I�R\"uo[r\�N�-c8\�J\���:h]��ƿ4\Z�,\�d;*$��\�h����r�2\�*|1\�\\7��d>\�I�빰4�\�p(-!4 ꎿb�\�^\�}N�S\�\�\�A�����\�X6�K���\nj���\�\�a�\0u��MS�{\�\���HB	��nҬ�\�0\�$�\n�\�\�\�i-�\�\�\�\�\�i���cD\��v�eSI�.�l�Y\�,\�M�[2K\0�\"���m�\�{\�\�\�%\�[\�x�X\�q�tx�\0{�\�F@\���5�M��Ҳ�1�\rs�}\r\�3s@?�MSQ�\��\�\Z\�^q\��\rcH\�e\ng�\0M�\�\Z�5\Z\�,�E43*�\�י�\�\�UK\�\0I�I���Ӫ[{\�\�¾��ksR�4\�z\�Ԥ�\�\�ەִR;�[i\�N�6�\0-�\�\���h\�J���c\�R\�OuL p��\�\��5Fe� si�hk��\�m\�\�\��lF���\�mS�\���il\���\�\�i�\�6a�+��\�m��s�\�F�t����9K$�B\r\�/3�\�U�\�[E\�\�?\n�w��\�>�k\09���z5Gy��1�spOc\����Z�\ZNg%�\�.\�\�5\0\��n!y�\���\�\Zh�&\�uB\r�\�a{�h\�\�9\�3�Du\��\�\n���)\�{�o݊�\�laX���\�\\�޼\��A\�P���_q\r�\�޺�MJ�l8_\�M�\�-=a�NA\�[7\�\�\�G5�\�\�kC\\]\�k\�A$�����Є HM!;���������\�Q\�\�W\�^\�}N�R�W���\���5N�\�P\�^��[\�\�:G�!IB�B4�I\0���P� %� %\n�|Hc\�/\�.�LZְ��\0}\�<F\�m7���w[�mk\�u \�Vyk�t��(Y�m�ʏ\�\�`-.��CZ��y�\0�g	�\�AeG\�\"g�\���(\'�JI��\�\�mV\��-��\'9�9�i��]Q�\�Z I=fI$�IԒI�%v��$ BH\Z�	4!t��_a{��;\�X���������\�X6�K���\nj�#ޡڽ,?\�\�)�t�zB�Bi*��@!$ � i!\ZM.ע\�\�)\�k��h\�)�6�i�����֨�*\�snph��\��Nݼ]T&�֑i�\�r��i���\�Zz��=Fs�$a\�Z\0 L\r4៊[�&Z�x\rvԤ\�[}B�n\�T.�6�� \�E�\�2 �\�Z����s#z�h?^�T{~v��*a�40ĆsdL\��fIˉ:�\�\�\�\Z\0\0\0\0\0�ދ;4ЄRM$ i&�	4$��@!A\�-|U}�\�\�\�Ub��*�\��\�w��`ڽ,?\�\�)�t�z�j���\0�\�P��\�=\�\nHBJ��� i!\ZHMB@��\�\�\\8n�Ƕ$�L����3=V|�\�ĸc)\�Șw6\�ߡ\�.�\Z\�Ay5���ΥJ2ɏ�\�c�O��D\�J��\�N�[\Z�\�g�p�\�܂\�j�&�!�\�ScٖE��9g��$*b_�l��] �\�c\�5�\�\�:�\�s-c&�\�\�\�\�w����\�\�\�l�-z�I����%I@!@\�BNp$	6�1.=C惤!r��\�`$�\Zk�<8H\��\�0AFz�H;���������\�R\�\�W\�^\�}N�R�W���\���5MOz�j���\0�\�P��\�=\�\n\�4\"@�h�	4\"D!\0�i �H\ZI�B�Bh@�� BH!�\\�CX��	\0i�\0�\���\0%�D\�\�Y؊Ԟ���F�\�\�i\0[-�\�\�u\�Ά�im�\�ai�\"�܇8�\0D7��\�0ag�\�H��w1�i\\	�\�@~�\�-\�q��\�(\�u\�\�\�i��\�-�\��\�\�\�c�]�^\r\'{\r�\�/,���u,n� �h\"��\�\�\'h�9�\�ѵ�0\�z�\�\�\��T{\Z\�ķ�Q�e$F��L�I�\�=�\�\�KI.�\�\�\�A� \�\�\�W�<��ť��\�\�Zz\�ϽR���:q5ّZA\�\�5\�\�ܫ�jE�\r.s\�.%\�\�q?\�,Q\�\�W\�^\�}N�V(\��*�\��\�w��`ڽ,?\�\�)�t�z�j���\0�\�P���\�HW`p-:8�\��V{�-A&��p\�\Z~@d\�d�`�Vsv�5\�\�\"\�\��� ���UGm\��p���	&�\�N`�\�\\�F���.�W\�\�D�\��\�k\0\�\�\�̋��hw\�\�oڭ\�q\0���i���]h:vɤbMYi$;z��19�\�e�\\\�65\Z�s\�}\�2a\�gզ�{TKF\��8L܇~��\�@`\�\r�\\b\�Ovyg���\�\�\��f�f ��_�R\��U*ohu��Iqt�\���\�ڃ�,\"u\�6\Zg�G\�\�\�!c��\�\�G4�\�sӆh4��F\�n\\Ø��\�21\�\�\��\�\�\�H=s\Z�#\�I5�6�?�o�nRޙ=�G\\�\�\'m`&)���W6>�>\�4SY\�ڀ�\�$\\\�|\"Id��ZO@�]n�\�\�NF5\�4\Z	�\�Da.\�\�\�i��ͬ$0�\\ޗSdwj�E8\�aa\� \\\�\'+�x�\�ڍ\�\�\Z\�E\�Sq\�\�\�A8\�A�;&�D�d�-�P6�m�\���A9\�_�\�Nwz\r,\�F��]u�-���d\0\�A$\\@�\����A��\�f\�#M\�0\\$�\�r�\�\�oSD�\Zď��\04RY�\�\�5�ݻ�	�h0>�z�\0\��j�\�\�Kt.|j#�C\�4P�Y�A\0\�\�%֌����\�CIt��_a{��;\�X���������\�X6�K���\nj�#ޫ헆�9T~A\�	�\��w\�E�*	k�Ђ	13p�\�`\�\r\�\�?6��fy;O\�\�\��;O\�\�\�9}\��;�egn\�]{w\� NXZ�`�$\�̮Y��s!�cuw\� �\�\�\�\�<�/�\�G~\�\�v�\�\�\�Y�p\�X��\�9��\�\�\�Fa���\r\nm \�\"bAn\�9��dV�/�\�G~\�\�v�\�\�\�Y��\\\�ߗ:A&�3\��� Ǣ[�P5\�Z\�\�L��\�d�u-_C����#�\�\��߄2�5��\�eX\�漎KPd]u��g�<�ҥ��*4�\\��\��\�h%�\�Š	\�Z��h|��#�\�\��߄2�\�\Ze��_MF\�\�y\�ЍZ�T�Nu�-3ɪ�\�\�\�\�?���\�\�v�\�߄r�����Vq\�љ�\��5Q�r\�Fs�\�-\�+��k�.o\'|8�Iђd�Z\\��i��G/�\�#�eg:�39\�.pu\�8Z��\�dOr\�Ѥ\��\"K�\�\�m7dY�\�\��/�\�G~\�\�v�\�\�\�Y��J\��r\�\�4\�j%�pt\Z.���\�c|$G�ަ�k6�x\0�9}\��]�G/�\�#�egSe6�\�;�\r,\0\�jHl2GH����\�\�?W)ۂ8\�r\�o_\rU�_C�>W~\�\�v�\�\�\�P{1�C\\[� �\�o6\�#)\�\rٍ�	.�-\�Z\�43�)�}\��;��_C�>G~ʬ��\�[\�2\�l����\"2&��\�>��--d\�Ԭr���;��_C�>W~ʅ\�8y\�]�\�r��g.�\�T۳�9\�C�a�]�LH9\r8)y}\��]�G/�\�#�eU�N`�t)��2�+�k[�/?6�W��i��\\\�\�\�!ϸk�\"|ʷ�t�\�H�\"ˬ(v�S�W��v@�\0\�\0\�\�a{��;\�E�\�h:�{ĮwM�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|7M�[\��\�|\� \0,���\�','Jane Smith','123456789V','greenfuel@yahoo.com','+94798765432','$2b$10$CtM2SZoMyD03jKIm9XhKx.ZzM6n2PkR3C0n8TwrrBY4KO9p4qUu5G','pending',NULL,NULL),(3,'LP_REG235534','Green Valley Gas','79, lake lane, Hambanthota',_binary '�\��\�\0JFIF\0\0\0\0\0\0�\�\0�\0	( \Z\'!1!%)+...383,7(-.+\n\n\n\r\Z+ %0---/--/---------.------/-2-/7-5---5--------------��\0\0�\"\0�\�\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0�\�\0>\0\0\0\0!1\"AQRa2q��\�3Br���\�#bS����5Dt�\�\0\Z\0\0\0\0\0\0\0\0\0\0\0\0�\�\0#\0\0\0\0\0\0\0\0\0\012!Q�\"Aa�\�\0\0\0?\0�N\"�[ӓ\n��<�r�ڦk�=`t����v\� @;v�tU����\�D\��\�a\�~\�\�\\ˢ�\0+8`�KGX1ؓg�܅u[�\�V�,��6\�U������:�@#aR\r� ���)&6\0G�=\�3U�v\rpJ	�*�˴�S&w&6\�5�\�75zRE�	\�<��\�)�{�\��x\�Q���!\'�=��\'�\�9S\��w����\'��1cs&��}rL)\n,I�\�!\�&@�\�R=Lx�\���szkʡ\n#���y$��1\�)4\�nܢeѱR�e0�L\�`v\��>�<M��Q\�c\�\�/�9�\�\��V�\�\�\�UN������p�\�\�7�����\�\0��ϻxﭟ��|��z��7\�\�Nh6�.�\�M\�\�\�6x��^ͅs}-�[9A�;�+8\�;\�l=Lx�\���\�ǉ�_J�\�mc�\"������AsN#*�\�\�\��q �\���U��1\�o�ҏS&�})\�\�*ŕ�ֶNeX1\�	,Xuv���\0Cf~\����z���\��ֻ\�ǉ�_J=Lx�\���7��^�\�]����p_h�\�ُTv#�=*�]\�+.!M�D(�\���k]\�c\�\�/��<M��T\�kʡJ#9\n\�/$�^A�c�C��M2[IDˣvR�dT\0\�&~Q[S&�}(�1\�o�Ҝ\�mcū`mv��&D\����{h\�o\�\�=�\n7+\�\�ϜV\�\�ǉ�_J=Lx�\���\�mdQ��\�\�\�<	���^�b�P�\�tg.�0x%�\�R\'��3\�[S&�GҏS&�}*sA������\��(lq�C9\0g�\r:�T\�u\�F\�O�Av^\�u��1\�o�ҏS&�GҜ\�mb��V\�\�\�9�ec\�X�\�\�=�O�Vgg���)\'�\��gεަ<M��Q\�c\�\�/�Y�mb\�\�K�\�I�\n��;h�{�OJ�{�ˈR�\� �^\�O��\�j4D��r�\nLuI�Vq~tXg�\"\�\���dL�\r�\�b|\Z)�T)Dg!\�\\/$��!��G\�I��m	��nS dI����\�B�E�x�\�;+�a�&Y\�v2>�eJ\�K\�Ea���9\"��\0Aߕg3\�D.��ܷk�6\�8�\�\���\�Ds�a�W\�Ωm\��\�Iȳ)\�I\��\�[SZ/F��Qqu�6e�ۿ�6�}#	�t@\rrq\0�R�\�N生*�\�-X�\�\�\�\'\�5���l�fW%��\�\'��{{\�e��9B\�{Qz���Q\�u7��F%Y\�9�#m�u�\�5�\�pw\�\�\��@,\�h�w�\�x�8�($����\�G\�S\�]ۓ>4\��QEid(���*\�T�8�;\�-\�)��EC\��kQ^\�\�DbY�)$�\0���.��ٸ�\Z]R�\�\�\�b`�M�*��\0\"\�d\�\�	6�\�s��3�\��+Q\�l\�\�;�:Ocy\��c�\�\�J��?�-$9���g�vB\0$9��\�\�N^\�Zt��Z��%P��\r�Q\�7�\'\�P.�:\�6Z���e���\�q;M7w\�\r\"[7[Smm�g-\n�\"U�a\�l{\�,\�}r\�G\�\�\�e�0�;I=�՞\'e\���\�A0�|\�.�	tW\�-�.\�TK�\0s$\�z\�e�*\Z\�)!A&f0�w�y\n\�\�\�b̂�\�]�PӉa�Ϻ��wL�\�6�\0���H���򠱢�\�8���\�n\� R\�=�\r8�;\'\�R�\n\rPQIA�\�p�\�D��[��gDP�),J��Abgʘ\�\�k�[a�)$�Y�`U@u�\�\�٬���h	94� �\� �.�]T\\��Lya1����(UK��\�YCu��c�r�\�\Z\�蔍B�8�\�t\�XII�vz\�\Z\�{0��\�~\�}5�^l�\r\�r��4���.H\�\"�,�J$�L4�ڮ��Հym?�}oO?\�41$t�\�\�\�[-\�\������NĢ�̨?*v�\���~��\�朳QE@QE>�\�i�f�\�C��*G5$FC\�L�U+ѭ\r�Z�F\�\�J\�I$�����2]��\�(du(\�y2��\�\rT�\r{MhXMVV�cl����ؽ&P\�6��<\�(=<\�%����\��\"���Un��S�\�\�\�{��5�Rٙ%�q\�G/�\�3詿����|\�Kmm�e7�N$��$���{�߹z˾�p�Ŋ%��#(2b\�\0Ș�\"�\Z=�\�K�}\"3m��������{\�@0+e\�]&�Md��\�m`�;h\'�\�G��4��\�\�\�\\��SY��hۀ[�3�P&E?\�\����l\rI�idY�{k�P�n��C`|\�*��\�V�\�.�\"\r� �단o��٧Ձ�Uc\�\�����v�.\rM��ã\�eU�s=XQΎ!��]\�XՋ\�\\E�\�吻�rٍ�� ~�\�b\�F�o72�!d���\�\��\�_�\0B�\�6 5ނ\�\�77l��\�?J���n\"�\�F6Z��џa�\\����GdyS���F\�\�_L/tA\�\�\�fz�� d\0\�E�Ϟ��i[\�jK\\�\�Z\�-�w�\�c�\Z\�qm�\�\�n[���\�Gc��\�\'\�+��m.�-2ܵv\�ŭ\�Oe\�}\�+�\�2\�\�U�|����6�d`\�)v\�@\�E�ط��t�ay<C����$u�����\�&�\��6�n�\�;7gb/X�e�\�$o�\�\�h\�.�\�׺\\\"�\�\�	�\�dr�\����\�j�:�|Բ�Z	]W\�dw 	\�x�+�\'�\09\���/\��1\�͡h�ն�_o\�=�\�{*ۇ��������N�ѭ�db��\�\�\�\�i�\�K\�/}[\�\�o�~�yo\0m瓨 r�h&�\�f{�-��I�\�f\�1)�o�O��XURp\�\�T�\�jT�趒\�+���f.I ,y�Z�(�))h�J\�zGv���\��A5����A�����Z\�aU´̺��\0#�T+Q�ȝ\�:ۚ\����$�k�a\�\0\��\�󭁬�N�	K=Ǯ\�\�b$(��mUZ6-\�8Q�R\�@,\�\�#o*�\�*\r�\0�$r��ک�OD\�V���GL\�&\�\�m�e��9k��f��~\��3��4�+�Sƹ�,\���\�PtM(�4�\�&�����k#�\�Z\�Gҭ�\�:9\�1X-\�Vhc�&z\�\�\�5��a\\\0\�`\�\� �\�?�D���\�YC�^]�@�\0\�#��}\�8���\� �\'l\"C6\�\�L�\0_\��\�ȉ� 3@$��M?o�YEu�\\\��\0\�DA=\�\�\�e�@\��\�gv\�>�\��\"��]\�P\�\0�Ŷ\'��r<�\�>\�T�\'��\�\\�-ȜX\�Ađ\n\'x\�\�:\�I\�\�z㵤\�m(\�J��6J��#���Ӱ\0\�R\0\�\r�]��nv�\��\�=\�]�;o2�!�l	��%Om=�\�v\�\n��aF�p;U��\0�\�\r6�\�)�\�bLN^\�ǿ��\�\�\�\�\�EEr\�Mmd৸�ɛ�\�7���L��R\�c\�\�,\�\�I\�z�8\�@\� �\0 ���\'��{�t\�NL�	̞]�C���\�W?Ѵ\��\�D�*\�y*ە\'�N�߽=O�6em\���xTwbOdr\�,�\�\nv\�\�l\�s$\�Ƃ:4��̐V;o\rHN�*\�@�+b9F#���\�2ͬ��!;G�4�oK�. �\���O�9�RmY\�m/�hͻaI\���(�H&�&��j\�-sC\Z��Q@4Y\�HA,`���q\�A޴u��e�$�=Ġ޶Z\�a_õ\0\�\�\�\��\�X�l�c��oT\Z�\n�+t�2�*\�%?{y�\�\�\�W�	J��\�X�}X\�7\�ES\�ԧCm�\�\\�\��p{${CcV^�[-���2T\�PET\�m�6��\\fd6D�ynݕ�\�D��:_�O\�?jt\�ZO�O¿��\�\�4\�)M\0R���)M%\n(��m�\�\�H\�\�~�����}i\�JƂ;\�\�\��o�\'���\�\�Z�M@�\�[��\�\�K\��?6�\��R\�v��Y�\�Φm�`�	\�#R�J�\�_��\��P2t��?6�\�>�o\��o�I\"�(#�\ZO��o�w\�i\���֝�&����\���֝4�I@�\�(4�P$QK4�R���p\�w\�\n\�y\'~���\�\rg}\"`	\'�2v\�\n&�Z\�aD��ԙ\nי�(\r�I�u�5�\�zW]Z�\\Q��$0˖�g\�[cY^\�%*.*�`m�۪7ک�m\�0�hۅ+�\\X\'��շ�Oe��\0$LH\'z�\�\\-а-�bT�26]\�*\�o�\�\�NZ�\'٧\��9ޓ\�\���ڞ�i\�7#�(���\�\�KHܶ\�\�@L\�cLM\�\n|M�)C]�\�\�\�&�\�w\nRnxS\�o\�@�*��7|)�7�+��\��PJ4���\�|)�7𠛾�\��P:ir��]�\�\�����PH\Zg+��\��W��S\�o\�@�\�\rG�����R�s\n	\rI�{����R��\�O����I4\�W|)�7�,\����\�$�\�Pv-��@���\�h?�\0\�V����\�F\�߀��ke�\�V�tL\�N\��B�R y󭉬gԆ\�*\�\�\�,\�L�ǰ�\�+fk+ل�A\�PA�\0�ϗ��4h?�\�\�UNxÀd\�T�\�r�:�\��Zx\�Տ3���\�.\"\�4\�.��X-pr\�\�e���9kt�f��jz�\�}�~�S\�\�9f)\0���)\r-!4	U\�k��8��/v\�l1!K�f\�	�wU�B\�\\4_6�r:+�$@\��\�\�{�\\?*O\�.ڋ`9m7$\�+�\�6�\�]4�c��q`2�\�\��\�\�[\�*\nz,��:f8.�\�E�5\�vڞ�\0�p\�75g�\�}\�܆D˨\�Y�@c=\�c�*�\�\�9]Q��v\��$��|\��՝5\�\�\�srH,PK\r����\�w\�Z?F͐j\\k�hT\�ږ6� q+�\�\"d\�Pǡ��(\�ܗ[�͊�[\�l\\\��͵`{7\�Ay{�\�\�s��V&LA$,On\��Σ���cm\�\��o�fF@l$�\��uz(��\�\�\�g,�ҭ\���g@`���\�\��\0��\���z騶a\�Sx^r7\�@����\�\Zڸ.�#~\�\�� \�;\�M?\ZG\�^�M�W.cC��\0\0>�]�\�l\��(\�\��\�=\�\�\�>\��\'i#�+�\�kl_r���*�{\�\�G-\��9;6�y�\'��\�\�t\�͙b!\�\�(B�m=*���J<f\�\�;��\�k~\�;�2L{1��\�\"y\�\r_�mub橘�/bp@qvF\'hmS�s{\�T{�\�\\�/q�(��n�y�-#��!����Ab8Ո���\�\��29{Y��\�H\�zG���$)-\�\�\�\0v�\�>�ыN/u�M۩t��\����DApY�nGʹ�\0\�\0|�\�\�N`\"��3�ŀ \0\�\�O\�\�!b8Ɯ\��桐����8h\�\�\�*�=%\���e.�\n\�K\\��\"\'~[\Z���]-\\[�\�L��\�������nGqΗ\�AmP\���\�\"G�\0X�Bw\�zF�dr�\�E)�\�E)h���\�*K\�\��\�A��\�Ɉ{y[-vJ��\�m�ԌTd�\n�V\�I\�H܉������_-}\�)Bd�\�\�\�\�i��f�w\�f\�Z9\0G~=�\�СCiYX\\3�7\�(���!��\�(&Ս\��1\��{\�@AKzF�g(�:\���\�\�s�$\�\�}�~��\�gK�i�G\�OW4嘢�*�(�\rsJE\�%�K@�P���m@�\�$\�C@ܘ�\�<��\�Es\\��b]Cc�H�|^\�D������\�w�SX]$\�ґ\\�J*�-jX�\�SK\0��\�\Z\�PQEEP��ĞS��3\�Z:\�q\�/\�\�\�������%XUp�;��1V[e���s,\�\�\�\��V\�\�;��ub\0�\�F\�O>�󭉬�ϘJY�;t&�\�7 ;��`�ک\�\�-Б�G�賀`�=\\@�\�D�տ\Z@\�,�0@�bc<\�Il���l� \�\0\�\�@�z��ޛr\�\�>\�?��\�gI�i�W����r\�QEEPQE\0(���(�n\����\�Ome�ή\�\�\���\�\� �\�\�l}\�kŵ&qn`ٶ\�\��\01MزDW��o\�S��\�V��ct��=`�,\�c�n\�*z���r�\�!YN@N\�cٹ�\� 򠤞U����\�ѿ˞	�uUK�\0�\�$���^�*�+�/ά�W�A;�\0\�z��\�\�T�.\��&�(���DQEEPQEEP%g}\"�����y\�#n\�\�\�w\�r8󝻧\�5�\�d�\ZB��T�\�\�\�\�\�\\z�\0\�?H���w���1p�β��(F\�y�\0ح���f���\�	=X;\�\"��k�\�Rz\�\�,0eĵ�\�}ǭV~��\�ֱ���瀎UU�B\�B\�k��H�˺�\0�\�\�[-�I\�a��4�+�S�A}\��\�Օ\� oRk�r\�QEEPQEEP\Z(�\���xLl;9n\��\0\�*GKQx��\�Ds\�bz��λ\Z�\�_=U3LK�4��\�\�\�E:���j\��k�\"\�͎ݕ+�\�\�Dď֫\�_a۷֬8N�\� m\�]\Z&n\�]\�\"�YQE\�\�Q@QEQ@RR\�P�\�\�\�\��{\0Q\�\�ZY�7~\����.DnP����\�f5`\�B/��M�el\n̲O?\�{k^k\�\�ծA\�e��rg\�\\���Em�[ق���9o\�\�\��\Zݦ\�.�ʙ̇\�\�\��龜6\�lYf\�\0&9\�b���6c{A\��S�<�\�#s�:\�o�\�\�NW\��ڸY��\07\0\� \0<�\0�F�kk��Y�o<J��+���PX�o���j�\�gϕ\�fJ�ɑ��N\�6\�}�av\�G���V�QIZ8kg\�\�݇��\'D\�o\�?�;E-]\�%�1\�{?\r\Z[�! =�w$Iu|�m\rtG�F��\�\���O\�N\�@\n(�����\�J�˴�F\�X��\�%T\�\�\�>\�:�\���\�\�n*��\0�\�Ȯ���\'u>%\�f�S\�0�=iϭ �A�57݌�\'ϒ�y;\n�\��%v\�\n5LD��\�w��OD\�\�o^f\�嗚2C~G�\�\\�\�nêo\�Ϊ�t\�amZY����$\�ﭾ��D��;O}7ø}�:aiqY-N\�:�^�\��\�k\���\�\�\�p\�O\'#ݏ��]\�]M&�#��~��jk�b�zG��\�\�\�/ڬ蠬}x�\�8�L*o\0���\�~U\'J�\"\�\�\�n�xjU\rtG�F��\�j s�|\�uEIK\\��	&\0I\�\0�oW�KH\�q���$�\�\�o�Х\06�T#\�(\�A\�F�9ɨw-]�\�/��r�\�\�!m\�`�\0S3;�:\�ΐY����\�%�\�ݙ�3˻m���-\�?�,&uJ\�\�o�#}\�UZB\�$�\�&Mk\�ct��J$����*nT\�[#Z\�f��\�\r���`�	1����N�:#\r\�d\neqVv\\@?�^q\�M\"d��TV~\�\�\�.i��n\�¤e8�13<�3\�[-u\�\')z��]Q��\0�p�B�P\'�h\�nQPxV�\�ݺ�KdqN	f�6\�\�\�M\�u���U̀��\�6\�#���nO�\�\�\\��d���U�mZL1\�\Z?\n��9b�b�C0$A�\�wS���g�<�\�\�\r�aT�\�uY�13��*\����(�\�1�љpLd�!߽a\��]\�\�\��>3�<�xx\�{��Y�:�z\�|J/\�.�\�A�\�k�\rx\�XB���A\�\�=�\n�1\�\�\��\0^\��\�t�(<xx\�\��e���Sj\�\�X\n��y\��\�^7�f�\�0VN��\�v���\�!\�\�\�\�׿�yǶ{\��Y�W6�[[V\�F�\�Ih`oq�.\�\�V��� �f*m�L�㶧z74c��g�R<<\�=\�\�\�q�\�M��`\�\�1Ā6\�<\�6��si��\�(\n�	�<�\�7�p\�t74_ׇ�~3\�>\n\��\��ΗXo���U\� �\0J��\�o*\��OAk\�\"�]�\��\�\�W�=��ǿ�~3�(��<���VgW�6q�S�N\�h\"g`Ew�\�t%P[F/�K�bPd9����pǣsG�xx�\�?ǿ�|g�yVfּݶ_SmO�6c�܎\�\�<\�u�\�\�\Z鶰����D\�9#jpǣsF8��/\�{��G�\�\��\�\�ଵ�4\�\�6�ՠ���\"\�*v���` ���\� ��߾dU\��F\��\�\�����g�<�\�qSi�\�ڶpW92�ZW��n\�\�Ӌj:�\�\�UI��;\�\�S�=�O\�\��>3\�\n�\0�\�o�+2u�Z�V,APDb`m��L���/\�\�kH7\r*\n�8�\�~\�p\�t74C��g�|^�\��VgK�7[�*�rH\0`�T\��۶)9OAk\�A�\n�w\�\�wU\��F\�\�\Z���(ذ%���G)[\�u5�g2�\��fq�ܱݷ\�;��S�6q8�t�;��10D\��m\��wBU�b��\�K\��N�[\�-\�R�0�lM\�\�,`\��X���\�vy\�L\�2th��p:\�\�\�|@�$�۰\n�k^n\�g�\�tlX��#�	{\�t�C0װ_\�!{\� b&{\�ڳ�fgYD\��WT�\�\�3��A\�S�ۗ�V\�\�7�8n�\�M\��D�\�;\�l�s^\�:_�\�','Janith ','88926372819V','greenvalley_gas@gmail.com','0917782637','$2b$10$jo2CddlpyZX1dncikLJmMe98KlzN.j4k/4XyXrfrzC96vexA7eOVm','rejected','2025-01-09 15:45:30',2),(4,'LP_REG728993','first','Galle, Sri Lanka. ',_binary '�PNG\r\n\Z\n\0\0\0\rIHDR\0\0\0\0\0�\0\0\0�o��\0\0�PLTE������(3a���\0\0\0�ܜ����\��\���\�\�+#/_@Gm���\0\rP\�\�\�\�\�Ч����\�\�\�\�9Bg���\�\�Đ��\�\�\�\�\�\�\�\�\�ppp���\�\�졡�}}}������NNN!!!���mmm\�\�E���```�\�===111[[[����\�CCC(((�h&`XU\��ਂsM�\�\��)άb\�ؐ��>ռt�\�šZəQY^~\�\�\�ô���m|�������\��\�\�5<h\0M\ZT�\�zϬ2��B	&f\�\�[9,fc]P�\�+9:W\�\�ic8@R��>&X\�3\�\�MնL��Y]am\�ٵ\�ПѲ_��S\�\�tصp\�\�~�b��`˘N��F�t*\�ʮ\�ʇ\�£�z)ð���e��Cʔ@\�ǝot����\0\0:_f�\0P������U\\u�|FxgN��B\�\�3�P�\0\0�IDATx�흉C\�H�\�_!G	�\"ˊdI\�	v\�\�0G6,�6Ll\�t7=Yzz���%mph��&\�\�쟾�$_�\�\�\�&�\�R鬟^��J@\�V�\�w�<>2�b�N\���o�ۯG�F�}(f���ϟ?�\����_��\�?��z��Ѹ*v�0R\�\�~\�\�|�\�x\�q�,\��,PL`�\���Դ�b\�ck��\�\��X�\�\�/^�汵�{_pt\�.*\Z^�\�c\�\nj\��\�{t�*�\��W\��{\�M;͂P\��\�k\���\���z\�~\���b�O\�c-��#\�{��u\�\�O�{�j\�\�\�Z7\�]�(�n��xݗ\�\�nY���\��_\�3��\�?\�\��r\�,�\�G��܃�S\�{l\���yt�����ed\�)\r.\�}c]cA���e\��?a\�\�k��\�ku�\�6�~\�=�͂\�\�4��\�X�S9\�񕱠\n,R\�q��\�ź��aA����ӏ�_�\�\�I\�K1]\�N�`\Z�Ko�E\�ݼ5K��bq\�\�\�E��O\�\�\�\�\�}�%+ފ]0�D��\��=׵\n,�d�o\�\rX\���\�u|���:\�\�pkv\�`qE�=�2�\��\��\�!����Y�j���O��S�7�rs\�I\�\�,��M\r�\��6XP�H-��J.ݻ�\���e\��e\���KuS\�b�\�׃|b%��_^\�g\�l\�\�ү\�5lub;m$pzp<��I\'��G\�\�[\�;10�Ja\�^>H�\�W�W�O�\��\rla?<�\\YF+�ģׯ5\�\�#��\�+3�\�a�mr9u�\�n�����\�\�\�\�Ù��\�\�\�g�\�?�����T*y�Z@�\��$\ZH��Xׅ�aÉD!�\�\'g�{yf�\�8d���\�?��O�E�����\�L��Z)F,��\��K\�j�\�u�Þ\�\�c��G�>B$+33)�̣v\�-\�\�\�$򇉗����h�\�Ul^�B�pp�L\�\��\�\�0�B+RH�<h�sz<�rz�\�a�����M�a���j�(y<��I�q̠\�C���Н\�\Z���=\����\�$�ϒ���0�\�F\"5�@\��WVA\�v^��>\�@2�ĕ\��?(\0�\�5���\��C���Fl)F,\0\���<C�\�ggo[\�;U]pD\0\"��xD�U\�=}\��^�\�\"�<\�~��2\�\'t.\�\�J�\�\Ze\��*/\�w�\�T�\�gWVNgNOO\�kR��D\nS-���\�\��,$\�\�^��\�O͓p|��\��|A\�ǽ!��Q���t\��9\�g��0˳�\\ \�\�\�\�\�ꢚ<[�~zY�1+�\�{=��T*\�.�����ã�\�\�\�\�p\�(L\�+\���\0�/�h\�t���xљ�\�\0sQQ����8)\0��\\F�M��hNХ�\�J,\�8\Z��X\�\\�\�LQ��9�� \�B�&:��0<�wC�\�\�&\��գ�\�n��\\#���\r\�A�\'\�ʑ\nZ� X]�\�\�щS؂�h\�\'c�d­�B\�\�)�/��o\�]	�\�r�!�g@�BJ�AY�r\�5-\�]�t\'3���r�\��;h\�.�\�K	46�M\�\�\�r�_�\�&\�NP�Wg��\��*\�#�;�C�/\�\�ש_\���T[�\��̂k��8x{J��E0�^�I\�v�?>H�\'�۱�u=�k1�m�\�=\�5�����gt\�%\�F\�Y@�Ŕ�E�\n�r˩H�\�\�Y����戮�aρ��Ul\�嗫\���\�洴DO\��\�gS(\�ֳ�z�	��G|�\�TN��Q񙞂>ј�UF�Ԉ��\����)E�\�<f\�+4\���׶\�~zւ�x��|�zA\�gΫ4\r�	\�XL�\�\n\�*�gn�c\�Yp X���e�WϖV�0\rO$\�\�%׽\�m�\�dܿVz��>\�* \�\n�Z�F,��6�\�Kd���~���ƂTV~U�Ϟ^\�\�D��U�\�0�\�^�}W����ٟaѺ̊{���v�Ƒq��)Pa�\Z5:/�Ū0�\�\�&\Z\���Q��O&WS)̑�߮\�X\0�ֶ�>\�\�q<���\�W�\�\�\�gh�\�ʎu�G�\�\�T���#\�\ZN�Cre��C\"���*x�*�<\�xyt�L\�D2y�7��\�V�Փo\�o\�8P|a)\�\��oβ\"x\�U\�5\�>�I+�=�y\r\�+��?P���\Z�\�\\P�\'}7\�\�}�Q)�rxł�\Z�5H©�cf\n��4����8:\�_�\�\�\��z�\�ͣ�,�H�*OX\n�\�㳳�S�S\�\�X\'](\��?\�ڛ\�\�S!�\�\�9jAdjr|v��Þ\��<\�\�\�f\�\�0X��=�QȢ+�C[\nϹ랜P\Z\�\�0�Z��\�\�\�F���\�IT�\�\�\��p7t�[��Y1\�\'�\��\�\�\�� 	���T��,(�\�\��ݰ蹘%\�1C\Zq\��\�\�I,~\�F꫌\�q�e�`\�>D\0i��q`���\�Ӏ�\�=�L���&\0X��{�A\��o\�\�H�z�,0\�:�\���u��=���*����X\0p;\r��{{Z�\�\���a�����\�;c`i�\�\�loۈ���A\�͠��.�V\�\�AQ�F)\�\����\�A���\��\�y��\�\�1-(�4e;��Oo\�#��^\�bO\�\�{\�b:��|�\�v��6볊#�,�4$̡�k\�\�\�\�>Y4�#b\Znc�-�D|\n\���#��\�]\�z�S�^߽l�t����\�L�^b����4\�8GB�\�˘�S%\�x<\�p؜\n�9��\��\�\��\�~�`����6\�{\�VE\�0qO\��)��Fϖ�Bs��\�,�~\�X\�\�KX��i}\Z{�t,�N\�v;,nRoX��,��ϼNCH\�&D��\�V\�*ۅ{\�fV�纟Ѯ[D��~\�\�-�=QQ�\��{\�\�C��O�����1\���N�I\�_`+�\�\"\�\�t��RU�������6\�\�G#�٧^�\0!db�h` RT$�$�߲xP5	\�\�\�T�Yh\�$��\�c\"]\�A�$�\�׌zŢ5`QӀEM5\rX\�4`QS�,�62`1`\�L�B�q��\�d\��mc\��;\�M�=\�M`\��,ס��{�\�{\�z��L�:^��6�~�2J\�C\�%\�ݝ\���\n\�_|}���^����`p���{t�e\�4���0\�g�.�3\�]�=i᎘O�\'md}c�|�\�z\Z�x:�_��\���F \�X_wB+�Wf��\�a�\�\�n�\�ݩt\���?NNp�\�5��i\�6ӛ՛6���w\��9\�\� \�9��9�	��s6}?Oc\�8d	��\0���\r�9<\�\�t�]�C\"\�\�=.�����.4�\�\�V�\����[�\��$�گ\�\�\�\�I|��c̢ɤONN���\�8YG�8I\�\�\r�\�r�8��8m\��<g\�2Ͱ����8ò\�%�\�e+�\�	�1�\Zaq\0\�It?\0KY,�%p\0�0�\�\�\�4�&�&w`�z�_x��|%\��P\r\�Q�\�\�T\�k9WS�1POX�S�T��^@�W\�\�to�jQ]rR���\�=\�;95�\�5����\�\r�e3���\��f�qq�k�z�\�\�\�oT\�Y�=kkŬfp�$�-����*Y\�\�G˷O�}\�.\�Vͥ,ޯ�eoW|�����\r� 3Z���H>w��G�\�ȫWg\'\����w�R�!\�`\�\�\�\r�\\\�mP\�O��\�\r726�����_\����\�8T=�\�\�\Z.26ViE��qݥ�\�m,�\�,J\�\'�\�\�5Z�ҨR\�\�Ұ&\�\�V�B#��\�x\�!��W,2�\�)\"\ZƐF�\�e\�}U�wȋ5�Y\���g��Vɣ1&f�.��9\��$�\�\�\�at�7��Hm���e1���`�]R�!d�\�P6S�\�\�����L�\�|G?\�Rߪ�d�2E\�^�`�R�\�=\�v�kP�ѥ�x���/S�\\�\�ku\�9�8G�k�p�{\�ël\�_fr �)\Z��X\�Ƚb\�\���\�\��\��8\n\�\�! [\nS*��K�~��5�B��J���M�D�c` ?u\�6KFÍ5�\�ۅ{�\�\�c�hD`\�\n�e�e�fJ� ��C�%b\�{�2czR\"�5\��%�Ű<��,�uW�\�\r�]g�\�4z�\�(��r#y�]��Yl���5\�TL5���\�x���[\�&���B��9\�lB�`LzUrs�mFݾnV� �\�f�\�?T\ZSk\�Z�{dS���P\�*j��p�u7\�\�L�\�,.1x~+\�Z	D\�x�Ɠ!\��sX��]�\�,v\�#�^�yS\�$�R�\0�yb\�2Ec3�]\�\�ǉ.r�����0d�d3���6�S\�!\�\�~3���[Sr��W�Uo�9Ȏ\�r%L��Xy�!s�\�#\\)sY,5c@)���Y\�\r�\��L+)	.�+*�\�0\��DA\�p�f��h\�ܭ����`�\�u\���-G�1\� �d2ﳪ&f�E��Ď��,*W\�\�\�;\�=�L�>Ϊ�y�r\�zS�\\G\�\��\�n#��U�\�\'\�x\��7,�\�R\�Jw�\�\�\',F\�\�u%:��`��o�&uD��S\�>x\�t�h\�	w��`\�\�4o>O��~��7�F\�s\�X��ǹ	/\ZP9�-�s0\��x�N�\�\��;\�\"Fb�736�_� \�QIv@�\���>D���By6��􇀮�e�f\�<�\rw^I\�Tp\'rD\�R\��������+	pp>�\�\�\�+7\��O����\�iŶ��%G��,\�ZX\�mS$\�|8\�\�C��L�.��P̔-3\�LGmK�ٶ$Ee\�Q[�\�<��\�T���\Z��t,5b�\��A\r913&��m\�bjT��1=\�#\"Xz0*C���BQ0%]�Ĩ��I!\�һ\�\"!^�y��J��%(R \�˶*\�!��f����?	ɶ̅A2M-H,S\�\n\�c\�2XF(�m\�uӔD��&a\�\���c���-�\�`\�\�4Sգ��	8b�c�e\�\�v\�ˑIL]3\�N\�\�K(�f!2ǋb�Y\�!^��\n\Z��B=U\�E\�dQ�UMU�TBE\�T\���\r���QN�\�~x\�\���j�,�*ʪd\�~8\\H&�i\"\Z\��Wq���N��\r��m[�\��\�\�s��8tS\n/6|	ٝ��\�\�?<K>a�\�?1\���в\����~V�Y\�\�\�G\'�U�\�E�x�4|!\�m\�cQ�pئ	G_�#r\nG��a\�wr\n-\�x���8�`~\�\����\nX\�ȟ\�Ls��\�RC\�fa��\���e�\�\�KZ�d��%\�t�,\���\�4��aɱl\�\�m�	\�t$,w\�\���K\�ݳZ��j\�F��\�F\"!\";A>�@,�y�d\�&`x�1�Fa\�\�C:FD0-\�	�k+7�y��\�7\�]�P�Yh ��Nшb��\�\�\r�Ĕ\�Qhڈ�C\�pf\"*n�r�{.\�u3\����eQ�@\��&z}\�j�6:�rc}�\�x�\�pX�nf�B\�Ǉ_;��\�?h|��ϋ��\�h�ZY�P���\�H�b�\��\�\�wF�@\�q,1\�W\�btt{��\�\�\�T��\���\�\�\�\�\�\�\�\�\�\��\�\�S`�VT����ᗝ\n����T^�:\�:�o,�\�\�\��ǀ��\�?��\�\��0�\��O\�E��lXTY\��,,\Z��_���5\rX\�4`QӀEM�a�m\�6��}i\�W\�\�-t|�jp#�\�tW,H\�g��\�<ɽ��w�@��e(\���\�\�i?����ز\�W�5\�\��;`�H~=��l#�K�~-\�\�lY�\�_�e)�\�\����\�AŶ\�hP��j\�\�9��mSy[�\�f۟�\�x,l���:\�\�\�B\�4y\" �V\�\�>���EB\���lbG��\0�\�\�%ڢlBX�c� ���t��\��$\�\�\ZK~\� QU�*�hr��K�l��t�]B\�K�\�JV��`*�_%dǯ�A^\�e]\�p\�J�k��\�\Z�\�j\Z��i�����ygM5\rX\�4`QӀEM5\rX\�4`QSk,��\Z��|��.\�\np\�\��\�%_�,jj\�_tN���M\��~�\���\�o��c\�-qL�\���\Z�\�v�^ip/p\�=jhk9\�\�\�\n��ѭ1��=�n�pyl���>�\�-��\�ǯD���\�~R�X�v\�q��\�*\�T�d�\�qt���[\�S\�\�u�\�\�b���\�\�t�4\�\�;=aAd\�\�\�;\�\�#\�\�V\�\�\�;C4Ƣ\�蟦\�K��Ƈl\�8��څdk(Cؾh+=g�\�\�z��m�7\�P{���z�c,\�k�\�^\���\nh\0\0\0\0IEND�B`�','Robert Roy','19782360024V','first@gmail.com','07772655398','$2b$10$DPXFwJXkcaj8/O66LPyWbOTj2GqCu51cS.F.oWJo6MFXdwwIaPAA6','accepted','2025-01-09 09:25:30',1);
/*!40000 ALTER TABLE `outlet_manager` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outlet_order`
--

DROP TABLE IF EXISTS `outlet_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outlet_order` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `outlet_id` int NOT NULL,
  `order_date` datetime NOT NULL,
  `expected_delivery_date` date NOT NULL,
  `status` enum('pending','scheduled','delivered','cancelled') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`order_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  CONSTRAINT `fk_order_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outlet_order`
--

LOCK TABLES `outlet_order` WRITE;
/*!40000 ALTER TABLE `outlet_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `outlet_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outlet_stock`
--

DROP TABLE IF EXISTS `outlet_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outlet_stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `outlet_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  `last_updated` datetime NOT NULL,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `outlet_cylinder_UNIQUE` (`outlet_id`,`cylinder_type_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  CONSTRAINT `fk_stock_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`),
  CONSTRAINT `fk_stock_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outlet_stock`
--

LOCK TABLES `outlet_stock` WRITE;
/*!40000 ALTER TABLE `outlet_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `outlet_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_reallocation`
--

DROP TABLE IF EXISTS `request_reallocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_new_request` FOREIGN KEY (`new_request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_original_request` FOREIGN KEY (`original_request_id`) REFERENCES `gas_request` (`request_id`),
  CONSTRAINT `fk_reallocated_by` FOREIGN KEY (`reallocated_by`) REFERENCES `outlet_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_reallocation`
--

LOCK TABLES `request_reallocation` WRITE;
/*!40000 ALTER TABLE `request_reallocation` DISABLE KEYS */;
/*!40000 ALTER TABLE `request_reallocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transaction`
--

DROP TABLE IF EXISTS `stock_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `outlet_id` int NOT NULL,
  `cylinder_type_id` int NOT NULL,
  `transaction_type` enum('in','out') NOT NULL,
  `quantity` int NOT NULL,
  `transaction_date` datetime NOT NULL,
  `reference_request_id` int DEFAULT NULL,
  `reference_order_id` int DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `outlet_id_idx` (`outlet_id`),
  KEY `cylinder_type_id_idx` (`cylinder_type_id`),
  KEY `reference_request_id_idx` (`reference_request_id`),
  CONSTRAINT `fk_transaction_cylinder` FOREIGN KEY (`cylinder_type_id`) REFERENCES `cylinder_types` (`type_id`),
  CONSTRAINT `fk_transaction_outlet` FOREIGN KEY (`outlet_id`) REFERENCES `outlet` (`outlet_id`),
  CONSTRAINT `fk_transaction_request` FOREIGN KEY (`reference_request_id`) REFERENCES `gas_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transaction`
--

LOCK TABLES `stock_transaction` WRITE;
/*!40000 ALTER TABLE `stock_transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token`
--

DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `token_no` varchar(15) NOT NULL,
  `generated_by` int NOT NULL,
  `generated_date` datetime NOT NULL,
  `expiry_date` date NOT NULL,
  `status` enum('valid','used','expired','reallocated') NOT NULL DEFAULT 'valid',
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token_no_UNIQUE` (`token_no`),
  KEY `request_id_idx` (`request_id`),
  KEY `generated_by_idx` (`generated_by`),
  CONSTRAINT `fk_token_manager` FOREIGN KEY (`generated_by`) REFERENCES `outlet_manager` (`manager_id`),
  CONSTRAINT `fk_token_request` FOREIGN KEY (`request_id`) REFERENCES `gas_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token`
--

LOCK TABLES `token` WRITE;
/*!40000 ALTER TABLE `token` DISABLE KEYS */;
/*!40000 ALTER TABLE `token` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-13  6:48:06
