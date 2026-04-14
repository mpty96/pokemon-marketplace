import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verifica tu cuenta en PokéMarket Chile',
    html: `
      <h2>Bienvenido a PokéMarket Chile 🎴</h2>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verifyUrl}" style="
        background:#3b82f6;
        color:white;
        padding:12px 24px;
        border-radius:6px;
        text-decoration:none;
        display:inline-block;
        margin:16px 0;
      ">Verificar mi cuenta</a>
      <p>El enlace expira en 24 horas.</p>
      <p>Si no creaste una cuenta, ignora este email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Restablecer contraseña - PokéMarket Chile',
    html: `
      <h2>Restablecer contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}" style="
        background:#3b82f6;
        color:white;
        padding:12px 24px;
        border-radius:6px;
        text-decoration:none;
        display:inline-block;
        margin:16px 0;
      ">Restablecer contraseña</a>
      <p>El enlace expira en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este email.</p>
    `,
  });
}