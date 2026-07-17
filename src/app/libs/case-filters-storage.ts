export type CaseFilters = {
  status?: string[];
  contractorId?: string[];
  onlyMine?: boolean;
};

const STORAGE_KEY = 'crm:cases:filters';

export function getStoredCaseFilters(): CaseFilters {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CaseFilters) : {};
  } catch {
    return {};
  }
}

export function setStoredCaseFilters(filters: CaseFilters): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

export function clearStoredCaseFilters(): void {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(STORAGE_KEY);
}
