"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { processSteps } from "@/content/pages";
import { productViews, scenePoster, scenes, type SceneId } from "@/content/scenes";
import SceneView from "./scene-view";

export function Experience({ id, className = "", productView = 0, steps }: {
  id: SceneId; className?: string; productView?: number; steps?: readonly string[];
}) {
  const scene = scenes.find((entry) => entry.id === id)!;
  const [step, setStep] = useState<number | null>(null);
  return (
    <figure className={`experience stage-backdrop ${className}`} data-model={id}
      style={{ "--scene-base": scene.background, "--scene-accent": scene.accent } as React.CSSProperties}>
      <div className="architecture" aria-hidden="true" />
      <div className="stage-floor" aria-hidden="true" />
      <div className="experience-art" aria-hidden="true">
        {id === "product" ? (
          <div className="product-static-phone"><Image src={productViews[productView].image} alt="" width={240} height={485} unoptimized /></div>
        ) : (
          <Image src={scenePoster(id)} alt="" fill sizes="(max-width: 760px) 92vw, 55vw" unoptimized />
        )}
        <SceneView id={id} productView={productView} scrollOverride={step !== null && steps ? step / (steps.length - 1) : undefined} />
      </div>
      <figcaption>
        {scene.subtitle}
        {steps && <div className="experience-controls" role="group" aria-label="Explore the 3D view">
          {steps.map((label, i) => <button type="button" key={label} aria-pressed={step === i}
            onClick={() => setStep(step === i ? null : i)}>{label}</button>)}
        </div>}
      </figcaption>
    </figure>
  );
}

export function ProductExplorer() {
  const [index, setIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const view = productViews[index];
  function keys(event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
    event.preventDefault();
    const selected = key === "Home" ? 0 : key === "End" ? 2 : (index + (key === "ArrowRight" ? 1 : 2)) % 3;
    setIndex(selected);
    buttons.current[selected]?.focus();
  }
  return (
    <div className="product-explorer">
      <div className="product-selector" role="tablist" aria-label="One Search screens">
        {productViews.map(({ label, id }, i) => <button id={`one-tab-${id}`} key={id}
          role="tab" type="button" aria-controls="one-search-display" aria-selected={i === index} tabIndex={i === index ? 0 : -1}
          ref={(node) => { buttons.current[i] = node; }} onClick={() => setIndex(i)} onKeyDown={keys}>{label}</button>)}
      </div>
      <div id="one-search-display" role="tabpanel" aria-labelledby={`one-tab-${view.id}`} tabIndex={0}>
        <Experience id="product" productView={index} className="product-experience" />
        <p className="product-view-description">{view.description}</p>
      </div>
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
