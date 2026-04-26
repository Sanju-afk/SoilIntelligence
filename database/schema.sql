-- ============================================================
-- Soil Intelligence — Production PostgreSQL Schema
-- EU-Compliant AgriTech Platform
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";         -- Geospatial queries
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Fuzzy text search

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'farmer', 'worker', 'agronomist', 'admin', 'super_admin'
);

CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'worker_assigned', 'sensor_dispatched',
  'field_work_started', 'field_work_complete', 'data_uploaded',
  'ai_analysis_running', 'report_generated', 'delivered', 'cancelled'
);

CREATE TYPE service_package AS ENUM (
  'starter_1ha', 'standard_5ha', 'professional_10ha', 'enterprise'
);

CREATE TYPE compliance_status AS ENUM (
  'compliant', 'partial', 'non_compliant', 'pending_assessment'
);

CREATE TYPE worker_task_status AS ENUM (
  'assigned', 'accepted', 'equipment_collected', 'en_route',
  'on_site', 'sampling_complete', 'equipment_returned', 'completed', 'failed'
);

-- ── Users ─────────────────────────────────────────────────────

CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email                 VARCHAR(255) UNIQUE NOT NULL,
  hashed_password       VARCHAR(255) NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  phone                 VARCHAR(20),
  role                  user_role NOT NULL DEFAULT 'farmer',
  language              VARCHAR(5) DEFAULT 'lt',
  is_active             BOOLEAN DEFAULT TRUE,
  is_verified           BOOLEAN DEFAULT FALSE,
  verification_token    VARCHAR(255),
  reset_token           VARCHAR(255),
  reset_token_expires   TIMESTAMPTZ,
  avatar_url            VARCHAR(500),
  metadata              JSONB DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ── Farms ─────────────────────────────────────────────────────

