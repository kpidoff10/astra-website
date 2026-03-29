import { render } from '@react-email/components';
import { WelcomeEmail } from '@/lib/emails/welcome';

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<string | null> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Email] No API key');
      return null;
    }

    console.log('[Email] Rendering component');
    const emailHtml = await render(
      WelcomeEmail({ email, name })
    );

    console.log('[Email] HTML rendered, calling API');
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'astra@astra-ia.dev',
        to: email,
        subject: 'Bienvenue sur Astra ✨',
        html: emailHtml,
      }),
    });

    console.log('[Email] Response status:', res.status);
    const result = await res.json();
    console.log('[Email] Response:', JSON.stringify(result));

    if (result.id) {
      console.log('[Email] Email sent! ID:', result.id);
      return result.id;
    }

    return null;
  } catch (err) {
    console.error('[Email] Error:', err);
    return null;
  }
}
