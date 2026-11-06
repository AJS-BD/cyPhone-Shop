/// <reference lib="deno.ns" />
// Live phone specs for cyPhone-Shop -- SPECS ONLY, no reviews.
//
// GET  /phone-specs?q=Galaxy S25
// POST /phone-specs  { "query": "Galaxy S25" }
//
// Response: { name, description, specs: { ram, storage, display, chipset,
// camera, battery, os }, source: "gsmarena.com", url, cached }
//
// The function fetches GSMArena with plain fetch + light regex parsing
// (no Puppeteer, no API key). It does NOT use the third-party demo at
// api-mobilespecs.azharimm.dev. Search order (brand discovery first,
// because GSMArena quick search is Turnstile-gated from datacentre IPs):
//   1. Brand discovery: makers.php3 lists every brand; the matching
//      brand pages are scanned for the model name.
//   2. If no brand can be detected, the first page of the top brands.
//   3. GSMArena quick search (results.php3) -- last resort; skipped when
//      it returns a bot-challenge (Turnstile) page.
// / Fresh results are cached in public.phone_specs_cache (30 days).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GSM = "https://www.gsmarena.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const CACHE_TTL_DAYS = 30;
const MAX_BRAND_PAGES = 6;
const TOP_BRANDS = [
  "samsung", "apple", "google", "xiaomi", "oneplus", "oppo", "vivo",
  "huawei", "honor", "motorola", "realme", "sony", "nokia",
];

type Specs = {
  ram: string;
  storage: string;
  display: string;
  chipset: string;
  camera: string;
  battery: string;
  os: string;
};

type PhoneResult = {
  name: string;
  description: string[];
  specs: Specs;
  source: "gsmarena.com";
  url: string;
  cached: boolean;
};

type Brand = { slug: string; id: string };
type Candidate = { href: string; label: string; title: string };
type CacheRow = { query: string; data: PhoneResult; updated_at: string };

const UNKNOWN = "--";

