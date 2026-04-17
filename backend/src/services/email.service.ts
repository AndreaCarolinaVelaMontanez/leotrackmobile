import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('─── EMAIL VERIFICATION (dev mode — no email sent) ───');
    console.log(`To:   ${to}`);
    console.log(`Code: ${code}`);
    console.log('─────────────────────────────────────────────────────');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const safeName = escapeHtml(name);

  const { error } = await resend.emails.send({
    from: 'LeoTrack <noreply@leotrack.org>',
    to,
    subject: 'Verify your LeoTrack account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A1A1A;">Hi ${safeName},</h2>
        <p style="color: #6B6B6B;">Thanks for creating your LeoTrack account. Enter this code in the app to verify your email:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                  background: #F5F5F5; padding: 16px; border-radius: 8px;
                  color: #490a66; text-align: center;">${code}</p>
        <p style="color: #9B9B9B; font-size: 13px; margin-top: 24px;">
          This code expires in 15 minutes. If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error (verification):', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const appScheme = process.env.APP_SCHEME ?? 'leotrack';
  const resetLink = `${appScheme}://reset-password?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log('─── PASSWORD RESET EMAIL (dev mode — no email sent) ───');
    console.log(`To:    ${to}`);
    console.log(`Token: ${token}`);
    console.log(`Link:  ${resetLink}`);
    console.log('───────────────────────────────────────────────────────');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const safeName = escapeHtml(name);

  const { error } = await resend.emails.send({
    from: 'LeoTrack <noreply@leotrack.org>',
    to,
    subject: 'Reset your LeoTrack password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A1A1A;">Hi ${safeName},</h2>
        <p style="color: #6B6B6B;">We received a request to reset your LeoTrack password.</p>
        <p style="color: #6B6B6B;">Enter this code in the app:</p>
        <p style="font-size: 18px; font-weight: bold; letter-spacing: 2px;
                  background: #F5F5F5; padding: 12px 16px; border-radius: 6px;
                  color: #1A1A1A; word-break: break-all;">${token}</p>
        <p style="color: #6B6B6B;">Or tap this link from your device:</p>
        <a href="${resetLink}" style="color: #6C63FF; word-break: break-all;">${resetLink}</a>
        <p style="color: #9B9B9B; font-size: 13px; margin-top: 24px;">
          This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error (password reset):', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
