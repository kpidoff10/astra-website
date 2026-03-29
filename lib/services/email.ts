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
    console.log('[Email] Starting send for:', email);

    // Create fresh instance for each send (best practice)
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('[Email] Calling resend.emails.send()');

    // Use react: parameter directly with component (official way)
    const { data, error } = await resend.emails.send({
      from: 'astra@astra-ia.dev',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      react: WelcomeEmail({ email, name }),
    });

    console.log('[Email] Response - error:', error, 'data:', data);

    if (error) {
      console.error('[Email] Send failed:', error);
      return null;
    }

    if (data?.id) {
      console.log('[Email] Success! ID:', data.id);
      return data.id;
    }

    console.log('[Email] No ID in data');
    return null;
  } catch (err) {
    console.error('[Email] Exception caught:', err);
    return null;
  }
}
