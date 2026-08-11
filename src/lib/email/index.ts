// lib/email/index.ts
import { success } from 'zod';
import { brevo, devTransporter, parseBrevoError } from './brevo';

export interface SendEmailOptions {
    toEmail: string;
    toName: string;
    subject: string;
    htmlContent: string;
}

export async function sendEmail({ toEmail, toName, subject, htmlContent }: SendEmailOptions) {
    // 🟢 DEVELOPMENT: Send to Mailpit (0 Brevo Credits Used)
      if (process.env.NODE_ENV === 'development') {
        try {
          const info = await devTransporter.sendMail({
            from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL || 'no-reply@yourdomain.com'}>`,
            to: `"${toName}" <${toEmail}>`,
            subject: subject,
            html: htmlContent,
          });

          console.log('✉️ [MAILPIT] Email captured! Message ID:', info.messageId, process.env.SENDER_EMAIL
          );
          return { success: true, messageId: info.messageId };
        } catch (err) {
          console.error('❌ Mailpit Sandbox Error:', err);
          throw err;
        }
      }

    // 🔴 PRODUCTION: Send via Brevo API
    try {
        const response = await brevo.transactionalEmails.sendTransacEmail({
            subject,
            sender: {
                name: process.env.SENDER_NAME || 'My App',
                email: process.env.SENDER_EMAIL || 'no-reply@yourdomain.com',
            },
            to: [{ email: toEmail, name: toName }],
            htmlContent,
        });

        console.log('✉️ [MAILPIT] Email captured! Message ID:', response.messageId, process.env.SENDER_EMAIL);
        return { success: true, messageId: response.messageId };
    } catch (err) {
        console.error('❌ Brevo API Error:', err);
        throw parseBrevoError(err);
    }
}

export async function sendWelcomeEmail(toEmail: string, toName: string) {
    return sendEmail({
        toEmail,
        toName,
        subject: 'Welcome to our platform!',
        htmlContent: `<h1>Welcome, ${toName}!</h1><p>We are excited to have you.</p>`,
    });
}

export { EmailDeliveryError } from './brevo';