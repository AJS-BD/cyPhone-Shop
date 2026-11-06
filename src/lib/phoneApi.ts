// Live specs client for cyPhone-Shop - SPECS ONLY, no reviews.
//
// fetchLiveSpecs(query) calls the Supabase Edge Function (phone-specs)
// whose URL is configured with EXPO_PUBLIC_PHONE_SPECS_URL. It returns a
// Phone in the same shape as src/data/phones.ts, or null on any error or
// timeout, so the UI can fall back to the local database.
import { UNKNOWN, fallbackPhone, findPhone, normalize } from "../data/phones";
import type { Phone, PhoneReview } from "../data/phones";

export const LIVE_TAG = "[ LIVE \u2022 GSMArena ]";
export const OFFLINE_TAG = "[ OFFLINE \u2022 LOCAL DB ]";

const LIVE_TIMEOUT_MS = 10_000;

type LiveSpecsResponse = {
  name: string;
  description?: string[];
  specs?: {
    ram?: string;
    storage?: string;
    display?: string;
    chipset?: string;
    camera?: string;
    battery?: string;
    os?: string;
  };
  source?: string;
};

function liveSpecsUrl(query: string): string | null {
  const base = process.env.EXPO_PUBLIC_PHONE_SPECS_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}?q=${encodeURIComponent(query)}`;
}

export async function fetchLiveSpecs(query: string): Promise<Phone | null> {
  const url = liveSpecsUrl(query);
  if (!url) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LIVE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as LiveSpecsResponse;
    if (!data || typeof data.name !== "string" || !data.name || !data.specs) {
      return null;
    }
    const local = findPhone(query);
    const specs = data.specs;
    // Reviews are never live in this build: keep the local sample reviews.
    const reviews: PhoneReview[] = local
      ? local.reviews
      : fallbackPhone(data.name).reviews;
    return {
      name: data.name,
      keys: [normalize(query), normalize(data.name)],
      description:
        data.description && data.description.length > 0
          ? data.description
          : local
            ? local.description
            : [data.name],
      specs: {
        ram: specs.ram || UNKNOWN,
        storage: specs.storage || UNKNOWN,
        display: specs.display || UNKNOWN,
        chipset: specs.chipset || UNKNOWN,
        camera: specs.camera || UNKNOWN,
        battery: specs.battery || UNKNOWN,
        os: specs.os || UNKNOWN,
      },
      reviews,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
