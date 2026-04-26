"""
AI Analysis Routes — trigger analysis, fetch results
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.ml.soil_analysis_engine import run_soil_analysis
from app.models.models import SensorReading, AIAnalysis, Order, OrderStatus

router = APIRouter()


class TriggerAnalysisRequest(BaseModel):
    order_id: str
    primary_crop: Optional[str] = "winter_wheat"
    force_rerun: Optional[bool] = False


@router.post("/analyze/{order_id}")
async def trigger_analysis(
    order_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    """
    Trigger AI soil analysis for a completed order.
    Runs asynchronously in the background.
    """
    from sqlalchemy import select
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status.value not in ("data_uploaded", "report_generated"):
        raise HTTPException(status_code=400, detail=f"Order status '{order.status}' cannot be analysed yet")

    background_tasks.add_task(_run_analysis_background, order_id, db)
    return {"message": "Analysis queued", "order_id": order_id}


@router.get("/results/{order_id}")
async def get_analysis_results(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Fetch AI analysis results for an order."""
    from sqlalchemy import select
    result = await db.execute(select(AIAnalysis).where(AIAnalysis.order_id == order_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found or not yet complete")
    return analysis


@router.post("/demo-analyze")
async def demo_analyze(
    primary_crop: str = "winter_wheat",
    area_ha: float = 5.0,
):
    """
    Demo endpoint — run analysis on synthetic sample data.
    For testing and investor demos.
    """
    import random
    sample_readings = [
        {
            "nitrogen_mg_kg": random.uniform(60, 140),
            "phosphorus_mg_kg": random.uniform(30, 70),
            "potassium_mg_kg": random.uniform(80, 180),
            "ph_value": random.uniform(5.5, 7.2),
            "ec_us_cm": random.uniform(180, 750),
            "moisture_percent": random.uniform(18, 42),
            "temperature_c": random.uniform(8, 18),
            "sampling_point": i + 1,
        }
        for i in range(5)
    ]
    result = run_soil_analysis(sample_readings, primary_crop=primary_crop, area_ha=area_ha)
    return result


async def _run_analysis_background(order_id: str, db: AsyncSession):
    """Background task: fetch readings, run engine, store results."""
    from sqlalchemy import select, update
    try:
        # Fetch readings
        result = await db.execute(
            select(SensorReading).where(SensorReading.order_id == order_id)
        )
        readings = result.scalars().all()

        # Fetch order for context
        order_result = await db.execute(select(Order).where(Order.id == order_id))
        order = order_result.scalar_one()

        # Build reading dicts
        reading_dicts = [
            {
                "nitrogen_mg_kg": float(r.nitrogen_mg_kg or 0),
                "phosphorus_mg_kg": float(r.phosphorus_mg_kg or 0),
                "potassium_mg_kg": float(r.potassium_mg_kg or 0),
                "ph_value": float(r.ph_value or 6.5),
                "ec_us_cm": float(r.ec_us_cm or 300),
                "moisture_percent": float(r.moisture_percent or 25),
                "temperature_c": float(r.temperature_c or 12),
                "sampling_point": r.sampling_point or 1,
            }
            for r in readings
        ]

        # Get farm details
        from app.models.models import Farm
        farm_result = await db.execute(select(Farm).where(Farm.id == order.farm_id))
        farm = farm_result.scalar_one()

        analysis_data = run_soil_analysis(
            reading_dicts,
            primary_crop=farm.primary_crop or "winter_wheat",
            area_ha=float(farm.total_area_ha),
        )

        # Store result
        ai_analysis = AIAnalysis(
            order_id=order_id,
            soil_health_score=analysis_data["soil_health_score"],
            npk_balance_score=analysis_data["npk_balance_score"],
            ph_score=analysis_data["ph_score"],
            moisture_score=analysis_data["moisture_score"],
            eu_compliance_score=analysis_data["eu_compliance_score"],
            overall_score=analysis_data["overall_score"],
            soil_health_grade=analysis_data["soil_health_grade"],
            fertility_class=analysis_data["fertility_class"],
            deficiencies=analysis_data["deficiencies"],
            excesses=analysis_data["excesses"],
            anomalies=analysis_data["anomalies"],
            fertilizer_recommendations=analysis_data["fertilizer_recommendations"],
            lime_recommendation_kg_ha=analysis_data["lime_recommendation_kg_ha"],
            crop_suitability=analysis_data["crop_suitability"],
            optimal_crops=analysis_data["optimal_crops"],
            crop_rotation_recommendation=analysis_data["crop_rotation_recommendation"],
            eu_compliance_status=analysis_data["eu_compliance_status"],
            compliance_gaps=analysis_data["compliance_gaps"],
            compliance_actions=analysis_data["compliance_actions"],
            summary_text=analysis_data["summary_text"],
            detailed_narrative=analysis_data["detailed_narrative"],
            confidence_score=analysis_data["confidence_score"],
            processed_at=datetime.utcnow(),
        )
        db.add(ai_analysis)

        # Update order status
        await db.execute(
            update(Order)
            .where(Order.id == order_id)
            .values(status=OrderStatus.ai_analysis_running)
        )
        await db.commit()

    except Exception as e:
        logger.error(f"AI analysis failed for order {order_id}: {e}")
        raise


import logging
logger = logging.getLogger(__name__)
