"""
Soil Intelligence API — FastAPI Backend
Startup-grade AgriTech platform for EU-compliant soil diagnostics
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import (
    auth, users, farms, orders, bookings,
    workers, reports, analytics, ai_analysis,
    consultations, payments, compliance, notifications
)

# ─────────────────────────────────────────
# App Bootstrap
# ─────────────────────────────────────────

app = FastAPI(
    title="Soil Intelligence API",
    description="AI-powered soil diagnostics & consultation platform for Lithuanian SME farmers",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ─────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ─────────────────────────────────────────
# Route Registration
# ─────────────────────────────────────────

PREFIX = "/api/v1"

app.include_router(auth.router,           prefix=f"{PREFIX}/auth",          tags=["Authentication"])
app.include_router(users.router,          prefix=f"{PREFIX}/users",          tags=["Users"])
app.include_router(farms.router,          prefix=f"{PREFIX}/farms",          tags=["Farms"])
app.include_router(orders.router,         prefix=f"{PREFIX}/orders",         tags=["Orders"])
app.include_router(bookings.router,       prefix=f"{PREFIX}/bookings",       tags=["Bookings"])
app.include_router(workers.router,        prefix=f"{PREFIX}/workers",        tags=["Workers"])
app.include_router(reports.router,        prefix=f"{PREFIX}/reports",        tags=["Reports"])
app.include_router(analytics.router,      prefix=f"{PREFIX}/analytics",      tags=["Analytics"])
app.include_router(ai_analysis.router,    prefix=f"{PREFIX}/ai",             tags=["AI Analysis"])
app.include_router(consultations.router,  prefix=f"{PREFIX}/consultations",  tags=["Consultations"])
app.include_router(payments.router,       prefix=f"{PREFIX}/payments",       tags=["Payments"])
app.include_router(compliance.router,     prefix=f"{PREFIX}/compliance",     tags=["Compliance"])
app.include_router(notifications.router,  prefix=f"{PREFIX}/notifications",  tags=["Notifications"])

# ─────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "operational", "version": "1.0.0", "platform": "Soil Intelligence"}


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Soil Intelligence API started")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
