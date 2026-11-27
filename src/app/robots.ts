import type { MetadataRoute } from "next";
import { business } from "@/content/business";
import { pagePaths, isPublished } from "@/content/pages";

export default function robots(): MetadataRoute.Robots {
  if (!business.origin || process.env.NODE_ENV === "development") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/scene-preview/", ...pagePaths.filter((path) => !isPublished(path))] },
    sitemap: new URL("/sitemap.xml", business.origin).href,
  };
}