CREATE TABLE farms (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                  VARCHAR(200) NOT NULL,
  location_lat          NUMERIC(10, 8) NOT NULL,
  location_lng          NUMERIC(11, 8) NOT NULL,
  geom                  GEOGRAPHY(POINT, 4326),   -- PostGIS point
  address               TEXT,
  district              VARCHAR(100),
  municipality          VARCHAR(100),
  total_area_ha         NUMERIC(10, 2) NOT NULL,
  cadastral_number      VARCHAR(50),
  primary_crop          VARCHAR(100),
  crop_rotation         JSONB DEFAULT '[]'::jsonb,
  soil_type             VARCHAR(100),
  organic_certified     BOOLEAN DEFAULT FALSE,
  eu_farm_id            VARCHAR(50),
  geojson_boundary      JSONB,                     -- GeoJSON polygon for heatmaps
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_farms_owner ON farms(owner_id);
CREATE INDEX idx_farms_geom ON farms USING GIST(geom);

-- ── Workers ───────────────────────────────────────────────────

CREATE TABLE workers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workis_id             VARCHAR(100),
  verified              BOOLEAN DEFAULT FALSE,
  verified_soil_tech    BOOLEAN DEFAULT FALSE,
  region                VARCHAR(100),
  district              VARCHAR(100),
  vehicle_type          VARCHAR(50),
  completed_tasks       INTEGER DEFAULT 0,
  rating                NUMERIC(3, 2) DEFAULT 0,
  is_available          BOOLEAN DEFAULT TRUE,
  last_active           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────

CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number          VARCHAR(20) UNIQUE NOT NULL,     -- SI-2025-00001
  farmer_id             UUID NOT NULL REFERENCES users(id),
  farm_id               UUID NOT NULL REFERENCES farms(id),
  package               service_package NOT NULL,
  status                order_status NOT NULL DEFAULT 'pending',

  base_price            NUMERIC(10, 2) NOT NULL,
  vat_amount            NUMERIC(10, 2) DEFAULT 0,
  discount_amount       NUMERIC(10, 2) DEFAULT 0,
  total_price           NUMERIC(10, 2) NOT NULL,
  currency              CHAR(3) DEFAULT 'EUR',

  preferred_date        TIMESTAMPTZ,
  scheduled_date        TIMESTAMPTZ,
  completed_date        TIMESTAMPTZ,
  deadline_date         TIMESTAMPTZ,

  sampling_points       INTEGER DEFAULT 5,
  sampling_depth_cm     INTEGER DEFAULT 30,
  special_instructions  TEXT,

  assigned_worker_id    UUID REFERENCES workers(id),
  sensor_kit_id         VARCHAR(50),

  workis_task_id        VARCHAR(100),
  workis_task_url       VARCHAR(500),

  outbound_tracking     VARCHAR(100),
  return_tracking       VARCHAR(100),
  parcel_locker_id      VARCHAR(50),

  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ── Worker Tasks ──────────────────────────────────────────────

CREATE TABLE worker_tasks (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id                  UUID NOT NULL REFERENCES orders(id),
  worker_id                 UUID NOT NULL REFERENCES workers(id),
  status                    worker_task_status DEFAULT 'assigned',

  accepted_at               TIMESTAMPTZ,
  equipment_collected_at    TIMESTAMPTZ,
  arrived_at_farm_at        TIMESTAMPTZ,
  sampling_started_at       TIMESTAMPTZ,
  sampling_completed_at     TIMESTAMPTZ,
  equipment_returned_at     TIMESTAMPTZ,

  farm_arrival_lat          NUMERIC(10, 8),
  farm_arrival_lng          NUMERIC(11, 8),
  farm_arrival_photo_url    VARCHAR(500),
  completion_photo_url      VARCHAR(500),
  equipment_return_photo_url VARCHAR(500),

  worker_notes              TEXT,
  issues_reported           JSONB DEFAULT '[]'::jsonb,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sensor Readings ───────────────────────────────────────────

CREATE TABLE sensor_readings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL REFERENCES orders(id),
  farm_id               UUID NOT NULL REFERENCES farms(id),
  sensor_kit_id         VARCHAR(50),
  sensor_serial         VARCHAR(100),
  sampling_point        INTEGER,

  latitude              NUMERIC(10, 8),
  longitude             NUMERIC(11, 8),
  depth_cm              INTEGER DEFAULT 30,

  -- 7-in-1 LoRaWAN sensor parameters
  nitrogen_mg_kg        NUMERIC(8, 2),
  phosphorus_mg_kg      NUMERIC(8, 2),
  potassium_mg_kg       NUMERIC(8, 2),
  ph_value              NUMERIC(5, 2),
  ec_us_cm              NUMERIC(8, 2),
  moisture_percent      NUMERIC(5, 2),
  temperature_c         NUMERIC(5, 2),

  signal_quality        INTEGER,
  data_quality_score    NUMERIC(5, 2),
  anomaly_detected      BOOLEAN DEFAULT FALSE,
  anomaly_flags         JSONB DEFAULT '[]'::jsonb,
  raw_payload           JSONB,

  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_readings_order ON sensor_readings(order_id);
CREATE INDEX idx_readings_farm ON sensor_readings(farm_id);

-- ── AI Analysis ───────────────────────────────────────────────

CREATE TABLE ai_analyses (
  id                            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id                      UUID UNIQUE NOT NULL REFERENCES orders(id),

  soil_health_score             NUMERIC(5, 2),
  npk_balance_score             NUMERIC(5, 2),
  ph_score                      NUMERIC(5, 2),
  moisture_score                NUMERIC(5, 2),
  eu_compliance_score           NUMERIC(5, 2),
  overall_score                 NUMERIC(5, 2),
  soil_health_grade             VARCHAR(2),
  fertility_class               VARCHAR(50),

  deficiencies                  JSONB DEFAULT '[]'::jsonb,
  excesses                      JSONB DEFAULT '[]'::jsonb,
  anomalies                     JSONB DEFAULT '[]'::jsonb,

  fertilizer_recommendations    JSONB DEFAULT '[]'::jsonb,
  lime_recommendation_kg_ha     NUMERIC(8, 2),
  organic_matter_recommendation TEXT,
  irrigation_notes              TEXT,

  crop_suitability              JSONB DEFAULT '[]'::jsonb,
  optimal_crops                 JSONB DEFAULT '[]'::jsonb,
  crop_rotation_recommendation  JSONB DEFAULT '[]'::jsonb,

  eu_compliance_status          compliance_status,
  compliance_gaps               JSONB DEFAULT '[]'::jsonb,
  compliance_actions            JSONB DEFAULT '[]'::jsonb,

  summary_text                  TEXT,
  detailed_narrative            TEXT,
  confidence_score              NUMERIC(5, 2),
  model_version                 VARCHAR(20) DEFAULT '1.0.0',
  processed_at                  TIMESTAMPTZ,

  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reports ───────────────────────────────────────────────────

CREATE TABLE reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID UNIQUE NOT NULL REFERENCES orders(id),
  report_number         VARCHAR(20) UNIQUE NOT NULL,   -- RPT-2025-00001
  report_type           VARCHAR(50) DEFAULT 'full_diagnostic',
  language              VARCHAR(5) DEFAULT 'lt',
  pdf_url               VARCHAR(500),
  pdf_size_kb           INTEGER,
  s3_key                VARCHAR(500),
  delivered_at          TIMESTAMPTZ,
  downloaded_count      INTEGER DEFAULT 0,
  emailed_at            TIMESTAMPTZ,
  includes_compliance   BOOLEAN DEFAULT TRUE,
  includes_consultation BOOLEAN DEFAULT FALSE,
  includes_heatmap      BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Consultations ─────────────────────────────────────────────

CREATE TABLE consultations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id             UUID NOT NULL REFERENCES users(id),
  order_id              UUID REFERENCES orders(id),
  agronomist_id         UUID REFERENCES users(id),
  consultation_type     VARCHAR(50),
  status                VARCHAR(20) DEFAULT 'scheduled',
  scheduled_at          TIMESTAMPTZ,
  duration_minutes      INTEGER DEFAULT 30,
  meeting_url           VARCHAR(500),
  notes                 TEXT,
  summary               TEXT,
  action_items          JSONB DEFAULT '[]'::jsonb,
  recording_url         VARCHAR(500),
  rating                INTEGER CHECK (rating BETWEEN 1 AND 5),
  farmer_feedback       TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payments ──────────────────────────────────────────────────

CREATE TABLE payments (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id                  UUID UNIQUE NOT NULL REFERENCES orders(id),
  farmer_id                 UUID NOT NULL REFERENCES users(id),
  amount                    NUMERIC(10, 2) NOT NULL,
  currency                  CHAR(3) DEFAULT 'EUR',
  status                    VARCHAR(20) DEFAULT 'pending',
  payment_method            VARCHAR(30),
  stripe_payment_intent_id  VARCHAR(100),
  stripe_charge_id          VARCHAR(100),
  paid_at                   TIMESTAMPTZ,
  invoice_number            VARCHAR(20),
  invoice_url               VARCHAR(500),
  vat_percent               NUMERIC(5, 2) DEFAULT 21,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);

-- ── Compliance Records ────────────────────────────────────────

CREATE TABLE compliance_records (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id                         UUID NOT NULL REFERENCES farms(id),
  order_id                        UUID REFERENCES orders(id),
  reporting_year                  INTEGER NOT NULL,
  reporting_period                VARCHAR(20),
  status                          compliance_status DEFAULT 'pending_assessment',
  eu_directive                    VARCHAR(100) DEFAULT 'EU Soil Monitoring Law 2025',
  compliance_score                NUMERIC(5, 2),
  nitrogen_balance_kg_ha          NUMERIC(8, 2),
  phosphorus_balance_kg_ha        NUMERIC(8, 2),
  nitrate_vulnerable_zone         BOOLEAN DEFAULT FALSE,
  nutrient_plan_submitted         BOOLEAN DEFAULT FALSE,
  soil_health_report_submitted    BOOLEAN DEFAULT FALSE,
  submission_date                 TIMESTAMPTZ,
  submission_reference            VARCHAR(100),
  submitted_to_authority          VARCHAR(200),
  gaps                            JSONB DEFAULT '[]'::jsonb,
  required_actions                JSONB DEFAULT '[]'::jsonb,
  deadline                        TIMESTAMPTZ,
  created_at                      TIMESTAMPTZ DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Subscriptions ─────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id                 UUID NOT NULL REFERENCES users(id),
  plan                      VARCHAR(50) NOT NULL,
  status                    VARCHAR(20) DEFAULT 'active',
  stripe_subscription_id    VARCHAR(100),
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN DEFAULT FALSE,
  tests_remaining           INTEGER DEFAULT 0,
  consultations_remaining   INTEGER DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notifications ─────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50),
  title       VARCHAR(200),
  message     TEXT,
  read        BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  action_url  VARCHAR(500),
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- ── Updated_at Trigger ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','farms','orders','worker_tasks','ai_analyses','reports','consultations','payments','compliance_records','subscriptions']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END $$;

-- ── Seed: Admin User ──────────────────────────────────────────

INSERT INTO users (email, hashed_password, first_name, last_name, role, is_active, is_verified)
VALUES (
  'admin@soilintelligence.lt',
  '$2b$12$placeholder_hash_change_before_deploy',
  'Admin', 'Soil Intelligence',
  'super_admin', TRUE, TRUE
) ON CONFLICT DO NOTHING;
