/**
 * Agenda Melhorada - Visualização avançada com drag-and-drop
 * Suporta visualização por dia, semana e mês
 * Cores por tipo de cita, filtros avançados
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, Plus, Clock, User, Phone } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

type ViewMode = 'day' | 'week' | 'month';

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  fecha: string;
  hora: string;
  tipo: 'Ortodontia' | 'Clinico General';
  estado: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';
  telefono?: string;
  notas?: string;
}

export default function AgendaMelhorada() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);

  // Query para buscar agendamentos
  const { data: appointments, isLoading, refetch } = trpc.agendamientos.list.useQuery();

  // Mutation para atualizar agendamento
  const updateMutation = trpc.agendamientos.update.useMutation({
    onSuccess: () => {
      toast.success('Agendamento atualizado!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  // Filtrar agendamentos
  const filteredAppointments = appointments?.filter((apt: any) => {
    const matchesSearch = apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || apt.tipo === filterTipo;
    const matchesEstado = filterEstado === 'all' || apt.estado === filterEstado;
    
    // Filtrar por data dependendo do modo de visualização
    const aptDate = new Date(apt.fecha);
    const isInRange = isDateInRange(aptDate, selectedDate, viewMode);
    
    return matchesSearch && matchesTipo && matchesEstado && isInRange;
  }) || [];

  // Verificar se uma data está no range de visualização
  function isDateInRange(date: Date, selectedDate: Date, mode: ViewMode): boolean {
    if (mode === 'day') {
      return date.toDateString() === selectedDate.toDateString();
    } else if (mode === 'week') {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return date >= weekStart && date <= weekEnd;
    } else {
      return date.getMonth() === selectedDate.getMonth() && 
             date.getFullYear() === selectedDate.getFullYear();
    }
  }

  // Obter início da semana
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda-feira
    return new Date(d.setDate(diff));
  }

  // Navegação de datas
  function navigateDate(direction: 'prev' | 'next') {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setSelectedDate(newDate);
  }

  // Formatar data para exibição
  function formatDateDisplay(): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('es-ES', options);
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
  }

  // Cores por tipo
  function getColorByTipo(tipo: string): string {
    return tipo === 'Ortodontia' ? 'bg-blue-500' : 'bg-green-500';
  }

  function getColorByEstado(estado: string): string {
    switch (estado) {
      case 'Confirmada': return 'bg-green-100 text-green-800 border-green-300';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Completada': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Cancelada': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  // Drag and Drop handlers
  function handleDragStart(apt: Appointment) {
    setDraggedAppointment(apt);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(newDate: string, newHora?: string) {
    if (!draggedAppointment) return;

    updateMutation.mutate({
      id: draggedAppointment.id,
      fecha: newDate,
      hora: newHora || draggedAppointment.hora,
    });

    setDraggedAppointment(null);
  }

  // Agrupar agendamentos por hora
  function groupByHora(appointments: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();
    appointments.forEach(apt => {
      const hora = apt.hora || '00:00';
      if (!grouped.has(hora)) {
        grouped.set(hora, []);
      }
      grouped.get(hora)!.push(apt);
    });
    return grouped;
  }

  // Renderizar visualização por dia
  function renderDayView() {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8h às 20h
    const groupedApts = groupByHora(filteredAppointments);

    return (
      <div className="space-y-2">
        {hours.map(hour => {
          const hourStr = `${hour.toString().padStart(2, '0')}:00`;
          const apts = groupedApts.get(hourStr) || [];
          
          return (
            <div
              key={hour}
              className="flex gap-4 border-b pb-2"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(selectedDate.toISOString().split('T')[0], hourStr)}
            >
              <div className="w-20 text-sm font-medium text-gray-500 pt-2">
                {hourStr}
              </div>
              <div className="flex-1 min-h-[60px] space-y-2">
                {apts.map(apt => (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={() => handleDragStart(apt)}
                    className={`p-3 rounded-lg border-2 cursor-move hover:shadow-lg transition-shadow ${getColorByEstado(apt.estado)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getColorByTipo(apt.tipo)}`}></div>
                        <span className="font-medium">{apt.patientName}</span>
                      </div>
                      <Badge variant="outline">{apt.tipo}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {apt.hora}
                      </span>
                      {apt.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {apt.telefono}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Renderizar visualização por semana
  function renderWeekView() {
    const weekStart = getWeekStart(selectedDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayApts = filteredAppointments.filter((apt: any) => {
            const aptDate = new Date(apt.fecha);
            return aptDate.toDateString() === day.toDateString();
          });

          return (
            <div
              key={day.toISOString()}
              className="border rounded-lg p-2 min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(day.toISOString().split('T')[0])}
            >
              <div className="text-center font-medium mb-2">
                <div className="text-xs text-gray-500">
                  {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                </div>
                <div className="text-lg">
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {dayApts.map((apt: any) => (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={() => handleDragStart(apt)}
                    className={`p-2 rounded text-xs cursor-move hover:shadow ${getColorByEstado(apt.estado)}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${getColorByTipo(apt.tipo)} mb-1`}></div>
                    <div className="font-medium truncate">{apt.patientName}</div>
                    <div className="text-gray-600">{apt.hora}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Renderizar visualização por mês
  function renderMonthView() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Cabeçalho dos dias da semana */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center font-medium text-sm text-gray-500 p-2">
            {day}
          </div>
        ))}
        
        {/* Dias do mês */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="border rounded-lg p-2 min-h-[100px] bg-gray-50"></div>;
          }

          const date = new Date(year, month, day);
          const dayApts = filteredAppointments.filter((apt: any) => {
            const aptDate = new Date(apt.fecha);
            return aptDate.toDateString() === date.toDateString();
          });

          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={day}
              className={`border rounded-lg p-2 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors ${isToday ? 'border-blue-500 bg-blue-50' : ''}`}
              onClick={() => {
                setSelectedDate(date);
                setViewMode('day');
              }}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(date.toISOString().split('T')[0])}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                {day}
              </div>
              <div className="space-y-1">
                {dayApts.slice(0, 3).map((apt: any) => (
                  <div
                    key={apt.id}
                    draggable
                    onDragStart={() => handleDragStart(apt)}
                    className={`p-1 rounded text-xs cursor-move ${getColorByEstado(apt.estado)}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${getColorByTipo(apt.tipo)} inline-block mr-1`}></div>
                    <span className="truncate">{apt.hora}</span>
                  </div>
                ))}
                {dayApts.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayApts.length - 3} más</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda Melhorada</h1>
          <p className="text-gray-500 mt-1">Visualização avançada com drag-and-drop</p>
        </div>
        <Button onClick={() => setLocation('/agendamientos')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Agendamiento
        </Button>
      </div>

      {/* Controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Navegação de Data */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[250px] text-center font-medium">
                {formatDateDisplay()}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                Hoy
              </Button>
            </div>

            {/* Modo de Visualização */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Día
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Mes
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                <SelectItem value="Clinico General">Clínico General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium">Tipos:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Ortodontia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Clínico General</span>
            </div>
            <span className="text-sm font-medium ml-4">Estados:</span>
            <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
            <Badge className="bg-gray-100 text-gray-800">Completada</Badge>
            <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Visualização */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
