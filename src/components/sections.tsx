import Image from "next/image";
import Link from "next/link";
import { isPublished, primaryServices, type FAQ } from "@/content/pages";
import { scenePoster } from "@/content/scenes";
import { Icon } from "./icon";
import { ProductExplorer } from "./experience";
import { PrivacyLink } from "./privacy-link";
import { Handwritten } from "./handwritten";

export function SectionHeading({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="section-heading"><p className="eyebrow"><span />{label}</p><h2 data-scroll-reveal>{children}</h2></div>;
}

export function ServiceLinks() {
  return <div className="service-links">
    {primaryServices.filter(({ path }) => isPublished(path)).map(({ path, title, description, scene }, index) => (
      <Link className={`service-line service-line-${scene}`} key={path} href={path}>
        <span className="service-line-number">0{index + 1}</span>
        <span className="service-line-copy"><strong>{title}</strong><span>{description}</span></span>
        <span className="service-line-art"><Image src={scenePoster(scene)} alt="" width={200} height={200} unoptimized /></span>
        <span className="service-line-arrow"><Icon name="up-right" /></span>
      </Link>
    ))}
  </div>;
}

export function FAQList({ items }: { items: readonly FAQ[] }) {
  return <div className="faq-list">{items.map(([question, answer]) => <details key={question} name="faq">
    <summary>{question}<Icon name="chevron" size={20} /></summary>
    <p>{answer}</p>
  </details>)}</div>;
}

export function ProductFeature({ interactive = false }: { interactive?: boolean }) {
  return (
    <div className="product-feature">
      <div className="product-feature-content">
        <Image src="/media/one-search-logo.webp" alt="One Search logo" width={64} height={64} unoptimized />
        <h3>One Search</h3>
        <p>Railway, flight and RTO information in one digital experience.</p>
        <Link href="/products/one-search" className="button">Discover One Search <Icon name="up-right" size={16} /></Link>
        <PrivacyLink className="inline-link product-privacy-link" />
      </div>
      {interactive ? <ProductExplorer /> :
        <div className="product-feature-art" aria-hidden="true"><Image src="/media/one-search-ui/transport-art.webp" alt="" width={296} height={185} unoptimized /></div>}
    </div>
  );
}

export function Closing({ title = "Let's build what's next.", accent, description = "Tell us what you want to create, who it’s for and what you need it to do." }: { title?: string; accent?: string; description?: string }) {
  return (
    <section className="closing">
      <div className="wrap closing-shell">
        <div><p className="eyebrow"><span />Project enquiries</p><h2 data-scroll-reveal>{title}{accent && <> <Handwritten>{accent}</Handwritten></>}</h2><p>{description}</p></div>
        <Link className="button button-solid" href="/contact">Start a project <Icon name="up-right" size={17} /></Link>
      </div>
    </section>
  );
}
