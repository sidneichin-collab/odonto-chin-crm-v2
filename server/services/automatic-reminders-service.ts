/**
 * SERVIÇO DE LEMBRETES AUTOMÁTICOS MULTI-CANAL
 * 
 * Sistema crítico para redução de inadimplência
 * 
 * Funcionalidades:
 * 1. Lembretes automáticos: 3 dias, 1 dia, 2h antes
 * 2. Confirmação automática (paciente responde Sim/Não)
 * 3. Reenvio multi-canal: WhatsApp → Email → Facebook → Instagram
 * 4. Mensagem de agradecimento 2h depois
 */

interface ReminderConfig {
  clinicId: number;
  clinicName: string;
  clinicWhatsApp: string;
  clinicEmail: string;
  timezone: string;
}

interface AppointmentData {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientFacebook?: string;
  patientInstagram?: string;
  appointmentDate: Date;
  appointmentTime: string;
  type: "Ortodoncia" | "Clinico General";
  dentistName?: string;
}

interface ReminderSchedule {
  appointmentId: number;
  reminders: {
    threeDaysBefore: Date;
    oneDayBefore: Date;
    twoHoursBefore: Date;
    twoHoursAfter: Date;
  };
}

export class AutomaticRemindersService {
  /**
   * Calcular horários dos lembretes
   */
  calculateReminderSchedule(appointmentDate: Date, appointmentTime: string): ReminderSchedule["reminders"] {
    // Parse appointment datetime
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // 3 dias antes (9:00 AM)
    const threeDaysBefore = new Date(appointmentDateTime);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
    threeDaysBefore.setHours(9, 0, 0, 0);

    // 1 dia antes (9:00 AM)
    const oneDayBefore = new Date(appointmentDateTime);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(9, 0, 0, 0);

    // 2 horas antes
    const twoHoursBefore = new Date(appointmentDateTime);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);

    // 2 horas depois
    const twoHoursAfter = new Date(appointmentDateTime);
    twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

