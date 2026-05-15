"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SetWorkspace } from "../../../components/SetWorkspace";
import {
  createEvent,
  deleteEvent,
  fetchSetDetail,
  updateEvent,
} from "../../../lib/api";
import type { EventPoint, Set } from "../../../lib/types";

export default function SetPage() {
  const router = useRouter();
  const params = useParams<{ setId: string }>();
  const setId = params?.setId;
  const [setInfo, setSetInfo] = useState<Set | null>(null);
  const [events, setEvents] = useState<EventPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) return;

    setLoading(true);
    setError(null);

    fetchSetDetail(setId)
      .then((data) => {
        setSetInfo(data.set);
        setEvents(data.events);
      })
      .catch(() => {
        setError("Set-ийн мэдээлэл уншихад алдаа гарлаа.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setId]);

  const handleAdd = async (x: number, y: number, type: string) => {
    if (!setId) return;
    setSaving(true);
    setError(null);

    try {
      const optimisticId = `local-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const optimistic: EventPoint = {
        id: optimisticId,
        setId,
        x,
        y,
        type,
        createdAt: Date.now(),
      };

      setEvents((prev) => [...prev, optimistic]);
      const created = await createEvent(setId, x, y, type);
      setEvents((prev) =>
        prev.map((e) => (e.id === optimisticId ? created : e)),
      );
    } catch {
      setError("Бөмбөг нэмэхэд алдаа гарлаа.");
      setEvents((prev) => prev.slice(0, -1));
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (id: string, x: number, y: number) => {
    if (!setId) return;
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, x, y } : e)));

    try {
      await updateEvent(setId, id, x, y);
    } catch {
      setError("Байршил шинэчлэхэд алдаа гарлаа.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!setId) return;
    const previous = events;
    setEvents((prev) => prev.filter((e) => e.id !== id));

    try {
      await deleteEvent(setId, id);
    } catch {
      setError("Бөмбөг устгахад алдаа гарлаа.");
      setEvents(previous);
    }
  };

  const handleClearAll = async () => {
    if (!setId || events.length === 0) return;
    const previous = events;
    setEvents([]);
    setError(null);

    try {
      await Promise.all(previous.map((e) => deleteEvent(setId, e.id)));
    } catch {
      setError("Бүх бөмбөгийг устгахад алдаа гарлаа.");
      setEvents(previous);
    }
  };

  const handleEndSet = () => {
    if (setInfo) {
      router.push(`/matches/${setInfo.matchId}`);
    } else {
      router.back();
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex w-fit items-center gap-1 rounded-full border border-zinc-800/80 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900"
      >
        ← Буцах
      </button>

      <section className="space-y-2">
        <p className="text-xs font-medium text-emerald-300">
          Бөмбөгийн байршил тэмдэглэх
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          {setInfo ? `Set ${setInfo.index}` : "Set ачааллаж байна..."}
        </h1>
        <p className="text-xs text-zinc-400">
          Талбайн зураг дээр дурын цэг дээр дарж бөмбөг унасан байршлыг
          тэмдэглэнэ. Бөмбөгний icon-ыг чирж зөөж болно, × товчоор устгана.
        </p>
      </section>

      <SetWorkspace
        events={events}
        loading={loading}
        saving={saving}
        error={error}
        onAdd={handleAdd}
        onMove={handleMove}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
        onEndSet={handleEndSet}
      />
    </main>
  );
}

