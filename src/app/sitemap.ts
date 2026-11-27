import type { MetadataRoute } from "next";
import { business } from "@/content/business";
import { publishedPaths } from "@/content/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = business.origin;
  if (!origin) return [];
  return publishedPaths.map((path) => ({ url: new URL(path, origin).href }));
}
