import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Calendar, Phone, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function ActivePatientsAlert() {
  const [, setLocation] = useLocation();
  
  // Buscar pacientes ativos sem agendamento
  const { data: patientsAtRisk, isLoading } = trpc.patients.withoutAppointments.useQuery();
  
  // Buscar estatísticas de contratos ativos
  const { data: contractStats } = trpc.dashboard.getActiveContractsStats.useQuery();

  if (isLoading) {
    return (
      <Card className="bg-red-950 border-red-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskCount = patientsAtRisk?.length || 0;

  if (riskCount === 0) {
    return (
      <Card className="bg-green-950 border-green-800">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pacientes Activos - Todo en Orden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-300 text-sm">
            ✅ Todos los pacientes con contrato activo tienen agendamientos futuros
          </p>
          {contractStats && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{contractStats.totalActiveContracts}</div>
                <div className="text-xs text-green-300">Contratos Activos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{contractStats.withFutureAppointments}</div>
                <div className="text-xs text-green-300">Con Agendamiento</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">0%</div>
                <div className="text-xs text-green-300">En Riesgo</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-red-950 border-red-800">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
          ⚠️ ALERTA: Pacientes Activos Sin Agendamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estadísticas */}
          {contractStats && (
            <div className="grid grid-cols-4 gap-4 text-center bg-red-900/50 rounded-lg p-4">
              <div>
                <div className="text-2xl font-bold text-red-400">{contractStats.totalActiveContracts}</div>
                <div className="text-xs text-red-300">Contratos Activos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{contractStats.withFutureAppointments}</div>
                <div className="text-xs text-green-300">Con Agendamiento</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{contractStats.withoutAppointments}</div>
                <div className="text-xs text-red-300">Sin Agendamiento</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{contractStats.riskPercentage}%</div>
                <div className="text-xs text-red-300">% En Riesgo</div>
              </div>
            </div>
          )}

          {/* Mensaje de alerta */}
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <p className="text-red-300 text-sm font-semibold mb-2">
              🚨 {riskCount} paciente{riskCount > 1 ? 's' : ''} con contrato activo NO tiene{riskCount > 1 ? 'n' : ''} agendamiento futuro
            </p>
            <p className="text-red-400 text-xs">
              Estos pacientes están en riesgo de inadimplencia. Es necesario contactarlos urgentemente para reagendar.
            </p>
          </div>

          {/* Lista de pacientes (primeros 5) */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {patientsAtRisk?.slice(0, 5).map((patient: any) => (
              <div 
                key={patient.id}
                className="bg-red-900/40 border border-red-700 rounded-lg p-3 hover:bg-red-900/60 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-red-200">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-xs text-red-300 mt-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Contrato: {patient.contractType}
                        {patient.contractDaysRemaining !== null && (
                          <span className="text-red-400">
                            ({patient.contractDaysRemaining} días restantes)
                          </span>
                        )}
                      </div>
                      {patient.daysSinceLastContact !== null && (
                        <div className="text-red-400 font-semibold">
                          ⚠️ Último contacto hace {patient.daysSinceLastContact} días
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setLocation(`/pacientes?id=${patient.id}`)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Contactar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para ver todos */}
          {riskCount > 5 && (
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setLocation("/pacientes-riesgo")}
            >
              Ver Todos ({riskCount} pacientes)
            </Button>
          )}

          {/* Botón de acción rápida */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => setLocation("/agendamientos")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Citas
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setLocation("/whatsapp")}
            >
              <Phone className="h-4 w-4 mr-2" />
              Enviar Recordatorios
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
