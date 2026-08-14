import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function CameraView({
  onShot,
  onCancel,
}: {
  onShot: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("Camera unavailable — upload a photo of the wall instead."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const shoot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onShot(canvas.toDataURL("image/jpeg", 0.82));
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full object-cover" />
        <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-dashed border-primary/70" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={shoot} disabled={!!error}>
          📷 Take Picture
        </Button>
        <label className="inline-flex cursor-pointer items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary">
          Upload instead
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => onShot(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <Button variant="ghost" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
}
