/**
 * tRPC Routers - Notifications
 * Endpoints para sistema de notificações
 */

import { z } from 'zod';
import { router, publicProcedure } from './_core/trpc';
import { notificationService } from './services/notification-service';

export const notificationsRouter = router({
  /**
   * Obter todas as notificações do usuário
   */
  list: publicProcedure
    .input(z.object({
      userId: z.number(),
      limit: z.number().optional(),
    }))
    .query(({ input }) => {
      return notificationService.getUserNotifications(input.userId, input.limit);
    }),

  /**
   * Obter notificações não lidas
   */
  getUnread: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(({ input }) => {
      return notificationService.getUnreadNotifications(input.userId);
    }),

  /**
   * Marcar notificação como lida
   */
  markAsRead: publicProcedure
    .input(z.object({
      userId: z.number(),
      notificationId: z.string(),
    }))
    .mutation(({ input }) => {
      const success = notificationService.markAsRead(input.userId, input.notificationId);
      return { success };
    }),

  /**
   * Marcar todas como lidas
   */
  markAllAsRead: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(({ input }) => {
      const count = notificationService.markAllAsRead(input.userId);
      return { count };
    }),

  /**
   * Deletar notificação
   */
  delete: publicProcedure
    .input(z.object({
      userId: z.number(),
      notificationId: z.string(),
    }))
    .mutation(({ input }) => {
      const success = notificationService.deleteNotification(input.userId, input.notificationId);
      return { success };
    }),

  /**
   * Limpar notificações antigas
   */
  clearOld: publicProcedure
    .input(z.object({
      userId: z.number(),
      daysOld: z.number().default(30),
    }))
    .mutation(({ input }) => {
      const count = notificationService.clearOldNotifications(input.userId, input.daysOld);
      return { count };
    }),

  /**
   * Adicionar subscription de push
   */
  subscribe: publicProcedure
    .input(z.object({
      userId: z.number(),
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
    }))
    .mutation(({ input }) => {
      notificationService.addSubscription(input.userId, {
        userId: input.userId,
        endpoint: input.endpoint,
        keys: input.keys,
      });
      return { success: true };
    }),

  /**
   * Remover subscription
   */
  unsubscribe: publicProcedure
    .input(z.object({
      userId: z.number(),
      endpoint: z.string(),
    }))
    .mutation(({ input }) => {
      const success = notificationService.removeSubscription(input.userId, input.endpoint);
      return { success };
    }),

  /**
   * Criar notificação de teste
   */
  createTest: publicProcedure
    .input(z.object({
      userId: z.number(),
      type: z.enum(['rescheduling', 'channel_health', 'message_received', 'appointment', 'system']),
    }))
    .mutation(({ input }) => {
      let notification;

      switch (input.type) {
        case 'rescheduling':
          notification = notificationService.notifyRescheduling(
            input.userId,
            'João Silva',
            '15/02/2026 às 14:00'
          );
          break;
        case 'channel_health':
          notification = notificationService.notifyChannelHealth(
            input.userId,
            'Canal WhatsApp Recordatorios',
            15
          );
          break;
        case 'message_received':
          notification = notificationService.notifyMessageReceived(
            input.userId,
            'Maria Santos',
            'Olá, gostaria de confirmar minha consulta...'
          );
          break;
        case 'appointment':
          notification = notificationService.notifyUpcomingAppointment(
            input.userId,
            'Pedro Costa',
            '30 minutos'
          );
          break;
        case 'system':
          notification = notificationService.notifySystem(
            input.userId,
            'Sistema Atualizado',
            'O sistema foi atualizado com sucesso!',
            'normal'
          );
          break;
      }

      return notification;
    }),

  /**
   * Obter estatísticas
   */
  getStats: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(({ input }) => {
      return notificationService.getStats(input.userId);
    }),
});
