import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { PanoramaViewer } from "@/components/vr/PanoramaViewer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { savePanorama } from "@/lib/photos";
import { format, useDict, type Dictionary } from "@/lib/i18n";
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
const N8N_WEBHOOK_URL = import.meta.env["VITE_N8N_WEBHOOK_URL"] as string | undefined;

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

const designStatusLabel = (panorama: PanoramaRecord, d: Dictionary): string => {
  if (panorama.status === "completed") {
    return panorama.designedFilePath
      ? d.vr.statusRedesignCompleted
      : d.vr.statusRedesignCompletedNoFile;
  }

  if (panorama.status === "processing") {
    return d.vr.statusGenerating;
  }

  if (panorama.status === "failed") {
    return d.vr.statusFailed;
  }

  return d.vr.statusWaiting;
};

const afterPanelContent = (panorama: PanoramaRecord, d: Dictionary) => {
  if (panorama.status === "processing") {
    return {
      title: d.vr.panelGeneratingTitle,
      body: d.vr.panelGeneratingBody,
    };
  }

  if (panorama.status === "failed") {
    return {
      title: d.vr.panelFailedTitle,
      body: d.vr.panelFailedBody,
    };
  }

  if (panorama.status === "completed" && !panorama.designedFilePath) {
    return {
      title: d.vr.panelIncompleteTitle,
      body: d.vr.panelIncompleteBody,
    };
  }

  return {
    title: d.vr.waitingTitle,
    body: d.vr.waitingBody,
  };
};

