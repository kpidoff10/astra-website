import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/lib/emails/welcome';

// Allow longer execution time for email sending
export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sending endpoint with 60s timeout
 * Uses Resend SDK directly with React component
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      console.log('[EmailAPI] Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('[EmailAPI] Step 1: Creating request for:', email);

    // Use Resend SDK with React component directly (no manual render)
    const { data, error } = await resend.emails.send({
      from: 'astra@astra-ia.dev',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      react: WelcomeEmail({ email, name }),
    });

    console.log('[EmailAPI] Step 2: Resend response - error:', error, 'id:', data?.id);

    if (error) {
      console.error('[EmailAPI] Resend error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    if (data?.id) {
      console.log('[EmailAPI] SUCCESS! Email ID:', data.id);
      return NextResponse.json({ success: true, emailId: data.id });
    }

    console.log('[EmailAPI] No ID in response');
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[EmailAPI] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
