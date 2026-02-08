-- ============================================================================
-- ODONTO CHIN CRM - CANAL DE RECORDATÓRIOS
-- Migration: 0001_canal_recordatorios
-- Data: 07 de fevereiro de 2026
-- Descrição: Adiciona tabelas para gestão avançada de canais de comunicação
-- ============================================================================

-- Tabela: communication_channels
CREATE TABLE IF NOT EXISTS `communicationChannels` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT NOT NULL,
  `channelType` ENUM('whatsapp', 'messenger', 'n8n', 'chatwoot') NOT NULL,
  `channelPurpose` ENUM('clinic_integration', 'reminders') NOT NULL,
  `connectionName` VARCHAR(100) NOT NULL,
  `identifier` VARCHAR(255),
  `apiUrl` VARCHAR(500),
  `apiKeyEncrypted` TEXT,
  `webhookUrl` VARCHAR(500),
  `accessTokenEncrypted` TEXT,
  `status` ENUM('active', 'inactive', 'error', 'connecting') DEFAULT 'inactive' NOT NULL,
  `healthScore` INT DEFAULT 100 NOT NULL,
  `isDefault` BOOLEAN DEFAULT FALSE NOT NULL,
  `dailyLimit` INT DEFAULT 1000 NOT NULL,
  `messagesSentToday` INT DEFAULT 0 NOT NULL,
  `lastMessageAt` TIMESTAMP NULL,
  `lastHealthCheckAt` TIMESTAMP NULL,
  `errorMessage` TEXT,
  `metadata` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_tenant_purpose` (`tenantId`, `channelPurpose`),
  INDEX `idx_status` (`status`),
  INDEX `idx_default` (`isDefault`),
  INDEX `idx_health` (`healthScore`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: channel_messages_log
CREATE TABLE IF NOT EXISTS `channelMessagesLog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `channelId` INT NOT NULL,
  `tenantId` INT NOT NULL,
  `patientId` INT,
  `appointmentId` INT,
  `messageType` ENUM('reminder_2days', 'reminder_1day', 'reminder_day', 'confirmation', 'followup') NOT NULL,
  `recipientNumber` VARCHAR(50) NOT NULL,
  `messageContent` TEXT NOT NULL,
  `status` ENUM('queued', 'sent', 'delivered', 'read', 'failed') DEFAULT 'queued' NOT NULL,
  `sentAt` TIMESTAMP NULL,
  `deliveredAt` TIMESTAMP NULL,
  `readAt` TIMESTAMP NULL,
  `errorMessage` TEXT,
  `retryCount` INT DEFAULT 0 NOT NULL,
  `externalMessageId` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  INDEX `idx_channel` (`channelId`),
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_patient` (`patientId`),
  INDEX `idx_appointment` (`appointmentId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`createdAt`),
  INDEX `idx_channel_status` (`channelId`, `status`),
  
  FOREIGN KEY (`channelId`) REFERENCES `communicationChannels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: channel_health_history
CREATE TABLE IF NOT EXISTS `channelHealthHistory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `channelId` INT NOT NULL,
  `healthScore` INT NOT NULL,
  `messagesSentLastHour` INT DEFAULT 0 NOT NULL,
  `messagesDeliveredLastHour` INT DEFAULT 0 NOT NULL,
  `deliveryRate` DECIMAL(5,2),
  `errorCount` INT DEFAULT 0 NOT NULL,
  `checkedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `notes` TEXT,
  
  INDEX `idx_channel` (`channelId`),
  INDEX `idx_checked_at` (`checkedAt`),
  INDEX `idx_channel_time` (`channelId`, `checkedAt`),
  
  FOREIGN KEY (`channelId`) REFERENCES `communicationChannels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: channel_antiblock_config
