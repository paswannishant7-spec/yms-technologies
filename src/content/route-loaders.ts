export const privacyPath = "/products/one-search/privacy-policy";

export function loaderFor(path: string) {
  if (path.startsWith("/products/one-search") || path === "/support") return "battery";
  if (path === "/" || path === "/technology" || path.startsWith("/technology/")) return "orbit";
  if (path === "/products" || /^\/services\/(app|android|ios|cross-platform)/.test(path)) return "liquid";
  if (/^\/(insights|work)(\/|$)|^\/services\/(digital-marketing|seo|aeo|geo|performance-marketing|social-media-marketing)/.test(path)) return "chase";
  if (path.startsWith("/services")) return "square";
  return "bounce";
}
