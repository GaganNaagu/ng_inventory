import fs from 'fs';
import path from 'path';
import { pool } from '../src/config/db';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`Running migration: ${file}`);
      try {
        await pool.query(sql);
        console.log(`✅ Completed: ${file}`);
      } catch (err) {
        console.error(`❌ Error running migration ${file}:`, err);
        process.exit(1);
      }
    }
  }
  
  console.log('All migrations executed successfully.');
  process.exit(0);
}

runMigrations();
