/**
 * Funções de Banco de Dados para Sistema Multi-Tenant
 */

import { db } from './db';
import { clinics, users, clinicRequests, sessions, auditLogs } from './db-multi-tenant-schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// ============================================================================
// CLINICS (Clínicas)
// ============================================================================

export async function createClinic(data: {
  name: string;
  slug: string;
  country: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  corporateWhatsapp?: string;
  email: string;
  timezone?: string;
  language?: string;
  maxUsers?: number;
  maxPatients?: number;
  plan?: string;
}) {
  const [clinic] = await db.insert(clinics).values({
    ...data,
    status: 'pending',
  });
  
  return clinic;
}

export async function getClinicById(id: number) {
  const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
  return clinic;
}

export async function getClinicBySlug(slug: string) {
  const [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug));
  return clinic;
}

export async function getAllClinics() {
  return await db.select().from(clinics).orderBy(desc(clinics.createdAt));
}

export async function getClinicsByStatus(status: 'pending' | 'active' | 'suspended' | 'cancelled') {
  return await db.select().from(clinics).where(eq(clinics.status, status));
}

export async function updateClinic(id: number, data: Partial<typeof clinics.$inferInsert>) {
  await db.update(clinics).set(data).where(eq(clinics.id, id));
  return await getClinicById(id);
}

export async function approveClinic(id: number, approvedBy: number) {
  await db.update(clinics).set({
    status: 'active',
    approvedAt: new Date(),
    approvedBy,
  }).where(eq(clinics.id, id));
  
  return await getClinicById(id);
}

export async function suspendClinic(id: number) {
  await db.update(clinics).set({ status: 'suspended' }).where(eq(clinics.id, id));
}

export async function deleteClinic(id: number) {
  await db.delete(clinics).where(eq(clinics.id, id));
}

// ============================================================================
// USERS (Usuarios)
// ============================================================================

export async function createUser(data: {
  clinicId?: number;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  googleEmail?: string;
  googleAvatar?: string;
  role?: 'super_admin' | 'admin' | 'secretary' | 'dentist';
}) {
  const passwordHash = data.password 
    ? await bcrypt.hash(data.password, 10)
    : undefined;
  
  const [user] = await db.insert(users).values({
    clinicId: data.clinicId,
    name: data.name,
    email: data.email,
    passwordHash,
    googleId: data.googleId,
    googleEmail: data.googleEmail,
    googleAvatar: data.googleAvatar,
    role: data.role || 'secretary',
    status: 'pending',
  });
  
  return user;
}

export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserByGoogleId(googleId: string) {
  const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
  return user;
}

export async function getUsersByClinic(clinicId: number) {
  return await db.select().from(users).where(eq(users.clinicId, clinicId));
}

export async function updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
  await db.update(users).set(data).where(eq(users.id, id));
  return await getUserById(id);
}

export async function verifyPassword(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? user : null;
}

export async function updateLastLogin(userId: number) {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}

export async function activateUser(userId: number) {
  await db.update(users).set({ 
    status: 'active',
    emailVerified: true 
  }).where(eq(users.id, userId));
}

// ============================================================================
// CLINIC REQUESTS (Solicitudes de Acceso)
// ============================================================================

export async function createClinicRequest(data: {
  clinicName: string;
  country: string;
  city?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  contactName: string;
  contactRole?: string;
  message?: string;
}) {
  const [request] = await db.insert(clinicRequests).values(data);
  return request;
}

export async function getClinicRequestById(id: number) {
  const [request] = await db.select().from(clinicRequests).where(eq(clinicRequests.id, id));
  return request;
}

export async function getPendingClinicRequests() {
  return await db.select()
    .from(clinicRequests)
    .where(eq(clinicRequests.status, 'pending'))
    .orderBy(desc(clinicRequests.createdAt));
}

export async function getAllClinicRequests() {
  return await db.select()
    .from(clinicRequests)
    .orderBy(desc(clinicRequests.createdAt));
}

export async function approveClinicRequest(id: number, reviewedBy: number, reviewNotes?: string) {
  await db.update(clinicRequests).set({
    status: 'approved',
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes,
  }).where(eq(clinicRequests.id, id));
  
  return await getClinicRequestById(id);
}

export async function rejectClinicRequest(id: number, reviewedBy: number, reviewNotes?: string) {
  await db.update(clinicRequests).set({
    status: 'rejected',
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes,
  }).where(eq(clinicRequests.id, id));
  
  return await getClinicRequestById(id);
}

// ============================================================================
// SESSIONS (Sesiones)
// ============================================================================

export async function createSession(data: {
  userId: number;
  clinicId?: number;
  ipAddress?: string;
  userAgent?: string;
  expiresIn?: number; // segundos, default 7 dias
}) {
  const sessionId = randomBytes(32).toString('hex');
  const token = randomBytes(64).toString('hex');
  const refreshToken = randomBytes(64).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (data.expiresIn || 7 * 24 * 60 * 60));
  
  await db.insert(sessions).values({
    id: sessionId,
    userId: data.userId,
    clinicId: data.clinicId,
    token,
    refreshToken,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    expiresAt,
  });
  
  return { sessionId, token, refreshToken, expiresAt };
}

export async function getSessionByToken(token: string) {
  const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
  return session;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteUserSessions(userId: number) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function cleanExpiredSessions() {
  await db.delete(sessions).where(sql`${sessions.expiresAt} < NOW()`);
}

// ============================================================================
// AUDIT LOGS (Logs de Auditoria)
// ============================================================================

export async function createAuditLog(data: {
  userId?: number;
  clinicId?: number;
  action: string;
  entity?: string;
  entityId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  await db.insert(auditLogs).values({
    ...data,
    details: data.details ? JSON.stringify(data.details) : undefined,
  });
}

export async function getAuditLogsByClinic(clinicId: number, limit = 100) {
  return await db.select()
    .from(auditLogs)
    .where(eq(auditLogs.clinicId, clinicId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getAuditLogsByUser(userId: number, limit = 100) {
  return await db.select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// ============================================================================
// STATISTICS (Estadísticas)
// ============================================================================

export async function getSystemStatistics() {
  const [totalClinics] = await db.select({ count: sql<number>`count(*)` }).from(clinics);
  const [activeClinics] = await db.select({ count: sql<number>`count(*)` })
    .from(clinics)
    .where(eq(clinics.status, 'active'));
  const [pendingRequests] = await db.select({ count: sql<number>`count(*)` })
    .from(clinicRequests)
    .where(eq(clinicRequests.status, 'pending'));
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  
  return {
    totalClinics: totalClinics.count,
    activeClinics: activeClinics.count,
    pendingRequests: pendingRequests.count,
    totalUsers: totalUsers.count,
  };
}

export async function getClinicStatistics(clinicId: number) {
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.clinicId, clinicId));
  
  // Aqui você pode adicionar mais estatísticas específicas da clínica
  // como total de pacientes, agendamentos, etc.
  
  return {
    totalUsers: totalUsers.count,
  };
}
