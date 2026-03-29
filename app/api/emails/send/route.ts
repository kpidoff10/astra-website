import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateWelcomeEmail } from '@/lib/emails/templates';

// Allow longer execution time for email sending
export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sending endpoint with 60s timeout
 * Uses Resend SDK with reusable email templates
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, type = 'welcome' } = await request.json();

    if (!email) {
      console.log('[EmailAPI] Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('[EmailAPI] Sending', type, 'email to:', email);

    // Generate email HTML based on type
    let html: string;
    let subject: string;

    if (type === 'welcome') {
      html = generateWelcomeEmail(email, name);
      subject = 'Bienvenue sur Astra ✨';
    } else {
      return NextResponse.json(
        { error: 'Unknown email type' },
        { status: 400 }
      );
    }

    // Send with Resend SDK
    const { data, error } = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: email,
      subject: subject,
      html: html,
    });

    console.log('[EmailAPI] Response - error:', error?.message, 'id:', data?.id);

    if (error) {
      console.error('[EmailAPI] Resend error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    if (data?.id) {
      console.log('[EmailAPI] ✅ SUCCESS! Email ID:', data.id);
      return NextResponse.json({ success: true, emailId: data.id });
    }

    console.log('[EmailAPI] ❌ No ID in response');
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[EmailAPI] ❌ Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
