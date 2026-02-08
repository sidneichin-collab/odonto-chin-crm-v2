/**
 * Servicio de Autenticación
 * Soporta Google OAuth y Email/Password
 */

import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import {
  createUser,
  getUserByEmail,
  getUserByGoogleId,
  verifyPassword,
  updateLastLogin,
  createSession,
  getSessionByToken,
  deleteSession,
  createAuditLog,
  getClinicById,
} from '../db-multi-tenant';

const JWT_SECRET = process.env.JWT_SECRET || 'odonto-chin-secret-key-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ============================================================================
// TYPES
// ============================================================================

export interface AuthResult {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    clinicId?: number;
    clinicName?: string;
  };
  token?: string;
  refreshToken?: string;
  error?: string;
}

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

export async function loginWithEmail(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  try {
    // Verificar credenciales
    const user = await verifyPassword(email, password);
    
    if (!user) {
      return {
        success: false,
        error: 'Email o contraseña incorrectos',
      };
    }
    
    // Verificar estado del usuario
    if (user.status !== 'active') {
      return {
        success: false,
        error: 'Usuario no activo. Contacte al administrador.',
      };
    }
    
    // Verificar estado de la clínica (si no es super-admin)
    if (user.clinicId) {
      const clinic = await getClinicById(user.clinicId);
      
      if (!clinic || clinic.status !== 'active') {
        return {
          success: false,
          error: 'Clínica no activa. Contacte al administrador.',
        };
      }
    }
    
    // Actualizar último login
    await updateLastLogin(user.id);
    
    // Crear sesión
    const session = await createSession({
      userId: user.id,
      clinicId: user.clinicId || undefined,
      ipAddress,
      userAgent,
    });
    
    // Log de auditoría
    await createAuditLog({
      userId: user.id,
      clinicId: user.clinicId || undefined,
      action: 'login',
      entity: 'user',
      entityId: user.id,
      details: { method: 'email' },
      ipAddress,
      userAgent,
    });
    
    // Obtener nombre de clínica
    let clinicName: string | undefined;
    if (user.clinicId) {
      const clinic = await getClinicById(user.clinicId);
      clinicName = clinic?.name;
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId || undefined,
        clinicName,
      },
      token: session.token,
      refreshToken: session.refreshToken,
    };
  } catch (error) {
    console.error('Error en loginWithEmail:', error);
    return {
      success: false,
      error: 'Error al iniciar sesión',
    };
  }
}

// ============================================================================
// GOOGLE OAUTH AUTHENTICATION
// ============================================================================

export async function loginWithGoogle(
  googleToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  try {
    // Verificar token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      return {
        success: false,
        error: 'Token de Google inválido',
      };
    }
    
    const googleId = payload.sub;
    const googleEmail = payload.email;
    const googleName = payload.name;
    const googleAvatar = payload.picture;
    
    // Buscar usuario por Google ID
    let user = await getUserByGoogleId(googleId);
    
    // Si no existe, buscar por email
    if (!user && googleEmail) {
      user = await getUserByEmail(googleEmail);
      
      // Si existe por email pero no tiene Google ID, vincularlo
      if (user) {
        // TODO: Actualizar usuario con Google ID
      }
    }
    
    // Si no existe, crear nuevo usuario (pendiente de aprobación)
    if (!user) {
      const newUser = await createUser({
        name: googleName || 'Usuario',
        email: googleEmail || '',
        googleId,
        googleEmail,
        googleAvatar,
        role: 'secretary',
      });
      
      return {
        success: false,
        error: 'Usuario creado. Pendiente de aprobación por el administrador.',
      };
    }
    
    // Verificar estado del usuario
    if (user.status !== 'active') {
      return {
        success: false,
        error: 'Usuario no activo. Contacte al administrador.',
      };
    }
    
    // Verificar estado de la clínica (si no es super-admin)
    if (user.clinicId) {
      const clinic = await getClinicById(user.clinicId);
      
      if (!clinic || clinic.status !== 'active') {
        return {
          success: false,
          error: 'Clínica no activa. Contacte al administrador.',
        };
      }
    }
    
    // Actualizar último login
    await updateLastLogin(user.id);
    
    // Crear sesión
    const session = await createSession({
      userId: user.id,
      clinicId: user.clinicId || undefined,
      ipAddress,
      userAgent,
    });
    
    // Log de auditoría
    await createAuditLog({
      userId: user.id,
      clinicId: user.clinicId || undefined,
      action: 'login',
      entity: 'user',
      entityId: user.id,
      details: { method: 'google' },
      ipAddress,
      userAgent,
    });
    
    // Obtener nombre de clínica
    let clinicName: string | undefined;
    if (user.clinicId) {
      const clinic = await getClinicById(user.clinicId);
      clinicName = clinic?.name;
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId || undefined,
        clinicName,
      },
      token: session.token,
      refreshToken: session.refreshToken,
    };
  } catch (error) {
    console.error('Error en loginWithGoogle:', error);
    return {
      success: false,
      error: 'Error al iniciar sesión con Google',
    };
  }
}

// ============================================================================
// LOGOUT
// ============================================================================

export async function logout(
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean }> {
  try {
    const session = await getSessionByToken(token);
    
    if (session) {
      // Log de auditoría
      await createAuditLog({
        userId: session.userId,
        clinicId: session.clinicId || undefined,
        action: 'logout',
        entity: 'user',
        entityId: session.userId,
        ipAddress,
        userAgent,
      });
      
      // Eliminar sesión
      await deleteSession(session.id);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error en logout:', error);
    return { success: false };
  }
}

// ============================================================================
// VERIFY TOKEN
// ============================================================================

export async function verifyToken(token: string): Promise<{
  valid: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    clinicId?: number;
    clinicName?: string;
  };
}> {
  try {
    const session = await getSessionByToken(token);
    
    if (!session) {
      return { valid: false };
    }
    
    // Verificar expiración
    if (new Date() > session.expiresAt) {
      await deleteSession(session.id);
      return { valid: false };
    }
    
    // Obtener usuario
    const user = await getUserById(session.userId);
    
    if (!user || user.status !== 'active') {
      return { valid: false };
    }
    
    // Obtener nombre de clínica
    let clinicName: string | undefined;
    if (user.clinicId) {
      const clinic = await getClinicById(user.clinicId);
      clinicName = clinic?.name;
    }
    
    return {
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId || undefined,
        clinicName,
      },
    };
  } catch (error) {
    console.error('Error en verifyToken:', error);
    return { valid: false };
  }
}

// ============================================================================
// REGISTER (Email/Password)
// ============================================================================

export async function registerWithEmail(data: {
  name: string;
  email: string;
  password: string;
  clinicId?: number;
  role?: 'secretary' | 'dentist';
}): Promise<AuthResult> {
  try {
    // Verificar si el email ya existe
    const existingUser = await getUserByEmail(data.email);
    
    if (existingUser) {
      return {
        success: false,
        error: 'El email ya está registrado',
      };
    }
    
    // Crear usuario (pendiente de aprobación)
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      clinicId: data.clinicId,
      role: data.role || 'secretary',
    });
    
    return {
      success: true,
      user: {
        id: user.insertId,
        name: data.name,
        email: data.email,
        role: data.role || 'secretary',
        clinicId: data.clinicId,
      },
    };
  } catch (error) {
    console.error('Error en registerWithEmail:', error);
    return {
      success: false,
      error: 'Error al registrar usuario',
    };
  }
}

// Helper function (needs to be imported)
async function getUserById(id: number) {
  // This should be imported from db-multi-tenant
  const { getUserById: getUser } = await import('../db-multi-tenant');
  return getUser(id);
}
