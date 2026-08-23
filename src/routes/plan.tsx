import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { PlanEditor } from "@/components/PlanEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  autoFixPlan,
  clampOpeningOffset,
  uid,
  validatePlan,
  WALL_ORDER,
  wallAngleDeg,
  wallLength,
  type FloorPlan,
  type Opening,
  type WallKey,
} from "@/lib/room-model";
import { roomActions, useRoomProject } from "@/lib/room-store";
import { format, useDict } from "@/lib/i18n";
import type { ValidationIssue } from "@/lib/room-model";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Verify & Edit Your Floor Plan — Roomcast Studio" },
      {
        name: "description",
        content:
          "Check the detected geometry before 3D reconstruction: move walls and openings, fix corner gaps and overlaps, and validate every dimension.",
      },
      { property: "og:title", content: "Verify & Edit Your Floor Plan — Roomcast Studio" },
      {
        property: "og:description",
        content:
          "Geometry validation catches gaps, overlaps and bad angles before the 3D room is built.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const project = useRoomProject();
  const navigate = useNavigate();
  const d = useDict();
  const plan = project.plan;
  const [selected, setSelected] = useState<string | null>(null);
  const [newWindowWall, setNewWindowWall] = useState<WallKey>("front");
  const [newDoorWall, setNewDoorWall] = useState<WallKey>("back");

  const issues = useMemo(() => validatePlan(plan), [plan]);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  const setPlan = (next: FloorPlan) => roomActions.setPlan(next);

  const resize = (key: "widthM" | "lengthM" | "heightM", value: number) => {
    if (!Number.isFinite(value) || value <= 0) return;
    setPlan(autoFixPlan({ ...plan, [key]: value }));
  };

  const setThickness = (value: number) => {
    setPlan(
      autoFixPlan({
        ...plan,
        walls: plan.walls.map((w) => ({ ...w, thickness: value })),
      }),
    );
  };

  const updateOpening = (id: string, patch: Partial<Opening>) => {
    setPlan({
      ...plan,
      openings: plan.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    });
  };

  const addOpening = (type: "door" | "window", wallId: WallKey) => {
    const wall = plan.walls.find((w) => w.id === wallId)!;
    const width = type === "door" ? 0.9 : 1.2;
    const opening: Opening = {
      id: `${type}-${uid()}`,
      wallId,
      type,
      offset: wallLength(wall) / 2,
      width,
      height: type === "door" ? 2.05 : 1.2,
      sill: type === "door" ? 0 : 0.9,
    };
    setPlan({ ...plan, openings: [...plan.openings, opening] });
    setSelected(opening.id);
  };

  const removeOpening = (id: string) => {
    setPlan({ ...plan, openings: plan.openings.filter((o) => o.id !== id) });
    setSelected(null);
  };

  const moveOpeningToWall = (id: string, wallId: WallKey) => {
    const opening = plan.openings.find((o) => o.id === id);
    const wall = plan.walls.find((w) => w.id === wallId);
    if (!opening || !wall) return;
    setPlan({
      ...plan,
      openings: plan.openings.map((o) =>
        o.id === id ? { ...o, wallId, offset: clampOpeningOffset(wall, o.offset, o.width) } : o,
      ),
    });
  };

  const selectedOpening = plan.openings.find((o) => o.id === selected) ?? null;
  const selectedWall = plan.walls.find((w) => w.id === selected) ?? null;

  const localizeIssue = (issue: ValidationIssue): string => {
    const template =
      d.plan.validationMessages[issue.code as keyof typeof d.plan.validationMessages];
    if (!template) return issue.message;
    const p = issue.params ?? {};
    const wallName = (id: unknown) =>
      typeof id === "string" && id in d.plan.walls
        ? d.plan.walls[id as keyof typeof d.plan.walls]
        : String(id ?? "");
    return format(template, {
      count: String(p["count"] ?? ""),
      wall: wallName(p["wallId"]),
      len: String(p["len"] ?? ""),
      height: String(p["height"] ?? ""),
      thickness: String(p["thickness"] ?? ""),
      a: wallName(p["aId"]),
      b: wallName(p["bId"]),
      gap: String(p["gap"] ?? ""),
      angle: String(p["angle"] ?? ""),
      type:
        typeof p["type"] === "string" && p["type"] in d.plan.openingsTypes
          ? d.plan.openingsTypes[p["type"] as keyof typeof d.plan.openingsTypes]
          : String(p["type"] ?? ""),
    });
  };

  const generate = () => {
    if (errors.length > 0) {
      toast.error(d.plan.toastFixErrors);
      return;
    }
    navigate({ to: "/studio" });
  };

  return (
    <div className="min-h-screen">
      <AppHeader current="/plan" />
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="label-mono">
              {project.planSource === "upload" ? d.plan.stepDetected : d.plan.stepBuilt}
            </p>
            <h1 className="mt-2 text-xl font-semibold sm:text-3xl">{d.plan.title}</h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:mt-2 sm:text-sm">
              {d.plan.description}
            </p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={generate}
            disabled={errors.length > 0}
          >
            {d.plan.generate}
          </Button>
        </div>

        <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-h-[18rem] sm:min-h-[26rem] overflow-hidden">
            <PlanEditor plan={plan} onChange={setPlan} selected={selected} onSelect={setSelected} />
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground sm:gap-2 sm:text-xs">
              <span className="rounded border px-1.5 py-0.5 sm:px-2 sm:py-1">
                {d.plan.hintDrag}
              </span>
              <span className="rounded border px-1.5 py-0.5 sm:px-2 sm:py-1">
                {d.plan.hintPick}
              </span>
              <span className="rounded border px-1.5 py-0.5 sm:px-2 sm:py-1">
                {d.plan.hintCorners}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-xl border bg-card p-4 sm:p-5">
              <p className="label-mono">{d.plan.dimensions}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field
                  label={d.plan.width}
                  value={plan.widthM}
                  onChange={(v) => resize("widthM", v)}
                />
                <Field
                  label={d.plan.length}
                  value={plan.lengthM}
                  onChange={(v) => resize("lengthM", v)}
                />
                <Field
                  label={d.plan.ceiling}
                  value={plan.heightM}
                  onChange={(v) => resize("heightM", v)}
                />
                <Field
                  label={d.plan.wallThickness}
                  step={0.01}
                  value={plan.walls[0]?.thickness ?? 0.12}
                  onChange={setThickness}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setPlan(autoFixPlan(plan))}>
                  {d.plan.autoFix}
                </Button>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="label-mono">{d.plan.openings}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <WallSelect value={newWindowWall} onChange={setNewWindowWall} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addOpening("window", newWindowWall)}
                  >
                    {d.plan.addWindow}
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <WallSelect value={newDoorWall} onChange={setNewDoorWall} />
                  <Button size="sm" variant="ghost" onClick={() => addOpening("door", newDoorWall)}>
                    {d.plan.addDoor}
                  </Button>
                </div>
              </div>
              <ul className="mt-3 space-y-2">
                {plan.openings.map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => setSelected(o.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selected === o.id ? "border-primary" : "hover:bg-secondary"
                      }`}
                    >
                      {o.type === "door" ? "🚪" : "🪟"}{" "}
                      {format(d.plan.openingOnWall, {
                        type: d.plan.openingsTypes[o.type],
                        wall: d.plan.walls[o.wallId],
                      })}{" "}
                      ·{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        {o.width.toFixed(2)}×{o.height.toFixed(2)} m
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {selectedOpening && (
                <div className="mt-4 space-y-3 rounded-lg border border-primary/40 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">{d.plan.wall}</Label>
                      <WallSelect
                        value={selectedOpening.wallId}
                        onChange={(w) => moveOpeningToWall(selectedOpening.id, w)}
                      />
                    </div>
                    <Field
                      label={d.plan.width}
                      value={selectedOpening.width}
                      onChange={(v) => updateOpening(selectedOpening.id, { width: v })}
                    />
                    <Field
                      label={d.plan.height}
                      value={selectedOpening.height}
                      onChange={(v) => updateOpening(selectedOpening.id, { height: v })}
                    />
                    <Field
                      label={d.plan.offset}
                      value={selectedOpening.offset}
                      onChange={(v) => updateOpening(selectedOpening.id, { offset: v })}
                    />
                    <Field
                      label={d.plan.sill}
                      value={selectedOpening.sill}
                      onChange={(v) => updateOpening(selectedOpening.id, { sill: v })}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeOpening(selectedOpening.id)}
                  >
                    {d.plan.removeOpening}
                  </Button>
                </div>
              )}
            </section>

            <section
              className={`rounded-xl border p-4 sm:p-5 ${
                errors.length ? "border-destructive/60 bg-destructive/5" : "bg-card"
              }`}
            >
              <p className="label-mono">{d.plan.validation}</p>
              {issues.length === 0 ? (
                <p className="mt-3 text-sm text-success">{d.plan.validationOk}</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {errors.map((i, idx) => (
                    <li key={`e${idx}`} className="text-destructive">
                      ✕ {localizeIssue(i)}
                    </li>
                  ))}
                  {warnings.map((i, idx) => (
                    <li key={`w${idx}`} className="text-warning">
                      ⚠ {localizeIssue(i)}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border bg-card p-4 sm:p-5">
              <p className="label-mono">{d.plan.model}</p>
              <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-5 text-muted-foreground">
                {`${d.plan.modelRoom}  ${plan.widthM.toFixed(2)} × ${plan.lengthM.toFixed(2)} × ${plan.heightM.toFixed(2)} m
${plan.walls
  .map(
    (w) =>
      `├── ${d.plan.walls[w.id].padEnd(11)} (${w.start.x.toFixed(2)},${w.start.z.toFixed(2)}) → (${w.end.x.toFixed(2)},${w.end.z.toFixed(2)})  len ${wallLength(w).toFixed(2)}m  rot ${wallAngleDeg(w).toFixed(0)}°  th ${w.thickness.toFixed(2)}m`,
  )
  .join("\n")}
└── ${d.plan.modelOpenings} ${plan.openings.length}`}
              </pre>
              {selectedWall && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {format(d.plan.selectedWallInfo, {
                    wall: d.plan.walls[selectedWall.id],
                    others: selectedWall.connectedTo.map((id) => d.plan.walls[id]).join(" & "),
                  })}
                </p>
              )}
            </section>

            {project.analysisNotes && project.analysisNotes.length > 0 && (
              <section className="rounded-xl border bg-card p-4 sm:p-5">
                <p className="label-mono">{d.plan.aiNotes}</p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {project.analysisNotes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 0.05,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step={step}
        min={0}
        value={Number(value.toFixed(3))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 font-mono text-sm"
      />
    </div>
  );
}

function WallSelect({
  value,
  onChange,
  className,
}: {
  value: WallKey;
  onChange: (value: WallKey) => void;
  className?: string;
}) {
  const d = useDict();
  return (
    <Select value={value} onValueChange={(v) => onChange(v as WallKey)}>
      <SelectTrigger className={className ?? "h-9 w-36 text-xs"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {WALL_ORDER.map((w) => (
          <SelectItem key={w} value={w}>
            {d.plan.walls[w]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
