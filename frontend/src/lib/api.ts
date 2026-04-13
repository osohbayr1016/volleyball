import type { EventPoint, Match, Set } from "./types";

const getDefaultApiUrl = () => {
  if (typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location?.host ?? "")) {
    return "http://127.0.0.1:8787";
  }
  return "https://volleyball.khayratkhayrat024.workers.dev";
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : getDefaultApiUrl();

function buildUrl(path: string, params?: Record<string, string>): string {
  const base =
    API_BASE_URL.endsWith("/") && path.startsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;

  const url = new URL(path, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function fetchMatches(clientId: string): Promise<Match[]> {
  const url = buildUrl("/api/matches", { clientId });
  const res = await fetch(url, { cache: "no-store" });
  const data = await handleResponse<{ matches: Match[] }>(res);
  return data.matches;
}

export async function createMatch(
  clientId: string,
  name: string,
): Promise<Match> {
  const url = buildUrl("/api/matches");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clientId, name }),
  });

  const data = await handleResponse<{ match: Match }>(res);
  return data.match;
}

export async function fetchMatchDetail(
  clientId: string,
  matchId: string,
): Promise<{ match: Match; sets: Set[] }> {
  const url = buildUrl(`/api/matches/${matchId}`, { clientId });
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<{ match: Match; sets: Set[] }>(res);
}

export async function createSet(
  clientId: string,
  matchId: string,
): Promise<Set> {
  const url = buildUrl(`/api/matches/${matchId}/sets`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clientId }),
  });

  const data = await handleResponse<{ set: Set }>(res);
  return data.set;
}

export async function fetchSetDetail(
  setId: string,
): Promise<{ set: Set; events: EventPoint[] }> {
  const url = buildUrl(`/api/sets/${setId}`);
  const res = await fetch(url, { cache: "no-store" });
  return handleResponse<{ set: Set; events: EventPoint[] }>(res);
}

export async function createEvent(
  setId: string,
  x: number,
  y: number,
): Promise<EventPoint> {
  const url = buildUrl(`/api/sets/${setId}/events`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ x, y }),
  });

  const data = await handleResponse<{ event: EventPoint }>(res);
  return data.event;
}

export async function updateEvent(
  setId: string,
  eventId: string,
  x: number,
  y: number,
): Promise<void> {
  const url = buildUrl(`/api/sets/${setId}/events/${eventId}`);
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ x, y }),
  });

  await handleResponse<{ ok: boolean }>(res);
}

export async function deleteEvent(
  setId: string,
  eventId: string,
): Promise<void> {
  const url = buildUrl(`/api/sets/${setId}/events/${eventId}`);
  const res = await fetch(url, {
    method: "DELETE",
  });

  await handleResponse<{ ok: boolean }>(res);
}

export async function fetchMatchEvents(
  clientId: string,
  matchId: string,
): Promise<EventPoint[]> {
  const url = buildUrl(`/api/match-summary/${matchId}`, { clientId });
  const res = await fetch(url, { cache: "no-store" });
  const data = await handleResponse<{ events: EventPoint[] }>(res);
  return data.events;
}

