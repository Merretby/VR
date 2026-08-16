const KEY = "roomcast-active-project-id";

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(KEY);
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* storage unavailable — keep going */
  }
}

export function clearActiveProjectId(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — keep going */
  }
}
