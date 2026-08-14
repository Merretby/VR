/**
 * Structured room model.
 *
 * CORE RULE: the validated 2D floor plan is the single source of truth.
 * 3D walls are generated directly from these coordinates — never re-derived,
 * never repositioned, never rotated by anything downstream.
 */

export type WallKey = "right" | "front" | "left" | "back";

/** All capturable surfaces: 4 walls + floor + ceiling */
export type SurfaceKey = WallKey | "floor" | "ceiling";

export interface Vec2 {
  x: number;
  z: number;
}

export interface Opening {
  id: string;
  wallId: WallKey;
  type: "door" | "window";
  /** distance in metres from wall start to the opening centre */
  offset: number;
  width: number;
  height: number;
  /** height of the opening bottom above the floor */
  sill: number;
}

export interface Wall {
  id: WallKey;
  label: string;
  start: Vec2;
  end: Vec2;
  height: number;
  thickness: number;
  connectedTo: WallKey[];
}

export interface FloorPlan {
  widthM: number;
  lengthM: number;
  heightM: number;
  walls: Wall[];
  openings: Opening[];
}

export interface PlacedFurniture {
  id: string;
  type: string;
  x: number;
  z: number;
  /** rotation around Y in degrees */
  rotation: number;
  color?: string;
}

export interface Design {
  id: string;
  name: string;
  wallColor: string;
  floorColor: string;
  lighting: "warm" | "neutral" | "cool";
  furniture: PlacedFurniture[];
}

export type PlanSource = "capture" | "upload";

export interface RoomProject {
  photos: Partial<Record<SurfaceKey, string>>;
  planImage?: string | null;
  planSource: PlanSource;
  plan: FloorPlan;
  designs: Design[];
  activeDesignId: string;
  analysisNotes?: string[];
}

export const WALL_ORDER: WallKey[] = ["right", "front", "left", "back"];

export const WALL_META: Record<
  WallKey,
  { title: string; step: number; hint: string; contains: string }
> = {
  right: {
    title: "Right Wall",
    step: 1,
    hint: "Stand with your back to the door and face the wall on your right.",
    contains: "Simple wall",
  },
  front: {
    title: "Front Wall",
    step: 2,
    hint: "Turn to the wall in front of you — this is the wall with the window.",
    contains: "Wall with window",
  },
  left: {
    title: "Left Wall",
    step: 3,
    hint: "Turn to the wall on your left.",
    contains: "Simple wall",
  },
  back: {
    title: "Back Wall",
    step: 4,
    hint: "Turn around — this is the wall behind you, with the door.",
    contains: "Wall with door",
  },
};

/** Full 6-step capture order: 4 walls + floor + ceiling */
export const SURFACE_ORDER: SurfaceKey[] = ["right", "front", "left", "back", "floor", "ceiling"];

export const SURFACE_META: Record<
  SurfaceKey,
  { title: string; step: number; hint: string; contains: string }
> = {
  ...WALL_META,
  floor: {
    title: "Floor",
    step: 5,
    hint: "Point the camera straight down at the floor — capture as much area as you can.",
    contains: "Room floor",
  },
  ceiling: {
    title: "Ceiling",
    step: 6,
    hint: "Point the camera straight up at the ceiling — include the light fixture if visible.",
    contains: "Room ceiling",
  },
};

const EPS = 0.001;

export const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Builds an exact, closed rectangular wall chain.
 * Corners are shared by construction, so gaps/overlaps are impossible.
 *
 *   A(0,0) ── front ── B(W,0)
 *     │                  │
 *   left               right
 *     │                  │
 *   D(0,L) ── back ──── C(W,L)
 */
export function buildRectangularWalls(
  widthM: number,
  lengthM: number,
  heightM: number,
  thickness = 0.12,
): Wall[] {
  const A: Vec2 = { x: 0, z: 0 };
  const B: Vec2 = { x: widthM, z: 0 };
  const C: Vec2 = { x: widthM, z: lengthM };
  const D: Vec2 = { x: 0, z: lengthM };

  return [
    {
      id: "right",
      label: "Right Wall",
      start: B,
      end: C,
      height: heightM,
      thickness,
      connectedTo: ["front", "back"],
    },
    {
      id: "front",
      label: "Front Wall",
      start: A,
      end: B,
      height: heightM,
      thickness,
      connectedTo: ["left", "right"],
    },
    {
      id: "left",
      label: "Left Wall",
      start: D,
      end: A,
      height: heightM,
      thickness,
      connectedTo: ["back", "front"],
    },
    {
      id: "back",
      label: "Back Wall",
      start: C,
      end: D,
      height: heightM,
      thickness,
      connectedTo: ["right", "left"],
    },
  ];
}

