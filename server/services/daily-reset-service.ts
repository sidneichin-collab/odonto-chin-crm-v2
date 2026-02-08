/**
 * Daily Reset Service
 * 
 * Serviço que reseta contadores diários à meia-noite
 * para garantir que os limites diários sejam respeitados.
 * 
 * Funcionalidades:
 * - Reset de messages_sent_today
 * - Limpeza de alertas antigos
 * - Manutenção do histórico de saúde
 */

import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { communicationChannels, channelAlerts, channelHealthHistory } from "../../drizzle/schema-canal-recordatorios";

// Executar à meia-noite (00:00)
const RESET_HOUR = 0;
const RESET_MINUTE = 0;

/**
 * Classe do serviço de reset diário
 */
export class DailyResetService {
  private timeoutId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Inicia o serviço
   */
  start() {
    if (this.isRunning) {
      console.log("[Daily Reset] Already running");
      return;
    }

    console.log("[Daily Reset] Starting...");
    this.isRunning = true;

    // Agendar próxima execução
    this.scheduleNextReset();

    console.log("[Daily Reset] Started");
  }

  /**
   * Para o serviço
   */
  stop() {
    if (!this.isRunning) {
      console.log("[Daily Reset] Not running");
      return;
    }

    console.log("[Daily Reset] Stopping...");
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.isRunning = false;
    console.log("[Daily Reset] Stopped");
  }

  /**
   * Agenda próxima execução à meia-noite
   */
  private scheduleNextReset() {
    const now = new Date();
    const nextReset = new Date();
    
    nextReset.setHours(RESET_HOUR, RESET_MINUTE, 0, 0);
    
    // Se já passou da meia-noite hoje, agendar para amanhã
    if (nextReset <= now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    const msUntilReset = nextReset.getTime() - now.getTime();
    const hoursUntilReset = msUntilReset / (1000 * 60 * 60);

    console.log(
      `[Daily Reset] Next reset scheduled for ${nextReset.toISOString()} ` +
      `(in ${hoursUntilReset.toFixed(1)} hours)`
    );

    this.timeoutId = setTimeout(() => {
      this.executeReset();
      this.scheduleNextReset(); // Agendar próximo
    }, msUntilReset);
  }

  /**
   * Executa o reset diário
   */
  private async executeReset() {
    console.log("[Daily Reset] Executing daily reset...");

    try {
      await this.resetMessageCounters();
      await this.cleanupOldAlerts();
      await this.cleanupOldHealthHistory();
      
      console.log("[Daily Reset] Daily reset completed successfully");
    } catch (error) {
      console.error("[Daily Reset] Error during reset:", error);
    }
  }

  /**
   * Reseta contadores de mensagens
   */
  private async resetMessageCounters() {
    const database = await getDb();
    if (!database) {
      console.warn("[Daily Reset] Database not available");
      return;
    }

    try {
      // Chamar stored procedure
      await database.execute(sql`CALL sp_reset_daily_message_counters()`);
      
      console.log("[Daily Reset] Message counters reset");
    } catch (error) {
      console.error("[Daily Reset] Error resetting counters:", error);
    }
  }

  /**
   * Limpa alertas resolvidos antigos (mais de 30 dias)
   */
  private async cleanupOldAlerts() {
    const database = await getDb();
    if (!database) return;

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await database
        .delete(channelAlerts)
        .where(
          sql`resolved = TRUE AND resolved_at < ${thirtyDaysAgo}`
        );

      console.log(`[Daily Reset] Cleaned up old alerts`);
    } catch (error) {
      console.error("[Daily Reset] Error cleaning up alerts:", error);
    }
  }

  /**
   * Limpa histórico de saúde antigo (mais de 90 dias)
   */
  private async cleanupOldHealthHistory() {
    const database = await getDb();
    if (!database) return;

    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const result = await database
        .delete(channelHealthHistory)
        .where(
          sql`checked_at < ${ninetyDaysAgo}`
        );

      console.log(`[Daily Reset] Cleaned up old health history`);
    } catch (error) {
      console.error("[Daily Reset] Error cleaning up health history:", error);
    }
  }

  /**
   * Executa reset manualmente (para testes)
   */
  async executeManualReset() {
    console.log("[Daily Reset] Manual reset triggered");
    await this.executeReset();
  }
}

// Instância singleton
let serviceInstance: DailyResetService | null = null;

/**
 * Obtém instância do serviço (singleton)
 */
export function getDailyResetService(): DailyResetService {
  if (!serviceInstance) {
    serviceInstance = new DailyResetService();
  }
  return serviceInstance;
}

/**
 * Inicia o serviço automaticamente
 */
export function startDailyResetService() {
  const service = getDailyResetService();
  service.start();
}

/**
 * Para o serviço
 */
export function stopDailyResetService() {
  if (serviceInstance) {
    serviceInstance.stop();
  }
}
