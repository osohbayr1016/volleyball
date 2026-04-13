import type React from "react";
import { useRef, useState } from "react";
import { CourtHeatmap } from "./CourtHeatmap";

export type CourtEvent = {
  id: string;
  x: number;
  y: number;
};

type Props = {
  events: CourtEvent[];
  onAdd: (x: number, y: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  showHeatmap?: boolean;
  onHeatmapSnapshot?: (dataUrl: string) => void;
};

export function Court({
  events,
  onAdd,
  onMove,
  onDelete,
  showHeatmap = false,
  onHeatmapSnapshot,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragFromButtonRef = useRef(false);
  const pointerDownOnCourtRef = useRef(false);

  const toRelative = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current) {
      pointerDownOnCourtRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId) {
      setDraggingId(null);
      return;
    }
    if (dragFromButtonRef.current) {
      dragFromButtonRef.current = false;
      return;
    }
    if (pointerDownOnCourtRef.current) {
      pointerDownOnCourtRef.current = false;
      const { x, y } = toRelative(e.clientX, e.clientY);
      onAdd(x, y);
    }
  };

  const handlePointerLeave = () => {
    setDraggingId(null);
    pointerDownOnCourtRef.current = false;
    dragFromButtonRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId) return;
    const { x, y } = toRelative(e.clientX, e.clientY);
    onMove(draggingId, x, y);
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-sm cursor-crosshair overflow-hidden rounded-3xl bg-[#256c3a] p-4 shadow-lg"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
      >
        {/* Outer court rectangle */}
        <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-white bg-[#d28a3b]" />

        {/* Spike side split into 8 zones (4x2 grid) */}
        <div
          className="pointer-events-none absolute inset-x-4 top-4"
          style={{ height: "33.333%" }}
        >
          {/* Bottom spike line (3m) */}
          <div className="absolute inset-x-0 bottom-0 h-px border-t border-white/80" />
          {/* Main horizontal to make 2 rows */}
          <div className="absolute inset-x-0 top-1/2 h-px border-t border-white/70" />
          {/* Sub horizontals to split each row into 2 (total 4 rows) */}
          {/* Main verticals to make 3 columns */}
          <div className="absolute inset-y-0 left-1/3 w-px border-l border-white/70" />
          <div className="absolute inset-y-0 left-2/3 w-px border-l border-white/70" />
          {/* Sub verticals to split each column into 2 (total 6 columns) */}
          <div
            className="absolute inset-y-0 w-px border-l border-dashed border-white/60"
            style={{ left: "16.666%" }}
          />
          <div
            className="absolute inset-y-0 w-px border-l border-dashed border-white/60"
            style={{ left: "50%" }}
          />
          <div
            className="absolute inset-y-0 w-px border-l border-dashed border-white/60"
            style={{ left: "83.333%" }}
          />
          {/* Top main row numbers: 1-3 */}
          {[
            { n: 1, col: 0 },
            { n: 2, col: 1 },
            { n: 3, col: 2 },
          ].map(({ n, col }) => (
            <span
              key={`top-zone-${n}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-zinc-900/55 px-1.5 py-0.5 text-[9px] font-bold text-white"
              style={{
                left: `${((col + 0.5) / 3) * 100}%`,
                top: "50%",
              }}
            >
              {n}
            </span>
          ))}
          {/* First row letters: A B A B A B */}
          {["A", "B", "A", "B", "A", "B"].map((label, col) => (
            <span
              key={`top-row-letter-${col}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold text-white/85"
              style={{
                left: `${((col + 0.5) / 6) * 100}%`,
                top: "25%",
              }}
            >
              {label}
            </span>
          ))}
          {/* Second row letters: C D C D C D */}
          {["C", "D", "C", "D", "C", "D"].map((label, col) => (
            <span
              key={`top-row-2-letter-${col}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold text-white/85"
              style={{
                left: `${((col + 0.5) / 6) * 100}%`,
                top: "75%",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Defense side split into 6 zones (3x2 grid), each further 2x2 (4 sub-zones) */}
        <div
          className="pointer-events-none absolute inset-x-4 bottom-4"
          style={{ top: "38.333%" }}
        >
          {/* Main horizontal to make 2 rows */}
          <div className="absolute inset-x-0 top-1/2 h-px border-t border-white/70" />
          {/* Sub horizontals to split each row into 2 (total 4 rows) */}
          <div className="absolute inset-x-0 top-1/4 h-px border-t border-dashed border-white/60" />
          <div className="absolute inset-x-0 top-3/4 h-px border-t border-dashed border-white/60" />
          {/* Main verticals to make 3 columns */}
          <div className="absolute inset-y-0 left-1/3 w-px border-l border-white/70" />
          <div className="absolute inset-y-0 left-2/3 w-px border-l border-white/70" />
          {/* Sub verticals to split each column into 2 (total 6 columns) */}
          <div
            className="absolute inset-y-0 w-px border-l border-dashed border-white/60"
            style={{ left: "16.666%" }}
          />
          <div
            className="absolute inset-y-0 w-px border-l border-dashed border-white/60"
            style={{ left: "50%" }}
          />
          <div
            className="absolute inset-y-0 w-px border-l border-dashed border-white/60"
            style={{ left: "83.333%" }}
          />
          {/* Square codes: row1 ABABAB, row2 CDCDCD (repeats on all rows) */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 6 }).map((__, col) => {
              const label =
                row % 2 === 0
                  ? col % 2 === 0
                    ? "A"
                    : "B"
                  : col % 2 === 0
                    ? "C"
                    : "D";
              return (
                <span
                  key={`${row}-${col}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold text-white/80"
                  style={{
                    left: `${((col + 0.5) / 6) * 100}%`,
                    top: `${((row + 0.5) / 4) * 100}%`,
                  }}
                >
                  {label}
                </span>
              );
            }),
          )}
          {/* Main zone numbers: top row 1-3, bottom row 4-6 */}
          {[
            { n: 1, col: 0, row: 0 },
            { n: 2, col: 1, row: 0 },
            { n: 3, col: 2, row: 0 },
            { n: 4, col: 0, row: 1 },
            { n: 5, col: 1, row: 1 },
            { n: 6, col: 2, row: 1 },
          ].map(({ n, col, row }) => (
            <span
              key={`zone-${n}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-zinc-900/55 px-1.5 py-0.5 text-[9px] font-bold text-white"
              style={{
                left: `${((col + 0.5) / 3) * 100}%`,
                top: `${((row + 0.5) / 2) * 100}%`,
              }}
            >
              {n}
            </span>
          ))}
        </div>

        {showHeatmap && events.length > 0 && (
          <CourtHeatmap events={events} onSnapshot={onHeatmapSnapshot} />
        )}

        {events.map((event) => {
          const left = `${event.x * 100}%`;
          const top = `${event.y * 100}%`;

          return (
            <div key={event.id} className="absolute" style={{ left, top }}>
              <button
                type="button"
                className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-[radial-gradient(circle_at_30%_20%,#ffffff,rgba(254,249,195,0.95)_40%,#f97316_75%,#ea580c_95%)] shadow-[0_0_0_1px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.55)]"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  dragFromButtonRef.current = true;
                  (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                  setDraggingId(event.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span className="pointer-events-none absolute inset-[3px] rounded-full border border-white/70 opacity-80" />
                <span className="pointer-events-none h-px w-5 rounded-full bg-white/75" />
              </button>
              <button
                type="button"
                className="absolute right-0 -top-4 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/90 text-[9px] text-zinc-200 shadow hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event.id);
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
