"""farms.py — Farm management routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Farm, User

router = APIRouter()

class CreateFarmRequest(BaseModel):
    name: str
    location_lat: float
    location_lng: float
    address: Optional[str] = None
    district: Optional[str] = None
    total_area_ha: float
    primary_crop: Optional[str] = None
    organic_certified: bool = False
    cadastral_number: Optional[str] = None
    eu_farm_id: Optional[str] = None
    soil_type: Optional[str] = None

@router.post("/", status_code=201)
async def create_farm(data: CreateFarmRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = Farm(owner_id=current_user.id, **data.dict())
    db.add(farm)
    await db.commit()
    await db.refresh(farm)
    return farm

@router.get("/my-farms")
async def get_my_farms(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Farm).where(Farm.owner_id == current_user.id))
    return result.scalars().all()

@router.get("/{farm_id}")
async def get_farm(farm_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Farm).where(Farm.id == farm_id, Farm.owner_id == current_user.id))
    farm = result.scalar_one_or_none()
    if not farm: raise HTTPException(status_code=404, detail="Farm not found")
    return farm

@router.patch("/{farm_id}")
async def update_farm(farm_id: str, data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Farm).where(Farm.id == farm_id, Farm.owner_id == current_user.id))
    farm = result.scalar_one_or_none()
    if not farm: raise HTTPException(status_code=404, detail="Farm not found")
    for k, v in data.items():
        if hasattr(farm, k): setattr(farm, k, v)
    await db.commit()
    return farm
