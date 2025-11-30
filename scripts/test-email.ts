/**
 * Quick email test script
 * Run with: npx ts-node scripts/test-email.ts
 */

import { sendEmail } from '../lib/email';

async function testBrevoEmail() {
  console.log('🧪 Testing Brevo email integration...\n');

  // Check environment variables
  console.log('Checking configuration:');
  console.log('✓ BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('✓ BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL ? '✅ Set' : '❌ Missing');
  console.log('✓ BREVO_FROM_NAME:', process.env.BREVO_FROM_NAME ? '✅ Set' : '❌ Missing');

  if (!process.env.BREVO_API_KEY || !process.env.BREVO_FROM_EMAIL) {
    console.error('\n❌ Missing required environment variables!');
    console.error('Please add BREVO_API_KEY and BREVO_FROM_EMAIL to .env.local');
    process.exit(1);
  }

  console.log('\n📧 Sending test email...');

  const testEmail = process.env.BREVO_FROM_EMAIL; // Send to yourself for testing

  const result = await sendEmail({
    to: testEmail,
    toName: 'Test User',
    subject: '✅ Brevo Integration Test - Ejidike Foundation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #28a745;">🎉 Success!</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          Your Brevo email integration is working perfectly!
        </p>
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <strong>✅ Email service configured</strong><br>
          <strong>✅ API key working</strong><br>
          <strong>✅ Sender verified</strong><br>
          <strong>✅ Ready to send notifications</strong>
        </div>
        <p style="font-size: 14px; color: #666;">
          This is a test email sent from your Ejidike Foundation platform.
        </p>
      </div>
    `,
    text: 'Success! Your Brevo email integration is working. Email service configured, API key working, sender verified, and ready to send notifications.'
  });

  if (result.success) {
    console.log('\n✅ Email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\n👀 Check your inbox:', testEmail);
    console.log('💡 Also check spam/junk folder if you don\'t see it');
    console.log('\n🎉 Brevo integration is working!');
  } else {
    console.error('\n❌ Failed to send email');
    console.error('Error:', result.error);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check that your API key is correct');
    console.log('2. Verify sender email is verified in Brevo dashboard');
    console.log('3. Check Brevo dashboard for error logs');
    console.log('4. Visit: https://app.brevo.com/');
  }
}

// Run the test
testBrevoEmail().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
