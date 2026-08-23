import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildFloorPlan, type Opening } from "@/lib/room-model";
import { roomActions, useRoomProject } from "@/lib/room-store";
import { format, useDict } from "@/lib/i18n";

export const Route = createFileRoute("/measurements")({
  head: () => ({
    meta: [
      { title: "Room Measurements — Roomcast Studio" },
      {
        name: "description",
        content:
          "Enter room width, length, ceiling height and door/window sizes so the 3D reconstruction matches your real space exactly.",
      },
      { property: "og:title", content: "Room Measurements — Roomcast Studio" },
      {
        property: "og:description",
        content: "Real dimensions in metres drive the exact geometry of your 3D room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeasurementsPage,
});

const FIELD_KEYS = [
  "widthM",
  "lengthM",
  "heightM",
  "doorWidth",
  "doorHeight",
  "windowWidth",
  "windowHeight",
  "windowSill",
  "wallThickness",
] as const;

type FieldKey = (typeof FIELD_KEYS)[number];

function MeasurementsPage() {
  const project = useRoomProject();
  const navigate = useNavigate();
  const d = useDict();
  const existingDoor = project.plan.openings.find((o) => o.type === "door");
  const existingWindow = project.plan.openings.find((o) => o.type === "window");

  const [values, setValues] = useState<Record<FieldKey, number>>({
    widthM: project.plan.widthM,
    lengthM: project.plan.lengthM,
    heightM: project.plan.heightM,
    doorWidth: existingDoor?.width ?? 0.9,
    doorHeight: existingDoor?.height ?? 2.05,
    windowWidth: existingWindow?.width ?? 1.5,
    windowHeight: existingWindow?.height ?? 1.2,
    windowSill: existingWindow?.sill ?? 0.9,
    wallThickness: project.plan.walls[0]?.thickness ?? 0.12,
  });

  const update = (key: FieldKey, raw: string) => {
    const n = Number(raw);
    setValues((v) => ({ ...v, [key]: Number.isFinite(n) ? n : 0 }));
  };

  const submit = () => {
    const openings: Opening[] = [];
    if (values.doorWidth > 0 && values.doorHeight > 0) {
      openings.push({
        id: "door-1",
        wallId: "back",
        type: "door",
        offset: values.widthM / 2,
        width: values.doorWidth,
        height: values.doorHeight,
        sill: 0,
      });
    }
    if (values.windowWidth > 0 && values.windowHeight > 0) {
      openings.push({
        id: "window-1",
        wallId: "front",
        type: "window",
        offset: values.widthM / 2,
        width: values.windowWidth,
        height: values.windowHeight,
        sill: values.windowSill,
      });
    }

    const plan = buildFloorPlan({
      widthM: values.widthM,
      lengthM: values.lengthM,
      heightM: values.heightM,
      wallThickness: values.wallThickness,
      openings,
    });
    roomActions.setPlan(plan, "capture");
    navigate({ to: "/plan" });
  };

  const photoCount = Object.keys(project.photos).length;

  return (
    <div className="min-h-screen">
      <AppHeader current="/measurements" />
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-4 sm:py-8">
        <p className="label-mono">{d.measurements.stepLabel}</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{d.measurements.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {photoCount === 6
            ? d.measurements.introAll
            : format(d.measurements.introPartial, { count: photoCount })}{" "}
          {d.measurements.introScale} {d.measurements.introMetres}
        </p>

        <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELD_KEYS.map((key) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-xs">
                  {d.measurements.fields[key].label}
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="number"
                    inputMode="decimal"
                    step={0.05}
                    min={0}
                    value={values[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="font-mono pr-8"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                    m
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {d.measurements.fields[key].hint}
                </p>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-xl border bg-card p-4 sm:p-5">
            <p className="label-mono">{d.measurements.summaryLabel}</p>
            <pre className="mt-3 overflow-x-auto font-mono text-xs leading-6 text-muted-foreground">
              {`${d.measurements.summary.roomWidth.padEnd(17)}${values.widthM.toFixed(2)} m
${d.measurements.summary.roomLength.padEnd(17)}${values.lengthM.toFixed(2)} m
${d.measurements.summary.ceilingHeight.padEnd(17)}${values.heightM.toFixed(2)} m
${d.measurements.summary.doorWidth.padEnd(17)}${values.doorWidth.toFixed(2)} m
${d.measurements.summary.doorHeight.padEnd(17)}${values.doorHeight.toFixed(2)} m
${d.measurements.summary.windowWidth.padEnd(17)}${values.windowWidth.toFixed(2)} m
${d.measurements.summary.windowHeight.padEnd(17)}${values.windowHeight.toFixed(2)} m
${d.measurements.summary.floorArea.padEnd(17)}${(values.widthM * values.lengthM).toFixed(2)} m²
${d.measurements.summary.volume.padEnd(17)}${(values.widthM * values.lengthM * values.heightM).toFixed(2)} m³`}
            </pre>
            <Button className="mt-5 w-full" onClick={submit}>
              {d.measurements.submit}
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
}
