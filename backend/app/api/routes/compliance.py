from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import ComplianceRecord, Farm

router = APIRouter()

@router.get("/my-compliance")
async def get_compliance(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(ComplianceRecord).join(Farm, Farm.id == ComplianceRecord.farm_id).where(Farm.owner_id == current_user.id)
    )
    return result.scalars().all()
