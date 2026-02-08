/**
 * Funções de Banco de Dados para Recordatórios e Reagendamentos
 */

import { db } from './db-setup';
import {
  reminderMessages,
  reschedulingRequests,
  appointmentConfirmations,
  reminderStatistics,
  reschedulingStatistics,
  rulesViolations,
  type ReminderMessage,
  type NewReminderMessage,
  type ReschedulingRequest,
  type NewReschedulingRequest,
  type AppointmentConfirmation,
  type NewAppointmentConfirmation,
  type RulesViolation,
  type NewRulesViolation
} from './db-reminders-schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// ============================================================================
// REMINDER MESSAGES
// ============================================================================

export async function createReminderMessage(message: NewReminderMessage): Promise<ReminderMessage> {
  const now = new Date().toISOString();
  const [created] = await db.insert(reminderMessages).values({
    ...message,
    createdAt: now,
    updatedAt: now
  }).returning();
  return created;
}

export async function getReminderMessage(id: string): Promise<ReminderMessage | undefined> {
  const [message] = await db.select().from(reminderMessages).where(eq(reminderMessages.id, id));
  return message;
}

export async function updateReminderMessageStatus(
  id: string,
  status: 'pending' | 'sent' | 'failed' | 'cancelled',
  errorMessage?: string
): Promise<void> {
  const updates: any = {
    status,
    updatedAt: new Date().toISOString()
  };

  if (status === 'sent') {
    updates.sentAt = new Date().toISOString();
  }

  if (errorMessage) {
    updates.errorMessage = errorMessage;
  }

  await db.update(reminderMessages)
    .set(updates)
    .where(eq(reminderMessages.id, id));
}

export async function getPendingReminderMessages(clinicId: number): Promise<ReminderMessage[]> {
  return db.select()
    .from(reminderMessages)
    .where(
      and(
        eq(reminderMessages.clinicId, clinicId),
        eq(reminderMessages.status, 'pending')
      )
    )
    .orderBy(reminderMessages.scheduledFor);
}

export async function getUpcomingReminderMessages(
  clinicId: number,
  startDate: Date,
  endDate: Date
): Promise<ReminderMessage[]> {
  return db.select()
    .from(reminderMessages)
    .where(
      and(
        eq(reminderMessages.clinicId, clinicId),
        gte(reminderMessages.scheduledFor, startDate.toISOString()),
        lte(reminderMessages.scheduledFor, endDate.toISOString())
      )
    )
    .orderBy(reminderMessages.scheduledFor);
}

export async function cancelRemindersByAppointment(appointmentId: number): Promise<number> {
  const result = await db.update(reminderMessages)
    .set({
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    })
    .where(
      and(
        eq(reminderMessages.appointmentId, appointmentId),
        eq(reminderMessages.status, 'pending')
      )
    );
  
  return result.changes || 0;
}

// ============================================================================
// RESCHEDULING REQUESTS
// ============================================================================

export async function createReschedulingRequest(request: NewReschedulingRequest): Promise<ReschedulingRequest> {
  const now = new Date().toISOString();
  const [created] = await db.insert(reschedulingRequests).values({
    ...request,
    createdAt: now,
    updatedAt: now
  }).returning();
  return created;
}

export async function getReschedulingRequest(id: string): Promise<ReschedulingRequest | undefined> {
  const [request] = await db.select().from(reschedulingRequests).where(eq(reschedulingRequests.id, id));
  return request;
}

export async function markReschedulingAsHandled(
  id: string,
  secretaryId: number,
  notes?: string
): Promise<void> {
  await db.update(reschedulingRequests)
    .set({
      status: 'handled',
      handledBy: secretaryId,
      handledAt: new Date().toISOString(),
      notes,
      updatedAt: new Date().toISOString()
    })
    .where(eq(reschedulingRequests.id, id));
}

export async function getPendingReschedulingRequests(clinicId: number): Promise<ReschedulingRequest[]> {
  return db.select()
    .from(reschedulingRequests)
    .where(
      and(
        eq(reschedulingRequests.clinicId, clinicId),
        eq(reschedulingRequests.status, 'pending')
      )
    )
    .orderBy(desc(reschedulingRequests.requestedAt));
}

