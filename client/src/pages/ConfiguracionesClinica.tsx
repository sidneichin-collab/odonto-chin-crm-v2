import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  MessageSquare,
  Save,
  CheckCircle2,
  Settings
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ConfiguracionesClinica() {
  const [activeTab, setActiveTab] = useState("general");
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    // Informações Gerais
    clinicName: "ORTOBOM ODONTOLOGÍA",
    clinicAddress: "Av. Principal 123, La Paz",
    clinicCity: "La Paz",
    clinicCountry: "Bolivia",
    clinicPhone: "+591 7654-3210",
    clinicWhatsApp: "+591 7654-3210",
    clinicEmail: "contacto@ortobom.com",
    clinicWebsite: "www.ortobom.com",
    
    // Configurações Regionais
    timezone: "America/La_Paz",
    language: "es",
    currency: "BOB",
    dateFormat: "DD/MM/YYYY",
    
    // Horário de Funcionamento
    workingHours: {
      monday: { open: "08:00", close: "18:00", enabled: true },
      tuesday: { open: "08:00", close: "18:00", enabled: true },
      wednesday: { open: "08:00", close: "18:00", enabled: true },
      thursday: { open: "08:00", close: "18:00", enabled: true },
      friday: { open: "08:00", close: "18:00", enabled: true },
      saturday: { open: "08:00", close: "13:00", enabled: true },
      sunday: { open: "00:00", close: "00:00", enabled: false }
    },
    
    // Templates de Mensagens
    reminderTemplate3Days: "🦷 Hola {nombre}! Te recordamos tu cita de {tipo} en *{clinica}* el {fecha} a las {hora}. Por favor confirma tu asistencia.",
    reminderTemplate1Day: "🦷 Hola {nombre}! Tu cita de {tipo} es MAÑANA {fecha} a las {hora} en {clinica}. ¿Confirmas tu asistencia?",
    reminderTemplate2Hours: "🦷 Hola {nombre}! Tu cita de {tipo} es en 2 HORAS ({hora}) en {clinica}. ¡Te esperamos!",
    thankYouTemplate: "🦷 Gracias por confiar en {clinica} para tu tratamiento de {tipo}. ¡Que tengas un excelente día!",
    
    // Configurações de Lembretes
    enableReminders: true,
    enable3DaysReminder: true,
    enable1DayReminder: true,
    enable2HoursReminder: true,
    enableThankYou: true
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Aqui você salvaria no backend via tRPC
      toast.success("Configuraciones guardadas exitosamente");
    } catch (error) {
      toast.error("Error al guardar configuraciones");
    }
  };

  const daysOfWeek = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-500" />
              Configuraciones de Clínica
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Personaliza la información y configuraciones de tu clínica
            </p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Building2 className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="horarios">
              <Clock className="h-4 w-4 mr-2" />
              Horarios
            </TabsTrigger>
            <TabsTrigger value="mensajes">
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensajes
            </TabsTrigger>
            <TabsTrigger value="recordatorios">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Recordatorios
            </TabsTrigger>
          </TabsList>

          {/* Tab: General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Clínica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre de la Clínica</Label>
                    <Input
                      value={formData.clinicName}
                      onChange={(e) => handleInputChange("clinicName", e.target.value)}
                      placeholder="ORTOBOM ODONTOLOGÍA"
                    />
                  </div>
                  <div>
                    <Label>Ciudad</Label>
                    <Input
                      value={formData.clinicCity}
                      onChange={(e) => handleInputChange("clinicCity", e.target.value)}
                      placeholder="La Paz"
                    />
                  </div>
                </div>

                <div>
                  <Label>Dirección</Label>
                  <Input
                    value={formData.clinicAddress}
                    onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                    placeholder="Av. Principal 123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>País</Label>
                    <Select value={formData.clinicCountry} onValueChange={(v) => handleInputChange("clinicCountry", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bolivia">Bolivia</SelectItem>
                        <SelectItem value="Paraguay">Paraguay</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Peru">Perú</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Zona Horaria</Label>
                    <Select value={formData.timezone} onValueChange={(v) => handleInputChange("timezone", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/La_Paz">La Paz (GMT-4)</SelectItem>
                        <SelectItem value="America/Asuncion">Asunción (GMT-3)</SelectItem>
                        <SelectItem value="America/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                        <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                        <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Teléfono</Label>
                    <div className="flex gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-3" />
                      <Input
                        value={formData.clinicPhone}
                        onChange={(e) => handleInputChange("clinicPhone", e.target.value)}
                        placeholder="+591 7654-3210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <div className="flex gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500 mt-3" />
                      <Input
                        value={formData.clinicWhatsApp}
                        onChange={(e) => handleInputChange("clinicWhatsApp", e.target.value)}
                        placeholder="+591 7654-3210"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <div className="flex gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-3" />
                      <Input
                        type="email"
                        value={formData.clinicEmail}
                        onChange={(e) => handleInputChange("clinicEmail", e.target.value)}
                        placeholder="contacto@ortobom.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Sitio Web</Label>
                    <div className="flex gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground mt-3" />
                      <Input
                        value={formData.clinicWebsite}
                        onChange={(e) => handleInputChange("clinicWebsite", e.target.value)}
                        placeholder="www.ortobom.com"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Horarios */}
          <TabsContent value="horarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Horario de Atención</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map(({ key, label }) => {
                  const hours = formData.workingHours[key as keyof typeof formData.workingHours];
                  return (
                    <div key={key} className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg">
                      <div className="w-32">
                        <span className="font-semibold">{label}</span>
                      </div>
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) => handleWorkingHoursChange(key, "enabled", checked)}
                      />
                      {hours.enabled ? (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleWorkingHoursChange(key, "open", e.target.value)}
                            className="w-32"
                          />
                          <span>a</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleWorkingHoursChange(key, "close", e.target.value)}
                            className="w-32"
                          />
                        </>
                      ) : (
                        <span className="text-muted-foreground">Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Mensajes */}
          <TabsContent value="mensajes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensajes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Variables disponibles: {"{nombre}"}, {"{clinica}"}, {"{fecha}"}, {"{hora}"}, {"{tipo}"}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Recordatorio 3 Días Antes</Label>
                  <Textarea
                    value={formData.reminderTemplate3Days}
                    onChange={(e) => handleInputChange("reminderTemplate3Days", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Recordatorio 1 Día Antes</Label>
                  <Textarea
                    value={formData.reminderTemplate1Day}
                    onChange={(e) => handleInputChange("reminderTemplate1Day", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Recordatorio 2 Horas Antes</Label>
                  <Textarea
                    value={formData.reminderTemplate2Hours}
                    onChange={(e) => handleInputChange("reminderTemplate2Hours", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Mensaje de Agradecimiento</Label>
                  <Textarea
                    value={formData.thankYouTemplate}
                    onChange={(e) => handleInputChange("thankYouTemplate", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Recordatorios */}
          <TabsContent value="recordatorios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Recordatorios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <div className="font-semibold">Habilitar Recordatorios Automáticos</div>
                    <div className="text-sm text-muted-foreground">Sistema completo de recordatorios</div>
                  </div>
                  <Switch
                    checked={formData.enableReminders}
                    onCheckedChange={(checked) => handleInputChange("enableReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <div className="font-semibold">Recordatorio 3 Días Antes</div>
                    <div className="text-sm text-muted-foreground">Enviar 3 días antes de la cita</div>
                  </div>
                  <Switch
                    checked={formData.enable3DaysReminder}
                    onCheckedChange={(checked) => handleInputChange("enable3DaysReminder", checked)}
                    disabled={!formData.enableReminders}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <div className="font-semibold">Recordatorio 1 Día Antes</div>
                    <div className="text-sm text-muted-foreground">Enviar 1 día antes de la cita</div>
                  </div>
                  <Switch
                    checked={formData.enable1DayReminder}
                    onCheckedChange={(checked) => handleInputChange("enable1DayReminder", checked)}
                    disabled={!formData.enableReminders}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <div className="font-semibold">Recordatorio 2 Horas Antes</div>
                    <div className="text-sm text-muted-foreground">Enviar 2 horas antes de la cita</div>
                  </div>
                  <Switch
                    checked={formData.enable2HoursReminder}
                    onCheckedChange={(checked) => handleInputChange("enable2HoursReminder", checked)}
                    disabled={!formData.enableReminders}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div>
                    <div className="font-semibold">Mensaje de Agradecimiento</div>
                    <div className="text-sm text-muted-foreground">Enviar 2 horas después de la cita</div>
                  </div>
                  <Switch
                    checked={formData.enableThankYou}
                    onCheckedChange={(checked) => handleInputChange("enableThankYou", checked)}
                    disabled={!formData.enableReminders}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
