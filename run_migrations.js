const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://qlvhqgtjqfdfpjordits.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdmhxZ3RqcWZkZnBqb3JkaXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcwODgwMSwiZXhwIjoyMDc4Mjg0ODAxfQ.kPx_Lf6L3hfewC5ZthVltK4ERlnNTkjgotfjnVRzs64';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const migrations = [
    '001_initial_schema.sql',
    '002_suppliers_and_purchase_orders.sql',
    '003_marketplace_and_production.sql',
    '004_navigation_and_billing.sql',
    '005_rls_helper_functions.sql',
    '006_rls_policies.sql'
  ];

  console.log('🚀 Starting database migrations...\n');

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📝 Running: ${migration}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
      
      if (error) {
        console.error(`❌ Error in ${migration}:`, error.message);
      } else {
        console.log(`✅ ${migration} completed successfully`);
      }
    } catch (err) {
      console.error(`❌ Failed to execute ${migration}:`, err.message);
    }
    
    console.log('');
  }
  
  console.log('🎉 All migrations completed!');
}

runMigrations();
