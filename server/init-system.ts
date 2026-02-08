import { getDb } from './db';
import { tenants } from '../drizzle/schema';

/**
 * Inicializa o sistema criando o tenant padrão se não existir
 */
export async function initializeSystem() {
  const db = await getDb();
  if (!db) {
    console.error('[Init] Database not available');
    return false;
  }

  try {
    // Verificar se já existe tenant
    const existingTenants = await db.select().from(tenants).limit(1);
    
    if (existingTenants.length === 0) {
      console.log('[Init] Creating default tenant...');
      
      await db.insert(tenants).values({
        name: 'ORTOBOM ODONTOLOGÍA',
        email: 'admin@odontochin.com',
        phone: '+595 971234567',
        city: 'Asunción',
        country: 'Paraguay',
        whatsappNumber: '+595 971234567',
        timezone: 'America/Asuncion',
        language: 'es',
        isActive: true,
      });
      
      console.log('[Init] ✅ Default tenant created successfully!');
      return true;
    } else {
      console.log('[Init] Tenant already exists, skipping initialization');
      return true;
    }
  } catch (error) {
    console.error('[Init] Failed to initialize system:', error);
    return false;
  }
}
