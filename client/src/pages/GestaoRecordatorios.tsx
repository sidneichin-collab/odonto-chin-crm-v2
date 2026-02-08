/**
 * Página de Gestão de Recordatórios
 * 
 * Interface para gerenciar o sistema de recordatórios com regras inquebráveis
 */

import React, { useState } from 'react';
import { trpc } from '../lib/trpc';

export default function GestaoRecordatorios() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📅 Gestão de Recordatórios</h1>
        <p className="text-gray-400">Sistema de recordatórios com regras inquebráveis</p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="sent">Enviados</option>
              <option value="failed">Falhados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="2_days_before">2 Dias Antes</option>
              <option value="1_day_before">1 Dia Antes</option>
              <option value="same_day">Dia da Consulta</option>
              <option value="post_confirmation">Pós-Confirmação</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm opacity-90">Agendados</div>
        </div>
        <div className="bg-green-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm opacity-90">Enviados</div>
        </div>
        <div className="bg-yellow-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0</div>
          <div className="text-sm opacity-90">Confirmados</div>
        </div>
        <div className="bg-purple-600 rounded-lg p-6">
          <div className="text-3xl font-bold mb-2">0%</div>
          <div className="text-sm opacity-90">Taxa de Confirmação</div>
        </div>
      </div>

      {/* Tabela de Mensagens */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Mensagens Agendadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Consulta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Tentativa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Agendado Para
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
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Nenhuma mensagem agendada para esta data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Regras Inquebráveis */}
      <div className="mt-6 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🔒</span>
          Regras Inquebráveis Ativas
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Horário: Mensagens apenas entre 07:00 e 19:00</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Confirmação: Para recordatórios ao confirmar</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Reagendamento: Detecta solicitações e notifica secretária</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Sequência: 2 dias antes (3x), 1 dia antes (7x), dia da consulta (2x)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Personalização: Nome do paciente e saudação por horário</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
