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
INSERT INTO `outlet_manager` VALUES (1,'LP_REG56789','EcoFriendly Gas Hub','123 Matara Road, Galle, Sri Lanka',_binary 'ÿ\Øÿ\à\0JFIF\0\0\0\0\0\0ÿ\Û\0„\0	( %!1!%)+...383-7(-.+\n\n\n\r.+770-.7++2-7-707+-6+777----+2+77+++--++--++++++.++ÿÀ\0\0\Å\0\"\0ÿ\Ä\0\0\0\0\0\0\0\0\0\0\0\0\0\0ÿ\Ä\0E\0\r\0\0\0\0\0!1AQ\"5RSaq‘’£\Ñ\Ò2³\ÃBğ#Cb¡±Á$34r\á%Ec‚¢ÿ\Ä\0\0\0\0\0\0\0\0\0\0\0\0\0ÿ\Ä\0\'\0\0\0\0\0\0\0\0\0‘Rr1cBCb!Q¡ÿ\Ú\0\0\0?\0úøI)¥t«ñN¡Eû.¶\Ä8¸t¯<\\HÃˆ™½^¸83‹31#¯õ¬AYKºOhğ|“»¤ö\ÉywŠ¬ö\í=´İ«!\"V\î“\Ú<$\é=£ÁN\ãñU\Ï\ÛMÚ´¥en\é=£ÁòJ\æ“\Ú<$\î?X\ìı´İ«IecI\í’wt\Ñ\àù+\Ü~*²v~\Ú.\Õ!e.\é=£ÁòE\İ\'´x>JwŠ¬½Ÿ¶›µI¬¥\İ\'´x>H»¤ö\É;\ÅV;Om7j\á%–»¤ö\É+ºOhğ|“¸üUc´ö\Óv­6•“»¤ö\É0\İ\'´x>I\Ü~*±\Ú{i»T…•»¤ö\É+ºOhğ|“¸üUc´ö\Óv­+wI\í’.\é=£ÁN\ãñU\Ó\ÛMÚ²”¬­\İ\'´x>H»¤ö\É;\ÅV;Om7jJY[šOhğS»¤ö\É;\ÅV;?m7j¡,­\İ\'´x(¹¤ö\É;\ÅV;?m7j¡,¨n“\Ú<$®\é=£ÁòN\ãñU\Ó\ÛMÚ°-¡´¤Ú·\Z\ï˜[\Î\ìŒZ9\ÂÔ¯\\,XÄ±:<q°g\n¨¦f\'¬uş¬£¸S«\ì­Z\Ê\êû\Ë1ğ\å\\Ÿ\Û\ÂZ¤\ÂI‚´²ª} ¾óB“*¾˜«Tµ\Îa÷E*¯†¸\ì–F*ªÙ¡¨²­6^´›\æ¿X8I§\ç\ÇúRt\Ój•¦™ªzRÕ„š¨lVg\Ù\íl¤+Ö©N¥\ZÎ¹UÂ¥\×S}\0^E\ìª;J¾Vc£˜šPš€”!re\Ò\nr’€BJ4€M% \ĞE	¢ŠRB J@\n†¹s“P2” \ÊYxMı\éµj\ÖV\Ë\Âo\è?M«RV|·ŠùKfs\Î2²§…z¾\ÂÕ¬›¸S«\ì¦c\á\Ê§\Ù\ÂZ¢‚º^´°L¸™æ†‡\ê õ­,hZc\n–W…¢	\Ô/P¬\Æ\ÏKœ\Ñ\ÒBªÒ†³\ë“LÓ‚æ¶•\à/^³8Ôª¿$\Ó\Ã+²¯m»•V>›Ì´ƒz	]3x8dZDƒ¨…Ch\ÃM\nu\ËK\Í:æ¡¦\Ğ].y¨ \ì	;œ\É\ä½(ÿ\0®e<\Ö-–w³øZ\î\èk\ßf¹;&ë»§b¹*£CYi\Ğ¹\á\Õt¹Á¤’\Æ7¬˜\\IÄ•`mŒ\Ö“¶³i¬.jÿ\0Q\â\à¡œ.TŠ…PB…¥´“,\Ô\ÍW‡-kZ\Ø.{\Ş\à\Æ1 $¸‰Y b»üm\Ğ\ãTn`‰qi» \Ò33„@3\ÔLT¸Bˆt­\rÑ´·j{£Àsx^s\\Cš5‚ó#ŠW…“NR«¸šfókn—!¸SL8‡cP<ğ ²B§\Ñ~\Ğ2¾\æZ\Ç\Õ52\ãL^m0	pm\ë\Ñ2\"$Dœ ™^ù³\Ü57zw‚\ëÀ‰¹ºGsş\Ür\Å\à•Ş´wCKt…!X\ì‰ <»(7]\İ+\Ş\ÏhmAy‰A ƒ\ÎŠô%\0¡\0„!!š(M’)¡Te,\Ü&şƒôÚµN++f\á7ô¦ÕªYò\Ş+\å-y\Ï8|!\ÒÉ»…:¾\Ê\Õ\Ê\Ê;…:¾Ê™‡(\\§\Ù\ÂZ\Å_ncZ\à\í\à˜\à\âK„\İjÿ\0•<!i†9Q5\ÍfŒŒ*L4sõ\Ì\á\×\Ó^Ø»4 „U½#-±3¯5tS]jNŠz±‘\Ü\äb\İL9¿4FCD/J÷4\È “¤–’ v\ÅhJjj:9°d\Â+•“‚a!i}\ËM#J¡pšæ¹¤1\ìp{\ÒA\Ä´¼´–ˆ\ØR£\ÉQ®œ‡0\ÈKKH8‚?1\æ‹\"¼«\ÚÈ¾\àÙ˜“Oò“Ô‚-—E2c]¥×\Zt.\ïC)9\îl\0¨\îhŒaö~/Ã†¾¡m\Ós\á‘Pøh˜ƒ¶Uµñ·õ’	ıgı\Çj¢¢\Ç\ìı:b\Î\ê@U\r¼Y¾d:ü4e8Du¯{,\ÃdeŒ×­¹³şU\ãL1\Ô\ÛI\Çs‚\Ğ\Ò1\"öõ¸«\×T1­‹\ÌZt>øºbˆ$\à#jŠ¬«\ì\İ\'^uBeG‰h½H_ƒƒd;~\ìDrSôe„Q¦)‚]¸†4¸\ës…6µ³\Ğ‹Ã¬vŒüb\ê5\ÉL I&ˆD9I@Ò”ĞŠI!5Q”³p›ú\ÓjÕ¬¥Ÿ„\ß\Ğ~›V­f\Ëx¯”¶g<\áñ‚…•<(:>\ÊÕ¬¯ı\Ô~¿r™‡(2o	jš†2(\é@\ÂH((B%4	P/M•µ<H\ÇY3\\Ã—ğ¹Ã­zÊƒ¦-n¡H\ÖkC›OQ¿˜\Ó\0ß¸d\0\à7\Ø\çtŒ&@1¢(†–†\àCAq\r7›¯j\è\èºRIi\Ä];\çess\Îs»„ó\íUôô\éikkS\Åâœ°ˆ5)S-‚f»4^ü\×I†\ËA\éútšš´\Ù\'¸\í§|c-aA-º\ZŒŞ¹Œ\ÌÉ™\Ç\Ìş€@\Ñ®Ü»-N­ºDj\ÖI\'UE_jw1Wt§.¢Ñº1²\\×†\Ô}MX¶\ëX\æ˜*4’\ÂC½¥\r¾]EÁŒ.—^i0Úµh\Èh\Ú\ê.\Ãa\ZğAkb\Ñô\én`‹\Ñ2I\Êc3\ÎT¥Ei\rİ®u\Ç0µ\×Hp#­x\"ğ!\ãP\ÆsLĞŠI4\ÂeD	.’@!\0&!2” \ÊÙ¸Mı\éµj\ÖR\ÍÂ\è?M«V³\å¼W\Ê[3pøÁ²§…GG\ØZ¥•<+\ÕöS1ğ\åO\ì\á-QL¤š\Ğ\È\nMUÛ¤;²\í\çd›¥òò\ên\á<ÁŠ{\é\Úo}+»è™œ\Í\ßË¨D\ã9`¹4­\\z`u“k»œN¬ñ\Ã Eš!T\Z‘û\Æ\à@I–\ï¾p@“¬Ÿ\á\Âbug>iÔ§\r$IÈ†–ş\\nz¦\0Y\ÂPe¤À5i~Rè‘‘$\İ7r†\×s\Õ1Y¯{V™¦\çN-`Ë†#ghY$ö‚ DD‚5‚U7Zpš´L˜\Âq\Ädn\ã‘\Õ\Ù›ÿ\0\0&­ˆ\Ô`\Èf³Ï¯­TO}›‹‹©°—q-i.h\È8\Æ#˜®…€†´4\àZ\0\0ˆˆ#^*\ÆÔªoƒ^p\Ş\æ\×\È7?,\ÒN5Kn\î\ì863\Úq-&oş\ÚIV5¬”\ßó\Óc²;\æµØ€@8s\ÚWBƒx­\ì\Éwõ$ô’«Z°nú­ ğd\ÆP`4|¹˜w\\t.\Ø+J0ƒ\Ë$A3c€9(\'Y\è2˜º\Æ5\Ç€Ñx¢¨6KFö\í``6A$\Ë\Ã&n\ä\\\ë\Ñ‘¹b\ê\ÚHkè½§ò’8„OL•E\Ô!Uµ–­u)jÃš7Ñ½\ì\æ\í~\Ø6Y—¦ñ À\Ü\Ãr\ÊD‘13ª[&ª¨Y«]y5¡\Îs\\Á7ƒ\Z.›®\ãdZrfA8vÁU\Ì,\İYx\Ì9²H\r7NzÁ\Îg\Zğ$•U;¦d\Ö’\\1\äá€ºğ#ÿ\0qÌbµ@¬½»&].¹ \Z¤nş[¸L¨.Br«\r^ğ; »&[%\Ù\Ôa&ñş\0ñv0.À\ÆV\rØƒ¤‚!V\ÏÂ\è?M«T²¶nAúmZ ³\å¼W\Ê[3pøÀYCÂ_ekLğ§W\ÙL\ÇÃ”?³„µAt‘B\Ğ\Æd ¤‘@Ğ€‚«FÒ¨I{d»<]Zşö.=\ÉC‰;Û¹»\å‚İ»	VAYW@\Ğ#–˜€CŒÍŠ\İL»‰\0$d\Í\Ì`0\Ü0LIsô%ù9\âó€Ìº\0$\à0÷-\ë÷\r\é½7óm\"cY\íV(T@©¡\è¹\ÅÅ†I$\ïœ$’ÓŒ¬ot!ú.›° Æ±\'|%\îµ\àç¸ˆÈ•=$E}-	A¹0\æó<\âß—3ü4\r\Ã 7\Ï\È\Ì\ë\ç*\Ä&£¤\Z\Z‹\ÖAA—b\'±pt\Z\r<E\ç”\0&8\r|ûJ²) ¯n„ ?w‰3ó;>Ü¹²Nˆ¢\Ò\\‡¾v7Àœu\İŠyH €ıH\É-\Ä\æK84·9\Ê[@9€Wµ+6Z\Ü[0q\ÂKõ{»T”\åT)ABR…Ò ”$…R\Í\Âo\è?M«W)f\á7ô¦Õ«Yòş+\å-™\Ï8| ,¡\áQúı\ÊÕ¬¡\áAúı\Êf> \Éıœ%«BI…¥Œ&R”(‘*†KR\rr\á\è]T3DTl]´8\0>P\ÓvCCf/ds#i&r‰ôqyq5I¥­ƒIe\Û\Ù\ç‰?©]\ÚmUPNór7Ë¢$\áA\ÂN\Êø7HVŸô\Î\Ç`:šu\È\ìç‚Š–\Z¢Ä¸NB\îX“„8tt´R°U\Ú\\\ìAÅ¼ø›(şÚ¤Z\İX\ÅF\ç-–I€q¼F¬šp&5möˆu\Û<.—\0F\0d\'±TX[hnŒºXe¤8f\\Ûˆ6Ê‰d°=¶.f;\Ó#iŒÌ’H3‡Ë‘¼aT\ÒdE\Ç¯V3¨	\ÃlcœgĞ¶V!\ÑFKbIß´\Í\èÀ]00¢aEwc\Ñ\æ™&ü\ŞDÑŸ\Ê/\Ìa0 \ÄJWA\Èÿ\0:£M\Ò\Ü9\ØZN3´¸4H€M%^\é‹1½’bcDe:§­J²Zª=\Ğ\ê%‚%\Ä\â\"#z$œõb`H¦„	(„@„%\n9I6 I2 \ÊY¸Qı\éµj–R\Í\Âo\è?M«T³\å¼W\Ê[3pøÁ•”w\n²µr²‡…?\\Šf> \Éıœ%«B´±‘)¡\0(š\0¤SB(I¡Zô~\è\âKˆùrw·µƒüôt€DÔ•­\Ñ$\rW:DÀò¹¦\0ˆ\é`¸­¡\É$\î\Ï{.-“¶w³œ\r@\n\Ø (*N†v\âjHÀ\çÇ¦]2gu\ï\İ\'\Û?\Èµ\r‚ñ¬\îreY&¨ƒe\Ñ÷^^\\D\ê»ó58¦I\È`¦‚ƒ‚p„J¢„‚ˆ!’p€)^\ZÌ¡ıBj€! \ÊYøMı\éµj–V\Í\Âo\è?M«R³\å¼W\ÊZó¾pøC¨YCÂƒõû•«YCÂ_aL\ÇÃ”.O\ì\á-ZI”¥Œ&I\ï\0\0’p\0s’ è¤¡?I6óZ\Æ=\å\Ä| v@/\ß-\Ş5bH\Ùö\Ö\n¤]¿ › \0	¼ò0h\ç1$„\èMxĞ®Ú¾\ÇKLÁ$ó:õ\"½BhI\Å9 ”¡T45*\0!P !5	”PBI¤€\nŠ\×\ím–qA\Îpqpd\İ!€\"\\pŒF\"F*~›÷ş´V‰m\á#$F\Ò$	\ÂW\Çô½[Uª\ØcQµ\É´\â\éFb@–osf¸®©\r|Ä™\Õ=\"M¥\í*W©N“š\\\Âöÿ\0µ¬\Çÿ\0sh©L\Ñ\ZLT\Ş\îOf\Ós\\Û ƒ~.\Î9I\ÄW\Íh\Û\ê\Ø\ßR\åúsE¦£{t\ËX\Z\Z/N:È“ô\íe§NƒE\'‡±\Òö–ü\â]›$5‚pzNj\ÓWU\ÆÁŒ8\ë\'\Â\ÆPSIt\Ê\ÊY¸Mı\éµj\ÖV\Í\Âo\è?M«T³\å¼W\Ê[3pø@+)?õA\ÑöV®VPğ \èû)˜ørƒ\'öp–¬ ¡9Z\ŞV‡\ÒZ\Û\Î\Ô0\ÒN¥_ZB\Ù\rq«\"ö´µ˜\âi\Ó€sŒgi*\Ñ4U+Vn…®ª\ç¿7>\'	º\0\Å\Ğ]Œ\0G¯\á\Ò\ÍÍ\rõ@\à\Ò\ê®ü¥ï½&ô‰!3aj°¶¡—\0D‹®¼d`gXò^>\éo+[§t>P‚¨\èÊ€\r\Ò\r\â\ã&/¸F·K·\0††L®b$\Ù\Ùj`€ZZôn \rZ›W§^3ª \Û\Ùh\\m\Ğ\ç;\\¸\Ş8ó¯D\n›‰\0‘\Ç?\êSL¥€D@BPPRP\ÓI5  $\ÊA\n>¢÷²)¾\ã¤‚p\ê#§¨H\"B\íU÷6—Ljh’u`5¬\ÍE›v«[üAªö^9±„“r”\ì±\Ôb\Éú>\ÔL›^Z…0ü™Ë©v\Û\rªIü^qsn³X™\n*¶kh9µ\îV¨wG‚MJ„\Î\è\é¼Y¿\è\âajt]Fº‹\ZZØ†µÙ€\İ\è\ÉF©b´`E¤‡@\Ş4´Á\Ì€$—2\àØ­Sş¬šLÜ¿’t&¹Ÿ2¶@\n6£Q\"¥M\Ñ\ÒHu\Ğ\Ü@\ç\ØÔ¤ªå•³p£ú\Ój\Õ²–nAúmZµ›-\â¾RÙœó‡\Æ	d\ê\Õ\r\ÒwœC@’\0±Œ\Ê\ÖO¤}œ¥Z¡¨\ç<t¶0\0a-;XôUTS§\ÌOW\\J(šµ\ÏHª&.4ZŸ}¾h÷ZŸ}¾j£\àúz½¬ô£\àúz½­ô®u\ãí‹»ÿ\0[|\Ùo\ï\Z<µ>û|\Ó÷ZŸ}¾j›\á\nz½¬ô§ğ}=^\ÖúSV>Ø¹£-¾l¹÷ZŸ}¾h÷ZŸ}¾j›\àúz½­ô£\àúz½­ô¦¬}±sF[|\Ùs\ï\n<µ>û|\Ğt…ZŸ}¾j˜ûCWµ¾”|CWµ¾”Õ¶.h\Ëo›.‘£\ËS\ï·\Íñ£\ËS\ï·\ÍSŸc\èq\êö³Òƒ\èq\êö³Òšñö\Å\ÍmóeÏ¼hò\Ôû\íóK\Ş4yj}öùªƒ\èq\êö·Ò—\Â8õ{[\éMXûbæŒ¶ù²\ç\Şyj}öù i\n<µ>û|\Õ0ö>‡¯k=)üCWµ”×².-¾l¸\ZB-O¾\ß4\r#G–§\ßoš§\Ç\Ğ\ã\Õ\ío¥\Ğ\ã\Õ\íg¥5cì‹š2\Û\æËŸx\Ñ\å©÷\Ûæ—¼¨ò\Ôû\íóT\ç\Ù\nz½¬ô£\àúz½¬ô¦¬}±sF[|\Ùq\ï\Z<µ>û|\Ñ\ï\n<µ>û|\Õ?Áô8õ{[\é@ö>‡¯k})«l\\Ñ–\ß6\\{Â-O¾\ß4{Æ-O¾\ß5Oğ}=^\ÖzP}¡Ç«\Ú\ßJj\Ç\Û4e·Í—ñ£\ËS\ï·\ÍH\Ñ\å©÷\Û\æ©ş¡Ç«\Ú\ÏJG\Øúz½¬ô¦¬}±sF[|\Ùs\ï\n<µ>û|\Ñ\ï\Z<­.û|\Õ?Áô8õ{Y\éGÁô8õ{Y\éMXûbæŒ¶ù²\ã\Şyj}öù£\Ş4yj]öùªƒ\èq\êö·Òƒ\èq\êö·Òš±ö\Å\ÍmódK@\í$ò\Ò ÁfÜˆZ\ÈU\Z7\Ù\ÚT*\nŒs\É\0ñiˆ\ÔĞ­\ÕÀ¢ªbuy™\ê\ç5‰EuS¢‘ š´K,ˆIÁI	hnHBŠ„!P&„(®P…`vZ\ÒBPP…	¡9CrI;„*\ZHB !\n$…HBaÿ\Ù','John Eco','987654321V','ecofriendlyGas@gmail.com','0711234567','$2b$10$CZ3N8BQ0mTC/6inGARgE3ueCWRt0nkE0DklUkSYwyrUsQOefSE3Di','accepted','2025-01-07 15:45:30',1),(2,'LP_REG12345','GreenFuel Hub','123 Main Street, unawatuna',_binary 'ÿ\Øÿ\à\0JFIF\0\0\0\0\0\0ÿ\Û\0„\0	\r\r\r\r\r\r\r\"( \Z%!=!%5+.2. 3:3,7(-.+\n\n\n\r\r\r+%++-77,,77-0-/+-.++/.7+/+++7+--,77+78-++++-2++--+7+ÿÀ\0\0\Å\0ÿ\"\0ÿ\Ä\0\0\0\0\0\0\0\0\0\0\0\0\0\0ÿ\Ä\0?\0	\0\0\0\0!1Q\"2ASq‘’±3Rar\Ñ#s¡¢BbÁğ‚\á$4Ccƒÿ\Ä\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0ÿ\Ä\0\0\0\0\0\0\0\0\0\0\0\0!1qÿ\Ú\0\0\0?\0û>7)óK‹ 7YP{Iİ…o)F\Õ\éaÿ\0u¾¡X{ÌœÎ¨+ûIİ…o)G´\ØVò•5\ç‰E\ç‰WPûIİ…o)G´\ØVò•5\ç‰E\ç‰L5´\ØVò”{Iİ…o)S^x”^x”\ÃPûIİ…o)G´\ØVò•5\ç‰E\ç‰L5´\ØVò”{Iİ…o)S^x”^x”\ÃPûIİ…o)G´\ØVò•5\ç‰E\ç‰L5´\ØVò”{Iİ…o)S^x”^x”\ÃPûIİ…o)G´\ØVò•5\ç‰E\ç‰L5´\ØVò”{Iİ…o)S^x”^x”\ÃPûIİ…o)G´\ØVò•5\ç‰E\ç‰L5´\ØVò”{Iİ…o)S^x”^x”\ÃPûIİ…o)G´\ØVò•5\ç‰E\ç‰L5´\ØVò”{Iİ…o)S^x”^x”\ÃPûIİ…o)G´\ØVò•5\ç‰E\ç‰L5´\ØVò•g‰Yx	\"\ÉœI×Š­°½Àúê¢«\Ò\Ãş\ë}Bš§H÷¨v¯Kû­õ\nj#Ş¬J°u¦\Â\Ğø\æ\Ş	lü\à‚¼†?nb\éb7.\Å`[oMÍ£YÔ¨N‚«\î†ó…ê¶ƒ\êš\ÂC\İJ£ZA ‡#L×”§…\Ú`f\Z•*vµ \Ğx`uWR`{\Şbrª\âXI\Î\0\'U©\Âr÷I\ç\å\âõ\Æ_³^§gšÅ€\Õu“˜u¸02IVVWı7†\İRª7Fƒ^¥Jt`\İ1\Íi´\0™ZªftŸ«Ë»0\ÒMš„&€I4 „4šI\0š!	 I¤„\r$Ğ€I	 î¿b«\ì/p>§z«uñUö¸S½T«\Õ\éaÿ\0u¾¡MS¤{\Ô;W¥‡ı\Öú…5N‘\ïHTU\ÙsÜs\\\Ù\"@‘\Zu¬Ú»6³¤\Z”‹H,3L\Éihiœó›Gw©\ÖB¨«€Ãº˜u\å®sŒ’\ÑOùüñVPššI ’\Ê\Åb\0«T>¹£»\Í&¶\Şx#¥lMIt¶?Ó–eª;v«…\âi\rNmWê¿«U¢\Ó\Ô\ìu½\"T~\Ûu?¥u6\Ô{ƒ¤o¤\Èqñ˜.\Zq Aº…›¬`\Ç\Ö4)nF¸9¬½\á\Ùó\Â \Çú³˜T±qÌ›m¨À\Ós\Ü6ú\\	‘1¥¹N³’\rô,<FÙ«Iõ\Zi±û«Á\rsZ\\\æ\Ğ\Ş\Üt\ÇTA\ã=JlÑ«R«i\ÛL\Õ.x \Ü\Ön¢\Ğ\×84ş¯Y=A¬…’1#zû\ë9•\\SeÁ¹†-Dº\àI»«<ÀCƒ\ÛjšM¦\ÓU\Ô\à’\×Ò«P´µ®$‘º‰6\Í\Ç!6Ğ¼Ã¶•cA•7€–\Ò5jówWÔŒº9Œşc\ì´jmW³¢	¨úM¦n5\ZYT²\\$ Ne½YPk&¼\è\Ûu2©\Íp,k\Å˜2(bs šCÿ\01œõ¶½F\ïw/\ÜÓ¯T\Ôm\ÖTm6R}­\Ï#ú¤L˜‰ù \ÛIPÀ\ã\ÍJ\Õi:\Ña}¶™–¶¡l’	¦F\Òˆ1+AP“I4	M\0„‚JZøªû\Ü©Şªz:ıŠƒa{õ;\ÕJ°m^–÷[\ê\Ï\éõ\Õ\éaÿ\0u¾¡MS¤{\Ò’M%P!44“I\0‚F!h\Ö‰ƒ\ÂuH0d @\Ì!t„	\ÍP^y\ç\Å+D\Ì	:˜Ì¦©\í 0\æ™sfG\ZwƒÑ«i,dGùhÿ\0QhÔ„ Lõ\é=qÁ \Ğ4\0F‘’ªÍ¥F\Õ)5ú9›Æ›\\\Z÷SLÿ\0ú\İÀ¢¦Ğ§egSs*ºƒ/}6¼H\æ^9Äˆ?t\í0\'I\ë„\Ô5Ÿ¿KlSptR§c\ÍCUÁ¯¡Uô\İ¬õNb\n™\ÛS»5©\İm…\íº\ëšØ2ö÷7ˆAn\ÑÀx$X\ä3‰\ÈgW1©uk\ì6º\Ò\r®\Ö)P(\ZÀ)€\"pŒ“M\0I0$\êz\Êi&€BH@!@!4IG_±Uö¸S½UŠZøªû\Ü©ŞªUƒjô°ÿ\0º\ßP¦©\Ò=\ê«\Ò\Ãş\ë}Bš§H÷¤)$„*†’Îª1Î´\Ñs\Ú!\í>`\Ó\Ö:$u\Ê\é\î\Å\Ü`R³,ó¸:™˜˜A ’\Í\'9\n1\Í\ãq»®b\">ıkªG-.Œ¸\\ ŠyOı\Ç3Á‚\ÅY1Jş`s¹\éu\ÚuóQS8\ë¥\Ã»oÛ³\ZÀ6ı§\äƒM4ò\Èô\æ32w;Lô\è+ªÜ²f\ä›[p!\Ù:u¹ñ»_’\r_„mfµ.µ)V\rôª6£5\Z\\ÖŸ²®şUy-°´‘“­€\Ë\Ä3v²H-\åe„;v–t\âbö\Ì] o\×.\Í`P\Ê\rF–µ„8M:aµZ)‰^¨\ÎNc<„X¥³X\ÚUi>\Ú\ÂIm\Şé´²\Ê5P»Ji‘qy‘\Î›F0´\Üi„Yı\\%Á\Í\é[\Ôr»®<nÅ£X\Ôs¯k\ëSª¹·zÁ”8hde1¤p±i—\\]T¸]œ³üŸI\ç+c¥BŸó\Å6rŞ½\È\È\å7[—^“üpGş·O\Ğ=w8qï™¤B8hS\Ø\\XÜš\Æ\r\0>r~eYY\ì\åw‰\Ü\Zw88Ó¸f?\Õò\Ó\æ¢aÇ†\æ(å¤†Dü\Ì\é?\Ç\Í¢k*¡\Çgo\'\0—Z\rÄµ¶›n\Ïâ‰i\ÇdaÀ\ç\éq´Z,ƒ×œƒ1¬ˆˆ!¦…óŒ\ÊÑ‡1|\Ü\\\'>l } zˆM§\r‘Fmu\Úô\á\Ñ×¤\Ùü ¾š\Ía\ÆI¸R\"uo[r\ÒN½-c8\ĞJ\à»›‡:h]³Æ¿4\Z©,\æd;*$Á²\éhºü‰‚r¶2\ã*|1\Ä\\7‚˜d>\ëI¾ë¹°4ˆ\Äp(-!4 ê¿b \Ø^\à}NõS\Ñ\×\ÅA°½Àú\ê¥X6¯Kû­õ\njšõ\Õ\éaÿ\0u¾¡MS¤{\Ò\Êš¨HB	¤„nÒ¬ö\â0\í$³\nö\Ö\Ş\Õi-Š\â\Í\Ë\á\Ñi©œ³cD\ç³v˜eSI®.¦l­Y\î,\ïM·[2K\0“\"œƒƒm†\Ş{\Ü\Ö\î%\Ô[\Óx©X\Óq¦tx¦\0{\ÂF@\È¶¹5ñM®÷Ò²­1†\rs™}\r\Í3s@?¨MSQ¤\ĞŒ\Ü\Z\è^q\ßõ\rcH\Ôe\ngÿ\0MŠ\Å\Z5\Z\ê,¤E43*…\Õ×™ó\Ğ\ÚUK\ê\0I§I¸Š Óª[{\é\ÒÂ¾ksR§4\Üz\èÔ¤¼\Æ\ØÛ•Ö´R;¬[i\ÕN­6¸\0-¨\ìœ\ÜóÀh\íJ•›ˆc\è“R\ÚOuL p¢•\í\Ãş5Fe§ si‰hk¤¼\æm\Ô\Ø\ĞÀlF½ø‡\ÔmS½\Üş©il\Ûú¯\Ì\èi‘\Ä6a·+ƒ°\Îm…­s¥\ÖFût÷ƒµ¦9K$õB\r\Ô/3Œ\ÛUœ\×[E\Í\İ?\nñ»¨w˜‰\Ç>™k\09”®’z5Gyµµ1®spOc\Ûû¿Z¥\ZNg%¨\á.\à\Ã5\0\Ì¦n!yú\ßõ¦\ç\Zh·&\×uB\r¡\Øa{h\ê\Ä9\Ñ3úDu\å¿\ê\n¢™¨)\Ó{‹oİŠ÷\ÓlaX†½¬\Î\\ÀŞ¼\İöA\éP°·_q\r¦\ÈŞºƒMJl8_\ÃM¡\á-=aùNA\Ú[7\ê\Ô\ÍG5­\ç\ÔkC\\]\Ìk\ËA$™‰û„Ğ„ HM!;¥¯Š¯°½Àú\ê¬Q\×\ÅW\Ø^\à}NõR¬W¥‡ı\Öú…5N‘\ïP\í^–÷[\ê\Õ:G½!IB¨B4“I\0œ¤„P„ %„ %\n½|Hc\é³/\Ô.’LZÖ°™ñ\0}\Õ<F\Úm7½†w[úmk\Úu \ÏVyk—t‘©(YømªÊ\İ\Õ`-.¾£CZŒyÿ\0…g	ˆ\ÌAeG\Ó\"g¢\âûˆ(\'”JI¢¢\Ä\ĞmV\Øù-–»\'9¤9®i¤ö]Q¦\ÛZ I=fI$’IÔ’I%v„¡$ BH\Z„	4!tµû_a{õ;\ÕX£¯Š¯°½Àú\ê¥X6¯Kû­õ\nj#Ş¡Ú½,?\î·\Ô)ªtzB¹Bi*†’@!$ „ i!\ZM.×¢\æ\â)\Ök‹˜h\ß)¼6 iƒòª÷ùÖ¨ò*\Ìsnph¶°\âñNİ¼]T&¥Ö‘i\çrôµi‡´µ\ÂZz¾ò=Fs•$a\àZ\0 L\r4áŸŠ[©&Zóx\rvÔ¤\ã[}Bƒn\ßT.´6‘© \ÜEµ\Ç2 œ\ÉZ»‘º½s#zøh?^÷T{~v®ò*a¶40Ä†sdL\ÄõfIË‰:©\Ú\Ğ\Ğ\Z\0\0\0\0\0€Ş‹;4Ğ„RM$ i&„	4$¡@!A\İ-|U}…\î\Ô\ïUb–¾*¾\Â÷\êwª•`Ú½,?\î·\Ô)ªtz‡jô°ÿ\0º\ßP¦©\Ò=\é\nHBJ¡¤„ i!\ZHMB@ª\â\İ\\8nšÇ¶$‡Lƒ˜Ÿ˜3=V|ò\á¯Ä¸c)\æÈ˜w6\æß¡\Ö.ğ\Z\ÎAy5•±“Î¥J2É“\Îc«Oœ¦D\ØJ˜‚\è«N›[\Zµ\Òg„pù\åÜ‚\Új&¦!¯\æScÙ–EÁ®9g™û$*b_úl»°] ˆ\Îc\æ5ù\è‚\â:\Äs-c&ò\è€\é\Î\Øwü‘ª\Å\à\ßl‡-zŒIù¦€%I@!@\ÒBNp$	6‰1.=Cæƒ¤!r÷‚\â`$ğ\Zk–<8H\ÓÀ\È0AFz—H;£¯Š¯°½Àú\ê¬R\×\ÅW\Ø^\à}NõR¬W¥‡ı\Öú…5MOz‡jô°ÿ\0º\ßP¦©\Ò=\é\n\å4\"@’h„	4\"D!\0’i šH\ZI¡B€Bh@„ BH!­\\¶CX÷¸	\0iÿ\0¼\åşÿ\0%‡D\â\ÛYØŠÔ÷†‘F‹\İ\Òi\0[-œ\å\Âu\è“Î††im€\èai¬\"ùÜ‡8‘\0D7¯‡\ß0ag½\ÕHüw1Ài\\	‰\à@~ı\è-\àq•¤\ï(\×u\Ü\à\ëiµ­\Î-‚\éü\Ì\æ\âc]ô^\r\'{\r´\È/,†u,n¦ ¸h\"®\â\â\'h¸9¢\ßÑµ0\ë¤z¸\è\â®\ĞÁT{\Z\á‰Ä·›Q¬e$F¿óLI…\Ä=¢\İ\ÅKI.€\Ğ\Ğ\ëŒA‚ \Ú\ß\íW¨<¹¡Å¥„Œ\Ú\íZz\ÇÏ½R­³ª:q5Ù‘ZA\æ\Ö5\æ\ÏÜ«˜jEŒ\r.s\È.%\î\éq?\ï,Q\×\ÅW\Ø^\à}NõV(\ëö*¾\Â÷\êwª•`Ú½,?\î·\Ô)ªtz‡jô°ÿ\0º\ßP¦©©\ïHW`p-:8˜\ÈÁV{¶-A&¤ƒp\ç\Z~@d\Èd´`ÀVsv·5\Ä\Ó\"\Ò\ÑÀ“ ŸöşUGm\Ù€pº±¾	&«\ÉN`õ\È\\‰Fº°º.ıW\Ë\àD“\×ş\é»k\0\à\İ\ÛÌ‹‘hw\Ø\ÂoÚ­\Íq\0‘öiûœ¾]h:vÉ¤bMYi$;zû19ğ\Èeò\\\â65\Zs\İ}\Ï2a\ÄgÕ¦‰{TKF\í÷8LÜ‡~‹¦\í@`\Û\r\\b\ÂOvyg’°°\à\Ã\à’f÷f ‰Á_øR\áöU*ohuÀ—Iqt’\Ì÷•\ÈÚƒ›,\"u\ç6\ZgùG\È\Ú\Ã!cƒ¹\Ò\ÒG4˜\ÖsÓ†h4³F\Ön\\Ã˜‘˜\Ö21\â\Ú\à‰\Ì\Ü\ÌH=s\Z€#\æƒI5œ6¨?üonRŞ™=G\\ô\É\'m`&)¸şW6>ü>\è4SY\ïÚ€\Ê$\\\Ù|\"Id›µZO@†]nò\æ\ÄNF5\Ó4\Z	¬\ãµDa.\Î\æ\ÙiÀ¤Í¬$0÷\\Ş—SdwjƒE8\íaa\Î \\\Ù\'+‡x•\ÑÚ\Ì\æ\Z\×E\ÃSq\ë\×\äƒA8\íAğ;&‡D¶d-şP6«mº\×´A9\Î_À\ÏNwz\r,\ãµF›·]u±-ñö«d\0\ÒA$\\@ƒ\×öƒ÷A š\Íf\Ö#M\Í0\\$´\İr„\Î\ÕoSD¨\ZÄ´ÿ\04RY¯\Ú\à5®İ»œ	‰h0>ğzÿ\0\á¯j\Ğ\ÂKt.|j#«C\ß4P³YµA\0\î\Ü%ÖŒÁœ‘\ÇCItµû_a{õ;\ÕX¥¯Š¯°½Àú\ê¥X6¯Kû­õ\nj#Ş«í—†š9T~A\Ú	\çõw\áE©*	kĞ‚	13pô\Æ`\â\r\ê\Ã?6–Áfy;O\Â\Ô\åô;O\è\ï\Â9}\Óú;ğªegn\é]{w\ì NXZ½`«$\ë§Ì®Y†¤s!cuw\É œ\å\Ì\×\ä<Ÿ/¡\ÚG~\Ë\èv‡\È\ï\ÂY”p\ÔXğñ\Ê9¹\É\êœ\âFa“—ª\r\nm \Î\"bAn\Ç9¦dVŸ/¡\ÚG~\Ë\èv‡\È\ï\ÂYûš\\\éß—:A&©3\ïğƒ Ç¢[ªP5\ÃZ\æ¾\ŞLş—\Ädõu-_C´şü#—\Ğ\í•ß„2¨5´š\çeX\Şæ¼KPd]u¤†g™<»Ò¥‡¦*4ƒ\\¹¦\ìğ\ïh%¹\ÅÅ 	\ïZ¾‡h|®ü#—\Ğ\í‘ß„2³\Í\Ze…³_MF\à\Úy\ÑĞZ‡T§Nuò-3Éª\æ\Ì\ê\Ï?™•¡\Ë\èvŸ\Ñß„rú¡ò»ğ†Vq\ÃÑ™Š\İ¬5Qr\î†Fs\á-\Å+‹œkº.o\'|8’IÑ’dğZ\\¾‡iıøG/¡\Ú#¿eg:39\â.pu\î8Zœù\ådOr\äÑ¤\æ‰\"K„\áª\äm7dYœ\ë\ŞŸ/¡\ÚG~\Ë\èv‡\Ê\ï\ÂY­¡J\Øır\Ö\Ï4\áj%±pt\Z.™‡¢\Òc|$GşŞ¦¤k6÷x\0´9}\Ğù]øG/¡\Ú#¿egSe6–\Ô;ó\r,\0\ájHl2GH®†¦\í\Û?W)Û‚8\Îr\Øo_\rUş_C´>W~\Ë\èv‡\Ê\ï\ÂP{1 C\\[˜ €\Îo6\×#)\É\rÙ€	.ƒ-\æ°Z\È43ü)ù}\Óú;ğ_C´>G~Ê¬ı\Ç[\Î2\Ñl†³œ’\"2&ı–\Ç>÷³--d\×Ô¬rú¡ò;ğ_C´>W~Ê…\Û8y\æ]º\Êrø‹g.¨\×TÛ³š9\ÆCƒa]ñLH9\r8)y}\Ğù]øG/¡\Ú#¿eU—N`‡t)õ2û+µk[ş/?6¶W¾‡iıø\\\Ô\Å\áœ!Ï¸k\"|Ê·‡tÁ\ÌH˜\"Ë¬(v¸S½W±øv@€\0\à\0\á¢\ïa{õ;\ÕE‹\îh:€{Ä®wMø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|7Mø[\à„\é¿|\é­ \0,„ÿ\Ù','Jane Smith','123456789V','greenfuel@yahoo.com','+94798765432','$2b$10$CtM2SZoMyD03jKIm9XhKx.ZzM6n2PkR3C0n8TwrrBY4KO9p4qUu5G','pending',NULL,NULL),(3,'LP_REG235534','Green Valley Gas','79, lake lane, Hambanthota',_binary 'ÿ\Øÿ\à\0JFIF\0\0\0\0\0\0ÿ\Û\0„\0	( \Z\'!1!%)+...383,7(-.+\n\n\n\r\Z+ %0---/--/---------.------/-2-/7-5---5--------------ÿÀ\0\0½\"\0ÿ\Ä\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0ÿ\Ä\0>\0\0\0\0!1\"AQRa2q’¡\Ñ3Br‘±\Ò#bS‚Áğ²5Dtÿ\Ä\0\Z\0\0\0\0\0\0\0\0\0\0\0\0ÿ\Ä\0#\0\0\0\0\0\0\0\0\0\012!Qğ\"Aaÿ\Ú\0\0\0?\0õN\"À[Ó“\nÁ<”rÚ¦k‚=`t®»°v\â @;vtUŸ»†š\ÓD\â Á\äa\Ş~\ê¨\Ñ\\Ë¢¹\0+8`ŠKGX1Ø“g–Ü…u[\ÇV“,­™6\ÉUƒ°ö§¬:»@#aR\r› ‘ğ™)&6\0G³=\Õ3U¨v\rpJ	ˆ*ªË´ S&w&6\å5\èµ75zRE³	\Ç<€„\Ä){Á\í¬÷x\ÖQı”»!\'Á=©À\'«\İ9S\à«Áw¸®¥”\'’®1cs&´º}rL)\n,I’\Ç!\Õ&@\İR=Lx›\åô­szkÊ¡\n#¹¸¹y$œ²1\î)4\énÜ¢eÑ±RÀe0¢L\Ş`v\í¶>¦<MòúQ\êc\Ä\ß/¥9 \Ú\ÇôVÀ\Ú\í\âUNŠŠ—²pö\Ğ\Ü7Œô™‡û\Ğ\0û¾Ï»xï­Ÿ©|¾”z˜ñ7\Ë\éNh6².ˆ\ÒM\Ë\Ê\ä6x–ó^Í…s}-¼[9Aòƒ‘;À+8\í¸;\Íl=Lx›\åô£\ÔÇ‰¾_Jœ\Ğmc­\"”™ŸˆƒöAsN#*œ\Ñî»“\Í\Éöq ®\ËùşU­õ1\âo—ÒS&ù})\Í\Ö*Å•µÖ¶NeX1\ë	,Xuv¶ÿ\0Cf~\Òş¤œzªû³\çùÖ»\ÔÇ‰¾_J=Lx›\åô«7¬^¢\Ê]”±Áp_h‘\ÖÙTv#•=*ğ]\î+.!M²D(‘\ìö’k]\êc\Ä\ß/¥¦<MòúT\æƒkÊ¡J#9\n\Ü/$’^AŒc–CşšM2[IDË£vRÀdT\0\ã&~Q[S&ù}(õ1\âo—Òœ\ĞmcÅ«`mvó¤&DÂ™\È—²¸{h\Îo\é\æ=¨\n7+\ì\ïÏœV\Ï\ÔÇ‰¾_J=Lx›\åô«\ÌmdQ¥\Û\Ê\Ì<	ƒ‘ó^Àb“P–\Øtg.ˆ0x%‰\ìR\'·“3\Û[S&ıGÒS&ù}*sAµ¶‹€¶\Ìø(lqC9\0g²\r:¥T\æ¯u\ŞF\îO²Av^\Şu¬õ1\âo—ÒS&ıGÒœ\Ğmb´öV\Ñ\Î\Ù9•ec\ÖX°\ê\í=ñOôVgg¿„†)\'Š\ï÷gÎµŞ¦<MòúQ\êc\Ä\ß/¥Y¼mb\ï\ÙK±\ÒIÁ\n§µ;hõ{ˆOJ¼{ŠËˆR„\ìª ó^\ÒOıš\Õj4D£…r©\nLuI…Vq~tXgµ\"\ê¡\Å™–dLŒ\r\í«b|\Z)T)Dg!\Ä\\/$“˜!£ûG\çI¥µm	¶¹nS dI¾ı¢œ\áBğE·x“\Ô;+•a‰&Y\ãv2>÷eJ\âK\ÛEa£Àƒ9\"œ\0Aß•g3\çD.‚Ü·k¯6\ï8ş\æ\í¡‘\ÈDs­a¬W\ÔÎ©m\â£’\ÊIÈ³)\æI\Ëõ\ç[SZ/F“©Qqu›6e°Û¿ª6ª}#	µt@\rrq\0¨R·\ÆNç”Ÿ*¸\â¦-X‚\ê\Ä\ì\'\Õ5±ˆ·l†fW%¤©\Ë\'û¥{{\ëe¾©9B\á{Qzõµ´Q\×u7ŠF%Y\Ö9ƒ#mşu°\à5´\Öpw\ì\ì\îÀ@,\Æh•wÁ\Üx¨8¬($–À˜\àG\åS\ë]Û“>4\Ò˜QEid(¢ŠŠ*\â¶T•8˜;\î-\È) ›EC\ÖñkQ^\í\äDbYŒ)$À\0÷“µ.Ÿ‰Ù¸ı\Z]Rø\å\Ş\Æb`öMº*¯ÿ\0\"\Òd\ë\ë	6ş\Ósı¹3ğ\í¾õ+Q\Äl\Û\Ã;Š:Ocy\Îœc\Û\ĞJ¢«?ò-$9õ„‹g†vB\0$9û¦\ç\ßN^\ãZtº¶Zú%P³\r·Q\Ú7¨\'\ÑP.ñ­:\İ6Zú‹ e„õñ˜\Ëq;M7w\Ò\r\"[7[Smm«g-\n®\"Ua\Ül{\è,\è¦}r\ßG\Ò\æ¢\Üe‘0°;I=”Õ\'e\ã‹¾\ã²A0|\Ç.ú	tW\ï-µ.\ìTK°\0s$\Óz\Íe»*\Z\ãª)!A&f0 w’y\n\èª\å\ãºbÌ‚ú\ä ]òPÓ‰aƒÏº‹¼wL‚\Û6¡\0½®H‘‡‹ò ±¢¢\é8«¬\Én\â³ R\ê=¥\r8’;\'\ãR¨\n\rPQIA‹\×p›\ÚDºı[¶gDPù),J‚ŒAbgÊ˜\Ğ\Şkº[aƒ)$€Y·`U@u‚\Ş\é­Ù¬Ÿ¼¿h	94ƒ …\İ ó.ñ]T\\š¼Lya1£¬(UK¬…\ÕYCuòc´rš\Ø\Z\Èè”B™8µ\Öt\ÊXIIövz\×\Z\×{0´³\Ü~\Ù}5¥^l \r\ãr‚ª4´„.H\ã\"§,J$L4©Ú®ø¨Õ€ym?ª}oO?\ê41$t‹\Ï\ß\Û[-\Ï\á÷ú“–¿NÄ¢“Ì¨?*v™\Òıš~ı©\êæœ³QE@QE>\ë®iøf®\í¢C¥‡*G5$FC\ÌLşU+Ñ­\r»Z‘F\Ê\ç–J\ŞI$ù©ú½2]¶ö\î(du(\êy2°†\Ê\rTğ\r{MhXMVVcl½¹¼‰Ø½&P\Ğ6¬À<\è(=<\Ò%–­’\İı\"¦ıƒUnü«S£\Ê\å\Ö{¶‚5²RÙ™%›q\ŞG/ñª\Î3è©¿¢·£·|\ÛKmm²e7ôN$–ª$™š{†ß¹zË¾¥p²ÅŠ%²½#(2b\æ\0È˜\"÷\Z=¸\ÖK¡}\"3m…¼ô¨¡®öô{\î@0+e\è—]&Md¸º\Öm`·;h\'ñ\ØG¦4Œ”\Ô\ê\ï\\º—SY€»hÛ€[À3±P&E?\è\Ï¹¢´l\rI»idY½{k÷P¸nºC`|\è*½¶\çV­\Ä.‚\"\r‹ Šë‹¨o‡Ù§ÕùUc\è\ç¹¤¹©v¾.\rMö¾Ã£\ÃeU€s=XQÎ!À®]\×XÕ‹\ê½\\E·\Ñå»rÙú¢ ~´\Üb\ë§F·o72ù!d‹öˆ\ß\ßû\×_ÿ\0B´\Ô6 5Ş‚\å\Ï77lƒ·\ä?J·¹Àn\"º\îF6ZÀ·ÑŸa\\œóö¥GdyS–ğF\×\é_L/tA\Ê\ä\Øfz®® d\0\İE¦Ï§…i[\ì¯jK\\\ĞZ\é-£w‚\Ğc·\Z\Ôqm»\È\Èn[¸¤ı\×Gcöü\ê\'\à+ª±m.¹-2Üµv\ØÅ­\İOe\Ô}\Ä+«\Ü2\í\åU¿|¬ı¤6òd`\Ã)v\Ú@\ØE–Ø·©´t—ay<C“ˆ¾À$uŠŸöš‹\è&»\Öô6ºnµ\í;7gb/X›eˆ\ì$oş\ê¸\Òh\î.¢\í×º\\\"¢\Ä\Û	–\Ùdr’\Äòƒğ\Ójõ:|Ô²»Z	]W\Ãdw 	\Ûx¨+ø\'ÿ\09\Äüú/\Úõ1\éÍ¡hğÕ¶‚_o\ä=‡\Ú{*Û‡ğ–µ÷õ†ú·N–Ñ­ôdb¶²\Ç\Ì\ï\Öi‘\ÛK\é/}[\é\Ùo‹~¯yo\0mç“¨ r°h&ğ\Ùf{—-„¸I·\Îf\Ú1)¿o´OûXURp\ë\ÇT—\îjT¶è¶’\Ş+“•—f.I ,y«ZŠ( ))h J\ÏzGvü”“\ËüA5¢¬÷ûAø‡ş¢¶Z\ì•aUÂ´Ìº¥¹\0#·T+Q³È\Ï:Ûš\Çğıõ$Ÿk§a\ã\0\Æ˜\ßó­¬¯N³	K=Ç®\Ó\Ùb$(ğmUZ6-\Ñ8Q˜R\Ù@,\ï\ìƒ#o*¸\ã*\r‹\0‰$r‘ˆÚ©ôOD\ëˆV¹²®GL\Ï&\å\Ëm«e¾‰9kôŸfŸ„~\Ôõ3¤û4ü+ûSÆ¹§,\Å‚¹\åPtM(¤4\ê&–¸®¦k#ª\ã·Z\ïGÒ­\×:9\Ä1X-\ÆVhc€&z\Ä\í\Õ5«½a\\\0\Â`\È\æ Á\å±?­D½Á´\ï³YC°^]Š@÷\0\Ì#ü}\é8»Š\Ç ‰\'l\"C6\ç\İLÿ\0_\Óò\ÌÈ‰° 3@$·¸M?o†YEu„\\\Ùÿ\0\ÈDA=\Õ\Í\Îe¤@\äÁ\Úgv\Ã>ª\ïş\"‚Ÿ]\éP\Ñ\0Å¶\'˜¯r<¹\Ş>\ïˆT½\'²¶\Ô\\»-ÈœX\äAÄ‘\n\'x\Ä\Ç:\ãI\è\í¡zãµ¤\Âm(\äJ´ù6J¼¼#º¦¿Ó°\0\ØR\0\Ä\rö]ö÷nvó \ç„ñ¤\Ô=\Å]±;o2°!Œl	™%Om=¡\âv\ï\nÀÀaFp;U»ö\0ö\Ò\r6\Ğ)¡\äbLN^\ÖÇ¿¶£\ß\à\é\ì\ÚEEr\ã¾Mmdà§¸“É›´\Ğ7¦ô§Lù“R\İc\ì\â£,\É\ìI\ãz’8\î@\é ´\0 ’À‘\'’’{…t\ÜNLô	Ì]¬CúªŸ\ÈW?Ñ´\à–\èD°*\Çy*Û•\'œNñß½=O¥6em\Ãõ”xTwbOdr\ï,£\ï\nv\ç\Ùl\Øs$\ÍÆ‚:4¬ˆÌV;o\rHN‹*\Ä@ˆ+b9F#ô§´\Ü2Í¬°´!;Gı4¸oK÷. ‰\êöÀO—9™RmY\Ôm/µhÍ»aI\íùû(ıH&€&–¹j\Í-sC\Z¨¤Q@4Y\ÏHA,`Áq\ÄAŞ´uœô‰e $À=Ä Ş¶Z\ì•a_Ãµ\0\ê\Ö\Ş\êò\ìX¹l™c­î­¡¬oT\Z…\n«+t«2–*\Ç%?{yû\Ö\È\ÖW³	JŠ\ÑX}X\Ş7\ÄES\éÔ§Cm²\Í\\–\Êµp{${CcV^[-¦´«2T\îPET\èm”6‘–\\fd6D°ynİ•²\ßDœ¶:_³O\Â?jt\ÓZO³OÂ¿°®\Ø\×4\å™)M\0R¸¨–)M%\n(¥ mô\è\ÆH\ß\Ş~´¦›}i\ÑJÆ‚;\è\Ó\Ãóo­\'©§‡\æ\ßZM@À\Ò[ğü\Û\ëK\ê–ü?6ú\ÓÀR\Åv·ƒY¼\ÈÎ¦mò†`“	\ë#R›J„\É_™ú\Óô„P2t–ü?6ú\×>©o\Ãóo­I\"’(#\ZO³óo­w\êi\áù·Öš&££·\áù·Ö4­I@„\Ğ(4 P$QK4½R­¹ p\Öw\Ò\n\Òy\'~À ò\í­\rg}\"`	\'2v\ì\n&¶Z\ì•aDŒ·Ô™\n×™“(\r¹I•u­5‰\ázW]Z¹\\Q›¨$0Ë–şg\é[cY^\Ì%*.*µ`m÷Ûª7Ú©´m\Ø0¿hÛ…+”\\X\'¼ùÕ·ºOeˆ\0$LH\'z©\Ò\\-Ğ°-–bT°26]\Ä*\Ùo§\ß\êNZı\'Ù§\áµ9Ş“\ì\ÓğÚ®i\Ë7#•(¤Š \ê\íKHÜ¶\ç\ç@L\ÒcLM\ß\n|Mü)C]ğ§\Æ\ßÂ\è¥&£\åwÂŸ\nRnxS\ão\ã@õ*š7|)ñ7ğ£+¾ø\ÛøPJ4…©\×|)ñ7ğ ›¾ø\ÛøP:ir¨ù]ğ§\Ä\ßÂ”¾ø›øPH\Zg+¾ø\ÛøW®øS\ão\á@ü\Ğ\rG›¾ø›øRƒsÂŸ\n	\rIÁ{¾ø›øR†¹\áO¿…ñI4\ÎW|)ñ7ğ§,\å÷‚\è$ş\àPv-†@¥€Ÿ\ã¿h?ÿ\0\ÔV†³\ÎF\Ûß€»ke®\ÉV¸tL\ìN\Ã¥B€R yó­‰¬gÔ†\Õ*\Â\â¼\Ü,\ÒL•Ç°·\Ê+fk+Ù„¥A\ÆPAˆ\0°Ï—¾ª4h?´\É\åUNxÃ€d\ÇTò\Ør:º\â„ôZx\çÕ3ˆŠ§\Ó.\"\Ê4\æ.À©X-pr\ï\ëe¾Ÿ©9ktŸfŸ…jz™\Ò}š~ûS\Õ\Í9f)\0¥¢ )\r-!4	U\ÜkŠ8·°/v\àµl1!K•f\ë	öwUB\â\\4_6‰r:+½$@\ë\í\â{„\\?*O\Ó.Ú‹`9m7$\ë+†\Æ6¥\ã]4úc¨ƒq`2…\æ\à‰\Ú\Æ[\Ü*\nz,ªª:f8.\ÚE­5\ÑvÚó\0·p\ä75g¯\á«}\ĞÜ†DË¨\ÊY˜@c=\Âcñ*»\Ä\ì¦9]Q²v\Äû$À|\êôŠÕ5\Ë\è\ËsrH,PK\r”‘´ˆ\Üw\ÓZ?FÍj\\k hT\ŞÚ–6£ q+™\Ú\"d\ïPÇ¡‹ƒ(\ÔÜ—[¨ÍŠ™[\Ël\\\ØöÍµ`{7\çAy{\é\Òs¾ŠV&LA$,On\ì ÷Î£·¤šcm\Ş\İûo‚fF@l$ò†\Ø÷uz(ƒ¤\Æ\á\Üg,­Ò­\ç†ö±g@`¤\è\æÿ\0¢¡\ÕÁ¾zé¨¶a\ÃSx^r7\æ@òï ¼µ®´\×\ZÚ¸.³#~\Ã\ÈÁ \å;\ÔM?\ZG\Ô^±M•W.cCÁÿ\0\0>ñ]ğ\Şl\Æñ(\Ì\Îª\Â=\Æ\Í\È>\Ñ‹\'i#º+›\Ñkl_r·’ó*…{\Ë\ÛG-\à‚9;6 yı\'°·\Ö\Ùt\ÈÍ™b!\Õ\í(B¤m=*™Ÿ­J<f\È\Ë;ˆ¸\Ük~\Ğ;®2L{1™\å\"y\Ô\r_£mubæ©˜ô/bp@qvF\'hmSùs{\ÑT{¦\ë\\–/qˆ(Œ¥n‹y¦-#¤!¹ùƒAb8Õˆ¥¾ğ\Ü\Õú29{Y±\ÎH\ÓzG¤ª·$)-\á\ç\×\0v‘\ê>«Ñ‹N/u™MÛ©tˆ¶\èÁúªDApY‡nGÊ¹ÿ\0\Æ\0|…\Ø\ßN`\"…3½Å€ \0\Æ\ãO\å\ï!b8Æœ\áæ¡ƒ³©Ÿ8h\ï\Ä\Ç*=%\Òº…e.ˆ\n\ËK\\œ‡\"\'~[\Z‹¢ô]-\\[‚\æL«‰\Éƒ‹»¡ºnGqÎ—\ÑAmP\íı´\Ó\"Gÿ\0X¹Bw\ŞzF—dr \ÑE) \êƒE)h¢€¬\ç¤*K\Ø\ÄÁ\ÄAò­¬\ï¤Éˆ{y[-vJ°\Ãm ÔŒTd·\n¹V\ÍI\ÉHÜ‰ø­‘¬–‰_-}\Ù)Bd¤\í\ï\ï\ì­i¬¯f–w\Òf\ÓZ9\0G~=ş\ê©Ğ¡CiYX\\3’7\ë(‘·³!¶«\Î(&Õ\ã–ñ1\Õù{\ê—@AKzF•g(¸:\Ä÷ù\Ö\Ësø$\å¯\Ò}š~ı©\êgKöiøG\íOW4å˜¢Š*Š( \rsJE\Ğ%ƒK@€P´¦m@¤\×$\ÑC@Ü˜\É<€ \éEs\\¶¥b]Cc”Hœ|^\êD¾Œ«•ƒ\ÌwSX]$\äÒ‘\\‘J*¡-jX \æŠSK\0¥Š\ç\Z\èPQEEPœôˆ€ÄS¿»3\ßZ:\Ïq\á/\Ë\ï\Éû£ô­–»%XUp­;®¬1V[eºs,\ï\ï\Ù\ÙùV\Ü\Ö;†ub\0¾\ÊF\ÈO>¬ó­‰¬¯Ï˜JYş;t&\Ë7 ;‘¶`Ú©\Ò\Ü-Ğ‘—G˜è³€`¸=\\@•\ÜDùÕ¿\Z@\Ö,ƒ0@œbc<\ê£Ilˆ¤‹lòƒ \Ä\0\à\Ø@Œzµ²Ş›r\×\é>\Í?ı©\êgIöiøWö§«šr\ÌQEEPQE\0(¢ŠŠ( n\íÀ€™\ŞOme¸Î®\å\â\Êª²\à\ê ƒ\ß\Ìl}\ÕkÅµ&qn`Ù¶\ç\ßÿ\01MØ²DW—òo\ÍS¶™\ÒV¨Šct³š=`˜,\Æc»n\Ï*zõ’Œr¶\Ë!YN@N\ÇcÙ¹«\Ü ò ¤UÁ¦“¯\íÑ¿Ë	­uUK„\0õ\É$´™½^¯*¥+/Î¬´W¤A;ÿ\0\ÅzŸü\Ï\áT¹.\Ñ¡&Š(®öDQEEPQEEP%g}\"œ¶‰¦y\à#n\Ú\Ñ\Öw\Òr8ó»§\å5²\×d«\ZB¶©T†\é\Í\Ì\È\É\\zª\0\ä?H­‘¬w²‹©1p­Î²²“(F\àyÿ\0Ø­‰¬¯f•Š\Ä	=X;\â\"©´kŠ\ÙRz\Â\á,0eÄµÁ\Ø}Ç­V~ƒ\êÖ±ö±óç€UU¢B\æB\æk™¸HûËºÿ\0Œ\å\ß[-ôI\Ëa¤û4ü+ûSµA}\ØÁ\ÃÕ•\å oRkšr\ÌQEEPQEEP\Z(Š\íû“xLl;9n\Ûÿ\0\ê*GKQx—ö\î‚Ds\Ïbz¿·Î»\Z…\ç_=U3LK¾4˜ƒ\æ\ç•\ç•E:µ˜ j\Ô¬kµ\"\åÍİ•+†\Ü\ëDÄÖ«\î_aÛ·Ö¬8Nò\Â m\ç]\Z&n\Ã]\Í\"™YQE\í¸\ÅQ@QEQ@RR\ÒP\ã\ì\É\ä’{\0Q\Û\ÙZY7~\Ûõƒ«.DnP ½µ¶\×f5`\ÇB/¥M÷el\nÌ²O?\Ò{k^k\Ã\àÕ®A\Âeı±rg\Ú\\¹óúEm[Ù‚•¢±9o\İ\Õ\Õ–\Zİ¦\Ä.ÁÊ™Ì‡\É\å\Ìòï«6\álYf\ä\0&9\Æbª´—6c{A\Æ¨SÁ<\â#s¿:\Ùo§\ß\êNW\ÜˆÚ¸Y©¼\07\0\ç \0<Œ\0F­kk…‹Yºo<Jµ¶+‚••PX–oû¨ôjõ\ÃgÏ•\ÄfJ’É‘Á¡N\Ò6\ß}av\ÜG˜•¦VôQIZ8kg\Æ\Ãİ‡ü­\'D\Ôo\Ñ?;E-]\î%®1\Õ{?\r\Z[ı! =Áw$Iu|ªm\rtGıFıø\Ñ\ÑõôO\ãN\Ñ@\n(¢‚¯Œğ\î”J¨Ë´’F\ÑX»º\Ò%T\É\î\í>\ï:ôŠª\âş\Ø\Õn*¬«\0\ØÈ®“ğù\'u>%\ÓfüS\â¬0º=iÏ­ ÷A§57İŒ \'Ï’y;\n½\Òú%v\Ş\n5LD“¸\Ìw¾OD\Ë\ào^f\Åå—š2C~G¿\ß\\ğ\ïnÃªo\ÛÎª¾t\İamZY¤ƒ€$\Ûï­¾ÀDÀ’;O}7Ã¸}½:aiqY-N\çŸ:•^Ÿ\Æø\Ñk\Ìù—\ë»\ç\Æp\èO\'#İüƒ]\Ñ]M&º#ş£~‰üjk€b³zGø¤\È\Ø\ã¿/Ú¬è ¬}xŒ\İ8‚L*o\0º»\È~U\'Jı\"\ä\Æ\änŒxjU\rtGıFıø\×j sŸ|\ÅuEIK\\³€	&\0I\ä\0 oW¨KH\Ïq‚ª‰$òŠ\Ë\êo¥Ğ¥\06öT#\Ù(\ÊA\ÜFò9É¨w-]¾\Î/³¸rø\Ú\É!m\ä`€\0S3;Ÿ:\êÎY°¨ª¢\à%›\Úİ™©3Ë»m¶®ª-\Å?¿,&uJ\á\Æoˆ#}\ÕUZB\Ã$ó\å&Mk\Íct‘µJ$ô™–¹*nT\İ[#Z\ïf–\Û\r§²¦`€	1€ª§N¡:#\r\Ñd\neqVv\\@?­^q\ÃM\"d¨ıTV~\İ\Õ\é.i…µn\åÂ¤e8‰13<À3\å[-u\Ñ\')z]Q‚©\0«p²BˆP\'—h\ßnQPxVœ\é¯İº·KdqN	fñ6\ç\ç\ßM\éu†ô¡UÌ€°©\Ú6\ä#‘ŠnO«\Ú\Ä\\ŒŒdõ½şU·mZL1\Ö\Z?\n÷±9b–b¹C0$A•\ØwS£üg¾<š\Ô\ë\rœaTôŠ\àuY13´*\îş»¡(‚\Ú1¹Ñ™pLdƒ!ß½a\Ãú]\Í\ã\ÃÀ>3ü<¨xx\Æ{§ÁY»:óz\Ù|J/\İ.‘\İA¥\Ókó\rx\ÛXB°½„A\È\ç=ñ´\nœ1\è\Ü\Ñÿ\0^\ïö\Ïtø(<xx\ß\æ…e­ñ¢ıSj\Ğ\ÍX\n™€y\ïõ\İ^7ºfö\ã0VNı¼\æv«Á\Í!\ã\ß\à¿\ï×¿ÁyÇ¶{\ãÁYW6‹[[V\ÏF¬\ÊIh`oqó§.\ë\áVø¶  §f*mûLã¶§z74cügøR<<\ã=\Ó\à¬\Óq\×M‚±`\â\ê‚1Ä€6\Ø<\ë½6¿¦si­ \ë(\n˜	–<ö\Ş7šp\Æt74_×‡~3\İ>\n\ïö\Ïğ¬Î—XoŒªŒU\É “\0J£\Ëo*\å¸ùOAk\Ê\"™]ú\Şñ\İ\ÛW‚=š“Ç¿Á~3ü(ş¼<ñøğVgW­6q„SšN\ã“h\"g`Ew¨\×t%P[F/ƒK‚bPd9öüªpÇ£sGıxx»\Û?ÂÇ¿À|gøyVfÖ¼İ¶_SmO²6c˜Ü\è\Ú<\Íu§\×\æ\Zé¶°Œ°½„D\Ï9#jpÇ£sF8ğğ/\Æ{§ÁGõ\á\àş\Ù\ìà¬µ®4\Ï\Õ6­Õ …‚§\"\ç¿*vö¯­` ’\Â ¬óß¾dU\àF\æñ\á\àş§üg¾<˜\ÕqSiš\ÚÚ¶pW92’ZW·»n\Ú\îî¿©Ó‹j:ñ‡\İ\ÅUIö“;\Ä\ïS†=šO\ë\ÃÀ>3\ß\nÿ\0ø\Ïoû+2uøZ°V,APDb`m·”Lû£½/\éœ\ÛkH7\r*\n˜8ó\Û~\Úp\Æt74Cügº|^ñ\éğVgK¬7[£*£rH\0`¬T\í¶Û¶)9OAk\ê¤A’\n’w\ì\ÜwU\àF\æš\ï\Z¾Á(Ø°%¡¢ŒG)[\Äu5“g2¨\Ë–fq¸Ü±İ·\æ;ª·S­6q8«t‰;³10D\ÎÀm\İıwBU´bı—\ÆK\ÖûNş[\Ò-\éƒRğ­0³lM\Ì\Ø,`\åğXƒ‹°\å´vy\ÍL\Ö2th¶÷p:\Ì\Ó\Ö|@±$©Û°\nk^n\ÛgÁ\ÛtlXº‰#º	{\ét¼C0×°_\í”!{\ß b&{\ÈÚ³šfgYD\ÍWT­\×\é3‹™A\äS°Û—üV\È\Ö7‚8n†\æM\Ë÷Dó\É;\Íls^\Ë:_ÿ\Ù','Janith ','88926372819V','greenvalley_gas@gmail.com','0917782637','$2b$10$jo2CddlpyZX1dncikLJmMe98KlzN.j4k/4XyXrfrzC96vexA7eOVm','rejected','2025-01-09 15:45:30',2),(4,'LP_REG728993','first','Galle, Sri Lanka. ',_binary '‰PNG\r\n\Z\n\0\0\0\rIHDR\0\0\0\0\0½\0\0\0“o¨¼\0\0ƒPLTEÿÿÿøøø(3aÿÿı\0\0\0ğÜœÿÿùô\æ¹ñ\é¾ûõ\ß\î¿+#/_@Gmğğğ\0\rP\Ê\Ê\Ê\Ğ\ĞĞ§§§ùö\ä\Ú\Ú\Ú9Bg™™™\Ä\ÄÄ\ä\ä\ä\Ñ\Ñ\Ñ\İ\İ\İppp±±±\ì\ìì¡¡¡}}}‡‡‡¸¸¸NNN!!!‚‚‚mmm\î\ÅE”””```õ\â±===111[[[üğ¦úú\ìCCC(((˜h&`XU\ì»ğà¨‚sMô\é\Êğ¼)Î¬b\ëØ¬ƒ>Õ¼tô\ã›Å¡ZÉ™QY^~\è\ä\ĞÃ´‚·¥m|—§¬º»½\ÈÁ\Å\Î5<h\0M\ZTò\ÓzÏ¬2 †B	&f\ï\Ë[Â9,fc]Põ\È+9:W\ì\Ìic8@R >&X\î½3\ì\ÉMÕ¶L Y]am\ãÙµ\ãĞŸÑ²_»—S\Ü\ÄtØµp\ß\Ë~•bÁ¤`Ë˜N³Ft*\ÖÊ®\ÛÊ‡\ÓÂ£©z)Ã°»˜eº†CÊ”@\ÓÇot‹¢\0\0:_f\0PŠ¤Ÿ±U\\u|FxgN·–B\í\Ì3óPŸ\0\0½IDATxœí‰C\ÛH–\Æ_!G	‡\"ËŠdI\Ö	v\ì\æ0G6,Á6Ll\Ót7=Yzz‡%mphô&\Î\ÎìŸ¾¯$_“\Ø\Æ\Ø&ñ\ØRé¬Ÿ^½÷J@\ÚVü\Ñw¿<>2òb¤N\ßÿğo»Û¯G‡F‡îŸ }(føÁÏŸ?¯\ÑÀ¡_şğ\ï?ıüzôşÑ¸*v©0R\Ã\á~\ï\ì|ÿ\Ãx\ÖqŸ,\äö,PL`ñ\Ç´¹Ô´ób\Íckû¡\è\ÖıXú\î\é/^¸æ±µ½{_pt\Ä.*\Z^¤\Şc\ä\nj\Û÷\Ã{t”*¾\ä—W\ìƒ—{\àM;Í‚P\ïñ\Ík\æñ‚ş\î¸Á…z\Ó~\Ö° b—O\ëc-õ¦#\Ô{ô³u\Ü\êO¯{j\î\Ñ\ëZ7\Ö]±(¹n®÷xİ—\Í\ånY ˜ø\âŸ_\å±3‚Á\å?\Ş\í³ör\ç,¨\ØG‰úÜƒºS\×{l\ïö•yt…—‘«­ed\ç)\r.\Û}c]cA˜†Áe\çû?a\î±\İk®º\ÇÂ“kuÁ\å6—~\É=ºÍ‚\Ğ\Ô4ñô\ãX»S9\ïñ•± \n,R\ïqı¼\ÍÅº£şaA ÷øóÓõ_ù\ï±\î¨I\ĞK1]\ÚN±`\ZªKoE\ãİ¼5K¨³bq\Ã\Í\ÛE÷O\Ä\Ğ\ß\æ\í‚}ø%+ŞŠ]0ñD ¢\áÀ=×µ\n,·dño\Ê\rX\è¢ûÀ\íu|…ğñ:\á\Ñpkv\á±`qE=º2¶\Óû\Ø¹\Î!°‡«‡Y´j®†—O——S©7½rs\íI\Ä\ß,ö–M\rö\Õƒ6XP“H-¯şJ.İ»À\ÂÀ›e\Ü÷e\ÔÁò¯KuS\Úbñ\æ×ƒ|b%•œ_^\Şg\ïl\Ö\ìÒ¯\Ë5lub;m$pzp<ŸšI\'…ıG\ì\Í[\î;10œJa\ã^>H¬\æW–W÷O°\å¿\rla?<Ÿ\\YF+…Ä£×¯5\í\í#†—\Ë+3‰\Ôaòmr9u˜\Ún›§§«ù\ä\Û\Ó\ÃÃ™••\Ô\Ê\Òg¶\Ş?¢‰ÀƒƒT*y¼Z@«\Éù$\ZHªğX×…¶aÃ‰D!•\Ê\'gğ{yfñ\Ş8d±´Ÿ\Ú?ŸO¢E§òóóù\ÂLªZ)F,¨•\ÄÁK\Ôjª\ïu›Ã\î§\Éc„‘G‹>B$+33)¬Ì£v\í‚-\Î\Ì\Ì$ò‡‰—¿ıöòh¯\×Ul^ñB¡pp”L\Î\Ï£\ë\Ç0¸B+RH¬<h—sz<³rzˆ\Şaœôº†M‹a©•üjş(y<ŸŸI¡qÌ \ÇC—·òĞ\Ş\Z ¾“=\Í–©…\Í$–Ï’÷‡ö0 \æF\"5Ÿ@\èûWVA\ëv^®•>\Ã@2ŸÄ•\ä¿?(\0–\Ğ5¤¨ó\ÇùCôŸ‰Fl)F,\0\Şı<C«\Ëggo[\É;U]pD\0\"‹®xD¿U\Ñ=}\Èó^±\ê\"ò<\È~¯À2\Î\'t.\Â\ãJ´\Ê\Ze\Îû*/\êwˆ\ßTù\ë›gWVNgNOO\ÑkRùƒD\nS-ª–·\Î\Âó,$\Ï\Î^\åOÍ“p|®ü\Äö|A\àÇ½!§—Q²‡§t\æ¼ñ9\âgˆ²0Ë³¸\\ \ì\Ó\İ\ï\Éê¢š<[º~zYº1+\Í{=¿«T*\Ñ.´•™•Ã£³\Ã\Ä\Ì\Ìp\Ó(L\ß+\Åö©\0¶/¤h\ât€óùxÑ™ò\Ù\0sQQ™õ™Š8)\0ñù\\FôMˆšhNĞ¥§\éJ,\ß8\Z–ñX\à\\³\îºLQ›ô9šº \ÓB¿&:¾»0<“wCº\Ì\Â&\ÎŒÕ£ƒ\×n‡\\#»¾„\r\îA³\'\ëµÊ‘\nZ³ X]ò\Ì\ÇÑ‰SØ‚°h\Ú\'c¹dÂ­­B\Ë\İ)º/‚²o\Ò]	º\ër¨!”g@³BJŠAYr\Ñ5-\æ]˜t\'3˜üörù\íò;h\×.†\ÃK	46ñM\à´\Ù\Ür«_–\é£&\áNP†Wg€˜\Ïñ*\ë#¬;¡Cº/\ä\Ö×©_\çø¬T[«\Ë Ì‚k°›8x{JƒöE0ÿ^™I\Ñv’?>H»\'µÛ±‹u=²k1«m’\Å=\â5–¢ºµ…gt\Ï%\ÚF\êY@…Å”¦E„\n‹rË©Hñ\é†\ïYª´±ˆï§’˜aÏ†ÁUl\â…å—«\Çùü\í² æ´´DO\Ä÷\ègS(\èÖ³¨z·	Ÿ©G|“\äTN……Qñ™‚>Ñ˜ôUF”Ôˆ»ø\ëòüÁ)E\í<f\à+4\Íÿş×¶\Û~zÖ‚…xó—ö|şzA\ÜgÎ«4\r•	\×XL±\Ì\n\î*‹gn­c\×Yp Xöe–WÏ–V0\rO$\Ğ\í­%×½\Ém\ïdÜ¿Vz¨“>\á* \å\n½ZŸF,¼½6²\à«KdŸ­‰~Ÿ»Æ‚TV~U´Ï^\Í\ÓD‘öU\Ñ0–\Ï^¾}Wş¢ÁÙŸaÑºÌŠ{¬²ğv˜Æ‘qŸù)Pa¡\Z5:/Åª0¾\Ê\â&\Z\ç¿Q³˜O&WS)Ì‘ß®\×X\0”Ö¶¶>\â\Ñq<½–À\ÔW†\é\İ\éghö\èÊuºG\Õ\ÇT—¥€#\ê\ZN§Cre–ñ²C\"¥„*x¯*ğ·<\Âxyt–L\å‘D2yö7¦\îVöÕ“o\ëo\é8P|a)\è\îò´oÎ²\"x\ĞU\×5\ê>ŸI+À=óy\r\İ+¡œ?P‹˜£\Z›\Ä\\P²\'}7\î±\å}Q)¾rxÅ‚ˆ\Z÷5HÂ©‹cf\n‡˜4ÿ†©’8:\Ü_ª\Ş\Ï\à²Àz²\ëÍ£ó,€H˜*OX\n“\ãã³³³S˜S\ã\ã“X\'](\Ò–?\ÃÚ›\ã\ãS!ˆ\á\Ô9jAdjr|v¶Ã\Âô<\È\É\Ïf\Ç\ç0Xğø=‰QÈ¢+šC[\nÏ¹ëœP\Z\ï\Å0¦Zôô\Ş\Ù\êFô‹\ÕITƒ\æ±\é™\Ç°p7tó¤[­¸Y1\Ø\'Á\à\É\Ö\Ùÿ 	šƒ®T»õ,(ğ\Ì\ãõİ°è¹˜%\Ú1C\Zq\ã»\è\ÊI,~\ÜFê«Œ\æqñe²`\ì¤>D\0iõ‡q`†Á»\ÆÓ€…\ë=¾L°·ÿ&\0Xı¸{•A\â‹ûo\ê\ãH£z,0\×:¥\×‰òuŒ¥=‰¿”*Ÿ„ùšX\0p;\r€{{Z \×\ãµü«aÁ”ÿ¼ñ\î;c`iŸ\Ş\åloÛˆ‰£A\ÛÍ ‰›.ñV\È\ä¢AQ‹F)\È\ËÁ ­\ëA´¨¤\ãœ•\èy  \â\Ğ1-(€4e;µOo\ì#½©^\İbO\ë\Ë{\Äb:¬˜|\æv®š6ë³Š#ú,ö4$Ì¡°k\ëˆ\Ğ\î\íœ>Y4±#b\Zncš-«D|\n\Ä‡·#¢ğ¹\í]\Ñz­S¹^ß½ltˆ…¸€\ÓLˆ^bšö¼ó4\Î8GBˆ\ØË˜£S%\ìx<\ÓpØœ\nƒ9‹‰\è³\Æ\ÇÁ\Â~Œ`·¸õº6\Ó{\íVE\Ã0qO\âˆ¡)¯§FÏ–‡Bs‹©\Ø,Á~\ØX\á¹\ÚKXŸ€i}\Z{±t,¤N\Èv;,nRoX¨ô,õ´Ï¼NCH\Ğ&Dğú\ÜV\Õ*Û…{\âfV¦çºŸÑ®[D…ƒ~\ì\Ñ-¸=QQô\Åø{\Ï\ÆCŠ„O¯›‡‚1\ĞüšNôI\Ï_`+ò\é\"\í¶¹\İtô˜RUŸ©¿ˆÀ´6\í\ëG#Ù§^±\0!db‘h` RT$’$ƒß²xP5	\ãˆ\Ä\ãTÀYh\ë¼$€¦\ä¸c\"]\ØA“$ÿ\ç·×ŒzÅ¢5`QÓ€EM5\rX\Ô4`QS‹,ƒ62`1`\ÑLùBùq§ò\Ãd\àmc\Øò·;\ãM¬=\æM`\İ¨,×¡‡š{À\Â{\î­zö±L¡:^­6©~‘2J\ÆC\î%\Òİ\ß°\n\à_|}…ø^À¢¥ı`p„³{t˜e\é4†¸³0\îgœ.3\î­]†=iá˜Oª\'md}cı|ı\İz\Z˜x:_ô\ÉùúF \ßX_wB+øWf\Åaƒ\Î\Ånœ\ï¥İ©t\Şõõ?NNp\Å5¥„i\á6Ó›Õ›6’†“w\éÀ9\Ù\Û \Ê9Àù9¤	“†s6}?Oc\Ø8d	–\0¤™“\r–9<\ç\Ótü]šC\"\ç\é“=.ğ˜¿²¸.4˜\Û\ïV\Ú»Á¾[§\Çõ$ÀÚ¯\ã\ï\Æ\ŞI|ƒÁcÌ¢É¤ONNö°˜\Ù8YG»8I\Ç\Ù\r¤\Ñr°8Ÿ8m\ïü<g\â2Í°÷•º»8Ã²\Ô%°\îe+–\Ä	Á1¬\Zaq\0\ÜIt?\0KY,Á%p\0ÿ0–\Ğ\É\î4º&ğ&w`·z”_x‘²|%\ÏœP\r\å˜Q\Ş\ËT\âk9Â–WS1POX”S¨T­š^@W\ß\Úto±jQ]rR‰­·\×=\É;95›\Í5º¯¹“\ê\r¢e3¥’™\Éf©qq¡k†z‘\í\È\ÆoT\×Y =kkÅ¬fp÷$›-–ª—ô*Y\æ\ÇGË·O¯}\î¦.\æVÍ¥,Ş¯‰eoW|…™µ«›\r½ 3Z¹«¾H>w·ñ­G÷\ÛÈ«Wg\'\î¬™ñw£Rò!\Ó`\ã\ï\Ş\r½\\\ÆmP\ÙO¸\ì\r726§®³Ÿ¸_\Ôÿ¹\í¿8T=š\ï\×\Z.26ViE™»qİ¥‹\Ìm,£\ë,J\î¡\'¸\Ï\Ù5Z¹Ò¨R\Ù\ã±Ò°&\Æ\ÚV¦B#·¦\Şx\ì!…¿W,2ô\Ğ)\"\ZÆFŒ\ìe\Ñ}U•wÈ‹5÷Y\îÁ»gÀVÉ£1&fª.ƒ©9\Ë½$‘\Í\Ş\Êat7¦€Hm£ôóe1“«‘`Œ]R®!d³\ŞP6S‰\Ú\å–‰¥¡L©\î|G?\éRßª d·2E\î^±`¸R‰\Ç=\æv‹kP®Ñ¥Šx…„ğ/S„\\¹\Ùku\Ç9ó8Gk†p¥{\ÉÃ«l\î_fr ®)\ZûªX\âÈ½b\á\Êõ\Æ\ãò›\ÜŠ8\n\Ü\Ù! [\nS*‡“K±~‘µ5ôB†²J®´¹M¸D€c` ?u\ì6KFÃ5­\îÛ…{¨\Ù\Üc†hD`\î\n¬e¨eÀfJ¯ §¬CŸ%b\ê—{õ2czR\"5\ËÁ%—Å°<”,úuW¹\å\rö]g¡\æ4zÿ\É(¶şr#yş]†¡Yl÷­‚5\ÛTL5•±º\åx’µ[\Ø&Š—B—›9\ÈlB–`LzUrs¸mFİ¾nV¼ ®\è’fœ\Ê?T\ZSk\ÌZ‰{dS‡÷—P\Ä*j´•p›u7\Ü\ÑL†\Ğ,.1x~+\ÂZ	D\Õx‚Æ“!\ØôsX–¹]µ\Û,v\é¡#—^yS\Ü$™Rƒ\0›yb\ä2Ec3£]\ä\ÜÇ‰.rµ®Šú0d“d3—À•6‰S\Ì!\í‚\Ë~3ù‡’[Sr·¼W©Uo·9È\år%Lµ½Xyù!s\Õ#\\)sY,5c@)§•ŠY\Å\rš\ä²òL+)	.’+*€\à0\Ö£DA\ápf˜µh\ÅÜ­²‹®³`€\ã³u\ÑÁŸ-GÁ1\× Ÿd2ï³ª&f‹EñúÄ«»,*W\È\ê\ãƒ;\Â=Lƒ>Îªøy¿r\åzS·\\G\Õ\âı\à·n#®U¬\â\'\èx\Å¨7,®\éR\åJw³\æ\Ô\',F\Ù\Ûu%:¢ş`Á¬o—&uDıÁS\î>x\Ãt°h\í•	w¥ş`\Ñ\ê4o>OœŒ~¿—7¨F\İs\ÚXö©Ç¹	/\ZP9ù-–s0\çó—ŠxºN¹\í\çÁ;\Í\"Fbœ736_– \ÒQIv@¡\ãô­>D÷ƒ¦By6‚¿ô‡€®¸eªf\É<„\rw^I\èTp\'rD\ÂR\ÎôÁ¸²ƒ¦†+	pp>œ\ì\ç\Ê+7\ÜñO‚³°\ÌiÅ¶œ°%G‚–,\éZX\çmS$\Ó|8\ä\×C¨–LŸ.ùPÌ”-3\æLGmKÙ¶$Ee\ÉQ[—\Ã<¶Œ\ÆT˜­\Z³Àt,5b†\Õ®A\r913&˜–m\ÛbjTˆ1=\â#\"Xz0*CÁ˜‘BQ0%]µÄ¨ƒI!\ŞÒ»\Ç\"!^·yÁšJ˜ª%(R \ÌË¶*\è!°ƒf˜š¥š?	É¶Ì…A2M-H,S\Ş\n\ëªc\É2XF(„m\ÉuÓ”D´&a\İ\Å¢’c„¢ª-¨\á`\Ä\Å4SÕ£ş 	8búc¢e\ê‚\Âv\ÑË‘IL]3\ÃN\ì\æK(f!2Ç‹b”Y\Ã!^•ı\n\Z¼ûB=U\åE\ĞdQ“UMUñTBE\ÖT\ÑÀ¹\rÀQNó\Ë~x\Ç\à¼ªj†,‚*Êªd\â~8\\H& i\"\Z\ç™Wq‹¼†N…—\r¿´m[‘\ÙÀ\í\Ãs²¦8tS\n/6|	Ù°ğ\Ä\×?<K>a–\í‹?1\ÑüĞ²\íöù‹~VY\è\×\ŞG\'³U÷\ÌEƒxª4|!\Îm\ÔcQ…pØ¦	G_’#r\nG½a\Ğwr\n-\åxˆ¢ğ8`~\â\Ìøƒƒ\nX\èÈŸ\ßLsº‘\ÅRC\Ãfa†Œ\é˜‘¦e‚\â¸\áKZdƒ§%\Ùt°,\Çù¥\Ø4§šaÉ±l\Ã\Òmƒ	\Ât$,w\Ï\âùK\ìİ³Zşj\êF„·\ÑF\"!\";A>¢@,‚yd\é&`xŠ1ÁFa\É\â‘C:FD0-\Õ	™k+7²yşü\é7\ì]³P°Yh ’¶NÑˆb‚¦\Ö\Ç\rüÄ”\ÄQhÚˆC\âpf\"*n¿r«{.\êu3\Ôó‘»eQ©@\Ùû&z}\Õj„6:ô„rc}’\Òxş\İpXô‡nfñ¢B\ãÇ‡_;‹\ê?h|ñüÏ‹„ş\×høZYüPû¿ò¿ \ãH¾b»\Øú\ß\ïwFª@\Ğq,1\ÌW\Êbtt{÷Ÿ\ß\ï\ìTÿ•\éó§ğµ\Ú\Å\Ğ\è\Ğ\Ğ\ë\í\é\Õş\É\íS`¿VT££¯úá—\n‹¯µT^ğ:\ê:úo,\Æ\ë\íşÇ€…«\×?ÿ\ë\Åÿ0”\ÆöO\ØEµ©lXTY\Ğü,,\Z²¸_ÿı°5\rX\Ô4`QÓ€EMa¡m\ë6‰¿}i\×W\×\Ü-t|ûjp#ñ \ÔtW,H\İg¨©\é<É½Áwı@„€e(\áú\ê\Ôi?’üø½Ø²\ÎWŠ5\Ö\Ì¥;`¡H~=ª„l#¨Kô~-\İ\âlY²\å¨_’e)¬\ï\à‚±€\èAÅ¶\ÅhP–ƒj\Ğ\Ñ9¨„mSy[¶\å fÛŸ¼\Şx,lÁŒ‰:\Ã\Í\ÚB\Ø4y\" šV\ì\Ä>»–EB\Ôƒ‘lbGÀ²\0·\Æ\ë‚%Ú¢lBX•c¶ ü©•t…\É²$\Ñ\×\ZK~\Ó QU‹*’hr¼ÀK¦lš¢tó]B\íK¦\ïJV¢†`*¦_%dÇ¯¸A^\Öe]\Òp\ëJ”kü\Ê\Zô\Íj\Z°¨iÀ¢¦‹šygM5\rX\Ô4`QÓ€EM5\rX\Ô4`QSk,˜‹\Z‹À|¹ú.\Ğ\np\ß\Çú\åª%_¾,jj\Ş_tN½®óM\ê‹~…\Ñ‹¡\Ñoû¸c\Ú-qLƒ\íö£\Z°\è°v·^ip/p\Ü=jhk9\æ\Ğ\è\n‹¡Ñ­1ô=n°pyl–Œ>§\Ñ-ô¶\âÇ¯Døø™\Ç~R÷X v\Ñqô±\í*\ÚTdú\Öqt™¥±[\ìS\Ç\Ñu¨\İ\Çb£¼¯\×\êt£4\ã\è;=aAd\Ú\Ú\ì;\Ç\Ñ#\Ç\ÖV\Ñ\è«\Û;C4Æ¢\ãèŸ¦\ÒK£”Æ‡l\ß8Ú…dk(CØ¾h+=g\Ú\Úz¯ôƒmô7\ãP{Ÿœ÷zc,\Ûkÿ\ç^\å¬÷¬\nh\0\0\0\0IEND®B`‚','Robert Roy','19782360024V','first@gmail.com','07772655398','$2b$10$DPXFwJXkcaj8/O66LPyWbOTj2GqCu51cS.F.oWJo6MFXdwwIaPAA6','accepted','2025-01-09 09:25:30',1);
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
