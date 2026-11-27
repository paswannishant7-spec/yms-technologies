"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { processSteps } from "@/content/pages";
import { productScreens, productViews, scenePoster, scenes, type SceneId } from "@/content/scenes";
import SceneView from "./scene-view";

export function Experience({ id, className = "", productView = 0, steps, caption }: {
  id: SceneId; className?: string; productView?: number; steps?: readonly string[]; caption?: string;
}) {
  const scene = scenes.find((entry) => entry.id === id)!;
  const [step, setStep] = useState<number | null>(null);
  const screen = productScreens[productView];
  return (
    <figure className={`experience stage-backdrop ${className}`} data-model={id}
      style={{ "--scene-base": scene.background, "--scene-accent": scene.accent } as React.CSSProperties}>
      <div className="architecture" aria-hidden="true" />
      <div className="stage-floor" aria-hidden="true" />
      <div className="experience-art" aria-hidden="true">
        {id === "product" ? (
          <div className="product-static-phone"><Image key={screen.image} src={screen.image} alt="" width={screen.width} height={screen.height} unoptimized /></div>
        ) : (
          <Image src={scenePoster(id)} alt="" fill sizes="(max-width: 760px) 92vw, 55vw" unoptimized />
        )}
        <SceneView id={id} productView={productView} scrollOverride={step !== null && steps ? step / (steps.length - 1) : undefined} />
      </div>
      <figcaption>
        {caption ?? scene.subtitle}
        {steps && <div className="experience-controls" role="group" aria-label="Explore the 3D view">
          {steps.map((label, i) => <button type="button" key={label} aria-pressed={step === i}
            onClick={() => setStep(step === i ? null : i)}>{label}</button>)}
        </div>}
      </figcaption>
    </figure>
  );
}

export function ProductExplorer({ walkthrough = false }: { walkthrough?: boolean }) {
  const [selection, setSelection] = useState({ index: 0, step: 0 });
  const { index, step } = selection;
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const stories = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const manualTimer = useRef<number | undefined>(undefined);
  const view = productViews[index];
  const screenId = view.screens[step] ?? view.screens[0];
  const screen = productScreens[screenId];
  const count = productViews.length;

  function select(next: number, step = 0) {
    if (walkthrough) {
      window.clearTimeout(manualTimer.current);
      manualTimer.current = window.setTimeout(() => { manualTimer.current = undefined; }, 1000);
    }
    setSelection({ index: next, step });
  }

  useEffect(() => {
    if (!walkthrough || !stories.current) return;
    const chapters = stories.current.querySelectorAll<HTMLElement>("[data-product-chapter]");
    const desktop = window.matchMedia("(min-width: 900px) and (min-height: 740px)");
    const observer = new IntersectionObserver((entries) => {
      if (!desktop.matches || manualTimer.current !== undefined) return;
      const entered = entries.find((entry) => entry.isIntersecting);
      if (!entered) return;
      const next = Number((entered.target as HTMLElement).dataset.productChapter);
      setSelection((current) => current.index === next ? current : { index: next, step: 0 });
    }, { rootMargin: "-35% 0px -44%" });
    chapters.forEach((chapter) => observer.observe(chapter));
    return () => {
      observer.disconnect();
      window.clearTimeout(manualTimer.current);
    };
  }, [walkthrough]);

  function keys(event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
    event.preventDefault();
    const selected = key === "Home" ? 0 : key === "End" ? count - 1 : (index + (key === "ArrowRight" ? 1 : count - 1)) % count;
    select(selected);
    buttons.current[selected]?.focus();
  }
  return (
    <div className={walkthrough ? "product-explorer product-walkthrough" : "product-explorer"}>
      <div className="product-viewer" ref={viewer}>
        <div className="product-selector" role="tablist" aria-label="One Search screens">
          {productViews.map(({ label, id: viewId }, i) => <button id={`${id}-${viewId}`} key={viewId}
            role="tab" type="button" aria-controls={`${id}-screen`} aria-selected={i === index} tabIndex={i === index ? 0 : -1}
            ref={(node) => { buttons.current[i] = node; }} onClick={() => select(i)} onKeyDown={keys}>{label}</button>)}
        </div>
        <div id={`${id}-screen`} role="tabpanel" aria-labelledby={`${id}-${view.id}`} tabIndex={0}>
          <Experience id="product" productView={screenId} className="product-experience" caption={`${screen.label} · One Search preview`} />
          <p className="sr-only">{screen.alt}</p>
          <div className="product-steps" aria-label={view.screens.length > 1 ? "RTO screens" : undefined}
            role={view.screens.length > 1 ? "group" : undefined}>
            {view.screens.length > 1 && view.screens.map((frame, at) => (
              <button type="button" key={frame} onClick={() => select(index, at)} aria-pressed={step === at}>{productScreens[frame].label}</button>
            ))}
          </div>
          <p className="product-view-description">{view.description}</p>
        </div>
      </div>
      {walkthrough && <div className="product-chapters" ref={stories}>
        {productViews.map((chapter, at) => <article key={chapter.id} data-product-chapter={at} data-current={at === index}>
          <p className="eyebrow">{chapter.label}</p>
          <h3>{chapter.title}</h3>
          <p>{chapter.description}</p>
          <button type="button" className="inline-link" onClick={() => {
            select(at);
            if (!window.matchMedia("(min-width: 900px) and (min-height: 740px)").matches) viewer.current?.scrollIntoView({ block: "start" });
            buttons.current[at]?.focus({ preventScroll: true });
          }}>View the {chapter.label} screen</button>
        </article>)}
      </div>}
    </div>
  );
}

export function Process() {
  const [active, setActive] = useState(0);
  return (
    <div className="process">
      <span className="process-line" aria-hidden="true" data-process-line="" />
      <ol className="process-steps">
        {processSteps.map(([label], index) => <li key={label}><button type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
          <span>{String(index + 1).padStart(2, "0")}</span>{label}
        </button></li>)}
      </ol>
      <p className="process-description" aria-live="polite"><strong>{processSteps[active][0]}</strong>{processSteps[active][1]}</p>
    </div>
  );
}
