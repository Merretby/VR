import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { designRoomWithAi } from "@/lib/ai.functions";
import {
  uid,
  validatePlan,
  type Design,
  type FloorPlan,
  type PlacedFurniture,
} from "@/lib/room-model";
import { FURNITURE_LIBRARY, checkFit, getSpec } from "@/lib/furniture";
import { activeDesign, roomActions, useRoomProject } from "@/lib/room-store";
import { DESIGN_STYLES, getStyle } from "@/lib/design-styles";
import { format, useDict } from "@/lib/i18n";

const RoomExperience = lazy(() => import("@/components/room3d/RoomExperience"));

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "3D Room Studio — Design, 360° and VR — Pokibois" },
      {
        name: "description",
        content:
          "Explore your reconstructed room in 3D, view 360° panoramas with export, enter VR, and redesign it with real-scale furniture and AI.",
      },
      { property: "og:title", content: "3D Room Studio — Design, 360° and VR" },
      {
        property: "og:description",
        content:
          "Your exact room geometry in 3D with a full design editor, AI styling and VR mode.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

const STYLES = [
  "Modern",
  "Minimalist",
  "Luxury",
  "Gaming",
  "Scandinavian",
  "Industrial",
  "Traditional",
];

const WALL_SWATCHES = ["#e7e2d9", "#d9d4cc", "#c8cfd4", "#b9c4b4", "#2f3338", "#e3cdb5"];
const FLOOR_SWATCHES = ["#b08b5f", "#8d6743", "#d8c8b0", "#6d6a65", "#3f3b38", "#c9a882"];

function StudioPage() {
  const project = useRoomProject();
  const d = useDict();
  const plan = project.plan;
  const design = activeDesign(project);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [compare, setCompare] = useState(false);
  const issues = useMemo(() => validatePlan(plan), [plan]);
  const hasErrors = issues.some((i) => i.level === "error");

  useEffect(() => setMounted(true), []);

  const original = project.designs.find((d) => d.id === "original") ?? design;
  const selected = design.furniture.find((f) => f.id === selectedId) ?? null;

  const update = (patch: Partial<Design>) => roomActions.upsertDesign({ ...design, ...patch });

  const furnitureName = (type: string) =>
    type in d.studio.furniture
      ? d.studio.furniture[type as keyof typeof d.studio.furniture]
      : getSpec(type).name;

  const localizedFitMessage = (fit: ReturnType<typeof checkFit>): string => {
    if (!fit.reason) return fit.message;
    return format(d.studio.fit[fit.reason], fit.params ?? {});
  };

  const addFurniture = (type: string) => {
    const spec = getSpec(type);
    const fit = checkFit(spec, plan.widthM, plan.lengthM, plan.heightM);
    if (!fit.fits) {
      toast.error(
        format(d.studio.toastAddFailed, {
          name: furnitureName(type),
          message: localizedFitMessage(fit),
        }),
      );
      return;
    }
    const item: PlacedFurniture = {
      id: uid(),
      type,
      x: plan.widthM / 2,
      z: plan.lengthM / 2,
      rotation: 0,
    };
    update({ furniture: [...design.furniture, item] });
    setSelectedId(item.id);
    toast.success(
      format(d.studio.toastAdded, { name: furnitureName(type), message: localizedFitMessage(fit) }),
    );
  };

  const patchItem = (id: string, patch: Partial<PlacedFurniture>) =>
    update({
      furniture: design.furniture.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });

  const removeItem = (id: string) => {
    update({ furniture: design.furniture.filter((f) => f.id !== id) });
    setSelectedId(null);
  };

  const saveAs = (name: string) => {
    const copy: Design = {
      ...design,
      id: uid(),
      name,
      furniture: design.furniture.map((f) => ({ ...f })),
    };
    roomActions.upsertDesign(copy);
    toast.success(format(d.studio.toastSavedAs, { name }));
  };

  return (
    <div className="min-h-screen">
      <AppHeader current="/studio" />
      <main className="mx-auto max-w-[110rem] px-3 py-4 sm:px-4 sm:py-6">
        {hasErrors && (
          <div className="mb-4 rounded-lg border border-destructive/60 bg-destructive/10 p-3 text-xs sm:text-sm">
            {d.studio.errorsBannerA}{" "}
            <Link to="/plan" className="font-medium underline">
              {d.studio.errorsBannerLink}
            </Link>{" "}
            {d.studio.errorsBannerB}
          </div>
        )}

        <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-3 sm:space-y-4">
            <div className="h-[50vh] min-h-[16rem] sm:h-[34rem]">
              {mounted ? (
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
                      {d.studio.buildingRoom}
                    </div>
                  }
                >
                  <RoomExperience
                    plan={plan}
                    design={design}
                    photos={project.photos}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </Suspense>
              ) : (
                <div className="h-full rounded-xl border bg-card" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="secondary" size="sm" onClick={() => setCompare((c) => !c)}>
                {compare ? d.studio.hideCompare : d.studio.showCompare}
              </Button>
              <span className="font-mono text-[10px] text-muted-foreground sm:text-xs">
                {plan.widthM.toFixed(2)} × {plan.lengthM.toFixed(2)} × {plan.heightM.toFixed(2)} m ·{" "}
                {(plan.widthM * plan.lengthM).toFixed(2)} m² ·{" "}
                {format(d.studio.itemsCount, { count: design.furniture.length })}
              </span>
            </div>

            {compare && (
              <div className="grid gap-4 md:grid-cols-2">
                <ComparePanel
                  title={d.studio.originalRoom}
                  plan={plan}
                  design={original}
                  photos={project.photos}
                  mounted={mounted}
                />
                <ComparePanel
                  title={format(d.studio.designedRoom, { name: design.name })}
                  plan={plan}
                  design={design}
                  photos={project.photos}
                  mounted={mounted}
                />
              </div>
            )}
          </div>

          <Tabs defaultValue="design" className="min-w-0">
            <TabsList className="w-full">
              <TabsTrigger value="design" className="flex-1 text-xs sm:text-sm">
                <span className="hidden sm:inline">🎨 </span>
                {d.studio.tabDesign}
              </TabsTrigger>
              <TabsTrigger value="styles" className="flex-1 text-xs sm:text-sm">
                <span className="hidden sm:inline">✨ </span>
                {d.studio.tabStyles}
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1 text-xs sm:text-sm">
                <span className="hidden sm:inline">✨ </span>
                {d.studio.tabAi}
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex-1 text-xs sm:text-sm">
                <span className="hidden sm:inline">💾 </span>
                {d.studio.tabVersions}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-5">
              <section className="rounded-xl border bg-card p-4 sm:p-5">
                <p className="label-mono">{d.studio.wallColor}</p>
                <Swatches
                  colors={WALL_SWATCHES}
                  value={design.wallColor}
                  onChange={(c) => update({ wallColor: c })}
                />
                <p className="label-mono mt-5">{d.studio.flooring}</p>
                {project.photos["floor"] && (
                  <div className="mt-2 mb-2 flex items-center justify-between rounded-lg border bg-secondary/50 p-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>📸</span> {d.studio.capturedFloorActive}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => roomActions.clearPhoto("floor")}
                    >
                      {d.studio.useDesignFloor}
                    </Button>
                  </div>
                )}
                <Swatches
                  colors={FLOOR_SWATCHES}
                  value={design.floorColor}
                  onChange={(c) => {
                    if (project.photos["floor"]) roomActions.clearPhoto("floor");
                    update({ floorColor: c });
                  }}
                />
                <p className="label-mono mt-5">{d.studio.lighting}</p>
                <div className="mt-2 flex gap-2">
                  {(["warm", "neutral", "cool"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => update({ lighting: l })}
                      className={`flex-1 rounded-md border px-3 py-2 text-xs transition-colors ${
                        design.lighting === l
                          ? "border-primary text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      💡{" "}
                      {l === "warm"
                        ? d.studio.lightingWarm
                        : l === "neutral"
                          ? d.studio.lightingNeutral
                          : d.studio.lightingCool}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border bg-card p-4 sm:p-5">
                <p className="label-mono">{d.studio.layoutMap}</p>
                <PlacementMap
                  plan={plan}
                  furniture={design.furniture}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onMove={(id, x, z) => patchItem(id, { x, z })}
                />
                {selected && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {getSpec(selected.type).icon} {furnitureName(selected.type)}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(selected.id)}
                      >
                        {d.studio.delete}
                      </Button>
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">
                        {format(d.studio.rotation, { angle: selected.rotation })}
                      </Label>
                      <Slider
                        value={[selected.rotation]}
                        min={0}
                        max={350}
                        step={10}
                        onValueChange={([v]) => patchItem(selected.id, { rotation: v ?? 0 })}
                        className="mt-2"
                      />
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      x {selected.x.toFixed(2)} m · z {selected.z.toFixed(2)} m ·{" "}
                      {getSpec(selected.type).width.toFixed(2)} ×{" "}
                      {getSpec(selected.type).depth.toFixed(2)} ×{" "}
                      {getSpec(selected.type).height.toFixed(2)} m
                    </p>
                  </div>
                )}
              </section>

              <section className="rounded-xl border bg-card p-4 sm:p-5">
                <p className="label-mono">{d.studio.addFurniture}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FURNITURE_LIBRARY.map((spec) => {
                    const fit = checkFit(spec, plan.widthM, plan.lengthM, plan.heightM);
                    return (
                      <button
                        key={spec.type}
                        onClick={() => addFurniture(spec.type)}
                        disabled={!fit.fits}
                        title={localizedFitMessage(fit)}
                        className="rounded-lg border px-3 py-2 text-sm transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {spec.icon} {furnitureName(spec.type)}
                      </button>
                    );
                  })}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="styles">
              <StylesPanel design={design} onApply={update} />
            </TabsContent>

            <TabsContent value="ai">
              <AiPanel plan={plan} design={design} />
            </TabsContent>

            <TabsContent value="versions">
              <section className="rounded-xl border bg-card p-4 sm:p-5">
                <p className="label-mono">{d.studio.myRoom}</p>
                <ul className="mt-3 space-y-2">
                  {project.designs.map((dv) => (
                    <li key={dv.id} className="flex items-center gap-2">
                      <button
                        onClick={() => roomActions.setActiveDesign(dv.id)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          dv.id === design.id ? "border-primary" : "hover:bg-secondary"
                        }`}
                      >
                        {dv.id === "original" ? "🏠" : "✨"}{" "}
                        {dv.id === "original" ? d.studio.originalDesignName : dv.name}
                        <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                          {format(d.studio.itemsCount, { count: dv.furniture.length })}
                        </span>
                      </button>
                      {dv.id !== "original" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => roomActions.removeDesign(dv.id)}
                        >
                          ✕
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                <SaveAs
                  onSave={saveAs}
                  placeholder={d.studio.newVersionPlaceholder}
                  saveLabel={d.studio.saveAs}
                />
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function ComparePanel({
  title,
  plan,
  design,
  photos,
  mounted,
}: {
  title: string;
  plan: FloorPlan;
  design: Design;
  photos?: Partial<Record<string, string>> | undefined;
  mounted: boolean;
}) {
  return (
    <div>
      <p className="label-mono mb-2">{title}</p>
      <div className="h-64">
        {mounted && (
          <Suspense fallback={<div className="h-full rounded-xl border bg-card" />}>
            <RoomExperience plan={plan} design={design} photos={photos} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function StylesPanel({
  design,
  onApply,
}: {
  design: Design;
  onApply: (patch: Partial<Design>) => void;
}) {
  const d = useDict();
  const [styleId, setStyleId] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[] | null>(null);

  const active = getStyle(styleId ?? DESIGN_STYLES[0]!.id);
  const colors = palette ?? active.colors;
  const activeDict = d.designStyles[active.id as keyof typeof d.designStyles];

  const selectStyle = (id: string) => {
    setStyleId(id);
    setPalette([...getStyle(id).colors]);
  };

  const setColor = (index: number, color: string) => {
    setPalette((prev) => {
      const next = [...(prev ?? active.colors)];
      next[index] = color;
      return next;
    });
  };

  const apply = () => {
    onApply({
      wallColor: colors[0] ?? active.wallColor,
      floorColor: colors[1] ?? active.floorColor,
      lighting: active.lightingMode,
    });
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <p className="label-mono">{d.studio.interiorStyles}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {DESIGN_STYLES.map((s) => {
            const sDict = d.designStyles[s.id as keyof typeof d.designStyles];
            return (
              <button
                key={s.id}
                onClick={() => selectStyle(s.id)}
                className={`rounded-lg border p-5 text-left transition-colors ${
                  active.id === s.id ? "border-primary" : "hover:border-primary/50"
                }`}
              >
                <p className="text-sm font-medium">{sDict.name}</p>
                <p className="mt-0.5 text-[14px] text-muted-foreground">{sDict.tagline}</p>
                <div className="mt-2 flex gap-1">
                  {s.colors.map((c) => (
                    <span
                      key={c}
                      className="h-5 w-5 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-semibold">{activeDict.name}</p>
            <p className="mt-0.7 text-[14px] text-muted-foreground">{activeDict.tagline}</p>
          </div>
          <Button size="sm" onClick={apply}>
            {d.studio.applyToRoom}
          </Button>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="label-mono">{d.studio.paletteHint}</p>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setPalette([...active.colors])}
          >
            {d.studio.defaultPalette}
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {colors.map((c, i) => (
            <label key={i} className="cursor-pointer">
              <input
                type="color"
                value={c}
                onChange={(e) => setColor(i, e.target.value)}
                className="sr-only"
              />
              <span
                className="block h-10 rounded-md border shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: c }}
              />
              <span className="mt-1 block text-center font-mono text-[14px] text-muted-foreground">
                {c.toUpperCase()}
              </span>
            </label>
          ))}
        </div>

        <ChipList label={d.studio.materials} items={activeDict.materials} />
        <ChipList label={d.studio.chipLighting} items={activeDict.lighting} />
        <ChipList label={d.studio.signatureFurniture} items={activeDict.furniture} />
      </section>
    </div>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-5">
      <p className="label-mono">{label}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((m) => (
          <span key={m} className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function Swatches({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{ backgroundColor: c }}
          aria-label={`Use colour ${c}`}
          className={`h-8 w-8 rounded-md border-2 transition-transform ${
            value.toLowerCase() === c.toLowerCase()
              ? "scale-110 border-primary"
              : "border-transparent"
          }`}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Custom colour"
        className="h-8 w-10 cursor-pointer rounded-md border bg-transparent"
      />
    </div>
  );
}

function PlacementMap({
  plan,
  furniture,
  selectedId,
  onSelect,
  onMove,
}: {
  plan: FloorPlan;
  furniture: PlacedFurniture[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, z: number) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const point = (e: React.PointerEvent) => {
    const svg = ref.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * plan.widthM,
      z: ((e.clientY - rect.top) / rect.height) * plan.lengthM,
    };
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${plan.widthM} ${plan.lengthM}`}
      className="blueprint-grid mt-3 aspect-square w-full touch-none rounded-lg border"
      onPointerMove={(e) => {
        if (!dragging) return;
        const p = point(e);
        if (!p) return;
        const spec = getSpec(furniture.find((f) => f.id === dragging)!.type);
        const hw = spec.width / 2;
        const hd = spec.depth / 2;
        onMove(
          dragging,
          Math.min(Math.max(p.x, hw), plan.widthM - hw),
          Math.min(Math.max(p.z, hd), plan.lengthM - hd),
        );
      }}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
    >
      <rect x={0} y={0} width={plan.widthM} height={plan.lengthM} fill="transparent" />
      {plan.openings.map((o) => {
        const wall = plan.walls.find((w) => w.id === o.wallId)!;
        const dx =
          (wall.end.x - wall.start.x) /
          (Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z) || 1);
        const dz =
          (wall.end.z - wall.start.z) /
          (Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z) || 1);
        const cx = wall.start.x + dx * o.offset;
        const cz = wall.start.z + dz * o.offset;
        return (
          <circle
            key={o.id}
            cx={cx}
            cy={cz}
            r={0.12}
            fill={o.type === "door" ? "var(--color-primary)" : "var(--color-accent)"}
          />
        );
      })}
      {furniture.map((f) => {
        const spec = getSpec(f.type);
        return (
          <g
            key={f.id}
            transform={`translate(${f.x} ${f.z}) rotate(${f.rotation})`}
            className="cursor-grab"
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelect(f.id);
              setDragging(f.id);
            }}
          >
            <rect
              x={-spec.width / 2}
              y={-spec.depth / 2}
              width={spec.width}
              height={spec.depth}
              rx={0.05}
              fill={spec.color}
              opacity={0.85}
              stroke={selectedId === f.id ? "var(--color-primary)" : "none"}
              strokeWidth={0.05}
            />
            <text
              x={0}
              y={0}
              fontSize={0.28}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
            >
              {spec.icon}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SaveAs({
  onSave,
  placeholder,
  saveLabel,
}: {
  onSave: (name: string) => void;
  placeholder: string;
  saveLabel: string;
}) {
  const [name, setName] = useState("");
  return (
    <div className="mt-4 flex gap-2">
      <Input
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9"
      />
      <Button
        size="sm"
        onClick={() => {
          if (!name.trim()) return;
          onSave(name.trim());
          setName("");
        }}
      >
        {saveLabel}
      </Button>
    </div>
  );
}

function AiPanel({ plan, design }: { plan: FloorPlan; design: Design }) {
  const d = useDict();
  const run = useServerFn(designRoomWithAi);
  const [prompt, setPrompt] = useState(d.studio.aiDefaultPrompt);
  const [style, setStyle] = useState("Modern");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    try {
      const result = await run({
        data: {
          prompt,
          style,
          widthM: plan.widthM,
          lengthM: plan.lengthM,
          heightM: plan.heightM,
        },
      });

      const allowed = new Set(FURNITURE_LIBRARY.map((f) => f.type));
      const furniture: PlacedFurniture[] = result.furniture
        .filter((f) => allowed.has(f.type as never))
        .map((f) => {
          const spec = getSpec(f.type);
          const hw = spec.width / 2;
          const hd = spec.depth / 2;
          return {
            id: uid(),
            type: f.type,
            // AI may only arrange furniture — geometry is clamped to the real room.
            x: Math.min(Math.max(f.x, hw), Math.max(hw, plan.widthM - hw)),
            z: Math.min(Math.max(f.z, hd), Math.max(hd, plan.lengthM - hd)),
            rotation: (((Math.round(f.rotation / 10) * 10) % 360) + 360) % 360,
          };
        });

      const lighting =
        result.lighting === "warm" || result.lighting === "cool" ? result.lighting : "neutral";

      roomActions.upsertDesign({
        id: uid(),
        name: result.name || format(d.studio.aiDesignName, { style }),
        wallColor: /^#[0-9a-f]{6}$/i.test(result.wallColor) ? result.wallColor : design.wallColor,
        floorColor: /^#[0-9a-f]{6}$/i.test(result.floorColor)
          ? result.floorColor
          : design.floorColor,
        lighting,
        furniture,
      });
      setSummary(result.summary);
      toast.success(d.studio.toastAiApplied);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("429")) toast.error(d.studio.toastAiRateLimited);
      else if (message.includes("402")) toast.error(d.studio.toastAiNoCredits);
      else toast.error(d.studio.toastAiFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border bg-card p-5">
      <p className="label-mono">{d.studio.aiDesignTitle}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              style === s ? "border-primary text-foreground" : "text-muted-foreground"
            }`}
          >
            {d.studio.aiStyles[s as keyof typeof d.studio.aiStyles]}
          </button>
        ))}
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        className="mt-3 text-sm"
        placeholder={d.studio.aiPromptPlaceholder}
      />
      <Button className="mt-3 w-full" disabled={busy} onClick={generate}>
        {busy ? d.studio.aiDesigning : d.studio.aiDesignButton}
      </Button>
      <p className="mt-3 text-[11px] text-muted-foreground">{d.studio.aiDisclaimer}</p>
      {summary && <p className="mt-3 text-sm text-muted-foreground">{summary}</p>}
    </section>
  );
}
