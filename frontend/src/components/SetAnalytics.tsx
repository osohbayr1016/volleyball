import type { EventPoint } from "../lib/types";

type Props = {
  events: EventPoint[];
};

function getZone(x: number, y: number) {
  const m = 0.12;
  if (x < m) return "Гадна Зүүн";
  if (x > 1 - m) return "Гадна Баруун";
  if (y > 1 - m) return "Гадна Хойд";
  if (y < m) return "Гадна Урд";

  const cx = Math.max(0, Math.min(0.999, (x - m) / (1 - 2 * m)));
  const cy = Math.max(0, Math.min(0.999, (y - m) / (1 - 2 * m)));

  const mainCol = Math.min(2, Math.floor(cx * 3));
  const mainRow = Math.min(2, Math.floor(cy * 3));
  const grid = [[4, 3, 2], [7, 8, 9], [5, 6, 1]];
  const num = grid[mainRow]?.[mainCol] ?? 0;

  const subCol = Math.floor(cx * 6) % 2;
  const subRow = Math.floor(cy * 6) % 2;
  const letter = [["A", "B"], ["C", "D"]][subRow]?.[subCol] ?? "";

  return `${num}${letter}`;
}

export function SetAnalytics({ events }: Props) {
  const total = events.length;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-300">
        Одоогоор тэмдэглэсэн бөмбөг байхгүй байна. Талбай дээр дарж бөмбөг
        нэмнэ үү.
      </div>
    );
  }

  let front = 0;
  let middle = 0;
  let back = 0;

  let spikeCount = 0;
  let setCount = 0;

  for (const e of events) {
    if (e.type === "Set") setCount += 1;
    else spikeCount += 1;

    const m = 0.12;
    const cy = Math.max(0, Math.min(0.999, (e.y - m) / (1 - 2 * m)));

    if (cy < 1 / 3) {
      front += 1;
    } else if (cy < 2 / 3) {
      middle += 1;
    } else {
      back += 1;
    }
  }

  const zoneStats: Record<string, { total: number; spike: number; set: number }> = {};
  for (const e of events) {
    const zone = getZone(e.x, e.y);
    if (!zoneStats[zone]) {
      zoneStats[zone] = { total: 0, spike: 0, set: 0 };
    }
    zoneStats[zone].total += 1;
    if (e.type === "Set") zoneStats[zone].set += 1;
    else zoneStats[zone].spike += 1;
  }

  const sortedZones = Object.entries(zoneStats).sort((a, b) => b[1].total - a[1].total);

  const toPercent = (value: number) =>
    Math.round((value / Math.max(total, 1)) * 100);

  const bands = [
    { key: "front", label: "Урд хэсэг", value: front },
    { key: "middle", label: "Дунд хэсэг", value: middle },
    { key: "back", label: "Ард хэсэг", value: back },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-100">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium">Энэ set доторх тархалт</p>
        <p className="text-xs text-zinc-400">
          Нийт <span className="font-semibold text-zinc-100">{total}</span>{" "}
          бөмбөг
        </p>
      </div>
      <div className="space-y-2">
        {bands.map((band) => {
          const percent = toPercent(band.value);

          return (
            <div key={band.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">{band.label}</span>
                <span className="font-medium text-zinc-100">
                  {band.value} ({percent}%)
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-sky-400 via-amber-300 to-red-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-4">
        <h3 className="mb-3 text-[11px] font-medium text-emerald-300">Алдааны төрөл</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-800/40 p-3">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Spike
            </div>
            <div className="text-lg font-semibold text-zinc-100">
              {spikeCount} <span className="text-[10px] font-normal text-zinc-500">оноо</span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-800/40 p-3">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Set
            </div>
            <div className="text-lg font-semibold text-zinc-100">
              {setCount} <span className="text-[10px] font-normal text-zinc-500">оноо</span>
            </div>
          </div>
        </div>
      </div>

      {sortedZones.length > 0 && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <h3 className="mb-3 text-[11px] font-medium text-emerald-300">Байршлын нарийвчилсан статистик</h3>
          <div className="space-y-2">
            {sortedZones.map(([zone, stats]) => {
              const pct = Math.round((stats.total / total) * 100);
              return (
                <div key={zone} className="flex flex-col gap-2 rounded-xl bg-zinc-800/40 p-3 text-xs border border-zinc-800/60">
                  <div className="flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex whitespace-nowrap min-w-8 items-center justify-center rounded-md px-1.5 py-1 font-bold ${zone.includes("Гадна") ? "bg-red-950/40 text-red-400 border border-red-900/50" : "bg-zinc-700/50 text-emerald-400"}`}>
                        {zone}
                      </span>
                      <span className="text-zinc-300">
                        {stats.total} бөмбөг <span className="font-medium text-zinc-500">({pct}%)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-zinc-400">
                        Spike: <span className="font-medium text-zinc-200">{stats.spike}</span>
                      </span>
                      <span className="text-zinc-400">
                        Set: <span className="font-medium text-zinc-200">{stats.set}</span>
                      </span>
                    </div>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className={`h-full rounded-full ${zone.includes("Гадна") ? "bg-red-500/60" : "bg-emerald-500/60"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

