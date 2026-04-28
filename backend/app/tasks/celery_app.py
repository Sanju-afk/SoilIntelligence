"""
Celery Application & Task Definitions
Background jobs: AI analysis, PDF generation, email delivery
"""

from celery import Celery
from app.core.config import settings

# ─────────────────────────────────────────
# Celery App
# ─────────────────────────────────────────

celery_app = Celery(
    "soil_intelligence",
    broker=settings.REDIS_URL if hasattr(settings, "REDIS_URL") else "redis://localhost:6379",
    backend=settings.REDIS_URL if hasattr(settings, "REDIS_URL") else "redis://localhost:6379",
    include=["app.tasks.celery_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Vilnius",
    enable_utc=True,
    task_track_started=True,
    task_routes={
        "app.tasks.celery_tasks.run_soil_analysis": {"queue": "analysis"},
        "app.tasks.celery_tasks.generate_pdf_report": {"queue": "reports"},
        "app.tasks.celery_tasks.send_email_task": {"queue": "default"},
    },
    beat_schedule={
        # Daily compliance deadline reminder check at 08:00 Vilnius time
        "check-compliance-deadlines": {
            "task": "app.tasks.celery_tasks.check_compliance_deadlines",
            "schedule": 86400.0,
        },
    },
)