function VrPage() {
  const search = Route.useSearch();
  const d = useDict();
  const [panoramas, setPanoramas] = useState<PanoramaRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"after" | "split" | "before">("after");
  const [uploading, setUploading] = useState(false);
  const [newImageMessage, setNewImageMessage] = useState("");
  const [isGenerating360, setIsGenerating360] = useState(false);
  const [generatedPanoramaUrl, setGeneratedPanoramaUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastNewestIdRef = useRef<string | null>(null);
  const hasSetInitialPanoRef = useRef(false);

  const loadPanoramas = async (autoOpenNew = false) => {
    try {
      const response = await fetch("/api/panoramas");
      if (!response.ok) throw new Error(`Load panoramas failed (${response.status})`);
      const data = (await response.json()) as { panoramas?: PanoramaRecord[] };
      const loaded = data.panoramas ?? [];
      const newest = loaded.length ? loaded[0] : undefined;

      const targetPanoId = search.pano;
      if (targetPanoId && !hasSetInitialPanoRef.current) {
        const foundIdx = loaded.findIndex((p) => p.id === targetPanoId);
        if (foundIdx !== -1) {
          setSelectedIndex(foundIdx);
          hasSetInitialPanoRef.current = true;
        }
      }

      if (
        autoOpenNew &&
        newest &&
        lastNewestIdRef.current &&
        newest.id !== lastNewestIdRef.current
      ) {
        setSelectedIndex(0);
        setNewImageMessage(d.vr.newPanoramaReceived);
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
      alert(d.vr.alertUploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate360Direct = async () => {
    if (!N8N_WEBHOOK_URL) {
      alert(d.vr.alertMissingWebhook);
      return;
    }

    try {
      setIsGenerating360(true);
      setNewImageMessage(d.vr.generatingMessage);

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
      setNewImageMessage(d.vr.newPanoramaGenerated);
      setTimeout(() => setNewImageMessage(""), 5000);
    } catch (error) {
      console.error("Direct 360 generation error:", error);
      setNewImageMessage("");
      alert(
        error instanceof Error
          ? format(d.vr.alertGenerationFailedWithReason, { reason: error.message })
          : d.vr.alertGenerationFailed,
      );
    } finally {
      setIsGenerating360(false);
    }
  };

  const current = panoramas.length ? panoramas[selectedIndex] : undefined;
  const storedDesignAvailable = current ? isDesignAvailable(current) : false;
  const designAvailable = Boolean(generatedPanoramaUrl) || storedDesignAvailable;
  const afterContent = current ? afterPanelContent(current, d) : undefined;

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
    if (!window.confirm(d.vr.confirmDelete)) return;

    try {
      const response = await fetch(`/api/panoramas/${encodeURIComponent(panorama.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Delete failed (${response.status})`);
      setSelectedIndex(0);
      await loadPanoramas(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert(d.vr.alertDeleteFailed);
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
        <Link to="/" className="brand-link" title={d.vr.backToHome}>
          <img src={logo} alt="Pokibois" className="brand-logo" />
          <span>Pokibois</span>
        </Link>
        <div className="topbar-actions">
          <div
            className="view-toggle"
            style={{
              display: "flex",
              gap: "4px",
              background: "var(--color-secondary)",
              padding: "4px",
              borderRadius: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("after")}
              style={{
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: viewMode === "after" ? "var(--color-primary)" : "transparent",
                color:
                  viewMode === "after"
                    ? "var(--color-primary-foreground)"
                    : "var(--color-muted-foreground)",
                transition: "all 0.15s ease",
              }}
            >
              {d.vr.afterMode}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              style={{
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: viewMode === "split" ? "var(--color-primary)" : "transparent",
                color:
                  viewMode === "split"
                    ? "var(--color-primary-foreground)"
                    : "var(--color-muted-foreground)",
                transition: "all 0.15s ease",
              }}
            >
              {d.vr.splitMode}
            </button>
          </div>
          <LanguageSwitcher />
          <button
            type="button"
            className="upload-btn"
            disabled={isGenerating360}
            onClick={handleGenerate360Direct}
          >
            {isGenerating360 ? d.vr.generating360 : d.vr.generateDirect}
          </button>

          <button
            type="button"
            className="upload-btn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? d.vr.uploading : d.vr.uploadPanorama}
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

      {uploading && <div className="processing">{d.vr.processingSaving}</div>}
      {isGenerating360 && <div className="processing">{d.vr.processingGenerating}</div>}
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
              <strong>{format(d.vr.panoramaN, { n: index + 1 })}</strong>
              <span>{designStatusLabel(panorama, d)}</span>
            </div>
            <button
              type="button"
              className="delete-image"
              title={d.vr.deleteTitle}
              onClick={(event) => deletePanorama(event, panorama)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <main className="viewer-area">
        {current ? (
          <div
            className={`viewer-panels ${viewMode === "after" ? "single-view-after" : viewMode === "before" ? "single-view-before" : "split-view"}`}
            style={{ display: "flex", gap: "20px", width: "100%" }}
          >
            {(viewMode === "before" || viewMode === "split") && (
              <div className="viewer-wrapper" style={{ flex: 1, minWidth: 0 }}>
                <div className="panel-label">{d.vr.beforePanel}</div>
                <PanoramaViewer
                  imageUrl={current.filePath}
                  vrButtonId="vr-before"
                  alternateImageUrl={
                    generatedPanoramaUrl ??
                    (storedDesignAvailable && current.designedFilePath
                      ? current.designedFilePath
                      : null)
                  }
                  toggleLabel={d.vr.toggleAfter}
                  toggleBackLabel={d.vr.toggleBefore}
                />
                <div className="panel-top-controls">
                  <button
                    type="button"
                    onClick={(event) =>
                      openFullscreen(event.currentTarget.closest(".viewer-wrapper") as HTMLElement)
                    }
                  >
                    {d.vr.fullscreen}
                  </button>
                </div>
              </div>
            )}

            {(viewMode === "after" || viewMode === "split") && (
              <div className="viewer-wrapper" style={{ flex: 1, minWidth: 0 }}>
                <div className="panel-label">{d.vr.afterPanel}</div>
                {generatedPanoramaUrl || (storedDesignAvailable && current.designedFilePath) ? (
                  <PanoramaViewer
                    imageUrl={generatedPanoramaUrl ?? current.designedFilePath!}
                    vrButtonId="vr-after"
                    alternateImageUrl={current.filePath}
                    toggleLabel={d.vr.toggleBefore}
                    toggleBackLabel={d.vr.toggleAfter}
                  />
                ) : (
                  <div className="after-placeholder">
                    <div className="spinner" />
                    <strong>{afterContent?.title ?? d.vr.waitingTitle}</strong>
                    <p>{afterContent?.body ?? ""}</p>
                    <p>
                      {d.vr.enterVrAnywayA}
                      <em>{d.vr.enterVrAnywayEm}</em>
                      {d.vr.enterVrAnywayB}
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
                    {d.vr.fullscreen}
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

            <div className="viewer-help">{d.vr.helpText}</div>
          </div>
        ) : generatedPanoramaUrl ? (
          <div className="viewer-wrapper" style={{ width: "100%", minWidth: 0 }}>
            <div className="panel-label">{d.vr.generatedPanel}</div>
            <PanoramaViewer
              imageUrl={generatedPanoramaUrl}
              vrButtonId="vr-generated-direct"
              alternateImageUrl={null}
              toggleLabel={d.vr.toggleBefore}
              toggleBackLabel={d.vr.toggleAfter}
            />
          </div>
        ) : (
          <div className="empty-viewer">
            <h2>{d.vr.emptyTitle}</h2>
            <p>{d.vr.emptyBody}</p>
          </div>
        )}
      </main>

      {(current || generatedPanoramaUrl) && (
        <div className="bottom-info">
          <strong>
            {current
              ? format(d.vr.counterPanorama, {
                  index: selectedIndex + 1,
                  total: panoramas.length,
                })
              : d.vr.directAiPanorama}
          </strong>
          <span className={designAvailable ? "ai-status" : undefined}>
            {generatedPanoramaUrl
              ? d.vr.directResultReady
              : current
                ? designStatusLabel(current, d)
                : ""}
          </span>
        </div>
      )}
    </div>
  );
}
