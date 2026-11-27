import "@fontsource/ibm-plex-mono/latin-500.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { business } from "@/content/business";
import { Footer, Header } from "@/components/site-chrome";
import { PageMotion } from "@/components/page-motion";
import "./globals.css";

const jakarta = localFont({
  src: "../../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-jakarta", weight: "400 800", display: "swap",
});
const dm = localFont({
  src: "../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  variable: "--font-dm", weight: "400 800", display: "swap",
});
const caveat = localFont({
  src: "../../node_modules/@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2",
  variable: "--font-caveat", weight: "400 700", display: "swap", adjustFontFallback: false,
});

export const metadata: Metadata = {
  applicationName: business.name,
  metadataBase: business.origin ? new URL(business.origin) : undefined,
  verification: { google: business.googleVerification },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${jakarta.variable} ${dm.variable} ${caveat.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <Footer />
        <PageMotion />
      </body>
    </html>
  );
}
