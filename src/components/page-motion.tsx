"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./scene-view";

gsap.registerPlugin(ScrollTrigger);

export function PageMotion() {
  const pathname = usePathname();
  const last = useRef(pathname);
  const reduced = useReducedMotion();

  useEffect(() => {
    const changed = last.current !== pathname;
    last.current = pathname;
    if (reduced) return;
    const main = document.getElementById("main-content");
    let outgoing: gsap.core.Tween | undefined;
    const leave = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !main) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const destination = new URL(link.href);
      if (destination.origin !== window.location.origin || destination.pathname === pathname) return;
      outgoing?.revert();
      outgoing = gsap.to(main, { opacity: .9, y: -3, duration: .16, yoyo: true, repeat: 1, clearProps: "opacity,transform" });
    };
    document.addEventListener("click", leave, true);
    const context = gsap.context(() => {
      if (changed) gsap.fromTo("[data-route-reveal]", { clipPath: "inset(0 0 94% 0)", y: 7 }, {
        clipPath: "inset(0 0 0% 0)", y: 0, duration: .66, ease: "power3.out", clearProps: "clipPath,transform",
      });
      if (!changed && performance.now() < 900) gsap.fromTo(".nav-shell", { y: -6, opacity: .82 }, {
        y: 0, opacity: 1, duration: .34, ease: "power2.out", clearProps: "opacity,transform",
      });
      for (const element of gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]")) {
        if (element.getBoundingClientRect().top < window.innerHeight * 0.94) continue;
        const reveal = gsap.timeline({ scrollTrigger: { trigger: element, start: "top 96%", once: true } });
        reveal.fromTo(element, { clipPath: "inset(0 0 96% 0)", y: 14 }, {
          clipPath: "inset(0 0 0% 0)", y: 0, duration: .68, ease: "power3.out", clearProps: "clipPath,transform",
        }, 0);
        const ink = element.querySelector("[data-ink]");
        if (ink) reveal.fromTo(ink, { clipPath: "inset(0 100% 0 0)" }, {
          clipPath: "inset(0 0% 0 0)", duration: .63, clearProps: "clipPath",
        }, .31);
        const stroke = element.querySelector("[data-underline]");
        if (stroke) reveal.fromTo(stroke, { strokeDashoffset: 1 }, {
          strokeDashoffset: 0, duration: .53, clearProps: "strokeDashoffset",
        }, .56);
      }
      for (const copy of gsap.utils.toArray<HTMLElement>("[data-copy-reveal]")) {
        gsap.from(copy, { y: 7, opacity: .88, duration: .38, clearProps: "opacity,transform",
          scrollTrigger: { trigger: copy, start: "top 93%", once: true },
        });
      }
      for (const art of gsap.utils.toArray<HTMLElement>("[data-parallax]")) {
        gsap.fromTo(art, { y: 24 }, {
          y: -18, ease: "none", scrollTrigger: { trigger: art.parentElement, start: "top bottom", end: "bottom top", scrub: .45 },
        });
      }
      for (const line of gsap.utils.toArray<HTMLElement>("[data-process-line]")) {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1, ease: "none", scrollTrigger: { trigger: line.parentElement, start: "top 87%", end: "top 57%", scrub: .32 },
        });
      }
    });
    return () => {
      document.removeEventListener("click", leave, true);
      outgoing?.revert();
      context.revert();
    };
  }, [pathname, reduced]);
  return null;
}
