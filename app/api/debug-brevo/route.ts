/**
 * Debug endpoint to check Brevo configuration
 * Visit: http://localhost:3000/api/debug-brevo
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const hasApiKey = !!process.env.BREVO_API_KEY;
  const hasFromEmail = !!process.env.BREVO_FROM_EMAIL;
  const hasFromName = !!process.env.BREVO_FROM_NAME;

  const apiKeyPreview = process.env.BREVO_API_KEY
    ? `${process.env.BREVO_API_KEY.substring(0, 15)}...${process.env.BREVO_API_KEY.substring(process.env.BREVO_API_KEY.length - 5)}`
    : 'NOT SET';

  const apiKeyLength = process.env.BREVO_API_KEY?.length || 0;
  const startsWithXkeysib = process.env.BREVO_API_KEY?.startsWith('xkeysib-') || false;

  return NextResponse.json({
    configuration: {
      BREVO_API_KEY: hasApiKey ? '✅ Set' : '❌ Not set',
      BREVO_FROM_EMAIL: hasFromEmail ? `✅ ${process.env.BREVO_FROM_EMAIL}` : '❌ Not set',
      BREVO_FROM_NAME: hasFromName ? `✅ ${process.env.BREVO_FROM_NAME}` : '❌ Not set'
    },
    apiKeyDetails: {
      preview: apiKeyPreview,
      length: apiKeyLength,
      expectedLength: '~100-150 characters',
      startsWithXkeysib: startsWithXkeysib ? '✅ Yes' : '❌ No (should start with xkeysib-)',
      hasSpaces: process.env.BREVO_API_KEY?.includes(' ') ? '⚠️ Yes (remove spaces!)' : '✅ No'
    },
    diagnosis: getDiagnosis(hasApiKey, startsWithXkeysib, apiKeyLength),
    nextSteps: getNextSteps(hasApiKey, startsWithXkeysib, apiKeyLength)
  });
}

function getDiagnosis(hasApiKey: boolean, startsWithXkeysib: boolean, length: number) {
  if (!hasApiKey) {
    return '❌ API key is missing from .env.local';
  }
  if (!startsWithXkeysib) {
    return '❌ API key format is incorrect - should start with "xkeysib-"';
  }
  if (length < 50) {
    return '❌ API key is too short - it might be truncated';
  }
  if (length > 200) {
    return '⚠️ API key is unusually long - check for extra characters';
  }
  return '✅ API key format looks correct';
}

function getNextSteps(hasApiKey: boolean, startsWithXkeysib: boolean, length: number) {
  const steps = [];

  if (!hasApiKey) {
    steps.push('1. Go to Brevo dashboard: https://app.brevo.com/settings/keys/api');
    steps.push('2. Create a new API key');
    steps.push('3. Copy the ENTIRE key (it\'s very long!)');
    steps.push('4. Add to .env.local: BREVO_API_KEY=xkeysib-...');
    steps.push('5. Restart dev server: npm run dev');
    return steps;
  }

  if (!startsWithXkeysib) {
    steps.push('❌ Your API key doesn\'t start with "xkeysib-"');
    steps.push('1. Go to: https://app.brevo.com/settings/keys/api');
    steps.push('2. Click "Create a new API key"');
    steps.push('3. Copy the FULL key (starts with xkeysib-)');
    steps.push('4. Replace in .env.local');
    steps.push('5. Restart server');
    return steps;
  }

  if (length < 50) {
    steps.push('⚠️ API key might be truncated');
    steps.push('1. Check .env.local - make sure you copied the ENTIRE key');
    steps.push('2. Brevo API keys are typically 100+ characters long');
    steps.push('3. Don\'t add quotes around the key in .env.local');
    return steps;
  }

  steps.push('✅ Configuration looks good!');
  steps.push('If you\'re still getting 401 errors:');
  steps.push('1. Regenerate API key in Brevo dashboard');
  steps.push('2. Make sure API key has "Full Access" permissions');
  steps.push('3. Restart dev server after updating .env.local');

  return steps;
}
