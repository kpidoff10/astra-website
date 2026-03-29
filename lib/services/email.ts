import { render } from '@react-email/components';
import { WelcomeEmail } from '@/lib/emails/welcome';

/**
 * Send welcome email to new user using Resend API
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<string | null> {
  try {
    // Check API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Email] RESEND_API_KEY not found');
      return null;
    }

    console.log('[Email] Rendering template for:', email);
    const html = await render(WelcomeEmail({ email, name }));

    console.log('[Email] Calling Resend API');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'astra@astra-ia.dev',
        to: email,
        subject: 'Bienvenue sur Astra ✨',
        html,
      }),
    });

    const data = await response.json();
    console.log('[Email] Response status:', response.status, 'Data:', JSON.stringify(data));

    if (!response.ok) {
      console.error('[Email] API error:', data);
      return null;
    }

    if (data.id) {
      console.log('[Email] Success! Sent to:', email, 'ID:', data.id);
      return data.id;
    }

    console.error('[Email] No ID in response:', data);
    return null;
  } catch (error) {
    console.error('[Email] Exception:', error);
    return null;
  }
}
