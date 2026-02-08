import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runAutoMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('[AutoMigrate] DATABASE_URL not found');
    return false;
  }

  try {
    console.log('[AutoMigrate] Starting automatic migration...');
    
    // Create connection
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    // Run migrations
    const migrationsFolder = path.join(__dirname, '../drizzle');
    console.log(`[AutoMigrate] Running migrations from: ${migrationsFolder}`);
    
    await migrate(db, { migrationsFolder });
    
    await connection.end();
    
    console.log('[AutoMigrate] ✅ Migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('[AutoMigrate] ❌ Migration failed:', error);
    return false;
  }
}
