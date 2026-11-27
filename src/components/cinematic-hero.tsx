"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { flushSync } from "react-dom";
import { productScreens, productViews, scenePoster, sceneThumbnail, scenes } from "@/content/scenes";
import { Icon } from "./icon";
import { Handwritten } from "./handwritten";
import SceneView, { useReducedMotion, useVisible } from "./scene-view";

gsap.registerPlugin(Flip);
gsap.ticker.lagSmoothing(0);

const duration = 1.04;
const fullClip = "inset(0px 0px 0px 0px round 0px)";
const autoplaySeconds = 9;
const format = (index: number) => String(index + 1).padStart(2, "0");
const theme = (scene: (typeof scenes)[number]) => ({
  "--scene-accent": scene.accent,
  "--scene-base": scene.background,
} as CSSProperties);

function revealTitle(scope: HTMLElement, entrance = false) {
  const timeline = gsap.timeline();
  const words = scope.querySelectorAll("[data-hero-word]");
  const copy = scope.querySelectorAll("[data-hero-copy]");
  const ink = scope.querySelectorAll("[data-ink]");
  const stroke = scope.querySelectorAll("[data-underline]");
  timeline.fromTo(words, { yPercent: 106 }, {
    yPercent: 0, stagger: .065, duration: .69, ease: "power3.out", clearProps: "transform",
  }, entrance ? .17 : 0);
  if (ink.length) timeline.fromTo(ink, { clipPath: "inset(0 100% 0 0)" }, {
    clipPath: "inset(0 0% 0 0)", duration: .61, ease: "power2.out", clearProps: "clipPath",
  }, entrance ? .52 : .27);
  if (stroke.length) timeline.fromTo(stroke, { strokeDashoffset: 1 }, {
    strokeDashoffset: 0, duration: .49, ease: "power2.out", clearProps: "strokeDashoffset",
  }, entrance ? .84 : .55);
  timeline.fromTo(copy, { y: 10, opacity: 0 }, {
    y: 0, opacity: 1, duration: .42, stagger: .08, clearProps: "transform,opacity",
  }, entrance ? .79 : .38);
  return timeline;
}

