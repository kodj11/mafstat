-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: mafia
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `additional_points`
--

DROP TABLE IF EXISTS `additional_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `additional_points` (
  `point_id` int NOT NULL AUTO_INCREMENT,
  `game_player_id` int DEFAULT NULL,
  `points` float NOT NULL,
  PRIMARY KEY (`point_id`),
  KEY `game_player_id` (`game_player_id`),
  CONSTRAINT `additional_points_ibfk_1` FOREIGN KEY (`game_player_id`) REFERENCES `game_players` (`game_player_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `additional_points`
--

LOCK TABLES `additional_points` WRITE;
/*!40000 ALTER TABLE `additional_points` DISABLE KEYS */;
INSERT INTO `additional_points` VALUES (6,45,0.4),(7,50,0.3),(8,55,0.2),(9,60,0.3),(10,61,0.3),(11,66,0.3),(12,71,0.1),(13,73,-0.4),(14,78,0.1),(15,79,0.4),(27,104,0.3),(28,105,-0.5),(29,106,0.25),(30,109,0.2),(31,112,0.2),(32,113,0.2),(33,124,0.5),(37,139,0.2),(38,140,0.2),(39,143,0.1);
/*!40000 ALTER TABLE `additional_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `best_move`
--

DROP TABLE IF EXISTS `best_move`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `best_move` (
  `best_move_id` int NOT NULL AUTO_INCREMENT COMMENT 'ключ таблицы',
  `killed_first_id` int DEFAULT NULL COMMENT 'ключ таблицы killed_first',
  `user_id` int DEFAULT NULL COMMENT 'записаный игрок',
  PRIMARY KEY (`best_move_id`),
  KEY `killed_first_id` (`killed_first_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `best_move_ibfk_1` FOREIGN KEY (`killed_first_id`) REFERENCES `killed_first` (`killed_first_id`) ON DELETE CASCADE,
  CONSTRAINT `best_move_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `best_move`
--

LOCK TABLES `best_move` WRITE;
/*!40000 ALTER TABLE `best_move` DISABLE KEYS */;
INSERT INTO `best_move` VALUES (10,17,18),(11,17,21),(12,17,26),(13,18,19),(14,18,14),(15,18,29),(16,19,21),(17,19,18),(18,19,22),(22,20,18),(23,20,19),(24,20,21);
/*!40000 ALTER TABLE `best_move` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `game_players`
--

DROP TABLE IF EXISTS `game_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_players` (
  `game_player_id` int NOT NULL AUTO_INCREMENT,
  `game_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `role` enum('peaceful','mafia','don','sheriff','lead') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`game_player_id`),
  KEY `game_id` (`game_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `game_players_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE CASCADE,
  CONSTRAINT `game_players_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_players`
--

LOCK TABLES `game_players` WRITE;
/*!40000 ALTER TABLE `game_players` DISABLE KEYS */;
INSERT INTO `game_players` VALUES (38,8,13,'peaceful'),(39,8,16,'sheriff'),(40,8,17,'mafia'),(41,8,23,'mafia'),(42,8,24,'peaceful'),(43,8,26,'peaceful'),(44,8,27,'peaceful'),(45,8,29,'don'),(46,8,30,'peaceful'),(47,8,35,'peaceful'),(48,8,36,'lead'),(49,9,14,'mafia'),(50,9,13,'peaceful'),(51,9,18,'sheriff'),(52,9,19,'peaceful'),(53,9,20,'mafia'),(54,9,21,'peaceful'),(55,9,24,'peaceful'),(56,9,26,'peaceful'),(57,9,29,'peaceful'),(58,9,34,'don'),(59,9,36,'lead'),(60,10,13,'mafia'),(61,10,20,'mafia'),(62,10,21,'peaceful'),(63,10,22,'sheriff'),(64,10,24,'peaceful'),(65,10,26,'peaceful'),(66,10,29,'don'),(67,10,32,'peaceful'),(68,10,33,'peaceful'),(69,10,34,'peaceful'),(70,10,36,'lead'),(71,11,18,'mafia'),(72,11,19,'peaceful'),(73,11,21,'sheriff'),(74,11,24,'peaceful'),(75,11,25,'peaceful'),(76,11,26,'peaceful'),(77,11,31,'peaceful'),(78,11,32,'mafia'),(79,11,33,'don'),(80,11,34,'peaceful'),(81,11,36,'lead'),(104,23,13,'peaceful'),(105,23,18,'mafia'),(106,23,19,'peaceful'),(107,23,20,'peaceful'),(108,23,21,'peaceful'),(109,23,22,'sheriff'),(110,23,25,'mafia'),(111,23,26,'don'),(112,23,31,'peaceful'),(113,23,33,'peaceful'),(114,23,36,'lead'),(115,24,13,'peaceful'),(116,24,34,'peaceful'),(117,24,28,'peaceful'),(118,24,19,'mafia'),(119,24,14,'don'),(120,24,29,'mafia'),(121,24,36,'peaceful'),(122,24,20,'sheriff'),(123,24,17,'peaceful'),(124,24,16,'peaceful'),(125,25,21,'peaceful'),(126,25,18,'peaceful'),(127,25,22,'peaceful'),(128,25,24,'peaceful'),(129,25,23,'peaceful'),(130,25,26,'peaceful'),(131,25,31,'mafia'),(132,25,30,'sheriff'),(133,25,34,'don'),(134,25,19,'mafia'),(135,26,21,'sheriff'),(136,26,18,'mafia'),(137,26,22,'peaceful'),(138,26,24,'don'),(139,26,23,'peaceful'),(140,26,26,'peaceful'),(141,26,31,'peaceful'),(142,26,30,'peaceful'),(143,26,34,'peaceful'),(144,26,19,'mafia');
/*!40000 ALTER TABLE `game_players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `game_id` int NOT NULL AUTO_INCREMENT,
  `game_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `winner` enum('mafia','peaceful') COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_number` smallint unsigned NOT NULL DEFAULT '1' COMMENT 'Номер стола игры',
  `game_number` smallint unsigned NOT NULL DEFAULT '1' COMMENT 'Номер игры вечера за столом',
  PRIMARY KEY (`game_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (8,'2025-04-29 18:30:00','mafia',1,1),(9,'2025-04-29 18:30:00','peaceful',1,2),(10,'2025-04-29 18:30:00','mafia',1,3),(11,'2025-04-29 18:30:00','mafia',1,4),(12,'2025-04-29 18:30:00','peaceful',1,5),(13,'2025-04-29 18:30:00','peaceful',1,6),(14,'2025-04-29 18:30:00','mafia',1,7),(15,'2025-04-29 18:30:00','peaceful',2,1),(16,'2025-04-29 18:30:00','peaceful',2,2),(17,'2025-04-29 18:30:00','mafia',2,3),(18,'2025-04-29 18:30:00','mafia',2,4),(23,'2025-04-29 18:30:00','peaceful',1,1),(24,'2025-05-28 09:40:00','peaceful',1,1),(25,'2025-05-28 09:46:00','mafia',1,2),(26,'2025-05-28 09:47:00','peaceful',1,3);
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `killed_first`
--

DROP TABLE IF EXISTS `killed_first`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `killed_first` (
  `killed_first_id` int NOT NULL AUTO_INCREMENT COMMENT 'ключ таблицы',
  `game_id` int NOT NULL COMMENT 'id связяной игры',
  `user_id` int DEFAULT NULL COMMENT 'id убитого игрока',
  PRIMARY KEY (`killed_first_id`),
  KEY `game_id` (`game_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `killed_first_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`) ON DELETE CASCADE,
  CONSTRAINT `killed_first_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `killed_first`
--

LOCK TABLES `killed_first` WRITE;
/*!40000 ALTER TABLE `killed_first` DISABLE KEYS */;
INSERT INTO `killed_first` VALUES (4,8,13),(5,9,19),(6,10,22),(7,11,21),(8,12,19),(9,13,1),(10,14,1),(11,15,21),(12,16,22),(13,17,19),(14,18,21),(17,23,19),(18,24,16),(19,25,23),(20,26,21);
/*!40000 ALTER TABLE `killed_first` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `profile_id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'уникальный id profiles',
  `user_id` int NOT NULL COMMENT 'id пользователя профиля',
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Статус в профиле игрока',
  `geolocation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Россия' COMMENT 'Место проживания указанное пользователем',
  `is_open_profile` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Открытый или закрытый профиль пользователя для неавторизованных пользователей',
  `avatar` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'https://github.com/shadcn.png' COMMENT 'Ссылка на аватарку пользователя',
  `contact_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Контактная почта пользователя в профиле',
  `is_online` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Онлайн пользователь или нет',
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `profiles_unique` (`user_id`),
  CONSTRAINT `profiles_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица с данными профилей пользователей';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES (1,13,'Студент, админ, игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(2,34,'Студент, админ, игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(3,1,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(4,2,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(5,3,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(6,4,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(7,5,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(8,6,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(9,7,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(10,8,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(11,9,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(13,18,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(14,11,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(15,12,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(16,14,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(17,15,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(18,16,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(19,17,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(20,19,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(21,20,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(23,29,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(24,22,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(25,23,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(26,24,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(27,25,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(28,26,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(29,27,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(30,28,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0),(31,21,'Игрок','\'Россия, Сыктывкар\'',0,'https://github.com/shadcn.png','\'remoteforsli@gmail.com\'',0);
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_open_reg` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Доступна ли регистрация сейчас на сайте',
  `pin` varchar(100) DEFAULT NULL COMMENT 'пинкод от админ панели',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,1,'$2b$12$D8mIeoDSi8bsYj94h3MOheEEM3HPNUelvRQ7z2zWQCCFpSXLIkQo2');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `login` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jwt` varchar(511) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'user1','User One','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt1',0,'2025-02-20 17:40:52'),(2,'user2','User Two','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt2',1,'2025-02-20 17:40:52'),(3,'user3','User Three','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt3',0,'2025-02-20 17:40:52'),(4,'user4','User 5','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt4',0,'2025-02-20 17:40:52'),(5,'user5','User 7','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt5',0,'2025-02-20 17:40:52'),(6,'user6','User 6','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt6',0,'2025-02-20 17:40:52'),(7,'user7','User 8','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt7',0,'2025-02-20 17:40:52'),(8,'user8','User 9','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt8',0,'2025-02-20 17:40:52'),(9,'user9','User 10','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt9',0,'2025-02-20 17:40:52'),(10,'user10','User 11','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt10',0,'2025-02-20 17:40:52'),(11,'user11','User 12','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt11',0,'2025-02-20 17:40:52'),(12,'user12','User 13','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','jwt12',0,'2025-02-20 17:40:52'),(13,'moxa@mail.ru','мохомор','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ilx1MDQzY1x1MDQzZVx1MDQ0NVx1MDQzZVx1MDQzY1x1MDQzZVx1MDQ0MCIsInBhc3N3b3JkIjoiMTEyMlx1MDQzY1x1MDQzZVx1MDQ0NVx1MDQzMCIsImV4cCI6MTc0OTIyMjA1NywiZGV2aWNlX2lkIjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzNy4wLjAuMCBTYWZhcmkvNTM3LjM2In0.M6mtTpcRoO1jzfkjvvVLLyqPQCIdll1OsJXU5IVAiTw',1,'2025-05-04 13:07:36'),(14,'moxa1@mail.ru','Lady di','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(15,'moxa2@mail.ru','Ежик','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(16,'moxa3@mail.ru','Барракуда','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(17,'moxa4@mail.ru','Net_ruki','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(18,'moxa5@mail.ru','Pel','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(19,'moxa6@mail.ru','Вард','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(20,'moxa7@mail.ru','Сильвия','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(21,'moxa8@mail.ru','Drive','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(22,'moxa9@mail.ru','Артемида','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(23,'moxa10@mail.ru','Тихий дон','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(24,'moxa11@mail.ru','Snek','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(25,'moxa12@mail.ru','Вечеринка','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(26,'moxa13@mail.ru','Red','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(27,'moxa14@mail.ru','Док Браун','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(28,'moxa15@mail.ru','Пли','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(29,'moxa16@mail.ru','Hope','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(30,'moxa17@mail.ru','Алекса','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(31,'moxa18@mail.ru','Наблюдатель','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(32,'moxa19@mail.ru','Фантом','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(33,'moxa20@mail.ru','Бука','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(34,'moxa21@mail.ru','Самолет','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ilx1MDQyMVx1MDQzMFx1MDQzY1x1MDQzZVx1MDQzYlx1MDQzNVx1MDQ0MiIsInBhc3N3b3JkIjoiMTEyMlx1MDQzY1x1MDQzZVx1MDQ0NVx1MDQzMCIsImV4cCI6MTc0Nzk1MzU1MCwiZGV2aWNlX2lkIjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzNC4wLjAuMCBZYUJyb3dzZXIvMjUuNC4wLjAgU2FmYXJpLzUzNy4zNiJ9.HAE1dKcOcWK32Gke6cvwOPptVYn3WPUv3M09tpktkEg',1,'2025-05-04 13:07:36'),(35,'moxa22@mail.ru','Сосед','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36'),(36,'moxa23@mail.ru','Кристи','$2b$12$MTK3H5wAJeIa3y4BPoCynuBxdS0tA.MvaRYh2lQL0BO9uEZrrq4C.','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1veGFAbWFpbC5ydSIsInVzZXJuYW1lIjoiXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIiwicGFzc3dvcmQiOiIxMTIyXHUwNDNjXHUwNDNlXHUwNDQ1XHUwNDMwIn0.Zrkw_fpArvj1IvFqiVZ8fUIa5eS-5rLMyU8_OM2QPk0',1,'2025-05-04 13:07:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'mafia'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-17  5:10:23
