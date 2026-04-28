"""
Celery Task Implementations
Each task runs in a separate worker process, decoupled from the API.
"""

import asyncio
import logging
from datetime import datetime, timedelta

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def run_async(coro):
    """Helper: run an async coroutine inside a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="app.tasks.celery_tasks.run_soil_analysis",
                 max_retries=3, default_retry_delay=30)
def run_soil_analysis(self, order_id: str):
    """
    Run AI soil analysis pipeline for a completed order.
    Triggered when order status → data_uploaded.
    """
    async def _run():
        from app.core.database import AsyncSessionLocal
        from app.api.routes.ai_analysis import _run_analysis_background
        async with AsyncSessionLocal() as db:
            await _run_analysis_background(order_id, db)

    try:
        logger.info(f"[TASK] run_soil_analysis: order_id={order_id}")
        run_async(_run())
        logger.info(f"[TASK] run_soil_analysis COMPLETE: order_id={order_id}")
    except Exception as exc:
        logger.error(f"[TASK] run_soil_analysis FAILED: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(bind=True, name="app.tasks.celery_tasks.generate_pdf_report",
                 max_retries=2, default_retry_delay=60)
def generate_pdf_report(self, order_id: str):
    """
    Generate PDF report after AI analysis completes.
    Stores PDF in S3 and updates the reports table.
    """
    async def _run():
        from app.core.database import AsyncSessionLocal
        from sqlalchemy import select
        from app.models.models import AIAnalysis, Order, Farm, Report, User
        from app.services.pdf_report_generator import generate_soil_report
        from app.services.email_service import send_report_ready
        import uuid

        async with AsyncSessionLocal() as db:
            # Fetch all required data
            analysis_result = await db.execute(
                select(AIAnalysis).where(AIAnalysis.order_id == order_id)
            )
            analysis = analysis_result.scalar_one_or_none()
            if not analysis:
                logger.warning(f"No analysis found for order {order_id}")
                return

            order_result = await db.execute(select(Order).where(Order.id == order_id))
            order = order_result.scalar_one()

            farm_result = await db.execute(select(Farm).where(Farm.id == order.farm_id))
            farm = farm_result.scalar_one()

            user_result = await db.execute(select(User).where(User.id == order.farmer_id))
            user = user_result.scalar_one()

            # Build dicts for report generator
            analysis_dict = {
                "overall_score": float(analysis.overall_score or 0),
                "soil_health_grade": analysis.soil_health_grade,
                "fertility_class": analysis.fertility_class,
                "npk_balance_score": float(analysis.npk_balance_score or 0),
                "ph_score": float(analysis.ph_score or 0),
                "moisture_score": float(analysis.moisture_score or 0),
                "eu_compliance_score": float(analysis.eu_compliance_score or 0),
                "deficiencies": analysis.deficiencies or [],
                "excesses": analysis.excesses or [],
                "anomalies": analysis.anomalies or [],
                "fertilizer_recommendations": analysis.fertilizer_recommendations or [],
                "lime_recommendation_kg_ha": float(analysis.lime_recommendation_kg_ha) if analysis.lime_recommendation_kg_ha else None,
                "crop_suitability": analysis.crop_suitability or [],
                "optimal_crops": analysis.optimal_crops or [],
                "crop_rotation_recommendation": analysis.crop_rotation_recommendation or [],
                "eu_compliance_status": str(analysis.eu_compliance_status.value) if analysis.eu_compliance_status else "pending_assessment",
                "compliance_gaps": analysis.compliance_gaps or [],
                "compliance_actions": analysis.compliance_actions or [],
                "summary_text": analysis.summary_text or "",
                "detailed_narrative": analysis.detailed_narrative or "",
                "confidence_score": float(analysis.confidence_score or 0),
            }
            farm_dict = {
                "name": farm.name,
                "district": farm.district or "",
                "municipality": farm.municipality or "",
                "total_area_ha": float(farm.total_area_ha),
                "primary_crop": farm.primary_crop or "Winter Wheat",
            }
            order_dict = {
                "order_number": order.order_number,
                "package": order.package.value,
                "id": str(order.id),
            }

            # Generate PDF bytes
            pdf_bytes = generate_soil_report(analysis_dict, farm_dict, order_dict, user.language or "en")

            # TODO: Upload to S3
            # s3_key = f"reports/{order.order_number}.pdf"
            # s3_url = upload_to_s3(pdf_bytes, s3_key)
            s3_url = None  # Placeholder until S3 is configured

            # Determine report number
            from sqlalchemy import func
            count_result = await db.execute(select(func.count(Report.id)))
            count = count_result.scalar() or 0
            report_number = f"RPT-{datetime.utcnow().year}-{str(count + 1).zfill(5)}"

            # Save report record
            report = Report(
                order_id=order_id,
                report_number=report_number,
                pdf_url=s3_url,
                pdf_size_kb=len(pdf_bytes) // 1024,
                delivered_at=datetime.utcnow(),
                includes_compliance=True,
            )
            db.add(report)

            # Update order status
            from sqlalchemy import update
            from app.models.models import OrderStatus
            await db.execute(
                update(Order).where(Order.id == order_id)
                .values(status=OrderStatus.report_generated)
            )

            await db.commit()

            # Send email with PDF
            user_dict = {"first_name": user.first_name, "last_name": user.last_name}
            await send_report_ready(user.email, analysis_dict, farm_dict, user_dict, pdf_bytes)
            logger.info(f"[TASK] generate_pdf_report COMPLETE: {report_number}")

    try:
        run_async(_run())
    except Exception as exc:
        logger.error(f"[TASK] generate_pdf_report FAILED: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(name="app.tasks.celery_tasks.send_email_task")
def send_email_task(to_email: str, template_key: str, context: dict):
    """Send a transactional email in the background."""
    async def _run():
        from app.services.email_service import send_email
        await send_email(to_email, template_key, context)

    run_async(_run())


@celery_app.task(name="app.tasks.celery_tasks.check_compliance_deadlines")
def check_compliance_deadlines():
    """
    Daily job: find farms with compliance deadlines within 30 days
    and send reminder emails to their owners.
    """
    async def _run():
        from app.core.database import AsyncSessionLocal
        from sqlalchemy import select, and_
        from app.models.models import ComplianceRecord, Farm, User
        from app.services.email_service import send_compliance_reminder

        async with AsyncSessionLocal() as db:
            deadline_threshold = datetime.utcnow() + timedelta(days=30)
            result = await db.execute(
                select(ComplianceRecord, Farm, User)
                .join(Farm, Farm.id == ComplianceRecord.farm_id)
                .join(User, User.id == Farm.owner_id)
                .where(
                    and_(
                        ComplianceRecord.deadline <= deadline_threshold,
                        ComplianceRecord.deadline >= datetime.utcnow(),
                        ComplianceRecord.soil_health_report_submitted.is_(False),
                    )
                )
            )
            rows = result.all()
            logger.info(f"[TASK] check_compliance_deadlines: {len(rows)} reminders to send")

            for record, farm, user in rows:
                days_remaining = (record.deadline - datetime.utcnow()).days
                await send_compliance_reminder(
                    to_email=user.email,
                    farm={"name": farm.name},
                    user={"first_name": user.first_name},
                    deadline=record.deadline.strftime("%d %B %Y"),
                    days_remaining=days_remaining,
                    status=str(record.status.value),
                )

    run_async(_run())
