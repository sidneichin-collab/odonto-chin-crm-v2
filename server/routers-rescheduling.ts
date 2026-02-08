/**
 * Routers tRPC para Reagendamentos
 * 
 * Endpoints para gerenciar o sistema de reagendamentos com regras inquebráveis
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { ReschedulingService } from './services/rescheduling-service';
import { RulesValidator } from './services/rules-validator';

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const ReschedulingRequestSchema = z.object({
  appointmentId: z.number(),
  patientId: z.number(),
  patientName: z.string(),
  patientWhatsApp: z.string(),
  clinicId: z.number(),
  originalDate: z.string().transform(str => new Date(str)),
  originalTime: z.string(),
  patientMessage: z.string()
});

// ============================================================================
// ROUTERS
// ============================================================================

export const reschedulingRouter = router({
  /**
   * Detectar se mensagem é solicitação de reagendamento
   */
  isReschedulingRequest: publicProcedure
    .input(z.object({
      message: z.string()
    }))
    .query(async ({ input }) => {
      const isRescheduling = ReschedulingService.isReschedulingRequest(input.message);

      return {
        success: true,
        isRescheduling
      };
    }),

  /**
   * Processar solicitação de reagendamento
   */
  processReschedulingRequest: publicProcedure
    .input(ReschedulingRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await ReschedulingService.processReschedulingRequest(
          input.appointmentId,
          input.patientId,
          input.patientName,
          input.patientWhatsApp,
          input.clinicId,
          input.originalDate as Date,
          input.originalTime,
          input.patientMessage
        );

        return {
          success: true,
          request: {
            id: result.request.id,
            status: result.request.status,
            requestedAt: result.request.requestedAt.toISOString()
          },
          actions: result.actions,
          validation: result.validation
        };
      } catch (error: any) {
        console.error('Erro ao processar reagendamento:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }),

  /**
   * Marcar solicitação como tratada
   */
  markAsHandled: publicProcedure
    .input(z.object({
      requestId: z.string(),
      secretaryId: z.number()
    }))
    .mutation(async ({ input }) => {
      try {
        await ReschedulingService.markAsHandled(
          input.requestId,
          input.secretaryId
        );

        return {
          success: true
        };
      } catch (error: any) {
        console.error('Erro ao marcar como tratado:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }),

  /**
   * Obter solicitações pendentes
   */
  getPendingRequests: publicProcedure
    .input(z.object({
      clinicId: z.number()
    }))
    .query(async ({ input }) => {
      try {
        const requests = await ReschedulingService.getPendingRequests(input.clinicId);

        return {
          success: true,
          requests: requests.map(r => ({
            id: r.id,
            patientName: r.patientName,
            patientWhatsApp: r.patientWhatsApp,
            originalDate: r.originalDate.toISOString(),
            originalTime: r.originalTime,
            requestedAt: r.requestedAt.toISOString(),
            status: r.status
          }))
        };
      } catch (error: any) {
        console.error('Erro ao obter solicitações pendentes:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }),

  /**
   * Obter estatísticas de reagendamentos
   */
  getStatistics: publicProcedure
    .input(z.object({
      clinicId: z.number(),
      startDate: z.string().transform(str => new Date(str)),
      endDate: z.string().transform(str => new Date(str))
    }))
    .query(async ({ input }) => {
      try {
        const stats = await ReschedulingService.getStatistics(
          input.clinicId,
          input.startDate as Date,
          input.endDate as Date
        );

        return {
          success: true,
          statistics: stats
        };
      } catch (error: any) {
        console.error('Erro ao obter estatísticas:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }),

  /**
   * Validar que sistema NÃO está tentando reagendar automaticamente
   */
  validateNoAutomaticRescheduling: publicProcedure
    .input(z.object({
      systemAttemptedRescheduling: z.boolean()
    }))
    .query(async ({ input }) => {
      const validation = ReschedulingService.validateNoAutomaticRescheduling(
        input.systemAttemptedRescheduling
      );

      return {
        success: true,
        valid: validation.valid,
        errors: validation.errors
      };
    }),

  /**
   * Testar detecção de reagendamento
   */
  testReschedulingDetection: publicProcedure
    .input(z.object({
      message: z.string()
    }))
    .query(async ({ input }) => {
      const validation = RulesValidator.validateReschedulingRules(
        input.message
      );

      return {
        success: true,
        isRescheduling: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings
      };
    })
});

export default reschedulingRouter;
