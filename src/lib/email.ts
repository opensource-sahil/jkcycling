import { Resend } from 'resend';

// Only initialize if key exists to prevent build errors
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Extra RFC headers, e.g. List-Unsubscribe on bulk mail. */
  headers?: Record<string, string>;
}

export async function sendEmail({ to, subject, html, headers }: SendEmailParams) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: 'JK Cycling <notify@notifications.jkcycling.com>',
      to,
      subject,
      html,
      ...(headers ? { headers } : {}),
    });

    return { success: true, data };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}
