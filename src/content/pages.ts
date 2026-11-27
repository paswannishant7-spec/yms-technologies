import type { SceneId } from "./scenes";
import { productQuestions } from "./one-search";

export type FAQ = readonly [question: string, answer: string];
type EditorialSection = { heading: string; body: string };
type Page = {
  title: string;
  description: string;
  draft?: string;
  layout?: "about" | "services" | "service" | "products" | "product" | "technology" | "industries" | "insights" | "careers" | "contact" | "support" | "legal";
  scene?: SceneId;
  eyebrow?: string;
  headline?: string;
  sections?: readonly EditorialSection[];
  faqs?: readonly FAQ[];
  productSupport?: boolean;
  parent?: string;
};

const pendingService = "Confirm this capability, delivery scope and public service copy before release.";
const pendingPolicy = "Approve the policy against actual data collection, processing purposes, vendors, sharing, retention, security practices and grievance contacts.";

export const pages: Record<string, Page> = {
  "/": { title: "Technology in Motion", description: "YMS Technologies brings mobile app development, web development, digital marketing and in-house digital products together in India." },
  "/about": {
    title: "About YMS Technologies", description: "Learn how YMS Technologies brings app development, web engineering and digital marketing together, and about its association with York Media Solutions.",
    layout: "about", scene: "brand", eyebrow: "About YMS Technologies", headline: "Technology with purpose.",
    sections: [
      { heading: "Engineering around real needs", body: "YMS Technologies brings together application development, web engineering and digital marketing to create meaningful digital experiences for businesses and users." },
      { heading: "A product perspective", body: "We develop our own digital products alongside our technology services. One Search addresses a familiar need in India by bringing railway, flight and RTO information into one experience." },
      { heading: "Our association", body: "YMS Technologies is a technology brand associated with York Media Solutions. It has its own visual identity and focuses on technology services and digital product development." },
    ],
  },
  "/services": {
    title: "Technology Services", description: "Explore YMS Technologies’ mobile application development, web development and digital marketing services.",
    layout: "services", scene: "technology", eyebrow: "Our services", headline: "Three disciplines. One direction.",
    sections: [
      { heading: "Designed as a connected experience", body: "A mobile app, a website and the way people discover a business often serve the same audience. We start with what those people need and scope the services that support the work." },
    ],
  },
  "/products": {
    title: "Our Digital Products", description: "Explore digital products from YMS Technologies, starting with One Search for railway, flight and RTO information.",
    layout: "products", scene: "product", eyebrow: "From YMS Technologies", headline: "Practical by design.",
    sections: [{ heading: "The product exhibition", body: "We develop in-house digital products that bring related tasks together and make everyday information easier to find." }],
  },
  "/work": { title: "Our Work", description: "Selected work from YMS Technologies.", draft: "Add approved project summaries, rights-cleared visuals and any required client permissions.", scene: "brand" },
  "/industries": {
    title: "Industries", description: "Explore potential uses for technology in retail, travel, education, professional services and information-led businesses.",
    layout: "industries", eyebrow: "Potential use cases", headline: "Different needs. Clearer digital journeys.",
    sections: [
      { heading: "Retail and commerce", body: "Help shoppers understand a catalogue, compare options and take the next step using clear product information and an easy mobile journey." },
      { heading: "Travel and mobility", body: "Organise routes, schedules and related information around the questions someone needs to answer before a trip." },
      { heading: "Education and training", body: "Help learners navigate programmes, deadlines and admissions requirements with reliable information and simple enquiry paths." },
      { heading: "Professional services", body: "Turn detailed service information into clear pages that answer practical questions and direct people to the right enquiry." },
      { heading: "Local and information-led businesses", body: "Build consistent digital touchpoints so users can find current locations, contact channels and service details." },
    ],
  },
  "/technology": {
    title: "Technology & Innovation", description: "Explore the engineering principles that guide YMS Technologies’ digital experiences, from modular design to iterative improvement.",
    layout: "technology", scene: "technology", eyebrow: "Technology & innovation", headline: "Systems built to evolve.",
    sections: [
      { heading: "Start with a useful foundation", body: "A clear information model, understandable interfaces and maintainable code make the next change easier. We choose technologies around the project’s users, operating environment and long-term needs." },
      { heading: "Design for the conditions people use", body: "We consider how a product works on different devices, with slow connections and in different interaction modes. Performance and accessibility inform the design from the start." },
      { heading: "Learn from each release", body: "We treat usability observations, operational feedback and agreed performance measures as inputs for the next iteration." },
    ],
  },
  "/insights": {
    title: "Insights", description: "Read practical notes on planning mobile applications, preparing websites and connecting digital marketing to a clear user journey.",
    layout: "insights", eyebrow: "Notes from YMS Technologies", headline: "Ideas worth putting to work.",
    sections: [
      { heading: "What belongs in the first version of an app?", body: "Choose the task a user should be able to complete from start to finish. Sketch the states they’ll encounter when data is missing or a connection drops. A first release can be narrow in scope and still deliver a complete experience." },
      { heading: "Why a faster website starts with its content", body: "Identify what a visitor needs to see first and make that content available straight away. Give media an appropriate size and format, reserve space before it loads and let optional effects load after the essential information." },
      { heading: "What to measure before starting a campaign", body: "Identify the action that matters, the landing page that supports it and the signals that show where visitors get stuck. Agree how those signals will be collected before using them to make spending decisions." },
    ],
  },
  "/careers": {
    title: "Careers", description: "Learn about the kind of work YMS Technologies does across design, engineering and digital marketing.",
    layout: "careers", eyebrow: "Careers", headline: "Make useful things.",
    sections: [
      { heading: "Work across disciplines", body: "Our work spans product thinking, experience design, engineering and digital marketing. Each discipline helps shape how a project works for the people who use it." },
      { heading: "Current openings", body: "YMS Technologies has no public vacancies listed at present." },
    ],
  },
  "/contact": {
    title: "Contact YMS Technologies", description: "Tell YMS Technologies about a mobile app, website or digital marketing project, or send a general enquiry.",
    layout: "contact", scene: "brand", eyebrow: "Project enquiries", headline: "Have something in mind?",
  },
  "/support": {
    title: "Support Centre", description: "Find YMS Technologies support routes for One Search and general technology enquiries.",
    layout: "support", eyebrow: "Support centre", headline: "Find the right support.",
    faqs: [
      ["Where can I ask about One Search?", "Use the One Search support page for questions about railway, flight or RTO information within the app."],
      ["Where do new project enquiries go?", "Use the Contact page for app development, web development or digital marketing enquiries."],
    ],
  },
  "/services/app-development": {
    title: "Mobile App Development", description: "YMS Technologies plans, designs and develops mobile applications around real user tasks, with clear interfaces, testing and launch planning.",
    layout: "service", scene: "mobile", eyebrow: "Mobile App Development", headline: "Make every tap count.",
    parent: "/services",
    sections: [
      { heading: "From a task to an app", body: "We start with the people who will use the application, the tasks they need to complete and the constraints of the devices and networks they rely on." },
      { heading: "An interface with purpose", body: "We map journeys, define interface states and design screens that make actions easy to understand. The project scope determines the platforms, data sources and integrations to build." },
      { heading: "A reliable first release", body: "We define the first release around a usable journey, then test it on representative devices. This gives teams a clearer baseline for prioritising future improvements." },
      { heading: "Where it fits", body: "Consider a mobile application for frequently used information, a customer self-service journey or an internal workflow that people use on the move." },
    ],
    faqs: [
      ["What do I need before starting an app project?", "Bring the problem, the intended audience and any constraints you already know. Discovery can define the initial requirements and feature scope."],
      ["Can we begin with one core user journey?", "Yes. A focused first release can establish a complete workflow before other features are added."],
    ],
  },
  "/services/web-development": {
    title: "Web Development", description: "YMS Technologies builds responsive websites around clear content, accessible interfaces and maintainable web engineering.",
    layout: "service", scene: "web", eyebrow: "Web Development", headline: "Built for the way people browse.",
    parent: "/services",
    sections: [
      { heading: "The website as a working system", body: "We develop websites with understandable navigation, clear content and interactions that support a visitor’s next step." },
      { heading: "Built across screen sizes", body: "We plan responsive layouts alongside content and consider accessible controls, search discovery, safe forms and asset performance as the scope requires." },
      { heading: "A foundation the business can use", body: "Content structure and maintainable components make it easier to update priorities, add pages and keep the website consistent as it grows." },
      { heading: "Where it fits", body: "Typical starting points include a new business website, a focused product site or a redesign where the existing structure makes information hard to find." },
    ],
    faqs: [
      ["What should I prepare for a website redesign?", "Share the current website, the tasks visitors need to finish, your main business pages and any materials that must carry forward."],
      ["Do you consider performance and search during development?", "Yes. We plan semantic markup, responsive asset delivery and crawlable page structure as part of development."],
    ],
  },
  "/services/digital-marketing": {
    title: "Digital Marketing", description: "YMS Technologies plans digital marketing around audience needs, search visibility, relevant messaging and meaningful measurement.",
    layout: "service", scene: "marketing", eyebrow: "Digital Marketing", headline: "Find the people who need you.",
    parent: "/services",
    sections: [
      { heading: "Find the audience and its questions", body: "Start with what people are trying to learn, where they look for it and which information helps them make a decision." },
      { heading: "Give each channel a purpose", body: "We plan messaging, landing-page content and measurement together. Channel selection and campaign scope depend on the business, audience and available data." },
      { heading: "Connect visibility to a useful action", body: "When an audience reaches the right page and understands what to do next, the business has a clearer path to measure engagement and improve the experience." },
      { heading: "Where it fits", body: "Use this work to support a launch, clarify how an existing offering appears online or diagnose where visitors lose interest after discovering a business." },
    ],
    faqs: [
      ["What do you review at the start of a marketing project?", "We look at your audience, existing channels, content, landing pages and available measurement before agreeing on priorities."],
      ["How do you decide what success looks like?", "We agree on useful actions and ways to measure them before starting. Targets depend on the project, its baseline and the quality of available data."],
    ],
  },
  "/services/android-development": { title: "Android App Development", description: "Android app development service preview.", layout: "service", scene: "mobile", parent: "/services", draft: pendingService },
  "/services/ios-development": { title: "iOS App Development", description: "iOS app development service preview.", layout: "service", scene: "mobile", parent: "/services", draft: pendingService },
  "/services/cross-platform-development": { title: "Cross-Platform Development", description: "Cross-platform development service preview.", layout: "service", scene: "technology", parent: "/services", draft: pendingService },
  "/services/ecommerce-development": { title: "E-commerce Development", description: "E-commerce development service preview.", layout: "service", scene: "web", parent: "/services", draft: pendingService },
  "/services/seo": { title: "SEO", description: "Search engine optimisation service preview.", layout: "service", scene: "marketing", parent: "/services", draft: pendingService },
  "/services/aeo": { title: "AEO", description: "Answer engine optimisation service preview.", layout: "service", scene: "marketing", parent: "/services", draft: pendingService },
  "/services/geo": { title: "GEO", description: "Generative engine optimisation service preview.", layout: "service", scene: "marketing", parent: "/services", draft: pendingService },
  "/services/performance-marketing": { title: "Performance Marketing", description: "Performance marketing service preview.", layout: "service", scene: "marketing", parent: "/services", draft: pendingService },
  "/services/social-media-marketing": { title: "Social Media Marketing", description: "Social media marketing service preview.", layout: "service", scene: "marketing", parent: "/services", draft: pendingService },
  "/products/one-search": {
    title: "One Search", description: "Explore One Search by YMS Technologies, with railway, flight and vehicle search walkthroughs and genuine interface previews.",
    layout: "product", scene: "product", eyebrow: "A YMS Technologies product", headline: "One app. More possibilities.",
    parent: "/products",
    faqs: productQuestions,
  },
  "/products/one-search/privacy-policy": { title: "One Search Privacy Policy", description: "Privacy information for the One Search application.", parent: "/products/one-search", layout: "legal", draft: pendingPolicy + " Confirm app permissions, advertising SDKs and account functionality." },
  "/products/one-search/terms": { title: "One Search Terms", description: "Terms for use of the One Search application.", parent: "/products/one-search", layout: "legal", draft: "Confirm the legal operator, supported features, third-party information sources, service limitations and governing terms." },
  "/products/one-search/support": {
    title: "One Search Support", description: "Find help with One Search and learn what information to include when reporting an issue.",
    layout: "support", productSupport: true, parent: "/products/one-search", eyebrow: "Product support", headline: "Help with One Search.",
    faqs: [
      ["What should I include when reporting an issue?", "Describe whether the issue is in Railway, Flight or RTO, what you did and what happened. Include the app version and device model if you know them."],
      ["Can I include my personal documents?", "Leave out identity documents, passwords, payment information and other sensitive details. A description of the issue is usually enough to begin."],
    ],
  },
  "/products/one-search/delete-account": { title: "One Search Account & Data Deletion", description: "Account and data deletion information for One Search.", parent: "/products/one-search", layout: "legal", draft: "Confirm whether the app has accounts. If applicable, approve an identity-verification and deletion workflow, retained-data details and a monitored request queue." },
  "/privacy-policy": { title: "Corporate Privacy Policy", description: "Website privacy information for YMS Technologies.", layout: "legal", draft: pendingPolicy },
  "/terms-and-conditions": { title: "Terms & Conditions", description: "Terms for use of the YMS Technologies website.", layout: "legal", draft: "Confirm the legal operator, governing law, website terms and contact information." },
  "/cookie-policy": { title: "Cookie Policy", description: "Cookie information for the YMS Technologies website.", layout: "legal", draft: "Audit the deployed site and all integrations, then approve the cookie disclosures and consent controls where applicable." },
  "/disclaimer": { title: "Disclaimer", description: "Website information disclaimer for YMS Technologies.", layout: "legal", draft: "Review the intended scope of the website disclaimer and the legal operator details." },
};

