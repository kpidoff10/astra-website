import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { generateWelcomeEmail } from '@/lib/emails/templates';

export const maxDuration = 60;

console.log('[SendEmail] ROUTE LOADED - maxDuration=60');

export async function POST(request: NextRequest) {
  console.log('[SendEmail] 🔵 POST request received');
  
  try {
    console.log('[SendEmail] ⏳ Parsing JSON body...');
    const { email, name } = await request.json();
    console.log('[SendEmail] ✅ Body parsed. Email:', email);

    if (!email) {
      console.log('[SendEmail] ❌ NO EMAIL PROVIDED');
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('[SendEmail] ⏳ Creating Resend instance...');
    const apiKey = process.env.RESEND_API_KEY;
    console.log('[SendEmail] API key present:', !!apiKey);
    
    const resend = new Resend(apiKey);
    console.log('[SendEmail] ✅ Resend instance created');

    console.log('[SendEmail] ⏳ Generating email HTML...');
    const html = generateWelcomeEmail(email, name);
    console.log('[SendEmail] ✅ HTML generated, length:', html.length);

    console.log('[SendEmail] ⏳ Sending via Resend.emails.send()...');
    const { data, error } = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      html: html,
    });

    console.log('[SendEmail] 📨 Resend response received');
    console.log('[SendEmail] Error:', error?.message || 'none');
    console.log('[SendEmail] Data ID:', data?.id || 'none');

    if (error) {
      console.error('[SendEmail] ❌ RESEND ERROR:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data?.id) {
      console.error('[SendEmail] ❌ NO EMAIL ID RETURNED');
      return NextResponse.json(
        { error: 'No email ID returned' },
        { status: 500 }
      );
    }

    console.log('[SendEmail] ✅✅✅ EMAIL SENT SUCCESSFULLY! ID:', data.id);
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('[SendEmail] ❌❌❌ EXCEPTION CAUGHT:', error);
    console.error('[SendEmail] Error type:', typeof error);
    console.error('[SendEmail] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[SendEmail] Full error:', JSON.stringify(error));
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
