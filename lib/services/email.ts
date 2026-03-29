import { render } from '@react-email/components';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/lib/emails/welcome';

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<string | null> {
  try {
    // Debug: check if API key is loaded
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return null;
    }

    console.log('[Email] Initializing Resend with API key');
    const resend = new Resend(apiKey);

    console.log('[Email] Rendering email template for:', email);
    const html = await render(WelcomeEmail({ email, name }));

    console.log('[Email] Sending email via Resend');
    const response = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      html,
    });

    if (response.error) {
      console.error('[Email] Send error:', response.error);
      return null;
    }

    console.log('[Email] Success! Email sent to:', email, 'ID:', response.data?.id);
    return response.data?.id || null;
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return null;
  }
}