export async function getReschedulingRequestsByDateRange(
  clinicId: number,
  startDate: Date,
  endDate: Date
): Promise<ReschedulingRequest[]> {
  return db.select()
    .from(reschedulingRequests)
    .where(
      and(
        eq(reschedulingRequests.clinicId, clinicId),
        gte(reschedulingRequests.requestedAt, startDate.toISOString()),
        lte(reschedulingRequests.requestedAt, endDate.toISOString())
      )
    )
    .orderBy(desc(reschedulingRequests.requestedAt));
}

// ============================================================================
// APPOINTMENT CONFIRMATIONS
// ============================================================================

export async function createAppointmentConfirmation(confirmation: NewAppointmentConfirmation): Promise<AppointmentConfirmation> {
  const now = new Date().toISOString();
  const [created] = await db.insert(appointmentConfirmations).values({
    ...confirmation,
    createdAt: now
  }).returning();
  return created;
}

export async function getAppointmentConfirmation(appointmentId: number): Promise<AppointmentConfirmation | undefined> {
  const [confirmation] = await db.select()
    .from(appointmentConfirmations)
    .where(eq(appointmentConfirmations.appointmentId, appointmentId));
  return confirmation;
}

export async function isAppointmentConfirmed(appointmentId: number): Promise<boolean> {
  const confirmation = await getAppointmentConfirmation(appointmentId);
  return !!confirmation;
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function updateReminderStatistics(clinicId: number, date: string): Promise<void> {
  // TODO: Calcular estatísticas do dia
  // Por enquanto, apenas criar/atualizar registro
  const now = new Date().toISOString();
  
  // Tentar atualizar primeiro
  const existing = await db.select()
    .from(reminderStatistics)
    .where(
      and(
        eq(reminderStatistics.clinicId, clinicId),
        eq(reminderStatistics.date, date)
      )
    );

  if (existing.length > 0) {
    await db.update(reminderStatistics)
      .set({ updatedAt: now })
      .where(
        and(
          eq(reminderStatistics.clinicId, clinicId),
          eq(reminderStatistics.date, date)
        )
      );
  } else {
    await db.insert(reminderStatistics).values({
      clinicId,
      date,
      totalScheduled: 0,
      totalSent: 0,
      totalFailed: 0,
      totalCancelled: 0,
      totalConfirmed: 0,
      confirmationRate: 0,
      averageConfirmationTimeMinutes: 0,
      createdAt: now,
      updatedAt: now
    });
  }
}

export async function updateReschedulingStatistics(clinicId: number, date: string): Promise<void> {
  // TODO: Calcular estatísticas do dia
  const now = new Date().toISOString();
  
  const existing = await db.select()
    .from(reschedulingStatistics)
    .where(
      and(
        eq(reschedulingStatistics.clinicId, clinicId),
        eq(reschedulingStatistics.date, date)
      )
    );

  if (existing.length > 0) {
    await db.update(reschedulingStatistics)
      .set({ updatedAt: now })
      .where(
        and(
          eq(reschedulingStatistics.clinicId, clinicId),
          eq(reschedulingStatistics.date, date)
        )
      );
  } else {
    await db.insert(reschedulingStatistics).values({
      clinicId,
      date,
      totalRequests: 0,
      totalPending: 0,
      totalHandled: 0,
      totalCancelled: 0,
      averageResponseTimeMinutes: 0,
      createdAt: now,
      updatedAt: now
    });
  }
}

// ============================================================================
// RULES VIOLATIONS
// ============================================================================

export async function logRulesViolation(violation: NewRulesViolation): Promise<RulesViolation> {
  const now = new Date().toISOString();
  const [created] = await db.insert(rulesViolations).values({
    ...violation,
    createdAt: now
  }).returning();
  
  // Log crítico no console
  console.error('🚨 VIOLAÇÃO DE REGRA CRÍTICA:', {
    type: violation.violationType,
    severity: violation.severity,
    description: violation.description
  });
  
  return created;
}

export async function getUnresolvedViolations(clinicId: number): Promise<RulesViolation[]> {
  return db.select()
    .from(rulesViolations)
    .where(
      and(
        eq(rulesViolations.clinicId, clinicId),
        eq(rulesViolations.resolvedAt, null as any)
      )
    )
    .orderBy(desc(rulesViolations.createdAt));
}

export async function resolveViolation(id: number): Promise<void> {
  await db.update(rulesViolations)
    .set({ resolvedAt: new Date().toISOString() })
    .where(eq(rulesViolations.id, id));
}
