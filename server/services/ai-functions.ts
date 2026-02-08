/**
 * AI Functions - Funções específicas de IA para o CRM Odontológico
 */

import { getAIService } from './ai-service';
import { z } from 'zod';

// Schemas de entrada e saída

export const MessageAnalysisSchema = z.object({
  intent: z.enum(['confirmar', 'reagendar', 'cancelar', 'duvida', 'outro']),
  urgency: z.enum(['baixa', 'media', 'alta', 'urgente']),
  sentiment: z.enum(['positivo', 'neutro', 'negativo']),
  preferredDate: z.string().optional(),
  reason: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type MessageAnalysis = z.infer<typeof MessageAnalysisSchema>;

export const InsightSchema = z.object({
  category: z.enum(['performance', 'risco', 'optimizacion', 'canal', 'engagement', 'oportunidad', 'general']),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']),
  title: z.string(),
  description: z.string(),
  suggestedActions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  impact: z.enum(['bajo', 'medio', 'alto']),
});

export type Insight = z.infer<typeof InsightSchema>;

export const ResponseSuggestionSchema = z.object({
  message: z.string(),
  tone: z.enum(['formal', 'amigable', 'urgente', 'educativo']),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.string()).optional(),
});

export type ResponseSuggestion = z.infer<typeof ResponseSuggestionSchema>;

/**
 * Analisa uma mensagem recebida do paciente
 */
export async function analyzeMessage(
  messageText: string,
  patientHistory?: any
): Promise<MessageAnalysis> {
  const aiService = getAIService();

  const prompt = `
Você é um assistente de IA especializado em análise de mensagens de pacientes odontológicos.

Analise a seguinte mensagem e retorne um JSON com:
- intent: intenção da mensagem (confirmar, reagendar, cancelar, duvida, outro)
- urgency: urgência (baixa, media, alta, urgente)
- sentiment: sentimento (positivo, neutro, negativo)
- preferredDate: data preferida se mencionada (formato ISO)
- reason: motivo se mencionado
- confidence: confiança da análise (0-1)

Mensagem do paciente: "${messageText}"

${patientHistory ? `Histórico do paciente: ${JSON.stringify(patientHistory)}` : ''}

Responda APENAS com JSON válido, sem explicações adicionais.
`;

  const response = await aiService.generate(prompt, {
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.content);
    return MessageAnalysisSchema.parse(parsed);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Fallback
    return {
      intent: 'outro',
      urgency: 'media',
      sentiment: 'neutro',
      confidence: 0.5,
    };
  }
}

/**
 * Gera insights automáticos baseados em dados do sistema
 */
export async function generateInsights(systemData: {
  appointmentStats: any;
  channelHealth: any;
  patientBehavior: any;
}): Promise<Insight[]> {
  const aiService = getAIService();

  const prompt = `
Você é um especialista em CRM odontológico e análise de dados.

Analise os seguintes dados do sistema e gere até 5 insights acionáveis:

Estatísticas de Agendamentos:
${JSON.stringify(systemData.appointmentStats, null, 2)}

Saúde dos Canais:
${JSON.stringify(systemData.channelHealth, null, 2)}

Comportamento dos Pacientes:
${JSON.stringify(systemData.patientBehavior, null, 2)}

Para cada insight, retorne um JSON com:
- category: categoria (performance, risco, optimizacion, canal, engagement, oportunidad, general)
- priority: prioridade (baixa, media, alta, urgente)
- title: título curto e claro
- description: descrição detalhada
- suggestedActions: array de ações sugeridas
- confidence: confiança (0-1)
- impact: impacto esperado (bajo, medio, alto)

Responda com um array JSON de insights, sem explicações adicionais.
`;

  const response = await aiService.generate(prompt, {
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.content);
    const insights = Array.isArray(parsed) ? parsed : parsed.insights || [];
    return insights.map((i: any) => InsightSchema.parse(i));
  } catch (error) {
    console.error('Error parsing insights:', error);
    return [];
  }
}

/**
 * Gera sugestão de resposta para uma mensagem
 */
export async function generateResponseSuggestion(
  messageText: string,
  context: {
    patientName: string;
    appointmentDate?: string;
    clinicName: string;
    tone?: 'formal' | 'amigable' | 'urgente' | 'educativo';
  }
): Promise<ResponseSuggestion> {
  const aiService = getAIService();

  const prompt = `
Você é um assistente de secretária de clínica odontológica.

Gere uma resposta apropriada para a seguinte mensagem do paciente:

Mensagem: "${messageText}"

Contexto:
- Nome do paciente: ${context.patientName}
- Data da consulta: ${context.appointmentDate || 'não especificada'}
- Nome da clínica: ${context.clinicName}
- Tom desejado: ${context.tone || 'amigable'}

A resposta deve ser:
- Em espanhol
- Profissional mas amigável
- Clara e objetiva
- Incluir o nome do paciente
- Incluir o nome da clínica

Retorne um JSON com:
- message: mensagem sugerida
- tone: tom usado
- confidence: confiança (0-1)
- alternatives: array com 2 alternativas de resposta

Responda APENAS com JSON válido.
`;

  const response = await aiService.generate(prompt, {
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.content);
    return ResponseSuggestionSchema.parse(parsed);
  } catch (error) {
    console.error('Error parsing response suggestion:', error);
    return {
      message: `Hola ${context.patientName}, gracias por tu mensaje. La secretaría de ${context.clinicName} te responderá pronto.`,
      tone: 'amigable',
      confidence: 0.5,
    };
  }
}

/**
 * Otimiza um template de mensagem
 */
export async function optimizeTemplate(
  templateText: string,
  performanceData: {
    confirmationRate: number;
    readRate: number;
    responseRate: number;
  }
): Promise<{
  optimizedText: string;
  improvements: string[];
  confidence: number;
}> {
  const aiService = getAIService();

  const prompt = `
Você é um especialista em copywriting e marketing para clínicas odontológicas.

Otimize o seguinte template de mensagem para melhorar as taxas de confirmação:

Template atual:
"${templateText}"

Performance atual:
- Taxa de confirmação: ${performanceData.confirmationRate}%
- Taxa de leitura: ${performanceData.readRate}%
- Taxa de resposta: ${performanceData.responseRate}%

Retorne um JSON com:
- optimizedText: texto otimizado (em espanhol)
- improvements: array de melhorias aplicadas
- confidence: confiança na otimização (0-1)

Princípios a aplicar:
- Clareza e objetividade
- Senso de urgência apropriado
- Personalização
- Call-to-action claro
- Tom profissional mas amigável

Responda APENAS com JSON válido.
`;

  const response = await aiService.generate(prompt, {
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      optimizedText: parsed.optimizedText || templateText,
      improvements: parsed.improvements || [],
      confidence: parsed.confidence || 0.7,
    };
  } catch (error) {
    console.error('Error parsing template optimization:', error);
    return {
      optimizedText: templateText,
      improvements: [],
      confidence: 0.5,
    };
  }
}

/**
 * Prediz probabilidade de no-show
 */
export async function predictNoShow(patientData: {
  historyNoShows: number;
  totalAppointments: number;
  lastConfirmationTime?: string;
  messageResponseRate: number;
  daysSinceLastVisit: number;
}): Promise<{
  probability: number;
  riskLevel: 'baixo' | 'medio' | 'alto';
  factors: string[];
  recommendations: string[];
}> {
  const aiService = getAIService();

  const prompt = `
Você é um especialista em análise preditiva para clínicas odontológicas.

Analise os dados do paciente e prediga a probabilidade de falta (no-show):

Dados do paciente:
${JSON.stringify(patientData, null, 2)}

Retorne um JSON com:
- probability: probabilidade de falta (0-1)
- riskLevel: nível de risco (baixo, medio, alto)
- factors: fatores que contribuem para o risco
- recommendations: recomendações para reduzir o risco

Responda APENAS com JSON válido.
`;

  const response = await aiService.generate(prompt, {
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      probability: parsed.probability || 0.5,
      riskLevel: parsed.riskLevel || 'medio',
      factors: parsed.factors || [],
      recommendations: parsed.recommendations || [],
    };
  } catch (error) {
    console.error('Error parsing no-show prediction:', error);
    
    // Fallback com lógica simples
    const noShowRate = patientData.historyNoShows / patientData.totalAppointments;
    const probability = noShowRate * 0.6 + (1 - patientData.messageResponseRate) * 0.4;
    
    return {
      probability,
      riskLevel: probability > 0.7 ? 'alto' : probability > 0.4 ? 'medio' : 'baixo',
      factors: ['Histórico de faltas', 'Taxa de resposta a mensagens'],
      recommendations: ['Enviar lembretes adicionais', 'Ligar para confirmar'],
    };
  }
}

/**
 * Analisa sentimento de múltiplas mensagens
 */
export async function analyzeSentimentBatch(
  messages: Array<{ id: string; text: string }>
): Promise<Array<{ id: string; sentiment: 'positivo' | 'neutro' | 'negativo'; score: number }>> {
  const aiService = getAIService();

  const prompt = `
Analise o sentimento das seguintes mensagens de pacientes:

${messages.map((m, i) => `${i + 1}. [ID: ${m.id}] "${m.text}"`).join('\n')}

Para cada mensagem, retorne:
- id: ID da mensagem
- sentiment: sentimento (positivo, neutro, negativo)
- score: pontuação de -1 (muito negativo) a 1 (muito positivo)

Responda com um array JSON, sem explicações adicionais.
`;

  const response = await aiService.generate(prompt, {
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.content);
    const results = Array.isArray(parsed) ? parsed : parsed.results || [];
    return results;
  } catch (error) {
    console.error('Error parsing sentiment analysis:', error);
    return messages.map(m => ({
      id: m.id,
      sentiment: 'neutro' as const,
      score: 0,
    }));
  }
}
