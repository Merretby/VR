import { useState, useRef, useCallback, useEffect } from "react";
import { useDict } from "@/lib/i18n";

const heroBefore = "/hero-before.png";
const heroAfter = "/hero-after.png";

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  className?: string;
  aspectRatio?: string;
}

export function BeforeAfterSlider({
  beforeImage: defaultBefore = heroBefore,
  afterImage: defaultAfter = heroAfter,
  className = "",
  aspectRatio = "aspect-[16/10] sm:aspect-[16/9]",
}: BeforeAfterSliderProps) {
  const d = useDict();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const beforeImage = defaultBefore || heroBefore;
  const afterImage = defaultAfter || heroAfter;

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove]);

  return (
    <div
      className={`rounded-2xl border bg-card p-3 sm:p-4 shadow-[var(--shadow-soft)] ${className}`}
    >
      <div className="flex items-center justify-between px-1 pb-3">
        <span className="font-serif text-lg font-medium tracking-tight sm:text-xl">
          {d.slider.title}
        </span>
        <span className="label-mono text-[10px] text-muted-foreground">{d.slider.hint}</span>
      </div>

      <div
        ref={containerRef}
        className={`relative ${aspectRatio} w-full select-none overflow-hidden rounded-xl bg-muted cursor-ew-resize touch-none shadow-inner`}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          if (e.touches[0]) handleMove(e.touches[0].clientX);
        }}
      >
        {/* AFTER Image (Full background) */}
        <img
          src={afterImage}
          alt={d.slider.altAfter}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />

        {/* BEFORE Image (Clipped on top) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          }}
        >
          <img
            src={beforeImage}
            alt={d.slider.altBefore}
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
        </div>

        {/* Vertical Split Line Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-110 active:scale-95">
            <span className="text-xs font-bold select-none">↔</span>
          </div>
        </div>

        {/* Floating Badges */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
          {d.slider.before}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
          {d.slider.after}
        </div>
      </div>

      {/* Bottom Range Slider Control */}
      <div className="mt-4 px-2">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          aria-label={d.slider.ariaLabel}
          className="w-full h-2 rounded-lg bg-secondary appearance-none cursor-pointer accent-primary focus:outline-none"
        />
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>{d.slider.emptyArchitecture}</span>
          <span>{d.slider.furnishedDesign}</span>
        </div>
      </div>
    </div>
  );
}
