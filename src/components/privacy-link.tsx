import { privacyPath } from "@/content/route-loaders";
import { privacyPreviewEnabled } from "@/server/privacy-preview";

export function PrivacyLink({ className = "button button-solid" }: { className?: string }) {
  if (!privacyPreviewEnabled()) return null;
  return <a className={className} href={privacyPath} data-privacy-link>Privacy Policy <span className="privacy-draft-label">Draft preview</span></a>;
}