export function CinematicHero() {
  const [index, setIndex] = useState(0);
  const [renderIndex, setRenderIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [productView, setProductView] = useState(0);
  const { ref: root, visible } = useVisible<HTMLElement>();
  const reduced = useReducedMotion();
  const art = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const flight = useRef<HTMLDivElement>(null);
  const flightArt = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const progress = useRef<gsap.core.Tween | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const entranceAnimation = useRef<gsap.core.Timeline | null>(null);
  const titleAnimation = useRef<gsap.core.Timeline | null>(null);
  const railAnimation = useRef<gsap.core.Timeline | null>(null);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const ignoreTapUntil = useRef(0);
  const cards = useRef(new Map<number, HTMLButtonElement>());
  const current = useRef(0);
  const introPlayed = useRef(false);
  const scene = scenes[index];
  const upcoming = [1, 2, 3].map((offset) => (index + offset) % scenes.length);
  const screen = productScreens[productViews[productView].screens[0]];

  const change = useCallback((destination: number, manual = true) => {
    const target = (destination + scenes.length) % scenes.length;
    if (target === current.current || animation.current) return;
    const next = scenes[target];
    const container = root.current;
    const overlay = flight.current;
    const overlayArt = flightArt.current;
    const stage = art.current;
    if (!container || !overlay || !overlayArt || !stage) return;
    entranceAnimation.current?.revert();
    entranceAnimation.current = null;
    titleAnimation.current?.kill();
    if (reduced) {
      current.current = target;
      setIndex(target);
      setRenderIndex(target);
      setProductView(0);
      if (manual) setAnnouncement(`Scene ${format(target)} of 06, ${next.label}.`);
      return;
    }

    const viewport = container.getBoundingClientRect();
    const card = cards.current.get(target);
    const source = card ?? cards.current.get((current.current + 1) % scenes.length);
    const bounds = source?.getBoundingClientRect();
    const image = source?.querySelector(".preview-art img")?.getBoundingClientRect();
    const stageBounds = stage.getBoundingClientRect();
    if (!bounds || !image) return;
    const saved = Flip.getState(rail.current?.querySelectorAll("[data-flip-id]") ?? []);
    const focusWasOnCard = card && document.activeElement === card;
    const outgoing = headline.current?.querySelectorAll<HTMLElement>("[data-hero-animate]");
    const overlayLayers = overlay.querySelectorAll(".architecture, .stage-floor, .hero-shade");
    progress.current?.pause();
    setBusy(true);
    overlay.style.setProperty("--scene-base", next.background);
    overlay.style.setProperty("--scene-accent", next.accent);
    overlay.dataset.model = next.id;
    overlayArt.style.backgroundImage = `url("${scenePoster(next.id)}")`;
    const left = bounds.left - viewport.left;
    const top = bounds.top - viewport.top;
    const radius = getComputedStyle(source!).borderTopLeftRadius;
    const size = Math.min(stageBounds.width, stageBounds.height);
    const position = (box: DOMRect) => ({
      x: box.left - viewport.left + (box.width - size) / 2,
      y: box.top - viewport.top + (box.height - size) / 2,
    });

    gsap.set(overlay, {
      visibility: "visible", opacity: 1,
      clipPath: `inset(${top}px ${viewport.width - left - bounds.width}px ${viewport.height - top - bounds.height}px ${left}px round ${radius})`,
    });
    gsap.set(overlayArt, {
      ...position(image), width: size, height: size, scale: Math.min(image.width, image.height) / size,
    });
    // Reveal the fixed set with a clip and move the artwork by transform, without resizing the stage.
    gsap.set(overlayLayers, { opacity: 0 });
    if (card) gsap.set(card, { opacity: 0 });
    const timeline = gsap.timeline();
    animation.current = timeline;
    if (outgoing?.length) timeline.to(outgoing, { yPercent: -106, opacity: .35, duration: .3, stagger: .027, ease: "power2.in" }, .05);
    timeline.to(overlay, {
      clipPath: fullClip,
      duration, ease: "power3.inOut",
    }, 0);
    timeline.to(overlayArt, {
      ...position(stageBounds), scale: 1,
      duration, ease: "power3.inOut",
    }, 0);
    timeline.to(overlayLayers, { opacity: 1, duration: .59, ease: "power2.inOut" }, .25);
    timeline.call(() => {
      current.current = target;
      flushSync(() => {
        setIndex(target);
        setProductView(0);
        if (manual) setAnnouncement(`Scene ${format(target)} of 06, ${next.label}.`);
      });
      railAnimation.current = Flip.from(saved, {
        duration: .43, ease: "power3.out", scale: false, prune: true,
        onEnter: (elements) => gsap.fromTo(elements, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: .38, clearProps: "opacity,transform" }),
      });
      if (focusWasOnCard) {
        const nextCard = cards.current.get((target + 1) % scenes.length);
        (nextCard ?? container.querySelector<HTMLButtonElement>("[data-next]"))?.focus({ preventScroll: true });
      }
      if (headline.current) titleAnimation.current = revealTitle(headline.current);
      const counter = container.querySelector(".scene-counter b");
      if (counter) gsap.fromTo(counter, { y: 4, opacity: .55 }, {
        y: 0, opacity: 1, duration: .26, clearProps: "transform,opacity",
      });
    }, [], .98);
    timeline.to(overlay, { opacity: 0, duration: .16, ease: "power1.out" }, duration);
    timeline.set(overlay, { visibility: "hidden" }, duration + .16);
    timeline.call(() => {
      animation.current = null;
      if (card?.isConnected) gsap.set(card, { clearProps: "opacity" });
      setRenderIndex(target);
      setBusy(false);
    }, [], 1.26);
  }, [reduced, root]);

  useEffect(() => {
    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches || introPlayed.current || !headline.current) return;
    if (performance.now() > 1300 || current.current !== 0) return;
    introPlayed.current = true;
    const entrance = revealTitle(headline.current, true);
    entranceAnimation.current = entrance;
    if (art.current) entrance.fromTo(art.current, { x: 15, y: 12 }, {
      x: 0, y: 0, duration: .78, ease: "power3.out", clearProps: "transform",
    }, .25);
    if (rail.current) entrance.fromTo(rail.current.children, { y: 14, opacity: .65 }, {
      y: 0, opacity: 1, duration: .44, stagger: .065, clearProps: "transform,opacity",
    }, .78);
    return () => {
      entrance.revert();
      if (entranceAnimation.current === entrance) entranceAnimation.current = null;
      introPlayed.current = false;
    };
  }, [reduced]);

  useEffect(() => () => {
    animation.current?.kill();
    titleAnimation.current?.kill();
    railAnimation.current?.kill();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const entry of scenes.slice(4)) {
        const preview = new window.Image();
        preview.fetchPriority = "low";
        preview.src = scenePoster(entry.id);
      }
    }, 1700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!bar.current) return;
    if (reduced) {
      gsap.set(bar.current, { scaleX: (index + 1) / scenes.length });
      return;
    }
    progress.current = gsap.fromTo(bar.current, { scaleX: 0 }, {
      scaleX: 1, duration: autoplaySeconds, ease: "none", paused: true,
      onComplete: () => change(index + 1, false),
    });
    return () => { progress.current?.kill(); progress.current = null; };
  }, [change, index, reduced]);

  useEffect(() => {
    const onVisibility = () => {
      progress.current?.paused(!visible || document.hidden || !autoplay || busy || hover || focus || reduced);
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [autoplay, busy, focus, hover, index, reduced, visible]);

  useEffect(() => {
    if (scene.id !== "product" || !visible || !autoplay || busy || reduced || hover || focus) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setProductView((current) => (current + 1) % productViews.length);
    }, 2_750);
    return () => window.clearInterval(timer);
  }, [autoplay, busy, focus, hover, reduced, scene.id, visible]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    change(current.current + (event.key === "ArrowRight" ? 1 : -1));
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    const interactive = (event.target as Element).closest("a, button");
    if (event.pointerType === "mouse" || (interactive && !interactive.classList.contains("preview-card"))) return;
    gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    if (!interactive) event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId) return;
    const distance = event.clientX - start.x;
    if (Math.abs(distance) > 46 && Math.abs(distance) > Math.abs(event.clientY - start.y) * 1.3) {
      ignoreTapUntil.current = performance.now() + 350;
      change(current.current + (distance < 0 ? 1 : -1));
    }
  }

  return (
    <section className="cinematic-hero" aria-roledescription="scene gallery" aria-label="Technology in Motion" tabIndex={0}
      ref={root} style={theme(scene)} onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerUp={onPointerUp}
      onFocus={(event) => { if (event.target.matches("a, .preview-card")) setFocus(true); }}
      onBlur={(event) => { if (!event.relatedTarget?.matches("a, .preview-card") || !event.currentTarget.contains(event.relatedTarget)) setFocus(false); }}
      onPointerCancel={() => { gesture.current = null; }} data-scene={scene.id}>
      <div className="hero-environment stage-backdrop" data-model={scene.id} aria-hidden="true">
        <div className="architecture" />
        <div className="stage-floor" />
      </div>
      <div className="hero-art" data-current-render={renderIndex === index} ref={art} aria-hidden="true">
        {scene.id === "product" && productView > 0 ? (
          <div className="product-static-phone"><Image key={screen.image} src={screen.image} alt="" width={screen.width} height={screen.height} unoptimized /></div>
        ) : (
          <Image className="hero-poster" key={scene.id} src={scenePoster(scene.id)} alt="" width={760} height={760} sizes="(max-width: 760px) 85vw, 57vw" priority={index === 0} unoptimized />
        )}
        <SceneView id={scenes[renderIndex].id} productView={productViews[productView].screens[0]} paused={busy} />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="scene-flight stage-backdrop" ref={flight} aria-hidden="true">
        <div className="architecture" />
        <div className="stage-floor" />
        <div ref={flightArt} className="scene-flight-art" />
        <div className="hero-shade" />
      </div>
      <div className="hero-shell">
        <div className="hero-copy" key={scene.id} ref={headline}>
          <div className="text-mask"><p className="hero-eyebrow" data-hero-animate=""><span />{index === 0 ? "Technology in Motion" : scene.label}</p></div>
          <h1 className={`hero-title hero-title-${scene.id}`} aria-label={scene.title.join(" ")} data-route-reveal>
            {scene.title.map((line, row) => (
              <span className={`text-mask hero-line hero-line-${row}`} key={line}>
                <span data-hero-animate="">
                  {scene.id === "mobile" && row === 2 ? <Handwritten>{line}</Handwritten>
                    : scene.id === "web" && row === 1 ? <><span data-hero-word="">work</span>{" "}<Handwritten>beautifully.</Handwritten></>
                      : line.split(" ").map((word, i) => <Fragment key={`${word}-${i}`}>{i ? " " : null}<span data-hero-word="">{word}</span></Fragment>)}
                </span>
              </span>
            ))}
          </h1>
          <div className="text-mask"><p className="hero-description" data-hero-copy="" data-hero-animate="">{scene.description}</p></div>
          <div className="text-mask hero-cta-mask">
            <div className="hero-actions" data-hero-copy="" data-hero-animate="">
              <Link className="button button-solid hero-cta" href={scene.href}>{scene.cta}<Icon name="up-right" size={16} /></Link>
              {index === 0 && <Link className="button button-secondary" href="/products">Our Products</Link>}
            </div>
          </div>
        </div>
        <div className="hero-preview">
          <div className="preview-label">Explore the scenes</div>
          <div className="preview-rail" ref={rail} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {upcoming.map((item) => {
              const preview = scenes[item];
              return (
                <button type="button" className="preview-card stage-backdrop" key={preview.id} style={theme(preview)}
                  data-flip-id={preview.id} ref={(node) => { if (node) cards.current.set(item, node); else cards.current.delete(item); }}
                  aria-label={`Show scene ${format(item)}, ${preview.label}`} onClick={() => { if (performance.now() >= ignoreTapUntil.current) change(item); }}>
                  <span className="preview-index">{format(item)}</span>
                  <span className="preview-art">
                    <Image src={sceneThumbnail(preview.id)} alt="" fill sizes="(max-width: 760px) 27vw, 12vw" fetchPriority="low" unoptimized />
                  </span>
                  <span className="preview-text">{preview.card.map((line) => <span key={line}>{line}</span>)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="hero-control-row">
          <a className="scroll-cue" href="#technology-with-purpose"><span><Icon name="down" size={16} /></span> Scroll to explore</a>
          <div className="hero-transport">
            <div className="transport-buttons">
              <button className="icon-button" type="button" aria-label="Previous scene" onClick={() => change(current.current - 1)}><Icon name="left" size={19} /></button>
              <button className="icon-button" type="button" aria-label="Next scene" data-next onClick={() => change(current.current + 1)}><Icon name="right" size={19} /></button>
              {!reduced && <button className="icon-button playback" type="button" aria-label={autoplay ? "Pause autoplay" : "Play scenes"}
                onClick={() => setAutoplay(!autoplay)}><Icon name={autoplay ? "pause" : "play"} size={15} /></button>}
            </div>
            <div className="scene-progress" aria-hidden="true"><span ref={bar} /></div>
            <div className="scene-counter" aria-label={`Scene ${format(index)} of 06`}><b>{format(index)}</b><span>/ 06</span></div>
          </div>
        </div>
      </div>
      <span className="sr-only" role="status">{announcement}</span>
    </section>
  );
}
