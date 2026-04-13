"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MatchSetsSection } from "../../../components/MatchSetsSection";
import { SetAnalytics } from "../../../components/SetAnalytics";
import { createSet, fetchMatchDetail, fetchMatchEvents } from "../../../lib/api";
import type { EventPoint, Match, Set } from "../../../lib/types";

export default function MatchPage() {
  const router = useRouter();
  const params = useParams<{ matchId: string }>();
  const matchId = params?.matchId;
  const [match, setMatch] = useState<Match | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSet, setCreatingSet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [summaryEvents, setSummaryEvents] = useState<EventPoint[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("vb-client-id");
    if (stored) {
      setClientId(stored);
    }
  }, []);

  useEffect(() => {
    if (!clientId || !matchId) return;

    setLoading(true);
    setError(null);

    fetchMatchDetail(clientId, matchId)
      .then((data) => {
        setMatch(data.match);
        setSets(data.sets);
      })
      .catch(() => {
        setError("Тоглолтын мэдээлэл уншихад алдаа гарлаа.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clientId, matchId]);

  const handleCreateSet = async () => {
    if (!clientId || !matchId || creatingSet) return;
    setCreatingSet(true);
    setError(null);

    try {
      const created = await createSet(clientId, matchId);
      setSets((prev) => [...prev, created]);
    } catch {
      setError("Set үүсгэхэд алдаа гарлаа.");
    } finally {
      setCreatingSet(false);
    }
  };

  const handleOpenSet = (setId: string) => {
    router.push(`/sets/${setId}`);
  };

  const handleLoadSummary = async () => {
    if (!clientId || !matchId || loadingSummary) return;
    setLoadingSummary(true);
    setError(null);

    try {
      const events = await fetchMatchEvents(clientId, matchId);
      setSummaryEvents(events);
    } catch {
      setError("Нийт тоглолтын анализ уншихад алдаа гарлаа.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="inline-flex w-fit items-center gap-1 rounded-full border border-zinc-800/80 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900"
      >
        ← Буцах
      </button>

      <section className="space-y-3">
        <p className="text-xs font-medium text-emerald-300">
          Тоглолтын дэлгэрэнгүй
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          {match ? match.name : "Тоглолт ачааллаж байна..."}
        </h1>
        {match && (
          <p className="text-xs text-zinc-400">
            Эхэлсэн:{" "}
            {new Date(match.createdAt).toLocaleString("mn-MN", {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "2-digit",
            })}
          </p>
        )}
      </section>

      <MatchSetsSection
        sets={sets}
        loading={loading}
        error={error}
        hasClient={!!clientId}
        creatingSet={creatingSet}
        onCreateSet={handleCreateSet}
        onOpenSet={handleOpenSet}
      />

      <section className="space-y-3 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-lg shadow-black/40 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-100">
              Бүтэн тоглолтын анализ
            </h2>
            <p className="text-xs text-zinc-400">
              Бүх set-үүдийн бөмбөгийг нэгтгэн талбайн аль хэсэгт хамгийн их
              унаж байгааг харуулна.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadSummary}
            disabled={!clientId || loadingSummary}
            className="inline-flex h-9 items-center justify-center rounded-full border border-emerald-400/70 bg-emerald-500/10 px-4 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-500"
          >
            {loadingSummary ? "Ачааллаж байна..." : "Тоглолт дууссан, анализ харах"}
          </button>
        </div>
        <SetAnalytics events={summaryEvents} />
      </section>
    </main>
  );
}

