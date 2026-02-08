/**
 * Schema Multi-Tenant para Sistema de Clínicas
 * 
 * Suporta até 150 clínicas com dados isolados
 */

import { mysqlTable, varchar, int, timestamp, text, boolean, mysqlEnum } from 'drizzle-orm/mysql-core';

// ============================================================================
// TABELA: clinics (Clínicas)
// ============================================================================

export const clinics = mysqlTable('clinics', {
  id: int('id').primaryKey().autoincrement(),
  
  // Información Básica
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(), // URL amigable
  country: varchar('country', { length: 100 }).notNull(), // Bolivia, Paraguay, Uruguay, Chile, Panamá
  city: varchar('city', { length: 255 }),
  address: text('address'),
  
  // Contacto
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  corporateWhatsapp: varchar('corporate_whatsapp', { length: 50 }), // WhatsApp corporativo
  email: varchar('email', { length: 255 }).notNull(),
  
  // Configuración
  timezone: varchar('timezone', { length: 100 }).default('America/La_Paz'),
  language: varchar('language', { length: 10 }).default('es'), // es, en, pt
  
  // Estado
  status: mysqlEnum('status', ['pending', 'active', 'suspended', 'cancelled']).default('pending'),
  
  // Límites
  maxUsers: int('max_users').default(5), // Máximo de usuarios por clínica
  maxPatients: int('max_patients').default(1000), // Máximo de pacientes
  
  // Plan (para futuro)
  plan: varchar('plan', { length: 50 }).default('basic'), // basic, premium, enterprise
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  approvedAt: timestamp('approved_at'),
  approvedBy: int('approved_by'), // ID del super-admin que aprobó
});

// ============================================================================
// TABELA: users (Usuarios del Sistema)
// ============================================================================

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  
  // Clínica (null = super-admin)
  clinicId: int('clinic_id'),
  
  // Información Personal
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  
  // Autenticación
  passwordHash: varchar('password_hash', { length: 255 }), // null si usa Google OAuth
  googleId: varchar('google_id', { length: 255 }), // ID de Google OAuth
  googleEmail: varchar('google_email', { length: 255 }), // Email de Google
  googleAvatar: text('google_avatar'), // URL del avatar de Google
  
  // Rol
  role: mysqlEnum('role', ['super_admin', 'admin', 'secretary', 'dentist']).default('secretary'),
  
  // Estado
  status: mysqlEnum('status', ['pending', 'active', 'suspended']).default('pending'),
  emailVerified: boolean('email_verified').default(false),
  
  // Metadata
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABELA: clinic_requests (Solicitudes de Acceso)
// ============================================================================

export const clinicRequests = mysqlTable('clinic_requests', {
  id: int('id').primaryKey().autoincrement(),
  
  // Información de la Clínica
  clinicName: varchar('clinic_name', { length: 255 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  city: varchar('city', { length: 255 }),
  
  // Contacto
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  
  // Solicitante
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  contactRole: varchar('contact_role', { length: 100 }), // Gerente, Secretaria, etc.
  
  // Mensaje
  message: text('message'),
  
  // Estado
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending'),
  
  // Respuesta
  reviewedBy: int('reviewed_by'), // ID del super-admin
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABELA: sessions (Sesiones de Usuario)
// ============================================================================

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: int('user_id').notNull(),
  clinicId: int('clinic_id'), // null para super-admin
  
  // Token
  token: varchar('token', { length: 500 }).notNull().unique(),
  refreshToken: varchar('refresh_token', { length: 500 }),
  
  // Metadata
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  
  // Expiración
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// TABELA: audit_logs (Logs de Auditoria)
// ============================================================================

export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  
  // Usuario y Clínica
  userId: int('user_id'),
  clinicId: int('clinic_id'),
  
  // Acción
  action: varchar('action', { length: 100 }).notNull(), // login, logout, create_patient, etc.
  entity: varchar('entity', { length: 100 }), // patient, appointment, etc.
  entityId: int('entity_id'),
  
  // Detalles
  details: text('details'), // JSON
  
  // Metadata
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// ÍNDICES Y RELACIONES
// ============================================================================

// Nota: Los índices se crean automáticamente para:
// - Primary keys
// - Unique constraints
// - Foreign keys

// Índices adicionales recomendados:
// - clinics.status
// - users.clinicId
// - users.email
// - users.googleId
// - sessions.userId
// - sessions.token
// - auditLogs.userId
// - auditLogs.clinicId
// - auditLogs.createdAt
