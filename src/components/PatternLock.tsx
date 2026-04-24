import { useRef, useState, useEffect, useCallback } from "react";

interface Point {
  id: number;
  x: number;
  y: number;
}

interface PatternLockProps {
  onComplete: (pattern: number[]) => void;
  size?: number;
  error?: boolean;
}

const GRID = 3;

export default function PatternLock({ onComplete, size = 280, error = false }: PatternLockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<number[]>([]);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [drawing, setDrawing] = useState(false);

  const cellSize = size / GRID;
  const dotRadius = cellSize * 0.12;
  const hitRadius = cellSize * 0.32;

  const points: Point[] = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      points.push({
        id: r * GRID + c,
        x: cellSize * (c + 0.5),
        y: cellSize * (r + 0.5),
      });
    }
  }

  const getRelativePos = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const findHitDot = (x: number, y: number): number | null => {
    for (const p of points) {
      const dx = p.x - x;
      const dy = p.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) return p.id;
    }
    return null;
  };

  const handleStart = (clientX: number, clientY: number) => {
    const pos = getRelativePos(clientX, clientY);
    const id = findHitDot(pos.x, pos.y);
    setDrawing(true);
    setPath(id !== null ? [id] : []);
    setCurrentPos(pos);
  };

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!drawing) return;
      const pos = getRelativePos(clientX, clientY);
      setCurrentPos(pos);
      const id = findHitDot(pos.x, pos.y);
      if (id !== null && !path.includes(id)) {
        setPath((prev) => [...prev, id]);
      }
    },
    [drawing, path]
  );

  const handleEnd = useCallback(() => {
    if (!drawing) return;
    setDrawing(false);
    setCurrentPos(null);
    if (path.length > 0) onComplete(path);
  }, [drawing, path, onComplete]);

  // Reset visual on error
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setPath([]), 600);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Global listeners for move/end (catches release outside grid)
  useEffect(() => {
    if (!drawing) return;
    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };
    const onUp = () => handleEnd();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drawing, handleMove, handleEnd]);

  // Build SVG line points
  const lineCoords = path.map((id) => points[id]);
  const lastPoint = lineCoords[lineCoords.length - 1];

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.target as Element).setPointerCapture?.(e.pointerId);
        handleStart(e.clientX, e.clientY);
      }}
      style={{ width: size, height: size, touchAction: "none" }}
      className="relative select-none mx-auto"
    >
      <svg width={size} height={size} className="absolute inset-0 pointer-events-none">
        {/* Connecting lines */}
        {lineCoords.length > 1 && (
          <polyline
            points={lineCoords.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={error ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Live drag line */}
        {drawing && lastPoint && currentPos && (
          <line
            x1={lastPoint.x}
            y1={lastPoint.y}
            x2={currentPos.x}
            y2={currentPos.y}
            stroke={error ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
        {/* Dots */}
        {points.map((p) => {
          const active = path.includes(p.id);
          return (
            <g key={p.id}>
              {active && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={dotRadius * 2.4}
                  fill={error ? "hsl(var(--destructive) / 0.18)" : "hsl(var(--primary) / 0.18)"}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? dotRadius * 1.4 : dotRadius}
                fill={
                  active
                    ? error
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground) / 0.5)"
                }
                className="transition-all"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
