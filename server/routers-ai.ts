/**
 * AI Routers - Endpoints tRPC para funcionalidades de IA
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import {
  analyzeMessage,
  generateInsights,
  generateResponseSuggestion,
  optimizeTemplate,
  predictNoShow,
  analyzeSentimentBatch,
  MessageAnalysisSchema,
  InsightSchema,
  ResponseSuggestionSchema,
} from './services/ai-functions';

export const aiRouter = router({
  /**
   * Analisa uma mensagem recebida do paciente
   */
  analyzeMessage: publicProcedure
    .input(
      z.object({
        messageText: z.string(),
        patientId: z.number().optional(),
        patientHistory: z.any().optional(),
      })
    )
    .output(MessageAnalysisSchema)
    .mutation(async ({ input }) => {
      return await analyzeMessage(input.messageText, input.patientHistory);
    }),

  /**
   * Gera insights automáticos do sistema
   */
  generateInsights: publicProcedure
    .input(
      z.object({
        appointmentStats: z.any(),
        channelHealth: z.any(),
        patientBehavior: z.any(),
      })
    )
    .output(z.array(InsightSchema))
    .query(async ({ input }) => {
      return await generateInsights({
        appointmentStats: input.appointmentStats,
        channelHealth: input.channelHealth,
        patientBehavior: input.patientBehavior,
      });
    }),

  /**
   * Gera sugestão de resposta para uma mensagem
   */
  generateResponse: publicProcedure
    .input(
      z.object({
        messageText: z.string(),
        patientName: z.string(),
        appointmentDate: z.string().optional(),
        clinicName: z.string(),
        tone: z.enum(['formal', 'amigable', 'urgente', 'educativo']).optional(),
      })
    )
    .output(ResponseSuggestionSchema)
    .mutation(async ({ input }) => {
      return await generateResponseSuggestion(input.messageText, {
        patientName: input.patientName,
        appointmentDate: input.appointmentDate,
        clinicName: input.clinicName,
        tone: input.tone,
      });
    }),

  /**
   * Otimiza um template de mensagem
   */
  optimizeTemplate: publicProcedure
    .input(
      z.object({
        templateText: z.string(),
        performanceData: z.object({
          confirmationRate: z.number(),
          readRate: z.number(),
          responseRate: z.number(),
        }),
      })
    )
    .output(
      z.object({
        optimizedText: z.string(),
        improvements: z.array(z.string()),
        confidence: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await optimizeTemplate(input.templateText, input.performanceData);
    }),

  /**
   * Prediz probabilidade de no-show
   */
  predictNoShow: publicProcedure
    .input(
      z.object({
        patientId: z.number(),
        historyNoShows: z.number(),
        totalAppointments: z.number(),
        lastConfirmationTime: z.string().optional(),
        messageResponseRate: z.number(),
        daysSinceLastVisit: z.number(),
      })
    )
    .output(
      z.object({
        probability: z.number(),
        riskLevel: z.enum(['baixo', 'medio', 'alto']),
        factors: z.array(z.string()),
        recommendations: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      return await predictNoShow({
        historyNoShows: input.historyNoShows,
        totalAppointments: input.totalAppointments,
        lastConfirmationTime: input.lastConfirmationTime,
        messageResponseRate: input.messageResponseRate,
        daysSinceLastVisit: input.daysSinceLastVisit,
      });
    }),

  /**
   * Analisa sentimento de múltiplas mensagens
   */
  analyzeSentimentBatch: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          })
        ),
      })
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          sentiment: z.enum(['positivo', 'neutro', 'negativo']),
          score: z.number(),
        })
      )
    )
    .mutation(async ({ input }) => {
      return await analyzeSentimentBatch(input.messages);
    }),

  /**
   * Testa a conexão com o serviço de IA
   */
  testConnection: publicProcedure
    .input(
      z.object({
        provider: z.enum(['openai', 'anthropic', 'azure', 'custom']),
        apiKey: z.string(),
        apiUrl: z.string().optional(),
        model: z.string().optional(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
        latency: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const startTime = Date.now();

      try {
        const { createAIService } = await import('./services/ai-service');
        const testService = createAIService({
          provider: input.provider,
          apiKey: input.apiKey,
          apiUrl: input.apiUrl,
          model: input.model,
        });

        const response = await testService.generate('Test connection. Reply with "OK".');
        const latency = Date.now() - startTime;

        return {
          success: true,
          message: `Conexão bem-sucedida! Resposta: ${response.content.substring(0, 50)}...`,
          latency,
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Erro na conexão: ${error.message}`,
        };
      }
    }),

  /**
   * Obtém estatísticas de uso da IA
   */
  getUsageStats: publicProcedure
    .output(
      z.object({
        totalRequests: z.number(),
        cacheHitRate: z.number(),
        averageLatency: z.number(),
        costEstimate: z.number(),
      })
    )
    .query(async () => {
      // TODO: Implementar tracking de uso
      return {
        totalRequests: 0,
        cacheHitRate: 0,
        averageLatency: 0,
        costEstimate: 0,
      };
    }),
});
