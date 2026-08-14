import { useState, useRef, useEffect, useCallback } from "react";
import { type Point } from "@/lib/image-processor";

interface CornerSelectionProps {
  imageSrc: string;
  onCornersChange: (corners: [Point, Point, Point, Point] | null) => void;
}

export function CornerSelection({ imageSrc, onCornersChange }: CornerSelectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);
  
  // Corners in relative coordinates [0-1]
  // TL, TR, BR, BL
  const [corners, setCorners] = useState<[Point, Point, Point, Point]>([
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.1 },
    { x: 0.9, y: 0.9 },
    { x: 0.1, y: 0.9 },
  ]);

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ w: img.width, h: img.height });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imageSize) return;
    onCornersChange([
      { x: imageSize.w * corners[0].x, y: imageSize.h * corners[0].y },
      { x: imageSize.w * corners[1].x, y: imageSize.h * corners[1].y },
      { x: imageSize.w * corners[2].x, y: imageSize.h * corners[2].y },
      { x: imageSize.w * corners[3].x, y: imageSize.h * corners[3].y },
    ]);
  }, [corners, imageSize, onCornersChange]);

  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingIdx(idx);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setCorners(prev => {
      const next = [...prev] as [Point, Point, Point, Point];
      next[draggingIdx] = { x, y };
      return next;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingIdx(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already lost
    }
  };

  if (!imageSize) return <div className="animate-pulse bg-gray-800 w-full h-full rounded-xl" />;

  const aspect = imageSize.w / imageSize.h;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      <div 
        ref={containerRef}
        className="relative touch-none inline-block max-w-full max-h-full flex-shrink-0"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img
          src={imageSrc}
          className="pointer-events-none rounded-xl block max-w-full"
          style={{ maxHeight: "calc(100vh - 200px)" }}
          alt="Select corners"
        />
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none rounded-xl" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <polygon
            points={corners.map(c => `${c.x * 100},${c.y * 100}`).join(' ')}
            fill="rgba(0, 255, 0, 0.2)"
            stroke="#00ff00"
            strokeWidth="0.5"
          />
        </svg>
        {corners.map((c, idx) => (
          <div
            key={idx}
            className="absolute w-10 h-10 -ml-5 -mt-5 bg-white border-4 border-green-500 rounded-full flex items-center justify-center shadow-xl cursor-move touch-none"
            style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
            onPointerDown={(e) => handlePointerDown(idx, e)}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
