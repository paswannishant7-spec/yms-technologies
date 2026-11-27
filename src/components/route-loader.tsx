"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loaderFor, privacyPath } from "@/content/route-loaders";
import { useReducedMotion } from "./scene-view";

const signature = 635;
const reveal = 290;

export function RouteLoader() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const current = useRef(pathname);
  const [initial, setInitial] = useState(true);
  const job = useRef<{ path: string; start: number; timer: number; finish: number } | null>(null);
  const [overlay, setOverlay] = useState<{ path: string; leaving: boolean } | null>(null);

  useEffect(() => {
    function clear() {
      window.clearTimeout(job.current?.timer);
      window.clearTimeout(job.current?.finish);
      job.current = null;
    }
    function start(path: string) {
      clear();
      setInitial(false);
      setOverlay({ path, leaving: false });
      const transition = { path, start: performance.now(), timer: 0, finish: 0 };
      job.current = transition;
      transition.timer = window.setTimeout(() => leave(path), 2400);
    }
    function leave(path: string) {
      const transition = job.current;
      if (!transition || transition.path !== path) return;
      window.clearTimeout(transition.timer);
      transition.timer = window.setTimeout(() => {
        setOverlay({ path, leaving: true });
        transition.finish = window.setTimeout(() => {
          if (job.current !== transition) return;
          clear();
          setOverlay(null);
        }, reveal);
      }, Math.max(0, signature - (performance.now() - transition.start)));
    }
    function navigate(event: MouseEvent) {
      if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === current.current) return;
      if (url.pathname !== privacyPath) start(url.pathname);
    }
    function history() {
      if (location.pathname !== current.current) start(location.pathname);
    }
    function restored() { clear(); setOverlay(null); }
    function commit(event: Event) {
      const path = (event as CustomEvent<string>).detail;
      if (job.current?.path === path) leave(path);
    }
    if (reduced) {
      const reset = window.requestAnimationFrame(restored);
      return () => window.cancelAnimationFrame(reset);
    }
    document.addEventListener("click", navigate, true);
    window.addEventListener("popstate", history);
    window.addEventListener("pageshow", restored);
    window.addEventListener("yms-route-committed", commit);
    return () => {
      clear();
      document.removeEventListener("click", navigate, true);
      window.removeEventListener("popstate", history);
      window.removeEventListener("pageshow", restored);
      window.removeEventListener("yms-route-committed", commit);
    };
  }, [reduced]);

  useEffect(() => {
    if (current.current === pathname) return;
    current.current = pathname;
    window.dispatchEvent(new CustomEvent("yms-route-committed", { detail: pathname }));
  }, [pathname]);

  if (reduced || (!overlay && !initial)) return null;
  const path = overlay?.path ?? pathname;
  return <div key={path} className={overlay ? "route-transition" : "route-intro"} aria-hidden="true" inert
    data-loader={loaderFor(path)} data-privacy={path === privacyPath || undefined} data-phase={overlay?.leaving ? "exit" : "active"}>
    <div className="loader-wipe" />
    <span className="loader-mark"><i /><i /><i /><i /></span>
  </div>;
}
