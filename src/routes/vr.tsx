import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { PanoramaViewer } from "@/components/vr/PanoramaViewer";
import { savePanorama } from "@/lib/photos";
import logo from "@/assets/logo.jpg";
import "./vr.css";

export const Route = createFileRoute("/vr")({
  validateSearch: (search: Record<string, unknown>) => ({
    pano: (search.pano as string) || undefined,
  }),
  component: VrPage,
});

// Public n8n production webhook.
// Example in .env.local:
// VITE_N8N_WEBHOOK_URL=https://YOUR-N8N-TUNNEL.trycloudflare.com/webhook/panorama-redesign
const N8N_WEBHOOK_URL = import.meta.env['VITE_N8N_WEBHOOK_URL'] as string | undefined;

type PanoramaRecord = {
  id: string;
  projectId: string;
  filePath: string;
  designedFilePath: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
};

const isDesignAvailable = (panorama: PanoramaRecord): boolean =>
  panorama.status === "completed" && Boolean(panorama.designedFilePath);

const designStatusLabel = (panorama: PanoramaRecord): string => {
  if (panorama.status === "completed") {
    return panorama.designedFilePath ? "✓ Redesign completed" : "⚠ Redesign completed";
  }

  if (panorama.status === "processing") {
    return "⏳ Generating redesign...";
  }

  if (panorama.status === "failed") {
    return "✕ Redesign failed";
  }

  return "⏳ Waiting for redesign...";
};

const afterPanelContent = (panorama: PanoramaRecord) => {
  if (panorama.status === "processing") {
    return {
      title: "Generating redesign…",
      body: "The AI is working on your 360° redesign. It will appear here automatically.",
    };
  }

  if (panorama.status === "failed") {
    return {
      title: "Redesign failed",
      body: "Something went wrong during generation. The original panorama is still available below.",
    };
  }

  if (panorama.status === "completed" && !panorama.designedFilePath) {
    return {
      title: "Redesign completed (incomplete)",
      body: "The redesign was marked as completed but the generated file is missing. The original is still available.",
    };
  }

  return {
    title: "Waiting for redesign…",
    body: "It will appear here automatically once the AI generation is completed.",
  };
};

