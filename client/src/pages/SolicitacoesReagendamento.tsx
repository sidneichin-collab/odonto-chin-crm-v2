/**
 * Página de Solicitações de Reagendamento
 * 
 * Interface para gerenciar solicitações de reagendamento com alertas visuais e sonoros
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';

export default function SolicitacoesReagendamento() {
  const [requests, setRequests] = useState<any[]>([]);
  const [playAlert, setPlayAlert] = useState(false);

  // Simular carregamento de solicitações pendentes
  useEffect(() => {
    // TODO: Conectar com tRPC para buscar solicitações reais
    // const { data } = trpc.rescheduling.getPendingRequests.useQuery({ clinicId: 1 });
  }, []);

  // Tocar alerta sonoro quando há novas solicitações
  useEffect(() => {
    if (requests.length > 0 && playAlert) {
      const audio = new Audio('/alert-sound.mp3');
      audio.play().catch(console.error);
    }
  }, [requests, playAlert]);

  const handleMarkAsHandled = async (requestId: string) => {
    // TODO: Conectar com tRPC
    // await trpc.rescheduling.markAsHandled.mutate({ requestId, secretaryId: 1 });
    alert(`Solicitação ${requestId} marcada como tratada!`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header com Alerta */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔄 Solicitações de Reagendamento</h1>
            <p className="text-gray-400">Solicitações pendentes que requerem atenção da secretária</p>
          </div>
          {requests.length > 0 && (
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg animate-pulse">
              <div className="text-2xl font-bold">{requests.length}</div>
              <div className="text-sm">Pendentes</div>
            </div>
          )}
        </div>
      </div>

      {/* Alertas Ativos */}
      {requests.length > 0 && (
        <div className="bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg p-6 mb-6 animate-pulse">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🚨</div>
            <div>
              <h3 className="text-xl font-semibold mb-1">Atenção! Solicitações Pendentes</h3>
              <p className="text-sm text-gray-300">
                Há {requests.length} solicitação(ões) de reagendamento aguardando sua atenção.
                O paciente já foi notificado que você entrará em contato.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm opacity-90">Pendentes</div>
        </div>
        <div className="bg-green-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm opacity-90">Tratadas Hoje</div>
        </div>
        <div className="bg-blue-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm opacity-90">Total (Mês)</div>
        </div>
        <div className="bg-purple-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0 min</div>
          <div className="text-sm opacity-90">Tempo Médio de Resposta</div>
        </div>
      </div>

      {/* Tabela de Solicitações */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Solicitações Pendentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Consulta Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Solicitado Em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    🎉 Nenhuma solicitação pendente! Todas foram tratadas.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{request.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${request.patientWhatsApp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300"
                      >
                        {request.patientWhatsApp}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{new Date(request.originalDate).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-400">{request.originalTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{new Date(request.requestedAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-medium">
                        Pendente
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleMarkAsHandled(request.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Marcar como Tratada
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regras de Reagendamento */}
      <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Regras de Reagendamento
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span><strong>Detecção Automática:</strong> Sistema detecta palavras-chave de reagendamento</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span><strong>Resposta Automática:</strong> Paciente recebe mensagem: "A secretária te escreve agora para reagendar, obrigado [Nome]"</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span><strong>Notificação WhatsApp:</strong> Nome e link do WhatsApp enviados para o WhatsApp corporativo</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span><strong>Alerta Visual:</strong> Popup com animação pulsante aparece no dashboard</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span><strong>Alerta Sonoro:</strong> Som de alerta toca para chamar atenção</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🚫</span>
            <span><strong>PROIBIDO:</strong> Sistema NÃO pode reagendar automaticamente (apenas secretária)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
