import aiosmtplib
from email.message import EmailMessage
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SENDER_EMAIL
import datetime
import html

async def send_feedback_email(user_email: str, feedback_message: str):
    print("📨 Sending feedback from:", user_email)

    message = EmailMessage()

    # ✅ Always YOUR email (required)
    message["From"] = f"MoodCare AI <{SENDER_EMAIL}>"

    # ✅ You receive the email
    message["To"] = SENDER_EMAIL

    # ✅ Show user email in subject
    message["Subject"] = f"New Feedback from {user_email}"

    # ✅ THIS is the key fix
    message["Reply-To"] = user_email

    # ✅ Plain text
    message.set_content(f"""
New Feedback Received

From: {user_email}

Message:
{feedback_message}
""")

    # ✅ HTML version
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Feedback — MoodCare AI</title>
      <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ede8;
      font-family: 'DM Sans', sans-serif;
      padding: 40px 16px;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    /* ── Top wordmark ── */
    .topbar {
      text-align: center;
      margin-bottom: 28px;
    }
    .topbar .brand {
      font-family: 'DM Serif Display', serif;
      font-size: 22px;
      color: #2d2926;
      letter-spacing: 0.02em;
    }
    .topbar .brand span {
      color: #6c5ce7;
    }

    /* ── Card ── */
    .card {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #e5e0d8;
    }

    /* ── Hero banner ── */
    .hero {
      background: linear-gradient(135deg, #1a1035 0%, #2d1b69 60%, #4a2c9e 100%);
      padding: 40px 40px 36px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 220px; height: 220px;
      background: radial-gradient(circle, rgba(108,92,231,0.35) 0%, transparent 70%);
      border-radius: 50%;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: -40px; left: 30px;
      width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(162,139,255,0.2) 0%, transparent 70%);
      border-radius: 50%;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 100px;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.85);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .hero-badge::before {
      content: '';
      width: 6px; height: 6px;
      background: #a8e063;
      border-radius: 50%;
      display: inline-block;
    }
    .hero h1 {
      font-family: 'DM Serif Display', serif;
      font-size: 32px;
      color: #ffffff;
      line-height: 1.2;
      position: relative;
      z-index: 1;
    }
    .hero p {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      margin-top: 8px;
      position: relative;
      z-index: 1;
    }

    /* ── Body content ── */
    .body {
      padding: 36px 40px;
    }

    /* ── Meta row ── */
    .meta-row {
      display: flex;
      gap: 16px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }
    .meta-chip {
      flex: 1;
      min-width: 140px;
      background: #f8f6f2;
      border: 1px solid #ede9e1;
      border-radius: 12px;
      padding: 14px 16px;
    }
    .meta-chip .chip-label {
      font-size: 10px;
      font-weight: 600;
      color: #9e9793;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .meta-chip .chip-value {
      font-size: 14px;
      font-weight: 500;
      color: #2d2926;
      word-break: break-all;
    }
    .meta-chip .chip-value.accent {
      color: #6c5ce7;
    }

    /* ── Section label ── */
    .section-label {
      font-size: 10px;
      font-weight: 600;
      color: #9e9793;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }

    /* ── Message bubble ── */
    .message-bubble {
      background: #f8f6f2;
      border: 1px solid #ede9e1;
      border-radius: 16px;
      border-top-left-radius: 4px;
      padding: 20px 22px;
      font-size: 15px;
      color: #2d2926;
      line-height: 1.7;
      font-weight: 300;
    }

    /* ── Divider ── */
    .divider {
      border: none;
      border-top: 1px solid #ede9e1;
      margin: 28px 0;
    }

    /* ── Action row ── */
    .action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .action-btn {
      display: inline-block;
      background: #6c5ce7;
      color: #ffffff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 11px 22px;
      border-radius: 100px;
      letter-spacing: 0.02em;
    }
    .action-hint {
      font-size: 12px;
      color: #b0aaa4;
    }

    /* ── Footer ── */
    .footer {
      background: #f8f6f2;
      border-top: 1px solid #ede9e1;
      padding: 22px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footer-logo {
      font-family: 'DM Serif Display', serif;
      font-size: 15px;
      color: #6c5ce7;
    }
    .footer-text {
      font-size: 11px;
      color: #b0aaa4;
      text-align: right;
    }
  </style>
    </head>
    <body>

    <div class="wrapper">

        <div class="topbar">
        <div class="brand">MoodCare<span> AI</span></div>
        </div>

        <div class="card">

        <!-- Hero -->
        <div class="hero">
            <div class="hero-badge">User Feedback</div>
            <h1>New message<br>from your app</h1>
            <p>Submitted via in-app feedback form</p>
        </div>

        <!-- Body -->
        <div class="body">

            <!-- Meta chips -->
            <div class="meta-row">
            <div class="meta-chip">
                <div class="chip-label">From</div>
                <div class="chip-value accent">{{ user_email }}</div>
            </div>
            <div class="meta-chip">
                <div class="chip-label">Received</div>
                <div class="chip-value">{{ timestamp }}</div>
            </div>
            <div class="meta-chip">
                <div class="chip-label">Source</div>
                <div class="chip-value">{{ source }}</div>
            </div>
            </div>

            <!-- Message -->
            <div class="section-label">Message</div>
            <div class="message-bubble">
            {{ feedback_message }}
            </div>

            <hr class="divider" />

            <!-- CTA -->
            <div class="action-row">
            <a href="{{ dashboard_url }}" class="action-btn">View in dashboard →</a>
            <span class="action-hint">Reply directly to this email to respond to the user.</span>
            </div>

        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">MoodCare AI</div>
            <div class="footer-text">
            Automated notification · <a href="{{ unsubscribe_url }}" style="color:#b0aaa4;">Unsubscribe</a><br>
            © 2026 MoodCare AI. All rights reserved.
            </div>
        </div>    

        </div>

    </div>

    </body>
    </html>
    """

    feedback_message_escaped = html.escape(feedback_message)
    timestamp = datetime.datetime.now().strftime("%b %d, %Y, %I:%M %p")
    html_content = html_content.replace("{{ user_email }}", user_email)
    html_content = html_content.replace("{{ timestamp }}", timestamp)
    html_content = html_content.replace("{{ source }}", "In-App Feedback")
    html_content = html_content.replace("{{ feedback_message }}", feedback_message_escaped)
    html_content = html_content.replace("{{ dashboard_url }}", "#")
    html_content = html_content.replace("{{ unsubscribe_url }}", "#")

    message.add_alternative(html_content, subtype="html")

    # ✅ Send email
    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            use_tls=(SMTP_PORT == 465),
            start_tls=(SMTP_PORT == 587),
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )
        print("✅ Feedback email sent")

    except Exception as e:
        print("🔥 SMTP ERROR:", e)
        raise e


async def send_welcome_email(user_email: str, user_name: str):
    """Send a welcome email after successful registration."""
    print("📨 Sending welcome email to:", user_email)

    message = EmailMessage()
    message["From"] = f"MoodCare AI <{SENDER_EMAIL}>"
    message["To"] = user_email
    message["Subject"] = "Welcome to MoodCare AI 🎉"

    message.set_content(f"""
Welcome to MoodCare AI, {user_name}!

We're thrilled to have you on board. Your mental wellness journey starts now.

Here's what you can do:
- Chat with our AI companion anytime
- Track your mood daily
- Write in your journal
- Get personalized insights

If you ever need support, we're here for you 24/7.

With care,
The MoodCare AI Team
""")

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; margin: 0;">

    <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">

      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to MoodCare AI 🎉</h1>
        <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Your mental wellness journey starts now</p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px;">Hi <strong>{html.escape(user_name)}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px;">
          We're thrilled to have you on board! MoodCare AI is your personal mental health companion, powered by advanced AI that truly understands you.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Here's what you can do</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #334155;">💬 Chat with our AI companion anytime</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #334155;">📊 Track your mood daily</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #334155;">📝 Write in your private journal</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: #334155;">🔍 Get personalized insights</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0;">
          If you ever need support, we're here for you <strong>24/7</strong>. Just open the app and start chatting.
        </p>
      </div>

      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
        <p style="font-size: 14px; color: #4f46e5; font-weight: 600; margin: 0 0 4px;">MoodCare AI</p>
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 MoodCare AI. All rights reserved.</p>
      </div>

    </div>

    </body>
    </html>
    """

    message.add_alternative(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            use_tls=(SMTP_PORT == 465),
            start_tls=(SMTP_PORT == 587),
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )
        print("✅ Welcome email sent")
    except Exception as e:
        print("🔥 Welcome email SMTP ERROR:", e)
        raise e


async def send_feedback_thankyou_email(user_email: str):
    """Send a thank-you email to user after they submit feedback."""
    print("📨 Sending thank-you email to:", user_email)

    message = EmailMessage()
    message["From"] = f"MoodCare AI <{SENDER_EMAIL}>"
    message["To"] = user_email
    message["Subject"] = "Thank you for your feedback — MoodCare AI"

    message.set_content("""
Thank You for Your Feedback!

We truly appreciate you taking the time to share your thoughts with us.

Your feedback helps us improve MoodCare AI and provide a better experience for everyone.

Our team will review your message and may reach out if needed. 
You can typically expect a response within 24-48 hours.

With gratitude,
The MoodCare AI Team
""")

    html_content = """
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; margin: 0;">

    <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">

      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 32px 24px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">💚</div>
        <h1 style="margin: 0; font-size: 22px;">Thank You!</h1>
        <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">Your feedback means the world to us</p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 16px;">
          We truly appreciate you taking the time to share your thoughts with us. Your feedback helps us improve MoodCare AI and provide a better experience for everyone.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <p style="font-size: 13px; color: #166534; margin: 0;">
            ⏱ Our team will review your message and may reach out if needed. You can typically expect a response within <strong>24-48 hours</strong>.
          </p>
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0;">
          In the meantime, feel free to continue using MoodCare AI. We're always here for you.
        </p>
      </div>

      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
        <p style="font-size: 14px; color: #4f46e5; font-weight: 600; margin: 0 0 4px;">MoodCare AI</p>
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">© 2026 MoodCare AI. All rights reserved.</p>
      </div>

    </div>

    </body>
    </html>
    """

    message.add_alternative(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            use_tls=(SMTP_PORT == 465),
            start_tls=(SMTP_PORT == 587),
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )
        print("✅ Thank-you email sent")
    except Exception as e:
        print("🔥 Thank-you email SMTP ERROR:", e)
        raise e
