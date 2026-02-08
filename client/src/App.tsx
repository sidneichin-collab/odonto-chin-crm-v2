import { Route, Switch } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardFinal from "@/pages/DashboardFinal";
import Pacientes from "@/pages/Pacientes";
import PacientesRiesgo from "@/pages/PacientesRiesgo";
import PacientesActivosSinAgendamiento from "@/pages/PacientesActivosSinAgendamiento";
import Agendamientos from "@/pages/Agendamientos";
import AgendaMelhorada from "@/pages/AgendaMelhorada";
import ListaEspera from "@/pages/ListaEspera";
import WhatsApp from "@/pages/WhatsApp";
import CanalRecordatorios from "@/pages/CanalRecordatorios";
import MensajesRecibidos from "@/pages/MensajesRecibidos";
import SolicitudesReagendamiento from "@/pages/SolicitudesReagendamiento";
import SaludCanales from "@/pages/SaludCanales";
import EstadisticasPlantillas from "@/pages/EstadisticasPlantillas";
import TestsAB from "@/pages/TestsAB";
import EfectividadRecordatorios from "@/pages/EfectividadRecordatorios";
import InsightsIA from "@/pages/InsightsIA";
import RelatorioInadimplencia from "@/pages/RelatorioInadimplencia";
import EnvioMasivo from "@/pages/EnvioMasivo";
import ConfiguracionesClinica from "@/pages/ConfiguracionesClinica";
import ImportarPacientes from "@/pages/ImportarPacientes";
import Templates from "@/pages/Templates";
import Configuracoes from "@/pages/Configuracoes";
import ConfiguracaoIA from "@/pages/ConfiguracaoIA";
import TestNotifications from "@/pages/TestNotifications";
import GestaoRecordatorios from "@/pages/GestaoRecordatorios";
import SolicitacoesReagendamento from "@/pages/SolicitacoesReagendamento";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen bg-black">
      <DashboardLayout>
        <Switch>
          {/* Rota principal - Dashboard */}
          <Route path="/" component={DashboardFinal} />
          
          {/* Pacientes */}
          <Route path="/pacientes" component={Pacientes} />
          <Route path="/pacientes/new" component={Pacientes} />
          <Route path="/pacientes/:id" component={Pacientes} />
          
          {/* Pacientes em Risco */}
          <Route path="/pacientes-riesgo" component={PacientesRiesgo} />
          
          {/* Pacientes Activos Sin Agendamiento */}
          <Route path="/pacientes-activos-sin-agendamiento" component={PacientesActivosSinAgendamiento} />
          
          {/* Agendamentos */}
          <Route path="/agendamientos" component={Agendamientos} />
          <Route path="/agenda-melhorada" component={AgendaMelhorada} />
          
          {/* Canais WhatsApp */}
          <Route path="/canales-whatsapp" component={WhatsApp} />
          
          {/* Canal de Recordatórios */}
          <Route path="/canal-recordatorios" component={CanalRecordatorios} />
          
          {/* Gestão de Recordatórios (Regras Inquebráveis) */}
          <Route path="/gestao-recordatorios" component={GestaoRecordatorios} />
          
          {/* Solicitações de Reagendamento (Regras Inquebráveis) */}
          <Route path="/solicitacoes-reagendamento" component={SolicitacoesReagendamento} />
          
          {/* Mensajes Recibidos */}
          <Route path="/mensajes-recibidos" component={MensajesRecibidos} />
          
          {/* Solicitudes de Reagendamiento */}
          <Route path="/solicitudes-reagendamiento" component={SolicitudesReagendamiento} />
          
          {/* Salud de los Canales */}
          <Route path="/salud-canales" component={SaludCanales} />
          
          {/* Estadísticas de Plantillas */}
          <Route path="/estadisticas-plantillas" component={EstadisticasPlantillas} />
          
          {/* Tests A/B */}
          <Route path="/tests-ab" component={TestsAB} />
          
          {/* Efectividad de Recordatorios */}
          <Route path="/efectividad-recordatorios" component={EfectividadRecordatorios} />
          
          {/* Insights e Recomendações IA */}
          <Route path="/insights-ia" component={InsightsIA} />
          
          {/* Relatório de Inadimplência */}
          <Route path="/relatorio-inadimplencia" component={RelatorioInadimplencia} />
          
          {/* Templates */}
          <Route path="/templates" component={Templates} />
          
          {/* Configurações */}
          <Route path="/configuracoes" component={Configuracoes} />
          
          {/* Configuração de IA */}
          <Route path="/configuracao-ia" component={ConfiguracaoIA} />
          
          {/* Teste de Notificações */}
          <Route path="/test-notifications" component={TestNotifications} />
          
          {/* Lista de Espera */}
          <Route path="/lista-espera" component={ListaEspera} />
          
          {/* Envio Masivo */}
          <Route path="/envio-masivo" component={EnvioMasivo} />
          
          {/* Configuraciones de Clinica */}
          <Route path="/configuraciones-clinica" component={ConfiguracionesClinica} />
          
          {/* Importar Pacientes */}
          <Route path="/importar-pacientes" component={ImportarPacientes} />
          
          {/* 404 - Página não encontrada */}
          <Route path="/:rest*" component={NotFound} />
        </Switch>
      </DashboardLayout>
    </div>
  );
}
