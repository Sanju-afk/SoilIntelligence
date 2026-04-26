"""
Email Notification Service — Transactional emails via SendGrid/SMTP
"""

import asyncio
import logging
from typing import Optional
from datetime import datetime
from jinja2 import Environment, BaseLoader
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# Jinja2 Email Templates (inline)
# ─────────────────────────────────────────

BASE_HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'DM Sans', -apple-system, sans-serif; background:#f5f0e8; margin:0; padding:0; }
  .wrapper { max-width:580px; margin:0 auto; padding:32px 16px; }
  .card { background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background:#0f1e0d; padding:28px 32px; }
  .logo { color:#6fab69; font-weight:800; font-size:20px; letter-spacing:-0.5px; }
  .logo span { color:#ffffff; }
  .body { padding:32px; }
  h1 { color:#1a2e18; font-size:22px; margin:0 0 8px; font-weight:700; }
  p { color:#4a6b48; font-size:15px; line-height:1.7; margin:0 0 16px; }
  .btn { display:inline-block; background:#1e6b1a; color:#ffffff; padding:14px 28px; border-radius:12px; text-decoration:none; font-weight:700; font-size:14px; margin:8px 0; }
  .btn:hover { background:#26881f; }
  .meta-box { background:#f5f9f5; border:1px solid #d4e9d2; border-radius:12px; padding:16px; margin:16px 0; }
  .meta-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #e8f0e8; font-size:13px; }
  .meta-row:last-child { border-bottom:none; }
  .meta-label { color:#6b8b69; font-weight:600; }
  .meta-value { color:#1a2e18; font-weight:700; }
  .badge { display:inline-block; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; }
  .badge-green { background:#d4e9d2; color:#1e6b1a; }
  .badge-amber { background:#faefd0; color:#b87d12; }
  .badge-red   { background:#fde8e8; color:#c0392b; }
  .footer { padding:20px 32px; text-align:center; font-size:12px; color:#8b9e8a; border-top:1px solid #e8f0e8; }
  .footer a { color:#3d8838; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo">Soil<span>Intelligence</span></div>
    </div>
    <div class="body">
      {{ content }}
    </div>
    <div class="footer">
      <p>Soil Intelligence UAB · Kaunas, Lithuania<br>
      <a href="https://soilintelligence.lt">soilintelligence.lt</a> ·
      <a href="https://app.soilintelligence.lt/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</div>
</body>
</html>
"""

TEMPLATES = {
    "order_confirmed": {
        "subject": "Order Confirmed — {{ order_number }}",
        "content": """
<h1>Your soil test is confirmed ✓</h1>
<p>Hi {{ first_name }}, your order has been received and a field technician will be assigned within 2 hours.</p>
<div class="meta-box">
  <div class="meta-row"><span class="meta-label">Order</span><span class="meta-value">{{ order_number }}</span></div>
  <div class="meta-row"><span class="meta-label">Farm</span><span class="meta-value">{{ farm_name }}</span></div>
  <div class="meta-row"><span class="meta-label">Package</span><span class="meta-value">{{ package }}</span></div>
  <div class="meta-row"><span class="meta-label">Total</span><span class="meta-value">€{{ total_price }}</span></div>
  <div class="meta-row"><span class="meta-label">Est. Report</span><span class="meta-value">Within 48 hours of field visit</span></div>
</div>
<p>You'll receive an SMS when your technician is on the way and another when your report is ready.</p>
<a href="{{ dashboard_url }}/dashboard/orders/{{ order_id }}" class="btn">Track Your Order →</a>
""",
    },

    "worker_assigned": {
        "subject": "Technician Assigned — {{ order_number }}",
        "content": """
<h1>Your field technician is assigned 👷</h1>
<p>Hi {{ first_name }}, a verified Soil Intelligence technician has been assigned to your order.</p>
<div class="meta-box">
  <div class="meta-row"><span class="meta-label">Technician</span><span class="meta-value">{{ worker_name }}</span></div>
  <div class="meta-row"><span class="meta-label">Region</span><span class="meta-value">{{ worker_region }}</span></div>
  <div class="meta-row"><span class="meta-label">Scheduled</span><span class="meta-value">{{ scheduled_date }}</span></div>
  <div class="meta-row"><span class="meta-label">Sensor Kit</span><span class="meta-value">{{ sensor_kit_id }}</span></div>
</div>
<p>Your technician will contact you before arrival. Please ensure farm access is available on the scheduled date.</p>
<a href="{{ dashboard_url }}/dashboard/orders/{{ order_id }}" class="btn">View Order Details →</a>
""",
    },

    "report_ready": {
        "subject": "🌱 Your Soil Report is Ready — Grade {{ grade }}",
        "content": """
<h1>Your soil health report is ready!</h1>
<p>Hi {{ first_name }}, your AI-powered soil diagnostic report has been generated for <strong>{{ farm_name }}</strong>.</p>
<div class="meta-box">
  <div class="meta-row"><span class="meta-label">Overall Score</span><span class="meta-value">{{ overall_score }}/100</span></div>
  <div class="meta-row"><span class="meta-label">Soil Health Grade</span><span class="meta-value">Grade {{ grade }}</span></div>
  <div class="meta-row"><span class="meta-label">Fertility Class</span><span class="meta-value">{{ fertility_class }}</span></div>
  <div class="meta-row"><span class="meta-label">EU Compliance</span><span class="meta-value"><span class="badge badge-{{ compliance_badge }}">{{ eu_compliance_status | upper }}</span></span></div>
  <div class="meta-row"><span class="meta-label">Recommendations</span><span class="meta-value">{{ rec_count }} fertiliser action(s)</span></div>
</div>
<p>Log in to view your full analysis, download your PDF report, and review fertiliser recommendations.</p>
<a href="{{ dashboard_url }}/dashboard/analysis" class="btn">View Full Analysis →</a>
<p style="margin-top:20px; font-size:13px; color:#8b9e8a;">Your PDF report is also attached to this email for offline use.</p>
""",
    },

    "compliance_reminder": {
        "subject": "⚠️ EU Compliance Deadline Approaching — {{ deadline }}",
        "content": """
<h1>EU Soil Monitoring deadline approaching</h1>
<p>Hi {{ first_name }}, your EU Soil Monitoring Law compliance submission deadline is <strong>{{ deadline }}</strong>.</p>
<div class="meta-box">
  <div class="meta-row"><span class="meta-label">Farm</span><span class="meta-value">{{ farm_name }}</span></div>
  <div class="meta-row"><span class="meta-label">Directive</span><span class="meta-value">EU Soil Monitoring Law 2025</span></div>
  <div class="meta-row"><span class="meta-label">Current Status</span><span class="meta-value"><span class="badge badge-amber">{{ status | upper }}</span></span></div>
  <div class="meta-row"><span class="meta-label">Days Remaining</span><span class="meta-value">{{ days_remaining }} days</span></div>
</div>
<p>Your Soil Intelligence reports are pre-formatted for submission. Log in to download your compliance certificate.</p>
<a href="{{ dashboard_url }}/dashboard/compliance" class="btn">View Compliance Dashboard →</a>
""",
    },

    "welcome": {
        "subject": "Welcome to Soil Intelligence 🌱",
        "content": """
<h1>Welcome to Soil Intelligence, {{ first_name }}!</h1>
<p>Your account has been created. You can now order soil testing services, track field work, and access AI-powered soil diagnostics.</p>
<div class="meta-box">
  <div class="meta-row"><span class="meta-label">Email</span><span class="meta-value">{{ email }}</span></div>
  <div class="meta-row"><span class="meta-label">Account Type</span><span class="meta-value">Farmer Account</span></div>
  <div class="meta-row"><span class="meta-label">Platform</span><span class="meta-value">Soil Intelligence</span></div>
</div>
<p>Get started by adding your first farm and ordering a soil test. Results delivered within 48 hours.</p>
<a href="{{ dashboard_url }}/dashboard" class="btn">Go to Dashboard →</a>
""",
    },

    "consultation_booked": {
        "subject": "Consultation Confirmed — {{ date }} at {{ time }}",
        "content": """
<h1>Your consultation is booked ✓</h1>
<p>Hi {{ first_name }}, your agronomist consultation has been confirmed.</p>
<div class="meta-box">
  <div class="meta-row"><span class="meta-label">Agronomist</span><span class="meta-value">{{ agronomist_name }}</span></div>
  <div class="meta-row"><span class="meta-label">Date</span><span class="meta-value">{{ date }}</span></div>
  <div class="meta-row"><span class="meta-label">Time</span><span class="meta-value">{{ time }} (Lithuanian time)</span></div>
  <div class="meta-row"><span class="meta-label">Duration</span><span class="meta-value">{{ duration }} minutes</span></div>
  <div class="meta-row"><span class="meta-label">Format</span><span class="meta-value">{{ consultation_type }}</span></div>
  {% if meeting_url %}
  <div class="meta-row"><span class="meta-label">Meeting Link</span><span class="meta-value"><a href="{{ meeting_url }}">Join Call</a></span></div>
  {% endif %}
</div>
<a href="{{ dashboard_url }}/dashboard/consultations" class="btn">View Consultation →</a>
""",
    },
}

# ─────────────────────────────────────────
# Renderer
# ─────────────────────────────────────────

jinja_env = Environment(loader=BaseLoader())


def render_email(template_key: str, context: dict) -> tuple[str, str]:
    """Returns (subject, html_body) for the given template key and context."""
    tmpl = TEMPLATES.get(template_key)
    if not tmpl:
        raise ValueError(f"Unknown email template: {template_key}")

    context.setdefault("dashboard_url", "https://app.soilintelligence.lt")

    subject = jinja_env.from_string(tmpl["subject"]).render(**context)
    content = jinja_env.from_string(tmpl["content"]).render(**context)
    html = jinja_env.from_string(BASE_HTML).render(content=content)
    return subject, html


# ─────────────────────────────────────────
# Sender
# ─────────────────────────────────────────

async def send_email(
    to_email: str,
    template_key: str,
    context: dict,
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None,
):
    """
    Send a transactional email.
    In production: swap with aiosmtplib / SendGrid / Resend.
    """
    subject, html = render_email(template_key, context)

    logger.info(f"[EMAIL] To: {to_email} | Template: {template_key} | Subject: {subject}")

    # ── Production send (SendGrid) ──
    # import sendgrid
    # from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
    # import base64
    # sg = sendgrid.SendGridAPIClient(api_key=settings.SMTP_PASSWORD)
    # message = Mail(
    #     from_email=(settings.FROM_EMAIL, settings.FROM_NAME),
    #     to_emails=to_email,
    #     subject=subject,
    #     html_content=html,
    # )
    # if attachment_bytes and attachment_filename:
    #     encoded = base64.b64encode(attachment_bytes).decode()
    #     attachment = Attachment(FileContent(encoded), FileName(attachment_filename), FileType("application/pdf"), Disposition("attachment"))
    #     message.attachment = attachment
    # sg.send(message)

    return {"sent": True, "to": to_email, "subject": subject}


# ─────────────────────────────────────────
# Convenience Wrappers
# ─────────────────────────────────────────

async def send_order_confirmed(to_email: str, order: dict, farm: dict, user: dict):
    await send_email(to_email, "order_confirmed", {
        "first_name": user["first_name"],
        "order_number": order["order_number"],
        "order_id": order["id"],
        "farm_name": farm["name"],
        "package": order["package"].replace("_", " ").title(),
        "total_price": f"{order['total_price']:.2f}",
    })

async def send_report_ready(to_email: str, analysis: dict, farm: dict, user: dict, pdf_bytes: Optional[bytes] = None):
    status = analysis.get("eu_compliance_status", "pending")
    badge = {"compliant": "green", "partial": "amber", "non_compliant": "red"}.get(status, "amber")
    await send_email(
        to_email, "report_ready",
        {
            "first_name": user["first_name"],
            "farm_name": farm["name"],
            "overall_score": analysis.get("overall_score", "N/A"),
            "grade": analysis.get("soil_health_grade", "N/A"),
            "fertility_class": analysis.get("fertility_class", "N/A"),
            "eu_compliance_status": status,
            "compliance_badge": badge,
            "rec_count": len(analysis.get("fertilizer_recommendations", [])),
        },
        attachment_bytes=pdf_bytes,
        attachment_filename=f"SoilIntelligence_Report_{farm['name'].replace(' ', '_')}.pdf",
    )

async def send_welcome(to_email: str, user: dict):
    await send_email(to_email, "welcome", {"first_name": user["first_name"], "email": to_email})

async def send_compliance_reminder(to_email: str, farm: dict, user: dict, deadline: str, days_remaining: int, status: str):
    await send_email(to_email, "compliance_reminder", {
        "first_name": user["first_name"],
        "farm_name": farm["name"],
        "deadline": deadline,
        "days_remaining": days_remaining,
        "status": status,
    })
