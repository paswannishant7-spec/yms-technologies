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

export default function SceneView({ id, paused = false, productView = 0, capture = false }: {
  id: SceneId;
  paused?: boolean;
  productView?: number;
  capture?: boolean;
}) {
  const { ref, visible } = useVisible<HTMLDivElement>();
  const [activated, setActivated] = useState(false);
  const [ready, setReady] = useState<SceneId | null>(null);
  const [fallback, setFallback] = useState(false);
  const motionReduced = useReducedMotion();
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    if (!visible || motionReduced || !ref.current) return;
    if (!activated) {
      const timer = window.setTimeout(() => {
        const probe = document.createElement("canvas");
        const context = probe.getContext("webgl2");
        if (context) {
          context.getExtension("WEBGL_lose_context")?.loseContext();
          setActivated(true);
        } else setFallback(true);
      }, capture ? 0 : 170);
      return () => window.clearTimeout(timer);
    }
    if (capture) return;
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const top = ref.current?.getBoundingClientRect().top ?? 0;
        setScroll(Math.min(1, Math.max(0, -top / (window.innerHeight * 0.65))));
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.cancelAnimationFrame(frame);
    };
  }, [activated, capture, motionReduced, ref, visible]);

  const live = !motionReduced && !fallback && ready === id;
  return (
    <div ref={ref} className="scene-live" aria-hidden="true" data-renderer={capture && live ? "capture-ready" : live ? "webgl" : "poster"}>
      {activated && !motionReduced && !fallback && (
        <div className={live ? "scene-canvas is-ready" : "scene-canvas"}>
          <SceneCanvas id={id} paused={paused || !visible} scroll={scroll} productView={productView}
            capture={capture} onReady={setReady} onFailure={() => setFallback(true)} />
        </div>
      )}
    </div>
  );
}