    return {
      threeDaysBefore,
      oneDayBefore,
      twoHoursBefore,
      twoHoursAfter
    };
  }

  /**
   * Gerar mensagem de lembrete personalizada
   */
  generateReminderMessage(
    config: ReminderConfig,
    appointment: AppointmentData,
    type: "3_days" | "1_day" | "2_hours"
  ): string {
    const { clinicName, clinicWhatsApp } = config;
    const { patientName, appointmentDate, appointmentTime, type: appointmentType } = appointment;

    const date = appointmentDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const messages = {
      "3_days": `🦷 Hola ${patientName}! 

Te recordamos tu cita de ${appointmentType} en *${clinicName}*

📅 Fecha: ${date}
⏰ Hora: ${appointmentTime}

Por favor, confirma tu asistencia respondiendo:
✅ *SÍ* - Confirmo mi asistencia
❌ *NO* - Necesito reagendar

Si necesitas cambiar la fecha, contáctanos al ${clinicWhatsApp}

¡Te esperamos! 😊`,

      "1_day": `🦷 Hola ${patientName}! 

Recordatorio: Tu cita de ${appointmentType} es MAÑANA

📅 Fecha: ${date}
⏰ Hora: ${appointmentTime}
📍 ${clinicName}

¿Confirmas tu asistencia?
✅ *SÍ* - Confirmo
❌ *NO* - Necesito reagendar

Es importante que confirmes para mantener tu espacio reservado.

¡Nos vemos mañana! 😊`,

      "2_hours": `🦷 Hola ${patientName}! 

⏰ RECORDATORIO URGENTE ⏰

Tu cita de ${appointmentType} es en 2 HORAS

⏰ Hora: ${appointmentTime}
📍 ${clinicName}

Si no puedes asistir, por favor avísanos AHORA al ${clinicWhatsApp}

¡Te esperamos! 🙌`
    };

    return messages[type];
  }

  /**
   * Gerar mensagem de agradecimento pós-consulta
   */
  generateThankYouMessage(
    config: ReminderConfig,
    appointment: AppointmentData
  ): string {
    const { clinicName } = config;
    const { patientName, type: appointmentType } = appointment;

    return `🦷 Hola ${patientName}! 

Gracias por confiar en *${clinicName}* para tu tratamiento de ${appointmentType} 💙

Tu salud bucal es muy importante para nosotros. Recuerda:

✨ Mantén una buena higiene bucal
✨ Sigue las indicaciones del doctor
✨ Agenda tu próxima cita a tiempo

¿Tienes alguna duda o molestia? Estamos aquí para ayudarte.

¡Que tengas un excelente día! 😊

---
*${clinicName}*
Tu sonrisa, nuestra pasión 🦷✨`;
  }

  /**
   * Enviar lembrete por WhatsApp
   */
  async sendWhatsAppReminder(
    phoneNumber: string,
    message: string,
    appointmentId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Aqui você integraria com API de WhatsApp (Evolution API, Baileys, etc.)
      // Por enquanto, apenas simulando
      console.log(`[WhatsApp] Enviando para ${phoneNumber}:`, message);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar lembrete por Email
   */
  async sendEmailReminder(
    email: string,
    subject: string,
    message: string,
    appointmentId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Aqui você integraria com serviço de email (SendGrid, AWS SES, etc.)
      console.log(`[Email] Enviando para ${email}:`, subject);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar lembrete por Facebook Messenger
   */
  async sendFacebookReminder(
    facebookId: string,
    message: string,
    appointmentId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Aqui você integraria com Facebook Messenger API
      console.log(`[Facebook] Enviando para ${facebookId}:`, message);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar lembrete por Instagram
   */
  async sendInstagramReminder(
    instagramHandle: string,
    message: string,
    appointmentId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Aqui você integraria com Instagram API
      console.log(`[Instagram] Enviando para ${instagramHandle}:`, message);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar lembrete com fallback multi-canal
   * Tenta WhatsApp → Email → Facebook → Instagram
   */
  async sendReminderWithFallback(
    config: ReminderConfig,
    appointment: AppointmentData,
    type: "3_days" | "1_day" | "2_hours"
  ): Promise<{
    success: boolean;
    channel: "whatsapp" | "email" | "facebook" | "instagram" | "none";
    attempts: number;
    errors: string[];
  }> {
    const message = this.generateReminderMessage(config, appointment, type);
    const errors: string[] = [];
    let attempts = 0;

    // 1. Tentar WhatsApp
    if (appointment.patientPhone) {
      attempts++;
      const result = await this.sendWhatsAppReminder(
        appointment.patientPhone,
        message,
        appointment.id
      );
      if (result.success) {
        return { success: true, channel: "whatsapp", attempts, errors };
      }
      errors.push(`WhatsApp: ${result.error}`);
    }

    // 2. Tentar Email
    if (appointment.patientEmail) {
      attempts++;
      const result = await this.sendEmailReminder(
        appointment.patientEmail,
        `Recordatorio de Cita - ${config.clinicName}`,
        message,
        appointment.id
      );
      if (result.success) {
        return { success: true, channel: "email", attempts, errors };
      }
      errors.push(`Email: ${result.error}`);
    }

    // 3. Tentar Facebook
    if (appointment.patientFacebook) {
      attempts++;
      const result = await this.sendFacebookReminder(
        appointment.patientFacebook,
        message,
        appointment.id
      );
      if (result.success) {
        return { success: true, channel: "facebook", attempts, errors };
      }
      errors.push(`Facebook: ${result.error}`);
    }

    // 4. Tentar Instagram
    if (appointment.patientInstagram) {
      attempts++;
      const result = await this.sendInstagramReminder(
        appointment.patientInstagram,
        message,
        appointment.id
      );
      if (result.success) {
        return { success: true, channel: "instagram", attempts, errors };
      }
      errors.push(`Instagram: ${result.error}`);
    }

    // Falhou em todos os canais
    return { success: false, channel: "none", attempts, errors };
  }

  /**
   * Processar confirmação de paciente
   */
  async processPatientConfirmation(
    appointmentId: number,
    response: string
  ): Promise<{
    confirmed: boolean;
    needsRescheduling: boolean;
    message: string;
  }> {
    const normalizedResponse = response.toLowerCase().trim();

    // Respostas positivas
    const positiveResponses = ['si', 'sí', 'sim', 'yes', 'confirmo', 'ok', 'vale', 'claro'];
    if (positiveResponses.some(r => normalizedResponse.includes(r))) {
      return {
        confirmed: true,
        needsRescheduling: false,
        message: '✅ ¡Perfecto! Tu cita está confirmada. ¡Te esperamos! 😊'
      };
    }

    // Respostas negativas
    const negativeResponses = ['no', 'não', 'nao', 'cancelar', 'reagendar'];
    if (negativeResponses.some(r => normalizedResponse.includes(r))) {
      return {
        confirmed: false,
        needsRescheduling: true,
        message: 'Entendido. ¿Qué día y hora te vendría mejor? Nuestro equipo te contactará pronto para reagendar. 📅'
      };
    }

    // Resposta não reconhecida
    return {
      confirmed: false,
      needsRescheduling: false,
      message: 'Por favor, responde *SÍ* para confirmar o *NO* si necesitas reagendar. Gracias! 😊'
    };
  }

  /**
   * Agendar todos os lembretes para um agendamento
   */
  async scheduleAllReminders(
    config: ReminderConfig,
    appointment: AppointmentData
  ): Promise<{
    success: boolean;
    scheduled: ReminderSchedule;
    errors: string[];
  }> {
    try {
      const schedule = this.calculateReminderSchedule(
        appointment.appointmentDate,
        appointment.appointmentTime
      );

      // Aqui você salvaria no banco de dados para processar depois
      // com um cron job ou worker

      return {
        success: true,
        scheduled: {
          appointmentId: appointment.id,
          reminders: schedule
        },
        errors: []
      };
    } catch (error: any) {
      return {
        success: false,
        scheduled: {
          appointmentId: appointment.id,
          reminders: {
            threeDaysBefore: new Date(),
            oneDayBefore: new Date(),
            twoHoursBefore: new Date(),
            twoHoursAfter: new Date()
          }
        },
        errors: [error.message]
      };
    }
  }
}

// Singleton
export const automaticRemindersService = new AutomaticRemindersService();
