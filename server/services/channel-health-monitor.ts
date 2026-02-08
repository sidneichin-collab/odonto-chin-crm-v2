/**
 * Channel Health Monitor Service
 * 
 * Serviço automático que monitora a saúde dos canais de comunicação
 * e executa ações preventivas para evitar bloqueios.
 * 
 * Funcionalidades:
 * - Atualização periódica de health score
 * - Detecção de problemas
 * - Criação de alertas
 * - Auto-pause de canais críticos
 * - Auto-rotate para canais alternativos
 */

import * as db from "../db-canal-recordatorios";
import { getDb } from "../db";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import {
  communicationChannels,
  channelMessagesLog,
  channelHealthHistory,
  channelAlerts,
} from "../../drizzle/schema-canal-recordatorios";

// Configurações do monitor
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const CRITICAL_HEALTH_THRESHOLD = 20;
const WARNING_HEALTH_THRESHOLD = 50;
const LOW_DELIVERY_RATE_THRESHOLD = 70; // %

/**
 * Classe principal do monitor de saúde
 */
export class ChannelHealthMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Inicia o monitoramento automático
   */
  start() {
    if (this.isRunning) {
      console.log("[Health Monitor] Already running");
      return;
    }

    console.log("[Health Monitor] Starting...");
    this.isRunning = true;

    // Executar imediatamente
    this.checkAllChannels();

    // Agendar execuções periódicas
    this.intervalId = setInterval(() => {
      this.checkAllChannels();
    }, HEALTH_CHECK_INTERVAL);

    console.log(`[Health Monitor] Started. Checking every ${HEALTH_CHECK_INTERVAL / 1000}s`);
  }

  /**
   * Para o monitoramento automático
   */
  stop() {
    if (!this.isRunning) {
      console.log("[Health Monitor] Not running");
      return;
    }

    console.log("[Health Monitor] Stopping...");
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log("[Health Monitor] Stopped");
  }

  /**
   * Verifica saúde de todos os canais ativos
   */
  private async checkAllChannels() {
    try {
      const database = await getDb();
      if (!database) {
        console.warn("[Health Monitor] Database not available");
        return;
      }

      // Buscar todos os canais ativos
      const channels = await database
        .select()
        .from(communicationChannels)
        .where(eq(communicationChannels.status, 'active'));

      console.log(`[Health Monitor] Checking ${channels.length} active channels...`);

      for (const channel of channels) {
        await this.checkChannelHealth(channel);
      }

      console.log("[Health Monitor] Health check completed");
    } catch (error) {
      console.error("[Health Monitor] Error checking channels:", error);
    }
  }

  /**
   * Verifica saúde de um canal específico
   */
  private async checkChannelHealth(channel: any) {
    try {
      const database = await getDb();
      if (!database) return;

      // Calcular métricas das últimas 24 horas
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [metrics] = await database
        .select({
          totalMessages: sql<number>`COUNT(*)`,
          sentMessages: sql<number>`SUM(CASE WHEN status IN ('sent', 'delivered', 'read') THEN 1 ELSE 0 END)`,
          deliveredMessages: sql<number>`SUM(CASE WHEN status IN ('delivered', 'read') THEN 1 ELSE 0 END)`,
          failedMessages: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
        })
        .from(channelMessagesLog)
        .where(
          and(
            eq(channelMessagesLog.channelId, channel.id),
            gte(channelMessagesLog.createdAt, last24h)
          )
        );

      // Calcular health score
      const totalMessages = metrics?.totalMessages || 0;
      const deliveredMessages = metrics?.deliveredMessages || 0;
      const failedMessages = metrics?.failedMessages || 0;

      let healthScore = 100;

      if (totalMessages > 0) {
        const deliveryRate = (deliveredMessages / totalMessages) * 100;
        const failureRate = (failedMessages / totalMessages) * 100;

        // Penalizar por baixa taxa de entrega
        if (deliveryRate < 90) {
          healthScore -= (90 - deliveryRate) * 2;
        }

        // Penalizar por alta taxa de falha
        healthScore -= failureRate * 3;

        // Garantir que não seja negativo
        healthScore = Math.max(0, Math.min(100, healthScore));
      }

      // Atualizar health score no banco
      await database
        .update(communicationChannels)
        .set({
          healthScore,
          lastHealthCheckAt: new Date(),
        })
        .where(eq(communicationChannels.id, channel.id));

      // Registrar no histórico
      await database.insert(channelHealthHistory).values({
        channelId: channel.id,
        healthScore,
        messagesSentLastHour: metrics?.totalMessages || 0,
        deliveryRate: totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : null,
        errorCount: failedMessages,
        checkedAt: new Date(),
      });

      // Verificar se precisa tomar ações
      await this.handleHealthActions(channel, healthScore, metrics);

      console.log(
        `[Health Monitor] Channel ${channel.id} (${channel.connectionName}): ` +
        `Health=${healthScore}%, Delivered=${deliveredMessages}/${totalMessages}, Failed=${failedMessages}`
      );
    } catch (error) {
      console.error(`[Health Monitor] Error checking channel ${channel.id}:`, error);
    }
  }

  /**
   * Executa ações baseadas na saúde do canal
   */
  private async handleHealthActions(channel: any, healthScore: number, metrics: any) {
    const database = await getDb();
    if (!database) return;

    const deliveryRate = metrics.totalMessages > 0
      ? (metrics.deliveredMessages / metrics.totalMessages) * 100
      : 100;

    // CRÍTICO: Auto-pause
    if (healthScore < CRITICAL_HEALTH_THRESHOLD) {
      console.warn(
        `[Health Monitor] CRITICAL: Channel ${channel.id} health is ${healthScore}%. Auto-pausing...`
      );

      await database
        .update(communicationChannels)
        .set({
          status: 'error',
          errorMessage: `Auto-paused due to critical health score: ${healthScore}%`,
        })
        .where(eq(communicationChannels.id, channel.id));

      // Criar alerta
      await database.insert(channelAlerts).values({
        channelId: channel.id,
        alertType: 'health_critical',
        severity: 'critical',
        message: `Channel health dropped to ${healthScore}%. Auto-paused to prevent blocking.`,
        metadata: { healthScore, deliveryRate, metrics },
      });

      return;
    }

    // AVISO: Baixa taxa de entrega
    if (deliveryRate < LOW_DELIVERY_RATE_THRESHOLD) {
      console.warn(
        `[Health Monitor] WARNING: Channel ${channel.id} delivery rate is ${deliveryRate.toFixed(1)}%`
      );

      // Verificar se já existe alerta não resolvido
      const [existingAlert] = await database
        .select()
        .from(channelAlerts)
        .where(
          and(
            eq(channelAlerts.channelId, channel.id),
            eq(channelAlerts.alertType, 'low_delivery_rate'),
            eq(channelAlerts.resolved, false)
          )
        )
        .limit(1);

      if (!existingAlert) {
        await database.insert(channelAlerts).values({
          channelId: channel.id,
          alertType: 'low_delivery_rate',
          severity: 'warning',
          message: `Delivery rate dropped to ${deliveryRate.toFixed(1)}%. Monitor closely.`,
          metadata: { healthScore, deliveryRate, metrics },
        });
      }
    }

    // AVISO: Limite diário próximo
    const usagePercent = (channel.messagesSentToday / channel.dailyLimit) * 100;
    if (usagePercent > 90) {
      console.warn(
        `[Health Monitor] WARNING: Channel ${channel.id} at ${usagePercent.toFixed(1)}% of daily limit`
      );

      const [existingAlert] = await database
        .select()
        .from(channelAlerts)
        .where(
          and(
            eq(channelAlerts.channelId, channel.id),
            eq(channelAlerts.alertType, 'limit_approaching'),
            eq(channelAlerts.resolved, false)
          )
        )
        .limit(1);

      if (!existingAlert) {
        await database.insert(channelAlerts).values({
          channelId: channel.id,
          alertType: 'limit_approaching',
          severity: 'warning',
          message: `Daily limit at ${usagePercent.toFixed(1)}% (${channel.messagesSentToday}/${channel.dailyLimit})`,
          metadata: { usagePercent, messagesSentToday: channel.messagesSentToday, dailyLimit: channel.dailyLimit },
        });
      }
    }

    // AVISO: Saúde baixa (mas não crítica)
    if (healthScore < WARNING_HEALTH_THRESHOLD && healthScore >= CRITICAL_HEALTH_THRESHOLD) {
      const [existingAlert] = await database
        .select()
        .from(channelAlerts)
        .where(
          and(
            eq(channelAlerts.channelId, channel.id),
            eq(channelAlerts.alertType, 'health_low'),
            eq(channelAlerts.resolved, false)
          )
        )
        .limit(1);

      if (!existingAlert) {
        await database.insert(channelAlerts).values({
          channelId: channel.id,
          alertType: 'health_low',
          severity: 'warning',
          message: `Channel health at ${healthScore}%. Consider reducing message volume.`,
          metadata: { healthScore, deliveryRate, metrics },
        });
      }
    }
  }
}

// Instância singleton do monitor
let monitorInstance: ChannelHealthMonitor | null = null;

/**
 * Obtém instância do monitor (singleton)
 */
export function getHealthMonitor(): ChannelHealthMonitor {
  if (!monitorInstance) {
    monitorInstance = new ChannelHealthMonitor();
  }
  return monitorInstance;
}

/**
 * Inicia o monitor de saúde automaticamente
 */
export function startHealthMonitor() {
  const monitor = getHealthMonitor();
  monitor.start();
}

/**
 * Para o monitor de saúde
 */
export function stopHealthMonitor() {
  if (monitorInstance) {
    monitorInstance.stop();
  }
}
