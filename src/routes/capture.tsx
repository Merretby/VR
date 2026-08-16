import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { CameraView } from "@/components/camera/CameraView";
import { roomActions, useRoomProject } from "@/lib/room-store";
import { buildFloorPlan, SURFACE_META, SURFACE_ORDER, type SurfaceKey } from "@/lib/room-model";
import { CornerSelection } from "@/components/room3d/CornerSelection";
import { resizeImage, cropImage, type Point } from "@/lib/image-processor";
import { createProject, processPhoto } from "@/lib/photos";
import { getActiveProjectId, setActiveProjectId } from "@/lib/project-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import exampleRight from "@/assets/example-right-wall.jpg";
import exampleFront from "@/assets/example-front-wall.jpg";
import exampleLeft from "@/assets/example-left-wall.jpg";
import exampleBack from "@/assets/example-back-wall.jpg";
import exampleFloor from "@/assets/example-floor.png";
import exampleCeiling from "@/assets/example-ceiling.png";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [
      { title: "Guided Room Capture — Roomcast Studio" },
      {
        name: "description",
        content:
          "Photograph your room wall by wall in a fixed order: right wall, front wall with the window, left wall, then the back wall with the door.",
      },
      { property: "og:title", content: "Guided Room Capture — Roomcast Studio" },
      {
        property: "og:description",
        content: "Four guided photos with an example for each wall, then confirm and measure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CapturePage,
});

const EXAMPLES: Record<SurfaceKey, string> = {
  right: exampleRight,
  front: exampleFront,
  left: exampleLeft,
  back: exampleBack,
  floor: exampleFloor,
  ceiling: exampleCeiling,
};

const CHECKLIST = [
  "Stand far enough back that the entire wall is visible",
  "Keep the camera level and straight-on to the wall",
  "Include the floor line and the ceiling line",
  "Make sure the lighting is even, no strong glare",
  "No part of the wall may be cut off",
];

type Phase = "example" | "camera" | "review" | "review_crop";

