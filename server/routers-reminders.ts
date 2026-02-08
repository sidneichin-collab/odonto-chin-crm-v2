/**
 * Routers tRPC para Recordatórios
 * 
 * Endpoints para gerenciar o sistema de recordatórios com regras inquebráveis
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { ReminderServiceV2 } from './services/reminder-service-v2';
import { RulesValidator } from './services/rules-validator';

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const AppointmentSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  clinicId: z.number(),
  date: z.string().transform(str => new Date(str)),
  time: z.string(),
  type: z.enum(['orthodontic', 'general']),
  status: z.enum(['scheduled', 'confirmed', 'rescheduling', 'completed', 'no_show'])
});

const PatientSchema = z.object({
  id: z.number(),
  name: z.string(),
  whatsapp: z.string(),
  email: z.string().optional(),
  clinicId: z.number()
});

const ClinicSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  timezone: z.string(),
  corporateWhatsApp: z.string(),
  email: z.string()
});

// ============================================================================
// ROUTERS
// ============================================================================

export const remindersRouter = router({
  /**
   * Agendar recordatórios para uma consulta
   */
  scheduleReminders: publicProcedure
    .input(z.object({
      appointment: AppointmentSchema,
      patient: PatientSchema,
      clinic: ClinicSchema
    }))
    .mutation(async ({ input }) => {
      try {
        const messages = await ReminderServiceV2.scheduleReminders(
          input.appointment as any,
          input.patient as any,
          input.clinic as any
        );

        return {
          success: true,
          messagesScheduled: messages.length,
          messages: messages.map(m => ({
            id: m.id,
            scheduledFor: m.scheduledFor.toISOString(),
            type: m.type,
            attemptNumber: m.attemptNumber
          }))
        };
      } catch (error: any) {
        console.error('Erro ao agendar recordatórios:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }),

  /**
   * Processar confirmação de paciente
   */
  processConfirmation: publicProcedure
    .input(z.object({
      appointmentId: z.number(),
      patientMessage: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await ReminderServiceV2.processConfirmation(
          input.appointmentId,
          input.patientMessage
        );

        return {
          success: true,
          isConfirmation: result.isConfirmation,
          actions: result.actions
        };
      } catch (error: any) {
        console.error('Erro ao processar confirmação:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }),

  /**
   * Validar antes de enviar mensagem
   */
  validateBeforeSending: publicProcedure
    .input(z.object({
      messageId: z.string(),
      appointmentId: z.number(),
      patientId: z.number(),
      scheduledFor: z.string().transform(str => new Date(str)),
      type: z.enum(['2_days_before', '1_day_before', 'same_day', 'post_confirmation']),
      attemptNumber: z.number(),
      content: z.string(),
      appointment: AppointmentSchema,
      patient: PatientSchema,
      clinic: ClinicSchema
    }))
    .query(async ({ input }) => {
      try {
        const message = {
          id: input.messageId,
          appointmentId: input.appointmentId,
          patientId: input.patientId,
          scheduledFor: input.scheduledFor as Date,
          type: input.type,
          attemptNumber: input.attemptNumber,
          content: input.content,
          status: 'pending' as const
        };

        const validation = await ReminderServiceV2.validateBeforeSending(
          message,
          input.appointment as any,
          input.patient as any,
          input.clinic as any
        );

        return {
          success: true,
          canSend: validation.canSend,
          errors: validation.errors,
          warnings: validation.warnings
        };
      } catch (error: any) {
        console.error('Erro ao validar mensagem:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }),

  /**
   * Obter próximas mensagens a enviar
   */
  getUpcomingMessages: publicProcedure
    .input(z.object({
      clinicId: z.number(),
      startDate: z.string().transform(str => new Date(str)),
      endDate: z.string().transform(str => new Date(str))
    }))
    .query(async ({ input }) => {
      // TODO: Implementar busca no banco de dados
      return {
        success: true,
        messages: []
      };
    }),

  /**
   * Obter estatísticas de recordatórios
   */
  getStatistics: publicProcedure
    .input(z.object({
      clinicId: z.number(),
      startDate: z.string().transform(str => new Date(str)),
      endDate: z.string().transform(str => new Date(str))
    }))
    .query(async ({ input }) => {
      // TODO: Implementar cálculo de estatísticas
      return {
        success: true,
        statistics: {
          totalScheduled: 0,
          totalSent: 0,
          totalConfirmed: 0,
          confirmationRate: 0,
          averageConfirmationTime: 0
        }
      };
    }),

  /**
   * Cancelar recordatórios de uma consulta
   */
  cancelReminders: publicProcedure
    .input(z.object({
      appointmentId: z.number(),
      reason: z.enum(['confirmed', 'rescheduled', 'cancelled'])
    }))
    .mutation(async ({ input }) => {
      // TODO: Implementar cancelamento no banco de dados
      return {
        success: true,
        cancelled: 0
      };
    }),

  /**
   * Testar validação de horário
   */
  testTimeValidation: publicProcedure
    .input(z.object({
      datetime: z.string().transform(str => new Date(str)),
      timezone: z.string()
    }))
    .query(async ({ input }) => {
      const validation = RulesValidator.validateTimeRules(
        input.datetime as Date,
        input.timezone
      );

      return {
        success: true,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }),

  /**
   * Testar detecção de confirmação
   */
  testConfirmationDetection: publicProcedure
    .input(z.object({
      message: z.string()
    }))
    .query(async ({ input }) => {
      const validation = RulesValidator.validateConfirmationRules(
        input.message
      );

      return {
        success: true,
        isConfirmation: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings
      };
    })
});

export default remindersRouter;
