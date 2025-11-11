const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = 'https://qlvhqgtjqfdfpjordits.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdmhxZ3RqcWZkZnBqb3JkaXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcwODgwMSwiZXhwIjoyMDc4Mjg0ODAxfQ.kPx_Lf6L3hfewC5ZthVltK4ERlnNTkjgotfjnVRzs64';

// Execute SQL using Supabase REST API
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${supabaseUrl}/rest/v1/rpc/exec_sql`);
    
    const postData = JSON.stringify({ sql_string: sql });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: JSON.parse(data || '{}'), error: null });
        } else {
          try {
            const errorData = JSON.parse(data);
            resolve({ data: null, error: errorData });
          } catch {
            resolve({ data: null, error: { message: data || `HTTP ${res.statusCode}` } });
          }
        }
      });
    });

    req.on('error', (error) => {
      resolve({ data: null, error: { message: error.message } });
    });

    req.write(postData);
    req.end();
  });
}

async function runSeed() {
  const seedFilePath = path.join(__dirname, '..', 'data_insertion', 'seed_complete.sql');
  const sql = fs.readFileSync(seedFilePath, 'utf8');
  
  console.log('🌱 Starting seed data load...\n');
  console.log('📝 Reading seed file...');
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('DO $$'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        const { data, error } = await executeSQL(statement + ';');
        
        if (error) {
          // Some errors are expected (like duplicate keys if data already exists)
          if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}: Data already exists (skipping)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            errorCount++;
          }
        } else {
          successCount++;
          if ((i + 1) % 10 === 0) {
            console.log(`✅ Processed ${i + 1}/${statements.length} statements...`);
          }
        }
      } catch (err) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully executed: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`⚠️  Errors encountered: ${errorCount} statements`);
    }
    console.log('='.repeat(50));
    console.log('\n🎉 Seed data load completed!');
    console.log('\n💡 Tip: Check your Supabase dashboard to verify the data was loaded correctly.');
    
  } catch (err) {
    console.error('❌ Failed to load seed data:', err.message);
    process.exit(1);
  }
}

// Alternative: Execute entire SQL file at once (if exec_sql supports it)
async function runSeedAlternative() {
  const seedFilePath = path.join(__dirname, '..', 'data_insertion', 'seed_complete.sql');
  const sql = fs.readFileSync(seedFilePath, 'utf8');
  
  console.log('🌱 Starting seed data load (alternative method)...\n');
  
  try {
    const { data, error } = await executeSQL(sql);
    
    if (error) {
      console.error('❌ Error loading seed data:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Seed data loaded successfully!');
    }
  } catch (err) {
    console.error('❌ Failed to load seed data:', err.message);
    console.log('\n💡 Alternative: Copy and paste the seed_complete.sql file into Supabase SQL Editor');
    process.exit(1);
  }
}

// Try alternative method first (faster), fall back to statement-by-statement
runSeedAlternative().catch(() => {
  console.log('\n⚠️  Alternative method failed, trying statement-by-statement...\n');
  runSeed();
});

