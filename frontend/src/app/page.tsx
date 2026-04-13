"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createMatch, fetchMatches } from "../lib/api";
import type { Match } from "../lib/types";

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function Home() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("vb-client-id");
    if (stored) {
      setClientId(stored);
      return;
    }

    const id = createClientId();
    window.localStorage.setItem("vb-client-id", id);
    setClientId(id);
  }, []);

  useEffect(() => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    fetchMatches(clientId)
      .then((data) => {
        setMatches(data);
      })
      .catch(() => {
        setError("Тоглолтын жагсаалт уншихад алдаа гарлаа.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clientId]);

  const defaultName = useMemo(() => {
    if (matches.length === 0) return "Шинэ тоглолт";
    return `Тоглолт #${matches.length + 1}`;
  }, [matches.length]);

  const handleCreate = async () => {
    if (!clientId || creating) return;

    const trimmed = (name || defaultName).trim();
    if (!trimmed) return;

    setCreating(true);
    setError(null);

    try {
      const match = await createMatch(clientId, trimmed);
      setMatches((prev) => [match, ...prev]);
      setName("");
    } catch {
      setError("Тоглолт үүсгэхэд алдаа гарлаа.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpen = (matchId: string) => {
    router.push(`/matches/${matchId}`);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
          Volleyball хамгаалалтын анализ
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Бөмбөг хаана унаж байна вэ?
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Тоглолт эхлүүлээд оноо алдах бүрд талбай дээр дарж бөмбөгийн
          байршлыг тэмдэглэнэ. Тоглолт дуусахад аль хэсэгт хамгийн их унаж
          байгааг шууд харна.
        </p>
      </header>

      <section className="grid gap-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-lg shadow-black/40 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:p-6">
        <div className="space-y-4 border-b border-zinc-800/80 pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5">
          <h2 className="text-sm font-medium text-zinc-100">
            Шинэ тоглолт эхлүүлэх
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder={defaultName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 flex-1 rounded-full border border-zinc-700/70 bg-zinc-900/80 px-4 text-sm text-zinc-100 outline-none ring-0 transition focus:border-emerald-400/70 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/40"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!clientId || creating}
              className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
            >
              {creating ? "Үүсгэж байна..." : "Тоглолт эхлүүлэх"}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-zinc-100">
              Сүүлд тоглосон тоглолтууд
            </h2>
            <span className="text-xs text-zinc-500">
              {loading ? "Ачааллаж байна..." : `${matches.length} бичлэг`}
            </span>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {matches.length === 0 && !loading ? (
              <p className="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/60 px-4 py-6 text-xs text-zinc-400">
                Одоогоор хадгалсан тоглолт алга байна. Дээрх хэсгээс шинэ
                тоглолт эхлүүлээрэй.
              </p>
            ) : (
              matches.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleOpen(m.id)}
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/80 px-4 py-3 text-left text-xs text-zinc-100 transition hover:border-emerald-400/60 hover:bg-zinc-900"
                >
                  <div className="space-y-0.5">
                    <p className="line-clamp-1 text-sm font-medium">
                      {m.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {new Date(m.createdAt).toLocaleString("mn-MN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-[11px] text-emerald-300">
                    Дэлгэрэнгүй →
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

