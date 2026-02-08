import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { 
  Send, 
  Upload, 
  Users, 
  FileText, 
  Image, 
  Video, 
  Mic, 
  File,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EnvioMasivo() {
  // Estado
  const [messageType, setMessageType] = useState<"template" | "manual">("template");
  const [contentType, setContentType] = useState<"text" | "audio" | "video" | "image" | "document">("text");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [sendSpeed, setSendSpeed] = useState("normal"); // slow, normal, fast
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Queries
  const { data: patients } = trpc.patients.list.useQuery();
  const { data: patientsAtRisk } = trpc.patients.withoutAppointments.useQuery();
  const { data: templates } = trpc.templates?.list.useQuery();

  // Estado de envio
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState<{
    total: number;
    sent: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Handlers
  const handlePatientToggle = (patientId: number) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (patients) {
      setSelectedPatients(patients.map((p: any) => p.id));
    }
  };

  const handleSelectNone = () => {
    setSelectedPatients([]);
  };

  const handleSelectAtRisk = () => {
    if (patientsAtRisk) {
      setSelectedPatients(patientsAtRisk.map((p: any) => p.id));
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      // Aqui você processaria o CSV e extrairia os IDs dos pacientes
      toast.success(`CSV cargado: ${file.name}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`Archivo cargado: ${file.name}`);
    }
  };

  const handleSend = async () => {
    if (selectedPatients.length === 0) {
      toast.error("Selecciona al menos un paciente");
      return;
    }

    if (messageType === "template" && !selectedTemplate) {
      toast.error("Selecciona un template");
      return;
    }

    if (messageType === "manual" && !manualMessage && !uploadedFile) {
      toast.error("Escribe un mensaje o sube un archivo");
      return;
    }

    setIsSending(true);
    setSendProgress(0);

    // Simular envio
    const total = selectedPatients.length;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < total; i++) {
      // Simular delay baseado na velocidade
      const delays = { slow: 5000, normal: 2000, fast: 500 };
      await new Promise(resolve => setTimeout(resolve, delays[sendSpeed as keyof typeof delays]));

      // Simular sucesso/falha (90% sucesso)
      if (Math.random() > 0.1) {
        sent++;
      } else {
        failed++;
        errors.push(`Paciente ${selectedPatients[i]}: Error de conexión`);
      }

      setSendProgress(Math.round(((i + 1) / total) * 100));
    }

    setSendResults({ total, sent, failed, errors });
    setIsSending(false);
    toast.success(`Envío completado: ${sent}/${total} exitosos`);
  };

  const getMessagePreview = () => {
    if (messageType === "template" && selectedTemplate) {
      // Aqui você buscaria o template do banco
      return "Vista previa del template seleccionado...";
    }
    return manualMessage || "Escribe tu mensaje aquí...";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Send className="h-8 w-8 text-blue-500" />
            Envío Masivo de Mensajes
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Envía mensajes a múltiples pacientes simultáneamente
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Panel Izquierdo: Selección de Destinatarios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selección de Destinatarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Seleccionar Destinatarios ({selectedPatients.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Botones de Selección Rápida */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Seleccionar Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectNone}>
                    Deseleccionar Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectAtRisk} className="text-red-500">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pacientes en Riesgo ({patientsAtRisk?.length || 0})
                  </Button>
                </div>

                {/* Upload CSV */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">Subir CSV con Pacientes</div>
                        <div className="text-xs text-muted-foreground">
                          {csvFile ? csvFile.name : "Arrastra o selecciona un archivo CSV"}
                        </div>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvUpload}
                  />
                </div>

                {/* Lista de Pacientes */}
                <div className="border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {patients?.map((patient: any) => (
                      <div
                        key={patient.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                        onClick={() => handlePatientToggle(patient.id)}
                      >
                        <Checkbox
                          checked={selectedPatients.includes(patient.id)}
                          onCheckedChange={() => handlePatientToggle(patient.id)}
                        />
                        <div className="flex-1">
                          <div className="font-semibold">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {patient.phone}
                          </div>
                        </div>
                        {patient.isAtRisk && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Mensaje */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={messageType} onValueChange={(v) => setMessageType(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="template">
                      <FileText className="h-4 w-4 mr-2" />
                      Templates
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <Send className="h-4 w-4 mr-2" />
                      Manual
                    </TabsTrigger>
                  </TabsList>

                  {/* Templates */}
                  <TabsContent value="template" className="space-y-4">
                    <div>
                      <Label>Seleccionar Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Elige un template..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recordatorio">Recordatorio de Cita</SelectItem>
                          <SelectItem value="confirmacion">Confirmación de Cita</SelectItem>
                          <SelectItem value="seguimiento">Seguimiento Post-Consulta</SelectItem>
                          <SelectItem value="promocion">Promoción Especial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Manual */}
                  <TabsContent value="manual" className="space-y-4">
                    <div>
                      <Label>Tipo de Contenido</Label>
                      <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Texto
                          </SelectItem>
                          <SelectItem value="audio">
                            <Mic className="h-4 w-4 inline mr-2" />
                            Audio
                          </SelectItem>
                          <SelectItem value="video">
                            <Video className="h-4 w-4 inline mr-2" />
                            Video
                          </SelectItem>
                          <SelectItem value="image">
                            <Image className="h-4 w-4 inline mr-2" />
                            Imagen
                          </SelectItem>
                          <SelectItem value="document">
                            <File className="h-4 w-4 inline mr-2" />
                            Documento
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {contentType === "text" ? (
                      <div>
                        <Label>Mensaje</Label>
                        <Textarea
                          placeholder="Escribe tu mensaje aquí... Usa {nombre}, {clinica}, {fecha} para personalizar"
                          value={manualMessage}
                          onChange={(e) => setManualMessage(e.target.value)}
                          rows={6}
                        />
                        <div className="text-xs text-muted-foreground mt-2">
                          Variables disponibles: {"{nombre}"}, {"{clinica}"}, {"{fecha}"}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                            <div className="font-semibold">
                              Subir {contentType === "audio" ? "Audio" : contentType === "video" ? "Video" : contentType === "image" ? "Imagen" : "Documento"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {uploadedFile ? uploadedFile.name : "Arrastra o selecciona un archivo"}
                            </div>
                          </div>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept={
                            contentType === "audio" ? "audio/*" :
                            contentType === "video" ? "video/*" :
                            contentType === "image" ? "image/*" :
                            "*/*"
                          }
                          onChange={handleFileUpload}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho: Configuración y Preview */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 min-h-32">
                  <p className="text-sm whitespace-pre-wrap">{getMessagePreview()}</p>
                  {uploadedFile && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-400">
                      <File className="h-4 w-4" />
                      {uploadedFile.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Envío */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Programar Envío */}
                <div>
                  <Label>Cuándo Enviar</Label>
                  <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">
                        <Send className="h-4 w-4 inline mr-2" />
                        Enviar Ahora
                      </SelectItem>
                      <SelectItem value="later">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Programar Envío
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleType === "later" && (
                  <>
                    <div>
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Hora</Label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Velocidad de Envío */}
                <div>
                  <Label>Velocidad de Envío (Anti-Bloqueo)</Label>
                  <Select value={sendSpeed} onValueChange={setSendSpeed}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Lenta (5s entre mensajes)</SelectItem>
                      <SelectItem value="normal">Normal (2s entre mensajes)</SelectItem>
                      <SelectItem value="fast">Rápida (0.5s entre mensajes)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Velocidad lenta reduce riesgo de bloqueo
                  </p>
                </div>

                {/* Resumen */}
                <div className="bg-blue-950 border border-blue-800 rounded-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Destinatarios:</span>
                      <span className="font-semibold text-blue-200">{selectedPatients.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Tipo:</span>
                      <span className="font-semibold text-blue-200">
                        {messageType === "template" ? "Template" : contentType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Envío:</span>
                      <span className="font-semibold text-blue-200">
                        {scheduleType === "now" ? "Inmediato" : "Programado"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón de Envío */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  onClick={handleSend}
                  disabled={isSending || selectedPatients.length === 0}
                >
                  {isSending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Enviando... {sendProgress}%
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensajes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Resultados */}
            {sendResults && (
              <Card className="bg-green-950 border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Resultados del Envío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-300">Total:</span>
                    <span className="font-semibold text-green-200">{sendResults.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-300">Exitosos:</span>
                    <span className="font-semibold text-green-200">{sendResults.sent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-300">Fallidos:</span>
                    <span className="font-semibold text-red-200">{sendResults.failed}</span>
                  </div>
                  {sendResults.errors.length > 0 && (
                    <div className="mt-3 text-xs text-red-300 max-h-32 overflow-y-auto">
                      {sendResults.errors.map((error, i) => (
                        <div key={i}>• {error}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
