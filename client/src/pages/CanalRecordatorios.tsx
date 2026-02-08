import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Radio, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Settings,
  TrendingUp,
  MessageSquare,
  Zap,
  Shield,
  BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Mock data - substituir por dados reais do tRPC
const mockChannels = [
  {
    id: 1,
    name: "WhatsApp Principal",
    type: "whatsapp",
    purpose: "clinic_integration",
    status: "active",
    healthScore: 95,
    messagesSentToday: 234,
    dailyLimit: 1000,
    isDefault: true,
  },
  {
    id: 2,
    name: "WhatsApp Recordatórios",
    type: "whatsapp",
    purpose: "reminders",
    status: "active",
    healthScore: 88,
    messagesSentToday: 567,
    dailyLimit: 1000,
    isDefault: false,
  },
  {
    id: 3,
    name: "Messenger Marketing",
    type: "messenger",
    purpose: "reminders",
    status: "inactive",
    healthScore: 100,
    messagesSentToday: 0,
    dailyLimit: 500,
    isDefault: false,
  },
];

export default function CanalRecordatorios() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<"clinic_integration" | "reminders">("reminders");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-500";
      case "error": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500">Atenção</Badge>;
    return <Badge className="bg-red-500">Crítico</Badge>;
  };

  const clinicChannels = mockChannels.filter(c => c.purpose === "clinic_integration");
  const reminderChannels = mockChannels.filter(c => c.purpose === "reminders");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Radio className="h-8 w-8 text-cyan-500" />
            Canal de Recordatórios
          </h1>
          <p className="text-gray-400 mt-2">
            Sistema avanzado de gestión de canales con anti-bloqueo y monitoreo de salud
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600 gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Canal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Canal</DialogTitle>
              <DialogDescription>
                Configure un nuevo canal de comunicación para recordatorios o integración clínica
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Propósito del Canal</Label>
                <Select value={selectedPurpose} onValueChange={(v: any) => setSelectedPurpose(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic_integration">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span>Canal Integración Clínica</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="reminders">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>Canal de Recordatórios</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                  {selectedPurpose === "clinic_integration" 
                    ? "Canal principal de la clínica para comunicación general"
                    : "Canal secundario dedicado exclusivamente a mensajes masivos y recordatorios"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Canal</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp Business</SelectItem>
                    <SelectItem value="messenger">Facebook Messenger</SelectItem>
                    <SelectItem value="n8n">n8n Webhook</SelectItem>
                    <SelectItem value="chatwoot">Chatwoot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nombre de Conexión</Label>
                <Input placeholder="Ej: WhatsApp Recordatórios Bolivia" />
              </div>

              <div className="space-y-2">
                <Label>Identificador (Número/ID)</Label>
                <Input placeholder="Ej: +591 12345678" />
              </div>

              <div className="space-y-2">
                <Label>URL de API</Label>
                <Input placeholder="https://api.evolution.com/..." />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" placeholder="••••••••••••" />
              </div>

              <div className="space-y-2">
                <Label>Límite Diario de Mensajes</Label>
                <Input type="number" defaultValue="1000" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Establecer como Canal Predeterminado</Label>
                  <p className="text-xs text-gray-400">
                    Este canal será usado por defecto para {selectedPurpose === "reminders" ? "recordatorios" : "comunicación clínica"}
                  </p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                Guardar Canal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Canales Activos</p>
                <p className="text-2xl font-bold text-white">
                  {mockChannels.filter(c => c.status === "active").length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Mensajes Hoy</p>
                <p className="text-2xl font-bold text-white">
                  {mockChannels.reduce((acc, c) => acc + c.messagesSentToday, 0)}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Salud Promedio</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(mockChannels.reduce((acc, c) => acc + c.healthScore, 0) / mockChannels.length)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Alertas Activas</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Canales Separados */}
      <Tabs defaultValue="reminders" className="space-y-4">
        <TabsList className="bg-gray-900">
          <TabsTrigger value="reminders" className="gap-2">
            <Zap className="h-4 w-4" />
            Canal de Recordatórios
            <Badge variant="secondary">{reminderChannels.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="clinic" className="gap-2">
            <Shield className="h-4 w-4" />
            Canal Integración Clínica
            <Badge variant="secondary">{clinicChannels.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Canal de Recordatórios */}
        <TabsContent value="reminders" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Canales de Recordatórios
              </CardTitle>
              <CardDescription>
                Canales dedicados exclusivamente a mensajes masivos y recordatorios de citas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminderChannels.map((channel) => (
                  <Card key={channel.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${getStatusColor(channel.status)} animate-pulse`} />
                            <h3 className="text-lg font-semibold text-white">{channel.name}</h3>
                            {channel.isDefault && (
                              <Badge variant="secondary" className="bg-cyan-500 text-white">
                                Predeterminado
                              </Badge>
                            )}
                            {getHealthBadge(channel.healthScore)}
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-400">Tipo</p>
                              <p className="text-sm text-white capitalize">{channel.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Mensajes Hoy</p>
                              <p className="text-sm text-white">{channel.messagesSentToday} / {channel.dailyLimit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Salud del Canal</p>
                              <p className={`text-sm font-semibold ${getHealthColor(channel.healthScore)}`}>
                                {channel.healthScore}%
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Uso Diario</span>
                              <span className="text-white">
                                {Math.round((channel.messagesSentToday / channel.dailyLimit) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(channel.messagesSentToday / channel.dailyLimit) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Configurar
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Activity className="h-4 w-4" />
                            Ver Salud
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {reminderChannels.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay canales de recordatórios configurados</p>
                    <Button 
                      className="mt-4 bg-cyan-500 hover:bg-cyan-600"
                      onClick={() => {
                        setSelectedPurpose("reminders");
                        setIsAddDialogOpen(true);
                      }}
                    >
                      Agregar Primer Canal
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Canal Integración Clínica */}
        <TabsContent value="clinic" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Canal Integración Clínica
              </CardTitle>
              <CardDescription>
                Canal principal de la clínica para comunicación general con pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clinicChannels.map((channel) => (
                  <Card key={channel.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${getStatusColor(channel.status)} animate-pulse`} />
                            <h3 className="text-lg font-semibold text-white">{channel.name}</h3>
                            {channel.isDefault && (
                              <Badge variant="secondary" className="bg-blue-500 text-white">
                                Predeterminado
                              </Badge>
                            )}
                            {getHealthBadge(channel.healthScore)}
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-400">Tipo</p>
                              <p className="text-sm text-white capitalize">{channel.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Mensajes Hoy</p>
                              <p className="text-sm text-white">{channel.messagesSentToday} / {channel.dailyLimit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Salud del Canal</p>
                              <p className={`text-sm font-semibold ${getHealthColor(channel.healthScore)}`}>
                                {channel.healthScore}%
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Uso Diario</span>
                              <span className="text-white">
                                {Math.round((channel.messagesSentToday / channel.dailyLimit) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(channel.messagesSentToday / channel.dailyLimit) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Configurar
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Activity className="h-4 w-4" />
                            Ver Salud
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {clinicChannels.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay canales de integración clínica configurados</p>
                    <Button 
                      className="mt-4 bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        setSelectedPurpose("clinic_integration");
                        setIsAddDialogOpen(true);
                      }}
                    >
                      Agregar Canal Principal
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estadísticas */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-500" />
                Estadísticas y Monitoreo
              </CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento de los canales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-400">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Estadísticas en desarrollo</p>
                <p className="text-sm mt-2">Gráficos de rendimiento, tasas de entrega y análisis histórico</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
