import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildFloorPlan, type Opening } from "@/lib/room-model";
import { roomActions, useRoomProject } from "@/lib/room-store";

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

const FIELDS = [
  { key: "widthM", label: "Room Width", hint: "Left wall to right wall", step: 0.05 },
  { key: "lengthM", label: "Room Length", hint: "Front wall to back wall", step: 0.05 },
  { key: "heightM", label: "Ceiling Height", hint: "Floor to ceiling", step: 0.05 },
  { key: "doorWidth", label: "Door Width", hint: "On the back wall", step: 0.05 },
  { key: "doorHeight", label: "Door Height", hint: "On the back wall", step: 0.05 },
  { key: "windowWidth", label: "Window Width", hint: "On the front wall", step: 0.05 },
  { key: "windowHeight", label: "Window Height", hint: "On the front wall", step: 0.05 },
  { key: "windowSill", label: "Window Sill Height", hint: "Optional — floor to sill", step: 0.05 },
  { key: "wallThickness", label: "Wall Thickness", hint: "Optional", step: 0.01 },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

function MeasurementsPage() {
  const project = useRoomProject();
  const navigate = useNavigate();
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
        <p className="label-mono">Step 7 · Room data</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Room Measurements</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {photoCount === 6
            ? "All six surfaces captured. Now give the real dimensions so the reconstruction is to scale."
            : `${photoCount} of 6 surface photos captured. Enter the real dimensions to continue.`}{" "}
          All values are in metres.
        </p>

        <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="text-xs">
                  {f.label}
                </Label>
                <div className="relative">
                  <Input
                    id={f.key}
                    type="number"
                    inputMode="decimal"
                    step={f.step}
                    min={0}
                    value={values[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="font-mono pr-8"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                    m
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{f.hint}</p>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-xl border bg-card p-4 sm:p-5">
            <p className="label-mono">Summary</p>
            <pre className="mt-3 overflow-x-auto font-mono text-xs leading-6 text-muted-foreground">
{`Room Width:      ${values.widthM.toFixed(2)} m
Room Length:     ${values.lengthM.toFixed(2)} m
Ceiling Height:  ${values.heightM.toFixed(2)} m
Door Width:      ${values.doorWidth.toFixed(2)} m
Door Height:     ${values.doorHeight.toFixed(2)} m
Window Width:    ${values.windowWidth.toFixed(2)} m
Window Height:   ${values.windowHeight.toFixed(2)} m
Floor Area:      ${(values.widthM * values.lengthM).toFixed(2)} m²
Volume:          ${(values.widthM * values.lengthM * values.heightM).toFixed(2)} m³`}
            </pre>
            <Button className="mt-5 w-full" onClick={submit}>
              Build floor plan →
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
}
