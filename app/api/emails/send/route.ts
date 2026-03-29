import { NextRequest, NextResponse } from 'next/server';

// Allow longer execution time for email sending
export const maxDuration = 60;

/**
 * Email sending endpoint with 60s timeout
 * Can be called from Server Actions or background jobs
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('[API] Sending email to:', email);

    // Render and send email
    const { sendWelcomeEmail } = await import('@/lib/services/email');
    const emailId = await sendWelcomeEmail(email, name);

    if (emailId) {
      console.log('[API] Email sent! ID:', emailId);
      return NextResponse.json({ success: true, emailId });
    }

    console.log('[API] Email send returned null');
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
