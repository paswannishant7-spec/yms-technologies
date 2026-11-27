"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icon";

export type NavItem = { label: string; href: string; items?: readonly { label: string; href: string; description: string }[] };

export function SiteNav({ entries }: { entries: readonly NavItem[] }) {
  const path = usePathname();
  return <Navigation key={path} path={path} entries={entries} />;
}

function Navigation({ path, entries }: { path: string; entries: readonly NavItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const dropdownToggles = useRef<Record<string, HTMLButtonElement | null>>({});
  const active = (href: string) => href === "/" ? path === href : path === href || path.startsWith(href + "/");
  const close = () => { setOpen(null); setMobile(false); };

  useEffect(() => {
    if (!open && !mobile) return;
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(null);
        setMobile(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (open) {
        setOpen(null);
        dropdownToggles.current[open]?.focus();
      } else {
        setMobile(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobile, open]);

  return (
    <header className="site-header" ref={root}>
      <div className="nav-shell">
        <Link href="/" className="brand-link" aria-label="YMS Technologies home" onClick={close}>
          <Image src="/media/yms-navigation-light.webp" width={106} height={53} alt="" loading="eager" unoptimized />
        </Link>
        <button ref={toggle} className="nav-toggle icon-button" type="button" aria-label={mobile ? "Close navigation" : "Open navigation"}
          aria-controls="primary-navigation" aria-expanded={mobile} onClick={() => { setMobile(!mobile); setOpen(null); }}>
          <Icon name={mobile ? "close" : "menu"} />
        </button>
        <nav id="primary-navigation" className={`primary-navigation ${mobile ? "is-open" : ""}`} aria-label="Primary">
          <ul>
            {entries.map((entry) => {
              const expanded = open === entry.href;
              const menuId = `menu-${entry.href.slice(1)}`;
              return (
                <li key={entry.href} className={`nav-item ${active(entry.href) ? "is-active" : ""}`}>
                  <div className="nav-item-label">
                    <Link href={entry.href} aria-current={path === entry.href ? "page" : undefined} onClick={close}>{entry.label}</Link>
                    {entry.items?.length ? <button
                      ref={(node) => { dropdownToggles.current[entry.href] = node; }}
                      className="nav-chevron" type="button" aria-expanded={expanded} aria-controls={menuId}
                      aria-label={`${expanded ? "Close" : "Open"} ${entry.label.toLowerCase()} menu`}
                      onClick={() => setOpen(expanded ? null : entry.href)}><Icon name="chevron" size={14} /></button> : null}
                  </div>
                  {entry.items && <ul id={menuId} className="nav-dropdown" hidden={!expanded}>
                    {entry.items.map((item) => <li key={item.href}>
                      <Link href={item.href} onClick={close}><span>{item.label}</span><small>{item.description}</small></Link>
                    </li>)}
                  </ul>}
                </li>
              );
            })}
          </ul>
        </nav>
        <Link className="button nav-cta" href="/contact#project-enquiry" onClick={close}>Start a project <Icon name="up-right" size={14} /></Link>
      </div>
    </header>
  );
}
