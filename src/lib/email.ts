import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? 'GreenHeart <noreply@greenheart.ie>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://greenheart.ie'

function baseEmail(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GreenHeart</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#064e3b,#065f46);padding:32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:24px;font-weight:900;">💚 GreenHeart</h1>
              <p style="color:#6ee7b7;margin:8px 0 0;font-size:14px;">Play Golf. Win Big. Give Back.</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                &copy; ${new Date().getFullYear()} GreenHeart ·
                <a href="${APP_URL}/settings" style="color:#059669;">Manage notifications</a> ·
                <a href="${APP_URL}" style="color:#059669;">Visit platform</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to GreenHeart 🎉',
    html: baseEmail(`
      <h2 style="color:#0f172a;margin:0 0 16px;">Welcome, ${name}! 🏌️</h2>
      <p style="color:#475569;line-height:1.6;">You've joined a community of golfers who play with purpose. Here's what to do next:</p>
      <ol style="color:#475569;line-height:2;">
        <li>Select your charity in the dashboard</li>
        <li>Enter your 5 Stableford scores</li>
        <li>You're automatically entered in the next monthly draw!</li>
      </ol>
      <div style="text-align:center;margin:32px 0;">
        <a href="${APP_URL}/dashboard" style="background:#059669;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">
          Go to Dashboard →
        </a>
      </div>
    `),
  })
}

export async function sendDrawResultsEmail(
  to: string,
  name: string,
  drawMonth: string,
  winningNumbers: number[],
  isWinner: boolean,
  matchCount?: number,
  prizeAmount?: number
) {
  const subject = isWinner
    ? `🏆 You Won in the ${drawMonth} Draw!`
    : `📋 ${drawMonth} Draw Results`

  const content = isWinner ? `
    <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:8px;">🏆</div>
      <h2 style="color:#92400e;margin:0 0 8px;">Congratulations, ${name}!</h2>
      <p style="color:#92400e;font-weight:700;font-size:18px;">You matched ${matchCount} numbers and won €${((prizeAmount ?? 0) / 100).toFixed(2)}!</p>
    </div>
    <p style="color:#475569;">Please submit your verification proof to claim your prize:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/winnings" style="background:#059669;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">
        Submit Verification →
      </a>
    </div>
  ` : `
    <h2 style="color:#0f172a;margin:0 0 16px;">Hi ${name},</h2>
    <p style="color:#475569;">The ${drawMonth} draw results are in!</p>
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 12px;font-weight:600;color:#064e3b;">Winning Numbers:</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${winningNumbers.map(n => `<span style="display:inline-block;width:36px;height:36px;background:#059669;color:white;border-radius:8px;text-align:center;line-height:36px;font-weight:900;">${n}</span>`).join('')}
      </div>
    </div>
    <p style="color:#475569;">Better luck next month! Keep entering your scores.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/draws" style="background:#059669;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">
        View Full Results →
      </a>
    </div>
  `

  return resend.emails.send({ from: FROM, to, subject, html: baseEmail(content) })
}

export async function sendVerificationResultEmail(
  to: string,
  name: string,
  approved: boolean,
  prizeAmount: number,
  notes?: string
) {
  const subject = approved
    ? '✅ Verification Approved — Payment Processing'
    : '❌ Verification Rejected'

  return resend.emails.send({
    from: FROM,
    to,
    subject,
    html: baseEmail(`
      <h2 style="color:#0f172a;margin:0 0 16px;">Hi ${name},</h2>
      ${approved ? `
        <div style="background:#f0fdf4;border:2px solid #059669;border-radius:12px;padding:20px;margin-bottom:20px;">
          <p style="color:#064e3b;font-weight:700;margin:0;">✅ Your verification has been approved!</p>
          <p style="color:#064e3b;margin:8px 0 0;">Prize amount: <strong>€${(prizeAmount / 100).toFixed(2)}</strong></p>
        </div>
        <p style="color:#475569;">Your payment is being processed and will arrive within 2-3 business days.</p>
      ` : `
        <div style="background:#fef2f2;border:2px solid #ef4444;border-radius:12px;padding:20px;margin-bottom:20px;">
          <p style="color:#991b1b;font-weight:700;margin:0;">❌ Your verification was rejected</p>
          ${notes ? `<p style="color:#991b1b;margin:8px 0 0;">Reason: ${notes}</p>` : ''}
        </div>
        <p style="color:#475569;">Please contact support if you believe this is an error.</p>
      `}
      <div style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}/winnings" style="background:#059669;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">
          View Winnings →
        </a>
      </div>
    `),
  })
}

export async function sendSubscriptionEmail(
  to: string,
  name: string,
  type: 'created' | 'cancelled' | 'payment_failed',
  plan?: string
) {
  const subjects = {
    created: `🎉 Subscription Confirmed — Welcome to GreenHeart!`,
    cancelled: `Subscription Cancelled`,
    payment_failed: `⚠️ Payment Failed — Action Required`,
  }

  const bodies = {
    created: `<p style="color:#475569;">Your <strong>${plan}</strong> subscription is now active. You're ready to play with purpose!</p>`,
    cancelled: `<p style="color:#475569;">Your subscription has been cancelled. You can resubscribe anytime at <a href="${APP_URL}/subscribe" style="color:#059669;">${APP_URL}/subscribe</a>.</p>`,
    payment_failed: `<p style="color:#475569;">We couldn't process your latest payment. Please update your payment method to maintain access.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/settings" style="background:#f59e0b;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">
        Update Payment Method →
      </a>
    </div>`,
  }

  return resend.emails.send({
    from: FROM,
    to,
    subject: subjects[type],
    html: baseEmail(`<h2 style="color:#0f172a;margin:0 0 16px;">Hi ${name},</h2>${bodies[type]}`),
  })
}
