export function Icon({ name, size = 20 }: { name: "arrow" | "left" | "right" | "down" | "up-right" | "pause" | "play" | "menu" | "close" | "chevron"; size?: number }) {
  const paths = {
    arrow: "M3 12h17m-6-6 6 6-6 6",
    left: "M19 12H5m6-6-6 6 6 6",
    right: "M5 12h14m-6-6 6 6-6 6",
    down: "M12 4v15m-5-5 5 5 5-5",
    "up-right": "M5 19 19 5M6 5h13v13",
    pause: "M9 5v14m6-14v14",
    play: "m9 5 11 7-11 7V5Z",
    menu: "M4 8h16M4 16h16",
    close: "m6 6 12 12M18 6 6 18",
    chevron: "m6 9 6 6 6-6",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
