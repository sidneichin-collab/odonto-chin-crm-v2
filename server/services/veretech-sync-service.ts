/**
 * SERVIÇO DE SINCRONIZAÇÃO COM VERETECH
 * 
 * Este serviço gerencia a sincronização bidirecional entre o CRM e o sistema Veretech
 */

import axios, { AxiosInstance } from 'axios';
import * as bcrypt from 'bcryptjs';

// Tipos
interface VeretechConfig {
  url: string;
  username: string;
  password: string;
  apiKey?: string;
}

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  errors: string[];
  warnings: string[];
  data?: any;
}

interface VeretechPatient {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  whatsapp?: string;
  email?: string;
  fechaNacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado: 'activo' | 'inactivo';
}

interface VeretechAppointment {
  id: string;
  pacienteId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  cadeira: number; // 1, 2, 3, 4
  tipo: 'Manutenção' | 'Colagem' | 'Avaliação' | 'Consulta';
  especialidad: 'Ortodoncia' | 'Clínico General';
  estado: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
  observaciones?: string;
}

export class VeretechSyncService {
  private client: AxiosInstance | null = null;
  private config: VeretechConfig | null = null;

  /**
   * Inicializar conexão com Veretech
   */
  async initialize(config: VeretechConfig): Promise<boolean> {
    try {
      this.config = config;
      
      // Criar cliente HTTP
      this.client = axios.create({
        baseURL: config.url,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        }
      });

      // Testar conexão
      const testResult = await this.testConnection();
      return testResult.success;
    } catch (error) {
      console.error('[VeretechSync] Erro ao inicializar:', error);
      return false;
    }
  }

  /**
   * Testar conexão com Veretech
   */
  async testConnection(): Promise<SyncResult> {
    try {
      if (!this.client) {
        throw new Error('Cliente não inicializado');
      }

      // Tentar fazer login ou ping
      const response = await this.client.post('/api/auth/login', {
        username: this.config?.username,
        password: this.config?.password
      });

      if (response.status === 200) {
        return {
          success: true,
          recordsProcessed: 0,
          recordsSuccess: 0,
          recordsFailed: 0,
          errors: [],
          warnings: [],
          data: { message: 'Conexão estabelecida com sucesso' }
        };
      }

      throw new Error('Falha na autenticação');
    } catch (error: any) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsSuccess: 0,
        recordsFailed: 0,
        errors: [error.message || 'Erro desconhecido'],
        warnings: []
      };
    }
  }

  /**
   * Importar pacientes do Veretech
   */
  async importPatients(clinicId: number): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: []
    };

    try {
      if (!this.client) {
        throw new Error('Cliente não inicializado');
      }

      // Buscar pacientes do Veretech
      const response = await this.client.get('/api/pacientes');
      const patients: VeretechPatient[] = response.data;

      result.recordsProcessed = patients.length;

      // Processar cada paciente
      for (const patient of patients) {
        try {
          // Aqui você integraria com seu banco de dados
          // Por enquanto, apenas simulando
          
          // Validar dados mínimos
          if (!patient.nombre || !patient.telefono) {
            result.warnings.push(`Paciente ${patient.id}: dados incompletos`);
            continue;
          }

          // Criar ou atualizar paciente no CRM
          // await db.patients.upsert({ ... });

          result.recordsSuccess++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(`Paciente ${patient.id}: ${error.message}`);
        }
      }

      result.success = result.recordsFailed === 0;
      return result;
    } catch (error: any) {
      result.errors.push(error.message || 'Erro ao importar pacientes');
      return result;
    }
  }

  /**
   * Importar agendamentos do Veretech
   */
  async importAppointments(clinicId: number, startDate?: string, endDate?: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: []
    };

    try {
      if (!this.client) {
        throw new Error('Cliente não inicializado');
      }

      // Buscar agendamentos do Veretech
      const params: any = {};
      if (startDate) params.fechaInicio = startDate;
      if (endDate) params.fechaFin = endDate;

      const response = await this.client.get('/api/agendamentos', { params });
      const appointments: VeretechAppointment[] = response.data;

      result.recordsProcessed = appointments.length;

      // Processar cada agendamento
      for (const appointment of appointments) {
        try {
          // Validar dados mínimos
          if (!appointment.pacienteId || !appointment.fecha || !appointment.hora) {
            result.warnings.push(`Agendamento ${appointment.id}: dados incompletos`);
            continue;
          }

          // Criar ou atualizar agendamento no CRM
          // await db.appointments.upsert({ ... });

          result.recordsSuccess++;
        } catch (error: any) {
          result.recordsFailed++;
          result.errors.push(`Agendamento ${appointment.id}: ${error.message}`);
        }
      }

      result.success = result.recordsFailed === 0;
      return result;
    } catch (error: any) {
      result.errors.push(error.message || 'Erro ao importar agendamentos');
      return result;
    }
  }

  /**
   * Exportar agendamento para Veretech
   */
  async exportAppointment(appointment: any): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 1,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: []
    };

    try {
      if (!this.client) {
        throw new Error('Cliente não inicializado');
      }

      // Converter formato CRM → Veretech
      const veretechAppointment: VeretechAppointment = {
        id: '', // Será gerado pelo Veretech
        pacienteId: appointment.patientVeretechId, // ID do paciente no Veretech
        fecha: appointment.date,
        hora: appointment.time,
        cadeira: appointment.chair || 1,
        tipo: appointment.type || 'Consulta',
        especialidad: appointment.specialty || 'Clínico General',
        estado: 'agendado',
        observaciones: appointment.notes
      };

      // Enviar para Veretech
      const response = await this.client.post('/api/agendamentos', veretechAppointment);

      if (response.status === 201 || response.status === 200) {
        result.recordsSuccess = 1;
        result.success = true;
        result.data = { veretechId: response.data.id };
      } else {
        throw new Error('Falha ao criar agendamento no Veretech');
      }

      return result;
    } catch (error: any) {
      result.recordsFailed = 1;
      result.errors.push(error.message || 'Erro ao exportar agendamento');
      return result;
    }
  }

  /**
   * Exportar confirmação para Veretech
   */
  async exportConfirmation(appointmentId: string, confirmed: boolean): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 1,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: []
    };

    try {
      if (!this.client) {
        throw new Error('Cliente não inicializado');
      }

      // Atualizar status no Veretech
      const response = await this.client.patch(`/api/agendamentos/${appointmentId}`, {
        estado: confirmed ? 'confirmado' : 'agendado'
      });

      if (response.status === 200) {
        result.recordsSuccess = 1;
        result.success = true;
      } else {
        throw new Error('Falha ao atualizar confirmação no Veretech');
      }

      return result;
    } catch (error: any) {
      result.recordsFailed = 1;
      result.errors.push(error.message || 'Erro ao exportar confirmação');
      return result;
    }
  }

  /**
   * Sincronização completa (importar tudo)
   */
  async fullSync(clinicId: number): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
      warnings: []
    };

    try {
      // 1. Importar pacientes
      const patientsResult = await this.importPatients(clinicId);
      result.recordsProcessed += patientsResult.recordsProcessed;
      result.recordsSuccess += patientsResult.recordsSuccess;
      result.recordsFailed += patientsResult.recordsFailed;
      result.errors.push(...patientsResult.errors);
      result.warnings.push(...patientsResult.warnings);

      // 2. Importar agendamentos (últimos 30 dias)
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const appointmentsResult = await this.importAppointments(clinicId, startDate, endDate);
      result.recordsProcessed += appointmentsResult.recordsProcessed;
      result.recordsSuccess += appointmentsResult.recordsSuccess;
      result.recordsFailed += appointmentsResult.recordsFailed;
      result.errors.push(...appointmentsResult.errors);
      result.warnings.push(...appointmentsResult.warnings);

      result.success = result.recordsFailed === 0;
      return result;
    } catch (error: any) {
      result.errors.push(error.message || 'Erro na sincronização completa');
      return result;
    }
  }
}

// Singleton
export const veretechSyncService = new VeretechSyncService();
