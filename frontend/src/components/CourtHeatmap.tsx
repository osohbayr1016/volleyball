"use client";

import { useEffect, useRef } from "react";

type CourtHeatmapProps = {
  events: Array<{ x: number; y: number }>;
  onSnapshot?: (dataUrl: string) => void;
};

const HEATMAP_OPACITY = 0.55;
const SIGMA = 0.18;
const GRID_W = 80;
const GRID_H = 60;

function densityAt(
  nx: number,
  ny: number,
  points: Array<{ x: number; y: number }>
): number {
  let v = 0;
  for (const p of points) {
    const dx = nx - p.x;
    const dy = ny - p.y;
    v += Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA));
  }
  return v;
}

function heatColor(t: number): { r: number; g: number; b: number } {
  if (t <= 0) return { r: 59, g: 130, b: 246 };
  if (t >= 1) return { r: 168, g: 85, b: 247 };
  const stops = [
    { t: 0, r: 59, g: 130, b: 246 },
    { t: 0.2, r: 34, g: 197, b: 94 },
    { t: 0.4, r: 250, g: 204, b: 21 },
    { t: 0.6, r: 249, g: 115, b: 22 },
    { t: 0.8, r: 239, g: 68, b: 68 },
    { t: 1, r: 168, g: 85, b: 247 },
  ];
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].t < t) i++;
  const a = stops[i];
  const b = stops[i + 1];
  const s = (t - a.t) / (b.t - a.t);
  return {
    r: Math.round(a.r + (b.r - a.r) * s),
    g: Math.round(a.g + (b.g - a.g) * s),
    b: Math.round(a.b + (b.b - a.b) * s),
  };
}

export function CourtHeatmap({ events, onSnapshot }: CourtHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (events.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(GRID_W * dpr);
    const h = Math.round(GRID_H * dpr);
    canvas.width = w;
    canvas.height = h;

    const density: number[] = [];
    let maxD = 0;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const nx = (i + 0.5) / w;
        const ny = (j + 0.5) / h;
        const d = densityAt(nx, ny, events);
        density.push(d);
        if (d > maxD) maxD = d;
      }
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = maxD > 0 ? 1 / maxD : 0;
    const imageData = ctx.createImageData(w, h);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const idx = (j * w + i) * 4;
        const t = density[j * w + i] * scale;
        const { r, g, b } = heatColor(t);
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = Math.round(255 * HEATMAP_OPACITY);
      }
    }
    ctx.putImageData(imageData, 0, 0);

    if (onSnapshot) {
      try {
        const snapshotCanvas = document.createElement("canvas");
        snapshotCanvas.width = w;
        snapshotCanvas.height = h;
        const sctx = snapshotCanvas.getContext("2d");
        if (sctx) {
          // copy heatmap
          sctx.putImageData(imageData, 0, 0);

          const drawLine = (
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            dashed: boolean
          ) => {
            sctx.save();
            sctx.strokeStyle = "rgba(255,255,255,0.9)";
            sctx.lineWidth = Math.max(1, dpr);
            if (dashed) {
              sctx.setLineDash([4 * dpr, 4 * dpr]);
            } else {
              sctx.setLineDash([]);
            }
            sctx.beginPath();
            sctx.moveTo(x1 * w, y1 * h);
            sctx.lineTo(x2 * w, y2 * h);
            sctx.stroke();
            sctx.restore();
          };

          // Outer rectangle
          drawLine(0, 0, 1, 0, false);
          drawLine(1, 0, 1, 1, false);
          drawLine(1, 1, 0, 1, false);
          drawLine(0, 1, 0, 0, false);

          // Spike (top) region: y in [0, 1/3]
          const spikeBottom = 1 / 3;
          drawLine(0, spikeBottom, 1, spikeBottom, false); // solid attack line
          drawLine(0, spikeBottom / 2, 1, spikeBottom / 2, true); // middle dashed
          drawLine(0.25, 0, 0.25, spikeBottom, true);
          drawLine(0.5, 0, 0.5, spikeBottom, true);
          drawLine(0.75, 0, 0.75, spikeBottom, true);

          // Defense region: y in [1/3, 1]
          const defTop = spikeBottom;
          const defMid = (defTop + 1) / 2;
          drawLine(0, defMid, 1, defMid, false); // main middle solid line
          // sub horizontal lines (quarter positions inside defense)
          const defH1 = defTop + (1 - defTop) / 4;
          const defH2 = defTop + ((1 - defTop) * 3) / 4;
          drawLine(0, defH1, 1, defH1, true);
          drawLine(0, defH2, 1, defH2, true);

          // main verticals in defense at 1/3, 2/3
          drawLine(1 / 3, defTop, 1 / 3, 1, false);
          drawLine((2 * 1) / 3, defTop, (2 * 1) / 3, 1, false);

          // sub verticals roughly at 1/6, 1/2, 5/6
          drawLine(1 / 6, defTop, 1 / 6, 1, true);
          drawLine(0.5, defTop, 0.5, 1, true);
          drawLine(5 / 6, defTop, 5 / 6, 1, true);
        }

        const dataUrl = snapshotCanvas.toDataURL("image/jpeg", 0.92);
        onSnapshot(dataUrl);
      } catch {
        // ignore snapshot errors
      }
    }
  }, [events, onSnapshot]);

  if (events.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ objectFit: "fill" }}
      aria-hidden
    />
  );
}
