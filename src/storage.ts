import { AppView, AuditEvent, Language, PatientCase } from './types';

const CASES_KEY = 'boneage-xai:cases:v4';
const UI_KEY = 'boneage-xai:ui:v4';
const AUDIT_KEY = 'boneage-xai:audit:v4';

export interface StoredUiState {
  language: Language;
  selectedCaseId: string;
  currentView: AppView;
}

function readJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The app remains usable in private/restricted browser modes.
  }
}

export function loadStoredCases(fallback: PatientCase[]): PatientCase[] {
  const stored = readJson<PatientCase[]>(CASES_KEY);
  return Array.isArray(stored) && stored.length > 0 ? stored : fallback;
}

export function storeCases(cases: PatientCase[]) {
  writeJson(CASES_KEY, cases);
}

export function loadUiState(fallback: StoredUiState): StoredUiState {
  return { ...fallback, ...(readJson<Partial<StoredUiState>>(UI_KEY) ?? {}) };
}

export function storeUiState(state: StoredUiState) {
  writeJson(UI_KEY, state);
}

export function loadAuditEvents(): AuditEvent[] {
  const stored = readJson<AuditEvent[]>(AUDIT_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function storeAuditEvents(events: AuditEvent[]) {
  writeJson(AUDIT_KEY, events.slice(0, 250));
}
