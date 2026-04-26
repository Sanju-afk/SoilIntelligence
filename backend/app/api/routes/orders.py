"""
Orders Routes — full service order lifecycle management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.models import Order, Farm, User, OrderStatus, ServicePackage

router = APIRouter()

PACKAGE_PRICING = {
    "starter_1ha":        {"price": 50.00,  "area_ha": 1,   "sampling_points": 3},
    "standard_5ha":       {"price": 120.00, "area_ha": 5,   "sampling_points": 7},
    "professional_10ha":  {"price": 150.00, "area_ha": 10,  "sampling_points": 12},
    "enterprise":         {"price": 350.00, "area_ha": 50,  "sampling_points": 25},
}


class CreateOrderRequest(BaseModel):
    farm_id: str
    package: str
    preferred_date: Optional[datetime] = None
    special_instructions: Optional[str] = None


class UpdateOrderStatusRequest(BaseModel):
    status: str
    notes: Optional[str] = None


@router.post("/", status_code=201)
async def create_order(
    data: CreateOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.package not in PACKAGE_PRICING:
        raise HTTPException(status_code=400, detail="Invalid service package")

    farm_result = await db.execute(
        select(Farm).where(Farm.id == data.farm_id, Farm.owner_id == current_user.id)
    )
    farm = farm_result.scalar_one_or_none()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    pkg = PACKAGE_PRICING[data.package]
    vat = round(pkg["price"] * 0.21, 2)

    # Generate order number
    count_result = await db.execute(select(func.count(Order.id)))
    count = count_result.scalar() or 0
    order_number = f"SI-{datetime.utcnow().year}-{str(count + 1).zfill(5)}"

    order = Order(
        order_number=order_number,
        farmer_id=current_user.id,
        farm_id=data.farm_id,
        package=ServicePackage[data.package],
        status=OrderStatus.pending,
        base_price=pkg["price"],
        vat_amount=vat,
        total_price=pkg["price"] + vat,
        sampling_points=pkg["sampling_points"],
        preferred_date=data.preferred_date,
        special_instructions=data.special_instructions,
        deadline_date=None,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return {"order_id": str(order.id), "order_number": order.order_number, "status": order.status}


@router.get("/my-orders")
async def get_my_orders(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Order).where(Order.farmer_id == current_user.id)
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()
    return {"orders": orders, "page": page, "limit": limit}


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if str(order.farmer_id) != str(current_user.id) and current_user.role.value not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    data: UpdateOrderStatusRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Admin: advance order status through the workflow."""
    try:
        new_status = OrderStatus[data.status]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid status")

    await db.execute(
        update(Order).where(Order.id == order_id).values(status=new_status)
    )
    await db.commit()
    return {"message": "Status updated", "new_status": new_status}


@router.get("/admin/all")
async def admin_get_all_orders(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 25,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Admin: list all orders with pagination and filters."""
    query = select(Order)
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    count_result = await db.execute(select(func.count(Order.id)))
    total = count_result.scalar()

    return {"orders": orders, "total": total, "page": page, "limit": limit}
