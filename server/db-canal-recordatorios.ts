/**
 * Database functions for Canal de Recordatórios
 * 
 * Handles all database operations for communication channels,
 * message logging, health monitoring, and anti-blocking system.
 */

import { getDb } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import {
  communicationChannels,
  channelMessagesLog,
  channelHealthHistory,
  channelAntiblockConfig,
  channelAlerts,
  type CommunicationChannel,
  type InsertCommunicationChannel,
  type ChannelMessageLog,
  type InsertChannelMessageLog,
  type ChannelHealthHistory,
  type ChannelAntiblockConfig,
  type ChannelAlert,
} from "../drizzle/schema-canal-recordatorios";
import crypto from "crypto";
import axios from "axios";

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "odonto-chin-crm-secret-key-2026-v1-secure";
const ALGORITHM = "aes-256-cbc";

function encrypt(text: string): string {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============================================================================
// CHANNELS - CRUD
// ============================================================================

export async function getChannelsByTenant(
  tenantId: number,
  purpose?: 'reminders' | 'clinic_integration'
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [eq(communicationChannels.tenantId, tenantId)];
    if (purpose) {
      conditions.push(eq(communicationChannels.channelPurpose, purpose));
    }

    const channels = await db
      .select()
      .from(communicationChannels)
      .where(and(...conditions))
      .orderBy(desc(communicationChannels.createdAt));

    // Decrypt sensitive fields
    return channels.map(channel => ({
      ...channel,
      apiKey: channel.apiKeyEncrypted ? decrypt(channel.apiKeyEncrypted) : null,
      accessToken: channel.accessTokenEncrypted ? decrypt(channel.accessTokenEncrypted) : null,
    }));
  } catch (error) {
    console.error("[DB] Failed to get channels:", error);
    return [];
  }
}

export async function getChannelById(id: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const [channel] = await db
      .select()
      .from(communicationChannels)
      .where(eq(communicationChannels.id, id))
      .limit(1);

    if (!channel) return null;

    return {
      ...channel,
      apiKey: channel.apiKeyEncrypted ? decrypt(channel.apiKeyEncrypted) : null,
      accessToken: channel.accessTokenEncrypted ? decrypt(channel.accessTokenEncrypted) : null,
    };
  } catch (error) {
    console.error("[DB] Failed to get channel by ID:", error);
    return null;
  }
}

export async function createChannel(data: InsertCommunicationChannel & { tenantId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Encrypt sensitive fields
    const encryptedData: any = {
      ...data,
      apiKeyEncrypted: data.apiKey ? encrypt(data.apiKey) : null,
      accessTokenEncrypted: data.accessToken ? encrypt(data.accessToken) : null,
    };

    // Remove unencrypted fields
    delete encryptedData.apiKey;
    delete encryptedData.accessToken;

    const [channel] = await db
      .insert(communicationChannels)
      .values(encryptedData)
      .$returningId();

    // Create default anti-block config
    await db.insert(channelAntiblockConfig).values({
      channelId: channel.id,
      dailyLimit: data.dailyLimit || 1000,
      hourlyLimit: 100,
      minIntervalSeconds: 3,
      autoRotateEnabled: true,
      autoPauseThreshold: 20,
    });

    return await getChannelById(channel.id);
  } catch (error) {
    console.error("[DB] Failed to create channel:", error);
    throw error;
  }
}

export async function updateChannel(id: number, data: Partial<InsertCommunicationChannel>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const updateData: any = { ...data };

    // Encrypt sensitive fields if provided
    if (data.apiKey) {
      updateData.apiKeyEncrypted = encrypt(data.apiKey);
      delete updateData.apiKey;
    }
    if (data.accessToken) {
      updateData.accessTokenEncrypted = encrypt(data.accessToken);
      delete updateData.accessToken;
    }

    await db
      .update(communicationChannels)
      .set(updateData)
      .where(eq(communicationChannels.id, id));

    return await getChannelById(id);
  } catch (error) {
    console.error("[DB] Failed to update channel:", error);
    throw error;
  }
}

export async function deleteChannel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Soft delete - mark as inactive
    await db
      .update(communicationChannels)
      .set({ status: 'inactive' })
      .where(eq(communicationChannels.id, id));
  } catch (error) {
    console.error("[DB] Failed to delete channel:", error);
    throw error;
  }
}