function CapturePage() {
  const project = useRoomProject();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("example");
  const [shot, setShot] = useState<string | null>(null);
  const [corners, setCorners] = useState<[Point, Point, Point, Point] | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const projectIdRef = useRef<string | null>(null);

  useEffect(() => {
    const ensureProject = async () => {
      if (projectIdRef.current) return;

      const stored = getActiveProjectId();

      if (stored) {
        projectIdRef.current = stored;
        return;
      }

      try {
        const { projectId } = await createProject();
        setActiveProjectId(projectId);
        projectIdRef.current = projectId;
      } catch (error) {
        console.error("Could not create project:", error);
        toast.error("Could not create a project. Photos will not be saved.");
      }
    };

    void ensureProject();
  }, []);

  const surface = SURFACE_ORDER[index]!;
  const meta = SURFACE_META[surface];
  const example = EXAMPLES[surface];

  const confirm = async () => {
    if (!shot || !corners) return;
    
    setIsProcessing(true);
    
    try {
      // 1. Perspective-crop on the frontend (pure JS, no OpenCV needed)
      const croppedBase64 = await cropImage(shot, corners);
      
      // 2. Show the cropped image immediately to the user
      setCroppedImageUrl(croppedBase64);
      setPhase("review_crop");
      
      // 3. Upload to backend in the background (non-blocking)
      processPhoto({
        data: {
          projectId: projectIdRef.current ?? "default-project",
          wallKey: surface,
          image: croppedBase64,
          corners
        }
      }).catch((err) => {
        console.warn("Backend save failed, using local crop:", err);
      });
    } catch (err) {
      console.error("Failed to crop image:", err);
      toast.error("Failed to crop the image. Please try again.");
      // Stay on the crop screen
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    if (!croppedImageUrl) return;
    
    roomActions.setPhoto(surface, croppedImageUrl);
    setShot(null);
    setCorners(null);
    setCroppedImageUrl(null);
    
    if (index === SURFACE_ORDER.length - 1) {
      const plan = buildFloorPlan({
        widthM: project.plan.widthM,
        lengthM: project.plan.lengthM,
        heightM: project.plan.heightM,
        wallThickness: project.plan.walls[0]?.thickness ?? 0.12,
        openings: project.plan.openings,
      });
      roomActions.setPlan(plan, "capture");
      navigate({ to: "/plan" });
    } else {
      setIndex(index + 1);
      setPhase("example");
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader current="/capture" />
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-4 sm:py-8">
        <p className="label-mono">Step {meta.step} of 6</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{meta.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{meta.hint}</p>

        <div className="mt-5 flex gap-1.5 sm:gap-2">
          {SURFACE_ORDER.map((key, i) => {
            const done = Boolean(project.photos[key]);
            return (
              <div
                key={key}
                className={`h-1.5 flex-1 rounded-full ${
                  done ? "bg-success" : i === index ? "bg-primary" : "bg-secondary"
                }`}
              />
            );
          })}
        </div>

        <div className="mt-5 sm:mt-8">
          {phase === "example" && (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-[1.2fr_1fr]">
              <figure>
                <img
                  src={example}
                  alt={`Example photo of a ${meta.title.toLowerCase()} — ${meta.contains}`}
                  width={2048}
                  height={768}
                  loading="lazy"
                  className="w-full rounded-xl border object-cover"
                />
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  Example — {meta.contains}. Match this framing.
                </figcaption>
              </figure>
              <div className="rounded-xl border bg-card p-4 sm:p-5">
                <h2 className="text-sm font-semibold">Before you shoot</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {CHECKLIST.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-5 w-full" onClick={() => setPhase("camera")}>
                  📷 Take Picture
                </Button>
              </div>
            </div>
          )}

          {phase === "camera" && (
            <CameraView
              onCancel={() => setPhase("example")}
              onShot={async (dataUrl) => {
                const resized = await resizeImage(dataUrl, 2048);
                setShot(resized);
                setPhase("review");
              }}
            />
          )}

          {phase === "review" && shot && (
            <div className="flex flex-col h-[100dvh] bg-black text-white relative">
              <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10">
                <h2 className="font-semibold text-lg drop-shadow-md">Crop {surface.replace("-", " ")}</h2>
                <Button variant="secondary" size="sm" onClick={() => { setShot(null); setCorners(null); setPhase("camera"); }}>
                  Cancel
                </Button>
              </div>

              <div className="flex-1 relative pb-[100px] overflow-hidden">
                <CornerSelection imageSrc={shot} onCornersChange={setCorners} />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-6 flex justify-between bg-gradient-to-t from-black/80 to-transparent">
                <Button
                  variant="secondary"
                  className="rounded-full"
                  size="lg"
                  disabled={isProcessing}
                  onClick={() => { setShot(null); setCorners(null); setPhase("camera"); }}
                >
                  Retake
                </Button>
                <Button
                  className="rounded-full"
                  size="lg"
                  disabled={isProcessing || !corners}
                  onClick={confirm}
                >
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isProcessing ? "Processing..." : "Confirm Wall"}
                </Button>
              </div>
            </div>
          )}

          {phase === "review_crop" && croppedImageUrl && (
            <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
              <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
                <h2 className="font-semibold text-lg drop-shadow-md">Review Cropped Wall</h2>
                <Button variant="secondary" size="sm" onClick={() => { setPhase("camera"); setCroppedImageUrl(null); setShot(null); setCorners(null); }}>
                  Cancel
                </Button>
              </div>

              <div className="flex-1 relative flex items-center justify-center p-4 pb-[100px] overflow-hidden">
                <img 
                  src={croppedImageUrl} 
                  alt="Cropped wall result" 
                  className="max-w-full max-h-full object-contain rounded-md"
                />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-6 flex justify-between bg-gradient-to-t from-black/80 to-transparent">
                <Button
                  variant="secondary"
                  className="rounded-full"
                  size="lg"
                  onClick={() => { setPhase("camera"); setCroppedImageUrl(null); setShot(null); setCorners(null); }}
                >
                  Retake
                </Button>
                <Button
                  className="rounded-full bg-success text-success-foreground hover:bg-success/90"
                  size="lg"
                  onClick={handleContinue}
                >
                  Save & Continue
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-4 sm:mt-10 sm:gap-3 sm:pt-5">
          <Button
            variant="ghost"
            disabled={index === 0}
            onClick={() => {
              setIndex(Math.max(0, index - 1));
              setPhase("example");
              setShot(null);
            }}
          >
            ← Previous wall
          </Button>
          <Button variant="ghost" onClick={() => navigate({ to: "/studio" })}>
            Skip to 3D studio →
          </Button>
        </div>
      </main>
    </div>
  );
}
