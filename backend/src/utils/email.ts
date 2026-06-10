import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_NAME = 'PokeMarket Chile';
const LOGO_URL = process.env.EMAIL_LOGO_URL || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@tcgpokemarket.cl';

function baseEmailTemplate({
  title,
  description,
  buttonText,
  buttonUrl,
  footerNote,
}: {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  footerNote: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>

      <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 12px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr>
                  <td align="center" style="padding:28px 24px 18px 24px;background:#ffffff;">
                    ${
                      LOGO_URL
                        ? `<img src="${LOGO_URL}" alt="${APP_NAME}" style="max-width:180px;height:auto;display:block;margin:0 auto;" />`
                        : `<h1 style="margin:0;color:#1d4ed8;font-size:24px;">${APP_NAME}</h1>`
                    }
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 28px 8px 28px;">
                    <h2 style="margin:0 0 12px 0;color:#111827;font-size:22px;line-height:1.3;">
                      ${title}
                    </h2>

                    <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.7;">
                      ${description}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:28px 28px 24px 28px;">
                    <a
                      href="${buttonUrl}"
                      style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;"
                    >
                      ${buttonText}
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 28px 24px 28px;">
                    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;">
                      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                        ${footerNote}
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 28px;background:#0f172a;text-align:center;">
                    <p style="margin:0;color:#cbd5e1;font-size:12px;line-height:1.6;">
                      ${APP_NAME}<br />
                      Marketplace chileno para coleccionistas de Pokémon TCG.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="max-width:600px;margin:14px auto 0 auto;color:#94a3b8;font-size:11px;line-height:1.5;text-align:center;">
                Este correo fue enviado automáticamente. No respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: `"${APP_NAME}" <${EMAIL_FROM}>`,
    to: email,
    subject: 'Verifica tu cuenta en PokeMarket Chile',
    html: baseEmailTemplate({
      title: 'Verifica tu cuenta',
      description:
        'Gracias por registrarte en PokeMarket Chile. Para activar tu cuenta y comenzar a utilizar la plataforma, confirma tu correo electrónico mediante el siguiente botón.',
      buttonText: 'Verificar mi cuenta',
      buttonUrl: verifyUrl,
      footerNote:
        'Si no creaste una cuenta en PokeMarket Chile, puedes ignorar este correo. El enlace de verificación es personal y no debe ser compartido.',
    }),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: `"${APP_NAME}" <${EMAIL_FROM}>`,
    to: email,
    subject: 'Restablecer contraseña — PokeMarket Chile',
    html: baseEmailTemplate({
      title: 'Restablecer contraseña',
      description:
        'Recibimos una solicitud para restablecer la contraseña de tu cuenta en PokeMarket Chile. Puedes crear una nueva contraseña usando el siguiente botón.',
      buttonText: 'Restablecer contraseña',
      buttonUrl: resetUrl,
      footerNote:
        'Este enlace expira en 1 hora. Si no solicitaste restablecer tu contraseña, ignora este correo y tu cuenta permanecerá sin cambios.',
    }),
  });
}


export async function sendContactFeedbackEmail({
  type,
  message,
  user,
}: {
  type: string;
  message: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
  };
}): Promise<void> {
  const submittedAt = new Date().toLocaleString('es-CL');

  await resend.emails.send({
    from: `"${APP_NAME}" <${EMAIL_FROM}>`,
    to: 'contacto@tcgpokemarket.cl',
    subject: `Nuevo comentario PokeMarket — ${type}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:24px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <div style="padding:24px;background:#0f172a;color:#ffffff;">
            <h1 style="margin:0;font-size:22px;">Nuevo comentario PokeMarket</h1>
            <p style="margin:8px 0 0 0;color:#cbd5e1;font-size:14px;">
              Recibido desde el formulario de contacto.
            </p>
          </div>

          <div style="padding:24px;color:#111827;">
            <p><strong>Tipo:</strong> ${type}</p>
            <p><strong>Fecha:</strong> ${submittedAt}</p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

            <p><strong>Usuario:</strong> ${user?.username || 'No identificado'}</p>
            <p><strong>Email:</strong> ${user?.email || 'No disponible'}</p>
            <p><strong>ID:</strong> ${user?.id || 'No disponible'}</p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

            <p style="font-weight:bold;margin-bottom:8px;">Mensaje:</p>
            <div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;color:#334155;line-height:1.6;">
${message}
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}