export interface PlanInput {
  widthM: number;
  lengthM: number;
  heightM: number;
  wallThickness?: number;
  openings?: Opening[];
}

export function buildFloorPlan(input: PlanInput): FloorPlan {
  const {
    widthM,
    lengthM,
    heightM,
    wallThickness = 0.12,
    openings = [],
  } = input;

  const walls = buildRectangularWalls(widthM, lengthM, heightM, wallThickness);

  return { widthM, lengthM, heightM, walls, openings };
}

export const wallLength = (w: Wall) =>
  Math.hypot(w.end.x - w.start.x, w.end.z - w.start.z);

export function wallDirection(w: Wall): Vec2 {
  const len = wallLength(w) || 1;
  return { x: (w.end.x - w.start.x) / len, z: (w.end.z - w.start.z) / len };
}

/** Unit normal pointing into the room for the canonical wall winding. */
export function wallInwardNormal(w: Wall): Vec2 {
  const d = wallDirection(w);
  return { x: -d.z, z: d.x };
}

export function wallAngleDeg(w: Wall): number {
  const d = wallDirection(w);
  return (Math.atan2(d.z, d.x) * 180) / Math.PI;
}

/** Point on a wall at a given distance along it. */
export function pointAlongWall(w: Wall, distance: number): Vec2 {
  const d = wallDirection(w);
  return { x: w.start.x + d.x * distance, z: w.start.z + d.z * distance };
}

/** The wall an arbitrary point is closest to, with the point's offset along it. */
export function nearestWall(plan: FloorPlan, point: Vec2): { wall: Wall; offset: number } {
  let best: { wall: Wall; offset: number } | null = null;
  let bestDist = Infinity;
  for (const w of plan.walls) {
    const d = wallDirection(w);
    const len = wallLength(w);
    const t = (point.x - w.start.x) * d.x + (point.z - w.start.z) * d.z;
    const clamped = Math.min(Math.max(t, 0), len);
    const px = w.start.x + d.x * clamped;
    const pz = w.start.z + d.z * clamped;
    const dist = Math.hypot(point.x - px, point.z - pz);
    if (dist < bestDist) {
      bestDist = dist;
      best = { wall: w, offset: clamped };
    }
  }
  return best!;
}

/** Clamp an opening so it sits fully inside its wall. */
export function clampOpeningOffset(w: Wall, offset: number, width: number): number {
  const len = wallLength(w);
  const half = width / 2;
  return Math.min(Math.max(offset, half + 0.05), len - half - 0.05);
}

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  level: IssueLevel;
  code: string;
  message: string;
  wallId?: WallKey;
}

/** Ordered closed loop: right → back → left → front → right */
const LOOP: WallKey[] = ["right", "back", "left", "front"];

/**
 * Geometry validation. Everything the 3D stage relies on is checked here:
 * connected walls meet, corners align, no gaps, no overlaps, lengths and
 * angles are sane, and every opening sits fully inside its wall.
 */