export async function setDefaultChannel(id: number, tenantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Remove default from all channels of this tenant
    await db
      .update(communicationChannels)
      .set({ isDefault: false })
      .where(eq(communicationChannels.tenantId, tenantId));

    // Set new default
    await db
      .update(communicationChannels)
      .set({ isDefault: true })
      .where(eq(communicationChannels.id, id));
  } catch (error) {
    console.error("[DB] Failed to set default channel:", error);
    throw error;
  }
}

// ============================================================================
// HEALTH & MONITORING
// ============================================================================

export async function getChannelHealth(channelId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const [channel] = await db
      .select({
        id: communicationChannels.id,
        connectionName: communicationChannels.connectionName,
        healthScore: communicationChannels.healthScore,
        messagesSentToday: communicationChannels.messagesSentToday,
        dailyLimit: communicationChannels.dailyLimit,
        lastMessageAt: communicationChannels.lastMessageAt,
        lastHealthCheckAt: communicationChannels.lastHealthCheckAt,
        status: communicationChannels.status,
      })
      .from(communicationChannels)
      .where(eq(communicationChannels.id, channelId))
      .limit(1);

    return channel || null;
  } catch (error) {
    console.error("[DB] Failed to get channel health:", error);
    return null;
  }
}

export async function getHealthHistory(channelId: number, hours: number = 24) {
  const db = await getDb();
  if (!db) return [];

  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const history = await db
      .select()
      .from(channelHealthHistory)
      .where(
        and(
          eq(channelHealthHistory.channelId, channelId),
          gte(channelHealthHistory.checkedAt, since)
        )
      )
      .orderBy(desc(channelHealthHistory.checkedAt));

    return history;
  } catch (error) {
    console.error("[DB] Failed to get health history:", error);
    return [];
  }
}

export async function updateChannelHealth(channelId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Call stored procedure to update health
    await db.execute(sql`CALL sp_update_channel_health(${channelId})`);
  } catch (error) {
    console.error("[DB] Failed to update channel health:", error);
    throw error;
  }
}

export async function getGlobalChannelStats(tenantId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const [stats] = await db
      .select({
        totalChannels: sql<number>`COUNT(*)`,
        activeChannels: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        totalMessagesToday: sql<number>`SUM(messages_sent_today)`,
        avgHealthScore: sql<number>`AVG(health_score)`,
        activeAlerts: sql<number>`(SELECT COUNT(*) FROM ${channelAlerts} WHERE resolved = FALSE)`,
      })
      .from(communicationChannels)
      .where(eq(communicationChannels.tenantId, tenantId));

    return stats || null;
  } catch (error) {
    console.error("[DB] Failed to get global stats:", error);
    return null;
  }
}

// ============================================================================
// MESSAGES LOG
// ============================================================================

export async function getMessages(filters: {
  channelId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];
    if (filters.channelId) {
      conditions.push(eq(channelMessagesLog.channelId, filters.channelId));
    }
    if (filters.status) {
      conditions.push(eq(channelMessagesLog.status, filters.status as any));
    }

    const messages = await db
      .select()
      .from(channelMessagesLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(channelMessagesLog.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return messages;
  } catch (error) {
    console.error("[DB] Failed to get messages:", error);
    return [];
  }
}

export async function logMessage(data: InsertChannelMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const [message] = await db
      .insert(channelMessagesLog)
      .values(data)
      .$returningId();

    return message;
  } catch (error) {
    console.error("[DB] Failed to log message:", error);
    throw error;
  }
}

export async function updateMessageStatus(
  id: number,
  data: { status: string; errorMessage?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const updateData: any = { status: data.status };
    
    if (data.status === 'sent') {
      updateData.sentAt = new Date();
    } else if (data.status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (data.status === 'read') {
      updateData.readAt = new Date();
    } else if (data.status === 'failed' && data.errorMessage) {
      updateData.errorMessage = data.errorMessage;
    }

    await db
      .update(channelMessagesLog)
      .set(updateData)
      .where(eq(channelMessagesLog.id, id));
  } catch (error) {
    console.error("[DB] Failed to update message status:", error);
    throw error;
  }
}

// ============================================================================
// ANTI-BLOCK SYSTEM
// ============================================================================

export async function getAntiblockConfig(channelId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const [config] = await db
      .select()
      .from(channelAntiblockConfig)
      .where(eq(channelAntiblockConfig.channelId, channelId))
      .limit(1);

    return config || null;
  } catch (error) {
    console.error("[DB] Failed to get antiblock config:", error);
    return null;
  }
}

