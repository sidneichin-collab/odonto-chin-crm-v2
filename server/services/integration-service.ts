/**
 * Serviço de Integração
 * 
 * Conecta os serviços de recordatórios e reagendamentos com o código existente
 */

import { ReminderServiceV2 } from './reminder-service-v2';
import { ReschedulingService } from './rescheduling-service';
import { RulesValidator } from './rules-validator';
import * as dbReminders from '../db-reminders';

// ============================================================================
// TIPOS
// ============================================================================

interface Appointment {
  id: number;
  patientId: number;
  clinicId: number;
  date: Date;
  time: string;
  type: 'orthodontic' | 'general';
  status: 'scheduled' | 'confirmed' | 'rescheduling' | 'completed' | 'no_show';
}

interface Patient {
  id: number;
  name: string;
  whatsapp: string;
  email?: string;
  clinicId: number;
}

interface Clinic {
  id: number;
  name: string;
  country: string;
  timezone: string;
  corporateWhatsApp: string;
  email: string;
}

// ============================================================================
// INTEGRAÇÃO COM AGENDAMENTOS
// ============================================================================

export class IntegrationService {
  /**
   * Quando uma nova consulta é agendada
   */
  static async onAppointmentCreated(
    appointment: Appointment,
    patient: Patient,
    clinic: Clinic
  ): Promise<void> {
    console.log('📅 Nova consulta agendada:', appointment.id);

    try {
      // 1. Agendar recordatórios automaticamente
      const messages = await ReminderServiceV2.scheduleReminders(
        appointment,
        patient,
        clinic
      );

      console.log(`✅ ${messages.length} recordatórios agendados para consulta ${appointment.id}`);

      // 2. Salvar no banco de dados
      for (const message of messages) {
        await dbReminders.createReminderMessage({
          id: message.id,
          appointmentId: message.appointmentId,
          patientId: message.patientId,
          clinicId: clinic.id,
          scheduledFor: message.scheduledFor.toISOString(),
          type: message.type,
          attemptNumber: message.attemptNumber,
          content: message.content,
          status: 'pending'
        });
      }

      console.log('✅ Recordatórios salvos no banco de dados');

    } catch (error) {
      console.error('❌ Erro ao processar nova consulta:', error);
      throw error;
    }
  }

  /**
   * Quando uma mensagem de paciente é recebida
   */
  static async onPatientMessageReceived(
    appointmentId: number,
    patientId: number,
    patientName: string,
    patientWhatsApp: string,
    clinicId: number,
    message: string,
    appointment: Appointment,
    clinic: Clinic
  ): Promise<{
    isConfirmation: boolean;
    isRescheduling: boolean;
    actions: string[];
  }> {
    console.log('💬 Mensagem recebida do paciente:', patientName);

    const actions: string[] = [];

    try {
      // 1. Verificar se é confirmação
      const confirmationResult = await ReminderServiceV2.processConfirmation(
        appointmentId,
        message
      );

      if (confirmationResult.isConfirmation) {
        console.log('✅ Confirmação detectada!');
        
        // Salvar confirmação no banco
        await dbReminders.createAppointmentConfirmation({
          appointmentId,
          patientId,
          clinicId,
          confirmedAt: new Date().toISOString(),
          confirmationMessage: message,
          confirmationChannel: 'whatsapp'
        });

        // Cancelar recordatórios pendentes
        const cancelled = await dbReminders.cancelRemindersByAppointment(appointmentId);
        console.log(`✅ ${cancelled} recordatórios cancelados`);

        actions.push(...confirmationResult.actions);
        
        return {
          isConfirmation: true,
          isRescheduling: false,
          actions
        };
      }

      // 2. Verificar se é reagendamento
      const isRescheduling = ReschedulingService.isReschedulingRequest(message);

      if (isRescheduling) {
        console.log('🔄 Solicitação de reagendamento detectada!');

        // Processar reagendamento
        const reschedulingResult = await ReschedulingService.processReschedulingRequest(
          appointmentId,
          patientId,
          patientName,
          patientWhatsApp,
          clinicId,
          appointment.date,
          appointment.time,
          message
        );

        // Salvar no banco
        await dbReminders.createReschedulingRequest({
          id: reschedulingResult.request.id,
          appointmentId,
          patientId,
          patientName,
          patientWhatsApp,
          clinicId,
          originalDate: appointment.date.toISOString().split('T')[0],
          originalTime: appointment.time,
          requestedAt: reschedulingResult.request.requestedAt.toISOString(),
          status: 'pending'
        });

        console.log('✅ Solicitação de reagendamento salva no banco');

        actions.push(...reschedulingResult.actions);

        return {
          isConfirmation: false,
          isRescheduling: true,
          actions
        };
      }

      // 3. Mensagem normal (não é confirmação nem reagendamento)
      return {
        isConfirmation: false,
        isRescheduling: false,
        actions: []
      };

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Quando uma consulta é confirmada manualmente
   */
  static async onAppointmentConfirmed(
    appointmentId: number,
    patientId: number,
    clinicId: number
  ): Promise<void> {
    console.log('✅ Consulta confirmada manualmente:', appointmentId);

    try {
      // Cancelar recordatórios pendentes
      const cancelled = await dbReminders.cancelRemindersByAppointment(appointmentId);
      console.log(`✅ ${cancelled} recordatórios cancelados`);

      // Salvar confirmação no banco
      await dbReminders.createAppointmentConfirmation({
        appointmentId,
        patientId,
        clinicId,
        confirmedAt: new Date().toISOString(),
        confirmationMessage: 'Confirmação manual pela secretária',
        confirmationChannel: 'manual'
      });

    } catch (error) {
      console.error('❌ Erro ao confirmar consulta:', error);
      throw error;
    }
  }

  /**
   * Quando uma consulta é cancelada
   */
  static async onAppointmentCancelled(appointmentId: number): Promise<void> {
    console.log('❌ Consulta cancelada:', appointmentId);

    try {
      // Cancelar recordatórios pendentes
      const cancelled = await dbReminders.cancelRemindersByAppointment(appointmentId);
      console.log(`✅ ${cancelled} recordatórios cancelados`);

    } catch (error) {
      console.error('❌ Erro ao cancelar consulta:', error);
      throw error;
    }
  }

  /**
   * Validar antes de enviar qualquer mensagem
   */
  static async validateBeforeSendingMessage(
    message: any,
    appointment: Appointment,
    patient: Patient,
    clinic: Clinic
  ): Promise<{ canSend: boolean; errors: string[]; warnings: string[] }> {
    try {
      // Usar o serviço de recordatórios para validar
      return await ReminderServiceV2.validateBeforeSending(
        message,
        appointment,
        patient,
        clinic
      );
    } catch (error) {
      console.error('❌ Erro ao validar mensagem:', error);
      return {
        canSend: false,
        errors: ['Erro ao validar mensagem'],
        warnings: []
      };
    }
  }

  /**
   * Obter estatísticas do dia
   */
  static async getDailyStatistics(clinicId: number, date: string): Promise<any> {
    try {
      // TODO: Implementar cálculo de estatísticas
      return {
        reminders: {
          scheduled: 0,
          sent: 0,
          confirmed: 0,
          confirmationRate: 0
        },
        rescheduling: {
          requests: 0,
          pending: 0,
          handled: 0
        }
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Verificar violações de regras não resolvidas
   */
  static async checkUnresolvedViolations(clinicId: number): Promise<any[]> {
    try {
      return await dbReminders.getUnresolvedViolations(clinicId);
    } catch (error) {
      console.error('❌ Erro ao verificar violações:', error);
      throw error;
    }
  }
}

export default IntegrationService;
