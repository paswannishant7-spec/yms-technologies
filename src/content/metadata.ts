import type { Metadata } from "next";
import { business } from "./business";
import { homepageFaqs, isPublished, pages } from "./pages";

export const brandTitle = "YMS Technologies";
const socialImage = "/media/social.webp";

export function metadataFor(path: string): Metadata {
  const page = pages[path];
  const title = path === "/" ? `${brandTitle} | ${page.title}` : `${page.title} | ${brandTitle}`;
  const canonical = business.origin && isPublished(path) ? new URL(path, business.origin).href : undefined;
  const image = business.origin ? new URL(socialImage, business.origin).href : undefined;
  return {
    title, description: page.description,
    alternates: canonical ? { canonical } : undefined,
    robots: !canonical ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", locale: "en_IN", siteName: brandTitle, title, description: page.description,
      url: canonical, images: image ? [{ url: image, width: 1200, height: 630, alt: "YMS Technologies – Technology in Motion" }] : undefined },
    twitter: { card: "summary_large_image", title, description: page.description, images: image ? [image] : undefined },
  };
}

export function structuredData(path: string) {
  const page = pages[path];
  const { origin } = business;
  if (!origin || !isPublished(path)) return [];
  const absolute = (route: string) => new URL(route, origin).href;
  const organisationId = `${absolute("/")}#organization`;
  const faq = path === "/" ? homepageFaqs : page.faqs;
  const schema = { "@context": "https://schema.org" };
  const result: Record<string, unknown>[] = [];
  if (path === "/") result.push({
    ...schema, "@type": "Organization", "@id": organisationId, name: business.name, legalName: business.legalName,
    url: absolute("/"), logo: absolute("/media/yms-identity.webp"), slogan: business.tagline, areaServed: business.country,
    email: business.email, telephone: business.phone,
    address: business.address ? { "@type": "PostalAddress", streetAddress: business.address, addressCountry: "IN" } : undefined,
  });
  if (page.layout === "service") result.push({
    ...schema, "@type": "Service", name: page.title, description: page.description, url: absolute(path),
    provider: { "@id": organisationId },
  });
  if (page.layout === "product") result.push({
    ...schema, "@type": "SoftwareApplication", name: page.title, description: page.description, url: absolute(path),
    image: absolute("/media/one-search-logo.webp"), publisher: { "@id": organisationId },
  });
  if (faq?.length) result.push({
    ...schema, "@type": "FAQPage", mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  });
  if (path !== "/") {
    const chain = [path];
    let parent = page.parent;
    while (parent) {
      chain.unshift(parent);
      parent = pages[parent].parent;
    }
    result.push({ ...schema, "@type": "BreadcrumbList", itemListElement: ["/", ...chain].map((route, index) => ({
      "@type": "ListItem", position: index + 1, name: route === "/" ? "Home" : pages[route].title, item: absolute(route),
    })) });
  }
  return result;
}
