/**
 * Serviço de Recordatórios V2 - Com Regras Inquebráveis
 * 
 * Este serviço implementa TODAS as regras críticas de recordatórios
 * com 100% de confiabilidade, SEM FALHAS.
 */

import { RulesValidator, TimeRules, ConfirmationRules, ReminderRules, KanbanRules, MessageRules } from './rules-validator';

// ============================================================================
// TIPOS
// ============================================================================

export interface Patient {
  id: number;
  name: string;
  whatsapp: string;
  email?: string;
  clinicId: number;
}

export interface Clinic {
  id: number;
  name: string;
  country: string;
  timezone: string;
  corporateWhatsApp: string;
  email: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  clinicId: number;
  date: Date;
  time: string;
  type: 'orthodontic' | 'general';
  status: 'scheduled' | 'confirmed' | 'rescheduling' | 'completed' | 'no_show';
  confirmedAt?: Date;
}

export interface ReminderMessage {
  id: string;
  appointmentId: number;
  patientId: number;
  scheduledFor: Date;
  sentAt?: Date;
  type: '2_days_before' | '1_day_before' | 'same_day' | 'post_confirmation';
  attemptNumber: number;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

// ============================================================================
// TEMPLATES DE MENSAGENS
// ============================================================================

export class MessageTemplates {
  /**
   * Obter saudação baseada no horário
   */
  private static getGreeting(hour: number, language: 'es' | 'pt'): string {
    const greetings = {
      es: {
        morning: 'Buenos días',
        afternoon: 'Buenas tardes',
        evening: 'Buenas noches'
      },
      pt: {
        morning: 'Bom dia',
        afternoon: 'Boa tarde',
        evening: 'Boa noite'
      }
    };

    if (hour >= 5 && hour < 12) {
      return greetings[language].morning;
    } else if (hour >= 12 && hour < 19) {
      return greetings[language].afternoon;
    } else {
      return greetings[language].evening;
    }
  }

  /**
   * 2 DIAS ANTES - Mensagem 1 (10:00) - Tom amigável
   */
  static get2DaysBefore_Message1(
    patientName: string,
    clinicName: string,
    date: string,
    time: string,
    hour: number
  ): string {
    const greeting = this.getGreeting(hour, 'es');
    return `Hola, ${patientName} ${greeting} 😊

Te escribimos desde ${clinicName}.

Queremos recordarte tu cita de mantenimiento de ortodoncia con la Dra., el día ${date} a las ${time}.

Mantener las citas al día es fundamental para que tus dientes se alineen más rápido y de forma correcta.

Por favor, confirma tu asistencia respondiendo solo SÍ.`;
  }

  /**
   * 2 DIAS ANTES - Mensagem 2 (15:00) - Tom educacional
   */
  static get2DaysBefore_Message2(
    patientName: string,
    clinicName: string,
    date: string,
    time: string,
    hour: number
  ): string {
    const greeting = this.getGreeting(hour, 'es');
    return `Hola, ${patientName} ${greeting} 😊

Desde ${clinicName} reforzamos tu cita con la Dra. el ${date} a las ${time}.

Cuando el mantenimiento no se realiza en la fecha indicada, el tratamiento puede retrasarse, generar molestias y requerir ajustes adicionales.

Para continuar con tu tratamiento correctamente, confirma tu asistencia respondiendo SÍ.`;
  }

  /**
   * 2 DIAS ANTES - Mensagem 3 (19:00) - Tom firme com autoridade
   */
  static get2DaysBefore_Message3(
    patientName: string,
    clinicName: string,
    date: string,
    time: string,
    hour: number
  ): string {
    const greeting = this.getGreeting(hour, 'es');
    return `Hola, ${patientName} ${greeting} 😊

La Dra. nos pidió reforzar la importancia de tu asistencia en el día y horario agendados.

El mantenimiento regular es clave para que el tratamiento avance según lo planificado y sin retrasos.

Confirma tu presencia respondiendo únicamente SÍ.`;
  }

  /**
   * 1 DIA ANTES - Mensagem 1 (07:00) - Tom firme
   */
  static get1DayBefore_Message1(
    patientName: string,
    clinicName: string,
    date: string,
    time: string
  ): string {
    return `${patientName}, buen día.

La Dra. nos solicitó reforzar la importancia de tu asistencia en el día y horario programados.

El mantenimiento regular es clave para que el tratamiento avance según lo planificado y sin demoras.

Confirma tu presencia respondiendo únicamente SÍ.`;
  }

