import { useSyncExternalStore } from "react";
import {
  defaultProject,
  type Design,
  type FloorPlan,
  type RoomProject,
  type SurfaceKey,
  type WallKey,
} from "./room-model";

const KEY = "room-reconstruction-project-v1";

let state: RoomProject = defaultProject();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    // Photos can be large data URLs; sessionStorage keeps the flow working
    // without blowing the localStorage quota on repeated captures.
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota — keep working in memory */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      state = { ...defaultProject(), ...(JSON.parse(raw) as RoomProject) };
      emit();
    }
  } catch {
    /* ignore corrupt state */
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const serverSnapshot = defaultProject();
const getServerSnapshot = () => serverSnapshot;

export function useRoomProject(): RoomProject {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function set(next: RoomProject) {
  state = next;
  persist();
  emit();
}

export const roomActions = {
  setPhoto(wall: SurfaceKey, dataUrl: string) {
    set({ ...state, photos: { ...state.photos, [wall]: dataUrl } });
  },
  clearPhoto(wall: SurfaceKey) {
    const photos = { ...state.photos };
    delete photos[wall];
    set({ ...state, photos });
  },
  setPlan(plan: FloorPlan, source?: RoomProject["planSource"]) {
    set({ ...state, plan, planSource: source ?? state.planSource });
  },
  setPlanImage(image: string | null) {
    set({ ...state, planImage: image });
  },
  setAnalysisNotes(notes: string[]) {
    set({ ...state, analysisNotes: notes });
  },
  upsertDesign(design: Design) {
    const designs = state.designs.some((d) => d.id === design.id)
      ? state.designs.map((d) => (d.id === design.id ? design : d))
      : [...state.designs, design];
    set({ ...state, designs, activeDesignId: design.id });
  },
  removeDesign(id: string) {
    if (id === "original") return;
    const designs = state.designs.filter((d) => d.id !== id);
    set({
      ...state,
      designs,
      activeDesignId: state.activeDesignId === id ? "original" : state.activeDesignId,
    });
  },
  setActiveDesign(id: string) {
    set({ ...state, activeDesignId: id });
  },
  reset() {
    set(defaultProject());
  },
};

export function activeDesign(project: RoomProject): Design {
  return (
    project.designs.find((d) => d.id === project.activeDesignId) ??
    project.designs[0]!
  );
}
