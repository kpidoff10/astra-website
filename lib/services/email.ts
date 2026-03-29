'use server';

import { Resend } from 'resend';
import { WelcomeEmail } from '@/lib/emails/welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send welcome email to new user
 * This is a server-side function using the Resend SDK
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<string | null> {
  try {
    console.log('[Email] Sending to:', email);

    // Use Resend with React component (not HTML render)
    const { data, error } = await resend.emails.send({
      from: 'astra@astra-ia.dev',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      react: WelcomeEmail({ email, name }),
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return null;
    }

    if (data?.id) {
      console.log('[Email] Success! ID:', data.id);
      return data.id;
    }

    console.log('[Email] No ID returned, data:', data);
    return null;
  } catch (error) {
    console.error('[Email] Exception:', error);
    return null;
  }
}
