function officialOrigin(value: string | undefined) {
  try {
    if (!value) return undefined;
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash
      ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

export const business = {
  name: "YMS Technologies",
  tagline: "Technology in Motion",
  country: "India",
  association: "York Media Solutions",
  legalName: process.env.BUSINESS_LEGAL_NAME?.trim() || undefined,
  address: process.env.BUSINESS_REGISTERED_ADDRESS?.trim() || undefined,
  origin: officialOrigin(process.env.SITE_URL?.trim()),
  email: process.env.BUSINESS_EMAIL?.trim() || undefined,
  phone: process.env.BUSINESS_PHONE?.trim() || undefined,
  support: process.env.SUPPORT_EMAIL?.trim() || undefined,
  googleVerification: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
};
