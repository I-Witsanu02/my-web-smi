export interface ModelInfo {
  id: string;
  display_name: string;
  status: string;
  eligible_age_years?: [number, number];
  input_protocol?: string;
  validation_mae_months?: number;
  validation_rmse_months?: number;
  validation_r2?: number;
  recorded_validation_mae_months?: number;
  reason: string;
  checkpoint_available?: boolean;
}

export interface PredictionResult {
  model_id: string;
  model_name: string;
  predicted_months: number;
  predicted_age: string;
  roi_gate: Record<string, number>;
  validation_mae_months?: number;
  preprocess: string;
  research_only: boolean;
  xai_method?: string;
}

export interface FullHandDetection {
  roi: string;
  confidence: number;
  source?: 'detector' | 'expert_review';
  box: [number, number, number, number];
  crop_data_url: string;
}

export interface FullHandResult {
  inference_id?: string;
  qc_status: 'PASS' | 'REVIEW';
  missing_rois: string[];
  low_confidence_rois: string[];
  detected_count: number;
  detections: FullHandDetection[];
  annotated_image: string;
  full_hand_url: string;
  image_size: [number, number];
  detector: string;
  protocol_warning: string;
  message?: string;
  research_only: boolean;
  xai_image?: string;
  xai_layer?: string;
  xai_metadata?: {version?:string;target_layer?:string;target?:string;flat_rois?:number[];faithfulness_validated?:boolean};
  xai_method?: string;
  prediction?: PredictionResult;
  demo?: boolean;
  image_retained?: boolean;
  anthropometrics_used_by_model?: boolean;
  clinical_disclaimer?: string;
}

export interface PersistedCasesResponse<TCase> {
  cases: TCase[];
  updated_at?: string;
}

export interface LoginResponse {
  authenticated: boolean;
  token: string;
  expires_in_seconds: number;
  user: { name: string; role: string };
}

export interface FeedbackItem {
  id: string;
  case_id: string;
  revision: number;
  status: 'candidate' | 'approved' | 'rejected' | 'blocked_locked_test';
  created: string;
  updated: string;
  actor: string;
  payload: {
    raw_prediction_months: number;
    expert_bone_age_months: number;
    absolute_error_vs_expert_months: number;
    model_id: string;
    source_image_url: string;
    training_eligible: boolean;
    locked_test: boolean;
  };
}

const AUTH_TOKEN_KEY = 'boneage-xai:auth-token';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const externalBackendConfigured = Boolean(API_BASE_URL);
export const backendUnavailableOnHostedFrontend =
  !externalBackendConfigured && !['localhost', '127.0.0.1'].includes(window.location.hostname);

export function apiUrl(path: string): string {
  if (/^(data:|blob:|https?:)/.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getAuthToken(): string {
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY) || '';

}

export function storeAuthToken(token: string, _remember: boolean): void {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(apiUrl(path), { ...init, headers });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('GPU backend is not connected / ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์โมเดล GPU');
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  fetchAsset: async (path: string) => {
    const headers = new Headers();
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(apiUrl(path), { headers });
    if (!response.ok) throw new Error(`Asset request failed (${response.status})`);
    return response.blob();
  },
  login: (username: string, password: string) =>
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  session: () => request<{ authenticated: boolean; user: { name: string; role: string } }>('/api/auth/session'),
  health: () => request<Record<string, unknown>>('/api/health'),
  predictDemo: (
    image: File,
    sex: 'female' | 'male',
    chronologicalAgeMonths: number,
    heightCm?: number,
    weightKg?: number,
  ) => {
    const body = new FormData();
    body.append('image', image);
    body.append('sex', sex);
    body.append('chronological_age_months', String(chronologicalAgeMonths));
    if (heightCm !== undefined) body.append('height_cm', String(heightCm));
    if (weightKg !== undefined) body.append('weight_kg', String(weightKg));
    return request<FullHandResult>('/api/demo/predict', { method: 'POST', body });
  },
  models: () => request<{ default_model: string; models: ModelInfo[]; detector: ModelInfo }>('/api/models'),
  predictFullHand: (
    image: File,
    male: number,
    modelId: string,
    chronologicalAgeMonths: number,
    caseId: string,
    reviewedBoxes?: Record<string, [number, number, number, number]>,
    xaiMethod = 'GradCAM',
    detectOnly = false
  ) => {
    const body = new FormData();
    body.append('image', image);
    body.append('male', String(male));
    body.append('model_id', modelId);
    body.append('chronological_age_months', String(chronologicalAgeMonths));
    body.append('case_id', caseId);
    body.append('xai_method', xaiMethod);
    body.append('detect_only', String(detectOnly));
    if (reviewedBoxes) body.append('reviewed_boxes', JSON.stringify(reviewedBoxes));
    return request<FullHandResult>('/api/predict/full-hand', { method: 'POST', body });
  },
  saveReview: (payload: Record<string, unknown>) =>
    request<{ saved: boolean; review_id: string; saved_at: string; feedback_id: string; feedback_revision: number; feedback_status: string }>('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  saveAnnotationFeedback:(payload:Record<string,unknown>)=>request<FeedbackItem>('/api/feedback/annotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),
  listFeedback: (status?: string) =>
    request<{ feedback: FeedbackItem[]; count: number; updated_at: string }>(`/api/feedback${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateFeedbackStatus: (feedbackId: string, status: FeedbackItem['status'], note = '') =>
    request<{ id: string; status: string; updated: string }>(`/api/feedback/${encodeURIComponent(feedbackId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    }),
  listCases: <TCase>() => request<PersistedCasesResponse<TCase>>('/api/cases'),
  saveCases: <TCase>(cases: TCase[]) =>
    request<{ saved: boolean; count: number; saved_at: string }>('/api/cases', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cases }),
    }),
  deleteCase: (caseId: string) =>
    request<{ deleted: boolean; case_id: string }>(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' }),
  appendAudit: (payload: Record<string, unknown>) =>
    request<{ saved: boolean }>('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};
