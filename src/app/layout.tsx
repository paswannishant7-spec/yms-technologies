import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource-variable/manrope";
import type { Metadata } from "next";
import { business } from "@/content/business";
import { Footer, Header } from "@/components/site-chrome";
import { PageMotion } from "@/components/page-motion";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: business.name,
  metadataBase: business.origin ? new URL(business.origin) : undefined,
  verification: { google: business.googleVerification },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
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
