import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { generateWelcomeEmail } from '@/lib/emails/templates';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = generateWelcomeEmail(email, name);

    const { data, error } = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      html: html,
    });

    if (error) {
      console.error('[SendEmail] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[SendEmail] ✅ Email sent:', data?.id);
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('[SendEmail] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