export async function updateAntiblockConfig(
  channelId: number,
  data: Partial<ChannelAntiblockConfig>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(channelAntiblockConfig)
      .set(data)
      .where(eq(channelAntiblockConfig.channelId, channelId));

    return await getAntiblockConfig(channelId);
  } catch (error) {
    console.error("[DB] Failed to update antiblock config:", error);
    throw error;
  }
}

export async function canSendMessage(channelId: number): Promise<{
  canSend: boolean;
  reason?: string;
  waitSeconds?: number;
}> {
  const db = await getDb();
  if (!db) return { canSend: false, reason: "Database not available" };

  try {
    const channel = await getChannelById(channelId);
    if (!channel) {
      return { canSend: false, reason: "Channel not found" };
    }

    if (channel.status !== 'active') {
      return { canSend: false, reason: `Channel is ${channel.status}` };
    }

    if (channel.healthScore < 20) {
      return { canSend: false, reason: "Channel health too low (< 20%)" };
    }

    if (channel.messagesSentToday >= channel.dailyLimit) {
      return { canSend: false, reason: "Daily limit reached" };
    }

    const config = await getAntiblockConfig(channelId);
    if (config && channel.lastMessageAt) {
      const secondsSinceLastMessage = 
        (Date.now() - new Date(channel.lastMessageAt).getTime()) / 1000;
      
      if (secondsSinceLastMessage < config.minIntervalSeconds) {
        return {
          canSend: false,
          reason: "Minimum interval not reached",
          waitSeconds: Math.ceil(config.minIntervalSeconds - secondsSinceLastMessage),
        };
      }
    }

    return { canSend: true };
  } catch (error) {
    console.error("[DB] Failed to check if can send message:", error);
    return { canSend: false, reason: "Error checking permissions" };
  }
}

export async function getNextAvailableChannel(
  tenantId: number,
  purpose: 'reminders' | 'clinic_integration'
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const channels = await db
      .select()
      .from(communicationChannels)
      .where(
        and(
          eq(communicationChannels.tenantId, tenantId),
          eq(communicationChannels.channelPurpose, purpose),
          eq(communicationChannels.status, 'active')
        )
      )
      .orderBy(desc(communicationChannels.healthScore));

    for (const channel of channels) {
      const check = await canSendMessage(channel.id);
      if (check.canSend) {
        return channel;
      }
    }

    return null;
  } catch (error) {
    console.error("[DB] Failed to get next available channel:", error);
    return null;
  }
}

// ============================================================================
// ALERTS
// ============================================================================

export async function getAlerts(filters: {
  channelId?: number;
  resolved?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];
    if (filters.channelId) {
      conditions.push(eq(channelAlerts.channelId, filters.channelId));
    }
    if (filters.resolved !== undefined) {
      conditions.push(eq(channelAlerts.resolved, filters.resolved));
    }

    const alerts = await db
      .select()
      .from(channelAlerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(channelAlerts.createdAt))
      .limit(filters.limit || 20);

    return alerts;
  } catch (error) {
    console.error("[DB] Failed to get alerts:", error);
    return [];
  }
}

export async function resolveAlert(id: number, resolution?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(channelAlerts)
      .set({
        resolved: true,
        resolvedAt: new Date(),
        resolution: resolution || null,
      })
      .where(eq(channelAlerts.id, id));
  } catch (error) {
    console.error("[DB] Failed to resolve alert:", error);
    throw error;
  }
}

// ============================================================================
// EVOLUTION API INTEGRATION
// ============================================================================

