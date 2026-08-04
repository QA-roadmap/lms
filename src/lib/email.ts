import { Resend } from "resend";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  return new Resend(apiKey);
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="uk">
  <body style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 24px;font-size:14px;font-weight:600;letter-spacing:0.02em;color:#71717a;text-transform:uppercase;">${SITE_NAME}</p>
          <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">${title}</h1>
          ${bodyHtml}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin:8px 0 24px;padding:12px 24px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:500;">${label}</a>`;
}

async function send(to: string, subject: string, html: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("Missing EMAIL_FROM");

  const resend = getResend();
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendMagicLinkEmail(email: string, token: string, redirectTo: string) {
  const url = `${SITE_URL}/api/auth/magic-link?email=${encodeURIComponent(email)}&token=${token}&redirectTo=${encodeURIComponent(redirectTo)}`;
  const html = layout(
    "Вхід за посиланням",
    `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;">Натисніть кнопку нижче, щоб увійти в акаунт ${SITE_NAME}. Посилання дійсне 15 хвилин.</p>
     ${button(url, "Увійти")}
     <p style="margin:0;font-size:13px;color:#a1a1aa;">Якщо ви не запитували вхід — просто проігноруйте цей лист.</p>`,
  );
  await send(email, `Вхід у ${SITE_NAME}`, html);
}

export async function sendVerificationEmail(email: string, token: string, redirectTo: string) {
  const url = `${SITE_URL}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}&redirectTo=${encodeURIComponent(redirectTo)}`;
  const html = layout(
    "Підтвердіть email",
    `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;">Дякуємо за реєстрацію в ${SITE_NAME}! Підтвердіть свій email, щоб активувати акаунт. Посилання дійсне 60 хвилин.</p>
     ${button(url, "Підтвердити email")}
     <p style="margin:0;font-size:13px;color:#a1a1aa;">Якщо ви не реєструвались — просто проігноруйте цей лист.</p>`,
  );
  await send(email, `Підтвердіть email — ${SITE_NAME}`, html);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${SITE_URL}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
  const html = layout(
    "Відновлення паролю",
    `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;">Ми отримали запит на відновлення паролю для вашого акаунту в ${SITE_NAME}. Посилання дійсне 30 хвилин.</p>
     ${button(url, "Встановити новий пароль")}
     <p style="margin:0;font-size:13px;color:#a1a1aa;">Якщо ви не запитували відновлення паролю — просто проігноруйте цей лист.</p>`,
  );
  await send(email, `Відновлення паролю — ${SITE_NAME}`, html);
}

export async function sendGoogleOnlyAccountEmail(email: string) {
  const html = layout(
    "У вас вже є акаунт",
    `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;">Цей email зареєстрований через вхід із Google. Паролю для нього не існує — увійдіть, натиснувши "Продовжити через Google" на сторінці входу.</p>
     ${button(`${SITE_URL}/sign-in`, "Перейти до входу")}`,
  );
  await send(email, `Вхід у ${SITE_NAME}`, html);
}
