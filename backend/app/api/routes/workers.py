"""
Workers Routes — WORKIS-style field technician task flow
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin, get_current_worker
from app.models.models import Worker, WorkerTask, Order, WorkerTaskStatus, OrderStatus, User

router = APIRouter()


class AcceptTaskRequest(BaseModel):
    task_id: str


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    notes: Optional[str] = None


class StepUpdate(BaseModel):
    step: str           # equipment_collected | arrived_at_farm | sampling_started | sampling_completed | equipment_returned
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None


STEP_TO_STATUS = {
    "equipment_collected": WorkerTaskStatus.equipment_collected,
    "arrived_at_farm": WorkerTaskStatus.on_site,
    "sampling_started": WorkerTaskStatus.on_site,
    "sampling_completed": WorkerTaskStatus.sampling_complete,
    "equipment_returned": WorkerTaskStatus.equipment_returned,
}

STEP_TO_ORDER_STATUS = {
    "equipment_collected": OrderStatus.sensor_dispatched,
    "arrived_at_farm": OrderStatus.field_work_started,
    "sampling_completed": OrderStatus.field_work_complete,
    "equipment_returned": OrderStatus.data_uploaded,
}


@router.get("/my-tasks")
async def get_my_tasks(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_worker),
):
    """Worker: fetch assigned tasks."""
    worker_result = await db.execute(
        select(Worker).where(Worker.user_id == current_user.id)
    )
    worker = worker_result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    query = select(WorkerTask).where(WorkerTask.worker_id == worker.id)
    if status:
        query = query.where(WorkerTask.status == status)
    query = query.order_by(WorkerTask.created_at.desc())
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks


@router.post("/tasks/{task_id}/accept")
async def accept_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_worker),
):
    """Worker: accept an assigned task."""
    task = await _get_task_for_worker(task_id, current_user, db)
    if task.status != WorkerTaskStatus.assigned:
        raise HTTPException(status_code=400, detail="Task is not in 'assigned' state")
    task.status = WorkerTaskStatus.accepted
    task.accepted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Task accepted", "task_id": task_id}


@router.post("/tasks/{task_id}/step")
async def update_task_step(
    task_id: str,
    data: StepUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_worker),
):
    """
    Worker: advance through field work steps.
    Steps: equipment_collected → arrived_at_farm → sampling_started →
           sampling_completed → equipment_returned
    """
    task = await _get_task_for_worker(task_id, current_user, db)

    new_task_status = STEP_TO_STATUS.get(data.step)
    if not new_task_status:
        raise HTTPException(status_code=400, detail=f"Unknown step: {data.step}")

    # Set timestamps
    now = datetime.utcnow()
    if data.step == "equipment_collected":
        task.equipment_collected_at = now
    elif data.step == "arrived_at_farm":
        task.arrived_at_farm_at = now
        if data.latitude:
            task.farm_arrival_lat = data.latitude
            task.farm_arrival_lng = data.longitude
    elif data.step == "sampling_started":
        task.sampling_started_at = now
    elif data.step == "sampling_completed":
        task.sampling_completed_at = now
    elif data.step == "equipment_returned":
        task.equipment_returned_at = now

    if data.notes:
        task.worker_notes = data.notes

    task.status = new_task_status

    # Update linked order status
    new_order_status = STEP_TO_ORDER_STATUS.get(data.step)
    if new_order_status:
        await db.execute(
            update(Order)
            .where(Order.id == task.order_id)
            .values(status=new_order_status)
        )

    await db.commit()
    return {"message": f"Step '{data.step}' confirmed", "task_status": new_task_status}


@router.post("/tasks/{task_id}/complete")
async def complete_task(
    task_id: str,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_worker),
):
    """Worker: mark task as fully complete."""
    task = await _get_task_for_worker(task_id, current_user, db)
    task.status = WorkerTaskStatus.completed
    if notes:
        task.worker_notes = notes

    await db.execute(
        update(Order)
        .where(Order.id == task.order_id)
        .values(status=OrderStatus.data_uploaded, completed_date=datetime.utcnow())
    )

    # Update worker stats
    worker_result = await db.execute(select(Worker).where(Worker.user_id == current_user.id))
    worker = worker_result.scalar_one()
    worker.completed_tasks += 1
    worker.last_active = datetime.utcnow()

    await db.commit()
    return {"message": "Task completed successfully"}


@router.get("/tasks/{task_id}/details")
async def get_task_details(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_worker),
):
    task = await _get_task_for_worker(task_id, current_user, db)
    return task


# ── Admin: Assign Worker to Order ──

@router.post("/assign")
async def assign_worker(
    order_id: str,
    worker_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Admin: assign a verified worker to an order and create task."""
    worker_result = await db.execute(select(Worker).where(Worker.id == worker_id))
    worker = worker_result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    task = WorkerTask(
        order_id=order_id,
        worker_id=worker_id,
        status=WorkerTaskStatus.assigned,
    )
    db.add(task)

    await db.execute(
        update(Order).where(Order.id == order_id).values(
            assigned_worker_id=worker_id,
            status=OrderStatus.worker_assigned,
        )
    )
    await db.commit()
    return {"message": "Worker assigned", "task_id": str(task.id)}


@router.get("/admin/workers")
async def list_workers(
    available_only: bool = False,
    district: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    query = select(Worker)
    if available_only:
        query = query.where(Worker.is_available == True)
    if district:
        query = query.where(Worker.district == district)
    result = await db.execute(query)
    return result.scalars().all()


# ── Helper ──

async def _get_task_for_worker(task_id: str, current_user: User, db: AsyncSession) -> WorkerTask:
    worker_result = await db.execute(select(Worker).where(Worker.user_id == current_user.id))
    worker = worker_result.scalar_one_or_none()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    task_result = await db.execute(
        select(WorkerTask).where(
            WorkerTask.id == task_id,
            WorkerTask.worker_id == worker.id,
        )
    )
    task = task_result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