export const pagePaths = Object.keys(pages);
export const isPublished = (path: string) => Object.hasOwn(pages, path) && !pages[path].draft;
export const publishedPaths = pagePaths.filter(isPublished);
export const routeVisible = (path: string) => isPublished(path) || (process.env.NODE_ENV === "development" && Object.hasOwn(pages, path));

export const primaryServices = [
  { path: "/services/app-development", scene: "mobile", title: "App Development", description: "Mobile experiences designed around real user journeys." },
  { path: "/services/web-development", scene: "web", title: "Web Development", description: "Responsive websites with clear structure and reliable engineering." },
  { path: "/services/digital-marketing", scene: "marketing", title: "Digital Marketing", description: "Audience, content and measurement working together." },
] as const;

export const processSteps = [
  ["Discovery", "Understand the audience, the problem and the limits of the project."],
  ["Strategy", "Agree on the priorities and how to judge whether they work."],
  ["Design", "Define the experience, interface and states users will encounter."],
  ["Development", "Build the agreed scope and work through the dependencies."],
  ["Testing", "Check important journeys, devices, accessibility and performance."],
  ["Launch", "Prepare release, handover and operational checks."],
  ["Continuous Improvement", "Use feedback and agreed measures to guide the next iteration."],
] as const;

export const homepageFaqs: readonly FAQ[] = [
  ["What services does YMS Technologies offer?", "YMS Technologies offers mobile app development, web development and digital marketing, and builds its own digital products."],
  ["What is One Search?", "One Search brings railway, flight and RTO information into one application."],
  ["How do I start a project?", "Use the project enquiry page. Share what you want to achieve, who the project is for and any known requirements."],
  ["How is YMS Technologies associated with York Media Solutions?", "YMS Technologies is associated with York Media Solutions and operates under its own technology brand."],
];
