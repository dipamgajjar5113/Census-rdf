import type { CheckinRecord, SyncStatus } from "./types";

const QUEUE_KEY = "smhf-queue-v3";

function read(): CheckinRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as CheckinRecord[]) : [];
  } catch {
    return [];
  }
}

function write(items: CheckinRecord[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    /* storage may be unavailable (private mode) — fail soft */
  }
}

/** Enqueue a record (dedup by id). */
export function enqueue(record: CheckinRecord) {
  const items = read();
  if (items.some((i) => i.id === record.id)) return;
  items.push(record);
  write(items);
}

export function queueLength(): number {
  return read().length;
}

/**
 * Attempt to flush queued records to the server.
 * Successfully-sent items are removed. Returns the resulting status.
 */
export async function flushQueue(): Promise<SyncStatus> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "offline";
  const items = read();
  if (items.length === 0) return "ok";

  let remaining = [...items];
  for (const item of items) {
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        remaining = remaining.filter((i) => i.id !== item.id);
        write(remaining);
      } else {
        return "error";
      }
    } catch {
      return navigator.onLine ? "error" : "offline";
    }
  }
  return remaining.length === 0 ? "ok" : "pending";
}
