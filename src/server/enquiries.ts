import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { isPublished } from "@/content/pages";
import type { EnquiryKind } from "@/content/enquiries";

function httpsEndpoint(value?: string) {
  try {
    if (!value) return undefined;
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.hash ? url : undefined;
  } catch {
    return undefined;
  }
}

export function deliverySettings() {
  const url = httpsEndpoint(process.env.FORM_DELIVERY_URL);
  const token = process.env.FORM_DELIVERY_TOKEN?.trim();
  return url && token ? { url, token } : undefined;
}

export function enabledKind(kind: EnquiryKind) {
  return (kind !== "careers" || process.env.CAREER_APPLICATIONS_ENABLED === "true")
    && (kind !== "deletion" || (process.env.ONE_SEARCH_DELETION_ENABLED === "true" && isPublished("/products/one-search/delete-account")));
}

export function projectDeliveryAvailable() {
  return Boolean(deliverySettings()) && (!process.env.SITE_URL?.trim() || isPublished("/privacy-policy"));
}

const windowSeconds = 600;
const limit = 6;
const localCounts = new Map<string, { count: number; until: number }>();
const increment = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return n";

export async function withinEnquiryLimit(request: Request) {
  const header = process.env.FORM_CLIENT_IP_HEADER?.trim();
  const address = header ? request.headers.get(header) : null;
  const identifier = address && isIP(address) ? address : "shared";
  const key = `yms:enquiry:${createHash("sha256").update(identifier).digest("hex").slice(0, 28)}`;
  const url = httpsEndpoint(process.env.RATE_LIMIT_REST_URL);
  const token = process.env.RATE_LIMIT_REST_TOKEN?.trim();
  if (process.env.RATE_LIMIT_REST_URL || process.env.RATE_LIMIT_REST_TOKEN) {
    if (!url || !token) throw new Error("Incomplete rate-limit configuration");
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", increment, "1", key, String(windowSeconds)]),
      signal: AbortSignal.timeout(3500),
      redirect: "error",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Rate-limit service unavailable");
    const payload = await response.json() as { result?: number };
    if (typeof payload.result !== "number") throw new Error("Invalid rate-limit response");
    return payload.result <= limit;
  }
  // ponytail: process-local limiting is suitable for a single server; configure the shared store for replicas.
  const now = Date.now();
  const entry = localCounts.get(key);
  if (entry && entry.until > now) return ++entry.count <= limit;
  if (localCounts.size >= 2_000) {
    for (const [id, value] of localCounts) if (value.until <= now) localCounts.delete(id);
    if (localCounts.size >= 2_000) return false;
  }
  localCounts.set(key, { count: 1, until: now + windowSeconds * 1000 });
  return true;
}

export async function readEnquiry(request: Request) {
  const maxBytes = 12_000;
  if (!request.body || Number(request.headers.get("content-length")) > maxBytes) throw new RangeError();
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let body = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new RangeError();
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode()) as unknown;
  } finally {
    reader.releaseLock();
  }
}
