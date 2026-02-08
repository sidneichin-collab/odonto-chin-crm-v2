import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * ODONTO CHIN CRM - CANAL DE RECORDATÓRIOS
 * Schema adicional para gestão avançada de canais de comunicação
 * Data: 07 de fevereiro de 2026
 * Versão: 1.0
 */

// ============================================================================
// COMMUNICATION CHANNELS - Canais de comunicação para recordatórios
// ============================================================================

export const communicationChannels = mysqlTable("communicationChannels", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  
  // Channel Configuration
  channelType: mysqlEnum("channelType", ["whatsapp", "messenger", "n8n", "chatwoot"]).notNull(),
  channelPurpose: mysqlEnum("channelPurpose", ["clinic_integration", "reminders"]).notNull(),
  connectionName: varchar("connectionName", { length: 100 }).notNull(),
  identifier: varchar("identifier", { length: 255 }), // número de telefone, page ID, etc.
  
  // API Configuration (encrypted in application layer)
  apiUrl: varchar("apiUrl", { length: 500 }),
  apiKeyEncrypted: text("apiKeyEncrypted"),
  webhookUrl: varchar("webhookUrl", { length: 500 }),
  accessTokenEncrypted: text("accessTokenEncrypted"),
  
  // Status & Health
  status: mysqlEnum("status", ["active", "inactive", "error", "connecting"]).default("inactive").notNull(),
  healthScore: int("healthScore").default(100).notNull(), // 0-100
  isDefault: boolean("isDefault").default(false).notNull(),
  
  // Anti-blocking Configuration
  dailyLimit: int("dailyLimit").default(1000).notNull(),
  messagesSentToday: int("messagesSentToday").default(0).notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  lastHealthCheckAt: timestamp("lastHealthCheckAt"),
  
  // Error tracking
  errorMessage: text("errorMessage"),
  
  // Metadata (JSON stored as text)
  metadata: text("metadata"), // dados específicos do canal
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunicationChannel = typeof communicationChannels.$inferSelect;
export type InsertCommunicationChannel = typeof communicationChannels.$inferInsert;

// ============================================================================
// CHANNEL MESSAGES LOG - Log detalhado de mensagens enviadas
// ============================================================================

export const channelMessagesLog = mysqlTable("channelMessagesLog", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  patientId: int("patientId"),
  appointmentId: int("appointmentId"),
  
  // Message Details
  messageType: mysqlEnum("messageType", [
    "reminder_2days",
    "reminder_1day", 
    "reminder_day",
    "confirmation",
    "followup"
  ]).notNull(),
  
  recipientNumber: varchar("recipientNumber", { length: 50 }).notNull(),
  messageContent: text("messageContent").notNull(),
  
  // Status tracking
  status: mysqlEnum("status", ["queued", "sent", "delivered", "read", "failed"]).default("queued").notNull(),
  
  // Timestamps
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  readAt: timestamp("readAt"),
  
  // Error handling
  errorMessage: text("errorMessage"),
  retryCount: int("retryCount").default(0).notNull(),
  
  // External reference
  externalMessageId: varchar("externalMessageId", { length: 255 }), // ID da mensagem na API externa
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChannelMessageLog = typeof channelMessagesLog.$inferSelect;
export type InsertChannelMessageLog = typeof channelMessagesLog.$inferInsert;

// ============================================================================
// CHANNEL HEALTH HISTORY - Histórico de saúde dos canais
// ============================================================================

export const channelHealthHistory = mysqlTable("channelHealthHistory", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  
  // Health Metrics
  healthScore: int("healthScore").notNull(),
  messagesSentLastHour: int("messagesSentLastHour").default(0).notNull(),
  messagesDeliveredLastHour: int("messagesDeliveredLastHour").default(0).notNull(),
  deliveryRate: decimal("deliveryRate", { precision: 5, scale: 2 }), // porcentagem
  errorCount: int("errorCount").default(0).notNull(),
  
  // Timestamp
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
  
  // Notes
  notes: text("notes"),
});

export type ChannelHealthHistory = typeof channelHealthHistory.$inferSelect;
export type InsertChannelHealthHistory = typeof channelHealthHistory.$inferInsert;

// ============================================================================
// CHANNEL ANTIBLOCK CONFIG - Configurações do sistema anti-bloqueio
// ============================================================================

export const channelAntiblockConfig = mysqlTable("channelAntiblockConfig", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull().unique(),
  
  // Anti-block Settings
  enabled: boolean("enabled").default(true).notNull(),
  dailyLimit: int("dailyLimit").default(1000).notNull(),
  hourlyLimit: int("hourlyLimit").default(100).notNull(),
  minIntervalSeconds: int("minIntervalSeconds").default(3).notNull(),
  maxRetries: int("maxRetries").default(3).notNull(),
  
  // Auto-actions
  autoPauseOnError: boolean("autoPauseOnError").default(true).notNull(),
  autoRotateOnHealthDrop: boolean("autoRotateOnHealthDrop").default(true).notNull(),
  healthThresholdForRotation: int("healthThresholdForRotation").default(50).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChannelAntiblockConfig = typeof channelAntiblockConfig.$inferSelect;
export type InsertChannelAntiblockConfig = typeof channelAntiblockConfig.$inferInsert;

// ============================================================================
// CHANNEL ALERTS - Alertas do sistema de monitoramento
// ============================================================================

export const channelAlerts = mysqlTable("channelAlerts", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  
  // Alert Details
  alertType: mysqlEnum("alertType", [
    "health_low",
    "health_critical",
    "limit_reached",
    "connection_lost",
    "auto_rotation",
    "auto_pause"
  ]).notNull(),
  
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).notNull(),
  message: text("message").notNull(),
  
  // Resolution
  resolved: boolean("resolved").default(false).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChannelAlert = typeof channelAlerts.$inferSelect;
export type InsertChannelAlert = typeof channelAlerts.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const communicationChannelsRelations = relations(communicationChannels, ({ many }) => ({
  messagesLog: many(channelMessagesLog),
  healthHistory: many(channelHealthHistory),
  antiblockConfig: many(channelAntiblockConfig),
  alerts: many(channelAlerts),
}));

export const channelMessagesLogRelations = relations(channelMessagesLog, ({ one }) => ({
  channel: one(communicationChannels, {
    fields: [channelMessagesLog.channelId],
    references: [communicationChannels.id],
  }),
}));

export const channelHealthHistoryRelations = relations(channelHealthHistory, ({ one }) => ({
  channel: one(communicationChannels, {
    fields: [channelHealthHistory.channelId],
    references: [communicationChannels.id],
  }),
}));

export const channelAntiblockConfigRelations = relations(channelAntiblockConfig, ({ one }) => ({
  channel: one(communicationChannels, {
    fields: [channelAntiblockConfig.channelId],
    references: [communicationChannels.id],
  }),
}));

export const channelAlertsRelations = relations(channelAlerts, ({ one }) => ({
  channel: one(communicationChannels, {
    fields: [channelAlerts.channelId],
    references: [communicationChannels.id],
  }),
}));
