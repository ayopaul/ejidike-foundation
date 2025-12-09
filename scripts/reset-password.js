/**
 * Script to reset user password using Supabase Admin API
 * Usage: node scripts/reset-password.js <email> <new-password>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword(email, newPassword) {
  try {
    console.log(`\n🔄 Resetting password for: ${email}`);

    // Update user password
    const { data, error } = await supabase.auth.admin.updateUserById(
      // First get the user ID
      (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id || '',
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Password reset successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password has been updated (not logged for security)');
    console.log('\nYou can now sign in with the new password.\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Get command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('\n📝 Usage: node scripts/reset-password.js <email> <new-password>');
  console.log('\nExample:');
  console.log('  node scripts/reset-password.js mentor@test.com newPassword123\n');
  process.exit(1);
}

// Run the script
resetPassword(email, newPassword);