export async function generateEvolutionQRCode(channelId: number) {
  const channel = await getChannelById(channelId);
  if (!channel) throw new Error("Channel not found");
  if (!channel.apiUrl || !channel.apiKey) {
    throw new Error("Evolution API credentials not configured");
  }

  try {
    const response = await axios.post(
      `${channel.apiUrl}/instance/create`,
      {
        instanceName: `odonto-chin-${channelId}`,
        qrcode: true,
      },
      {
        headers: {
          'apikey': channel.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      qrCode: response.data.qrcode?.code || response.data.qrcode,
      instanceName: response.data.instance?.instanceName,
    };
  } catch (error: any) {
    console.error("[Evolution API] Failed to generate QR code:", error);
    throw new Error(error.response?.data?.message || "Failed to generate QR code");
  }
}

export async function checkEvolutionConnection(channelId: number) {
  const channel = await getChannelById(channelId);
  if (!channel) throw new Error("Channel not found");
  if (!channel.apiUrl || !channel.apiKey) {
    throw new Error("Evolution API credentials not configured");
  }

  try {
    const response = await axios.get(
      `${channel.apiUrl}/instance/connectionState/odonto-chin-${channelId}`,
      {
        headers: {
          'apikey': channel.apiKey,
        },
      }
    );

    return {
      connected: response.data.state === 'open',
      state: response.data.state,
    };
  } catch (error: any) {
    console.error("[Evolution API] Failed to check connection:", error);
    return {
      connected: false,
      state: 'disconnected',
      error: error.response?.data?.message || "Failed to check connection",
    };
  }
}

export async function sendEvolutionTestMessage(
  channelId: number,
  recipientNumber: string,
  message: string
) {
  const channel = await getChannelById(channelId);
  if (!channel) throw new Error("Channel not found");
  if (!channel.apiUrl || !channel.apiKey) {
    throw new Error("Evolution API credentials not configured");
  }

  try {
    const response = await axios.post(
      `${channel.apiUrl}/message/sendText/odonto-chin-${channelId}`,
      {
        number: recipientNumber,
        text: message,
      },
      {
        headers: {
          'apikey': channel.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log message
    await logMessage({
      channelId,
      messageType: 'followup',
      recipientNumber,
      messageContent: message,
      status: 'sent',
      externalMessageId: response.data.key?.id,
    });

    return {
      success: true,
      messageId: response.data.key?.id,
    };
  } catch (error: any) {
    console.error("[Evolution API] Failed to send test message:", error);
    throw new Error(error.response?.data?.message || "Failed to send test message");
  }
}

export async function handleEvolutionWebhook(event: string, data: any) {
  const db = await getDb();
  if (!db) return;

  try {
    // Handle different webhook events
    if (event === 'messages.upsert') {
      // Update message status
      const messageId = data.key?.id;
      if (messageId) {
        const [message] = await db
          .select()
          .from(channelMessagesLog)
          .where(eq(channelMessagesLog.externalMessageId, messageId))
          .limit(1);

        if (message) {
          await updateMessageStatus(message.id, {
            status: data.status === 3 ? 'delivered' : 'sent',
          });
        }
      }
    } else if (event === 'connection.update') {
      // Update channel status
      // TODO: Implement channel status update based on connection state
    }
  } catch (error) {
    console.error("[Evolution Webhook] Failed to handle event:", error);
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getChannelStatistics(
  channelId: number,
  startDate?: string,
  endDate?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const conditions = [eq(channelMessagesLog.channelId, channelId)];
    
    if (startDate) {
      conditions.push(gte(channelMessagesLog.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(channelMessagesLog.createdAt, new Date(endDate)));
    }

    const [stats] = await db
      .select({
        totalMessages: sql<number>`COUNT(*)`,
        sentMessages: sql<number>`SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END)`,
        deliveredMessages: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`,
        failedMessages: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
        deliveryRate: sql<number>`ROUND(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)`,
      })
      .from(channelMessagesLog)
      .where(and(...conditions));

    return stats || null;
  } catch (error) {
    console.error("[DB] Failed to get channel statistics:", error);
    return null;
  }
}

export async function getComparativeStats(
  tenantId: number,
  purpose?: 'reminders' | 'clinic_integration',
  days: number = 7
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // TODO: Implement comparative statistics query
    // This would require joining channels with message logs and aggregating

    return [];
  } catch (error) {
    console.error("[DB] Failed to get comparative stats:", error);
    return [];
  }
}

export async function getDeliveryRate(channelId: number, hours: number = 24) {
  const db = await getDb();
  if (!db) return null;

  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [rate] = await db
      .select({
        totalMessages: sql<number>`COUNT(*)`,
        deliveredMessages: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`,
        deliveryRate: sql<number>`ROUND(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)`,
      })
      .from(channelMessagesLog)
      .where(
        and(
          eq(channelMessagesLog.channelId, channelId),
          gte(channelMessagesLog.createdAt, since)
        )
      );

    return rate || null;
  } catch (error) {
    console.error("[DB] Failed to get delivery rate:", error);
    return null;
  }
}
