from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.models import User

router = APIRouter()

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me")
async def update_me(data: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    for k, v in data.items():
        if k not in ("id", "hashed_password", "role") and hasattr(current_user, k):
            setattr(current_user, k, v)
    await db.commit()
    return current_user

@router.get("/admin/list")
async def list_users(page: int = 1, limit: int = 25, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_admin)):
    result = await db.execute(select(User).offset((page-1)*limit).limit(limit))
    return result.scalars().all()
