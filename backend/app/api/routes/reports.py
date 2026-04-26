from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Report, Order

router = APIRouter()

@router.get("/my-reports")
async def get_my_reports(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(Report).join(Order, Order.id == Report.order_id).where(Order.farmer_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/{report_id}/download")
async def download_report(report_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report: raise HTTPException(404, "Report not found")
    return {"download_url": report.pdf_url, "report_number": report.report_number}
