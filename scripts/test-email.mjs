#!/usr/bin/env node
/**
 * Test script for Resend email sending
 * Usage: node scripts/test-email.mjs <email>
 */

const email = process.argv[2] || 'test@example.com';
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error('❌ RESEND_API_KEY not set');
  process.exit(1);
}

const payload = {
  from: 'Astra <astra@astra-ia.dev>',
  to: email,
  subject: 'Test Email from Astra',
  html: '<h1>Hello from Astra!</h1><p>This is a test email.</p>',
};

console.log('📧 Testing Resend API...');
console.log('Email:', email);
console.log('API Key:', apiKey.slice(0, 10) + '...');

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then(async (res) => {
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data?.id) {
      console.log('✅ SUCCESS! Email ID:', data.id);
    } else {
      console.error('❌ FAILED');
    }
  })
  .catch((err) => {
    console.error('❌ Exception:', err.message);
  });
