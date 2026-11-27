import { privacyPath } from "@/content/route-loaders";
import { privacyPreviewEnabled } from "@/server/privacy-preview";
import { Icon } from "./icon";

export function PrivacyLink({ className = "button button-solid" }: { className?: string }) {
  if (!privacyPreviewEnabled()) return null;
  return <a className={className} href={privacyPath} target="_blank" rel="noopener noreferrer" data-privacy-link>
    Privacy Policy <span className="privacy-draft-label">Draft preview</span><Icon name="up-right" size={14} /><span className="sr-only"> (opens in a new tab)</span>
  </a>;
}
