import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import { XR, XROrigin, createXRStore } from "@react-three/xr";
import * as THREE from "three";
import { RoomScene } from "./RoomScene";
import type { Design, FloorPlan } from "@/lib/room-model";
import { Button } from "@/components/ui/button";
import { capture360Panorama, downloadDataUrl } from "@/lib/panorama-export";
import { savePanorama } from "@/lib/photos";
import { toast } from "sonner";

export type ViewMode = "orbit" | "top" | "panorama";

const store = createXRStore();

/**
 * Bridge component inside <Canvas> to access Three.js renderer and scene.
 * Handles both the manual panorama download and an automatic capture that
 * fires once the scene's textures have finished loading.
 */
function PanoramaExporterBridge({
  onRegisterExport,
  onRegisterCapture,
  plan,
  autoCapture,
  onAutoCapture,
}: {
  onRegisterExport: (fn: () => void) => void;
  onRegisterCapture: (fn: () => string) => void;
  plan: FloorPlan;
  autoCapture?: boolean | undefined;
  onAutoCapture?: ((dataUrl: string) => void) | undefined;
}) {
  const { gl, scene } = useThree();
  const { active } = useProgress();
  const capturedRef = useRef(false);

  const capture = useCallback(
    (resolution = 4096) => {
      const eyePosition = new THREE.Vector3(plan.widthM / 2, 1.6, plan.lengthM / 2);
      return capture360Panorama(gl, scene, eyePosition, resolution);
    },
    [gl, scene, plan],
  );

  useEffect(() => {
    onRegisterCapture(() => capture(4096));
  }, [onRegisterCapture, capture]);

  useEffect(() => {
    onRegisterExport(() => {
      try {
        downloadDataUrl(capture(), `room-360-panorama-${Date.now()}.png`);
        toast.success("360° Panoramic view downloaded!");
      } catch (err) {
        console.error("Panorama export failed", err);
        toast.error("Failed to generate panoramic view.");
      }
    });
  }, [onRegisterExport, capture]);

  useEffect(() => {
    if (!autoCapture || active || capturedRef.current) return;
    capturedRef.current = true;
    const t = setTimeout(() => {
      try {
        onAutoCapture?.(capture(2048));
      } catch (err) {
        console.error("Auto panorama capture failed", err);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [autoCapture, active, onAutoCapture, capture]);

  return null;
}

function CameraRig({ mode, plan }: { mode: ViewMode; plan: FloorPlan }) {
  const { camera } = useThree();
  const controls = useRef<never>(null);
  const centre: [number, number, number] = [plan.widthM / 2, 1.2, plan.lengthM / 2];

  useEffect(() => {
    if (mode === "orbit") {
      camera.position.set(
        plan.widthM / 2 + plan.widthM * 1.1,
        plan.heightM * 1.8,
        plan.lengthM * 1.9,
      );
    } else if (mode === "top") {
      camera.position.set(
        plan.widthM / 2,
        Math.max(plan.widthM, plan.lengthM) * 1.7,
        plan.lengthM / 2 + 0.001,
      );
    } else if (mode === "panorama") {
      camera.position.set(plan.widthM / 2, 1.6, plan.lengthM / 2);
    }
    camera.updateProjectionMatrix();
  }, [mode, camera, plan.widthM, plan.lengthM, plan.heightM]);

  if (mode === "panorama") {
    return (
      <OrbitControls
        key="panorama-controls"
        ref={controls}
        target={[plan.widthM / 2, 1.6, plan.lengthM / 2 - 0.01]}
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.35}
        makeDefault
      />
    );
  }

  return (
    <OrbitControls
      key="orbit-controls"
      ref={controls}
      target={centre}
      makeDefault
      enablePan
      maxPolarAngle={Math.PI / 2.05}
      minDistance={1.5}
      maxDistance={Math.max(plan.widthM, plan.lengthM) * 4}
    />
  );
}

export default function RoomExperience({
  plan,
  design,
  photos,
  selectedId,
  onSelect,
  autoCapturePanorama,
  onAutoCapturePanorama,
}: {
  plan: FloorPlan;
  design: Design;
  photos?: Partial<Record<string, string>> | undefined;
  selectedId?: string | null | undefined;
  onSelect?: ((id: string) => void) | undefined;
  autoCapturePanorama?: boolean | undefined;
  onAutoCapturePanorama?: ((dataUrl: string) => void) | undefined;
}) {
  const [mode, setMode] = useState<ViewMode>("orbit");
  const [userShowCeiling, setUserShowCeiling] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isEnteringVR, setIsEnteringVR] = useState(false);
  const exporterRef = useRef<(() => void) | null>(null);
  const captureRef = useRef<(() => string) | null>(null);
  const navigate = useNavigate();

  // In Top View, ceiling is ALWAYS hidden so user can see inside the room floor plan
  const effectiveShowCeiling = mode === "top" ? false : userShowCeiling;

  const handleRegisterExport = useCallback((fn: () => void) => {
    exporterRef.current = fn;
  }, []);

  const handleRegisterCapture = useCallback((fn: () => string) => {
    captureRef.current = fn;
  }, []);

  const handleEnterVR = async () => {
    if (!captureRef.current) {
      toast.error("Panorama renderer is not ready yet.");
      return;
    }

    setIsEnteringVR(true);
    toast.info("Capturing 360° panorama…");

    try {
      const dataUrl = captureRef.current();
      const result = await savePanorama({
        data: { projectId: "default-project", image: dataUrl },
      });
      toast.success("360° panorama saved — entering VR");
      console.log("Panorama saved:", result.filePath);
    } catch (err) {
      console.error("Enter VR panorama save failed:", err);
      toast.error("Panorama could not be saved, but you can still enter VR.");
    } finally {
      setIsEnteringVR(false);
      navigate({ to: "/vr" });
    }
  };

  const handleDownloadPanorama = () => {
    if (!exporterRef.current) {
      toast.error("Panorama exporter is not ready.");
      return;
    }
    setIsExporting(true);
    toast.info("Generating 360° Panoramic View...");
    setTimeout(() => {
      try {
        exporterRef.current?.();
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  const modes: { id: ViewMode; label: string }[] = useMemo(
    () => [
      { id: "orbit", label: "Orbit" },
      { id: "top", label: "Top view" },
      { id: "panorama", label: "Panoramic view" },
    ],
    [],
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border bg-card">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 62, near: 0.05, far: 200 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <color attach="background" args={["#14161a"]} />
        <XR store={store}>
          <XROrigin position={[plan.widthM / 2, 0, plan.lengthM - 0.9]} />
          <Suspense fallback={null}>
            <RoomScene
              plan={plan}
              design={design}
              photos={photos}
              showCeiling={effectiveShowCeiling}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </Suspense>
        </XR>
        <CameraRig mode={mode} plan={plan} />
        <PanoramaExporterBridge
          onRegisterExport={handleRegisterExport}
          onRegisterCapture={handleRegisterCapture}
          plan={plan}
          autoCapture={autoCapturePanorama}
          onAutoCapture={onAutoCapturePanorama}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap gap-1 rounded-lg border bg-background/85 p-1 backdrop-blur">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-2">
          {mode !== "top" && (
            <Button
              size="sm"
              variant="outline"
              className="bg-background/85 backdrop-blur font-medium text-xs shadow-sm hover:bg-accent"
              onClick={() => setUserShowCeiling((prev) => !prev)}
            >
              {userShowCeiling ? "🏛 Ceiling: ON" : "🏛 Ceiling: OFF"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="bg-background/85 backdrop-blur font-medium text-xs shadow-sm hover:bg-accent"
            onClick={handleDownloadPanorama}
            disabled={isExporting}
          >
            📸 Download Panorama
          </Button>
          <Button size="sm" onClick={handleEnterVR} disabled={isEnteringVR}>
            {isEnteringVR ? "Capturing…" : "🥽 Enter VR"}
          </Button>
        </div>
      </div>

      {mode === "panorama" && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-md bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span>You are standing inside the room — drag to look around 360°</span>
        </div>
      )}
    </div>
  );
}
