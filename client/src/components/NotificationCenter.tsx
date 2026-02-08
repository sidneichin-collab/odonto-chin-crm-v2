import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { trpc } from '../lib/trpc';

interface Notification {
  id: string;
  type: 'rescheduling' | 'channel_health' | 'message_received' | 'appointment' | 'system';
  title: string;
  body: string;
  icon?: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userId = 1; // TODO: Get from auth context

  // Fetch notifications
  const { data: notificationsData, refetch } = trpc.notifications.list.useQuery(
    { userId, limit: 50 },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const { data: unreadData } = trpc.notifications.getUnread.useQuery(
    { userId },
    { refetchInterval: 10000 } // Refetch every 10 seconds
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteMutation = trpc.notifications.delete.useMutation();

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  const unreadCount = unreadData?.length || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync({ userId, notificationId });
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync({ userId });
    refetch();
  };

  const handleDelete = async (notificationId: string) => {
    await deleteMutation.mutateAsync({ userId, notificationId });
    refetch();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-500/10';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-500/10';
      case 'normal': return 'border-l-4 border-blue-500 bg-blue-500/10';
      case 'low': return 'border-l-4 border-gray-500 bg-gray-500/10';
      default: return 'border-l-4 border-gray-500 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rescheduling': return '🔄';
      case 'channel_health': return '💚';
      case 'message_received': return '💬';
      case 'appointment': return '⏰';
      case 'system': return 'ℹ️';
      default: return '🔔';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">Notificações</h3>
                <p className="text-sm text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo lido'}
                </p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-5 h-5 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-800/50 transition-colors ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-gray-800/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${notification.read ? 'text-gray-400' : 'text-gray-300'}`}>
                            {notification.body}
                          </p>

                          {/* Actions */}
                          <div className="flex gap-2 mt-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Marcar como lida
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
