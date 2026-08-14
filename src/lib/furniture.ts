export type FurnitureKind =
  | "sofa"
  | "bed"
  | "desk"
  | "chair"
  | "table"
  | "tv"
  | "wardrobe"
  | "cabinet"
  | "carpet"
  | "plant"
  | "lamp"
  | "shelves";

export interface FurnitureSpec {
  type: FurnitureKind;
  name: string;
  icon: string;
  /** real-world dimensions in metres */
  width: number;
  depth: number;
  height: number;
  color: string;
}

export const FURNITURE_LIBRARY: FurnitureSpec[] = [
  { type: "sofa", name: "Sofa", icon: "🛋", width: 2.4, depth: 0.95, height: 0.85, color: "#8a7f74" },
  { type: "bed", name: "Bed", icon: "🛏", width: 1.6, depth: 2.0, height: 0.55, color: "#9c8f80" },
  { type: "desk", name: "Desk", icon: "🖥", width: 1.4, depth: 0.7, height: 0.75, color: "#7a5c3e" },
  { type: "chair", name: "Chair", icon: "🪑", width: 0.5, depth: 0.55, height: 0.95, color: "#5f6a70" },
  { type: "table", name: "Table", icon: "🪵", width: 1.2, depth: 0.8, height: 0.75, color: "#8b6540" },
  { type: "tv", name: "TV", icon: "📺", width: 1.25, depth: 0.08, height: 0.72, color: "#22262b" },
  { type: "wardrobe", name: "Wardrobe", icon: "🚪", width: 1.8, depth: 0.6, height: 2.1, color: "#6f5a45" },
  { type: "cabinet", name: "Cabinet", icon: "🗄", width: 1.0, depth: 0.45, height: 0.9, color: "#7d6952" },
  { type: "carpet", name: "Carpet", icon: "🟫", width: 2.4, depth: 1.7, height: 0.02, color: "#a4634f" },
  { type: "plant", name: "Plant", icon: "🪴", width: 0.6, depth: 0.6, height: 1.4, color: "#3f7d4f" },
  { type: "lamp", name: "Floor Lamp", icon: "💡", width: 0.35, depth: 0.35, height: 1.6, color: "#c9a227" },
  { type: "shelves", name: "Shelves", icon: "📚", width: 1.0, depth: 0.35, height: 1.8, color: "#75604a" },
];

export const getSpec = (type: string): FurnitureSpec =>
  FURNITURE_LIBRARY.find((f) => f.type === type) ?? FURNITURE_LIBRARY[0]!;

export interface FitResult {
  fits: boolean;
  message: string;
}

/** Real-scale check: does this item physically fit inside the room? */
export function checkFit(
  spec: FurnitureSpec,
  roomWidth: number,
  roomLength: number,
  roomHeight: number,
): FitResult {
  const longSide = Math.max(spec.width, spec.depth);
  const shortSide = Math.min(spec.width, spec.depth);
  const roomLong = Math.max(roomWidth, roomLength);
  const roomShort = Math.min(roomWidth, roomLength);

  if (spec.height > roomHeight - 0.05) {
    return { fits: false, message: `Too tall — needs ${spec.height.toFixed(2)} m of ceiling height.` };
  }
  if (longSide > roomLong - 0.1 || shortSide > roomShort - 0.1) {
    return { fits: false, message: `Too large for this space (${spec.width.toFixed(2)} × ${spec.depth.toFixed(2)} m).` };
  }
  if (longSide > roomLong * 0.75) {
    return { fits: true, message: `Fits, but takes up most of the room.` };
  }
  return { fits: true, message: `Fits this room comfortably.` };
}
