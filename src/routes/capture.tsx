import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { saveCapturedPhotos, saveVisionBoard, createProject } from "@/lib/photos";
import { getActiveProjectId, setActiveProjectId } from "@/lib/project-store";
import { format, useDict } from "@/lib/i18n";
import {
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Camera,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import moodboardDefault from "@/assets/moodboards/moodbord.jpg";
import moodboard1 from "@/assets/moodboards/moodbord-1.jpg";
import moodboard2 from "@/assets/moodboards/moodbord-2.jpg";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [
      { title: "Capture & Redesign Room — Roomcast Studio" },
      {
        name: "description",
        content:
          "Take photos of your room, select the best shots, choose your interior moodboard, and experience your 360° AI redesign in VR.",
      },
    ],
  }),
  component: CapturePage,
});

type Phase = "camera" | "select" | "moodboard";

type MoodboardKey = "luxury-warmth" | "japandi-minimal" | "contemporary-chic";

interface MoodboardOption {
  id: MoodboardKey;
  image: string;
}

const MOODBOARDS: MoodboardOption[] = [
  { id: "luxury-warmth", image: moodboardDefault },
  { id: "japandi-minimal", image: moodboard1 },
  { id: "contemporary-chic", image: moodboard2 },
];

function CapturePage() {
  const navigate = useNavigate();
  const d = useDict();
  const [phase, setPhase] = useState<Phase>("camera");
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraErrorMessageRef = useRef(d.capture.cameraError);
  cameraErrorMessageRef.current = d.capture.cameraError;
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const projectIdRef = useRef<string>("default-project");

  // Ensure project exists
  useEffect(() => {
    const ensureProj = async () => {
      const stored = getActiveProjectId();
      if (stored) {
        projectIdRef.current = stored;
        return;
      }
      try {
        const { projectId } = await createProject();
        if (projectId) {
          setActiveProjectId(projectId);
          projectIdRef.current = projectId;
        }
      } catch (err) {
        console.warn("Project init fallback to default-project", err);
      }
    };
    void ensureProj();
  }, []);

  // Initialize camera when in camera phase
  useEffect(() => {
    if (phase !== "camera") {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      })
      .catch(() => {
        setCameraError(cameraErrorMessageRef.current);
      });

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [phase]);

  // Snap photo from live camera
  const handleSnapPhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

    // Visual shutter flash effect
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    setPhotos((prev) => {
      const updated = [...prev, dataUrl];
      // By default select all taken photos
      setSelectedIndices(new Set(updated.map((_, i) => i)));
      return updated;
    });

    toast.success(format(d.capture.toastPhotoCaptured, { n: photos.length + 1 }));
  };

  // Batch file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    let processed = 0;
    const newPhotos: string[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          newPhotos.push(reader.result);
        }
        processed++;
        if (processed === files.length) {
          setPhotos((prev) => {
            const updated = [...prev, ...newPhotos];
            setSelectedIndices(new Set(updated.map((_, i) => i)));
            return updated;
          });
          toast.success(format(d.capture.toastPhotosAdded, { count: newPhotos.length }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Remove single photo
  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      setSelectedIndices((prevSelected) => {
        const nextSelected = new Set<number>();
        Array.from(prevSelected).forEach((idx) => {
          if (idx < indexToRemove) nextSelected.add(idx);
          else if (idx > indexToRemove) nextSelected.add(idx - 1);
        });
        return nextSelected;
      });
      return updated;
    });
  };

  // Toggle selection
  const toggleSelectPhoto = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Step 2: Confirm selected photos and save to database
  const handleSaveSelectedPhotos = async () => {
    const selectedList = photos.filter((_, i) => selectedIndices.has(i));
    if (!selectedList.length) {
      toast.error(d.capture.toastSelectAtLeastOne);
      return;
    }

    setIsSaving(true);
    setSavingMessage(format(d.capture.savingPhotos, { count: selectedList.length }));

    try {
      await saveCapturedPhotos({
        data: {
          projectId: projectIdRef.current,
          photos: selectedList,
        },
      });
      toast.success(format(d.capture.toastPhotosSaved, { count: selectedList.length }));
      setPhase("moodboard");
    } catch (error) {
      console.error("Failed to save photos to database:", error);
      toast.error(d.capture.toastSaveFailed);
      setPhase("moodboard");
    } finally {
      setIsSaving(false);
      setSavingMessage("");
    }
  };

  // Step 3: Choose moodboard & redirect to /vr
  const handleSelectMoodboard = async (moodboard: MoodboardOption) => {
    const moodboardName = d.capture.moodboards[moodboard.id].name;
    setSelectedMoodboard(moodboard.id);
    setIsSaving(true);
    setSavingMessage(format(d.capture.applying, { name: moodboardName }));

    try {
      // Convert asset image URL to base64 if needed or send direct image path
      const res = await fetch(moodboard.image);
      const blob = await res.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          await saveVisionBoard({
            data: {
              projectId: projectIdRef.current,
              image: base64data,
              moodboardId: moodboard.id,
            },
          });
          toast.success(d.capture.toastMoodboardSaved);
          navigate({ to: "/vr" });
        } catch (err) {
          console.error("Vision board save failed:", err);
          navigate({ to: "/vr" });
        }
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Moodboard selection failed:", err);
      navigate({ to: "/vr" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader current="/capture" />

      {/* Global Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 shadow-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-medium text-sm sm:text-base">{savingMessage}</p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        {/* ============================================================ */}
        {/* PHASE 1: CAMERA MULTI-SHOT CAPTURE */}
        {/* ============================================================ */}
        {phase === "camera" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="label-mono">{d.capture.step1Label}</p>
                <h1 className="mt-1 text-2xl font-semibold sm:text-3xl font-serif">
                  {d.capture.step1Title}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {d.capture.step1Desc}
                </p>
              </div>

              {photos.length > 0 && (
                <Button
                  size="lg"
                  className="mt-2 shadow-md sm:mt-0 font-medium"
                  onClick={() => setPhase("select")}
                >
                  {d.capture.reviewAndSelect} ({photos.length}){" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Viewfinder Container */}
            <div className="relative overflow-hidden rounded-2xl border bg-black shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aspect-[4/3] w-full object-cover max-h-[60vh]"
              />

              {/* Shutter Flash */}
              {isFlashActive && (
                <div className="absolute inset-0 bg-white opacity-80 transition-opacity" />
              )}

              {/* Viewfinder Grid Overlay */}
              <div className="pointer-events-none absolute inset-4 sm:inset-8 rounded-xl border border-white/20">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              </div>

              {/* Floating Counter Badge */}
              <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                📸{" "}
                {format(photos.length === 1 ? d.capture.photosTaken : d.capture.photosTakenPlural, {
                  count: photos.length,
                })}
              </div>

              {/* Camera Action Toolbar */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 h-4 w-4" /> {d.capture.upload}
                </Button>

                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  className="group relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/30 backdrop-blur transition-transform active:scale-95 hover:bg-white/50"
                  title={d.capture.snapPhoto}
                >
                  <span className="h-12 w-12 rounded-full bg-white transition-transform group-hover:scale-95" />
                </button>

                {photos.length > 0 && (
                  <Button
                    type="button"
                    size="lg"
                    className="rounded-full font-medium"
                    onClick={() => setPhase("select")}
                  >
                    {d.capture.done} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
                {cameraError}
              </div>
            )}

            {/* Hidden Multi-file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Bottom Photo Strip Tray */}
            {photos.length > 0 && (
              <div className="space-y-2 rounded-xl border bg-card p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {format(d.capture.capturedPhotos, { count: photos.length })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => setPhotos([])}
                  >
                    {d.capture.clearAll}
                  </Button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {photos.map((src, i) => (
                    <div
                      key={i}
                      className="group relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-black shadow-sm"
                      onClick={() => handleRemovePhoto(i)}
                      title={d.capture.clickToRemove}
                    >
                      <img
                        src={src}
                        alt={format(d.capture.shotAlt, { n: i + 1 })}
                        className="h-full w-full object-cover transition-opacity group-hover:opacity-40"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-5 w-5 text-destructive drop-shadow" />
                      </div>
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-bold text-white">
                        #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 2: PHOTO SELECTION GALLERY */}
        {/* ============================================================ */}
        {phase === "select" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="label-mono">{d.capture.step2Label}</p>
                <h1 className="mt-1 text-2xl font-semibold sm:text-3xl font-serif">
                  {d.capture.step2Title}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {d.capture.step2Desc}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPhase("camera")}>
                  <Plus className="mr-1.5 h-4 w-4" /> {d.capture.addMore}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (selectedIndices.size === photos.length) setSelectedIndices(new Set());
                    else setSelectedIndices(new Set(photos.map((_, i) => i)));
                  }}
                >
                  {selectedIndices.size === photos.length
                    ? d.capture.deselectAll
                    : d.capture.selectAll}
                </Button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
              {photos.map((src, idx) => {
                const isSelected = selectedIndices.has(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSelectPhoto(idx)}
                    className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary shadow-md ring-2 ring-primary/20 scale-[1.01]"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={src}
                      alt={format(d.capture.photoAlt, { n: idx + 1 })}
                      className="h-full w-full object-cover"
                    />

                    {/* Selection Badge */}
                    <div
                      className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border shadow ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-black/60 text-white/60 border-white/30"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </div>

                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                      {format(d.capture.photoBadge, { n: idx + 1 })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-4 rounded-2xl border bg-card/95 p-4 shadow-xl backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm font-medium">
                <span className="text-primary font-bold">{selectedIndices.size}</span>{" "}
                {d.capture.photosSelectedOf} {photos.length} {d.capture.photosSelectedUnit}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => setPhase("camera")}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> {d.capture.backToCamera}
                </Button>
                <Button
                  className="flex-1 sm:flex-none font-medium"
                  disabled={selectedIndices.size === 0 || isSaving}
                  onClick={handleSaveSelectedPhotos}
                >
                  {isSaving ? d.capture.savingToDatabase : d.capture.saveAndChooseMoodboard}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 3: MOODBOARD SELECTION & DIRECT VR REDIRECT */}
        {/* ============================================================ */}
        {phase === "moodboard" && (
          <div className="space-y-6">
            <div>
              <p className="label-mono">{d.capture.finalStepLabel}</p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl font-serif">
                {d.capture.chooseMoodboardTitle}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {d.capture.chooseMoodboardDesc}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {MOODBOARDS.map((mb) => {
                const mbT = d.capture.moodboards[mb.id];
                const isSelected = selectedMoodboard === mb.id;
                return (
                  <div
                    key={mb.id}
                    onClick={() => !isSaving && handleSelectMoodboard(mb)}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-card transition-all cursor-pointer hover:shadow-xl ${
                      isSelected
                        ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={mb.image}
                        alt={mbT.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px]">
                          <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow">
                            <CheckCircle2 className="h-4 w-4" /> {d.capture.selected}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h3 className="text-base font-semibold font-serif group-hover:text-primary transition-colors">
                        {mbT.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">
                        {mbT.subtitle}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {mbT.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Button
                        className="mt-4 w-full"
                        variant={isSelected ? "default" : "outline"}
                        disabled={isSaving}
                      >
                        <Sparkles className="mr-1.5 h-4 w-4" /> {d.capture.applyAndExperience}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
