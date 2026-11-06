-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: web_absen_smpn2_soreang
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.4

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
-- Table structure for table `absen_guru`
--

DROP TABLE IF EXISTS `absen_guru`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `absen_guru` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sesi_id` bigint unsigned NOT NULL,
  `guru_id` bigint unsigned NOT NULL,
  `waktu` datetime NOT NULL,
  `waktu_ambil` datetime DEFAULT NULL,
  `foto_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'live',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tepat waktu',
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diverifikasi_oleh` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `absen_guru_sesi_id_guru_id_unique` (`sesi_id`,`guru_id`),
  KEY `absen_guru_guru_id_foreign` (`guru_id`),
  KEY `absen_guru_diverifikasi_oleh_foreign` (`diverifikasi_oleh`),
  CONSTRAINT `absen_guru_diverifikasi_oleh_foreign` FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `absen_guru_guru_id_foreign` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `absen_guru_sesi_id_foreign` FOREIGN KEY (`sesi_id`) REFERENCES `sesi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `absen_guru`
--

LOCK TABLES `absen_guru` WRITE;
/*!40000 ALTER TABLE `absen_guru` DISABLE KEYS */;
/*!40000 ALTER TABLE `absen_guru` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `absen_harian`
--

DROP TABLE IF EXISTS `absen_harian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `absen_harian` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `waktu_masuk` datetime NOT NULL,
  `waktu_pulang` datetime DEFAULT NULL,
  `waktu_ambil` datetime DEFAULT NULL,
  `foto_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'live',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tepat waktu',
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `absen_harian_user_id_tanggal_unique` (`user_id`,`tanggal`),
  CONSTRAINT `absen_harian_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `absen_harian`
--

LOCK TABLES `absen_harian` WRITE;
/*!40000 ALTER TABLE `absen_harian` DISABLE KEYS */;
/*!40000 ALTER TABLE `absen_harian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `absen_siswa`
--

DROP TABLE IF EXISTS `absen_siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `absen_siswa` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sesi_id` bigint unsigned NOT NULL,
  `siswa_id` bigint unsigned NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bukti_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dicatat_oleh` bigint unsigned DEFAULT NULL,
  `waktu` datetime NOT NULL,
  `status_konfirmasi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tidak perlu',
  `konfirmasi_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_berlaku_sampai` datetime DEFAULT NULL,
  `bukti_diunggah_pada` datetime DEFAULT NULL,
  `keterangan_konfirmasi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `absen_siswa_sesi_id_siswa_id_unique` (`sesi_id`,`siswa_id`),
  UNIQUE KEY `absen_siswa_konfirmasi_token_unique` (`konfirmasi_token`),
  KEY `absen_siswa_siswa_id_foreign` (`siswa_id`),
  KEY `absen_siswa_dicatat_oleh_foreign` (`dicatat_oleh`),
  CONSTRAINT `absen_siswa_dicatat_oleh_foreign` FOREIGN KEY (`dicatat_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `absen_siswa_sesi_id_foreign` FOREIGN KEY (`sesi_id`) REFERENCES `sesi` (`id`) ON DELETE CASCADE,
  CONSTRAINT `absen_siswa_siswa_id_foreign` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `absen_siswa`
--

LOCK TABLES `absen_siswa` WRITE;
/*!40000 ALTER TABLE `absen_siswa` DISABLE KEYS */;
/*!40000 ALTER TABLE `absen_siswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `aksi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entitas` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entitas_id` bigint unsigned DEFAULT NULL,
  `data_lama` json DEFAULT NULL,
  `data_baru` json DEFAULT NULL,
  `waktu` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_log_user_id_foreign` (`user_id`),
  CONSTRAINT `audit_log_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guru_piket`
--

DROP TABLE IF EXISTS `guru_piket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guru_piket` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `hari` int NOT NULL,
  `tahun_ajaran_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guru_piket_user_id_hari_tahun_ajaran_id_unique` (`user_id`,`hari`,`tahun_ajaran_id`),
  KEY `guru_piket_tahun_ajaran_id_foreign` (`tahun_ajaran_id`),
  CONSTRAINT `guru_piket_tahun_ajaran_id_foreign` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `guru_piket_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guru_piket`
--

LOCK TABLES `guru_piket` WRITE;
/*!40000 ALTER TABLE `guru_piket` DISABLE KEYS */;
/*!40000 ALTER TABLE `guru_piket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hari_libur`
--

DROP TABLE IF EXISTS `hari_libur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hari_libur` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tanggal` date NOT NULL,
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hari_libur_tanggal_unique` (`tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hari_libur`
--

LOCK TABLES `hari_libur` WRITE;
/*!40000 ALTER TABLE `hari_libur` DISABLE KEYS */;
/*!40000 ALTER TABLE `hari_libur` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jadwal_slot`
--

DROP TABLE IF EXISTS `jadwal_slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jadwal_slot` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `versi_id` bigint unsigned NOT NULL,
  `hari` int NOT NULL,
  `jam_pelajaran_id` bigint unsigned NOT NULL,
  `kelas_id` bigint unsigned NOT NULL,
  `mapel_id` bigint unsigned NOT NULL,
  `guru_id` bigint unsigned DEFAULT NULL,
  `durasi` tinyint unsigned NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jadwal_slot_versi_id_hari_jam_pelajaran_id_kelas_id_unique` (`versi_id`,`hari`,`jam_pelajaran_id`,`kelas_id`),
  KEY `jadwal_slot_jam_pelajaran_id_foreign` (`jam_pelajaran_id`),
  KEY `jadwal_slot_kelas_id_foreign` (`kelas_id`),
  KEY `jadwal_slot_mapel_id_foreign` (`mapel_id`),
  KEY `jadwal_slot_guru_id_foreign` (`guru_id`),
  CONSTRAINT `jadwal_slot_guru_id_foreign` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `jadwal_slot_jam_pelajaran_id_foreign` FOREIGN KEY (`jam_pelajaran_id`) REFERENCES `jam_pelajaran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `jadwal_slot_kelas_id_foreign` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `jadwal_slot_mapel_id_foreign` FOREIGN KEY (`mapel_id`) REFERENCES `mapel` (`id`) ON DELETE CASCADE,
  CONSTRAINT `jadwal_slot_versi_id_foreign` FOREIGN KEY (`versi_id`) REFERENCES `jadwal_versi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jadwal_slot`
--

LOCK TABLES `jadwal_slot` WRITE;
/*!40000 ALTER TABLE `jadwal_slot` DISABLE KEYS */;
INSERT INTO `jadwal_slot` VALUES (4,3,1,3,1,3,6,1,'2026-11-03 03:41:48','2026-11-03 03:41:48'),(5,3,1,6,1,4,2,1,'2026-11-03 03:42:00','2026-11-03 23:52:38'),(7,3,2,4,1,3,6,1,'2026-11-03 03:42:23','2026-11-03 23:52:58'),(8,3,2,6,1,1,6,1,'2026-11-03 03:43:52','2026-11-03 03:43:52'),(9,3,2,5,1,3,6,1,'2026-11-03 23:53:31','2026-11-03 23:53:31'),(10,3,2,8,1,2,2,1,'2026-11-03 23:55:10','2026-11-03 23:55:42'),(11,5,1,4,1,1,6,1,'2026-11-03 23:58:07','2026-11-03 23:58:07'),(12,5,2,4,1,4,6,1,'2026-11-04 00:08:18','2026-11-04 00:08:18'),(13,3,1,2,1,2,6,1,'2026-11-04 00:09:25','2026-11-04 00:09:25'),(14,5,2,2,1,4,6,1,'2026-11-04 00:44:37','2026-11-04 00:44:37'),(15,6,1,14,1,1,6,1,'2026-11-04 03:22:33','2026-11-04 03:22:33'),(16,6,1,4,1,1,6,1,'2026-11-04 03:22:47','2026-11-04 03:22:47'),(18,5,1,3,1,2,6,1,'2026-11-04 05:16:20','2026-11-04 05:16:20'),(20,5,3,3,1,2,2,1,'2026-11-04 10:32:30','2026-11-04 10:32:30'),(21,5,4,32,1,4,2,3,'2026-11-04 10:49:42','2026-11-04 10:49:42'),(22,5,4,33,1,4,2,1,'2026-11-04 10:49:42','2026-11-04 10:49:42'),(23,5,4,34,1,4,2,1,'2026-11-04 10:49:42','2026-11-04 10:49:42'),(28,5,3,22,1,4,6,2,'2026-11-04 17:30:42','2026-11-04 17:30:42'),(29,5,3,23,1,4,6,1,'2026-11-04 17:30:42','2026-11-04 17:30:42');
/*!40000 ALTER TABLE `jadwal_slot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jadwal_versi`
--

DROP TABLE IF EXISTS `jadwal_versi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jadwal_versi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `berlaku_mulai` date NOT NULL,
  `berlaku_sampai` date NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draf',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jadwal_versi`
--

LOCK TABLES `jadwal_versi` WRITE;
/*!40000 ALTER TABLE `jadwal_versi` DISABLE KEYS */;
INSERT INTO `jadwal_versi` VALUES (3,'sssss','2026-11-02','2026-11-30','aktif','2026-11-02 06:23:50','2026-11-02 06:24:01'),(5,'jadwal semeter genap','2026-11-02','2026-11-04','draf','2026-11-02 06:50:41','2026-11-02 06:50:41'),(6,'jadwal semeter ganjil','2026-11-03','2026-11-30','draf','2026-11-02 07:06:57','2026-11-02 07:06:57');
/*!40000 ALTER TABLE `jadwal_versi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jam_pelajaran`
--

DROP TABLE IF EXISTS `jam_pelajaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jam_pelajaran` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `jam_ke` int NOT NULL,
  `sesi` enum('pagi','siang') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pagi',
  `hari` tinyint unsigned NOT NULL DEFAULT '1',
  `mulai` time NOT NULL,
  `selesai` time NOT NULL,
  `jenis_kegiatan` enum('kbm','upacara','mengaji','dhuha','istirahat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'kbm',
  `kelompok_hari` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jam_pelajaran_sesi_hari_jam_ke_unique` (`sesi`,`hari`,`jam_ke`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jam_pelajaran`
--

LOCK TABLES `jam_pelajaran` WRITE;
/*!40000 ALTER TABLE `jam_pelajaran` DISABLE KEYS */;
INSERT INTO `jam_pelajaran` VALUES (1,1,'pagi',1,'06:30:00','06:55:00','upacara',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(2,2,'pagi',1,'06:55:00','07:20:00','upacara',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(3,3,'pagi',1,'07:20:00','07:50:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(4,4,'pagi',1,'07:50:00','08:20:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(5,5,'pagi',1,'08:20:00','08:50:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(6,6,'pagi',1,'08:50:00','09:15:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(7,7,'pagi',1,'09:15:00','09:45:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(8,8,'pagi',1,'09:45:00','10:15:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(9,9,'pagi',1,'10:15:00','10:45:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(10,10,'pagi',1,'10:45:00','11:15:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(11,11,'pagi',1,'11:15:00','11:45:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(12,1,'pagi',2,'06:30:00','07:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(13,2,'pagi',2,'07:00:00','07:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(14,3,'pagi',2,'07:30:00','08:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(15,4,'pagi',2,'08:00:00','08:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(16,5,'pagi',2,'08:30:00','09:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(17,6,'pagi',2,'09:00:00','09:25:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(18,7,'pagi',2,'09:25:00','09:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(19,8,'pagi',2,'09:55:00','10:25:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(20,9,'pagi',2,'10:25:00','10:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(21,10,'pagi',2,'10:55:00','11:25:00','mengaji',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(22,1,'pagi',3,'06:30:00','07:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(23,2,'pagi',3,'07:00:00','07:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(24,3,'pagi',3,'07:30:00','08:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(25,4,'pagi',3,'08:00:00','08:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(26,5,'pagi',3,'08:30:00','09:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(27,6,'pagi',3,'09:00:00','09:25:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(28,7,'pagi',3,'09:25:00','09:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(29,8,'pagi',3,'09:55:00','10:25:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(30,9,'pagi',3,'10:25:00','10:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(31,10,'pagi',3,'10:55:00','11:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(32,1,'pagi',4,'06:30:00','07:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(33,2,'pagi',4,'07:00:00','07:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(34,3,'pagi',4,'07:30:00','08:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(35,4,'pagi',4,'08:00:00','08:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(36,5,'pagi',4,'08:30:00','09:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(37,6,'pagi',4,'09:00:00','09:25:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(38,7,'pagi',4,'09:25:00','09:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(39,8,'pagi',4,'09:55:00','10:25:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(40,9,'pagi',4,'10:25:00','10:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(41,10,'pagi',4,'10:55:00','11:25:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(42,1,'pagi',5,'06:30:00','07:00:00','dhuha',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(43,2,'pagi',5,'07:00:00','07:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(44,3,'pagi',5,'07:30:00','08:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(45,4,'pagi',5,'08:00:00','08:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(46,5,'pagi',5,'08:30:00','09:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(47,6,'pagi',5,'09:00:00','09:25:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(48,7,'pagi',5,'09:25:00','09:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(49,8,'pagi',5,'09:55:00','10:25:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(50,9,'pagi',5,'10:25:00','10:55:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(51,1,'siang',1,'12:05:00','12:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(52,2,'siang',1,'12:35:00','13:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(53,3,'siang',1,'13:05:00','13:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(54,4,'siang',1,'13:35:00','14:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(55,5,'siang',1,'14:05:00','14:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(56,6,'siang',1,'14:35:00','15:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(57,7,'siang',1,'15:05:00','15:30:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(58,8,'siang',1,'15:30:00','16:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(59,9,'siang',1,'16:00:00','16:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(60,10,'siang',1,'16:30:00','17:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(61,1,'siang',2,'12:05:00','12:35:00','mengaji',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(62,2,'siang',2,'12:35:00','13:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(63,3,'siang',2,'13:05:00','13:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(64,4,'siang',2,'13:35:00','14:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(65,5,'siang',2,'14:05:00','14:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(66,6,'siang',2,'14:35:00','15:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(67,7,'siang',2,'15:05:00','15:30:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(68,8,'siang',2,'15:30:00','16:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(69,9,'siang',2,'16:00:00','16:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(70,10,'siang',2,'16:30:00','17:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(71,1,'siang',3,'12:35:00','13:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(72,2,'siang',3,'13:05:00','13:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(73,3,'siang',3,'13:35:00','14:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(74,4,'siang',3,'14:05:00','14:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(75,5,'siang',3,'14:35:00','15:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(76,6,'siang',3,'15:05:00','15:30:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(77,7,'siang',3,'15:30:00','16:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(78,8,'siang',3,'16:00:00','16:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(79,9,'siang',3,'16:30:00','17:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(80,1,'siang',4,'12:35:00','13:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(81,2,'siang',4,'13:05:00','13:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(82,3,'siang',4,'13:35:00','14:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(83,4,'siang',4,'14:05:00','14:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(84,5,'siang',4,'14:35:00','15:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(85,6,'siang',4,'15:05:00','15:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(86,7,'siang',4,'15:30:00','16:00:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(87,8,'siang',4,'16:00:00','16:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(88,9,'siang',4,'16:30:00','17:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(89,1,'siang',5,'12:05:00','12:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(90,2,'siang',5,'12:35:00','13:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(91,3,'siang',5,'13:05:00','13:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(92,4,'siang',5,'13:35:00','14:05:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(93,5,'siang',5,'14:05:00','14:35:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(94,6,'siang',5,'14:35:00','15:00:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(95,7,'siang',5,'15:00:00','15:30:00','istirahat',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(96,8,'siang',5,'15:30:00','16:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(97,9,'siang',5,'16:00:00','16:30:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40'),(98,10,'siang',5,'16:30:00','17:00:00','kbm',NULL,'2026-11-03 01:26:40','2026-11-03 01:26:40');
/*!40000 ALTER TABLE `jam_pelajaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kelas`
--

DROP TABLE IF EXISTS `kelas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kelas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tingkat` int NOT NULL,
  `tahun_ajaran_id` bigint unsigned NOT NULL,
  `wali_kelas_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `kelas_tahun_ajaran_id_foreign` (`tahun_ajaran_id`),
  KEY `kelas_wali_kelas_id_foreign` (`wali_kelas_id`),
  CONSTRAINT `kelas_tahun_ajaran_id_foreign` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kelas_wali_kelas_id_foreign` FOREIGN KEY (`wali_kelas_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kelas`
--

LOCK TABLES `kelas` WRITE;
/*!40000 ALTER TABLE `kelas` DISABLE KEYS */;
INSERT INTO `kelas` VALUES (1,'7y',7,1,5,'2026-11-02 07:09:00','2026-11-02 07:09:00'),(2,'8C',8,1,NULL,'2026-11-02 16:36:53','2026-11-02 16:36:53'),(3,'9D',9,1,NULL,'2026-11-02 16:37:03','2026-11-02 16:37:03');
/*!40000 ALTER TABLE `kelas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kode_pengganti`
--

DROP TABLE IF EXISTS `kode_pengganti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kode_pengganti` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sesi_id` bigint unsigned NOT NULL,
  `kode` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dibuat_oleh` bigint unsigned NOT NULL,
  `diklaim_oleh` bigint unsigned DEFAULT NULL,
  `berlaku_sampai` datetime NOT NULL,
  `diklaim_pada` datetime DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_pengganti_kode_unique` (`kode`),
  KEY `kode_pengganti_sesi_id_foreign` (`sesi_id`),
  KEY `kode_pengganti_dibuat_oleh_foreign` (`dibuat_oleh`),
  KEY `kode_pengganti_diklaim_oleh_foreign` (`diklaim_oleh`),
  CONSTRAINT `kode_pengganti_dibuat_oleh_foreign` FOREIGN KEY (`dibuat_oleh`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `kode_pengganti_diklaim_oleh_foreign` FOREIGN KEY (`diklaim_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `kode_pengganti_sesi_id_foreign` FOREIGN KEY (`sesi_id`) REFERENCES `sesi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kode_pengganti`
--

LOCK TABLES `kode_pengganti` WRITE;
/*!40000 ALTER TABLE `kode_pengganti` DISABLE KEYS */;
/*!40000 ALTER TABLE `kode_pengganti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mapel`
--

DROP TABLE IF EXISTS `mapel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mapel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kelompok_kurikulum` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mapel_kode_unique` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mapel`
--

LOCK TABLES `mapel` WRITE;
/*!40000 ALTER TABLE `mapel` DISABLE KEYS */;
INSERT INTO `mapel` VALUES (1,'IPS','ilmu pengetahuan sosial','Kelompok A (Wajib)','2026-11-02 19:23:29','2026-11-02 19:23:29'),(2,'MTK','matematika','Kelompok A (Wajib)','2026-11-03 00:34:20','2026-11-03 00:34:20'),(3,'PKN','pendidikan kewarga negaraan','Kelompok A (Wajib)','2026-11-03 00:34:36','2026-11-03 00:34:36'),(4,'PJOK','olahraga','Kelompok A (Wajib)','2026-11-03 01:46:14','2026-11-03 01:46:14');
/*!40000 ALTER TABLE `mapel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_10_16_100001_create_tahun_ajaran_table',1),(5,'2026_10_16_100002_create_mapel_table',1),(6,'2026_10_16_100003_create_jam_pelajaran_table',1),(7,'2026_10_16_100004_create_jadwal_versi_table',1),(8,'2026_10_16_100005_create_kelas_table',1),(9,'2026_10_16_100006_create_siswa_table',1),(10,'2026_10_16_100007_create_jadwal_slot_table',1),(11,'2026_10_16_100008_create_hari_libur_table',1),(12,'2026_10_16_100009_create_guru_piket_table',1),(13,'2026_10_16_100010_create_sesi_table',1),(14,'2026_10_16_100011_create_absen_guru_table',1),(15,'2026_10_16_100012_create_absen_siswa_table',1),(16,'2026_10_16_100013_create_pengumuman_table',1),(17,'2026_10_16_100014_create_audit_log_table',1),(18,'2026_10_18_124053_add_jenis_pegawai_to_users_table',2),(19,'2026_10_20_100001_add_no_wa_to_users_table',3),(20,'2026_10_20_100002_add_konfirmasi_to_absen_siswa_table',3),(21,'2026_10_20_100003_create_absen_harian_table',3),(22,'2026_10_20_100004_create_kode_pengganti_table',3),(23,'2026_10_20_100005_create_notifikasi_wa_table',3),(24,'2026_10_28_100001_add_kategori_to_pengumuman_table',4),(25,'2026_10_29_032405_add_is_pinned_and_pinned_at_to_pengumuman_table',5),(26,'2026_10_29_100001_add_kelompok_kurikulum_to_mapel_table',6),(27,'2026_11_03_032919_make_guru_id_nullable_in_jadwal_slot_table',7),(28,'2026_11_03_081842_add_sesi_and_jenis_to_jam_pelajaran_table',8),(29,'2026_11_03_082615_make_kelompok_hari_nullable_in_jam_pelajaran',9),(30,'2026_11_04_065829_add_durasi_to_jadwal_slot_table',10),(31,'2026_10_30_100001_add_waktu_pulang_to_absen_harian_table',11),(32,'2026_10_30_100002_add_face_recognition_to_users_table',11);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifikasi_wa`
--

DROP TABLE IF EXISTS `notifikasi_wa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifikasi_wa` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `siswa_id` bigint unsigned DEFAULT NULL,
  `absen_siswa_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `tujuan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pesan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'antrian',
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fonnte',
  `provider_message_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `waktu` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifikasi_wa_absen_siswa_id_foreign` (`absen_siswa_id`),
  KEY `notifikasi_wa_user_id_foreign` (`user_id`),
  KEY `notifikasi_wa_siswa_id_waktu_index` (`siswa_id`,`waktu`),
  CONSTRAINT `notifikasi_wa_absen_siswa_id_foreign` FOREIGN KEY (`absen_siswa_id`) REFERENCES `absen_siswa` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifikasi_wa_siswa_id_foreign` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifikasi_wa_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifikasi_wa`
--

LOCK TABLES `notifikasi_wa` WRITE;
/*!40000 ALTER TABLE `notifikasi_wa` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifikasi_wa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengumuman`
--

DROP TABLE IF EXISTS `pengumuman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengumuman` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kategori` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ringkasan` text COLLATE utf8mb4_unicode_ci,
  `isi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `gambar_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tanggal` date NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draf',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `pinned_at` timestamp NULL DEFAULT NULL,
  `dibuat_oleh` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pengumuman_slug_unique` (`slug`),
  KEY `pengumuman_dibuat_oleh_foreign` (`dibuat_oleh`),
  CONSTRAINT `pengumuman_dibuat_oleh_foreign` FOREIGN KEY (`dibuat_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengumuman`
--

LOCK TABLES `pengumuman` WRITE;
/*!40000 ALTER TABLE `pengumuman` DISABLE KEYS */;
INSERT INTO `pengumuman` VALUES (1,'suki liar','suki-liar','Prestasi Siswa','suki di temukan dimana mana','reza auditore sudah berhasil membasmi para suki liar','/uploads/berita/1793239354_sk.jpg','2026-10-29','terbit',0,NULL,1,'2026-10-28 19:01:08','2026-10-28 19:02:34'),(2,'my mbg','my-mbg','Prestasi Siswa','cantarella bini gw jir','hay sayang','/uploads/berita/1793241317_xixi.jpeg','2026-10-29','terbit',1,'2026-11-04 10:51:27',1,'2026-10-28 19:35:17','2026-11-04 10:51:27'),(3,'sss','sssss','Umum','sssss','sssssssssssssssssssssss','/uploads/berita/1793241613_logo-uin.jpeg','2026-10-29','terbit',0,NULL,1,'2026-10-28 19:40:13','2026-10-28 19:40:13'),(5,'qqqqqqqqqqqqqww','qqqqqqqqqqqqqqqqqqqqqqq','Prestasi Siswa','qwwwwwwwwwwwwwwwwww','wwwwwwwwwwwwwwwwwwwww',NULL,'2026-10-29','terbit',0,NULL,1,'2026-10-28 19:41:13','2026-10-28 19:41:13'),(6,'vvvvvvvvvvvvvvvvvvv','vvvvvvvvvvvvvvvvvvv','Prestasi Siswa','vvvvvvvvvvvvvvvvvvvvvvvvvvvv','vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv','/uploads/berita/1793243369_whatsapp-image-2026-08-26-at-174414.jpeg','2026-10-29','terbit',0,NULL,1,'2026-10-28 20:09:29','2026-11-02 19:14:55'),(7,'Siswa SMPN 2 Soreang Raih Medali Emas Olimpiade Sains Nasional (OSN) Tingkat Jawa Barat 2025','siswa-smpn-2-soreang-raih-medali-emas-osn-jabar-2025','Prestasi Siswa','Prestasi membanggakan kembali dipersembahkan oleh ananda Muhammad Rayhan (Kelas 9-A) dan Siti Aisyah (Kelas 9-D) yang berhasil menyabet gelar Juara 1 OSN Bidang IPA Terpadu dan Matematika. Keduanya resmi melaju sebagai perwakilan daerah ke ajang tingkat Nasional.','Prestasi membanggakan kembali dipersembahkan oleh ananda Muhammad Rayhan (Kelas 9-A) dan Siti Aisyah (Kelas 9-D) yang berhasil menyabet gelar Juara 1 OSN Bidang IPA Terpadu dan Matematika tingkat Jawa Barat tahun 2025.\n\nKeberhasilan ini merupakan buah dari kerja keras, bimbingan intensif dewan guru pembina olimpiade sains, serta doa dan dukungan seluruh civitas akademika SMP Negeri 2 Soreang. Keduanya resmi melaju sebagai perwakilan daerah Jawa Barat ke ajang tingkat Nasional yang akan diselenggarakan akhir tahun ini.','https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80','2025-11-18','terbit',0,NULL,1,'2026-11-02 02:00:38','2026-11-02 02:00:38'),(8,'Peluncuran Sistem Presensi Digital Geofencing & Face Verification untuk Seluruh Civitas Akademika','peluncuran-sistem-presensi-digital-geofencing-face-verification','Inovasi Sekolah','Mengoptimalkan akuntabilitas kehadiran guru dan siswa dengan fitur live-kamera serta verifikasi kode unik pengganti dari guru piket saat berhalangan hadir.','Dalam rangka mewujudkan tatakelola sekolah yang modern dan transparan, SMP Negeri 2 Soreang secara resmi meluncurkan Sistem Presensi Digital Terpadu berbasis Geofencing dan Face Verification.\n\nSistem ini memastikan ketepatan absensi harian guru dan staf tanpa opsi upload galeri serta memudahkan pelaporan presensi berkala secara akurat.','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80','2025-11-14','terbit',0,NULL,1,'2026-11-02 02:00:38','2026-11-02 02:00:38'),(9,'Jadwal Pelaksanaan Penilaian Akhir Semester (PAS) Genap T.A. 2024/2025','jadwal-pelaksanaan-penilaian-akhir-semester-pas-genap','Agenda Akademik','Diberitahukan kepada seluruh siswa kelas 7, 8, dan 9 untuk mempersiapkan tata tertib pendukung protokol CBT di lab komputer sekolah.','Penilaian Akhir Semester (PAS) Genap Tahun Ajaran 2024/2025 akan diselenggarakan berbasis Computer Based Test (CBT) di laboratorium komputer sekolah.\n\nSeluruh siswa diharapkan memperhatikan jadwal sesi masing-masing dan mematuhi tata tertib pelaksanaan ujian.','https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80','2025-11-10','terbit',0,NULL,1,'2026-11-02 02:00:38','2026-11-02 02:00:38'),(10,'Pembiasaan Shalat Dhuha Berjamaah & Literasi Al-Qur\'an Jumat Berkah','pembiasaan-shalat-dhuha-berjamaah-dan-literasi-al-quran','Kegiatan & Religi','Membangun karakter spiritualitas siswa melalui pembiasaan ibadah rutin bersama para guru pengajar dan pembina OSIS di selasar koridor utama.','Sebagai wujud pembentukan budi pekerti dan karakter religius, kegiatan Shalat Dhuha berjamaah dan tadarus Al-Qur\'an diadakan setiap Jumat pagi.\n\nKegiatan ini diikuti oleh seluruh siswa dan dewan guru dengan khidmat sebelum kegiatan belajar mengajar dimulai.','https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80','2025-11-07','terbit',0,NULL,1,'2026-11-02 02:00:38','2026-11-02 02:00:38'),(11,'Rencana Pembangunan Ruang Terbuka Hijau & Pojok Baca Taman Sekolah','rencana-pembangunan-ruang-terbuka-hijau-pojok-baca','Fasilitas','Draf proposal peremajaan area taman belakang untuk pojok baca luar ruangan siswa.','Proposal penataan ruang terbuka hijau dan gazebo literasi sekolah saat ini masih dalam tahap penyusunan dan peninjauan komite sekolah.','https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80','2025-11-20','draf',0,NULL,1,'2026-11-02 02:00:38','2026-11-02 02:00:38');
/*!40000 ALTER TABLE `pengumuman` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesi`
--

DROP TABLE IF EXISTS `sesi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesi` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tanggal` date NOT NULL,
  `kelas_id` bigint unsigned NOT NULL,
  `jam_pelajaran_id` bigint unsigned NOT NULL,
  `mapel_id` bigint unsigned NOT NULL,
  `guru_id` bigint unsigned NOT NULL,
  `guru_pengganti_id` bigint unsigned DEFAULT NULL,
  `slot_id` bigint unsigned DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'terjadwal',
  `alasan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sesi_kelas_id_foreign` (`kelas_id`),
  KEY `sesi_jam_pelajaran_id_foreign` (`jam_pelajaran_id`),
  KEY `sesi_mapel_id_foreign` (`mapel_id`),
  KEY `sesi_guru_id_foreign` (`guru_id`),
  KEY `sesi_guru_pengganti_id_foreign` (`guru_pengganti_id`),
  KEY `sesi_slot_id_foreign` (`slot_id`),
  CONSTRAINT `sesi_guru_id_foreign` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sesi_guru_pengganti_id_foreign` FOREIGN KEY (`guru_pengganti_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sesi_jam_pelajaran_id_foreign` FOREIGN KEY (`jam_pelajaran_id`) REFERENCES `jam_pelajaran` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sesi_kelas_id_foreign` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sesi_mapel_id_foreign` FOREIGN KEY (`mapel_id`) REFERENCES `mapel` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sesi_slot_id_foreign` FOREIGN KEY (`slot_id`) REFERENCES `jadwal_slot` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesi`
--

LOCK TABLES `sesi` WRITE;
/*!40000 ALTER TABLE `sesi` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('2kC4CjWdaOvjI0aFLeoKPVQ2obeQqvbBk9pol7cI',1,'127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:158.0) Gecko/20100101 Firefox/158.0','eyJfdG9rZW4iOiJCekp6WUNpVzZKWjQ1S3BVNTN2cTY4dkZ3QVdRdzFESjhZQmxRSjRHIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOiJ3ZWxjb21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfSwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjEsInBhc3N3b3JkX2hhc2hfd2ViIjoiOTM5MmJjMDJkOTYyM2JiODFkOGIyYjdiNWUxYWJiZGRlYzNlYjQ1MGMyNjJkOGZlNjE4ZGU1ZWY4YzEyNTM5YiJ9',1793875985),('bW6ht76N3SDPLxLN2uYIXtsvilC7cFhlOiYSJnQ5',1,'127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:158.0) Gecko/20100101 Firefox/158.0','eyJfdG9rZW4iOiI4UlQzUmFDVFM5anpzRGFveHhYWHBNeHkwck9KeENnNTVnWlIzdmdwIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOiJ3ZWxjb21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfSwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjEsInBhc3N3b3JkX2hhc2hfd2ViIjoiOTM5MmJjMDJkOTYyM2JiODFkOGIyYjdiNWUxYWJiZGRlYzNlYjQ1MGMyNjJkOGZlNjE4ZGU1ZWY4YzEyNTM5YiJ9',1793838664),('oermjJGnSH7b29ypMsVrq6FsBTYgcuPHndjqbKRd',NULL,'127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:158.0) Gecko/20100101 Firefox/158.0','eyJfdG9rZW4iOiJqVkFYMmQ4eWJuU05JTUhzcVhveUpNc3hkU1hGbjVtb1pzMUpPVWpYIiwidXJsIjp7ImludGVuZGVkIjoiaHR0cDpcL1wvMTI3LjAuMC4xOjgwMDBcL2phZHdhbD9oYXJpPTEmc2VzaT1wYWdpJnZlcnNpX2lkPTUifSwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOiJ3ZWxjb21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1793943089),('UWAcbqcpcQvSnEbI5cn1DtpS1oATZ5kyk4CB5yTw',NULL,'127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:158.0) Gecko/20100101 Firefox/158.0','eyJfdG9rZW4iOiJBdFV4RWdsVDlPS2lxMnBrbzlKZ2JFMWVpRjJ2OXpLbXZvYnlQS2xtIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==',1793814692);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siswa`
--

DROP TABLE IF EXISTS `siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `siswa` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nis` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kelas_id` bigint unsigned DEFAULT NULL,
  `no_hp_ortu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siswa_nis_unique` (`nis`),
  KEY `siswa_kelas_id_foreign` (`kelas_id`),
  CONSTRAINT `siswa_kelas_id_foreign` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siswa`
--

LOCK TABLES `siswa` WRITE;
/*!40000 ALTER TABLE `siswa` DISABLE KEYS */;
/*!40000 ALTER TABLE `siswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tahun_ajaran`
--

DROP TABLE IF EXISTS `tahun_ajaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tahun_ajaran` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tahun_ajaran`
--

LOCK TABLES `tahun_ajaran` WRITE;
/*!40000 ALTER TABLE `tahun_ajaran` DISABLE KEYS */;
INSERT INTO `tahun_ajaran` VALUES (1,'yyhh','Ganjil','2026-11-26','2026-12-30',1,'2026-11-02 07:07:42','2026-11-02 07:07:54');
/*!40000 ALTER TABLE `tahun_ajaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_wa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'guru',
  `jenis_pegawai` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wajib_ganti_password` tinyint(1) NOT NULL DEFAULT '1',
  `aktif` tinyint(1) NOT NULL DEFAULT '1',
  `face_descriptor` text COLLATE utf8mb4_unicode_ci,
  `face_registered_at` datetime DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','Administrator','admin@smpn2soreang.sch.id',NULL,NULL,'$2y$12$OR2LznCco7LsyeyglqA5QOQIbgwX2fjHHWPKpEOc7nqjZrJ/lhTBC','admin',NULL,0,1,NULL,NULL,NULL,'2026-10-18 06:43:44','2026-11-03 22:32:52'),(2,'guru','Guru Biasa','guru@smpn2soreang.sch.id',NULL,NULL,'$2y$12$c9N2c5FPLwULni2ohaAmvux/W06tgfAthU/HgqVmvNE1dprGrdrU6','guru','guru',0,1,NULL,NULL,NULL,'2026-10-18 06:43:44','2026-11-03 22:32:52'),(3,'gurupiket','Guru Piket','gurupiket@smpn2soreang.sch.id','6281234567890',NULL,'$2y$12$YreBx8t3YBU7jE2UT98Bae2CY7VKVbL3yocfKXGAV9FcmP6BcZpvO','guru_piket',NULL,0,1,NULL,NULL,NULL,'2026-10-18 06:43:45','2026-11-03 22:32:53'),(4,'kepsek','Kepala Sekolah','kepsek@smpn2soreang.sch.id',NULL,NULL,'$2y$12$za8KzJj2TW31I9sYXqOZ.OVzdTGbHNmhaw10eOyc07qFsJ9s.0xz.','kepsek',NULL,0,1,NULL,NULL,NULL,'2026-10-18 06:43:45','2026-11-03 22:32:53'),(5,'aaa','aaaa','fawwaznovachrono@gmail.com',NULL,NULL,'$2y$12$zDzxJKJ0HebfJeTW4Gya/.rk2CreML432.xJruIwGUvFPQIOa6rFm','guru','guru',1,1,NULL,NULL,NULL,'2026-11-02 06:26:35','2026-11-02 06:26:35'),(6,'guru1','xixie',NULL,NULL,NULL,'$2y$12$5KZGZsGCm6cxomACDY9DB.TI1QHCcWwy73EbOTa5qWyfHKuPqDrNG','guru','guru',1,1,NULL,NULL,NULL,'2026-11-02 19:25:12','2026-11-02 19:25:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-06 12:57:50
