const { getDb, DB_PATH } = require('./db/database');

console.log('====================================================');
console.log('📦 COGNITO DATABASE INSPECTOR');
console.log(`📁 File Location: ${DB_PATH}`);
console.log('====================================================\n');

try {
  const db = getDb();
  
  // List all tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name ASC
  `).all();

  console.log(`Found ${tables.length} tables in database:\n`);

  for (const table of tables) {
    const tableName = table.name;
    const count = db.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`).get().count;
    const columns = db.prepare(`PRAGMA table_info("${tableName}")`).all();
    
    console.log(`┌─ Table: ${tableName.toUpperCase()} (${count} rows)`);
    console.log(`│  Columns: ${columns.map(c => `${c.name} (${c.type})`).join(', ')}`);
    
    // Show up to 2 preview rows
    const sample = db.prepare(`SELECT * FROM "${tableName}" LIMIT 2`).all();
    if (sample.length > 0) {
      console.log(`│  Sample row:`, JSON.stringify(sample[0]));
    }
    console.log(`└───────────────────────────────────────────────────\n`);
  }

  db.close();
} catch (err) {
  console.error('Inspection error:', err);
}
