"""
Analytics Routes — admin dashboard data
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.models import Order, User, Farm, Payment, Report, AIAnalysis

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    """Main admin analytics dashboard data."""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)
    week_start = now - timedelta(days=7)

    # Total counts
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar()
    total_farms = (await db.execute(select(func.count(Farm.id)))).scalar()
    total_reports = (await db.execute(select(func.count(Report.id)))).scalar()

    # Revenue
    revenue_result = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == "paid")
    )
    total_revenue = float(revenue_result.scalar() or 0)

    monthly_revenue_result = await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.status == "paid",
            Payment.paid_at >= month_start,
        )
    )
    monthly_revenue = float(monthly_revenue_result.scalar() or 0)

    # Orders this week
    weekly_orders_result = await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= week_start)
    )
    weekly_orders = weekly_orders_result.scalar()

    # Orders by status
    status_result = await db.execute(
        select(Order.status, func.count(Order.id)).group_by(Order.status)
    )
    orders_by_status = {str(row[0]): row[1] for row in status_result.all()}

    # Orders by package
    package_result = await db.execute(
        select(Order.package, func.count(Order.id)).group_by(Order.package)
    )
    orders_by_package = {str(row[0]): row[1] for row in package_result.all()}

    # Average soil health score
    avg_score_result = await db.execute(
        select(func.avg(AIAnalysis.overall_score))
    )
    avg_score = round(float(avg_score_result.scalar() or 0), 1)

    # New users this month
    new_users_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= month_start)
    )
    new_users_this_month = new_users_result.scalar()

    return {
        "summary": {
            "total_users": total_users,
            "total_orders": total_orders,
            "total_farms": total_farms,
            "total_reports": total_reports,
            "total_revenue_eur": total_revenue,
            "monthly_revenue_eur": monthly_revenue,
            "weekly_orders": weekly_orders,
            "average_soil_health_score": avg_score,
            "new_users_this_month": new_users_this_month,
        },
        "orders_by_status": orders_by_status,
        "orders_by_package": orders_by_package,
        "generated_at": now.isoformat(),
    }


@router.get("/revenue")
async def revenue_analytics(
    period: str = "monthly",   # weekly / monthly / yearly
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    """Revenue breakdown by period."""
    if period == "weekly":
        trunc = "day"
        since = datetime.utcnow() - timedelta(days=30)
    elif period == "monthly":
        trunc = "month"
        since = datetime.utcnow() - timedelta(days=365)
    else:
        trunc = "year"
        since = datetime.utcnow() - timedelta(days=1825)

    result = await db.execute(text(f"""
        SELECT
            date_trunc('{trunc}', paid_at) AS period,
            SUM(amount) AS revenue,
            COUNT(*) AS transactions
        FROM payments
        WHERE status = 'paid' AND paid_at >= :since
        GROUP BY 1
        ORDER BY 1
    """), {"since": since})

    rows = result.fetchall()
    return [{"period": str(r[0]), "revenue": float(r[1]), "transactions": int(r[2])} for r in rows]


@router.get("/farmer-activity")
async def farmer_activity(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin),
):
    """Top active farmers by order volume."""
    result = await db.execute(text("""
        SELECT u.first_name, u.last_name, u.email,
               COUNT(o.id) AS total_orders,
               SUM(o.total_price) AS total_spent,
               MAX(o.created_at) AS last_order
        FROM users u
        JOIN orders o ON u.id = o.farmer_id
        GROUP BY u.id
        ORDER BY total_orders DESC
        LIMIT 20
    """))
    rows = result.fetchall()
    return [
        {
            "name": f"{r[0]} {r[1]}",
            "email": r[2],
            "total_orders": r[3],
            "total_spent_eur": float(r[4] or 0),
            "last_order": str(r[5]),
        }
        for r in rows
    ]
