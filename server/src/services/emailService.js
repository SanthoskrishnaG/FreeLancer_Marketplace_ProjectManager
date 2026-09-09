import { envConfig } from '../config/env.config.js';

export class EmailService {
  static async sendEmail({ to, subject, html, text }) {
    if (envConfig.resend.apiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${envConfig.resend.apiKey}`,
          },
          body: JSON.stringify({
            from: envConfig.resend.from,
            to,
            subject,
            html,
            text,
          }),
        });

        if (res.ok) {
          return { success: true, provider: 'RESEND' };
        }
        console.warn('⚠️ Resend email API responded with error. Falling back to development log.');
      } catch (err) {
        console.warn('⚠️ Resend failed:', err.message);
      }
    }

    // Development logging fallback
    console.log(`\n📧 [DEV EMAIL MOCK] --------------------`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html?.substring(0, 100)}...`);
    console.log(`----------------------------------------\n`);

    return { success: true, provider: 'MOCK' };
  }
}
