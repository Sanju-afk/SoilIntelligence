# 🌱 Soil Intelligence Platform

> **AI-powered soil diagnostics & EU compliance reporting for Lithuanian SME farmers.**
> Sensor-as-a-Service · No equipment required · Results in 48 hours.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [AI Analysis Engine](#ai-analysis-engine)
- [Service Workflow](#service-workflow)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

Soil Intelligence solves a critical problem for Lithuanian SME farmers: **professional soil diagnostics are too expensive** when they require purchasing precision agriculture sensors (€3,000–15,000+).

Our **Sensor-as-a-Service** model dispatches verified field technicians with LoRaWAN 7-in-1 soil sensors, streams data to our cloud AI engine, and delivers a complete diagnostic report within 48 hours — starting at just €50 per hectare.

### Core Value Propositions

| Problem | Our Solution |
|---------|-------------|
| €3,000–15,000 sensor investment | €50–150 per-test service |
| No agronomic expertise on-farm | AI recommendations + agronomist consultations |
| EU compliance documentation burden | Auto-generated compliance certificates |
| Inefficient fertiliser use | Precision NPK recommendations → 15–20% cost savings |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SOIL INTELLIGENCE PLATFORM                │
├──────────────────┬──────────────────┬───────────────────────┤
│   Next.js 14     │   FastAPI Python  │   AI Analysis Engine  │
│   Frontend       │   REST API        │   (NumPy / sklearn)   │
│   (Farmer,       │   /api/v1/...     │   NPK · pH · EC       │
│    Admin,        │                   │   Anomaly Detection   │
│    Worker UI)    │                   │   Crop Suitability    │
├──────────────────┴──────────────────┴───────────────────────┤
│              PostgreSQL + PostGIS Database                   │
│         Redis (task queue, session cache)                    │
│         MinIO / S3 (PDF report storage)                      │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                       │
│  WORKIS (field worker dispatch) · The Things Network (IoT)  │
│  Omniva (parcel lockers) · Stripe (payments)                │
│  OpenWeatherMap · SendGrid (email) · Mapbox (maps)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with custom design system
- **Framer Motion** for animations
- **Tanstack Query** for server state
- **Zustand** for client state
- **Recharts** for data visualization
- **Mapbox GL** for geospatial maps

### Backend
- **FastAPI** (Python 3.12) with async/await throughout
- **SQLAlchemy 2.0** async ORM
- **asyncpg** PostgreSQL driver
- **Alembic** database migrations
- **Celery** + Redis for background task queue
- **ReportLab** for PDF generation
- **Pydantic v2** for validation

### Infrastructure
- **PostgreSQL 16** + PostGIS extension
- **Redis 7** (queue + cache)
- **MinIO** (local) / **AWS S3** (production)
- **Docker Compose** for local development
- Designed for **AWS ECS** or **Railway** deployment

---

## Project Structure

```
soil-intelligence/
├── frontend/                   # Next.js 14 frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx                    # Landing page
│       │   ├── layout.tsx                  # Root layout
│       │   ├── globals.css                 # Global styles
│       │   ├── dashboard/
│       │   │   ├── page.tsx                # Farmer dashboard
│       │   │   ├── analysis/page.tsx       # AI analysis view
│       │   │   ├── farms/page.tsx          # Farm management
│       │   │   ├── orders/new/page.tsx     # Order booking
│       │   │   ├── reports/page.tsx        # Report downloads
│       │   │   ├── compliance/page.tsx     # EU compliance
│       │   │   └── consultations/page.tsx  # Bookings
│       │   ├── admin/
│       │   │   ├── page.tsx                # Admin dashboard
│       │   │   ├── users/page.tsx          # User management
│       │   │   └── orders/page.tsx         # Order management
│       │   ├── worker/
│       │   │   └── page.tsx                # Worker task panel
│       │   └── auth/
│       │       └── login/page.tsx          # Auth pages
│       ├── components/
│       │   ├── layout/DashboardLayout.tsx  # Sidebar layout
│       │   ├── providers/QueryProvider.tsx
│       │   └── ui/Toaster.tsx
│       └── lib/
│           ├── api.ts                      # Typed API client
│           └── store.ts                    # Zustand auth store
│
├── backend/                    # FastAPI Python backend
│   ├── main.py                             # App entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── app/
│       ├── core/
│       │   ├── config.py                   # Settings (pydantic)
│       │   ├── database.py                 # Async DB engine
│       │   └── security.py                 # JWT auth
│       ├── models/
│       │   └── models.py                   # SQLAlchemy ORM models
│       ├── api/routes/
│       │   ├── auth.py                     # POST /auth/login|register
│       │   ├── users.py                    # GET/PATCH /users/me
│       │   ├── farms.py                    # CRUD /farms
│       │   ├── orders.py                   # Order lifecycle
│       │   ├── workers.py                  # WORKIS task flow
│       │   ├── ai_analysis.py              # AI engine trigger
│       │   ├── analytics.py                # Admin analytics
│       │   ├── reports.py                  # Report downloads
│       │   ├── compliance.py               # EU compliance
│       │   ├── bookings.py                 # Consultations
│       │   ├── payments.py                 # Stripe integration
│       │   └── notifications.py
│       ├── ml/
│       │   └── soil_analysis_engine.py     # AI analysis pipeline
│       └── services/
│           ├── pdf_report_generator.py     # ReportLab PDF
│           └── email_service.py            # Transactional emails
│
├── database/
│   └── schema.sql                          # Production PostgreSQL schema
│
└── docker/
    └── docker-compose.yml                  # Full local dev stack
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/soil-intelligence.git
cd soil-intelligence

# Copy env templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Start with Docker Compose

```bash
cd docker
docker-compose up -d

# Services:
# Frontend:  http://localhost:3000
# API:       http://localhost:8000
# API Docs:  http://localhost:8000/api/docs
# Adminer:   http://localhost:8080
# MinIO:     http://localhost:9001
```

### 3. Manual Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 4. Demo Login Credentials

| Role    | Email                          | Password     |
|---------|--------------------------------|--------------|
| Farmer  | farmer@demo.soilintelligence.lt | demo1234    |
| Admin   | admin@soilintelligence.lt       | admin1234   |
| Worker  | worker@demo.soilintelligence.lt | worker1234  |

---

## API Documentation

Full interactive docs at `http://localhost:8000/api/docs` (Swagger UI).

### Key Endpoints

```
POST   /api/v1/auth/register          Register new farmer
POST   /api/v1/auth/login             JWT login
POST   /api/v1/auth/refresh           Token refresh

GET    /api/v1/users/me               Current user profile
GET    /api/v1/farms/my-farms         List farmer's farms
POST   /api/v1/farms/                 Create new farm

POST   /api/v1/orders/                Place new soil test order
GET    /api/v1/orders/my-orders       Farmer order history
PATCH  /api/v1/orders/:id/status      Admin: advance order status

POST   /api/v1/ai/analyze/:order_id   Trigger AI analysis
GET    /api/v1/ai/results/:order_id   Fetch analysis results
POST   /api/v1/ai/demo-analyze        Demo analysis (no auth)

GET    /api/v1/reports/my-reports     Farmer's PDF reports
GET    /api/v1/compliance/my-compliance EU compliance records

GET    /api/v1/workers/my-tasks       Worker: assigned tasks
POST   /api/v1/workers/tasks/:id/step Worker: advance step
POST   /api/v1/workers/assign         Admin: assign worker

GET    /api/v1/analytics/dashboard    Admin dashboard data
GET    /api/v1/analytics/revenue      Revenue breakdown
```

---

## AI Analysis Engine

The `SoilAnalysisEngine` (`backend/app/ml/soil_analysis_engine.py`) processes raw sensor readings through a 7-stage pipeline:

1. **Data Aggregation** — Average readings across sampling points
2. **Anomaly Detection** — Z-score analysis per parameter (threshold: 2.5σ)
3. **Nutrient Analysis** — Compare NPK vs Lithuanian crop standards (LST ISO)
4. **Soil Health Scoring** — Weighted composite: NPK (40%) + pH (25%) + Moisture (20%) + EC (15%)
5. **EU Compliance Assessment** — Check against EU Soil Monitoring Law thresholds
6. **Recommendation Generation** — Product-specific fertiliser rates with cost estimates
7. **Crop Suitability Prediction** — Score all supported crops against current soil conditions

**Supported Crops:** Winter Wheat, Rapeseed, Spring Barley, Potato, Sugar Beet

**Output Grades:** A+ (≥90) · A (≥80) · B (≥70) · C (≥60) · D (≥50) · F (<50)

---

## Service Workflow

```
Customer Order
      │
      ▼
 Payment Confirmed
      │
      ▼
 WORKIS Task Posted ──── Worker Accepts ────► Sensor Kit Collected (Omniva Locker)
                                                        │
                                                        ▼
                                               Farm Visit + GPS Confirmation
                                                        │
                                                        ▼
                                          7-in-1 LoRaWAN Sensor Deployment
                                          (N · P · K · pH · EC · Moisture · Temp)
                                                        │
                                                        ▼
                                          Real-time Data → The Things Network
                                                        │
                                                        ▼
                                           Sensor Kit Returned (Omniva Locker)
      │
      ▼
 AI Analysis Engine
      │
      ▼
 PDF Report Generated (ReportLab)
      │
      ▼
 Report → S3 Storage
      │
      ▼
 Email Delivery (with PDF attachment)
      │
      ▼
 Dashboard Notification → Farmer Access
```

---

## Database Schema

16 tables covering the complete business domain:

| Table | Purpose |
|-------|---------|
| `users` | All platform users (farmers, workers, admins) |
| `farms` | Farm profiles with PostGIS geospatial data |
| `workers` | Field technician profiles and ratings |
| `orders` | Service order lifecycle management |
| `worker_tasks` | WORKIS-style step-by-step task tracking |
| `sensor_readings` | Raw LoRaWAN sensor data per sampling point |
| `ai_analyses` | Full AI analysis results (JSONB fields) |
| `reports` | Generated PDF metadata and S3 references |
| `consultations` | Agronomist session bookings |
| `payments` | Stripe payment records |
| `compliance_records` | EU Soil Monitoring Law compliance per farm/year |
| `subscriptions` | Recurring plan management |
| `notifications` | In-app and push notification queue |

---

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://soil_user:soil_pass@localhost:5432/soil_intelligence
JWT_SECRET_KEY=your-32-char-random-secret
SECRET_KEY=your-32-char-app-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
S3_BUCKET=soil-intelligence-reports
OPENAI_API_KEY=sk-...
SMTP_PASSWORD=sendgrid-api-key
WORKIS_API_KEY=...
WEATHER_API_KEY=...
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_STRIPE_PK=pk_live_...
```

---

## Deployment

### Production (Railway / AWS ECS)

```bash
# Build backend image
docker build -t soil-intelligence-api ./backend

# Build frontend
cd frontend && npm run build

# Push to registry and deploy via your CI/CD pipeline
```

### Environment Checklist

- [ ] Change all `SECRET_KEY` and `JWT_SECRET_KEY` values
- [ ] Configure real Stripe keys
- [ ] Set up S3 bucket with proper IAM policy
- [ ] Configure SendGrid API key
- [ ] Set `ENVIRONMENT=production` and `DEBUG=false`
- [ ] Enable HTTPS and set `ALLOWED_ORIGINS` correctly
- [ ] Run `alembic upgrade head` before first deploy

---

## Roadmap

- [ ] **v1.1** Mapbox satellite imagery integration for geospatial heatmaps
- [ ] **v1.2** Multi-language support (LT · EN · PL · RU)
- [ ] **v1.3** OpenWeatherMap integration for soil moisture correlation
- [ ] **v1.4** Datacake LoRaWAN dashboard integration
- [ ] **v2.0** Mobile app (React Native)
- [ ] **v2.1** Subscription plans with automated annual testing

---

## License

Proprietary — Soil Intelligence UAB © 2025. All rights reserved.

---

*Built with ❤️ in Kaunas, Lithuania · soilintelligence.lt*
