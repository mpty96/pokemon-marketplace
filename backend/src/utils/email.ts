import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('RESEND KEY:', process.env.RESEND_API_KEY);
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: `"PokeMarket Chile" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verifica tu cuenta en PokeMarket Chile',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">🎴 PokeMarket Chile</h1>
        </div>
        <h2 style="color: #1f2937;">¡Bienvenido!</h2>
        <p style="color: #4b5563;">
          Gracias por registrarte. Haz clic en el botón para verificar tu cuenta:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}"
            style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Verificar mi cuenta
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          Si no creaste esta cuenta, ignora este email.<br/>
          El enlace expira en 24 horas.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          PokeMarket Chile — Marketplace de cartas Pokémon
        </p>
      </body>
      </html>
    `,
  });
}

  export async function sendPasswordResetEmail(
    email: string,
    token: string
  ): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await resend.emails.send({
    from: `"PokeMarket Chile" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Restablecer contraseña — PokeMarket Chile',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">🎴 PokeMarket Chile</h1>
        <h2 style="color: #1f2937;">Restablecer contraseña</h2>
        <p style="color: #4b5563;">Haz clic en el botón para restablecer tu contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
            style="background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          El enlace expira en 1 hora.<br/>
          Si no solicitaste esto, ignora este email.
        </p>
      </body>
      </html>
    `,
  });
}