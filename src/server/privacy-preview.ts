import "server-only";
import { business } from "@/content/business";

export function privacyPreviewEnabled() {
  return !business.origin && (process.env.NODE_ENV === "development" || process.env.YMS_LOCAL_PRIVACY_PREVIEW === "true");
}
