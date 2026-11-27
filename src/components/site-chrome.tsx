import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/business";
import { isPublished, primaryServices } from "@/content/pages";
import { SiteNav, type NavItem } from "./site-nav";

const nav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services", items: [
    ...primaryServices.map(({ path, title, description }) => ({ label: title, href: path, description })),
    { label: "Technology & Innovation", href: "/technology", description: "How we design and develop digital systems." },
  ] },
  { label: "Products", href: "/products", items: [
    { label: "One Search", href: "/products/one-search", description: "Railway, flight and RTO information in one application." },
    { label: "One Search Support", href: "/products/one-search/support", description: "Find help with the app." },
  ] },
  { label: "Work", href: "/work" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return <SiteNav entries={nav.filter((item) => isPublished(item.href)).map((item) => ({
    ...item, items: item.items?.filter((link) => isPublished(link.href)),
  }))} />;
}

const footGroups = [
  { title: "Company", links: [["About", "/about"], ["Technology", "/technology"], ["Industries", "/industries"], ["Insights", "/insights"], ["Careers", "/careers"]] },
  { title: "Services", links: primaryServices.map(({ title, path }) => [title, path]) },
  { title: "Products & support", links: [["Our Products", "/products"], ["One Search", "/products/one-search"], ["One Search Support", "/products/one-search/support"], ["Support Centre", "/support"], ["Contact", "/contact"]] },
];
const legal = [["Privacy", "/privacy-policy"], ["Terms", "/terms-and-conditions"], ["Cookies", "/cookie-policy"], ["Disclaimer", "/disclaimer"]];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="YMS Technologies home"><Image src="/media/yms-navigation-derivative.webp" width={142} height={71} alt="" unoptimized /></Link>
            <p>Technology in Motion.<br />India · Associated with York Media Solutions.</p>
            {business.email && <a href={`mailto:${business.email}`}>{business.email}</a>}
            {business.phone && <a href={`tel:${business.phone}`}>{business.phone}</a>}
            {business.address && <address>{business.address}</address>}
          </div>
          {footGroups.map(({ title, links }) => <nav aria-label={title} key={title}><h2>{title}</h2>
            <ul>{links.filter(([, href]) => isPublished(href)).map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
          </nav>)}
        </div>
        <div className="footer-base">
          <span>© {new Date().getUTCFullYear()} {business.legalName ?? business.name}</span>
          {legal.some(([, href]) => isPublished(href)) && <nav aria-label="Legal">{legal.filter(([, href]) => isPublished(href)).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>}
          <Link href="#main-content">Back to top</Link>
        </div>
      </div>
    </footer>
  );
}
