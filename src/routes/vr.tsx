import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { PanoramaViewer } from "@/components/vr/PanoramaViewer";
import { savePanorama } from "@/lib/photos";
import logo from "@/assets/logo.jpg";
import "./vr.css";

export const Route = createFileRoute("/vr")({
  component: VrPage,
});

type PanoramaRecord = {
  id: string;
  projectId: string;
  filePath: string;
  designedFilePath: string | null;
  status: "pending" | "completed";
  createdAt: string;
};

const isDesignAvailable = (panorama: PanoramaRecord): boolean =>
  panorama.status === "completed" && Boolean(panorama.designedFilePath);

function VrPage() {
  const [panoramas, setPanoramas] = useState<PanoramaRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [newImageMessage, setNewImageMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastNewestIdRef = useRef<string | null>(null);

  const loadPanoramas = async (autoOpenNew = false) => {
    try {
      const response = await fetch("/api/panoramas");
      if (!response.ok) throw new Error(`Load panoramas failed (${response.status})`);
      const data = (await response.json()) as { panoramas?: PanoramaRecord[] };
      const loaded = data.panoramas ?? [];
      const newest = loaded.length ? loaded[0] : undefined;

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

  const current = panoramas.length ? panoramas[selectedIndex] : undefined;
  const designAvailable = current ? isDesignAvailable(current) : false;

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
              <span>{isDesignAvailable(panorama) ? "✓ Design ready" : "⏳ Designing..."}</span>
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
          <div className="viewer-panels">
            <div className="viewer-wrapper">
              <div className="panel-label">BEFORE — Original Panorama</div>
              <PanoramaViewer imageUrl={current.filePath} vrButtonId="vr-before" />
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

            <div className="viewer-wrapper">
              <div className="panel-label">AFTER — AI Designed Panorama</div>
              {designAvailable && current.designedFilePath ? (
                <PanoramaViewer imageUrl={current.designedFilePath} vrButtonId="vr-after" />
              ) : (
                <div className="after-placeholder">
                  <div className="spinner" />
                  <strong>AI is designing your panorama…</strong>
                  <p>It will appear here automatically when generation is completed.</p>
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
        ) : (
          <div className="empty-viewer">
            <h2>Waiting for panorama...</h2>
            <p>Upload a panorama or wait for a new 360 capture.</p>
          </div>
        )}
      </main>

      {current && (
        <div className="bottom-info">
          <strong>
            Panorama {selectedIndex + 1} / {panoramas.length}
          </strong>
          <span className={designAvailable ? "ai-status" : undefined}>
            {designAvailable ? "AI Design ready ✓" : "AI design in progress…"}
          </span>
        </div>
      )}
    </div>
  );
}
