import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db-canal-recordatorios";

// Default tenant ID for standalone mode
const DEFAULT_TENANT_ID = 1;

/**
 * Router tRPC para gestão de Canal de Recordatórios
 * 
 * Funcionalidades:
 * - CRUD de canais de comunicação
 * - Monitoramento de saúde dos canais
 * - Sistema anti-bloqueio
 * - Logs de mensagens
 * - Estatísticas e analytics
 */
export const canalRecordatoriosRouter = router({
  
  // ============================================================================
  // CHANNELS - CRUD
  // ============================================================================
  
  channels: {
    /**
     * Lista todos os canais do tenant
     * Filtra por propósito (reminders ou clinic_integration)
     */
    list: publicProcedure
      .input(z.object({
        purpose: z.enum(['reminders', 'clinic_integration']).optional(),
      }).optional())
      .query(async ({ input }) => {
        const channels = await db.getChannelsByTenant(
          DEFAULT_TENANT_ID,
          input?.purpose
        );
        return channels;
      }),

    /**
     * Busca canal por ID
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const channel = await db.getChannelById(input.id);
        return channel;
      }),

    /**
     * Cria novo canal de comunicação
     */
    create: publicProcedure
      .input(z.object({
        channelType: z.enum(['whatsapp', 'messenger', 'n8n', 'chatwoot']),
        channelPurpose: z.enum(['reminders', 'clinic_integration']),
        connectionName: z.string().min(1).max(100),
        identifier: z.string().optional(), // número de telefone, page ID, etc.
        apiUrl: z.string().url().optional(),
        apiKey: z.string().optional(), // será criptografado
        webhookUrl: z.string().url().optional(),
        accessToken: z.string().optional(), // será criptografado
        dailyLimit: z.number().int().positive().default(1000),
        metadata: z.record(z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        const channel = await db.createChannel({
          ...input,
          tenantId: DEFAULT_TENANT_ID,
        });
        return channel;
      }),

    /**
     * Atualiza canal existente
     */
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        connectionName: z.string().min(1).max(100).optional(),
        identifier: z.string().optional(),
        apiUrl: z.string().url().optional(),
        apiKey: z.string().optional(),
        webhookUrl: z.string().url().optional(),
        accessToken: z.string().optional(),
        dailyLimit: z.number().int().positive().optional(),
        status: z.enum(['active', 'inactive', 'error', 'connecting']).optional(),
        isDefault: z.boolean().optional(),
        metadata: z.record(z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const channel = await db.updateChannel(id, data);
        return channel;
      }),

    /**
     * Deleta canal (soft delete - marca como inativo)
     */
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteChannel(input.id);
        return { success: true };
      }),

    /**
     * Define canal como padrão para envio de recordatórios
     */
    setDefault: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.setDefaultChannel(input.id, DEFAULT_TENANT_ID);
        return { success: true };
      }),
  },

  // ============================================================================
  // HEALTH & MONITORING
  // ============================================================================

  health: {
    /**
     * Obtém saúde atual de um canal
     */
    getChannelHealth: publicProcedure
      .input(z.object({ channelId: z.number() }))
      .query(async ({ input }) => {
        const health = await db.getChannelHealth(input.channelId);
        return health;
      }),

    /**
     * Obtém histórico de saúde de um canal
     */
    getHealthHistory: publicProcedure
      .input(z.object({
        channelId: z.number(),
        hours: z.number().int().positive().default(24),
      }))
      .query(async ({ input }) => {
        const history = await db.getHealthHistory(input.channelId, input.hours);
        return history;
      }),

    /**
     * Força atualização de saúde de um canal
     */
    updateHealth: publicProcedure
      .input(z.object({ channelId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateChannelHealth(input.channelId);
        return { success: true };
      }),

    /**
     * Obtém estatísticas globais de todos os canais
     */
    getGlobalStats: publicProcedure.query(async () => {
      const stats = await db.getGlobalChannelStats(DEFAULT_TENANT_ID);
      return stats;
    }),
  },

  // ============================================================================
  // MESSAGES LOG
  // ============================================================================

  messages: {
    /**
     * Lista mensagens enviadas por um canal
     */
    list: publicProcedure
      .input(z.object({
        channelId: z.number().optional(),
        status: z.enum(['queued', 'sent', 'delivered', 'read', 'failed']).optional(),
        limit: z.number().int().positive().default(50),
        offset: z.number().int().nonnegative().default(0),
      }))
      .query(async ({ input }) => {
        const messages = await db.getMessages(input);
        return messages;
      }),

    /**
     * Registra nova mensagem enviada
     */
    log: publicProcedure
      .input(z.object({
        channelId: z.number(),
        patientId: z.number().optional(),
        appointmentId: z.number().optional(),
        messageType: z.enum(['reminder_2days', 'reminder_1day', 'reminder_day', 'confirmation', 'followup']),
        recipientNumber: z.string(),
        messageContent: z.string(),
        status: z.enum(['queued', 'sent', 'delivered', 'read', 'failed']).default('queued'),
        externalMessageId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const message = await db.logMessage(input);
        return message;
      }),

    /**
     * Atualiza status de uma mensagem
     */
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['queued', 'sent', 'delivered', 'read', 'failed']),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateMessageStatus(id, data);
        return { success: true };
      }),
  },

  // ============================================================================
  // ANTI-BLOCK SYSTEM
  // ============================================================================

  antiblock: {
    /**
     * Obtém configuração anti-bloqueio de um canal
     */
    getConfig: publicProcedure
      .input(z.object({ channelId: z.number() }))
      .query(async ({ input }) => {
        const config = await db.getAntiblockConfig(input.channelId);
        return config;
      }),

    /**
     * Atualiza configuração anti-bloqueio
     */
    updateConfig: publicProcedure
      .input(z.object({
        channelId: z.number(),
        dailyLimit: z.number().int().positive().optional(),
        hourlyLimit: z.number().int().positive().optional(),
        minIntervalSeconds: z.number().int().positive().optional(),
        autoRotateEnabled: z.boolean().optional(),
        autoPauseThreshold: z.number().int().min(0).max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        const { channelId, ...data } = input;
        const config = await db.updateAntiblockConfig(channelId, data);
        return config;
      }),

    /**
     * Verifica se canal pode enviar mensagem agora
     */
    canSendMessage: publicProcedure
      .input(z.object({ channelId: z.number() }))
      .query(async ({ input }) => {
        const canSend = await db.canSendMessage(input.channelId);
        return canSend;
      }),

    /**
     * Obtém próximo canal disponível para envio (rotação)
     */
    getNextAvailableChannel: publicProcedure
      .input(z.object({
        purpose: z.enum(['reminders', 'clinic_integration']).default('reminders'),
      }))
      .query(async ({ input }) => {
        const channel = await db.getNextAvailableChannel(DEFAULT_TENANT_ID, input.purpose);
        return channel;
      }),
  },

  // ============================================================================
  // ALERTS
  // ============================================================================

  alerts: {
    /**
     * Lista alertas ativos
     */
    list: publicProcedure
      .input(z.object({
        channelId: z.number().optional(),
        resolved: z.boolean().optional(),
        limit: z.number().int().positive().default(20),
      }))
      .query(async ({ input }) => {
        const alerts = await db.getAlerts(input);
        return alerts;
      }),

    /**
     * Marca alerta como resolvido
     */
    resolve: publicProcedure
      .input(z.object({
        id: z.number(),
        resolution: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.resolveAlert(input.id, input.resolution);
        return { success: true };
      }),
  },

  // ============================================================================
  // EVOLUTION API INTEGRATION
  // ============================================================================

  evolution: {
    /**
     * Gera QR Code para pareamento WhatsApp
     */
    generateQRCode: publicProcedure
      .input(z.object({
        channelId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const qrCode = await db.generateEvolutionQRCode(input.channelId);
        return qrCode;
      }),

    /**
     * Verifica status de conexão com Evolution API
     */
    checkConnection: publicProcedure
      .input(z.object({
        channelId: z.number(),
      }))
      .query(async ({ input }) => {
        const status = await db.checkEvolutionConnection(input.channelId);
        return status;
      }),

    /**
     * Envia mensagem de teste via Evolution API
     */
    sendTestMessage: publicProcedure
      .input(z.object({
        channelId: z.number(),
        recipientNumber: z.string(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.sendEvolutionTestMessage(
          input.channelId,
          input.recipientNumber,
          input.message || "Mensaje de prueba del sistema Odonto Chin CRM. Canal de recordatorios funcionando correctamente."
        );
        return result;
      }),

    /**
     * Webhook para receber eventos da Evolution API
     */
    webhook: publicProcedure
      .input(z.object({
        event: z.string(),
        data: z.record(z.any()),
      }))
      .mutation(async ({ input }) => {
        await db.handleEvolutionWebhook(input.event, input.data);
        return { success: true };
      }),
  },

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  statistics: {
    /**
     * Obtém estatísticas de uso de um canal
     */
    getChannelStats: publicProcedure
      .input(z.object({
        channelId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const stats = await db.getChannelStatistics(input.channelId, input.startDate, input.endDate);
        return stats;
      }),

    /**
     * Obtém estatísticas comparativas de todos os canais
     */
    getComparativeStats: publicProcedure
      .input(z.object({
        purpose: z.enum(['reminders', 'clinic_integration']).optional(),
        days: z.number().int().positive().default(7),
      }))
      .query(async ({ input }) => {
        const stats = await db.getComparativeStats(DEFAULT_TENANT_ID, input.purpose, input.days);
        return stats;
      }),

    /**
     * Obtém taxa de entrega por período
     */
    getDeliveryRate: publicProcedure
      .input(z.object({
        channelId: z.number(),
        hours: z.number().int().positive().default(24),
      }))
      .query(async ({ input }) => {
        const rate = await db.getDeliveryRate(input.channelId, input.hours);
        return rate;
      }),
  },
});

export type CanalRecordatoriosRouter = typeof canalRecordatoriosRouter;
