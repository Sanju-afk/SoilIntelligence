/**
 * Soil Intelligence — Typed API Client
 * Axios instance with JWT auth, refresh logic, and typed endpoints
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ─────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ─────────────────────────────────────────
// Request Interceptor — Attach Token
// ─────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────
// Response Interceptor — Handle 401 / Refresh
// ─────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        setTokens(data.access_token, data.refresh_token);
        processQueue(null, data.access_token);
        original.headers = { ...original.headers, Authorization: `Bearer ${data.access_token}` };
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────
// Token Helpers
// ─────────────────────────────────────────

const ACCESS_KEY = "si_access_token";
const REFRESH_KEY = "si_refresh_token";

export function getAccessToken()  { return typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY)  : null; }
export function getRefreshToken() { return typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null; }

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "farmer" | "worker" | "agronomist" | "admin" | "super_admin";
  language: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  location_lat: number;
  location_lng: number;
  address?: string;
  district?: string;
  total_area_ha: number;
  primary_crop?: string;
  organic_certified: boolean;
  eu_farm_id?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  farmer_id: string;
  farm_id: string;
  package: "starter_1ha" | "standard_5ha" | "professional_10ha" | "enterprise";
  status: OrderStatus;
  base_price: number;
  vat_amount: number;
  total_price: number;
  currency: string;
  sampling_points: number;
  preferred_date?: string;
  scheduled_date?: string;
  completed_date?: string;
  assigned_worker_id?: string;
  sensor_kit_id?: string;
  special_instructions?: string;
  created_at: string;
}

export type OrderStatus =
  | "pending" | "confirmed" | "worker_assigned" | "sensor_dispatched"
  | "field_work_started" | "field_work_complete" | "data_uploaded"
  | "ai_analysis_running" | "report_generated" | "delivered" | "cancelled";

export interface AIAnalysis {
  id: string;
  order_id: string;
  overall_score: number;
  soil_health_grade: string;
  fertility_class: string;
  npk_balance_score: number;
  ph_score: number;
  moisture_score: number;
  eu_compliance_score: number;
  deficiencies: Deficiency[];
  excesses: Excess[];
  anomalies: Anomaly[];
  fertilizer_recommendations: FertilizerRec[];
  lime_recommendation_kg_ha?: number;
  crop_suitability: CropSuitability[];
  optimal_crops: string[];
  crop_rotation_recommendation: RotationStep[];
  eu_compliance_status: "compliant" | "partial" | "non_compliant" | "pending_assessment";
  compliance_gaps: ComplianceGap[];
  compliance_actions: ComplianceAction[];
  summary_text: string;
  detailed_narrative: string;
  confidence_score: number;
  processed_at: string;
}

export interface Deficiency {
  nutrient: string;
  severity: "critical" | "moderate" | "mild";
  current_value: number;
  optimal_min: number;
  optimal_max: number;
  deficit_percent: number;
}

export interface Excess {
  nutrient: string;
  severity: string;
  current_value: number;
  excess_percent: number;
}

export interface Anomaly {
  parameter: string;
  sampling_point: number;
  value: number;
  field_average: number;
  z_score: number;
  description: string;
}

export interface FertilizerRec {
  nutrient: string;
  product_name: string;
  application_rate_kg_ha: number;
  timing: string;
  priority: "critical" | "high" | "medium" | "low";
  estimated_cost_eur_ha: number;
  justification: string;
}

export interface CropSuitability {
  crop: string;
  suitability_score: number;
  limiting_factors: string[];
  recommendation: string;
}

export interface RotationStep {
  year: number;
  crop: string;
  notes: string;
}

export interface ComplianceGap {
  type: string;
  value: number;
  threshold: number | string;
}

export interface ComplianceAction {
  action: string;
  urgency: string;
  deadline: string;
}

export interface Report {
  id: string;
  order_id: string;
  report_number: string;
  report_type: string;
  language: string;
  pdf_url?: string;
  pdf_size_kb?: number;
  delivered_at?: string;
  downloaded_count: number;
  includes_compliance: boolean;
  created_at: string;
}

export interface WorkerTask {
  id: string;
  order_id: string;
  worker_id: string;
  status: string;
  accepted_at?: string;
  equipment_collected_at?: string;
  arrived_at_farm_at?: string;
  sampling_started_at?: string;
  sampling_completed_at?: string;
  equipment_returned_at?: string;
  worker_notes?: string;
}

export interface Consultation {
  id: string;
  farmer_id: string;
  order_id?: string;
  agronomist_id?: string;
  consultation_type: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string;
  notes?: string;
  summary?: string;
  rating?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  read_at?: string;
  action_url?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ─────────────────────────────────────────
// API Endpoint Functions
// ─────────────────────────────────────────

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", new URLSearchParams({ username: email, password }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) =>
    api.post("/auth/register", data),
  refresh: (refresh_token: string) => api.post("/auth/refresh", { refresh_token }),
  logout: () => api.post("/auth/logout"),
};

// Users
export const userApi = {
  getMe: () => api.get<User>("/users/me"),
  updateMe: (data: Partial<User>) => api.patch<User>("/users/me", data),
  listUsers: (page = 1, limit = 25) => api.get<User[]>(`/users/admin/list?page=${page}&limit=${limit}`),
};

// Farms
export const farmApi = {
  list: () => api.get<Farm[]>("/farms/my-farms"),
  get: (id: string) => api.get<Farm>(`/farms/${id}`),
  create: (data: Partial<Farm>) => api.post<Farm>("/farms/", data),
  update: (id: string, data: Partial<Farm>) => api.patch<Farm>(`/farms/${id}`, data),
};

// Orders
export const orderApi = {
  list: (status?: string, page = 1, limit = 10) =>
    api.get<{ orders: Order[] }>(`/orders/my-orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`),
  get: (id: string) => api.get<Order>(`/orders/${id}`),
  create: (data: { farm_id: string; package: string; preferred_date?: string; special_instructions?: string }) =>
    api.post<Order>("/orders/", data),
  adminListAll: (status?: string, page = 1, limit = 25) =>
    api.get<{ orders: Order[]; total: number }>(`/orders/admin/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/orders/${id}/status`, { status, notes }),
};

// AI Analysis
export const analysisApi = {
  getResults: (orderId: string) => api.get<AIAnalysis>(`/ai/results/${orderId}`),
  triggerAnalysis: (orderId: string) => api.post(`/ai/analyze/${orderId}`),
  demo: (primaryCrop?: string, areaHa?: number) =>
    api.post<AIAnalysis>(`/ai/demo-analyze?primary_crop=${primaryCrop || "winter_wheat"}&area_ha=${areaHa || 5}`),
};

// Reports
export const reportApi = {
  list: () => api.get<Report[]>("/reports/my-reports"),
  getDownloadUrl: (id: string) => api.get<{ download_url: string; report_number: string }>(`/reports/${id}/download`),
};

// Consultations
export const consultationApi = {
  list: () => api.get<Consultation[]>("/bookings/my-consultations"),
  book: (data: { consultation_type: string; scheduled_at: string; order_id?: string }) =>
    api.post<Consultation>("/bookings/", data),
};

// Workers
export const workerApi = {
  myTasks: (status?: string) => api.get<WorkerTask[]>(`/workers/my-tasks${status ? `?status=${status}` : ""}`),
  acceptTask: (taskId: string) => api.post(`/workers/tasks/${taskId}/accept`),
  updateStep: (taskId: string, data: { step: string; latitude?: number; longitude?: number; notes?: string }) =>
    api.post(`/workers/tasks/${taskId}/step`, data),
  completeTask: (taskId: string, notes?: string) =>
    api.post(`/workers/tasks/${taskId}/complete`, { notes }),
  listWorkers: (availableOnly?: boolean, district?: string) =>
    api.get(`/workers/admin/workers?${availableOnly ? "available_only=true&" : ""}${district ? `district=${district}` : ""}`),
  assignWorker: (orderId: string, workerId: string) =>
    api.post("/workers/assign", null, { params: { order_id: orderId, worker_id: workerId } }),
};

// Payments
export const paymentApi = {
  createIntent: (orderId: string) => api.post(`/payments/create-intent/${orderId}`),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get("/analytics/dashboard"),
  revenue: (period?: "weekly" | "monthly" | "yearly") =>
    api.get(`/analytics/revenue?period=${period || "monthly"}`),
  farmerActivity: () => api.get("/analytics/farmer-activity"),
};

// Notifications
export const notificationApi = {
  list: () => api.get<Notification[]>("/notifications/"),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
};

// Compliance
export const complianceApi = {
  myCompliance: () => api.get("/compliance/my-compliance"),
};
