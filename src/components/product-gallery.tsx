"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { productScreens, type ScreenCategory } from "@/content/one-search";

const categories = ["All", "Overview", "Railway", "Flight", "RTO"] as const;

export function ProductGallery() {
  const [category, setCategory] = useState<ScreenCategory | "All">("All");
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = productScreens.filter((entry) => category === "All" || entry.category === category);
  const screen = list[selected] ?? list[0];

  function move(direction: number) {
    setSelected((index) => (index + direction + list.length) % list.length);
  }
  function key(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }

  return <div className="one-search-gallery">
    <div className="product-selector" role="group" aria-label="Filter screenshots">
      {categories.map((label) => <button key={label} type="button" aria-pressed={category === label} onClick={() => { setSelected(0); setCategory(label); }}>{label}</button>)}
    </div>
    <div className="one-search-gallery-grid">
      {list.map((entry, index) => <button key={entry.id} className="gallery-card" type="button" aria-label={`Inspect ${entry.label}`} onClick={(event) => {
        trigger.current = event.currentTarget;
        setSelected(index);
        setExpanded(true);
        dialog.current?.showModal();
      }}>
        <span className="gallery-card-media" data-detail={entry.detail || undefined}>
          <Image src={entry.image} alt="" width={entry.width} height={entry.height} sizes="(max-width: 640px) 45vw, 24vw" loading={index < 4 ? "eager" : "lazy"} unoptimized />
        </span>
        <span className="gallery-card-caption"><strong>{entry.label}</strong><small>{entry.category}{entry.detail ? " · Interface detail" : ""}</small></span>
      </button>)}
    </div>
    <dialog className="gallery-dialog" ref={dialog} aria-labelledby="gallery-dialog-title" onKeyDown={key} onClose={() => { setExpanded(false); trigger.current?.focus(); }} onClick={(event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    }}>
      <div className="gallery-dialog-body">
        <div className="gallery-dialog-head">
          <div><p className="eyebrow">{screen.category} · Design preview</p><h3 id="gallery-dialog-title">{screen.label}</h3></div>
          <button type="button" className="icon-button" aria-label="Close screenshot" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <div className="gallery-dialog-media">
          {expanded && <Image key={screen.id} src={screen.image} alt={screen.alt} width={screen.width} height={screen.height} unoptimized />}
        </div>
        <nav className="gallery-dialog-controls" aria-label="Related screenshots">
          <button type="button" className="button" onClick={() => move(-1)}>Previous</button>
          <span aria-live="polite">{selected + 1} of {list.length}</span>
          <button type="button" className="button" onClick={() => move(1)}>Next</button>
        </nav>
      </div>
    </dialog>
  </div>;
}
