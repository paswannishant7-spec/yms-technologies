import Link from "next/link";
import Image from "next/image";
import { CinematicHero } from "@/components/cinematic-hero";
import { Experience, Process } from "@/components/experience";
import { Icon } from "@/components/icon";
import { Closing, FAQList, ProductFeature, SectionHeading, ServiceLinks } from "@/components/sections";
import { StructuredData } from "@/components/structured-data";
import { metadataFor } from "@/content/metadata";
import { homepageFaqs } from "@/content/pages";
import { scenePoster } from "@/content/scenes";
import { Handwritten } from "@/components/handwritten";

export const metadata = metadataFor("/");

export default function Home() {
  return <>
    <StructuredData path="/" />
    <CinematicHero />
    <section className="home-intro editorial-band" id="technology-with-purpose">
      <div className="wrap intro-grid">
        <div className="intro-copy">
          <SectionHeading label="About YMS Technologies">Technology with purpose. <Handwritten>Making ideas happen.</Handwritten></SectionHeading>
          <p>YMS Technologies brings together application development, web engineering and digital marketing to create meaningful digital experiences for businesses and users.</p>
          <Link className="inline-link" href="/about">About YMS Technologies <Icon name="up-right" size={16} /></Link>
        </div>
        <div className="intro-visual" data-parallax="" aria-hidden="true">
          <Image src={scenePoster("brand")} alt="" width={650} height={650} unoptimized />
        </div>
      </div>
    </section>
    <section className="section expertise-band">
      <div className="wrap">
        <SectionHeading label="Our expertise">Everything digital. Thoughtfully built.</SectionHeading>
        <ServiceLinks />
      </div>
    </section>
    <section className="section product-band">
      <div className="wrap">
        <SectionHeading label="Featured product">Information for the way you travel.</SectionHeading>
        <ProductFeature interactive />
      </div>
    </section>
    <section className="section process-band">
      <div className="wrap"><SectionHeading label="Our process">From the first idea to the final experience.</SectionHeading><Process /></div>
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
      <p>We agree what the work needs to achieve, communicate decisions as we go, and use feedback after launch to guide what we improve.</p>
      <div className="principle-grid">
        {[
          ["Thoughtful design", "Make the most important actions and information easy to find."],
          ["Practical engineering", "Build around real devices, constraints and everyday use."],
          ["Clear communication", "Make decisions, responsibilities and progress visible."],
          ["Continuous improvement", "Use feedback to improve the experience after launch."],
        ].map(([label, copy]) => <article key={label}><h3>{label}</h3><p>{copy}</p></article>)}
      </div>
    </section>
    <section className="association-band">
      <div className="wrap">
        <p><strong>YMS Technologies</strong> is a technology brand associated with York Media Solutions.</p>
        <Link className="inline-link" href="/about">About the company <Icon name="up-right" size={16} /></Link>
      </div>
    </section>
    <section className="section faq-section">
      <div className="wrap faq-grid"><SectionHeading label="FAQs">Common questions.</SectionHeading><FAQList items={homepageFaqs} /></div>
    </section>
    <Closing title="Have something in mind?" accent="Let's make it happen." />
  </>;
}
