/**
 * Notification Service
 * Sistema de notificações push para o CRM
 */

export interface Notification {
  id: string;
  type: 'rescheduling' | 'channel_health' | 'message_received' | 'appointment' | 'system';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationSubscription {
  userId: number;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private notifications: Map<number, Notification[]> = new Map();
  private subscriptions: Map<number, NotificationSubscription[]> = new Map();

  /**
   * Criar nova notificação
   */
  createNotification(userId: number, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.unshift(newNotification);
    this.notifications.set(userId, userNotifications);

    // Enviar push notification se houver subscription
    this.sendPushNotification(userId, newNotification);

    return newNotification;
  }

  /**
   * Obter notificações do usuário
   */
  getUserNotifications(userId: number, limit?: number): Notification[] {
    const notifications = this.notifications.get(userId) || [];
    return limit ? notifications.slice(0, limit) : notifications;
  }

  /**
   * Obter notificações não lidas
   */
  getUnreadNotifications(userId: number): Notification[] {
    const notifications = this.notifications.get(userId) || [];
    return notifications.filter(n => !n.read);
  }

  /**
   * Marcar notificação como lida
   */
  markAsRead(userId: number, notificationId: string): boolean {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  /**
   * Marcar todas como lidas
   */
  markAllAsRead(userId: number): number {
    const notifications = this.notifications.get(userId);
    if (!notifications) return 0;

    let count = 0;
    notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });

    return count;
  }

  /**
   * Deletar notificação
   */
  deleteNotification(userId: number, notificationId: string): boolean {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const index = notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    notifications.splice(index, 1);
    return true;
  }

  /**
   * Limpar notificações antigas
   */
  clearOldNotifications(userId: number, daysOld: number = 30): number {
    const notifications = this.notifications.get(userId);
    if (!notifications) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialLength = notifications.length;
    const filtered = notifications.filter(n => n.timestamp > cutoffDate);
    this.notifications.set(userId, filtered);

    return initialLength - filtered.length;
  }

  /**
   * Adicionar subscription de push
   */
  addSubscription(userId: number, subscription: NotificationSubscription): void {
    const userSubscriptions = this.subscriptions.get(userId) || [];
    
    // Verificar se já existe
    const exists = userSubscriptions.some(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      userSubscriptions.push(subscription);
      this.subscriptions.set(userId, userSubscriptions);
    }
  }

  /**
   * Remover subscription
   */
  removeSubscription(userId: number, endpoint: string): boolean {
    const userSubscriptions = this.subscriptions.get(userId);
    if (!userSubscriptions) return false;

    const index = userSubscriptions.findIndex(s => s.endpoint === endpoint);
    if (index === -1) return false;

    userSubscriptions.splice(index, 1);
    return true;
  }

  /**
   * Enviar push notification
   */
  private async sendPushNotification(userId: number, notification: Notification): Promise<void> {
    const subscriptions = this.subscriptions.get(userId);
    if (!subscriptions || subscriptions.length === 0) return;

    // TODO: Implementar envio real usando web-push
    // Por enquanto, apenas simula o envio
    console.log(`[Push Notification] Enviando para usuário ${userId}:`, {
      title: notification.title,
      body: notification.body,
      type: notification.type,
    });
  }

  /**
   * Criar notificação de reagendamento
   */
  notifyRescheduling(userId: number, patientName: string, appointmentDate: string): Notification {
    return this.createNotification(userId, {
      type: 'rescheduling',
      title: '🔄 Solicitação de Reagendamento',
      body: `${patientName} solicitou reagendamento para ${appointmentDate}`,
      icon: '/icons/calendar.png',
      priority: 'urgent',
      data: { patientName, appointmentDate },
    });
  }

  /**
   * Criar notificação de saúde do canal
   */
  notifyChannelHealth(userId: number, channelName: string, healthScore: number): Notification {
    const priority = healthScore < 20 ? 'urgent' : healthScore < 50 ? 'high' : 'normal';
    const emoji = healthScore < 20 ? '🔴' : healthScore < 50 ? '🟡' : '🟢';

    return this.createNotification(userId, {
      type: 'channel_health',
      title: `${emoji} Saúde do Canal: ${channelName}`,
      body: `Health score: ${healthScore}%. ${healthScore < 20 ? 'Ação urgente necessária!' : healthScore < 50 ? 'Atenção recomendada.' : 'Canal saudável.'}`,
      icon: '/icons/health.png',
      priority,
      data: { channelName, healthScore },
    });
  }

  /**
   * Criar notificação de mensagem recebida
   */
  notifyMessageReceived(userId: number, patientName: string, messagePreview: string): Notification {
    return this.createNotification(userId, {
      type: 'message_received',
      title: `💬 Nova Mensagem: ${patientName}`,
      body: messagePreview,
      icon: '/icons/message.png',
      priority: 'normal',
      data: { patientName, messagePreview },
    });
  }

  /**
   * Criar notificação de agendamento próximo
   */
  notifyUpcomingAppointment(userId: number, patientName: string, appointmentTime: string): Notification {
    return this.createNotification(userId, {
      type: 'appointment',
      title: `⏰ Agendamento Próximo`,
      body: `${patientName} tem consulta em ${appointmentTime}`,
      icon: '/icons/appointment.png',
      priority: 'high',
      data: { patientName, appointmentTime },
    });
  }

  /**
   * Criar notificação de sistema
   */
  notifySystem(userId: number, title: string, body: string, priority: Notification['priority'] = 'normal'): Notification {
    return this.createNotification(userId, {
      type: 'system',
      title: `ℹ️ ${title}`,
      body,
      icon: '/icons/system.png',
      priority,
    });
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obter estatísticas de notificações
   */
  getStats(userId: number): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const notifications = this.notifications.get(userId) || [];

    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
export const notificationService = new NotificationService();