CREATE TABLE IF NOT EXISTS `channelAntiblockConfig` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `channelId` INT NOT NULL UNIQUE,
  `enabled` BOOLEAN DEFAULT TRUE NOT NULL,
  `dailyLimit` INT DEFAULT 1000 NOT NULL,
  `hourlyLimit` INT DEFAULT 100 NOT NULL,
  `minIntervalSeconds` INT DEFAULT 3 NOT NULL,
  `maxRetries` INT DEFAULT 3 NOT NULL,
  `autoPauseOnError` BOOLEAN DEFAULT TRUE NOT NULL,
  `autoRotateOnHealthDrop` BOOLEAN DEFAULT TRUE NOT NULL,
  `healthThresholdForRotation` INT DEFAULT 50 NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  INDEX `idx_channel` (`channelId`),
  INDEX `idx_enabled` (`enabled`),
  
  FOREIGN KEY (`channelId`) REFERENCES `communicationChannels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: channel_alerts
CREATE TABLE IF NOT EXISTS `channelAlerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `channelId` INT NOT NULL,
  `tenantId` INT NOT NULL,
  `alertType` ENUM('health_low', 'health_critical', 'limit_reached', 'connection_lost', 'auto_rotation', 'auto_pause') NOT NULL,
  `severity` ENUM('info', 'warning', 'error', 'critical') NOT NULL,
  `message` TEXT NOT NULL,
  `resolved` BOOLEAN DEFAULT FALSE NOT NULL,
  `resolvedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  INDEX `idx_channel` (`channelId`),
  INDEX `idx_tenant` (`tenantId`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_resolved` (`resolved`),
  INDEX `idx_created_at` (`createdAt`),
  INDEX `idx_channel_resolved` (`channelId`, `resolved`),
  
  FOREIGN KEY (`channelId`) REFERENCES `communicationChannels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VIEWS - Estatísticas em tempo real
-- ============================================================================

CREATE OR REPLACE VIEW `v_channel_statistics` AS
SELECT 
  cc.`id` AS `channelId`,
  cc.`tenantId`,
  cc.`connectionName`,
  cc.`channelType`,
  cc.`status`,
  cc.`healthScore`,
  cc.`isDefault`,
  cc.`dailyLimit`,
  cc.`messagesSentToday`,
  ROUND((cc.`messagesSentToday` / cc.`dailyLimit`) * 100, 2) AS `usagePercentage`,
  COUNT(DISTINCT cml.`id`) AS `totalMessagesSent`,
  SUM(CASE WHEN cml.`status` = 'delivered' THEN 1 ELSE 0 END) AS `messagesDelivered`,
  SUM(CASE WHEN cml.`status` = 'failed' THEN 1 ELSE 0 END) AS `messagesFailed`,
  ROUND(
    (SUM(CASE WHEN cml.`status` = 'delivered' THEN 1 ELSE 0 END) / NULLIF(COUNT(cml.`id`), 0)) * 100, 
    2
  ) AS `deliveryRate`,
  cc.`lastMessageAt`,
  cc.`lastHealthCheckAt`
FROM `communicationChannels` cc
LEFT JOIN `channelMessagesLog` cml ON cc.`id` = cml.`channelId` 
  AND DATE(cml.`createdAt`) = CURDATE()
WHERE cc.`channelPurpose` = 'reminders'
GROUP BY cc.`id`;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Resetar contador diário de mensagens
DELIMITER //

CREATE PROCEDURE `sp_reset_daily_message_counters`()
BEGIN
  UPDATE `communicationChannels`
  SET `messagesSentToday` = 0
  WHERE `channelPurpose` = 'reminders';
  
  INSERT INTO `channelHealthHistory` (`channelId`, `healthScore`, `notes`)
  SELECT `id`, `healthScore`, 'Daily counter reset'
  FROM `communicationChannels`
  WHERE `channelPurpose` = 'reminders' AND `status` = 'active';
END //

DELIMITER ;

-- Procedure: Atualizar saúde do canal
DELIMITER //

CREATE PROCEDURE `sp_update_channel_health`(IN p_channel_id INT)
BEGIN
  DECLARE v_messages_sent INT DEFAULT 0;
  DECLARE v_messages_delivered INT DEFAULT 0;
  DECLARE v_messages_failed INT DEFAULT 0;
  DECLARE v_delivery_rate DECIMAL(5,2) DEFAULT 100.00;
  DECLARE v_health_score INT DEFAULT 100;
  DECLARE v_error_count INT DEFAULT 0;
  
  -- Contar mensagens da última hora
  SELECT COUNT(*) INTO v_messages_sent
  FROM `channelMessagesLog`
  WHERE `channelId` = p_channel_id
    AND `createdAt` >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
  
  -- Contar mensagens entregues da última hora
  SELECT COUNT(*) INTO v_messages_delivered
  FROM `channelMessagesLog`
  WHERE `channelId` = p_channel_id
    AND `status` = 'delivered'
    AND `createdAt` >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
  
  -- Contar erros das últimas 24h
  SELECT COUNT(*) INTO v_error_count
  FROM `channelMessagesLog`
  WHERE `channelId` = p_channel_id
    AND `status` = 'failed'
    AND `createdAt` >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
  
  -- Calcular taxa de entrega
  IF v_messages_sent > 0 THEN
    SET v_delivery_rate = (v_messages_delivered / v_messages_sent) * 100;
  END IF;
  
  -- Calcular health score
  IF v_delivery_rate >= 95 AND v_error_count = 0 THEN
    SET v_health_score = 100;
  ELSEIF v_delivery_rate >= 90 THEN
    SET v_health_score = 80;
  ELSEIF v_delivery_rate >= 80 THEN
    SET v_health_score = 60;
  ELSEIF v_delivery_rate >= 70 THEN
    SET v_health_score = 40;
  ELSE
    SET v_health_score = 20;
  END IF;
  
  -- Penalizar por erros
  SET v_health_score = GREATEST(0, v_health_score - (v_error_count * 20));
  
  -- Atualizar canal
  UPDATE `communicationChannels`
  SET 
    `healthScore` = v_health_score,
    `lastHealthCheckAt` = NOW()
  WHERE `id` = p_channel_id;
  
  -- Registrar no histórico
  INSERT INTO `channelHealthHistory` (
    `channelId`, 
    `healthScore`, 
    `messagesSentLastHour`,
    `messagesDeliveredLastHour`,
    `deliveryRate`,
    `errorCount`,
    `notes`
  ) VALUES (
    p_channel_id,
    v_health_score,
    v_messages_sent,
    v_messages_delivered,
    v_delivery_rate,
    v_error_count,
    CONCAT('Auto-check: ', v_messages_sent, ' sent, ', v_messages_delivered, ' delivered')
  );
  
  -- Gerar alertas se necessário
  IF v_health_score < 50 AND v_health_score >= 20 THEN
    INSERT INTO `channelAlerts` (`channelId`, `tenantId`, `alertType`, `severity`, `message`)
    SELECT p_channel_id, `tenantId`, 'health_low', 'warning', 
           CONCAT('Canal health dropped to ', v_health_score, '%')
    FROM `communicationChannels`
    WHERE `id` = p_channel_id;
  ELSEIF v_health_score < 20 THEN
    INSERT INTO `channelAlerts` (`channelId`, `tenantId`, `alertType`, `severity`, `message`)
    SELECT p_channel_id, `tenantId`, 'health_critical', 'critical', 
           CONCAT('Canal health critical: ', v_health_score, '%')
    FROM `communicationChannels`
    WHERE `id` = p_channel_id;
    
    -- Auto-pausar canal
    UPDATE `communicationChannels`
    SET `status` = 'error', `errorMessage` = 'Auto-paused due to critical health'
    WHERE `id` = p_channel_id;
  END IF;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Atualizar contador de mensagens ao inserir novo log
DELIMITER //

CREATE TRIGGER `trg_update_message_counter`
AFTER INSERT ON `channelMessagesLog`
FOR EACH ROW
BEGIN
  IF NEW.`status` = 'sent' OR NEW.`status` = 'delivered' THEN
    UPDATE `communicationChannels`
    SET 
      `messagesSentToday` = `messagesSentToday` + 1,
      `lastMessageAt` = NOW()
    WHERE `id` = NEW.`channelId`;
  END IF;
END //

DELIMITER ;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
