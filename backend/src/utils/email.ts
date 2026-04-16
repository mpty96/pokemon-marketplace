import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const CLIENT = process.env.CLIENT_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${CLIENT}/verify-email?token=${token}`;
  await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: 'Verifica tu cuenta en PokéMarket Chile',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#2563eb;">🎴 PokéMarket Chile</h1>
        <h2>¡Bienvenido!</h2>
        <p>Haz clic para verificar tu cuenta:</p>
        <a href="${url}" style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:16px 0;">
          Verificar cuenta
        </a>
        <p style="color:#9ca3af;font-size:14px;">El enlace expira en 24 horas.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${CLIENT}/reset-password?token=${token}`;
  await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: 'Restablecer contraseña — PokéMarket Chile',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#2563eb;">🎴 PokéMarket Chile</h1>
        <h2>Restablecer contraseña</h2>
        <p>Haz clic para restablecer tu contraseña:</p>
        <a href="${url}" style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:16px 0;">
          Restablecer contraseña
        </a>
        <p style="color:#9ca3af;font-size:14px;">El enlace expira en 1 hora.</p>
      </div>
    `,
  });
}