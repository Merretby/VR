/**
 * Curated interior design styles shown as a moodboard in the Studio.
 * Picking a style reveals its name, default palette (editable), materials,
 * lighting and signature furniture. The palette is user-editable on the
 * moodboard; "Apply to room" pushes wall/floor colour + lighting to the
 * active design.
 */
export interface DesignStyle {
  id: string;
  name: string;
  tagline: string;
  /** editable palette colours (hex) */
  colors: string[];
  materials: string[];
  lighting: string[];
  furniture: string[];
  wallColor: string;
  floorColor: string;
  lightingMode: "warm" | "neutral" | "cool";
}

export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: "dubai-luxury",
    name: "Dubai Luxury",
    tagline: "Marble, warm gold and deep walnut",
    colors: ["#E8DED0", "#B89B72", "#6B5138", "#2E2721"],
    materials: ["marble", "walnut", "brushed gold", "velvet"],
    lighting: ["warm LED cove", "pendant", "ambient uplight"],
    furniture: ["curved sofa", "marble coffee table", "sculptural armchair"],
    wallColor: "#E8DED0",
    floorColor: "#6B5138",
    lightingMode: "warm",
  },
  {
    id: "japandi",
    name: "Japandi",
    tagline: "Quiet oak, linen and paper light",
    colors: ["#F1EDE6", "#D8CBB8", "#8C7B65", "#3C3730"],
    materials: ["light oak", "linen", "rattan", "clay plaster"],
    lighting: ["paper pendant", "soft diffused daylight", "floor lamp"],
    furniture: ["low sofa", "oak bench", "tatami rug", "ceramic vases"],
    wallColor: "#F1EDE6",
    floorColor: "#8C7B65",
    lightingMode: "neutral",
  },
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    tagline: "Clean lines, matte neutrals, airy space",
    colors: ["#F5F5F0", "#D4D4CC", "#9A9A92", "#2A2A28"],
    materials: ["matte plaster", "linen", "tinted glass", "micro-cement"],
    lighting: ["recessed spots", "linear LED", "skylight"],
    furniture: ["low modular sofa", "glass side table", "floor lamp"],
    wallColor: "#F5F5F0",
    floorColor: "#9A9A92",
    lightingMode: "neutral",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    tagline: "Light wood, soft wool and clean daylight",
    colors: ["#FBF8F1", "#E5DFD3", "#B8AFA0", "#4C4A44"],
    materials: ["birch wood", "wool", "linen", "ceramic"],
    lighting: ["paper pendant", "warm daylight", "candlelight"],
    furniture: ["wooden sofa", "dining table", "sheepskin chair"],
    wallColor: "#FBF8F1",
    floorColor: "#B8AFA0",
    lightingMode: "warm",
  },
  {
    id: "industrial-loft",
    name: "Industrial Loft",
    tagline: "Raw concrete, dark metal and exposed brick",
    colors: ["#E3DDD4", "#8A857D", "#5A554F", "#23211E"],
    materials: ["concrete", "blackened steel", "brick", "reclaimed timber"],
    lighting: ["bare filament", "track spots", "edison pendants"],
    furniture: ["leather sofa", "steel shelving", "factory lamp"],
    wallColor: "#E3DDD4",
    floorColor: "#5A554F",
    lightingMode: "cool",
  },
  {
    id: "coastal",
    name: "Coastal",
    tagline: "Driftwood, airy whites and sea-glass blue",
    colors: ["#F7F4EE", "#DCE7E8", "#A7C4C2", "#4E6E6D"],
    materials: ["driftwood", "rattan", "cotton", "sea-glass"],
    lighting: ["pendant rope light", "diffused daylight", "lamp"],
    furniture: ["linen sofa", "rattan chair", "wooden sideboard"],
    wallColor: "#F7F4EE",
    floorColor: "#DCE7E8",
    lightingMode: "cool",
  },
];

export const getStyle = (id: string): DesignStyle =>
  DESIGN_STYLES.find((s) => s.id === id) ?? DESIGN_STYLES[0]!;
