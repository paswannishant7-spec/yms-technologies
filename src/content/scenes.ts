export const scenes = [
  {
    id: "mobile", label: "Mobile App Development", card: ["App", "Development"],
    title: ["We Build.", "We Innovate.", "You Grow."], description: "We create powerful mobile applications, distinctive websites and intelligent digital marketing solutions that move businesses forward.",
    cta: "Explore Our Services", href: "/services",
    accent: "#0866e9", light: "#c5ddfa", background: "#eaf3fc",
    subtitle: "An exploded view of a mobile interface",
  },
  {
    id: "web", label: "Web Development", card: ["Web", "Development"],
    title: ["Websites that", "work beautifully."], description: "Distinctive websites built to feel at home on every screen.",
    cta: "Explore Web Development", href: "/services/web-development",
    accent: "#0866e9", light: "#d8e8ff", background: "#fff9eb",
    subtitle: "A responsive interface across three screen sizes",
  },
  {
    id: "marketing", label: "Digital Marketing", card: ["Digital", "Marketing"],
    title: ["Be seen.", "Be remembered."], description: "Connect with the people looking for what you do.",
    cta: "Explore Digital Marketing", href: "/services/digital-marketing",
    accent: "#946600", light: "#fff2c4", background: "#e8f3ff",
    subtitle: "An illustration of search and audience connections",
  },
  {
    id: "technology", label: "Technology & Innovation", card: ["Technology", "& Innovation"],
    title: ["Ideas become", "possibilities."], description: "Thoughtful engineering turns ambitious ideas into useful digital experiences.",
    cta: "Explore Our Technology", href: "/technology",
    accent: "#0866e9", light: "#c5dcff", background: "#edf5ff",
    subtitle: "A modular system of interconnected components",
  },
  {
    id: "product", label: "Our Digital Products", card: ["One", "Search"],
    title: ["One Search.", "More possibilities."], description: "Railway, flight and RTO information in one digital experience.",
    cta: "Discover One Search", href: "/products/one-search",
    accent: "#b45309", light: "#ffead1", background: "#fff1e3",
    subtitle: "One Search with its railway, flight and RTO screens",
  },
  {
    id: "brand", label: "Technology in Motion", card: ["Let's build", "what's next"],
    title: ["Let's build", "what's next."], description: "Turning ambitious ideas into meaningful digital experiences.",
    cta: "Start a Project", href: "/contact",
    accent: "#0866e9", light: "#d9e9ff", background: "#f9f5e8",
    subtitle: "A sculpture inspired by the forward geometry of the YMS mark",
  },
] as const;

export type SceneId = (typeof scenes)[number]["id"];
export const scenePoster = (id: SceneId) => `/media/scene-${id}.webp`;

export const productViews = [
  { id: "railway", label: "Railway", image: "/media/one-search-railway.webp", description: "The railway screen brings train search and related information into one place." },
  { id: "flight", label: "Flight", image: "/media/one-search-flight.webp", description: "The flight screen lets users look up flights by route and date." },
  { id: "rto", label: "RTO", image: "/media/one-search-rto.webp", description: "The RTO screen provides a starting point for vehicle and transport information." },
] as const;
