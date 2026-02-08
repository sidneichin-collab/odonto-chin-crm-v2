import { mysqlTable, varchar, text, timestamp, int, boolean, json, mysqlEnum } from 'drizzle-orm/mysql-core';

/**
 * INTEGRAÇÃO VERETECH - SCHEMA DE BANCO DE DADOS
 * 
 * Este arquivo contém as tabelas necessárias para integração com o sistema Veretech
 */

// Configurações de integração por clínica
export const veretechIntegrations = mysqlTable('veretech_integrations', {
  id: int('id').primaryKey().autoincrement(),
  clinicId: int('clinic_id').notNull(), // Referência à clínica
  
  // Credenciais de acesso
  veretechUrl: varchar('veretech_url', { length: 500 }),
  veretechUsername: varchar('veretech_username', { length: 255 }),
  veretechPasswordHash: text('veretech_password_hash'), // Senha criptografada
  veretechApiKey: text('veretech_api_key'), // API Key se disponível
  
  // Configurações de sincronização
  syncEnabled: boolean('sync_enabled').default(false),
  syncInterval: int('sync_interval').default(300), // Segundos (5 min padrão)
  lastSyncAt: timestamp('last_sync_at'),
  
  // Configurações de envio
  sendAppointmentsToVeretech: boolean('send_appointments_to_veretech').default(false),
  sendConfirmationsToVeretech: boolean('send_confirmations_to_veretech').default(false),
  
  // Status
  status: mysqlEnum('status', ['active', 'inactive', 'error']).default('inactive'),
  lastError: text('last_error'),
  
  // Metadados
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Logs de sincronização
export const veretechSyncLogs = mysqlTable('veretech_sync_logs', {
  id: int('id').primaryKey().autoincrement(),
  clinicId: int('clinic_id').notNull(),
  
  // Tipo de sincronização
  syncType: mysqlEnum('sync_type', [
    'patients_import',
    'appointments_import',
    'appointment_export',
    'confirmation_export',
    'full_sync',
    'manual_import'
  ]).notNull(),
  
  // Resultado
  status: mysqlEnum('status', ['success', 'partial', 'failed']).notNull(),
  recordsProcessed: int('records_processed').default(0),
  recordsSuccess: int('records_success').default(0),
  recordsFailed: int('records_failed').default(0),
  
  // Detalhes
  details: json('details'), // { errors: [], warnings: [], info: [] }
  errorMessage: text('error_message'),
  
  // Tempo de execução
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  durationMs: int('duration_ms'),
  
  // Metadados
  triggeredBy: varchar('triggered_by', { length: 255 }), // user_id ou 'system'
  createdAt: timestamp('created_at').defaultNow(),
});

// Mapeamento de IDs entre CRM e Veretech
export const veretechIdMappings = mysqlTable('veretech_id_mappings', {
  id: int('id').primaryKey().autoincrement(),
  clinicId: int('clinic_id').notNull(),
  
  // Tipo de entidade
  entityType: mysqlEnum('entity_type', ['patient', 'appointment', 'chair']).notNull(),
  
  // IDs
  crmId: int('crm_id').notNull(), // ID no CRM
  veretechId: varchar('veretech_id', { length: 255 }).notNull(), // ID no Veretech
  
  // Metadados
  syncedAt: timestamp('synced_at').defaultNow(),
  lastVerifiedAt: timestamp('last_verified_at'),
  
  // Status
  isValid: boolean('is_valid').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Fila de sincronização (para sincronização assíncrona)
export const veretechSyncQueue = mysqlTable('veretech_sync_queue', {
  id: int('id').primaryKey().autoincrement(),
  clinicId: int('clinic_id').notNull(),
  
  // Tipo de operação
  operation: mysqlEnum('operation', [
    'import_patient',
    'import_appointment',
    'export_appointment',
    'export_confirmation',
    'update_patient',
    'update_appointment'
  ]).notNull(),
  
  // Dados
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: int('entity_id'), // ID no CRM
  payload: json('payload').notNull(), // Dados a serem sincronizados
  
  // Status
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed']).default('pending'),
  attempts: int('attempts').default(0),
  maxAttempts: int('max_attempts').default(3),
  lastAttemptAt: timestamp('last_attempt_at'),
  errorMessage: text('error_message'),
  
  // Prioridade
  priority: int('priority').default(5), // 1-10 (10 = mais alta)
  
  // Agendamento
  scheduledFor: timestamp('scheduled_for'), // Para operações agendadas
  
  // Metadados
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Estatísticas de integração
export const veretechIntegrationStats = mysqlTable('veretech_integration_stats', {
  id: int('id').primaryKey().autoincrement(),
  clinicId: int('clinic_id').notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  
  // Contadores
  patientsImported: int('patients_imported').default(0),
  appointmentsImported: int('appointments_imported').default(0),
  appointmentsExported: int('appointments_exported').default(0),
  confirmationsExported: int('confirmations_exported').default(0),
  
  // Erros
  syncErrors: int('sync_errors').default(0),
  
  // Tempo
  totalSyncTimeMs: int('total_sync_time_ms').default(0),
  avgSyncTimeMs: int('avg_sync_time_ms').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Dados importados do CSV (temporário)
export const veretechCsvImports = mysqlTable('veretech_csv_imports', {
  id: int('id').primaryKey().autoincrement(),
  clinicId: int('clinic_id').notNull(),
  
  // Arquivo
  filename: varchar('filename', { length: 255 }).notNull(),
  fileSize: int('file_size'), // bytes
  
  // Tipo
  importType: mysqlEnum('import_type', ['patients', 'appointments']).notNull(),
  
  // Resultado
  status: mysqlEnum('status', ['processing', 'completed', 'failed']).default('processing'),
  totalRows: int('total_rows').default(0),
  processedRows: int('processed_rows').default(0),
  successRows: int('success_rows').default(0),
  failedRows: int('failed_rows').default(0),
  
  // Detalhes
  errors: json('errors'), // Array de erros por linha
  warnings: json('warnings'),
  
  // Metadados
  uploadedBy: int('uploaded_by'), // user_id
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});
