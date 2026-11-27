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
    const context = gsap.context(() => {
      if (changed) gsap.fromTo("[data-route-reveal]", { clipPath: "inset(0 0 100% 0)" }, {
        clipPath: "inset(0 0 0% 0)", duration: 0.52, ease: "power3.out", clearProps: "clipPath",
      });
      for (const element of gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]")) {
        if (element.getBoundingClientRect().top < window.innerHeight * 0.94) continue;
        gsap.fromTo(element, { clipPath: "inset(0 100% 0 0)" }, {
          clipPath: "inset(0 0% 0 0)", duration: 0.64, ease: "power3.out", clearProps: "clipPath",
          scrollTrigger: { trigger: element, start: "top 94%", once: true },
        });
      }
    });
    return () => context.revert();
  }, [pathname, reduced]);
  return null;
}
