import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { analyzeFloorPlan } from "@/lib/ai.functions";
import { buildFloorPlan, wallLength } from "@/lib/room-model";
import { roomActions } from "@/lib/room-store";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload a 2D Floor Plan — Roomcast Studio" },
      {
        name: "description",
        content:
          "Upload a JPG, PNG or PDF floor plan. AI detects walls, doors, windows, dimensions and rooms, then converts it into a structured 2D model.",
      },
      { property: "og:title", content: "Upload a 2D Floor Plan — Roomcast Studio" },
      {
        property: "og:description",
        content: "AI floor-plan analysis: walls, doors, windows and dimensions turned into structured geometry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

const DETECTS = [
  { icon: "🧱", label: "Walls" },
  { icon: "🚪", label: "Doors" },
  { icon: "🪟", label: "Windows" },
  { icon: "📏", label: "Dimensions" },
  { icon: "🏠", label: "Rooms" },
  { icon: "🛋", label: "Furniture" },
];

function UploadPage() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeFloorPlan);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [payload, setPayload] = useState<{ data: string; mime: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [detected, setDetected] = useState<string[] | null>(null);

  const onFile = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File is larger than 20 MB.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const base64 = url.split(",")[1] ?? "";
      setPayload({ data: base64, mime: file.type || "image/png" });
      setPreview(file.type === "application/pdf" ? null : url);
      setDetected(null);
    };
    reader.readAsDataURL(file);
  };

  const run = async () => {
    if (!payload) return;
    setBusy(true);
    try {
      const result = await analyze({
        data: { fileData: payload.data, mimeType: payload.mime, fileName },
      });

      const plan = buildFloorPlan({
        widthM: result.widthM,
        lengthM: result.lengthM,
        heightM: result.heightM || 2.7,
        openings: [
          {
            id: "door-1",
            wallId: "back",
            type: "door",
            offset: result.widthM / 2,
            width: result.doorWidth || 0.9,
            height: result.doorHeight || 2.05,
            sill: 0,
          },
          {
            id: "window-1",
            wallId: "front",
            type: "window",
            offset: result.widthM / 2,
            width: result.windowWidth || 1.4,
            height: result.windowHeight || 1.2,
            sill: 0.9,
          },
        ],
      });

      // Apply detected opening positions, clamped inside their walls.
      const back = plan.walls.find((w) => w.id === "back")!;
      const front = plan.walls.find((w) => w.id === "front")!;
      plan.openings = plan.openings.map((o) => {
        if (o.type === "door" && result.doorOffsetFromLeft > 0) {
          const len = wallLength(back);
          // back wall runs right→left, so mirror the "from left" offset
          const t = len - result.doorOffsetFromLeft;
          return { ...o, offset: Math.min(Math.max(t, o.width / 2 + 0.05), len - o.width / 2 - 0.05) };
        }
        if (o.type === "window" && result.windowOffsetFromLeft > 0) {
          const len = wallLength(front);
          const t = result.windowOffsetFromLeft;
          return { ...o, offset: Math.min(Math.max(t, o.width / 2 + 0.05), len - o.width / 2 - 0.05) };
        }
        return o;
      });

      roomActions.setPlan(plan, "upload");
      roomActions.setPlanImage(preview);
      roomActions.setAnalysisNotes(result.notes ?? []);
      setDetected(result.detected ?? []);
      toast.success(`Detected ${result.roomName || "room"} — ${result.widthM} × ${result.lengthM} m`);
      navigate({ to: "/plan" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      if (message.includes("429")) toast.error("AI is rate limited — try again in a moment.");
      else if (message.includes("402")) toast.error("AI credits exhausted — add credits to continue.");
      else toast.error("Could not analyse this plan. Try a clearer image, or enter measurements manually.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader current="/upload" />
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-4 sm:py-8">
        <p className="label-mono">Option 2</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Upload Your Floor Plan</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          JPG, PNG or PDF. The plan can contain walls, doors, windows, room boundaries, room
          names, dimensions and furniture — the AI reads all of it and returns structured
          geometry you can verify before anything is built in 3D.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {DETECTS.map((d) => (
            <span key={d.label} className="rounded-full border bg-card px-3 py-1 text-xs">
              {d.icon} {d.label}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
          <label
            className="blueprint-grid flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary sm:min-h-64 sm:p-8"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) onFile(file);
            }}
          >
            <span className="text-3xl">📐</span>
            <span className="mt-3 text-sm font-medium">
              {fileName || "Drop your floor plan here, or click to browse"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">JPG · PNG · PDF · max 20 MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
              }}
            />
          </label>

          <div className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="label-mono">AI analysis</p>
            <pre className="mt-3 font-mono text-xs leading-6 text-muted-foreground">
{`2D Image
   ↓
AI Analysis
   ↓
Walls + Doors + Windows + Dimensions
   ↓
Structured Floor Plan`}
            </pre>
            {preview && (
              <img
                src={preview}
                alt="Uploaded floor plan preview"
                className="mt-4 max-h-52 w-full rounded-lg border object-contain"
              />
            )}
            {detected && (
              <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                {detected.map((d) => (
                  <li key={d}>✓ {d}</li>
                ))}
              </ul>
            )}
            <Button className="mt-5 w-full" disabled={!payload || busy} onClick={run}>
              {busy ? "Analysing plan…" : "🤖 Analyse floor plan"}
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => navigate({ to: "/measurements" })}
            >
              Enter measurements manually instead
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