  /**
   * 1 DIA ANTES - Mensagem 2 (08:00) - Tom urgente
   */
  static get1DayBefore_Message2(
    patientName: string,
    clinicName: string,
    date: string,
    time: string
  ): string {
    return `${patientName}, esta es una última confirmación de ${clinicName}.

Tu cita de mantenimiento con la Dra., el ${date} a las ${time}, es esencial para evitar atrasos en el tratamiento y perjuicios en el alineamiento dental.

La ausencia sin confirmación impacta directamente en el progreso de tu ortodoncia.

Responde solo SÍ para confirmar tu asistencia.`;
  }

  /**
   * 1 DIA ANTES - Mensagens de 2 em 2 horas (10:00, 12:00, 14:00, 16:00, 18:00)
   */
  static get1DayBefore_PersuasiveMessages(
    patientName: string,
    clinicName: string,
    date: string,
    time: string,
    attemptNumber: number
  ): string {
    const messages = [
      // Tentativa 1 (10:00)
      `${patientName}, este es un aviso final de ${clinicName}.

Tu cita de mantenimiento de ortodoncia con la Dra. está programada para mañana ${date} a las ${time}.

La inasistencia sin confirmación compromete el avance de tu tratamiento, genera retrasos y afecta directamente el resultado del alineamiento dental planificado por la Dra.

Confirma tu asistencia respondiendo solo SÍ.`,

      // Tentativa 2 (12:00)
      `${patientName}, te contactamos desde ${clinicName}.

La Dra. refuerza la importancia de tu presencia mañana ${date} a las ${time}, ya que el mantenimiento regular es fundamental para que el tratamiento continúe según lo planificado.

Confirma tu asistencia respondiendo solo SÍ.`,

      // Tentativa 3 (14:00)
      `${patientName}, este es un recordatorio importante de ${clinicName}.

Tu cita de mantenimiento con la Dra. está programada para mañana ${date} a las ${time}.

La falta de asistencia provoca retrasos en el tratamiento y afecta el resultado final.

Confirma tu presencia respondiendo SÍ.`,

      // Tentativa 4 (16:00)
      `${patientName}, aviso final de ${clinicName}.

Tu horario con la Dra. está reservado exclusivamente para mañana ${date} a las ${time}.

La inasistencia sin confirmación compromete el avance del tratamiento y la planificación clínica.

Confirma de inmediato tu asistencia respondiendo solo SÍ.`,

      // Tentativa 5 (18:00)
      `${patientName}, este es un aviso final de ${clinicName}.

La Dra. mantiene su agenda organizada con antelación, y tu cita de mañana ${date} a las ${time} fue programada específicamente para tu tratamiento.

Confirma tu asistencia respondiendo únicamente SÍ.`
    ];

    return messages[Math.min(attemptNumber - 1, messages.length - 1)];
  }

  /**
   * DIA DA CONSULTA - Mensagem 1 (07:00) - Não confirmados
   */
  static getSameDay_Message1(
    patientName: string,
    clinicName: string,
    date: string,
    time: string
  ): string {
    return `${patientName}, este es un aviso final de ${clinicName}.

Tu cita de mantenimiento con la Dra. está programada para hoy ${date} a las ${time} y tu horario fue reservado exclusivamente para ti.

La inasistencia sin confirmación compromete el avance del tratamiento y la planificación clínica.

Confirma de inmediato respondiendo solo SÍ.`;
  }

  /**
   * DIA DA CONSULTA - Mensagem 2 (2h antes) - Não confirmados
   */
  static getSameDay_Message2(
    patientName: string,
    clinicName: string
  ): string {
    return `${clinicName}

${patientName}

La agenda de la Dra. es organizada con antelación.

La inasistencia sin confirmación compromete el tratamiento y la planificación clínica.

Agradecemos su compromiso con el tratamiento indicado por la Dra.

La ausencia sin aviso previo compromete el avance del tratamiento y la organización de la agenda médica.

Confirme su asistencia respondiendo SÍ.`;
  }

