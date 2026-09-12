import { useEffect, useState } from "react";
import { SITE } from "../site";

// Tiny currency helper: KES stays the real price everywhere; USD hints are
// derived from it, so editing a KES price (staff page) updates dollars
// automatically. The rate refreshes from a free feed, cached 12h, with a
// static fallback so hints still show when offline.

const CACHE_KEY = "ah_kes_per_usd";
const TTL_MS = 12 * 3600 * 1000;
let inflight: Promise<number | null> | null = null;

function readCache(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { rate, at } = JSON.parse(raw) as { rate: unknown; at: unknown };
    if (typeof rate === "number" && rate > 0 && Date.now() - Number(at) < TTL_MS) return rate;
  } catch {
    /* storage unavailable — fall through to the default */
  }
  return null;
}

function fetchRate(): Promise<number | null> {
  if (!inflight) {
    inflight = fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const kes = Number(d?.rates?.KES);
        return kes > 0 ? kes : null;
      })
      .catch(() => null);
  }
  return inflight;
}

export function useKesPerUsd(): number {
  const [rate, setRate] = useState<number>(() => readCache() ?? SITE.kesPerUsd);

  useEffect(() => {
    if (readCache() !== null) return; // already fresh from cache
    let live = true;
    fetchRate().then((kes) => {
      if (!live || kes === null) return;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: kes, at: Date.now() }));
      } catch {
        /* private mode — just use it for this visit */
      }
      setRate(kes);
    });
    return () => {
      live = false;
    };
  }, []);

  return rate;
}

/** "KSh 850" / "KSh 1,250" -> 850 / 1250. Returns 0 when unparseable. */
export function parseKes(price: string): number {
  const n = Number(String(price ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
