"""
SQLAlchemy ORM Models — Full Production Schema
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, Text,
    ForeignKey, Enum, JSON, ARRAY, Numeric, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


# ─────────────────────────────────────────
# Enums
# ─────────────────────────────────────────

class UserRole(str, enum.Enum):
    farmer = "farmer"
    worker = "worker"
    agronomist = "agronomist"
    admin = "admin"
    super_admin = "super_admin"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    worker_assigned = "worker_assigned"
    sensor_dispatched = "sensor_dispatched"
    field_work_started = "field_work_started"
    field_work_complete = "field_work_complete"
    data_uploaded = "data_uploaded"
    ai_analysis_running = "ai_analysis_running"
    report_generated = "report_generated"
    delivered = "delivered"
    cancelled = "cancelled"


class ServicePackage(str, enum.Enum):
    starter_1ha = "starter_1ha"
    standard_5ha = "standard_5ha"
    professional_10ha = "professional_10ha"
    enterprise = "enterprise"


class ComplianceStatus(str, enum.Enum):
    compliant = "compliant"
    partial = "partial"
    non_compliant = "non_compliant"
    pending_assessment = "pending_assessment"


class WorkerTaskStatus(str, enum.Enum):
    assigned = "assigned"
    accepted = "accepted"
    equipment_collected = "equipment_collected"
    en_route = "en_route"
    on_site = "on_site"
    sampling_complete = "sampling_complete"
    equipment_returned = "equipment_returned"
    completed = "completed"
    failed = "failed"


# ─────────────────────────────────────────
# Base Mixin
# ─────────────────────────────────────────

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ─────────────────────────────────────────
# User
# ─────────────────────────────────────────

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), default=UserRole.farmer, nullable=False)
    language = Column(String(5), default="lt")   # lt, en, pl, ru
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255))
    reset_token = Column(String(255))
    reset_token_expires = Column(DateTime(timezone=True))
    avatar_url = Column(String(500))
    metadata_ = Column("metadata", JSONB, default={})

    # Relationships
    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="farmer")
    bookings = relationship("Consultation", back_populates="farmer")
    notifications = relationship("Notification", back_populates="user")
    worker_profile = relationship("Worker", back_populates="user", uselist=False)


# ─────────────────────────────────────────
# Farm
# ─────────────────────────────────────────

class Farm(Base, TimestampMixin):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    location_lat = Column(Numeric(10, 8), nullable=False)
    location_lng = Column(Numeric(11, 8), nullable=False)
    address = Column(Text)
    district = Column(String(100))
    municipality = Column(String(100))
    total_area_ha = Column(Numeric(10, 2), nullable=False)
    cadastral_number = Column(String(50))
    primary_crop = Column(String(100))
    crop_rotation = Column(JSONB, default=[])     # [{year, crop, yield_t_ha}]
    soil_type = Column(String(100))
    organic_certified = Column(Boolean, default=False)
    eu_farm_id = Column(String(50))               # For EU compliance
    geojson_boundary = Column(JSONB)              # GeoJSON polygon for mapping
    notes = Column(Text)

    # Relationships
    owner = relationship("User", back_populates="farms")
    orders = relationship("Order", back_populates="farm")
    soil_readings = relationship("SensorReading", back_populates="farm")
    compliance_records = relationship("ComplianceRecord", back_populates="farm")

    __table_args__ = (
        Index("idx_farms_owner", "owner_id"),
        Index("idx_farms_location", "location_lat", "location_lng"),
    )


# ─────────────────────────────────────────
# Service Order
# ─────────────────────────────────────────

class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(20), unique=True, nullable=False)  # SI-2025-00001
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    package = Column(Enum(ServicePackage), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)

    # Pricing
    base_price = Column(Numeric(10, 2), nullable=False)
    vat_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    total_price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="EUR")

    # Scheduling
    preferred_date = Column(DateTime(timezone=True))
    scheduled_date = Column(DateTime(timezone=True))
    completed_date = Column(DateTime(timezone=True))
    deadline_date = Column(DateTime(timezone=True))

    # Sampling configuration
    sampling_points = Column(Integer, default=5)
    sampling_depth_cm = Column(Integer, default=30)
    special_instructions = Column(Text)

    # Assignment
    assigned_worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id"))
    sensor_kit_id = Column(String(50))

    # WORKIS
    workis_task_id = Column(String(100))
    workis_task_url = Column(String(500))

    # Shipping
    outbound_tracking = Column(String(100))
    return_tracking = Column(String(100))
    parcel_locker_id = Column(String(50))

    notes = Column(Text)

    # Relationships
    farmer = relationship("User", back_populates="orders")
    farm = relationship("Farm", back_populates="orders")
    worker = relationship("Worker", back_populates="assignments")
    payment = relationship("Payment", back_populates="order", uselist=False)
    sensor_readings = relationship("SensorReading", back_populates="order")
    report = relationship("Report", back_populates="order", uselist=False)
    worker_task = relationship("WorkerTask", back_populates="order", uselist=False)

    __table_args__ = (
        Index("idx_orders_farmer", "farmer_id"),
        Index("idx_orders_status", "status"),
    )


# ─────────────────────────────────────────
# Worker Profile
# ─────────────────────────────────────────

class Worker(Base, TimestampMixin):
    __tablename__ = "workers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    workis_id = Column(String(100))
    verified = Column(Boolean, default=False)
    verified_soil_tech = Column(Boolean, default=False)   # Badge
    region = Column(String(100))
    district = Column(String(100))
    vehicle_type = Column(String(50))
    completed_tasks = Column(Integer, default=0)
    rating = Column(Numeric(3, 2), default=0)
    is_available = Column(Boolean, default=True)
    last_active = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="worker_profile")
    assignments = relationship("Order", back_populates="worker")
    tasks = relationship("WorkerTask", back_populates="worker")


# ─────────────────────────────────────────
# Worker Task (WORKIS-style flow)
# ─────────────────────────────────────────

class WorkerTask(Base, TimestampMixin):
    __tablename__ = "worker_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("workers.id"), nullable=False)
    status = Column(Enum(WorkerTaskStatus), default=WorkerTaskStatus.assigned)

    # Step timestamps
    accepted_at = Column(DateTime(timezone=True))
    equipment_collected_at = Column(DateTime(timezone=True))
    arrived_at_farm_at = Column(DateTime(timezone=True))
    sampling_started_at = Column(DateTime(timezone=True))
    sampling_completed_at = Column(DateTime(timezone=True))
    equipment_returned_at = Column(DateTime(timezone=True))

    # Location proof
    farm_arrival_lat = Column(Numeric(10, 8))
    farm_arrival_lng = Column(Numeric(11, 8))
    farm_arrival_photo_url = Column(String(500))
    completion_photo_url = Column(String(500))
    equipment_return_photo_url = Column(String(500))

    # Notes
    worker_notes = Column(Text)
    issues_reported = Column(JSONB, default=[])

    # Relationships
    order = relationship("Order", back_populates="worker_task")
    worker = relationship("Worker", back_populates="tasks")


# ─────────────────────────────────────────
# Sensor Reading
# ─────────────────────────────────────────

class SensorReading(Base, TimestampMixin):
    __tablename__ = "sensor_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    sensor_kit_id = Column(String(50))
    sensor_serial = Column(String(100))
    sampling_point = Column(Integer)        # Point 1-N

    # Coordinates
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    depth_cm = Column(Integer, default=30)

    # Soil Parameters (7-in-1 LoRaWAN sensor)
    nitrogen_mg_kg = Column(Numeric(8, 2))    # N
    phosphorus_mg_kg = Column(Numeric(8, 2))  # P
    potassium_mg_kg = Column(Numeric(8, 2))   # K
    ph_value = Column(Numeric(5, 2))
    ec_us_cm = Column(Numeric(8, 2))          # Electrical Conductivity
    moisture_percent = Column(Numeric(5, 2))
    temperature_c = Column(Numeric(5, 2))

    # Quality
    signal_quality = Column(Integer)          # LoRaWAN RSSI
    data_quality_score = Column(Numeric(5, 2))
    anomaly_detected = Column(Boolean, default=False)
    anomaly_flags = Column(JSONB, default=[])

    # Raw
    raw_payload = Column(JSONB)

    # Relationships
    order = relationship("Order", back_populates="sensor_readings")
    farm = relationship("Farm", back_populates="soil_readings")

    __table_args__ = (
        Index("idx_readings_order", "order_id"),
        Index("idx_readings_farm", "farm_id"),
    )


# ─────────────────────────────────────────
# AI Analysis Result
# ─────────────────────────────────────────

class AIAnalysis(Base, TimestampMixin):
    __tablename__ = "ai_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), unique=True, nullable=False)

    # Scores (0-100)
    soil_health_score = Column(Numeric(5, 2))
    npk_balance_score = Column(Numeric(5, 2))
    ph_score = Column(Numeric(5, 2))
    moisture_score = Column(Numeric(5, 2))
    eu_compliance_score = Column(Numeric(5, 2))
    overall_score = Column(Numeric(5, 2))

    # Classification
    soil_health_grade = Column(String(2))      # A+, A, B, C, D, F
    fertility_class = Column(String(50))       # High / Medium / Low / Critically Low

    # Analysis Results
    deficiencies = Column(JSONB, default=[])    # [{nutrient, severity, value, threshold}]
    excesses = Column(JSONB, default=[])
    anomalies = Column(JSONB, default=[])

    # Recommendations
    fertilizer_recommendations = Column(JSONB, default=[])   # [{product, kg_ha, timing, priority}]
    lime_recommendation_kg_ha = Column(Numeric(8, 2))
    organic_matter_recommendation = Column(Text)
    irrigation_notes = Column(Text)

    # Crop Suitability
    crop_suitability = Column(JSONB, default=[])  # [{crop, suitability_score, notes}]
    optimal_crops = Column(JSONB, default=[])
    crop_rotation_recommendation = Column(JSONB, default=[])

    # EU Compliance
    eu_compliance_status = Column(Enum(ComplianceStatus))
    compliance_gaps = Column(JSONB, default=[])
    compliance_actions = Column(JSONB, default=[])

    # Explainability
    summary_text = Column(Text)
    detailed_narrative = Column(Text)
    confidence_score = Column(Numeric(5, 2))
    model_version = Column(String(20), default="1.0.0")

    processed_at = Column(DateTime(timezone=True))

    order = relationship("Order")


# ─────────────────────────────────────────
# Report
# ─────────────────────────────────────────

class Report(Base, TimestampMixin):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), unique=True, nullable=False)
    report_number = Column(String(20), unique=True, nullable=False)  # RPT-2025-00001

    report_type = Column(String(50), default="full_diagnostic")
    language = Column(String(5), default="lt")
    pdf_url = Column(String(500))
    pdf_size_kb = Column(Integer)
    s3_key = Column(String(500))

    delivered_at = Column(DateTime(timezone=True))
    downloaded_count = Column(Integer, default=0)
    emailed_at = Column(DateTime(timezone=True))

    # Report sections included
    includes_compliance = Column(Boolean, default=True)
    includes_consultation = Column(Boolean, default=False)
    includes_heatmap = Column(Boolean, default=False)

    order = relationship("Order", back_populates="report")


# ─────────────────────────────────────────
# Consultation Booking
# ─────────────────────────────────────────

class Consultation(Base, TimestampMixin):
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    agronomist_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    consultation_type = Column(String(50))   # video / phone / chat / email
    status = Column(String(20), default="scheduled")
    scheduled_at = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer, default=30)

    meeting_url = Column(String(500))
    notes = Column(Text)
    summary = Column(Text)
    action_items = Column(JSONB, default=[])
    recording_url = Column(String(500))
    rating = Column(Integer)
    farmer_feedback = Column(Text)

    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="bookings")
    agronomist = relationship("User", foreign_keys=[agronomist_id])


# ─────────────────────────────────────────
# Payment
# ─────────────────────────────────────────

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), unique=True, nullable=False)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="EUR")
    status = Column(String(20), default="pending")    # pending / paid / failed / refunded

    payment_method = Column(String(30))               # stripe / banklink / invoice
    stripe_payment_intent_id = Column(String(100))
    stripe_charge_id = Column(String(100))

    paid_at = Column(DateTime(timezone=True))
    invoice_number = Column(String(20))
    invoice_url = Column(String(500))
    vat_percent = Column(Numeric(5, 2), default=21)

    order = relationship("Order", back_populates="payment")


# ─────────────────────────────────────────
# EU Compliance Record
# ─────────────────────────────────────────

class ComplianceRecord(Base, TimestampMixin):
    __tablename__ = "compliance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    reporting_year = Column(Integer, nullable=False)
    reporting_period = Column(String(20))

    status = Column(Enum(ComplianceStatus), default=ComplianceStatus.pending_assessment)
    eu_directive = Column(String(100), default="EU Soil Monitoring Law 2025")
    compliance_score = Column(Numeric(5, 2))

    # Nutrient management
    nitrogen_balance_kg_ha = Column(Numeric(8, 2))
    phosphorus_balance_kg_ha = Column(Numeric(8, 2))
    nitrate_vulnerable_zone = Column(Boolean, default=False)

    # Documentation
    nutrient_plan_submitted = Column(Boolean, default=False)
    soil_health_report_submitted = Column(Boolean, default=False)
    submission_date = Column(DateTime(timezone=True))
    submission_reference = Column(String(100))
    submitted_to_authority = Column(String(200))

    gaps = Column(JSONB, default=[])
    required_actions = Column(JSONB, default=[])
    deadline = Column(DateTime(timezone=True))

    farm = relationship("Farm", back_populates="compliance_records")


# ─────────────────────────────────────────
# Subscription Plan
# ─────────────────────────────────────────

class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan = Column(String(50), nullable=False)   # free / basic / pro / enterprise
    status = Column(String(20), default="active")
    stripe_subscription_id = Column(String(100))
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    cancel_at_period_end = Column(Boolean, default=False)
    tests_remaining = Column(Integer, default=0)
    consultations_remaining = Column(Integer, default=0)


# ─────────────────────────────────────────
# Notification
# ─────────────────────────────────────────

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String(50))   # order_update / report_ready / compliance_alert / etc.
    title = Column(String(200))
    message = Column(Text)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    action_url = Column(String(500))
    metadata_ = Column("metadata", JSONB, default={})

    user = relationship("User", back_populates="notifications")
