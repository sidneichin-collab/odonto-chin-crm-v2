import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Calendar, Phone, Mail, Search, Filter, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function PacientesActivosSinAgendamiento() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "Ortodoncia" | "Clinico General">("all");
  
  // Buscar pacientes ativos sem agendamento
  const { data: patientsAtRisk, isLoading, refetch } = trpc.patients.withoutAppointments.useQuery();
  
  // Buscar estatísticas de contratos ativos
  const { data: contractStats } = trpc.dashboard.getActiveContractsStats.useQuery();

  // Filtrar pacientes
  const filteredPatients = patientsAtRisk?.filter((patient: any) => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    const matchesType = filterType === "all" || patient.contractType === filterType;
    
    return matchesSearch && matchesType;
  }) || [];

  const exportToCSV = () => {
    if (!filteredPatients || filteredPatients.length === 0) return;

    const headers = ["Nombre", "Apellido", "Teléfono", "Email", "Tipo Contrato", "Días Sin Contacto", "Días Restantes Contrato"];
    const rows = filteredPatients.map((p: any) => [
      p.firstName,
      p.lastName,
      p.phone,
      p.email || "",
      p.contractType,
      p.daysSinceLastContact || "N/A",
      p.contractDaysRemaining || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pacientes-activos-sin-agendamiento-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando pacientes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
              Pacientes Activos Sin Agendamiento
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Pacientes con contrato activo que NO tienen agendamientos futuros - Alto riesgo de inadimplencia
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
          >
            Actualizar
          </Button>
        </div>

        {/* Estadísticas Generales */}
        {contractStats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-blue-950 border-blue-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400">{contractStats.totalActiveContracts}</div>
                  <div className="text-sm text-blue-300 mt-2">Contratos Activos Total</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-950 border-green-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400">{contractStats.withFutureAppointments}</div>
                  <div className="text-sm text-green-300 mt-2">Con Agendamiento Futuro</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950 border-red-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-400">{contractStats.withoutAppointments}</div>
                  <div className="text-sm text-red-300 mt-2">⚠️ Sin Agendamiento</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-950 border-orange-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400">{contractStats.riskPercentage}%</div>
                  <div className="text-sm text-orange-300 mt-2">Porcentaje en Riesgo</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, apellido o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === "Ortodoncia" ? "default" : "outline"}
                  onClick={() => setFilterType("Ortodoncia")}
                >
                  Ortodoncia
                </Button>
                <Button
                  variant={filterType === "Clinico General" ? "default" : "outline"}
                  onClick={() => setFilterType("Clinico General")}
                >
                  Clínico General
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="gap-2"
                  disabled={filteredPatients.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Pacientes ({filteredPatients.length})</span>
              {filteredPatients.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  Ordenados por urgencia
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm || filterType !== "all" ? (
                  <>
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No se encontraron pacientes con los filtros aplicados
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-xl font-semibold text-green-500 mb-2">
                      ¡Excelente trabajo!
                    </p>
                    <p className="text-muted-foreground">
                      Todos los pacientes con contrato activo tienen agendamientos futuros
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient: any) => (
                  <Card 
                    key={patient.id}
                    className="bg-red-950/30 border-red-800 hover:bg-red-950/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Nombre y Tipo de Contrato */}
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-lg text-red-200">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              patient.contractType === "Ortodoncia" 
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500" 
                                : "bg-blue-500/20 text-blue-300 border border-blue-500"
                            }`}>
                              {patient.contractType}
                            </span>
                          </div>

                          {/* Información de Contacto */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-red-300">
                              <Phone className="h-4 w-4" />
                              <span>{patient.phone}</span>
                            </div>
                            {patient.email && (
                              <div className="flex items-center gap-2 text-red-300">
                                <Mail className="h-4 w-4" />
                                <span>{patient.email}</span>
                              </div>
                            )}
                          </div>

                          {/* Alertas de Riesgo */}
                          <div className="flex gap-4 text-sm">
                            {patient.daysSinceLastContact !== null && (
                              <div className={`flex items-center gap-2 ${
                                patient.daysSinceLastContact > 30 
                                  ? "text-red-400 font-bold" 
                                  : "text-orange-400"
                              }`}>
                                <AlertTriangle className="h-4 w-4" />
                                <span>
                                  Último contacto hace {patient.daysSinceLastContact} días
                                </span>
                              </div>
                            )}
                            {patient.contractDaysRemaining !== null && (
                              <div className={`flex items-center gap-2 ${
                                patient.contractDaysRemaining < 30 
                                  ? "text-red-400 font-bold" 
                                  : "text-yellow-400"
                              }`}>
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Contrato vence en {patient.contractDaysRemaining} días
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://wa.me/${patient.phone.replace(/\D/g, '')}`, '_blank');
                            }}
                          >
                            <Phone className="h-4 w-4" />
                            WhatsApp Directo
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/agendamientos?patientId=${patient.id}`);
                            }}
                          >
                            <Calendar className="h-4 w-4" />
                            Agendar Cita
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/pacientes?id=${patient.id}`);
                            }}
                          >
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de Acción Rápida */}
        {filteredPatients.length > 0 && (
          <Card className="bg-gradient-to-r from-orange-950 to-red-950 border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Acciones Rápidas
                  </h3>
                  <p className="text-sm text-orange-200">
                    Contacta a todos los pacientes en riesgo de una vez
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                    onClick={() => setLocation("/agendamientos")}
                  >
                    <Calendar className="h-4 w-4" />
                    Agendar Múltiples
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    onClick={() => setLocation("/whatsapp")}
                  >
                    <Phone className="h-4 w-4" />
                    Enviar Recordatorios Masivos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
