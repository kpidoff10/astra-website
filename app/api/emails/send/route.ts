import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateWelcomeEmail } from '@/lib/emails/templates';
import { logger } from '@/lib/utils/logger';

// Allow longer execution time for email sending
// Vercel Pro: up to 60s, Free: 10s (this won't break on Free, just takes longer)
export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory retry mechanism
const retryMap = new Map<string, number>();
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Email sending endpoint with 60s timeout + retry logic
 * Uses Resend SDK with reusable email templates
 */
export async function POST(request: NextRequest) {
  let email: string = '';
  let retryCount = 0;

  try {
    const body = await request.json();
    email = body?.email;
    const { name, type = 'welcome' } = body;
    retryCount = retryMap.get(email) || 0;

    if (!email) {
      console.log('[EmailAPI] Missing email');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`[EmailAPI] Sending ${type} email to: ${email} (retry: ${retryCount})`);

    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[EmailAPI] RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

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

    // Send with Resend SDK (with timeout protection)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const { data, error } = await Promise.race([
      resend.emails.send({
        from: 'Astra <astra@astra-ia.dev>',
        to: email,
        subject: subject,
        html: html,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Resend API timeout')), 32000)
      ),
    ]) as any;

    clearTimeout(timeoutId);

    console.log(`[EmailAPI] Response - error: ${error?.message || 'none'}, id: ${data?.id || 'none'}`);

    if (error) {
      // Retry logic for transient errors
      if (
        retryCount < MAX_RETRIES &&
        (error.message.includes('timeout') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ECONNRESET'))
      ) {
        console.log(`[EmailAPI] Transient error, retrying (${retryCount + 1}/${MAX_RETRIES})`);
        retryMap.set(email, retryCount + 1);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));

        // Recursive retry (be careful with this pattern)
        return POST(request);
      }

      console.error('[EmailAPI] Resend error:', error.message);
      retryMap.delete(email); // Clear retry count on final failure
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    if (data?.id) {
      console.log(`[EmailAPI] ✅ SUCCESS! Email ID: ${data.id}`);
      retryMap.delete(email); // Clear retry count on success
      logger.info({ email, emailId: data.id }, 'Welcome email sent');
      return NextResponse.json({ success: true, emailId: data.id });
    }

    console.log('[EmailAPI] ❌ No ID in response');
    retryMap.delete(email);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[EmailAPI] ❌ Exception:', error instanceof Error ? error.message : String(error));
    retryMap.delete(email);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
