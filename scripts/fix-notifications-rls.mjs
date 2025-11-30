import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Fixing notifications RLS policies...\n');

const policies = [
  {
    name: 'Drop old SELECT policy',
    sql: 'DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;'
  },
  {
    name: 'Drop old UPDATE policy',
    sql: 'DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;'
  },
  {
    name: 'Drop old INSERT policy',
    sql: 'DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;'
  },
  {
    name: 'Drop old DELETE policy',
    sql: 'DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;'
  },
  {
    name: 'Create new SELECT policy',
    sql: `CREATE POLICY "Users can view own notifications"
      ON public.notifications
      FOR SELECT
      USING (
        user_id IN (
          SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
      );`
  },
  {
    name: 'Create new UPDATE policy',
    sql: `CREATE POLICY "Users can update own notifications"
      ON public.notifications
      FOR UPDATE
      USING (
        user_id IN (
          SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
      );`
  },
  {
    name: 'Create new INSERT policy',
    sql: `CREATE POLICY "Authenticated users can insert notifications"
      ON public.notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (true);`
  },
  {
    name: 'Create new DELETE policy',
    sql: `CREATE POLICY "Users can delete own notifications"
      ON public.notifications
      FOR DELETE
      USING (
        user_id IN (
          SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
      );`
  }
];

async function executeSql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  return { data, error };
}

async function runMigration() {
  for (const policy of policies) {
    try {
      console.log(`⏳ ${policy.name}...`);
      const { error } = await executeSql(policy.sql);

      if (error) {
        console.error(`❌ Failed: ${error.message}`);
      } else {
        console.log(`✅ ${policy.name} - Success`);
      }
    } catch (err) {
      console.error(`❌ ${policy.name} - Error:`, err.message);
    }
  }

  console.log('\n✨ Migration complete!');
  console.log('You can now test the notifications functionality.');
}

runMigration();
