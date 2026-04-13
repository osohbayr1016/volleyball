import type { EventPoint } from "../lib/types";

type Props = {
  events: EventPoint[];
};

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

  for (const e of events) {
    if (e.y < 1 / 3) {
      front += 1;
    } else if (e.y < (2 * 1) / 3) {
      middle += 1;
    } else {
      back += 1;
    }
  }

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
    </div>
  );
}

