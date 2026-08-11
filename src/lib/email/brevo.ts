// lib/email/client.ts
import { BrevoClient, BrevoError } from '@getbrevo/brevo';
import nodemailer from 'nodemailer';

// 1. Brevo Client (Production)
export const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
  timeoutInSeconds: 30,
  maxRetries: 2,
});

// 2. Mailpit Transporter (Development)
export const devTransporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || '127.0.0.1',
  port: Number(process.env.MAILTRAP_PORT) || 1025,
});

// 3. Application Error Class
export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'EmailDeliveryError';
  }
}

// 4. Centralized Brevo Error Parser
export function parseBrevoError(err: unknown): EmailDeliveryError {
  if (err instanceof BrevoError) {
    const statusCode = err.statusCode || (err as any).status || 500;

    switch (statusCode) {
      case 401:
      case 403:
        console.error('[Brevo Error 401/403]: Invalid API key or unauthorized request.');
        return new EmailDeliveryError('Email service authentication error.', 500);

      case 429: {
        const retryAfter = (err as any).response?.headers?.['retry-after'];
        console.error(`[Brevo Error 429]: Rate limited. Retry after ${retryAfter ?? 'unknown'}s`);
        return new EmailDeliveryError('Email rate limit exceeded. Please try again later.', 429);
      }

      default:
        console.error(`[Brevo API Error ${statusCode}]: ${err.message}`);
        return new EmailDeliveryError('Email provider failed to process request.', statusCode);
    }
  }

  console.error('[Unexpected Email Failure]:', err);
  return new EmailDeliveryError('An unexpected error occurred while sending email.', 500);
}

