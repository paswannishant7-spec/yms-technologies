import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { privacyPreviewEnabled } from "@/server/privacy-preview";

const pages = new Set(["contact", "delete-account", "privacy-policy"]);
const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm",
};
const unavailable = () => new Response("Page unavailable.", { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow" } });

export async function GET(request: NextRequest, { params }: { params: Promise<{ asset?: string[] }> }) {
  if (!privacyPreviewEnabled() || !["127.0.0.1", "localhost", "[::1]"].includes(new URL(request.url).hostname)) return unavailable();
  const { asset = [] } = await params;
  if (asset.some((part) => !/^[\w.-]+$/.test(part) || part === "." || part === "..")) return unavailable();
  let file = asset.join("/") || "index.html";
  if (pages.has(file)) file += ".html";
  // Next emits nested segment files while its static client requests flattened names.
  if (asset.length === 2 && pages.has(asset[0]) && asset[1] === `__next.${asset[0]}.__PAGE__.txt`) {
    file = `${asset[0]}/__next.${asset[0]}/__PAGE__.txt`;
  }
  const type = path.extname(file) === ".txt" ? "text/x-component; charset=utf-8" : contentTypes[path.extname(file)];
  if (!type) return unavailable();
  try {
    const bytes = await readFile(path.join(process.cwd(), "privacy-export", file));
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": type,
      "Cache-Control": file.startsWith("_next/static/") ? "private, max-age=31536000, immutable" : "private, max-age=60",
      "X-Robots-Tag": "noindex, nofollow",
    } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return unavailable();
    throw error;
  }
}
