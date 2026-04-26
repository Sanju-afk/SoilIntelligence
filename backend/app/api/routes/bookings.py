from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Consultation

router = APIRouter()

class BookConsultationRequest(BaseModel):
    consultation_type: str = "video"
    scheduled_at: datetime
    order_id: Optional[str] = None

@router.post("/", status_code=201)
async def book_consultation(data: BookConsultationRequest, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    c = Consultation(farmer_id=current_user.id, **data.dict())
    db.add(c); await db.commit(); await db.refresh(c)
    return c

@router.get("/my-consultations")
async def my_consultations(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from sqlalchemy import select
    result = await db.execute(select(Consultation).where(Consultation.farmer_id == current_user.id))
    return result.scalars().all()
