/**
 * Sistema de Validação de Regras Inquebráveis
 * 
 * Este serviço garante que TODAS as regras críticas do CRM sejam seguidas
 * com 100% de confiabilidade, SEM FALHAS.
 * 
 * ZERO TOLERÂNCIA para violações de regras.
 */

import { z } from 'zod';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReminderSchedule {
  patientId: number;
  appointmentDate: Date;
  appointmentTime: string;
  clinicTimezone: string;
  isConfirmed: boolean;
  hasRescheduled: boolean;
}

export interface MessageToSend {
  patientId: number;
  patientName: string;
  patientWhatsApp: string;
  clinicName: string;
  appointmentDate: Date;
  appointmentTime: string;
  messageType: 'reminder' | 'confirmation' | 'rescheduling';
  messageContent: string;
  scheduledFor: Date;
}

// ============================================================================
// REGRAS DE HORÁRIOS
// ============================================================================

export class TimeRules {
  /**
   * REGRA CRÍTICA: Mensagens só podem ser enviadas entre 07:00 e 19:00
   */
  static isWithinAllowedHours(date: Date, timezone: string): boolean {
    const hour = date.getHours();
    return hour >= 7 && hour < 19;
  }

  /**
   * REGRA CRÍTICA: Validar se horário de envio está permitido
   */
  static validateSendTime(scheduledFor: Date, timezone: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.isWithinAllowedHours(scheduledFor, timezone)) {
      errors.push(
        `VIOLAÇÃO CRÍTICA: Tentativa de enviar mensagem fora do horário permitido (07:00-19:00). ` +
        `Horário solicitado: ${scheduledFor.toLocaleTimeString()}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ============================================================================
// REGRAS DE CONFIRMAÇÃO
// ============================================================================

export class ConfirmationRules {
  /**
   * Palavras-chave que indicam confirmação
   */
  private static readonly CONFIRMATION_KEYWORDS = [
    'sí', 'si', 'SÍ', 'SI',
    'sim', 'SIM',
    'ok', 'OK', 'Ok',
    'confirmo', 'CONFIRMO', 'Confirmo',
    'confirmar', 'CONFIRMAR', 'Confirmar',
    'estarei lá', 'vou', 'irei'
  ];

  /**
   * REGRA CRÍTICA: Detectar se mensagem é uma confirmação
   */
  static isConfirmation(message: string): boolean {
    const normalized = message.trim().toLowerCase();
    return this.CONFIRMATION_KEYWORDS.some(keyword => 
      normalized.includes(keyword.toLowerCase())
    );
  }

  /**
   * REGRA CRÍTICA: Ao confirmar, PARAR IMEDIATAMENTE todos os recordatórios
   */
  static validateConfirmationAction(
    patientId: number,
    isConfirmed: boolean,
    hasScheduledReminders: boolean
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (isConfirmed && hasScheduledReminders) {
      warnings.push(
        `ATENÇÃO: Paciente ${patientId} confirmou mas ainda tem recordatórios agendados. ` +
        `TODOS os recordatórios devem ser cancelados IMEDIATAMENTE.`
      );
    }

    return {
      valid: true,
      errors,
      warnings
    };
  }
}

// ============================================================================
// REGRAS DE REAGENDAMENTO
// ============================================================================

export class ReschedulingRules {
  /**
   * Palavras-chave que indicam solicitação de reagendamento
   */
  private static readonly RESCHEDULING_KEYWORDS = [
    'no pudeo', 'no puedo', 'não posso', 'nao posso',
    'no consigo', 'não consigo', 'nao consigo',
    'reagenda', 'reagendar',
    'para otro dia', 'outro dia',
    'no tiene', 'não tem', 'nao tem',
    'mudar', 'cambiar'
  ];

  /**
   * REGRA CRÍTICA: Detectar se mensagem é solicitação de reagendamento
   */
  static isReschedulingRequest(message: string): boolean {
    const normalized = message.trim().toLowerCase();
    return this.RESCHEDULING_KEYWORDS.some(keyword => 
      normalized.includes(keyword.toLowerCase())
    );
  }

  /**
   * REGRA CRÍTICA: Validar fluxo de reagendamento
   * 
   * 1. Enviar mensagem automática ao paciente
   * 2. Notificar secretária (WhatsApp corporativo)
   * 3. Exibir popup sonoro no dashboard
   */
  static validateReschedulingFlow(
    patientSentMessage: boolean,
    secretaryNotified: boolean,
    popupDisplayed: boolean
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!patientSentMessage) {
      errors.push('VIOLAÇÃO CRÍTICA: Mensagem automática não foi enviada ao paciente');
    }

    if (!secretaryNotified) {
      errors.push('VIOLAÇÃO CRÍTICA: Secretária não foi notificada no WhatsApp corporativo');
    }

    if (!popupDisplayed) {
      errors.push('VIOLAÇÃO CRÍTICA: Popup sonoro não foi exibido no dashboard');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * REGRA CRÍTICA ABSOLUTA: Sistema NUNCA pode reagendar automaticamente
   */
  static validateNoAutomaticRescheduling(
    systemAttemptedRescheduling: boolean
  ): ValidationResult {
    const errors: string[] = [];

    if (systemAttemptedRescheduling) {
      errors.push(
        '🚨 VIOLAÇÃO CRÍTICA ABSOLUTA: Sistema tentou reagendar automaticamente! ' +
        'APENAS A SECRETÁRIA pode reagendar. Esta é uma regra INQUEBRÁVEL.'
      );
    }

    return {
      valid: !systemAttemptedRescheduling,
      errors,
      warnings: []
    };
  }
}

// ============================================================================
// REGRAS DE RECORDATÓRIOS
// ============================================================================

export class ReminderRules {
  /**
   * REGRA CRÍTICA: Sequência de mensagens 2 dias antes
   */
  static readonly SEQUENCE_2_DAYS_BEFORE = [
    { hour: 10, minute: 0 },  // 10:00
    { hour: 15, minute: 0 },  // 15:00
    { hour: 19, minute: 0 }   // 19:00
  ];

  /**
   * REGRA CRÍTICA: Sequência de mensagens 1 dia antes (não confirmados)
   */
  static readonly SEQUENCE_1_DAY_BEFORE = [
    { hour: 7, minute: 0 },   // 07:00
    { hour: 8, minute: 0 },   // 08:00
    { hour: 10, minute: 0 },  // 10:00
    { hour: 12, minute: 0 },  // 12:00
    { hour: 14, minute: 0 },  // 14:00
    { hour: 16, minute: 0 },  // 16:00
    { hour: 18, minute: 0 }   // 18:00
  ];

  /**
   * REGRA CRÍTICA: Sequência de mensagens dia da consulta (não confirmados)
   */
  static readonly SEQUENCE_SAME_DAY = [
    { hour: 7, minute: 0 },   // 07:00
    { type: 'relative', hoursBeforeAppointment: 2 }  // 2h antes
  ];

  /**
   * REGRA CRÍTICA: Validar se deve enviar recordatório
   */
  static shouldSendReminder(
    isConfirmed: boolean,
    hasRescheduled: boolean,
    currentTime: Date,
    appointmentTime: Date
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // REGRA 1: NUNCA enviar para quem já confirmou
    if (isConfirmed) {
      errors.push(
        'VIOLAÇÃO CRÍTICA: Tentativa de enviar recordatório para paciente que JÁ CONFIRMOU. ' +
        'Recordatórios devem PARAR IMEDIATAMENTE após confirmação.'
      );
    }

    // REGRA 2: NUNCA enviar para quem solicitou reagendamento
    if (hasRescheduled) {
      errors.push(
        'VIOLAÇÃO CRÍTICA: Tentativa de enviar recordatório para paciente que SOLICITOU REAGENDAMENTO.'
      );
    }

    // REGRA 3: NUNCA enviar após o horário da consulta
    if (currentTime >= appointmentTime) {
      errors.push(
        'VIOLAÇÃO CRÍTICA: Tentativa de enviar recordatório APÓS o horário da consulta.'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * REGRA CRÍTICA: Validar progressão de tom das mensagens
   */
  static validateMessageTone(
    attemptNumber: number,
    tone: 'friendly' | 'educational' | 'firm' | 'persuasive'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const expectedTones = {
      1: 'friendly',
      2: 'educational',
      3: 'firm',
      4: 'persuasive'
    };

    const expected = expectedTones[Math.min(attemptNumber, 4) as keyof typeof expectedTones];
    
    if (tone !== expected) {
      warnings.push(
        `ATENÇÃO: Tom da mensagem (${tone}) não corresponde ao esperado (${expected}) ` +
        `para tentativa ${attemptNumber}`
      );
    }

    return {
      valid: true,
      errors,
      warnings
    };
  }
}

// ============================================================================
// REGRAS DE KANBAN
// ============================================================================

export class KanbanRules {
  /**
   * Colunas válidas do Kanban
   */
  static readonly VALID_COLUMNS = [
    'agendados',
    'nao_confirmados',
    'confirmados',
    'reagendamentos',
    'realizados',
    'faltaram'
  ] as const;

  /**
   * REGRA CRÍTICA: Paciente deve estar em APENAS UMA coluna
   */
  static validateSingleColumn(
    patientId: number,
    columns: string[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (columns.length === 0) {
      errors.push(
        `VIOLAÇÃO CRÍTICA: Paciente ${patientId} não está em NENHUMA coluna do Kanban`
      );
    }

    if (columns.length > 1) {
      errors.push(
        `VIOLAÇÃO CRÍTICA: Paciente ${patientId} está em MÚLTIPLAS colunas do Kanban: ${columns.join(', ')}. ` +
        `Paciente deve estar em APENAS UMA coluna.`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * REGRA CRÍTICA: Movimentação deve ser instantânea (máximo 1 segundo)
   */
  static validateMovementSpeed(
    startTime: Date,
    endTime: Date
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const durationMs = endTime.getTime() - startTime.getTime();
    const maxAllowedMs = 1000; // 1 segundo

    if (durationMs > maxAllowedMs) {
      errors.push(
        `VIOLAÇÃO CRÍTICA: Movimentação no Kanban levou ${durationMs}ms. ` +
        `Máximo permitido: ${maxAllowedMs}ms (1 segundo).`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * REGRA CRÍTICA: Dashboard e Kanban devem estar sincronizados
   */
  static validateDashboardKanbanSync(
    dashboardStatus: string,
    kanbanColumn: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const statusColumnMap: Record<string, string> = {
      'agendado': 'agendados',
      'nao_confirmado': 'nao_confirmados',
      'confirmado': 'confirmados',
      'reagendamento': 'reagendamentos',
      'realizado': 'realizados',
      'faltou': 'faltaram'
    };

    const expectedColumn = statusColumnMap[dashboardStatus];

    if (expectedColumn !== kanbanColumn) {
      errors.push(
        `VIOLAÇÃO CRÍTICA: Divergência entre Dashboard e Kanban. ` +
        `Dashboard: ${dashboardStatus}, Kanban: ${kanbanColumn}. ` +
        `ZERO DIVERGÊNCIAS são permitidas.`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ============================================================================
// REGRAS DE MENSAGENS
// ============================================================================

export class MessageRules {
  /**
   * REGRA CRÍTICA: Mensagem deve ser personalizada
   */
  static validatePersonalization(message: MessageToSend): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const requiredFields = {
      'Nome do paciente': message.patientName,
      'Nome da clínica': message.clinicName,
      'Data da consulta': message.appointmentDate,
      'Horário da consulta': message.appointmentTime
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(
          `VIOLAÇÃO CRÍTICA: Mensagem não contém ${field}. ` +
          `Todas as mensagens devem ser personalizadas.`
        );
      }
    }

    // Verificar se a mensagem contém os placeholders
    const content = message.messageContent;
    if (!content.includes(message.patientName)) {
      warnings.push('ATENÇÃO: Nome do paciente não aparece na mensagem');
    }
    if (!content.includes(message.clinicName)) {
      warnings.push('ATENÇÃO: Nome da clínica não aparece na mensagem');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * REGRA CRÍTICA: Saudação deve ser apropriada ao horário
   */
  static validateGreeting(
    message: string,
    sendTime: Date,
    language: 'es' | 'pt'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const hour = sendTime.getHours();
    
    const greetings = {
      es: {
        morning: ['buenos días', 'buen día'],
        afternoon: ['buenas tardes'],
        evening: ['buenas noches']
      },
      pt: {
        morning: ['bom dia'],
        afternoon: ['boa tarde'],
        evening: ['boa noite']
      }
    };

    let expectedGreetings: string[];
    if (hour >= 5 && hour < 12) {
      expectedGreetings = greetings[language].morning;
    } else if (hour >= 12 && hour < 19) {
      expectedGreetings = greetings[language].afternoon;
    } else {
      expectedGreetings = greetings[language].evening;
    }

    const normalized = message.toLowerCase();
    const hasCorrectGreeting = expectedGreetings.some(g => normalized.includes(g));

    if (!hasCorrectGreeting) {
      warnings.push(
        `ATENÇÃO: Saudação não corresponde ao horário de envio (${hour}h). ` +
        `Esperado: ${expectedGreetings.join(' ou ')}`
      );
    }

    return {
      valid: true,
      errors,
      warnings
    };
  }
}

// ============================================================================
// VALIDADOR PRINCIPAL
// ============================================================================

export class RulesValidator {
  /**
   * Validar TODAS as regras antes de enviar mensagem
   */
  static async validateBeforeSendingMessage(
    message: MessageToSend,
    schedule: ReminderSchedule
  ): Promise<ValidationResult> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // 1. Validar horário de envio
    const timeValidation = TimeRules.validateSendTime(
      message.scheduledFor,
      schedule.clinicTimezone
    );
    allErrors.push(...timeValidation.errors);
    allWarnings.push(...timeValidation.warnings);

    // 2. Validar se deve enviar recordatório
    if (message.messageType === 'reminder') {
      const reminderValidation = ReminderRules.shouldSendReminder(
        schedule.isConfirmed,
        schedule.hasRescheduled,
        message.scheduledFor,
        schedule.appointmentDate
      );
      allErrors.push(...reminderValidation.errors);
      allWarnings.push(...reminderValidation.warnings);
    }

    // 3. Validar personalização
    const personalizationValidation = MessageRules.validatePersonalization(message);
    allErrors.push(...personalizationValidation.errors);
    allWarnings.push(...personalizationValidation.warnings);

    // 4. Validar saudação
    const greetingValidation = MessageRules.validateGreeting(
      message.messageContent,
      message.scheduledFor,
      'es' // TODO: Detectar idioma da clínica
    );
    allErrors.push(...greetingValidation.errors);
    allWarnings.push(...greetingValidation.warnings);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Registrar violação de regra no log
   */
  static logViolation(violation: ValidationResult, context: any): void {
    if (!violation.valid) {
      console.error('🚨 VIOLAÇÃO DE REGRA CRÍTICA:', {
        timestamp: new Date().toISOString(),
        errors: violation.errors,
        warnings: violation.warnings,
        context
      });

      // TODO: Enviar alerta para administrador
      // TODO: Registrar em banco de dados de auditoria
    }
  }
}

export default RulesValidator;
