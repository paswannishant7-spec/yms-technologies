import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Closing, FAQList, ProductFeature, SectionHeading, ServiceLinks } from "@/components/sections";
import { EnquiryForm } from "@/components/enquiry-form";
import { Experience, Process } from "@/components/experience";
import { OneSearchPage } from "@/components/one-search-page";
import { PrivacyLink } from "@/components/privacy-link";
import { Icon } from "@/components/icon";
import { Handwritten } from "@/components/handwritten";
import { StructuredData } from "@/components/structured-data";
import { business } from "@/content/business";
import { metadataFor } from "@/content/metadata";
import { isPublished, pages, publishedPaths, routeVisible } from "@/content/pages";
import { deliverySettings, enabledKind, projectDeliveryAvailable } from "@/server/enquiries";

type Props = { params: Promise<{ slug: string[] }> };
const viewSteps = {
  mobile: ["Discovery", "Interface", "Development", "Testing", "Launch"],
  web: ["Desktop", "Tablet", "Mobile"],
  marketing: ["Search", "Audience", "Content"],
} as const;

export function generateStaticParams() {
  return publishedPaths.filter((path) => path !== "/").map((path) => ({ slug: path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const path = "/" + (await params).slug.join("/");
  if (!routeVisible(path)) notFound();
  return metadataFor(path);
}

function Breadcrumbs({ path }: { path: string }) {
  const page = pages[path];
  const parents = [];
  let parent = page.parent;
  while (parent) {
    parents.unshift(parent);
    parent = pages[parent].parent;
  }
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol><li><Link href="/">Home</Link></li>
        {parents.map((href) => <li key={href}><Link href={href}>{pages[href].title}</Link></li>)}
        <li aria-current="page">{page.title}</li>
      </ol>
    </nav>
  );
}

export default async function InteriorPage({ params }: Props) {
  const path = "/" + (await params).slug.join("/");
  if (!routeVisible(path)) notFound();
  const page = pages[path];
  const layout = page.layout ?? "legal";
  if (layout === "product") return <><StructuredData path={path} /><OneSearchPage breadcrumb={<Breadcrumbs path={path} />} /></>;
  if (layout === "contact") {
    await connection();
    return <article className="interior interior-contact">
      <StructuredData path={path} />
      <div className="wrap page-breadcrumb"><Breadcrumbs path={path} /></div>
      <section className="wrap contact-grid">
        <div className="contact-sidebar">
          <p className="eyebrow"><span />Let&apos;s build together</p>
          <h1 data-route-reveal>Your next big idea <Handwritten>starts here.</Handwritten></h1>
          <p data-route-copy>Tell us what you want to build, who it&apos;s for and when you need it. We&apos;ll use that to start the conversation.</p>
          {business.email && <p><a href={`mailto:${business.email}`}>{business.email}</a></p>}
          {business.phone && <p><a href={`tel:${business.phone}`}>{business.phone}</a></p>}
          <Experience id="brand" className="contact-art" />
        </div>
        <section id="project-enquiry" tabIndex={-1} aria-labelledby="enquiry-title" className="contact-panel">
          <h2 id="enquiry-title">Project enquiry</h2>
          <EnquiryForm initialKind="project" available={projectDeliveryAvailable()} email={business.email}
            privacyHref={isPublished("/privacy-policy") ? "/privacy-policy" : undefined} />
        </section>
      </section>
    </article>;
  }
  const service = layout === "service";
  const operational = Boolean(deliverySettings());
  const stage = page.scene;

  return (
    <article className={`interior interior-${layout} interior-${page.scene ?? "text"}`}>
      <StructuredData path={path} />
      <div className="wrap page-breadcrumb"><Breadcrumbs path={path} /></div>
      {page.draft && <aside className="draft-notice wrap"><strong>Development preview.</strong> {page.draft}</aside>}
      <header className={`interior-hero wrap ${stage ? "with-stage" : ""}`}>
        <div className="interior-title">
          <p className="eyebrow"><span />{page.eyebrow ?? (page.draft ? "Development preview" : page.title)}</p>
          <h1 data-route-reveal>{page.headline ?? page.title}</h1>
          <p className="interior-description" data-route-copy>{page.description}</p>
          {service && !page.draft && <Link className="button" href="/contact#project-enquiry" data-route-copy>Discuss your project <Icon name="up-right" size={16} /></Link>}
        </div>
        {stage && page.scene && <Experience id={page.scene} className="interior-art"
          steps={service && page.scene in viewSteps ? viewSteps[page.scene as keyof typeof viewSteps] : undefined} />}
      </header>
      {layout === "services" && <section className="section wrap"><SectionHeading label="Explore our services">Choose where to begin.</SectionHeading><ServiceLinks /></section>}
      {layout === "products" && <section className="section wrap"><SectionHeading label="Our digital products">Explore One Search.</SectionHeading><ProductFeature /></section>}
      {layout === "support" && (
        <section className="section wrap support-content">
          {page.productSupport ? (
            <>
              <SectionHeading label="Report an issue">How can we help?</SectionHeading>
              <Link className="inline-link" href="/products/one-search#one-search-tour">Review the One Search walkthrough <Icon name="up-right" size={16} /></Link>
              <PrivacyLink className="inline-link product-privacy-link" />
              <EnquiryForm initialKind="support" available={operational} email={business.support} />
              {isPublished("/products/one-search/delete-account") && <Link className="inline-link" href="/products/one-search/delete-account">Account and data deletion <Icon name="up-right" size={16} /></Link>}
            </>
          ) : (
            <div className="support-links">
              <Link href="/products/one-search/support"><strong>One Search Support</strong><span>Get help with Railway, Flight and RTO.</span><Icon name="up-right" /></Link>
              <Link href="/contact"><strong>General enquiries</strong><span>Ask a question about YMS Technologies.</span><Icon name="up-right" /></Link>
            </div>
          )}
        </section>
      )}
      {page.sections?.length ? (
        <section className={`section wrap editorial-sections ${layout === "insights" ? "insights-index" : ""}`} aria-label={service ? "Service details" : `${page.title} details`}>
          {page.sections.map(({ heading, body }, i) => (
            <article key={heading}>
              {(service || layout === "insights" || layout === "industries") && <span className="editorial-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>}
              <h2 data-scroll-reveal>{heading}</h2><p data-copy-reveal>{body}</p>
              {layout === "about" && i === 0 && <Image className="identity-art" src="/media/yms-identity.webp" alt="Approved YMS Technologies identity with Technology in Motion tagline" width={550} height={550} unoptimized />}
            </article>
          ))}
        </section>
      ) : null}
      {service && !page.draft && <section className="section process-band"><div className="wrap">
        <SectionHeading label="Our process">How the work moves forward.</SectionHeading><Process />
      </div></section>}
      {layout === "careers" && enabledKind("careers") && <section className="section wrap support-content">
        <SectionHeading label="Careers enquiry">Introduce yourself.</SectionHeading>
        <EnquiryForm initialKind="careers" available={operational} email={business.email} />
      </section>}
      {path === "/products/one-search/delete-account" && enabledKind("deletion") && <section className="section wrap support-content">
        <SectionHeading label="Account support">Request account deletion.</SectionHeading>
        <EnquiryForm initialKind="deletion" available={operational} email={business.support} />
      </section>}
      {page.faqs?.length ? <section className="section faq-section"><div className="wrap faq-grid">
        <SectionHeading label="FAQs">Common questions.</SectionHeading><FAQList items={page.faqs} />
      </div></section> : null}
      {service && !page.draft && <section className="section wrap"><SectionHeading label="Related services">Explore the wider work.</SectionHeading><ServiceLinks /></section>}
      {!["contact", "support", "legal"].includes(layout) && !page.draft && <Closing />}
    </article>
  );
}
