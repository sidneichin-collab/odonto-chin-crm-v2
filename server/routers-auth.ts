/**
 * Routers tRPC para Autenticación
 */

import { router, publicProcedure } from './trpc';
import { z } from 'zod';
import {
  loginWithEmail,
  loginWithGoogle,
  logout,
  verifyToken,
  registerWithEmail,
} from './services/auth-service';
import {
  createClinicRequest,
  getPendingClinicRequests,
  approveClinicRequest,
  rejectClinicRequest,
  getSystemStatistics,
} from './db-multi-tenant';

// ============================================================================
// AUTH ROUTER
// ============================================================================

export const authRouter = router({
  // ========================================
  // Login con Email/Password
  // ========================================
  loginWithEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await loginWithEmail(
        input.email,
        input.password,
        input.ipAddress,
        input.userAgent
      );
    }),

  // ========================================
  // Login con Google OAuth
  // ========================================
  loginWithGoogle: publicProcedure
    .input(z.object({
      googleToken: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await loginWithGoogle(
        input.googleToken,
        input.ipAddress,
        input.userAgent
      );
    }),

  // ========================================
  // Logout
  // ========================================
  logout: publicProcedure
    .input(z.object({
      token: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await logout(input.token, input.ipAddress, input.userAgent);
    }),

  // ========================================
  // Verificar Token
  // ========================================
  verifyToken: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      return await verifyToken(input.token);
    }),

  // ========================================
  // Registrar con Email/Password
  // ========================================
  registerWithEmail: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      clinicId: z.number().optional(),
      role: z.enum(['secretary', 'dentist']).optional(),
    }))
    .mutation(async ({ input }) => {
      return await registerWithEmail(input);
    }),

  // ========================================
  // Solicitar Acceso (Nueva Clínica)
  // ========================================
  requestClinicAccess: publicProcedure
    .input(z.object({
      clinicName: z.string().min(2),
      country: z.string().min(2),
      city: z.string().optional(),
      email: z.string().email(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      contactName: z.string().min(2),
      contactRole: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await createClinicRequest(input);
        return {
          success: true,
          message: 'Solicitud enviada. Recibirá una respuesta en 24-48 horas.',
        };
      } catch (error) {
        console.error('Error en requestClinicAccess:', error);
        return {
          success: false,
          error: 'Error al enviar solicitud',
        };
      }
    }),

  // ========================================
  // Obtener Solicitudes Pendientes (Super-Admin)
  // ========================================
  getPendingRequests: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar que es super-admin
      const auth = await verifyToken(input.token);
      
      if (!auth.valid || auth.user?.role !== 'super_admin') {
        throw new Error('No autorizado');
      }
      
      return await getPendingClinicRequests();
    }),

  // ========================================
  // Aprobar Solicitud (Super-Admin)
  // ========================================
  approveRequest: publicProcedure
    .input(z.object({
      token: z.string(),
      requestId: z.number(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Verificar que es super-admin
      const auth = await verifyToken(input.token);
      
      if (!auth.valid || auth.user?.role !== 'super_admin') {
        throw new Error('No autorizado');
      }
      
      await approveClinicRequest(
        input.requestId,
        auth.user.id,
        input.reviewNotes
      );
      
      return { success: true };
    }),

  // ========================================
  // Rechazar Solicitud (Super-Admin)
  // ========================================
  rejectRequest: publicProcedure
    .input(z.object({
      token: z.string(),
      requestId: z.number(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Verificar que es super-admin
      const auth = await verifyToken(input.token);
      
      if (!auth.valid || auth.user?.role !== 'super_admin') {
        throw new Error('No autorizado');
      }
      
      await rejectClinicRequest(
        input.requestId,
        auth.user.id,
        input.reviewNotes
      );
      
      return { success: true };
    }),

  // ========================================
  // Obtener Estadísticas del Sistema (Super-Admin)
  // ========================================
  getSystemStats: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      // Verificar que es super-admin
      const auth = await verifyToken(input.token);
      
      if (!auth.valid || auth.user?.role !== 'super_admin') {
        throw new Error('No autorizado');
      }
      
      return await getSystemStatistics();
    }),
});
