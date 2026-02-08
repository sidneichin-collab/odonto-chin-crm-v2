import { useState } from 'react';
import { Bell, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '../lib/trpc';

export default function TestNotifications() {
  const [selectedType, setSelectedType] = useState<'rescheduling' | 'channel_health' | 'message_received' | 'appointment' | 'system'>('rescheduling');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const userId = 1; // TODO: Get from auth context

  const createTestMutation = trpc.notifications.createTest.useMutation();
  const { data: stats } = trpc.notifications.getStats.useQuery({ userId });

  const handleSendTest = async () => {
    try {
      const notification = await createTestMutation.mutateAsync({
        userId,
        type: selectedType,
      });

      setResult({
        success: true,
        message: `Notificação criada: ${notification.title}`,
      });

      // Clear result after 3 seconds
      setTimeout(() => setResult(null), 3000);
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao criar notificação',
      });
    }
  };

  const notificationTypes = [
    {
      value: 'rescheduling',
      label: 'Reagendamento',
      icon: '🔄',
      description: 'Solicitação de reagendamento de paciente',
    },
    {
      value: 'channel_health',
      label: 'Saúde do Canal',
      icon: '💚',
      description: 'Alerta de saúde do canal WhatsApp',
    },
    {
      value: 'message_received',
      label: 'Mensagem Recebida',
      icon: '💬',
      description: 'Nova mensagem de paciente',
    },
    {
      value: 'appointment',
      label: 'Agendamento Próximo',
      icon: '⏰',
      description: 'Lembrete de consulta próxima',
    },
    {
      value: 'system',
      label: 'Sistema',
      icon: 'ℹ️',
      description: 'Notificação do sistema',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Teste de Notificações</h1>
          </div>
          <p className="text-gray-400">
            Teste o sistema de notificações push do CRM
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Test Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Types */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Tipo de Notificação</h2>
              <div className="space-y-3">
                {notificationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as any)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedType === type.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{type.label}</h3>
                        <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                      </div>
                      {selectedType === type.value && (
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <button
                onClick={handleSendTest}
                disabled={createTestMutation.isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {createTestMutation.isLoading ? 'Enviando...' : 'Enviar Notificação de Teste'}
              </button>

              {/* Result Message */}
              {result && (
                <div
                  className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                    result.success
                      ? 'bg-green-500/10 border border-green-500/50'
                      : 'bg-red-500/10 border border-red-500/50'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Estatísticas</h2>
              
              {stats ? (
                <div className="space-y-4">
                  {/* Total */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Total de Notificações</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                  </div>

                  {/* Unread */}
                  <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                    <p className="text-sm text-blue-400">Não Lidas</p>
                    <p className="text-3xl font-bold text-blue-500 mt-1">{stats.unread}</p>
                  </div>

                  {/* By Type */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Por Tipo</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 capitalize">{type}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Priority */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Por Prioridade</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.byPriority).map(([priority, count]) => (
                        <div key={priority} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 capitalize">{priority}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Carregando estatísticas...</p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Como Usar</h2>
              <ol className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>Selecione um tipo de notificação</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>Clique em "Enviar Notificação de Teste"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>Veja a notificação aparecer no sino 🔔 no topo</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <span>Clique no sino para ver todas as notificações</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
