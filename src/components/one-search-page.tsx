import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { productQuestions, productScreens, productViews } from "@/content/one-search";
import { Experience, ProductExplorer } from "./experience";
import { Icon } from "./icon";
import { PrivacyLink } from "./privacy-link";
import { ProductGallery } from "./product-gallery";
import { FAQList, SectionHeading } from "./sections";
import "./one-search.css";

export function OneSearchPage({ breadcrumb }: { breadcrumb: ReactNode }) {
  return <article className="one-search-page">
    <div className="wrap page-breadcrumb">{breadcrumb}</div>
    <header className="one-search-hero wrap">
      <div className="one-search-hero-copy">
        <div className="one-search-lockup" data-route-art>
          <Image src="/media/one-search-logo.webp" alt="One Search" width={56} height={56} unoptimized />
          <span>Railway · Flight · Vehicle information</span>
        </div>
        <h1 data-route-reveal>One app.<br /><span>More possibilities.</span></h1>
        <p data-route-copy>One Search brings railway, flight and vehicle information together in one mobile experience. Start with the kind of information you need and see where each search can take you.</p>
        <div className="product-intro-actions" data-route-copy>
          <Link href="#one-search-tour" className="button button-solid">Explore the app <Icon name="down" size={16} /></Link>
          <Link href="#one-search-gallery" className="inline-link">Browse screenshots</Link>
        </div>
      </div>
      <div className="one-search-hero-devices" data-route-art>
        <Image className="one-search-side-device side-rail" src={productScreens[0].image} alt={productScreens[0].alt} width={360} height={668} unoptimized />
        <Image className="one-search-side-device side-flight" src={productScreens[1].image} alt={productScreens[1].alt} width={360} height={668} unoptimized />
        <Experience id="product" productView={4} productStory className="one-search-hero-scene" caption="One Search app home · Interface preview" />
      </div>
    </header>
    <nav className="one-search-anchors wrap" aria-label="One Search sections">
      {productViews.map((chapter) => <Link key={chapter.id} href={`#one-search-${chapter.id}`}>{chapter.label}</Link>)}
      <Link href="#one-search-gallery">Gallery</Link><Link href="#one-search-help">Privacy &amp; support</Link>
    </nav>

    <section className="section wrap one-search-intro">
      <div>
        <SectionHeading label="Why One Search">Three kinds of lookup. One place to start.</SectionHeading>
        <p data-copy-reveal>A railway journey starts with stations and a date. A flight search starts with cities or airports. A vehicle lookup starts with a registration number. One Search keeps those different inputs in their own sections while giving visitors a single place to choose the right path.</p>
        <p data-copy-reveal>The design keeps the same visual language across categories. Orange identifies the main search action, white cards group related information, and labelled shortcuts let someone jump to the part of the app they need. This page lets you see that structure before entering any information into an app.</p>
      </div>
      <div className="one-search-connections" aria-label="One Search connects three information categories">
        <Image src="/media/one-search-ui/transport-art.webp" alt="" width={296} height={185} unoptimized />
        <div className="connection-links" data-process-line="" aria-hidden="true" />
        {productViews.map((chapter) => <Link key={chapter.id} href={`#one-search-${chapter.id}`}>{chapter.label}</Link>)}
      </div>
    </section>

    <section id="one-search-tour" className="section one-search-tour">
      <div className="wrap">
        <SectionHeading label="Interactive walkthrough">Three ways to find information.</SectionHeading>
        <p className="one-search-section-copy">Scroll through the chapters, or select a category and choose a screen. The phone shows the design in context, and the adjacent image keeps the actual interface in view.</p>
        <ProductExplorer walkthrough />
      </div>
    </section>

    <section className="section wrap one-search-connected">
      <div>
        <SectionHeading label="Connected experience">Switch categories. Keep your bearings.</SectionHeading>
        <p data-copy-reveal>The home design brings service shortcuts together. Search pages also use a shared layout, with a label for the current section followed by the fields and a clear action. Look for these elements as you switch from a railway lookup to a flight route or a vehicle search.</p>
        <p data-copy-reveal>The screens illustrate different information layouts. A timetable has a row for each stop, a route finder groups options, and the vehicle search starts with a single field. The consistent navigation makes each of those layouts easier to recognise.</p>
      </div>
      <div className="one-search-screen-lineup" aria-label="One Search app layouts">
        {[0, 4, 3].map((index) => {
          const screen = productScreens[index];
          return <figure key={screen.id} data-parallax><Image src={screen.image} alt={screen.alt} width={screen.width} height={screen.height} unoptimized /><figcaption>{screen.label}</figcaption></figure>;
        })}
      </div>
    </section>

    <section className="section one-search-gallery-band" id="one-search-gallery">
      <div className="wrap">
        <SectionHeading label="One Search interfaces">A closer look at the screens.</SectionHeading>
        <p className="one-search-section-copy">Browse the genuine app references and supplied Figma designs by category. Open any preview to inspect it at its original aspect ratio. Dates, names, counts and records shown in the designs are examples.</p>
        <ProductGallery />
      </div>
    </section>

    <section className="section wrap one-search-use-cases">
      <SectionHeading label="Ways to use the interface">Start with the question you have.</SectionHeading>
      <div>
        <article><h3>Planning a train journey</h3><p>Start with your stations and the day you want to travel. If you already know a train name or number, the train results and schedule designs show where the route and stops would appear.</p></article>
        <article><h3>Exploring an air route</h3><p>Use the origin and destination pattern to understand how a flight query starts. Compare how the prototype groups direct and one-stop routes before opening an example route card.</p></article>
        <article><h3>Preparing a vehicle lookup</h3><p>Open vehicle services, then compare the overview with the dedicated entry screen. The gallery lets you see the form without entering a personal vehicle number.</p></article>
      </div>
    </section>

    <section className="section one-search-faq"><div className="wrap faq-grid">
      <SectionHeading label="One Search FAQ">Questions about the app.</SectionHeading>
      <FAQList items={productQuestions} />
    </div></section>

    <section className="section wrap one-search-help" id="one-search-help">
      <div>
        <SectionHeading label="Privacy & support">Find the right place for help.</SectionHeading>
        <p>If you need help, tell us whether it concerns Railway, Flight or Vehicle Search, and which screen you were using. The support page explains what information to include.</p>
        <div className="product-intro-actions"><PrivacyLink /><Link href="/products/one-search/support" className="button">One Search Support</Link></div>
      </div>
      <Image src="/media/one-search-ui/transport-art.webp" alt="One Search artwork" width={296} height={185} unoptimized />
    </section>
    <footer className="one-search-close">
      <div className="wrap"><Image src="/media/one-search-logo.webp" alt="" width={52} height={52} unoptimized />
        <p>Choose a category to explore the One Search interface.</p><Link className="button" href="#one-search-tour">Return to the walkthrough</Link><Link className="button" href="/contact#project-enquiry">Start a project</Link><PrivacyLink className="inline-link product-privacy-link" /></div>
    </footer>
  </article>;
}