  /**
   * CONFIRMADOS - Mensagem educacional (1 dia antes, 10:00)
   */
  static getConfirmed_Educational(
    patientName: string,
    clinicName: string,
    date: string,
    time: string,
    hour: number
  ): string {
    const greeting = this.getGreeting(hour, 'es');
    return `Hola, ${patientName} ${greeting} 😊

Aquí es de ${clinicName}

Passando para lembrar do seu agendamento de manutenção ortodôntica com a Dra., no dia ${date}, às ${time}.

A manutenção em dia é essencial para que seus dentes se alinhem mais rápido e com melhores resultados.`;
  }

  /**
   * CONFIRMADOS - Mensagem do dia (07:00)
   */
  static getConfirmed_SameDay(
    patientName: string,
    time: string,
    hour: number
  ): string {
    const greeting = this.getGreeting(hour, 'es');
    return `¡Hola! ${patientName} ${greeting} 😊

Hoy damos otro pequeño gran paso hacia la sonrisa que estás construyendo 🦷✨

Te esperamos hoy las ${time} con la Dra! Cada cita es un paso más hacia tu mejor sonrisa 💙

¡Nos vemos!`;
  }
}

// ============================================================================
// SERVIÇO DE RECORDATÓRIOS
// ============================================================================

export class ReminderServiceV2 {
  /**
   * Agendar recordatórios para uma consulta
   * 
   * REGRA CRÍTICA: Seguir EXATAMENTE a sequência definida
   */
  static async scheduleReminders(
    appointment: Appointment,
    patient: Patient,
    clinic: Clinic
  ): Promise<ReminderMessage[]> {
    const messages: ReminderMessage[] = [];
    const appointmentDateTime = new Date(appointment.date);
    appointmentDateTime.setHours(
      parseInt(appointment.time.split(':')[0]),
      parseInt(appointment.time.split(':')[1])
    );

    // 2 DIAS ANTES - 3 mensagens (10:00, 15:00, 19:00)
    const twoDaysBefore = new Date(appointmentDateTime);
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

    messages.push(
      this.createReminderMessage(
        appointment,
        patient,
        clinic,
        new Date(twoDaysBefore.setHours(10, 0, 0, 0)),
        '2_days_before',
        1
      ),
      this.createReminderMessage(
        appointment,
        patient,
        clinic,
        new Date(twoDaysBefore.setHours(15, 0, 0, 0)),
        '2_days_before',
        2
      ),
      this.createReminderMessage(
        appointment,
        patient,
        clinic,
        new Date(twoDaysBefore.setHours(19, 0, 0, 0)),
        '2_days_before',
        3
      )
    );

    // 1 DIA ANTES - 7 mensagens (07:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00)
    const oneDayBefore = new Date(appointmentDateTime);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);

    const oneDayBeforeHours = [7, 8, 10, 12, 14, 16, 18];
    oneDayBeforeHours.forEach((hour, index) => {
      messages.push(
        this.createReminderMessage(
          appointment,
          patient,
          clinic,
          new Date(oneDayBefore.setHours(hour, 0, 0, 0)),
          '1_day_before',
          index + 1
        )
      );
    });

    // DIA DA CONSULTA - 2 mensagens (07:00 e 2h antes)
    const sameDay = new Date(appointmentDateTime);
    
    messages.push(
      this.createReminderMessage(
        appointment,
        patient,
        clinic,
        new Date(sameDay.setHours(7, 0, 0, 0)),
        'same_day',
        1
      )
    );

    // 2 horas antes da consulta
    const twoHoursBefore = new Date(appointmentDateTime);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    
    messages.push(
      this.createReminderMessage(
        appointment,
        patient,
        clinic,
        twoHoursBefore,
        'same_day',
        2
      )
    );

    return messages;
  }

