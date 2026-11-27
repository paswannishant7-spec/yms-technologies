import Link from "next/link";
import { CinematicHero } from "@/components/cinematic-hero";
import { Experience, Process } from "@/components/experience";
import { Icon } from "@/components/icon";
import { Closing, FAQList, ProductFeature, SectionHeading, ServiceLinks } from "@/components/sections";
import { StructuredData } from "@/components/structured-data";
import { metadataFor } from "@/content/metadata";
import { homepageFaqs } from "@/content/pages";

export const metadata = metadataFor("/");

export default function Home() {
  return <>
    <StructuredData path="/" />
    <CinematicHero />
    <section className="home-intro editorial-band" id="technology-with-purpose">
      <div className="wrap intro-grid">
        <SectionHeading label="YMS Technologies">Technology with purpose.</SectionHeading>
        <div className="intro-copy">
          <p>YMS Technologies brings together application development, web engineering and digital marketing to create meaningful digital experiences for businesses and users.</p>
          <Link className="inline-link" href="/about">About YMS Technologies <Icon name="up-right" size={16} /></Link>
        </div>
      </div>
    </section>
    <section className="section wrap">
      <SectionHeading label="Our services">Build, launch and reach people.</SectionHeading>
      <ServiceLinks />
    </section>
    <section className="section product-band">
      <div className="wrap">
        <SectionHeading label="Featured product">Made for everyday journeys.</SectionHeading>
        <ProductFeature />
      </div>
    </section>
    <section className="section wrap philosophy">
      <SectionHeading label="How we think">Good technology starts with a useful question.</SectionHeading>
      <div className="principle-grid">
        {[
          ["Strategy", "Find the problem worth solving and define what a useful outcome looks like."],
          ["Design", "Make the most important actions and information easy to understand."],
          ["Engineering", "Build for real devices, constraints and change after launch."],
          ["Optimisation", "Use feedback and agreed measures to decide what to improve."],
        ].map(([label, copy]) => <article key={label}><h3>{label}</h3><p>{copy}</p></article>)}
      </div>
    </section>
    <section className="section process-band">
      <div className="wrap"><SectionHeading label="Our process">From discovery to improvement.</SectionHeading><Process /></div>
    </section>
    <section className="section wrap technology-split">
      <div><SectionHeading label="Technology & innovation">Systems built to evolve.</SectionHeading>
        <p>Maintainable components, clear interfaces and thoughtful engineering make the next iteration easier.</p>
        <Link className="inline-link" href="/technology">Explore our technology <Icon name="up-right" size={16} /></Link>
      </div>
      <Experience id="technology" className="home-tech-art" />
    </section>
    <section className="section industry-band">
      <div className="wrap">
        <SectionHeading label="Industries">Digital opportunities across sectors.</SectionHeading>
        <ul className="industry-list"><li>Retail</li><li>Travel & mobility</li><li>Education</li><li>Professional services</li></ul>
        <Link className="inline-link" href="/industries">Explore potential use cases <Icon name="up-right" size={16} /></Link>
      </div>
    </section>
    <section className="section wrap why-grid">
      <SectionHeading label="Why YMS Technologies">Clarity throughout the work.</SectionHeading>
      <div><p>We focus on practical technology, thoughtful design and reliable development. Clear communication keeps the scope and next decisions visible from discovery through launch and continuous improvement.</p>
        <p className="association">YMS Technologies is a technology brand associated with York Media Solutions.</p></div>
    </section>
    <section className="section faq-section">
      <div className="wrap faq-grid"><SectionHeading label="FAQs">Common questions.</SectionHeading><FAQList items={homepageFaqs} /></div>
    </section>
    <Closing />
  </>;
}
