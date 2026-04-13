import type { Set } from "../lib/types";

type Props = {
  sets: Set[];
  loading: boolean;
  error: string | null;
  hasClient: boolean;
  creatingSet: boolean;
  onCreateSet: () => void;
  onOpenSet: (setId: string) => void;
};

export function MatchSetsSection({
  sets,
  loading,
  error,
  hasClient,
  creatingSet,
  onCreateSet,
  onOpenSet,
}: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-lg shadow-black/40 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-medium text-zinc-100">
            Set-үүдийн жагсаалт
          </h2>
          <p className="text-xs text-zinc-400">
            Set тус бүр дээр бөмбөгийн байршлыг тусад нь тэмдэглэнэ.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateSet}
          disabled={!hasClient || creatingSet}
          className="inline-flex h-10 items-center justify-center rounded-full bg-sky-500 px-4 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-700/60"
        >
          {creatingSet ? "Set үүсгэж байна..." : "Шинэ set эхлүүлэх"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {loading ? (
          <p className="text-xs text-zinc-400">Ачааллаж байна...</p>
        ) : sets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/60 px-4 py-6 text-xs text-zinc-400">
            Одоогоор нэг ч set үүсгээгүй байна. Дээрх товчийг дарж шинэ set
            эхлүүлээрэй.
          </p>
        ) : (
          sets.map((set) => (
            <button
              key={set.id}
              type="button"
              onClick={() => onOpenSet(set.id)}
              className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-4 text-left text-xs text-zinc-100 transition hover:border-emerald-400/60 hover:bg-zinc-900"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  Set {set.index}
                </p>
                <p className="text-[11px] text-zinc-400">
                  Үүсгэсэн:{" "}
                  {new Date(set.createdAt).toLocaleTimeString("mn-MN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="text-[11px] text-emerald-300">
                Талбай руу орох →
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

