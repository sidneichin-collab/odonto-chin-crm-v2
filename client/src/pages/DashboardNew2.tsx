/**
 * Dashboard Aprimorado - Versão 2.0
 * Visual moderno com KPIs destacados, gráficos interativos e ações rápidas
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MessageSquare,
  Phone,
  Activity,
  DollarSign,
  UserPlus,
  Send,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardNew2() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: stats, isLoading, refetch } = trpc.dashboard.getStats.useQuery();

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Dados mockados para gráficos (serão substituídos por dados reais)
  const weeklyData = [
    { day: 'Lun', confirmados: 12, pendientes: 5, completados: 10 },
    { day: 'Mar', confirmados: 15, pendientes: 3, completados: 14 },
    { day: 'Mié', confirmados: 18, pendientes: 4, completados: 16 },
    { day: 'Jue', confirmados: 14, pendientes: 6, completados: 12 },
    { day: 'Vie', confirmados: 20, pendientes: 2, completados: 18 },
    { day: 'Sáb', confirmados: 10, pendientes: 1, completados: 9 },
    { day: 'Dom', confirmados: 0, pendientes: 0, completados: 0 },
  ];

  const appointmentTypeData = [
    { name: 'Ortodoncia', value: 65, color: '#3b82f6' },
    { name: 'Clínico General', value: 35, color: '#10b981' },
  ];

  const channelHealthData = [
    { name: 'Clínica', health: 95 },
    { name: 'Recordatorios', health: 88 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalAgendados = stats?.totalAgendadosHoy || 0;
  const confirmados = stats?.confirmadosHoy || 0;
  const pendientes = stats?.pendientesHoy || 0;
  const taxaConfirmacao = totalAgendados > 0 ? Math.round((confirmados / totalAgendados) * 100) : 0;
  const totalPacientes = stats?.totalPacientes || 0;
  const pacientesRiesgo = stats?.pacientesRiesgo || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation('/pacientes/new')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
          <Button onClick={() => setLocation('/agendamientos')}>
            <Calendar className="h-4 w-4 mr-2" />
            Nuevo Agendamiento
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Agendados Hoy */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Agendados Hoy</p>
                <p className="text-4xl font-bold mt-2">{totalAgendados}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-400 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% vs ayer
                  </Badge>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmados */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Confirmados</p>
                <p className="text-4xl font-bold mt-2">{confirmados}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-green-400 text-white">
                    {taxaConfirmacao}% del total
                  </Badge>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                <p className="text-4xl font-bold mt-2">{pendientes}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
                    onClick={() => setLocation('/canal-recordatorios')}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Enviar Recordatorios
                  </Button>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pacientes en Riesgo */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Pacientes en Riesgo</p>
                <p className="text-4xl font-bold mt-2">{pacientesRiesgo}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-red-400 text-red-900 hover:bg-red-300"
                    onClick={() => setLocation('/pacientes-riesgo')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalles
                  </Button>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Agendamentos da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos da Semana</CardTitle>
            <CardDescription>Comparação de confirmados vs pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="confirmados" fill="#10b981" name="Confirmados" />
                <Bar dataKey="pendientes" fill="#f59e0b" name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo de Cita */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Ortodoncia vs Clínico General</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Saúde dos Canais e Ações Rápidas */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Saúde dos Canais */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Saúde dos Canais WhatsApp</CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelHealthData.map((channel) => (
              <div key={channel.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{channel.name}</span>
                  <Badge variant={channel.health >= 90 ? 'default' : channel.health >= 70 ? 'secondary' : 'destructive'}>
                    {channel.health}%
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      channel.health >= 90 ? 'bg-green-500' : channel.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${channel.health}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" onClick={() => setLocation('/salud-canales')}>
              <Activity className="h-4 w-4 mr-2" />
              Ver Detalhes Completos
            </Button>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às funções principais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/mensajes-recibidos')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensajes Recibidos
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/solicitudes-reagendamiento')}>
              <Clock className="h-4 w-4 mr-2" />
              Reagendamientos
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/templates')}>
              <Send className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/insights-ia')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Insights IA
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/configuracao-ia')}>
              <Activity className="h-4 w-4 mr-2" />
              Configurar IA
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>Agendamentos para hoje</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setLocation('/agendamientos')}>
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.proximosAgendamentos?.slice(0, 5).map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{apt.patientName}</p>
                    <p className="text-sm text-gray-500">{apt.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{apt.hora}</p>
                  <Badge variant={apt.estado === 'Confirmada' ? 'default' : 'secondary'}>
                    {apt.estado}
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
