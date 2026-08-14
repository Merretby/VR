import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { PanoramaViewer } from "@/components/vr/PanoramaViewer";
import logo from "@/assets/logo.jpg";
import "./vr.css";

export const Route = createFileRoute("/vr")({
  component: VrPage,
});

type PanoramaImage = {
  id: string;
  filename: string;
  originalName?: string;
  path: string;
  width?: number | string;
  height?: number | string;
  ratio?: string;
  quality?: string;
  isPanorama360?: boolean;
};

/**
 * Backend image paths are already same-origin (/files/enhanced/...); strip an
 * absolute origin if the backend ever returns one.
 */
function toImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      return new URL(path).pathname;
    } catch {
      return path;
    }
  }
  return path;
}

function VrPage() {
  const [images, setImages] = useState<PanoramaImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [newImageMessage, setNewImageMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastNewestImageRef = useRef<string | null>(null);

  const loadImages = async (autoOpenNew = false) => {
    try {
      const response = await fetch("/api/images");
      if (!response.ok) throw new Error(`Load images failed (${response.status})`);
      const data = (await response.json()) as { images?: PanoramaImage[] };
      const loaded = data.images ?? [];
      const newestImage = loaded.length ? loaded[0] : undefined;

      if (
        autoOpenNew &&
        newestImage &&
        lastNewestImageRef.current &&
        newestImage.id !== lastNewestImageRef.current
      ) {
        setSelectedIndex(0);
        setNewImageMessage("New 360 panorama received and processed ✓");
        setTimeout(() => {
          setNewImageMessage("");
        }, 5000);
      }

      if (newestImage) {
        lastNewestImageRef.current = newestImage.id;
      }

      setImages(loaded);
      setSelectedIndex((current) => {
        if (!loaded.length) return 0;
        if (current >= loaded.length) return loaded.length - 1;
        return current;
      });
    } catch (error) {
      console.error("Load images error:", error);
    }
  };

  useEffect(() => {
    void loadImages(false);
    const interval = setInterval(() => {
      void loadImages(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setUploading(true);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error(`Upload failed (${response.status})`);
      await loadImages(true);
      event.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      alert("AI processing failed. Check backend terminal.");
    } finally {
      setUploading(false);
    }
  };

  const currentImage = images.length ? images[selectedIndex] : undefined;

  const previousImage = () => {
    if (!images.length) return;
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const nextImage = () => {
    if (!images.length) return;
    setSelectedIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const deleteImage = async (event: MouseEvent, image: PanoramaImage) => {
    event.stopPropagation();
    if (!window.confirm("Delete this panorama?")) return;

    try {
      const response = await fetch(`/api/images/${encodeURIComponent(image.filename)}`, {
        method: "DELETE",
      });
      if (response.status === 423) {
        alert("Image is still busy. Try again in a few seconds.");
        return;
      }
      if (!response.ok) throw new Error(`Delete failed (${response.status})`);
      setSelectedIndex(0);
      await loadImages(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed.");
    }
  };

  const openFullscreen = async () => {
    const viewer = document.querySelector(".viewer-wrapper");
    if (!viewer) return;

    try {
      if (!document.fullscreenElement) {
        await viewer.requestFullscreen();
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
            {uploading ? "AI Processing..." : "+ Upload Images"}
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

      {uploading && <div className="processing">Real-ESRGAN is processing the panorama...</div>}
      {newImageMessage && <div className="processing">{newImageMessage}</div>}

      <div className="thumbnails">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={index === selectedIndex ? "thumbnail active" : "thumbnail"}
            onClick={() => setSelectedIndex(index)}
          >
            <img src={toImageUrl(image.path)} alt={image.originalName ?? ""} />
            <div className="thumbnail-info">
              <strong>Panorama {index + 1}</strong>
              <span>
                {image.width} × {image.height}
              </span>
              <span>{image.isPanorama360 ? "✓ 360 Ready" : "⚠ Not 2:1"}</span>
              <span>Quality: {image.quality}</span>
              <span className="ai-ready">✓ AI Enhanced</span>
            </div>
            <button
              type="button"
              className="delete-image"
              title="Delete panorama"
              onClick={(event) => deleteImage(event, image)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <main className="viewer-area">
        {currentImage ? (
          <div className="viewer-wrapper">
            <PanoramaViewer imageUrl={toImageUrl(currentImage.path)} />
            {images.length > 1 && (
              <>
                <button type="button" className="nav-arrow left-arrow" onClick={previousImage}>
                  ❮
                </button>
                <button type="button" className="nav-arrow right-arrow" onClick={nextImage}>
                  ❯
                </button>
              </>
            )}
            <div className="viewer-top-controls">
              <button type="button" onClick={openFullscreen}>
                ⛶ Fullscreen
              </button>
            </div>
            <div className="viewer-help">
              Drag to look around • Mouse wheel to zoom • ENTER VR for headset
            </div>
          </div>
        ) : (
          <div className="empty-viewer">
            <h2>Waiting for panorama...</h2>
            <p>Upload an image or wait for a new 360 panorama.</p>
          </div>
        )}
      </main>

      {currentImage && (
        <div className="bottom-info">
          <strong>
            Panorama {selectedIndex + 1} / {images.length}
          </strong>
          <span>
            {currentImage.width} × {currentImage.height}
          </span>
          <span>Ratio: {currentImage.ratio}</span>
          <span>{currentImage.isPanorama360 ? "360 Ready ✓" : "Not 2:1 ⚠"}</span>
          <span>Quality: {currentImage.quality}</span>
          <span className="ai-status">AI Enhanced ✓</span>
        </div>
      )}
    </div>
  );
}
