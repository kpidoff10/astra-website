/**
 * Integration test for email sending pipeline
 * Run with: node --loader ts-node/esm lib/emails/test-integration.ts
 * Or compile and run as JS
 */

import { Resend } from 'resend';

export async function testEmailPipeline() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set');
    return false;
  }

  console.log('🔍 Testing Email Pipeline...\n');

  // Test 1: Direct Resend SDK
  console.log('Test 1: Resend SDK');
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: 'delivered@resend.dev', // Resend's test email
      subject: '[TEST] Email Pipeline',
      html: '<h1>Pipeline Test</h1>',
    });

    if (error) {
      console.error('❌ SDK error:', error.message);
      return false;
    }
    console.log('✅ SDK works! Email ID:', data?.id);
  } catch (err) {
    console.error('❌ SDK exception:', err);
    return false;
  }

  // Test 2: Raw fetch (what Server Action uses)
  console.log('\nTest 2: Raw fetch to Resend API');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Astra <astra@astra-ia.dev>',
        to: 'delivered@resend.dev',
        subject: '[TEST] Raw Fetch',
        html: '<h1>Fetch Test</h1>',
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP error: ${response.status}`);
      const text = await response.text();
      console.error('Response:', text);
      return false;
    }

    const data = await response.json();
    if (data?.id) {
      console.log('✅ Fetch works! Email ID:', data.id);
    } else {
      console.error('❌ No ID in response:', data);
      return false;
    }
  } catch (err) {
    console.error('❌ Fetch exception:', err);
    return false;
  }

  console.log('\n✅ All tests passed!');
  return true;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailPipeline().then(success => {
    process.exit(success ? 0 : 1);
  });
}
