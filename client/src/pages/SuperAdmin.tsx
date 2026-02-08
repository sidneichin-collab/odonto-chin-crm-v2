/**
 * Panel Super-Admin
 * Gestión de Clínicas y Solicitudes
 */

import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<'stats' | 'pending' | 'clinics'>('stats');
  const [token, setToken] = useState('');
  
  // Obtener token del localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔐 Panel Super-Admin</h1>
        <p className="text-gray-400">Gestión de Clínicas y Solicitudes</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'stats'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📊 Estadísticas
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'pending'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📋 Solicitudes Pendientes
        </button>
        <button
          onClick={() => setActiveTab('clinics')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'clinics'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🏥 Clínicas Activas
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'stats' && <StatsTab token={token} />}
      {activeTab === 'pending' && <PendingRequestsTab token={token} />}
      {activeTab === 'clinics' && <ClinicsTab token={token} />}
    </div>
  );
}

// ============================================================================
// TAB: ESTADÍSTICAS
// ============================================================================

function StatsTab({ token }: { token: string }) {
  const { data: stats, isLoading } = trpc.auth.getSystemStats.useQuery({ token });
  
  if (isLoading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>;
  }
  
  if (!stats) {
    return <div className="text-center py-8 text-red-400">Error al cargar estadísticas</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Clínicas */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-semibold">Total Clínicas</h3>
          <span className="text-2xl">🏥</span>
        </div>
        <p className="text-4xl font-bold text-blue-400">{stats.totalClinics}</p>
        <p className="text-gray-500 text-sm mt-2">Registradas en el sistema</p>
      </div>
      
      {/* Clínicas Activas */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-semibold">Clínicas Activas</h3>
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-4xl font-bold text-green-400">{stats.activeClinics}</p>
        <p className="text-gray-500 text-sm mt-2">Operando actualmente</p>
      </div>
      
      {/* Solicitudes Pendientes */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-semibold">Solicitudes Pendientes</h3>
          <span className="text-2xl">⏳</span>
        </div>
        <p className="text-4xl font-bold text-yellow-400">{stats.pendingRequests}</p>
        <p className="text-gray-500 text-sm mt-2">Esperando aprobación</p>
      </div>
      
      {/* Total Usuarios */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-semibold">Total Usuarios</h3>
          <span className="text-2xl">👥</span>
        </div>
        <p className="text-4xl font-bold text-purple-400">{stats.totalUsers}</p>
        <p className="text-gray-500 text-sm mt-2">Usuarios registrados</p>
      </div>
      
      {/* Capacidad */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 col-span-full">
        <h3 className="text-gray-400 text-sm font-semibold mb-4">📈 Capacidad del Sistema</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Clínicas Activas</span>
              <span className="text-sm font-semibold">{stats.activeClinics} / 150</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${(stats.activeClinics / 150) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">
              {Math.round((stats.activeClinics / 150) * 100)}%
            </p>
            <p className="text-xs text-gray-500">Capacidad usada</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: SOLICITUDES PENDIENTES
// ============================================================================

function PendingRequestsTab({ token }: { token: string }) {
  const { data: requests, isLoading, refetch } = trpc.auth.getPendingRequests.useQuery({ token });
  const approveMutation = trpc.auth.approveRequest.useMutation();
  const rejectMutation = trpc.auth.rejectRequest.useMutation();
  
  const [reviewNotes, setReviewNotes] = useState<{ [key: number]: string }>({});
  
  const handleApprove = async (requestId: number) => {
    if (!confirm('¿Aprobar esta solicitud?')) return;
    
    try {
      await approveMutation.mutateAsync({
        token,
        requestId,
        reviewNotes: reviewNotes[requestId] || undefined,
      });
      alert('✅ Solicitud aprobada');
      refetch();
    } catch (error) {
      alert('❌ Error al aprobar solicitud');
      console.error(error);
    }
  };
  
  const handleReject = async (requestId: number) => {
    const notes = prompt('Motivo del rechazo (opcional):');
    if (notes === null) return;
    
    try {
      await rejectMutation.mutateAsync({
        token,
        requestId,
        reviewNotes: notes || undefined,
      });
      alert('✅ Solicitud rechazada');
      refetch();
    } catch (error) {
      alert('❌ Error al rechazar solicitud');
      console.error(error);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Cargando solicitudes...</div>;
  }
  
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-gray-400">No hay solicitudes pendientes</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {requests.map((request: any) => (
        <div key={request.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{request.clinicName}</h3>
              <p className="text-gray-400 text-sm">
                📍 {request.city}, {request.country}
              </p>
            </div>
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
              Pendiente
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-500 text-sm">Contacto</p>
              <p className="text-white font-semibold">{request.contactName}</p>
              {request.contactRole && (
                <p className="text-gray-400 text-sm">{request.contactRole}</p>
              )}
            </div>
            
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-white">{request.email}</p>
            </div>
            
            {request.phone && (
              <div>
                <p className="text-gray-500 text-sm">Teléfono</p>
                <p className="text-white">{request.phone}</p>
              </div>
            )}
            
            {request.whatsapp && (
              <div>
                <p className="text-gray-500 text-sm">WhatsApp</p>
                <p className="text-white">{request.whatsapp}</p>
              </div>
            )}
          </div>
          
          {request.message && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-1">Mensaje</p>
              <p className="text-gray-300 bg-gray-900 p-3 rounded">{request.message}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-500 text-sm mb-2">
              Notas de revisión (opcional)
            </label>
            <textarea
              value={reviewNotes[request.id] || ''}
              onChange={(e) => setReviewNotes({ ...reviewNotes, [request.id]: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
              rows={2}
              placeholder="Agregar notas..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleApprove(request.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              ✅ Aprobar
            </button>
            <button
              onClick={() => handleReject(request.id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              ❌ Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TAB: CLÍNICAS ACTIVAS
// ============================================================================

function ClinicsTab({ token }: { token: string }) {
  // TODO: Implementar listado de clínicas activas
  // Por ahora, mostrar mensaje
  
  return (
    <div className="text-center py-12">
      <p className="text-2xl mb-2">🏥</p>
      <p className="text-gray-400">Listado de clínicas activas</p>
      <p className="text-gray-500 text-sm mt-2">(En desarrollo)</p>
    </div>
  );
}
