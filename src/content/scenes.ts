export const scenes = [
  {
    id: "mobile", label: "Mobile App Development", card: ["App", "Development"],
    title: ["Engineered", "to move."], description: "Intuitive mobile experiences, built with purpose.",
    cta: "Explore App Development", href: "/services/app-development",
    accent: "#5488ff", light: "#3d78ff", background: "#0a1428", system: "APP / 01",
    subtitle: "An exploded view of a mobile interface",
  },
  {
    id: "web", label: "Web Development", card: ["Web", "Development"],
    title: ["Beyond the", "browser."], description: "Distinctive websites. Powerful engineering. Seamless digital experiences.",
    cta: "Explore Web Development", href: "/services/web-development",
    accent: "#ff6a7e", light: "#f1445c", background: "#19101a", system: "WEB / 02",
    subtitle: "A responsive interface across three screen sizes",
  },
  {
    id: "marketing", label: "Digital Marketing", card: ["Digital", "Marketing"],
    title: ["Built to", "be found."], description: "Intelligent digital strategies designed around visibility, engagement and growth.",
    cta: "Explore Digital Marketing", href: "/services/digital-marketing",
    accent: "#ff6070", light: "#ff3453", background: "#210e18", system: "MKT / 03",
    subtitle: "An illustration of search and audience connections",
  },
  {
    id: "technology", label: "Technology & Innovation", card: ["Technology", "& Innovation"],
    title: ["What's next,", "starts here."], description: "Technology, creativity and engineering working together to create smarter possibilities.",
    cta: "Explore Our Technology", href: "/technology",
    accent: "#6d9aff", light: "#2f70ff", background: "#09182a", system: "TEC / 04",
    subtitle: "A modular system of interconnected components",
  },
  {
    id: "product", label: "Our Digital Products", card: ["One", "Search"],
    title: ["One Search.", "More possibilities."], description: "Railway, flight and RTO information in one digital experience.",
    cta: "Discover One Search", href: "/products/one-search",
    accent: "#ffaf61", light: "#ff973e", background: "#22150e", system: "PRD / 05",
    subtitle: "One Search with its railway, flight and RTO screens",
  },
  {
    id: "brand", label: "Technology in Motion", card: ["Let's build", "what's next"],
    title: ["Let's build", "what's next."], description: "Turning ambitious ideas into meaningful digital experiences.",
    cta: "Start a Project", href: "/contact",
    accent: "#ff5572", light: "#ff264b", background: "#201121", system: "YMS / 06",
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
