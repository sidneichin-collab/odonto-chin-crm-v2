/**
 * Schema de Banco de Dados para Recordatórios e Reagendamentos
 * 
 * Tabelas necessárias para o sistema de regras inquebráveis
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ============================================================================
// TABELA: reminder_messages
// ============================================================================

export const reminderMessages = sqliteTable('reminder_messages', {
  id: text('id').primaryKey(),
  appointmentId: integer('appointment_id').notNull(),
  patientId: integer('patient_id').notNull(),
  clinicId: integer('clinic_id').notNull(),
  scheduledFor: text('scheduled_for').notNull(), // ISO datetime
  sentAt: text('sent_at'), // ISO datetime
  type: text('type').notNull(), // '2_days_before' | '1_day_before' | 'same_day' | 'post_confirmation'
  attemptNumber: integer('attempt_number').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull(), // 'pending' | 'sent' | 'failed' | 'cancelled'
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull(), // ISO datetime
  updatedAt: text('updated_at').notNull(), // ISO datetime
});

// ============================================================================
// TABELA: rescheduling_requests
// ============================================================================

export const reschedulingRequests = sqliteTable('rescheduling_requests', {
  id: text('id').primaryKey(),
  appointmentId: integer('appointment_id').notNull(),
  patientId: integer('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  patientWhatsApp: text('patient_whatsapp').notNull(),
  clinicId: integer('clinic_id').notNull(),
  originalDate: text('original_date').notNull(), // ISO date
  originalTime: text('original_time').notNull(),
  requestedAt: text('requested_at').notNull(), // ISO datetime
  status: text('status').notNull(), // 'pending' | 'handled' | 'cancelled'
  handledBy: integer('handled_by'), // ID da secretária
  handledAt: text('handled_at'), // ISO datetime
  notes: text('notes'),
  createdAt: text('created_at').notNull(), // ISO datetime
  updatedAt: text('updated_at').notNull(), // ISO datetime
});

// ============================================================================
// TABELA: appointment_confirmations
// ============================================================================

export const appointmentConfirmations = sqliteTable('appointment_confirmations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appointmentId: integer('appointment_id').notNull().unique(),
  patientId: integer('patient_id').notNull(),
  clinicId: integer('clinic_id').notNull(),
  confirmedAt: text('confirmed_at').notNull(), // ISO datetime
  confirmationMessage: text('confirmation_message').notNull(),
  confirmationChannel: text('confirmation_channel').notNull(), // 'whatsapp' | 'email' | 'messenger'
  createdAt: text('created_at').notNull(), // ISO datetime
});

// ============================================================================
// TABELA: reminder_statistics
// ============================================================================

export const reminderStatistics = sqliteTable('reminder_statistics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clinicId: integer('clinic_id').notNull(),
  date: text('date').notNull(), // ISO date (YYYY-MM-DD)
  totalScheduled: integer('total_scheduled').notNull().default(0),
  totalSent: integer('total_sent').notNull().default(0),
  totalFailed: integer('total_failed').notNull().default(0),
  totalCancelled: integer('total_cancelled').notNull().default(0),
  totalConfirmed: integer('total_confirmed').notNull().default(0),
  confirmationRate: integer('confirmation_rate').notNull().default(0), // Percentual (0-100)
  averageConfirmationTimeMinutes: integer('average_confirmation_time_minutes').notNull().default(0),
  createdAt: text('created_at').notNull(), // ISO datetime
  updatedAt: text('updated_at').notNull(), // ISO datetime
});

// ============================================================================
// TABELA: rescheduling_statistics
// ============================================================================

export const reschedulingStatistics = sqliteTable('rescheduling_statistics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clinicId: integer('clinic_id').notNull(),
  date: text('date').notNull(), // ISO date (YYYY-MM-DD)
  totalRequests: integer('total_requests').notNull().default(0),
  totalPending: integer('total_pending').notNull().default(0),
  totalHandled: integer('total_handled').notNull().default(0),
  totalCancelled: integer('total_cancelled').notNull().default(0),
  averageResponseTimeMinutes: integer('average_response_time_minutes').notNull().default(0),
  createdAt: text('created_at').notNull(), // ISO datetime
  updatedAt: text('updated_at').notNull(), // ISO datetime
});

// ============================================================================
// TABELA: rules_violations
// ============================================================================

export const rulesViolations = sqliteTable('rules_violations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clinicId: integer('clinic_id').notNull(),
  violationType: text('violation_type').notNull(), // 'time' | 'confirmation' | 'rescheduling' | 'kanban' | 'message'
  severity: text('severity').notNull(), // 'critical' | 'high' | 'medium' | 'low'
  description: text('description').notNull(),
  context: text('context').notNull(), // JSON string
  resolvedAt: text('resolved_at'), // ISO datetime
  createdAt: text('created_at').notNull(), // ISO datetime
});

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export type ReminderMessage = typeof reminderMessages.$inferSelect;
export type NewReminderMessage = typeof reminderMessages.$inferInsert;

export type ReschedulingRequest = typeof reschedulingRequests.$inferSelect;
export type NewReschedulingRequest = typeof reschedulingRequests.$inferInsert;

export type AppointmentConfirmation = typeof appointmentConfirmations.$inferSelect;
export type NewAppointmentConfirmation = typeof appointmentConfirmations.$inferInsert;

export type ReminderStatistic = typeof reminderStatistics.$inferSelect;
export type NewReminderStatistic = typeof reminderStatistics.$inferInsert;

export type ReschedulingStatistic = typeof reschedulingStatistics.$inferSelect;
export type NewReschedulingStatistic = typeof reschedulingStatistics.$inferInsert;

export type RulesViolation = typeof rulesViolations.$inferSelect;
export type NewRulesViolation = typeof rulesViolations.$inferInsert;
