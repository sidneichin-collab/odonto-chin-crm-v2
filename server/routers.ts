import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { canalRecordatoriosRouter } from "./routers-canal-recordatorios";
import { aiRouter } from "./routers-ai";
import { notificationsRouter } from "./routers-notifications";
import { remindersRouter } from "./routers-reminders";
import { reschedulingRouter } from "./routers-rescheduling";

// Default tenant ID for standalone mode (no multi-tenancy)
const DEFAULT_TENANT_ID = 1;

export const appRouter = router({
  // Dashboard endpoints
  dashboard: {
    stats: publicProcedure.query(async () => {
      const stats = await db.getDashboardStats(DEFAULT_TENANT_ID);
      return stats;
    }),
    getActiveContractsStats: publicProcedure.query(async () => {
      const stats = await db.getActiveContractsStats(DEFAULT_TENANT_ID);
      return stats;
    }),
    getStatsByDate: publicProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }: { input: { date: string } }) => {
        const stats = await db.getDashboardStatsByDate(DEFAULT_TENANT_ID, input.date);
        return stats;
      }),
  },

  // Patient endpoints
  patients: {
    list: publicProcedure.query(async () => {
      const patients = await db.getPatientsByTenant(DEFAULT_TENANT_ID);
      return patients;
    }),
    create: publicProcedure
      .input(z.object({
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        whatsappNumber: z.string().optional(),
        email: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(["M", "F", "Otro"]).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }: any) => {
        const patient = await db.createPatient({
          ...input,
          tenantId: DEFAULT_TENANT_ID,
        });
        return patient;
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        whatsappNumber: z.string().optional(),
        email: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(["M", "F", "Otro"]).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }: any) => {
        const { id, ...data } = input;
        const patient = await db.updatePatient(id, data);
        return patient;
      }),
    atRisk: publicProcedure.query(async () => {
      const patients = await db.getAtRiskPatients(DEFAULT_TENANT_ID);
      return patients;
    }),
    withoutAppointments: publicProcedure.query(async () => {
      const patients = await db.getActivePatientsWithoutAppointments(DEFAULT_TENANT_ID);
      return patients;
    }),
  },

  // Appointment endpoints
  appointments: {
    list: publicProcedure.query(async () => {
      const appointments = await db.getAppointmentsByTenant(DEFAULT_TENANT_ID);
      return appointments;
    }),
    today: publicProcedure.query(async () => {
      const appointments = await db.getTodayAppointments(DEFAULT_TENANT_ID);
      return appointments;
    }),
    create: publicProcedure
      .input(z.object({
        patientId: z.number(),
        fecha: z.string(),
        hora: z.string(),
        tipo: z.enum(["Ortodontia", "Clinico General"]),
        estado: z.enum(["Pendiente", "Confirmada", "Completada", "Cancelada"]).optional(),
      }))
      .mutation(async ({ input }: any) => {
        const appointment = await db.createAppointment({
          ...input,
          tenantId: DEFAULT_TENANT_ID,
          estado: input.estado || "Pendiente",
        });
        return appointment;
      }),
  },

  // Waiting list endpoints
  waitingList: {
    list: publicProcedure.query(async () => {
      const list = await db.getWaitingListByTenant(DEFAULT_TENANT_ID);
      return list;
    }),
    add: publicProcedure
      .input(z.object({
        patientId: z.number(),
        prioridad: z.enum(["Alta", "Media", "Baja"]),
        notas: z.string().optional(),
      }))
      .mutation(async ({ input }: any) => {
        const entry = await db.addToWaitingList({
          ...input,
          tenantId: DEFAULT_TENANT_ID,
        });
        return entry;
      }),
  },

  // Canal de Recordatórios - NEW!
  canalRecordatorios: canalRecordatoriosRouter,

  // AI Features - NEW!
  ai: aiRouter,

  // Notifications - NEW!
  notifications: notificationsRouter,

  // Reminders (Recordatórios) - NEW!
  reminders: remindersRouter,

  // Rescheduling (Reagendamentos) - NEW!
  rescheduling: reschedulingRouter,
});

export type AppRouter = typeof appRouter;
