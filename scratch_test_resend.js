const { Resend } = require('resend');
const resend = new Resend('re_UbcjBErM_LwZnKMhGAXLSGjn6G9iizP38');

async function main() {
  const result = await resend.emails.send({
    from: 'Contril <onboarding@resend.dev>',
    to: 'sumansadhu0001@gmail.com',
    subject: 'Contril 4-Digit Verification Code',
    html: `
      <div style="max-width: 440px; margin: 0 auto; padding: 30px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="letter-spacing: 2px; color: #0f172a; margin-bottom: 4px;">CONTRIL</h2>
        <p style="color: #64748b; font-size: 12px; margin-top: 0;">AI Chief of Staff</p>
        <h3 style="color: #0f172a; margin: 24px 0 10px 0;">Verify your account</h3>
        <p style="color: #475569; font-size: 14px;">Your 4-digit Contril verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px 20px; border-radius: 10px; display: inline-block; margin: 10px 0 20px 0;">
          5831
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This code expires in 10 minutes.<br>© Contril</p>
      </div>
    `
  });
  console.log('RESEND DISPATCH RESULT:', JSON.stringify(result));
}

main().catch(console.error);
