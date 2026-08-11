// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { EmailDeliveryError } from '@/lib/email/brevo';
import { sendWelcomeEmail } from '@/lib/email/index';


// Temporary GET route for easy browser testing
export async function GET() {
  try {
    // Replace with your actual email address to test
    const testEmail = 'your_personal_email@gmail.com';
    const testName = 'Test User';

    const result = await sendWelcomeEmail(testEmail, testName);

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}!`,
      messageId: result.messageId,
    });
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}