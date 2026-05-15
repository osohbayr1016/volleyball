import { useState } from "react";
import { Court } from "./Court";
import { SetAnalytics } from "./SetAnalytics";
import type { EventPoint } from "../lib/types";

type Props = {
  events: EventPoint[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  onAdd: (x: number, y: number, type: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onEndSet: () => void;
};

export function SetWorkspace({
  events,
  loading,
  saving,
  error,
  onAdd,
  onMove,
  onDelete,
  onClearAll,
  onEndSet,
}: Props) {
  const total = events.length;
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [attackType, setAttackType] = useState<"Spike" | "Set">("Spike");
  const [analysisFilter, setAnalysisFilter] = useState<"All" | "Spike" | "Set">("All");

  const displayedEvents =
    showAnalysis && analysisFilter !== "All"
      ? events.filter((e) => e.type === analysisFilter)
      : events;

  return (
    <>
      <section className="grid gap-5 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-lg shadow-black/40 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:p-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium text-zinc-100">Талбай</h2>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>
                  Нийт{" "}
                  <span className="font-semibold text-zinc-100">
                    {total}
                  </span>{" "}
                  бөмбөг
                </span>
                {saving && (
                  <span className="text-[11px] text-emerald-300">
                    Хадгалж байна...
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClearAll}
                disabled={total === 0}
                className="inline-flex h-7 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 text-[11px] font-medium text-zinc-200 hover:border-red-400/70 hover:text-red-200 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
              >
                Бүх бөмбөгийг арилгах
              </button>
              <button
                type="button"
                onClick={onEndSet}
                className="inline-flex h-7 items-center justify-center rounded-full bg-emerald-500/90 px-3 text-[11px] font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
              >
                Set дуусгах
              </button>
              <button
                type="button"
                onClick={() => setShowAnalysis((prev) => !prev)}
                disabled={total === 0}
                className="inline-flex h-7 items-center justify-center rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-500"
              >
                {showAnalysis ? "Анализ нуух" : "Анализ харах"}
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-xs text-zinc-400">Ачааллаж байна...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttackType("Spike")}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-medium transition-colors ${
                    attackType === "Spike"
                      ? "bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Spike
                </button>
                <button
                  type="button"
                  onClick={() => setAttackType("Set")}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-medium transition-colors ${
                    attackType === "Set"
                      ? "bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  serve
                </button>
              </div>
              {showAnalysis && (
                <div className="flex justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1.5 mx-auto w-fit mb-2 mt-4">
                  {(["All", "Spike", "Set"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setAnalysisFilter(f)}
                      className={`px-4 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        analysisFilter === f
                          ? "bg-zinc-700 text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {f === "All" ? "Бүгд" : f}
                    </button>
                  ))}
                </div>
              )}
              <Court
                events={displayedEvents.map((e) => ({
                  id: e.id,
                  x: e.x,
                  y: e.y,
                  type: e.type,
                }))}
                onAdd={(x, y) => onAdd(x, y, attackType)}
                onMove={onMove}
                onDelete={onDelete}
                showHeatmap={showAnalysis}
                onHeatmapSnapshot={setHeatmapUrl}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-100">
            Энэ set-ийн анализ
          </h2>
          {showAnalysis ? (
            <>
              <SetAnalytics events={events} />
              {heatmapUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (!heatmapUrl) return;
                    const link = document.createElement("a");
                    link.href = heatmapUrl;
                    link.download = "set-heatmap.jpg";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 px-3 text-[11px] font-medium text-zinc-200 hover:border-emerald-400/80 hover:text-emerald-200"
                >
                  Heatmap зураг татах
                </button>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs text-zinc-300">
              Энэ set-д тэмдэглэсэн бөмбөгний тархалтыг харахын тулд{" "}
              <span className="font-semibold text-emerald-300">
                “Анализ харах”
              </span>{" "}
              товчийг дарна уу.
            </div>
          )}
        </div>
      </section>

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </>
  );
}

