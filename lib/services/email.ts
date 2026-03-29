import { render } from '@react-email/components';
import { WelcomeEmail } from '@/lib/emails/welcome';

/**
 * Send welcome email to new user
 * Uses fetch + render (no SDK issues)
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<string | null> {
  try {
    console.log('[Email] START - email:', email);

    // Validate API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Email] NO API KEY');
      return null;
    }

    console.log('[Email] Step 1: Rendering component');
    const html = await render(WelcomeEmail({ email, name }));
    console.log('[Email] Step 2: HTML rendered, length:', html.length);

    console.log('[Email] Step 3: Calling Resend API');
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
        html: html,
      }),
    });

    console.log('[Email] Step 4: Response status:', response.status);
    const result = await response.json();
    console.log('[Email] Step 5: Response data:', JSON.stringify(result));

    if (result.id) {
      console.log('[Email] SUCCESS! Email ID:', result.id);
      return result.id;
    }

    console.log('[Email] FAIL: No ID in response');
    return null;
  } catch (err) {
    console.error('[Email] EXCEPTION:', err instanceof Error ? err.message : String(err));
    return null;
  }
}