function VrPage() {
  const search = Route.useSearch();
  const [panoramas, setPanoramas] = useState<PanoramaRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"after" | "split" | "before">("after");
  const [uploading, setUploading] = useState(false);
  const [newImageMessage, setNewImageMessage] = useState("");
  const [isGenerating360, setIsGenerating360] = useState(false);
  const [generatedPanoramaUrl, setGeneratedPanoramaUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastNewestIdRef = useRef<string | null>(null);

  const loadPanoramas = async (autoOpenNew = false) => {
    try {
      const response = await fetch("/api/panoramas");
      if (!response.ok) throw new Error(`Load panoramas failed (${response.status})`);
      const data = (await response.json()) as { panoramas?: PanoramaRecord[] };
      const loaded = data.panoramas ?? [];
      const newest = loaded.length ? loaded[0] : undefined;

      const targetPanoId = search.pano;
      if (targetPanoId) {
        const foundIdx = loaded.findIndex((p) => p.id === targetPanoId);
        if (foundIdx !== -1) {
          setSelectedIndex(foundIdx);
        }
      }

      if (
        autoOpenNew &&
        newest &&
        lastNewestIdRef.current &&
        newest.id !== lastNewestIdRef.current
      ) {
        setSelectedIndex(0);
        setNewImageMessage("New 360 panorama received ✓");
        setTimeout(() => {
          setNewImageMessage("");
        }, 5000);
      }

      if (newest) {
        lastNewestIdRef.current = newest.id;
      }

      setPanoramas(loaded);
      setSelectedIndex((current) => {
        if (!loaded.length) return 0;
        if (current >= loaded.length) return loaded.length - 1;
        return current;
      });
    } catch (error) {
      console.error("Load panoramas error:", error);
    }
  };

  useEffect(() => {
    void loadPanoramas(false);
    const interval = setInterval(() => {
      void loadPanoramas(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
      reader.readAsDataURL(file);
    });

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      setUploading(true);
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        await savePanorama({
          data: { projectId: "default-project", image: dataUrl },
        });
      }
      await loadPanoramas(true);
      event.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      alert("Panorama upload failed. Check the server terminal.");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate360Direct = async () => {
    if (!N8N_WEBHOOK_URL) {
      alert(
        "Missing VITE_N8N_WEBHOOK_URL. Add the public n8n webhook URL to .env.local and restart the frontend.",
      );
      return;
    }

    try {
      setIsGenerating360(true);
      setNewImageMessage("Generating 360 panorama...");

      const payload = {
        projectId: "project_4",
        panoramaId: `pano_${Date.now()}`,
        projectName: "VR Direct Test",
        photos: [
          { wallKey: "front", url: "http://127.0.0.1:8090/front.png" },
          { wallKey: "right", url: "http://127.0.0.1:8090/right.png" },
          { wallKey: "back", url: "http://127.0.0.1:8090/back.png" },
          { wallKey: "left", url: "http://127.0.0.1:8090/left.png" },
        ],
        visionBoardPath: "http://127.0.0.1:8090/vision_board.jpg",
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Generation failed (${response.status})`);
      }

      const blob = await response.blob();

      if (!blob.type.startsWith("image/")) {
        const message = await blob.text();
        throw new Error(`n8n did not return an image: ${message}`);
      }

      const objectUrl = URL.createObjectURL(blob);

      setGeneratedPanoramaUrl((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        return objectUrl;
      });

      setViewMode("after");
      setNewImageMessage("New 360 panorama generated ✓");
      setTimeout(() => setNewImageMessage(""), 5000);
    } catch (error) {
      console.error("Direct 360 generation error:", error);
      setNewImageMessage("");
      alert(
        error instanceof Error
          ? `360 generation failed: ${error.message}`
          : "360 generation failed. Check n8n / ai360 / ComfyUI.",
      );
    } finally {
      setIsGenerating360(false);
    }
  };

  const current = panoramas.length ? panoramas[selectedIndex] : undefined;
  const storedDesignAvailable = current ? isDesignAvailable(current) : false;
  const designAvailable = Boolean(generatedPanoramaUrl) || storedDesignAvailable;
  const afterContent = current ? afterPanelContent(current) : undefined;

  const previousPanorama = () => {
    if (!panoramas.length) return;
    setSelectedIndex((currentIndex) =>
      currentIndex === 0 ? panoramas.length - 1 : currentIndex - 1,
    );
  };

  const nextPanorama = () => {
    if (!panoramas.length) return;
    setSelectedIndex((currentIndex) =>
      currentIndex === panoramas.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const deletePanorama = async (event: MouseEvent, panorama: PanoramaRecord) => {
    event.stopPropagation();
    if (!window.confirm("Delete this panorama?")) return;

    try {
      const response = await fetch(`/api/panoramas/${encodeURIComponent(panorama.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Delete failed (${response.status})`);
      setSelectedIndex(0);
      await loadPanoramas(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed.");
    }
  };

  const openFullscreen = async (element: HTMLElement) => {
    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand-link" title="Back to home page">
          <img src={logo} alt="Roomcast Studio" className="brand-logo" />
          <span>Roomcast Studio</span>
        </Link>
        <div className="topbar-actions">
          <div className="view-toggle" style={{ display: 'flex', gap: '4px', background: 'var(--color-secondary)', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setViewMode("after")}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                background: viewMode === "after" ? 'var(--color-primary)' : 'transparent',
                color: viewMode === "after" ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                transition: 'all 0.15s ease',
              }}
            >
              ✨ After (AI Redesign)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                background: viewMode === "split" ? 'var(--color-primary)' : 'transparent',
                color: viewMode === "split" ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                transition: 'all 0.15s ease',
              }}
            >
              Split View
            </button>
          </div>
          <button
            type="button"
            className="upload-btn"
            disabled={isGenerating360}
            onClick={handleGenerate360Direct}
          >
            {isGenerating360 ? "Generating 360..." : "✨ Generate 360 Direct"}
          </button>

          <button
            type="button"
            className="upload-btn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "+ Upload Panorama"}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleUpload}
        />
      </header>

      {uploading && <div className="processing">Saving panorama...</div>}
      {isGenerating360 && <div className="processing">AI is generating your 360 panorama...</div>}
      {newImageMessage && <div className="processing">{newImageMessage}</div>}

      <div className="thumbnails">
        {panoramas.map((panorama, index) => (
          <div
            key={panorama.id}
            className={index === selectedIndex ? "thumbnail active" : "thumbnail"}
            onClick={() => setSelectedIndex(index)}
          >
            <img src={panorama.filePath} alt="" />
            <div className="thumbnail-info">
              <strong>Panorama {index + 1}</strong>
              <span>{designStatusLabel(panorama)}</span>
            </div>
            <button
              type="button"
              className="delete-image"
              title="Delete panorama"
              onClick={(event) => deletePanorama(event, panorama)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <main className="viewer-area">
        {current ? (
          <div className={`viewer-panels ${viewMode === "after" ? "single-view-after" : viewMode === "before" ? "single-view-before" : "split-view"}`} style={{ display: 'flex', gap: '20px', width: '100%' }}>
            {(viewMode === "before" || viewMode === "split") && (
              <div className="viewer-wrapper" style={{ flex: 1, minWidth: 0 }}>
                <div className="panel-label">BEFORE — Original Panorama</div>
                <PanoramaViewer
                  imageUrl={current.filePath}
                  vrButtonId="vr-before"
                  alternateImageUrl={
                    generatedPanoramaUrl ??
                    (storedDesignAvailable && current.designedFilePath
                      ? current.designedFilePath
                      : null)
                  }
                  toggleLabel="AFTER"
                />
                <div className="panel-top-controls">
                  <button
                    type="button"
                    onClick={(event) =>
                      openFullscreen(event.currentTarget.closest(".viewer-wrapper") as HTMLElement)
                    }
                  >
                    ⛶ Fullscreen
                  </button>
                </div>
              </div>
            )}

            {(viewMode === "after" || viewMode === "split") && (
              <div className="viewer-wrapper" style={{ flex: 1, minWidth: 0 }}>
                <div className="panel-label">AFTER — AI Designed Panorama</div>
                {generatedPanoramaUrl || (storedDesignAvailable && current.designedFilePath) ? (
                  <PanoramaViewer
                    imageUrl={generatedPanoramaUrl ?? current.designedFilePath!}
                    vrButtonId="vr-after"
                    alternateImageUrl={current.filePath}
                    toggleLabel="BEFORE"
                  />
                ) : (
                  <div className="after-placeholder">
                    <div className="spinner" />
                    <strong>{afterContent?.title ?? "Waiting for redesign…"}</strong>
                    <p>{afterContent?.body ?? ""}</p>
                    <p>
                      You can still <em>Enter VR</em> with the original panorama.
                    </p>
                  </div>
                )}
                <div className="panel-top-controls">
                  <button
                    type="button"
                    onClick={(event) =>
                      openFullscreen(event.currentTarget.closest(".viewer-wrapper") as HTMLElement)
                    }
                  >
                    ⛶ Fullscreen
                  </button>
                </div>
              </div>
            )}

            {panoramas.length > 1 && (
              <>
                <button type="button" className="nav-arrow left-arrow" onClick={previousPanorama}>
                  ❮
                </button>
                <button type="button" className="nav-arrow right-arrow" onClick={nextPanorama}>
                  ❯
                </button>
              </>
            )}

            <div className="viewer-help">
              Drag to look around • Mouse wheel to zoom • ENTER VR for headset
            </div>
          </div>
        ) : generatedPanoramaUrl ? (
          <div className="viewer-wrapper" style={{ width: "100%", minWidth: 0 }}>
            <div className="panel-label">AI GENERATED 360 PANORAMA</div>
            <PanoramaViewer
              imageUrl={generatedPanoramaUrl}
              vrButtonId="vr-generated-direct"
              alternateImageUrl={null}
              toggleLabel="BEFORE"
            />
          </div>
        ) : (
          <div className="empty-viewer">
            <h2>Waiting for panorama...</h2>
            <p>Upload a panorama or generate a new 360 test.</p>
          </div>
        )}
      </main>

      {(current || generatedPanoramaUrl) && (
        <div className="bottom-info">
          <strong>
            {current
              ? `Panorama ${selectedIndex + 1} / ${panoramas.length}`
              : "Direct AI Panorama"}
          </strong>
          <span className={designAvailable ? "ai-status" : undefined}>
            {generatedPanoramaUrl
              ? "✓ Direct AI result ready"
              : current
                ? designStatusLabel(current)
                : ""}
          </span>
        </div>
      )}
    </div>
  );
}