  /**
   * Criar mensagem de recordatório
   */
  private static createReminderMessage(
    appointment: Appointment,
    patient: Patient,
    clinic: Clinic,
    scheduledFor: Date,
    type: ReminderMessage['type'],
    attemptNumber: number
  ): ReminderMessage {
    const dateStr = appointment.date.toLocaleDateString('es-ES');
    const hour = scheduledFor.getHours();

    let content = '';

    if (type === '2_days_before') {
      if (attemptNumber === 1) {
        content = MessageTemplates.get2DaysBefore_Message1(
          patient.name,
          clinic.name,
          dateStr,
          appointment.time,
          hour
        );
      } else if (attemptNumber === 2) {
        content = MessageTemplates.get2DaysBefore_Message2(
          patient.name,
          clinic.name,
          dateStr,
          appointment.time,
          hour
        );
      } else {
        content = MessageTemplates.get2DaysBefore_Message3(
          patient.name,
          clinic.name,
          dateStr,
          appointment.time,
          hour
        );
      }
    } else if (type === '1_day_before') {
      if (attemptNumber === 1) {
        content = MessageTemplates.get1DayBefore_Message1(
          patient.name,
          clinic.name,
          dateStr,
          appointment.time
        );
      } else if (attemptNumber === 2) {
        content = MessageTemplates.get1DayBefore_Message2(
          patient.name,
          clinic.name,
          dateStr,
          appointment.time
        );
      } else {
        content = MessageTemplates.get1DayBefore_PersuasiveMessages(
          patient.name,
          clinic.name,
          dateStr,
          appointment.time,
          attemptNumber - 2
        );
      }
    } else if (type === 'same_day') {
      if (attemptNumber === 1) {
        content = MessageTemplates.getSameDay_Message1(
          patient.name,
          clinic.name,
          dateStr,
          appointment.time
        );
      } else {
        content = MessageTemplates.getSameDay_Message2(
          patient.name,
          clinic.name
        );
      }
    }

    return {
      id: `${appointment.id}-${type}-${attemptNumber}`,
      appointmentId: appointment.id,
      patientId: patient.id,
      scheduledFor,
      type,
      attemptNumber,
      content,
      status: 'pending'
    };
  }

  /**
   * Processar confirmação de paciente
   * 
   * REGRA CRÍTICA: PARAR IMEDIATAMENTE todos os recordatórios
   */
  static async processConfirmation(
    appointmentId: number,
    patientMessage: string
  ): Promise<{
    isConfirmation: boolean;
    actions: string[];
  }> {
    const actions: string[] = [];

    // Detectar se é confirmação
    const isConfirmation = ConfirmationRules.isConfirmation(patientMessage);

    if (isConfirmation) {
      // AÇÃO 1: Cancelar TODOS os recordatórios pendentes
      actions.push('cancel_all_pending_reminders');

      // AÇÃO 2: Atualizar status da consulta para "confirmed"
      actions.push('update_appointment_status_to_confirmed');

      // AÇÃO 3: Mover paciente no Kanban para "Confirmados"
      actions.push('move_to_confirmed_column');

      // AÇÃO 4: Registrar horário da confirmação
      actions.push('log_confirmation_time');

      // AÇÃO 5: Agendar mensagens educacionais
      actions.push('schedule_educational_messages');
    }

    return {
      isConfirmation,
      actions
    };
  }

  /**
   * Validar antes de enviar mensagem
   * 
   * REGRA CRÍTICA: TODAS as validações devem passar
   */
  static async validateBeforeSending(
    message: ReminderMessage,
    appointment: Appointment,
    patient: Patient,
    clinic: Clinic
  ): Promise<{ canSend: boolean; errors: string[]; warnings: string[] }> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // 1. Validar horário (07:00 - 19:00)
    const timeValidation = TimeRules.validateSendTime(
      message.scheduledFor,
      clinic.timezone
    );
    allErrors.push(...timeValidation.errors);
    allWarnings.push(...timeValidation.warnings);

    // 2. Validar se deve enviar recordatório
    const reminderValidation = ReminderRules.shouldSendReminder(
      appointment.status === 'confirmed',
      appointment.status === 'rescheduling',
      message.scheduledFor,
      appointment.date
    );
    allErrors.push(...reminderValidation.errors);
    allWarnings.push(...reminderValidation.warnings);

    // 3. Validar personalização
    const personalizationValidation = MessageRules.validatePersonalization({
      patientId: patient.id,
      patientName: patient.name,
      patientWhatsApp: patient.whatsapp,
      clinicName: clinic.name,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      messageType: 'reminder',
      messageContent: message.content,
      scheduledFor: message.scheduledFor
    });
    allErrors.push(...personalizationValidation.errors);
    allWarnings.push(...personalizationValidation.warnings);

    return {
      canSend: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

export default ReminderServiceV2;