function normalize(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function squash(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

/** Strip tags and decode the HTML entities GSMArena uses in specs. */
function clean(raw: string): string {
  let s = raw.replace(/<[^>]*>/g, " ");
  s = s.replace(/&nbsp;/gi, " ");
  s = s.replace(/&amp;/gi, "&");
  s = s.replace(/&quot;/gi, '"');
  s = s.replace(/&#0?39;|&apos;/gi, "'");
  s = s.replace(/&Prime;/g, '"').replace(/&prime;/g, "'");
  s = s.replace(/&#8243;/g, '"').replace(/&#8242;/g, "'");
  s = s.replace(/&hellip;/g, "...").replace(/&mdash;/g, "-").replace(/&ndash;/g, "-");
  s = s.replace(/&[a-z]+;/gi, " ").replace(/&#\d+;/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

// GSMArena rate-limits bursts of requests from one IP: space requests
// >=500 ms apart and retry a challenged / failed fetch once.
const MIN_GAP_MS = 700;
let lastFetchAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(
  url: string,
  ms = 8000,
): Promise<{ status: number; html: string } | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(1200);
    const now = Date.now();
    const gap = lastFetchAt + MIN_GAP_MS - now;
    if (gap > 0) await sleep(gap);
    lastFetchAt = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: GSM + "/",
        },
        redirect: "follow",
        signal: ctrl.signal,
      });
      const html = await res.text();
      if (res.status === 200 && !isChallengePage(html)) {
        return { status: res.status, html };
      }
      if (attempt === 1) return { status: res.status, html };
    } catch {
      if (attempt === 1) return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

function isChallengePage(html: string): boolean {
  return /turnstile|cf-challenge|attention required|just a moment/i.test(html);
}

function specField(html: string, key: string): string {
  const re = new RegExp(`data-spec="${key}"[^>]*>((?:[^<]|<(?:br|b|i|strong|em|a|span)[^>]*>)*)`, "i");
  const m = html.match(re);
  return m ? clean(m[1]) : "";
}

function firstSpec(html: string, keys: string[]): string {
  for (const key of keys) {
    const value = specField(html, key);
    if (value) return value;
  }
  return "";
}

/** "128GB 12GB RAM, 256GB 12GB RAM" -> ram "12 GB", storage "128 GB / 256 GB". */
function parseMemory(internal: string): { ram: string; storage: string } {
  if (!internal) return { ram: UNKNOWN, storage: UNKNOWN };
  const storages: string[] = [];
  let ram = "";
  for (const variant of internal.split(",").map((v) => v.trim()).filter(Boolean)) {
    const caps = [...variant.matchAll(/(\d+(?:\.\d+)?)\s*(GB|TB)/gi)].map(
      (m) => `${m[1]} ${m[2].toUpperCase()}`,
    );
    if (caps.length === 0) continue;
    if (/RAM/i.test(variant)) {
      const beforeRam = variant.slice(0, variant.toLowerCase().lastIndexOf("ram"));
      const ramCap = [...beforeRam.matchAll(/(\d+(?:\.\d+)?)\s*(GB|TB)/gi)].pop();
      if (ramCap && !ram) ram = `${ramCap[1]} ${ramCap[2].toUpperCase()}`;
      for (const cap of caps.slice(0, -1)) {
        if (!storages.includes(cap)) storages.push(cap);
      }
    } else {
      for (const cap of caps) {
        if (!storages.includes(cap)) storages.push(cap);
      }
    }
  }
  return {
    ram: ram || UNKNOWN,
    storage: storages.length ? storages.join(" / ") : UNKNOWN,
  };
}

function parseDisplay(html: string): string {
  const size = firstSpec(html, ["displaysize-h1", "displaysize"]);
  const type = firstSpec(html, ["displaytype"]);
  const sizeMatch = size.match(/([\d.]+)\s*(?:inches?|")/i);
  const inches = sizeMatch ? `${sizeMatch[1]} inch` : size.split(",")[0].trim();
  const parts = [inches, type].filter(Boolean);
  return parts.length ? parts.join(" ") : UNKNOWN;
}

function parseCamera(html: string): string {
  const modules = firstSpec(html, ["cam1modules"]);
  if (modules) {
    const mps = [...modules.matchAll(/(\d+(?:\.\d+)?)\s*MP/gi)].map(
      (m) => `${m[1]}MP`,
    );
    if (mps.length) {
      const zoom = modules.match(/(\d+(?:\.\d+)?)x optical zoom/i);
      return mps.join(" + ") + (zoom ? ` (${zoom[1]}x tele)` : "");
    }
    return modules;
  }
  return firstSpec(html, ["camerapixels-h1"]) || UNKNOWN;
}

function parseBattery(html: string): string {
  const size = firstSpec(html, ["batsize-h1"]);
  if (/^\d{3,5}$/.test(size)) return `${size} mAh`;
  if (size) return size;
  const type = firstSpec(html, ["battype", "battype-h1"]);
  const m = type.match(/(\d{3,5})\s*mAh/i) || html.match(/(\d{3,5})\s*mAh/i);
  return m ? `${m[1]} mAh` : UNKNOWN;
}

function parseDescription(html: string): string[] {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (m && m[1]) {
    const text = clean(m[1]);
    if (text) return [text];
  }
  return [];
}

function parsePhonePage(html: string, url: string): PhoneResult | null {
  const name = firstSpec(html, ["modelname"]);
  if (!name) return null;
  const { ram, storage } = parseMemory(firstSpec(html, ["internalmemory"]));
  return {
    name,
    description: parseDescription(html),
    specs: {
      ram,
      storage,
      display: parseDisplay(html),
      chipset: firstSpec(html, ["chipset"]) || UNKNOWN,
      camera: parseCamera(html),
      battery: parseBattery(html),
      os: firstSpec(html, ["os"]) || UNKNOWN,
    },
    source: "gsmarena.com",
    url,
    cached: false,
  };
}

async function fetchAndParse(url: string): Promise<PhoneResult | null> {
  const res = await fetchText(url, 9000);
  if (!res || res.status !== 200 || isChallengePage(res.html)) return null;
  return parsePhonePage(res.html, url);
}

/** Extract the makers list: href="samsung-phones-9.php" etc. */
function extractBrands(html: string): Brand[] {
  const brands: Brand[] = [];
  const re = /href="([a-z0-9-]+)-phones-(\d+)\.php"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (!brands.some((b) => b.slug === m![1])) {
      brands.push({ slug: m[1], id: m[2] });
    }
  }
  return brands;
}

/** Extract phone entries from a makers / results list page. */
function extractCandidates(html: string): Candidate[] {
  const out: Candidate[] = [];
  const re =
    /<a\s+href="([a-z0-9_-]+\.php)"><img[^>]*?(?:title="([^"]*)")?[^>]*><strong><span>([^<]+)<\/span><\/strong>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push({ href: m[1], label: clean(m[3]), title: clean(m[2] || "") });
  }
  return out;
}

/** Exact model-name match wins; otherwise every query token must appear in
 *  the candidate's label or slug, preferring the shortest label. */
function pickCandidate(query: string, cands: Candidate[]): Candidate | null {
  const queryNorm = squash(query);
  const queryTokens = tokens(query);
  let tokenBest: Candidate | null = null;
  for (const cand of cands) {
    if (squash(cand.label) === queryNorm) return cand;
    const all = new Set([
      ...tokens(cand.label),
      ...tokens(cand.href.replace(/_/g, " ").replace(/-\d+\.php$/, "")),
    ]);
    if (queryTokens.length && queryTokens.every((t) => all.has(t))) {
      if (!tokenBest || cand.label.length < tokenBest.label.length) {
        tokenBest = cand;
      }
    }
  }
  return tokenBest;
}

const BRAND_ALIASES: Record<string, string> = {
  iphone: "apple",
  ipad: "apple",
  pixel: "google",
  galaxy: "samsung",
  redmi: "xiaomi",
  poco: "xiaomi",
  mi: "xiaomi",
  nord: "oneplus",
  moto: "motorola",
};

function detectBrand(query: string, brands: Brand[]): Brand | null {
  for (const word of tokens(query)) {
    const alias = BRAND_ALIASES[word];
    if (alias) {
      const hit = brands.find((b) => b.slug === alias);
      if (hit) return hit;
    }
    const direct = brands.find((b) => b.slug === word);
    if (direct) return direct;
  }
  return null;
}

type ScanOutcome = { url: string | null; blocked: boolean };

async function scanBrand(
  brand: Brand,
  query: string,
  maxPages = MAX_BRAND_PAGES,
): Promise<ScanOutcome> {
  const collected: Candidate[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1
      ? `${GSM}/${brand.slug}-phones-${brand.id}.php`
      : `${GSM}/${brand.slug}-phones-f-${brand.id}-0-p${page}.php`;
    const res = await fetchText(url, 7000);
    if (!res || res.status !== 200 || isChallengePage(res.html)) {
      return { url: null, blocked: true };
    }
    const cands = extractCandidates(res.html);
    if (cands.length === 0) return { url: null, blocked: true };
    const exact = cands.find((c) => squash(c.label) === squash(query));
    if (exact) return { url: `${GSM}/${exact.href}`, blocked: false };
    collected.push(...cands);
  }
  const pick = pickCandidate(query, collected);
  return { url: pick ? `${GSM}/${pick.href}` : null, blocked: false };
}

async function searchQuick(query: string): Promise<string | null> {
  const url = `${GSM}/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
  const res = await fetchText(url, 8000);
  if (!res || res.status !== 200 || isChallengePage(res.html)) return null;
  const pick = pickCandidate(query, extractCandidates(res.html));
  return pick ? `${GSM}/${pick.href}` : null;
}

function getClient() {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !key) return null;
    return createClient(url, key);
  } catch {
    return null;
  }
}

async function readCache(norm: string): Promise<PhoneResult | null> {
  const sb = getClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("phone_specs_cache")
      .select("data, updated_at")
      .eq("query", norm)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as CacheRow;
    const ageMs = Date.now() - new Date(row.updated_at).getTime();
    if (ageMs > CACHE_TTL_DAYS * 24 * 60 * 60 * 1000) return null;
    return { ...row.data, cached: true } as PhoneResult;
  } catch {
    return null;
  }
}

async function writeCache(norm: string, result: PhoneResult): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  try {
    await sb.from("phone_specs_cache").upsert({
      query: norm,
      data: result,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Cache is best-effort; a failed write must not fail the response.
  }
}

async function lookup(
  query: string,
): Promise<{ result: PhoneResult | null; notes: string[] }> {
  const notes: string[] = [];
  const norm = normalize(query);

  const cached = await readCache(norm);
  if (cached) return { result: cached, notes };

  const makersRes = await fetchText(`${GSM}/makers.php3`, 8000);
  if (!makersRes || makersRes.status !== 200 || isChallengePage(makersRes.html)) {
    notes.push("gsmarena makers page unavailable");
    return { result: null, notes };
  }
  const brands = extractBrands(makersRes.html);
  const brand = detectBrand(query, brands);
  if (brand) {
    const scan = await scanBrand(brand, query);
    if (scan.url) {
      const parsed = await fetchAndParse(scan.url);
      if (parsed) {
        await writeCache(norm, parsed);
        return { result: parsed, notes };
      }
      notes.push("found the specs page but could not load or parse it (gsmarena blocked the page)");
    } else {
      notes.push(scan.blocked
        ? "gsmarena brand pages blocked (bot-challenge / rate limit)"
        : "brand pages searched, no exact model match");
    }
  } else {
    let blocked = false;
    for (const slug of TOP_BRANDS) {
      const b = brands.find((x) => x.slug === slug);
      if (!b) continue;
      const scan = await scanBrand(b, query, 1);
      if (scan.url) {
        const parsed = await fetchAndParse(scan.url);
        if (parsed) {
          await writeCache(norm, parsed);
          return { result: parsed, notes };
        }
        notes.push("found the specs page but could not load or parse it (gsmarena blocked the page)");
      }
      if (scan.blocked) blocked = true;
    }
    notes.push(blocked
      ? "gsmarena brand pages blocked (bot-challenge / rate limit)"
      : "top brand pages searched, no match");
  }

  // Last resort: GSMArena quick search. It is usually blocked by a
  // bot-challenge from datacentre IPs, so it runs only after brand discovery.
  const quick = await searchQuick(query);
  if (quick) {
    const parsed = await fetchAndParse(quick);
    if (parsed) {
      await writeCache(norm, parsed);
      return { result: parsed, notes };
    }
    notes.push("quick search matched a page but its specs could not be parsed");
  } else {
    notes.push("gsmarena quick search unavailable (bot-challenge page)");
  }
  return { result: null, notes };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  let query = "";
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({})) as Record<string, unknown>;
      query = String(body.query ?? body.q ?? "");
    } else {
      query = new URL(req.url).searchParams.get("q") ?? "";
    }
  } catch {
    query = "";
  }
  query = query.trim();
  if (!query) {
    return json({
      error: "missing_query",
      message: 'Pass ?q=Galaxy S25 (GET) or {"query": "Galaxy S25"} (POST).',
    }, 400);
  }
  try {
    const { result, notes } = await lookup(query);
    if (!result) {
      return json({
        error: "phone_not_found",
        message: `No GSMArena specs page found for "${query}".`,
        source: "gsmarena.com",
        notes,
      }, 404);
    }
    return json({ ...result, notes });
  } catch (err) {
    return json({
      error: "upstream_error",
      message: String(err),
      source: "gsmarena.com",
    }, 502);
  }
});