export function validatePlan(plan: FloorPlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const byId = new Map(plan.walls.map((w) => [w.id, w]));

  if (plan.walls.length !== 4) {
    issues.push({
      level: "error",
      code: "wall-count",
      message: `A closed room needs 4 walls, found ${plan.walls.length}.`,
    });
  }

  for (const key of WALL_ORDER) {
    const w = byId.get(key);
    if (!w) {
      issues.push({
        level: "error",
        code: "missing-wall",
        message: `The ${key} wall is missing.`,
        wallId: key,
      });
      continue;
    }
    const len = wallLength(w);
    if (len < 0.3) {
      issues.push({
        level: "error",
        code: "wall-length",
        message: `${w.label} is only ${len.toFixed(2)} m long.`,
        wallId: key,
      });
    }
    if (w.height < 1.8 || w.height > 6) {
      issues.push({
        level: "warning",
        code: "wall-height",
        message: `${w.label} height ${w.height.toFixed(2)} m is unusual.`,
        wallId: key,
      });
    }
    if (w.thickness <= 0 || w.thickness > 0.6) {
      issues.push({
        level: "warning",
        code: "wall-thickness",
        message: `${w.label} thickness ${w.thickness.toFixed(2)} m is unusual.`,
        wallId: key,
      });
    }
  }

  // Corner closure: every wall's end must be the next wall's start.
  for (let i = 0; i < LOOP.length; i++) {
    const a = byId.get(LOOP[i]!);
    const b = byId.get(LOOP[(i + 1) % LOOP.length]!);
    if (!a || !b) continue;
    const gap = Math.hypot(a.end.x - b.start.x, a.end.z - b.start.z);
    if (gap > EPS) {
      issues.push({
        level: "error",
        code: "corner-gap",
        message: `${a.label} and ${b.label} do not meet — ${(gap * 100).toFixed(1)} cm gap at the corner.`,
        wallId: a.id,
      });
    }
  }

  // Corner angles.
  for (let i = 0; i < LOOP.length; i++) {
    const a = byId.get(LOOP[i]!);
    const b = byId.get(LOOP[(i + 1) % LOOP.length]!);
    if (!a || !b) continue;
    const da = wallDirection(a);
    const db = wallDirection(b);
    const dot = da.x * db.x + da.z * db.z;
    const angle = (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
    if (Math.abs(angle - 90) > 1.5) {
      issues.push({
        level: "warning",
        code: "corner-angle",
        message: `Corner between ${a.label} and ${b.label} is ${angle.toFixed(1)}° instead of 90°.`,
        wallId: a.id,
      });
    }
  }

  // Heights must match so the ceiling closes.
  const heights = new Set(plan.walls.map((w) => w.height.toFixed(3)));
  if (heights.size > 1) {
    issues.push({
      level: "error",
      code: "height-mismatch",
      message: "Walls have different heights — the ceiling would not close.",
    });
  }

  // Openings.
  for (const o of plan.openings) {
    const w = byId.get(o.wallId);
    if (!w) {
      issues.push({
        level: "error",
        code: "orphan-opening",
        message: `A ${o.type} is attached to a wall that does not exist.`,
      });
      continue;
    }
    const len = wallLength(w);
    const start = o.offset - o.width / 2;
    const end = o.offset + o.width / 2;
    if (start < 0.05 || end > len - 0.05) {
      issues.push({
        level: "error",
        code: "opening-out-of-bounds",
        message: `The ${o.type} on the ${w.label} extends past the wall edge.`,
        wallId: w.id,
      });
    }
    if (o.sill + o.height > w.height - 0.05) {
      issues.push({
        level: "error",
        code: "opening-too-tall",
        message: `The ${o.type} on the ${w.label} is taller than the wall.`,
        wallId: w.id,
      });
    }
    if (o.width <= 0 || o.height <= 0) {
      issues.push({
        level: "error",
        code: "opening-size",
        message: `The ${o.type} on the ${w.label} has an invalid size.`,
        wallId: w.id,
      });
    }
  }

  // Overlapping openings on the same wall.
  for (const key of WALL_ORDER) {
    const list = plan.openings
      .filter((o) => o.wallId === key)
      .sort((a, b) => a.offset - b.offset);
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1]!;
      const cur = list[i]!;
      if (prev.offset + prev.width / 2 > cur.offset - cur.width / 2) {
        issues.push({
          level: "error",
          code: "opening-overlap",
          message: `Two openings overlap on the ${WALL_META[key].title}.`,
          wallId: key,
        });
      }
    }
  }



  return issues;
}

/**
 * Snaps the plan back to a valid closed rectangle derived from its own
 * dimensions and clamps every opening inside its wall. Used by "Auto-fix" —
 * it corrects geometry, it never invents new geometry.
 */
export function autoFixPlan(plan: FloorPlan): FloorPlan {
  const width = Math.max(1, Number(plan.widthM.toFixed(3)));
  const length = Math.max(1, Number(plan.lengthM.toFixed(3)));
  const height = Math.max(2, Number(plan.heightM.toFixed(3)));
  const thickness = plan.walls[0]?.thickness ?? 0.12;
  const walls = buildRectangularWalls(width, length, height, thickness);
  const byId = new Map(walls.map((w) => [w.id, w]));

  const openings = plan.openings.map((o) => {
    const w = byId.get(o.wallId)!;
    const len = wallLength(w);
    const maxW = Math.min(o.width, len - 0.2);
    const half = maxW / 2;
    const offset = Math.min(Math.max(o.offset, half + 0.05), len - half - 0.05);
    const maxH = Math.min(o.height, height - o.sill - 0.1);
    return { ...o, width: maxW, offset, height: maxH };
  });

  return { widthM: width, lengthM: length, heightM: height, walls, openings };
}

export const floorArea = (plan: FloorPlan) => plan.widthM * plan.lengthM;

export function defaultDesigns(): Design[] {
  return [
    {
      id: "original",
      name: "Original",
      wallColor: "#d9d4cc",
      floorColor: "#b08b5f",
      lighting: "neutral",
      furniture: [],
    },
  ];
}

export function defaultProject(): RoomProject {
  const plan = buildFloorPlan({
    widthM: 4.2,
    lengthM: 5,
    heightM: 2.8,
  });
  return {
    photos: {},
    planSource: "capture",
    planImage: null,
    plan,
    designs: defaultDesigns(),
    activeDesignId: "original",
  };
}
