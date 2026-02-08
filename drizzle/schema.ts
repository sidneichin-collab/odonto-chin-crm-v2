import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * ODONTO CHIN CRM - Multi-Tenant Database Schema
 * Sistema de gestión para 68+ clínicas odontológicas con aislamiento completo de datos
 */

// ============================================================================
// CORE AUTHENTICATION & USERS
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super-admin", "admin", "user"]).default("user").notNull(),
  tenantId: int("tenantId"), // Clinic assignment (null for super-admin)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// TENANTS (CLINICS) - Multi-tenant core table
// ============================================================================

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }), // Dedicated email per clinic
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  
  // WhatsApp Integration
  whatsappNumber: varchar("whatsappNumber", { length: 50 }),
  whatsappInstanceId: varchar("whatsappInstanceId", { length: 100 }),
  
  // Configuration
  timezone: varchar("timezone", { length: 50 }).default("America/La_Paz"),
  language: varchar("language", { length: 10 }).default("es"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ============================================================================
// PATIENTS - Core patient management
// ============================================================================

export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  
  // Personal Information
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  dateOfBirth: date("dateOfBirth"),
  gender: mysqlEnum("gender", ["M", "F", "Otro"]),
  
  // Contact Information
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  whatsappNumber: varchar("whatsappNumber", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  
  // Medical History
  medicalHistory: text("medicalHistory"),
  allergies: text("allergies"),
  medications: text("medications"),
  emergencyContact: varchar("emergencyContact", { length: 100 }),
  emergencyPhone: varchar("emergencyPhone", { length: 50 }),
  
  // Risk Management
  isAtRisk: boolean("isAtRisk").default(false).notNull(),
  riskReason: text("riskReason"),
  lastContactDate: timestamp("lastContactDate"),
  
  // Contract Status (Orthodontics)
  hasActiveContract: boolean("hasActiveContract").default(false).notNull(), // Tem contrato de ortodontia ativo
  contractStartDate: date("contractStartDate"), // Data de início do contrato
  contractEndDate: date("contractEndDate"), // Data prevista de término
  contractType: mysqlEnum("contractType", ["Ortodoncia", "Clinico General", "Ninguno"]).default("Ninguno"),
  
  // Status
  status: mysqlEnum("status", ["Activo", "Inactivo", "En Tratamiento"]).default("Activo").notNull(),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

// ============================================================================
// APPOINTMENTS - Kanban system for appointments
// ============================================================================

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  patientId: int("patientId").notNull(),
  
  // Appointment Details
  type: mysqlEnum("type", ["Ortodontia", "Clinico General"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Scheduling
  appointmentDate: timestamp("appointmentDate").notNull(),
  duration: int("duration").default(30), // minutes
  dentistName: varchar("dentistName", { length: 100 }),
  
  // Kanban Status
  status: mysqlEnum("status", [
    "Pendiente",
    "Confirmado",
    "En Tratamiento",
    "Completado",
    "Cancelado",
    "No Asistió"
  ]).default("Pendiente").notNull(),
  
  // Reminders
  reminderSent: boolean("reminderSent").default(false).notNull(),
  reminderSentAt: timestamp("reminderSentAt"),
  confirmed: boolean("confirmed").default(false).notNull(),
  confirmedAt: timestamp("confirmedAt"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ============================================================================
// WAITING LIST - Patients waiting for appointments
// ============================================================================

export const waitingList = mysqlTable("waitingList", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  patientId: int("patientId").notNull(),
  
  // Request Details
  serviceType: mysqlEnum("serviceType", ["Ortodontia", "Clinico General"]).notNull(),
  priority: mysqlEnum("priority", ["Alta", "Media", "Baja"]).default("Media").notNull(),
  preferredDate: date("preferredDate"),
  preferredTime: varchar("preferredTime", { length: 50 }),
  
  // Status
  status: mysqlEnum("status", ["En Espera", "Contactado", "Agendado", "Cancelado"]).default("En Espera").notNull(),
  
  // Notes
  notes: text("notes"),
  
  // Contact tracking
  lastContactedAt: timestamp("lastContactedAt"),
  contactAttempts: int("contactAttempts").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WaitingList = typeof waitingList.$inferSelect;
export type InsertWaitingList = typeof waitingList.$inferInsert;

// ============================================================================
// WHATSAPP MESSAGES LOG - Track all WhatsApp communications
// ============================================================================

export const whatsappMessages = mysqlTable("whatsappMessages", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  patientId: int("patientId"),
  appointmentId: int("appointmentId"),
  
  // Message Details
  messageType: mysqlEnum("messageType", [
    "Recordatorio",
    "Confirmacion",
    "Cancelacion",
    "Alerta",
    "Manual"
  ]).notNull(),
  
  phoneNumber: varchar("phoneNumber", { length: 50 }).notNull(),
  messageContent: text("messageContent").notNull(),
  
  // Status
  status: mysqlEnum("status", ["Pendiente", "Enviado", "Entregado", "Leido", "Error"]).default("Pendiente").notNull(),
  errorMessage: text("errorMessage"),
  
  // Evolution API Response
  evolutionMessageId: varchar("evolutionMessageId", { length: 255 }),
  
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = typeof whatsappMessages.$inferInsert;

// ============================================================================
// AUTOMATION LOGS - Track N8N automation executions
// ============================================================================

export const automationLogs = mysqlTable("automationLogs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(), // Tenant isolation
  
  // Automation Details
  automationType: varchar("automationType", { length: 100 }).notNull(),
  workflowName: varchar("workflowName", { length: 255 }),
  
  // Execution
  status: mysqlEnum("status", ["Success", "Failed", "Pending"]).notNull(),
  executionData: text("executionData"), // JSON data
  errorMessage: text("errorMessage"),
  
  // Timing
  executedAt: timestamp("executedAt").defaultNow().notNull(),
  duration: int("duration"), // milliseconds
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutomationLog = typeof automationLogs.$inferSelect;
export type InsertAutomationLog = typeof automationLogs.$inferInsert;

// ============================================================================
// AUDIT LOGS - Track all system actions for security
// ============================================================================

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId"), // Can be null for super-admin actions
  userId: int("userId").notNull(),
  
  // Action Details
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  
  // Changes
  oldValue: text("oldValue"), // JSON
  newValue: text("newValue"), // JSON
  
  // Request Info
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [patients.tenantId],
    references: [tenants.id],
  }),
  appointments: many(appointments),
  waitingListEntries: many(waitingList),
  whatsappMessages: many(whatsappMessages),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [appointments.tenantId],
    references: [tenants.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
}));

export const waitingListRelations = relations(waitingList, ({ one }) => ({
  tenant: one(tenants, {
    fields: [waitingList.tenantId],
    references: [tenants.id],
  }),
  patient: one(patients, {
    fields: [waitingList.patientId],
    references: [patients.id],
  }),
}));

// ============================================================================
// REMINDER SETTINGS - Configurações de lembretes por clínica
// ============================================================================

export const reminderSettings = mysqlTable("reminderSettings", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull().unique(), // Uma configuração por clínica
  
  // Habilitar/Desabilitar lembretes
  enableReminders: boolean("enableReminders").default(true).notNull(),
  enableThreeDaysReminder: boolean("enableThreeDaysReminder").default(true).notNull(),
  enableOneDayReminder: boolean("enableOneDayReminder").default(true).notNull(),
  enableTwoHoursReminder: boolean("enableTwoHoursReminder").default(true).notNull(),
  enableThankYouMessage: boolean("enableThankYouMessage").default(true).notNull(),
  
  // Horários de envio
  threeDaysReminderTime: varchar("threeDaysReminderTime", { length: 5 }).default("09:00"), // HH:MM
  oneDayReminderTime: varchar("oneDayReminderTime", { length: 5 }).default("09:00"), // HH:MM
  
  // Multi-canal fallback
  enableEmailFallback: boolean("enableEmailFallback").default(true).notNull(),
  enableFacebookFallback: boolean("enableFacebookFallback").default(false).notNull(),
  enableInstagramFallback: boolean("enableInstagramFallback").default(false).notNull(),
  
  // Templates personalizados (opcional - se vazio, usa template padrão)
  customThreeDaysTemplate: text("customThreeDaysTemplate"),
  customOneDayTemplate: text("customOneDayTemplate"),
  customTwoHoursTemplate: text("customTwoHoursTemplate"),
  customThankYouTemplate: text("customThankYouTemplate"),
  
  // Confirmação automática
  enableAutoConfirmation: boolean("enableAutoConfirmation").default(true).notNull(),
  confirmationKeywords: text("confirmationKeywords").default("si,sí,sim,yes,confirmo,ok"), // CSV
  cancellationKeywords: text("cancellationKeywords").default("no,não,cancelar,reagendar"), // CSV
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReminderSettings = typeof reminderSettings.$inferSelect;
export type InsertReminderSettings = typeof reminderSettings.$inferInsert;

// ============================================================================
// REMINDER QUEUE - Fila de lembretes agendados
// ============================================================================

export const reminderQueue = mysqlTable("reminderQueue", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  appointmentId: int("appointmentId").notNull(),
  patientId: int("patientId").notNull(),
  
  // Tipo e horário
  reminderType: mysqlEnum("reminderType", ["3_days", "1_day", "2_hours", "thank_you"]).notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(), // Quando enviar
  
  // Status
  status: mysqlEnum("status", ["pending", "sent", "failed", "cancelled"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  
  // Canal usado
  channel: mysqlEnum("channel", ["whatsapp", "email", "facebook", "instagram", "none"]),
  attempts: int("attempts").default(0).notNull(),
  
  // Mensagem e erros
  message: text("message").notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReminderQueue = typeof reminderQueue.$inferSelect;
export type InsertReminderQueue = typeof reminderQueue.$inferInsert;

// ============================================================================
// CONFIRMATION LOG - Log de confirmações de pacientes
// ============================================================================

export const confirmationLog = mysqlTable("confirmationLog", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  appointmentId: int("appointmentId").notNull(),
  patientId: int("patientId").notNull(),
  
  // Confirmação
  confirmed: boolean("confirmed").notNull(),
  confirmedAt: timestamp("confirmedAt").notNull(),
  confirmationMessage: text("confirmationMessage").notNull(), // Mensagem do paciente
  
  // Canal
  channel: mysqlEnum("channel", ["whatsapp", "email", "facebook", "instagram", "phone", "in_person"]).notNull(),
  
  // Reagendamento
  needsRescheduling: boolean("needsRescheduling").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConfirmationLog = typeof confirmationLog.$inferSelect;
export type InsertConfirmationLog = typeof confirmationLog.$inferInsert;
