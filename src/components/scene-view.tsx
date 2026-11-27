"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useSyncExternalStore, useEffect } from "react";
import type { SceneId } from "@/content/scenes";

const SceneCanvas = dynamic(() => import("./scene-canvas"), { ssr: false });
const mediaQuery = "(prefers-reduced-motion: reduce)";
const reduced = () => window.matchMedia(mediaQuery).matches;
function subscribe(callback: () => void) {
  const media = window.matchMedia(mediaQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export const useReducedMotion = () => useSyncExternalStore(subscribe, reduced, () => false);

export function useVisible<T extends HTMLElement>(margin = "0px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: margin });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [margin]);
  return { ref, visible };
}

export default function SceneView({ id, paused = false, productView = 0, capture = false, scrollOverride }: {
  id: SceneId;
  paused?: boolean;
  productView?: number;
  capture?: boolean;
  scrollOverride?: number;
}) {
  const { ref, visible } = useVisible<HTMLDivElement>();
  const [activated, setActivated] = useState(false);
  const [software, setSoftware] = useState(false);
  const [ready, setReady] = useState<SceneId | null>(null);
  const [fallback, setFallback] = useState(false);
  const motionReduced = useReducedMotion();
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    if (!visible || motionReduced || fallback || !ref.current) return;
    if (!activated) {
      let cancelled = false;
      let idle = 0;
      let timer = 0;
      let paint = 0;
      const inHero = !!ref.current.closest(".cinematic-hero");
      const activate = () => {
        if (cancelled) return;
        const probe = document.createElement("canvas");
        const context = probe.getContext("webgl2");
        if (context) {
          const debug = context.getExtension("WEBGL_debug_renderer_info");
          const name = debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "";
          setSoftware(/swiftshader|llvmpipe|software rasterizer/i.test(name));
          context.getExtension("WEBGL_lose_context")?.loseContext();
          setActivated(true);
        } else setFallback(true);
      };
      if (capture) timer = window.setTimeout(activate, 0);
      else {
        const poster = ref.current.parentElement?.querySelector("img");
        const critical = Promise.allSettled([document.fonts.ready, poster?.decode()]);
        void critical.then(() => {
          if (cancelled) return;
          paint = window.requestAnimationFrame(() => {
            // Give the first poster a paint opportunity before probing the GPU and evaluating the 3D bundle.
            timer = window.setTimeout(() => {
              if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(activate, { timeout: 900 });
              else activate();
            }, inHero ? 620 : 40);
          });
        });
      }
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
        window.cancelAnimationFrame(paint);
        if (idle) window.cancelIdleCallback(idle);
      };
    }
    if (capture) return;
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const hero = ref.current?.closest(".cinematic-hero");
        const top = (hero ?? ref.current)?.getBoundingClientRect().top ?? 0;
        const view = window.innerHeight;
        const progress = Math.min(1, Math.max(0, ((hero ? 0 : view * .38) - top) / (view * .82)));
        setScroll((current) => progress === 0 || progress === 1 || Math.abs(progress - current) > .035 ? progress : current);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.cancelAnimationFrame(frame);
    };
  }, [activated, capture, fallback, motionReduced, ref, visible]);

  const live = !motionReduced && !fallback && ready === id;
  return (
    <div ref={ref} className="scene-live" aria-hidden="true" data-renderer={capture && live ? "capture-ready" : live ? "webgl" : "poster"}>
      {activated && !motionReduced && !fallback && (
        <div className={live ? "scene-canvas is-ready" : "scene-canvas"}>
          <SceneCanvas id={id} paused={paused || !visible} scroll={scrollOverride ?? scroll} productView={productView}
            capture={capture} software={software && !capture} onReady={setReady} onFailure={() => setFallback(true)} />
        </div>
      )}
    </div>
  );
}
