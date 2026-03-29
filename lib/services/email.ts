import { render } from '@react-email/components';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/lib/emails/welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<string | null> {
  try {
    const html = await render(WelcomeEmail({ email, name }));

    const response = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      html,
    });

    if (response.error) {
      console.error('Email send error:', response.error);
      return null;
    }

    console.log('Welcome email sent to:', email, 'ID:', response.data?.id);
    return response.data?.id || null;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return null;
  }
}
