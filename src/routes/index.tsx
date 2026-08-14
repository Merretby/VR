import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { savePanorama } from "@/lib/photos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roomcast Studio — Turn Your Room Into an Interactive 3D Space" },
      {
        name: "description",
        content:
          "Capture your room wall by wall or upload a 2D floor plan. AI rebuilds it as an exact 3D model you can design, explore in 360° and walk through in VR.",
      },
      { property: "og:title", content: "Roomcast Studio — Interactive 3D Room Reconstruction" },
      {
        property: "og:description",
        content:
          "From photos or a floor plan to a geometry-accurate 3D room you can design, explore in 360° and enter in VR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const pipeline = [
  "Photos",
  "AI detection",
  "Structured 2D geometry",
  "Validation & correction",
  "Accurate 3D geometry",
  "Design · 360° · VR",
];

const features = [
  { icon: "🧱", title: "Exact wall geometry", body: "3D walls are extruded straight from the validated 2D coordinates — never repositioned." },
  { icon: "🔧", title: "Geometry validation", body: "Corner gaps, overlaps, angles, lengths and opening positions are checked before anything is built." },
  { icon: "🌀", title: "360° & VR", body: "Stand inside your room, look in every direction, or walk it at real scale in a headset." },
  { icon: "✨", title: "AI room designer", body: "Describe the room you want; AI furnishes it inside your real dimensions." },
  { icon: "🛋", title: "Real-scale furniture", body: "Every item carries true dimensions and tells you whether it fits." },
  { icon: "💾", title: "Multiple designs", body: "Save Original, Modern, Gaming, Luxury and switch between them in 3D." },
];

function UploadPanorama({ variant = "card" }: { variant?: "card" | "button" }) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true);
      try {
        await savePanorama({
          data: { projectId: "default-project", image: String(reader.result) },
        });
        toast.success("Panorama uploaded ✓");
        navigate({ to: "/vr" });
      } catch (error) {
        console.error("Panorama upload error:", error);
        toast.error("Panorama upload failed. Check the server terminal.");
      } finally {
        setBusy(false);
      }
    };
    reader.onerror = () => toast.error("Could not read the selected file.");
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
        className={
          variant === "card"
            ? "group rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary disabled:opacity-60 sm:p-5"
            : "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        }
      >
        {variant === "card" ? (
          <>
            <span className="text-2xl">🌐</span>
            <h2 className="mt-3 text-lg font-semibold">Upload Panorama</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a 360° panorama and explore it in VR.
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-primary">
              {busy ? "Uploading…" : "Upload →"}
            </span>
          </>
        ) : busy ? (
          "Uploading Panorama…"
        ) : (
          "🌐 Upload Panorama"
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <main>
        <section className="hero-glow relative overflow-hidden border-b">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <div>
              <p className="label-mono">AI room reconstruction · 3D design · VR</p>
              <h1 className="mt-4 text-3xl leading-[1.08] font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
                Transform Your Room Into an Interactive 3D Space
              </h1>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:mt-5 sm:text-base md:text-lg">
                Capture your room walls or upload it. Our AI reconstructs the
                space into an accurate 3D model that you can customize, explore in 360°, and
                experience in VR.
              </p>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  to="/capture"
                  className="group rounded-xl border bg-card p-4 transition-colors hover:border-primary sm:p-5"
                >
                  <span className="text-2xl">📸</span>
                  <h2 className="mt-3 text-lg font-semibold">Capture My Room</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Guided photos: right wall → front wall → left wall → back wall.
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-primary">
                    Start capture →
                  </span>
                </Link>
                <UploadPanorama variant="card" />
                <Link
                  to="/upload"
                  className="group rounded-xl border bg-card p-4 transition-colors hover:border-accent sm:p-5"
                >
                  <span className="text-2xl">📐</span>
                  <h2 className="mt-3 text-lg font-semibold">Upload 2D Floor Plan</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    JPG, PNG or PDF — AI detects walls, doors, windows and dimensions.
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-accent">
                    Upload plan → (Still not working)
                  </span>
                </Link>
              </div>
            </div>

            <div className="relative">
              <BeforeAfterSlider />
            </div>
          </div>
        </section>

        <section className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <p className="label-mono">The pipeline</p>
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {pipeline.map((p, i) => (
                <div key={p} className="flex items-center gap-2 flex-shrink-0">
                  <span className="rounded-lg border bg-card px-3 py-2 font-mono text-xs">
                    {p}
                  </span>
                  {i < pipeline.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
              The AI understands your room — it never invents or repositions geometry. Left wall,
              right wall, front wall, back wall, doors, windows and corners stay exactly where you
              put them, all the way into VR.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
            <h2 className="text-2xl font-semibold sm:text-3xl">Everything in one place</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border bg-card p-5">
                  <span className="text-xl">{f.icon}</span>
                  <h3 className="mt-3 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/capture">📸 Capture My Room</Link>
              </Button>
              <UploadPanorama variant="button" />
              <Button asChild size="lg" variant="secondary">
                <Link to="/upload">📐 Upload 2D Floor Plan (Still not working) </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-muted-foreground">
          Roomcast Studio — photos or plan in, geometry-accurate 3D out.
        </div>
      </footer>
    </div>
  );
}
