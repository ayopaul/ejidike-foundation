const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'fix_notifications_rls_v2.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If rpc doesn't exist, try direct execution
      const { data, error } = await supabase.from('_migrations').select('*').limit(1);
      if (error) {
        // Try using the Supabase Management API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({ sql_query: sql })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        return { data: await response.json(), error: null };
      }
      throw new Error('Cannot execute SQL directly');
    });

    if (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('Notifications RLS policies have been fixed.');
  } catch (err) {
    console.error('Error:', err.message);
    console.log('\n⚠️  Could not run migration automatically.');
    console.log('Please run the SQL in supabase/migrations/fix_notifications_rls_v2.sql');
    console.log('manually in the Supabase SQL Editor at:');
    console.log(`${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`);
    process.exit(1);
  }
}

runMigration();
