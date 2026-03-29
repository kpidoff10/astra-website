import { Resend } from 'resend';
import { WelcomeEmail } from '@/lib/emails/welcome';

/**
 * Send welcome email to new user
 * Following Resend + Next.js best practices
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<string | null> {
  try {
    console.log('[Email] START - for:', email);

    // Validate API key
    if (!process.env.RESEND_API_KEY) {
      console.error('[Email] RESEND_API_KEY not set!');
      return null;
    }

    console.log('[Email] Creating Resend instance');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('[Email] Preparing to send');

    // Create promise with timeout
    const emailPromise = resend.emails.send({
      from: 'astra@astra-ia.dev',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      react: WelcomeEmail({ email, name }),
    });

    console.log('[Email] Awaiting response');

    // Add timeout (5 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('[Email] Request timeout (5s)')),
        5000
      )
    );

    const { data, error } = await Promise.race([
      emailPromise,
      timeoutPromise as Promise<any>,
    ]);

    console.log('[Email] Response received - error:', error, 'id:', data?.id);

    if (error) {
      console.error('[Email] Resend error:', error);
      return null;
    }

    if (data?.id) {
      console.log('[Email] SUCCESS! ID:', data.id);
      return data.id;
    }

    console.log('[Email] NO ID in response');
    return null;
  } catch (err) {
    console.error('[Email] EXCEPTION:', String(err));
    return null;
  }
}
