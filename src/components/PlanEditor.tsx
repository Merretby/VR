import { useRef, useState } from "react";
import {
  clampOpeningOffset,
  nearestWall,
  pointAlongWall,
  wallDirection,
  wallLength,
  type FloorPlan,
  type Opening,
  type WallKey,
} from "@/lib/room-model";

/**
 * 2D floor-plan verification & editing surface.
 * Everything the user drags here is written straight back into the plan,
 * which is the source of truth for the 3D reconstruction.
 */
export function PlanEditor({
  plan,
  onChange,
  selected,
  onSelect,
}: {
  plan: FloorPlan;
  onChange: (plan: FloorPlan) => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const pad = 0.9;
  const vbW = plan.widthM + pad * 2;
  const vbH = plan.lengthM + pad * 2;
  const scale = 1;

  const toPlan = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * vbW - pad;
    const z = ((e.clientY - rect.top) / rect.height) * vbH - pad;
    return { x, z };
  };

  const moveOpening = (opening: Opening, point: { x: number; z: number }) => {
    const { wall, offset } = nearestWall(plan, point);
    const clamped = clampOpeningOffset(wall, offset, opening.width);
    onChange({
      ...plan,
      openings: plan.openings.map((o) =>
        o.id === opening.id ? { ...o, wallId: wall.id, offset: clamped } : o,
      ),
    });
  };

  const wallColor = (id: WallKey) =>
    selected === id ? "var(--color-primary)" : "var(--color-foreground)";

  return (
    <svg
      ref={svgRef}
      viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`}
      className="blueprint-grid h-full w-full touch-none rounded-xl border bg-card"
      onPointerMove={(e) => {
        if (!dragging) return;
        const p = toPlan(e);
        if (!p) return;
        const opening = plan.openings.find((o) => o.id === dragging);
        if (opening) moveOpening(opening, p);
      }}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
      onClick={() => onSelect(null)}
    >
      {/* floor */}
      <rect
        x={0}
        y={0}
        width={plan.widthM}
        height={plan.lengthM}
        fill="color-mix(in oklab, var(--color-blueprint) 12%, transparent)"
      />

      {/* walls */}
      {plan.walls.map((w) => {
        const d = wallDirection(w);
        const nx = -d.z;
        const nz = d.x;
        const t = w.thickness;
        const pts = [
          [w.start.x, w.start.z],
          [w.end.x, w.end.z],
          [w.end.x - nx * t, w.end.z - nz * t],
          [w.start.x - nx * t, w.start.z - nz * t],
        ]
          .map((p) => p.join(","))
          .join(" ");
        const mid = pointAlongWall(w, wallLength(w) / 2);
        return (
          <g key={w.id}>
            <polygon
              points={pts}
              fill={wallColor(w.id)}
              opacity={selected === w.id ? 1 : 0.85}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(w.id);
              }}
              className="cursor-pointer"
            />
            <text
              x={mid.x - nx * 0.36}
              y={mid.z - nz * 0.36}
              fontSize={0.22 * scale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-muted-foreground)"
              className="pointer-events-none select-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {w.label.replace(" Wall", "")} · {wallLength(w).toFixed(2)}m
            </text>
          </g>
        );
      })}

      {/* openings */}
      {plan.openings.map((o) => {
        const wall = plan.walls.find((w) => w.id === o.wallId);
        if (!wall) return null;
        const d = wallDirection(wall);
        const nx = -d.z;
        const nz = d.x;
        const a = pointAlongWall(wall, o.offset - o.width / 2);
        const b = pointAlongWall(wall, o.offset + o.width / 2);
        const t = wall.thickness;
        const pts = [
          [a.x, a.z],
          [b.x, b.z],
          [b.x - nx * t, b.z - nz * t],
          [a.x - nx * t, a.z - nz * t],
        ]
          .map((p) => p.join(","))
          .join(" ");
        const isSel = selected === o.id;
        return (
          <g key={o.id}>
            <polygon
              points={pts}
              fill={
                o.type === "door"
                  ? "var(--color-primary)"
                  : "var(--color-accent)"
              }
              stroke={isSel ? "var(--color-foreground)" : "none"}
              strokeWidth={0.03}
              className="cursor-grab"
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelect(o.id);
                setDragging(o.id);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <text
              x={(a.x + b.x) / 2 + nx * 0.3}
              y={(a.z + b.z) / 2 + nz * 0.3}
              fontSize={0.2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={o.type === "door" ? "var(--color-primary)" : "var(--color-accent)"}
              className="pointer-events-none select-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {o.type === "door" ? "🚪" : "🪟"} {o.width.toFixed(2)}m
            </text>
          </g>
        );
      })}

      {/* dimension lines */}
      <g stroke="var(--color-muted-foreground)" strokeWidth={0.012}>
        <line x1={0} y1={-0.45} x2={plan.widthM} y2={-0.45} />
        <line x1={-0.45} y1={0} x2={-0.45} y2={plan.lengthM} />
      </g>
      <text
        x={plan.widthM / 2}
        y={-0.58}
        fontSize={0.24}
        textAnchor="middle"
        fill="var(--color-muted-foreground)"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {plan.widthM.toFixed(2)} m
      </text>
      <text
        x={-0.58}
        y={plan.lengthM / 2}
        fontSize={0.24}
        textAnchor="middle"
        fill="var(--color-muted-foreground)"
        transform={`rotate(-90 ${-0.58} ${plan.lengthM / 2})`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {plan.lengthM.toFixed(2)} m
      </text>

      {/* corner markers prove the walls meet */}
      {plan.walls.map((w) => (
        <circle
          key={`c-${w.id}`}
          cx={w.start.x}
          cy={w.start.z}
          r={0.06}
          fill="var(--color-success)"
        />
      ))}
    </svg>
  );
}
