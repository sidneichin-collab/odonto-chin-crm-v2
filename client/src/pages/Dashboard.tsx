import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, CheckCircle, Clock, Users, X, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { QuickPatientRegistration } from "@/components/QuickPatientRegistration";

export default function Dashboard() {
  const [showQuickRegistration, setShowQuickRegistration] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: stats, isLoading, refetch } = trpc.dashboard.stats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Formatar data
  const formatDate = (date: Date) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  // Formatar hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Obter dia seguinte
  const getTomorrow = () => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Calendário mini
  const renderMiniCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(new Date(year, month, day))}
          className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
            isToday
              ? 'bg-blue-500 text-white font-bold'
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 w-32 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-12 w-16 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const todayStats = [
    {
      title: "Citas de Hoy",
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      description: "Consultas agendadas para hoje",
      color: "text-white",
      bgColor: "bg-blue-500",
    },
    {
      title: "Confirmadas",
      value: 0,
      icon: CheckCircle,
      description: "Pacientes confirmaram presença",
      color: "text-white",
      bgColor: "bg-green-500",
    },
    {
      title: "Pendientes",
      value: 0,
      icon: Clock,
      description: "Esperando confirmación",
      color: "text-white",
      bgColor: "bg-orange-500",
    },
    {
      title: "Completadas",
      value: 0,
      icon: Users,
      description: "Consultas finalizadas hoje",
      color: "text-white",
      bgColor: "bg-purple-500",
    },
  ];

  const tomorrowStats = [
    {
      title: "Confirmadas Mañana",
      value: 0,
      icon: CheckCircle,
      color: "text-white",
      bgColor: "bg-green-500",
    },
    {
      title: "Pendientes Mañana",
      value: 0,
      icon: Clock,
      color: "text-white",
      bgColor: "bg-orange-500",
    },
    {
      title: "Canceladas Mañana",
      value: 0,
      icon: X,
      color: "text-white",
      bgColor: "bg-red-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com Data e Hora */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              {formatDate(selectedDate)}
            </p>
            <p className="text-2xl font-mono font-bold text-blue-500 mt-1">
              {formatTime(currentTime)}
            </p>
          </div>

          {/* Mini Calendário */}
          <Card className="w-80 bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeMonth(-1)}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-sm font-medium">
                  {selectedDate.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeMonth(1)}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <div key={i} className="h-8 flex items-center justify-center text-xs text-gray-500 font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderMiniCalendar()}
              </div>
              <Button
                onClick={goToToday}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                Hoje
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Registration Modal */}
        <QuickPatientRegistration
          open={showQuickRegistration}
          onOpenChange={setShowQuickRegistration}
          onSuccess={() => refetch()}
        />

        {/* Citas de Hoy */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {todayStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className={`${stat.bgColor} border-0 hover:shadow-lg transition-shadow cursor-pointer`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-lg font-semibold ${stat.color}`}>
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <p className={`text-sm ${stat.color} opacity-90`}>{stat.description}</p>
                  <p className={`text-xs ${stat.color} opacity-75 mt-2`}>Clic para ver detalhes</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Citas de Mañana */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Citas de Mañana - {formatDate(getTomorrow())}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {tomorrowStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className={`${stat.bgColor} border-0 hover:shadow-lg transition-shadow cursor-pointer`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-lg font-semibold ${stat.color}`}>
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                    <p className={`text-xs ${stat.color} opacity-75 mt-2`}>Clic para ver detalhes</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Botão Flutuante */}
        <Button
          onClick={() => setShowQuickRegistration(true)}
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="icon"
        >
          <UserPlus className="h-6 w-6" />
        </Button>
      </div>
    </DashboardLayout>
  );
}
