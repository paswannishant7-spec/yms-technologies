# YMS Technologies · Technology in Motion

## Current state

The Next.js App Router production preview is available at [127.0.0.1:3012](http://127.0.0.1:3012). The [One Search product page](http://127.0.0.1:3012/products/one-search) and [draft privacy experience](http://127.0.0.1:3012/products/one-search/privacy-policy) are part of that local preview. Public release requires verified business information, operational enquiry delivery and content approval. The project has not been deployed.

The checkpoint immediately before the consolidated production pass is `efc0a13`. The original site and the first daylight redesign are recoverable at `a7b4f6e` and `9ed98e3`.

### Visual system

- Midnight navy `#0C1D35` and supporting slate `#46566B` carry the text. Warm white `#FAFAF7`, pure white `#FFFFFF` and ice blue `#EAF3FC` provide the main surfaces. Royal blue `#0866E9` carries primary actions. Golden yellow `#FFC107` uses navy text, while the handwritten foreground uses deep gold `#946600` on light surfaces.
- Plus Jakarta Sans sets the headings, DM Sans carries body and navigation text, Caveat highlights selected phrases, and IBM Plex Mono marks gallery controls and technical captions. The font files are local. Next preloads the heading and body faces. Caveat loads when a handwritten accent uses it. The Fontsource packages include their SIL Open Font Licenses.
- The homepage opens with an oversized brand statement, a daylight smartphone scene and a separate preview rail. The sections below use an editorial introduction, an asymmetrical expertise layout, interactive One Search views, a scroll-traced process line and a lighter enquiry band.
- The three service pages use different scene layouts, studio backgrounds and interaction controls. Editorial, product, support and contact routes use their own compositions within the shared light design. The footer uses midnight navy.

### Publication-ready site content

These routes are enabled in the production application. Indexing and canonical metadata activate once `SITE_URL` is set to the approved HTTPS origin.

| Area | Routes |
| --- | --- |
| Corporate | `/`, `/about`, `/services`, `/products`, `/industries`, `/technology`, `/insights`, `/careers`, `/contact`, `/support` |
| Confirmed services | `/services/app-development`, `/services/web-development`, `/services/digital-marketing` |
| One Search | `/products/one-search`, `/products/one-search/support` |
| System | Custom 404, `/robots.txt`, `/sitemap.xml`, `POST /api/enquiries` |

### Development-only content

Routes marked `draft` in `src/content/pages.ts` display a publication note in development and return a custom 404 in production. Navigation, breadcrumbs to published content, and sitemap use the same inventory. Publish an approved entry by supplying reviewed sections and clearing its draft marker.

| Area | Routes and outstanding inputs |
| --- | --- |
| Portfolio | `/work` needs verified work, publication permission and visuals |
| Services | `/services/android-development`, `/services/ios-development`, `/services/cross-platform-development`, `/services/ecommerce-development`, `/services/seo`, `/services/aeo`, `/services/geo`, `/services/performance-marketing`, `/services/social-media-marketing` require capability and content approval |
| One Search legal | `/products/one-search/privacy-policy`, `/products/one-search/terms`, `/products/one-search/delete-account` require verified app practices and legal review |
| Corporate legal | `/privacy-policy`, `/terms-and-conditions`, `/cookie-policy`, `/disclaimer` require verified operator details and reviewed policies |
| Asset utility | `/scene-preview/[id]` renders a clean 3D viewport for local poster generation |

## Reference decisions and asset provenance

- The approved JPEG logo and original MP4 are in `references/`. The supplied daylight reference is saved as `references/visual-direction-v2.png`. Its blue-and-yellow palette, clear hierarchy and hand-drawn emphasis informed the redesign. The site uses original copy, device artwork and page compositions. The earlier standalone homepage composition image remains missing.
- The 720 × 540, 18.85-second video was sampled at 12 positions. The left title, low right preview rail and bottom transport repeat across scenes. Around 14.26 seconds the selected card expands from its position while nearby cards remain in place. At 3.27 seconds the next title is partially revealed through a text mask. The video’s outdoor imagery informed motion and layout only. [Reference contact sheet](artifacts/reference-video-frames.jpg)
- The original logo stays in `references/`. `yms-identity.webp` is a full optimised conversion. The provisional `yms-navigation-light.webp` uses a navy wordmark with the original red accents for legibility on white. The earlier transparent derivative is used in the navy footer. The favicon is a chevron derivative.
- The supplied folder contains 34 PNGs, 67 SVGs and a large PDF board. The 15-screen gallery includes original PNGs, the existing app-reference RTO overview, and six additional screens cropped from the board. The Railway and Flight entry crops remove their blank ad area. `scripts/prepare-one-search-ui.mjs` produces local WebPs. [Screen inventory and source decisions](product-assets/one-search-ui/INVENTORY.md)
- Browser diagnosis found HTTP 200 responses and successful decoding. The old CSS removed the visible screenshot when WebGL activated, and the replacement was a small, angled texture. The product and homepage walkthroughs now keep a separate readable screenshot beside the model. The gallery supplies full-proportion inspection, and the tests verify each natural size and the live phone's applied texture.
- One Search has orange product branding, an app-home device hero, dedicated Railway, Flight and RTO chapters, a connected screen lineup, the interactive gallery, practical use cases, FAQs and privacy/support links. The sample result screens display design data. The website demonstration has no live search connection or unverified store links.
- The stage architecture is an original SVG in `public/media/architecture.svg`. Live 3D meshes, lighting, mock service interface textures and still renders are generated locally. The service interface and marketing visualisation represent the disciplines. One Search uses the supplied application assets.

## 3D and motion

- The active scene runs in a lazy-loaded React Three Fiber canvas. Scene geometry includes a layered smartphone, responsive browser panels, a search and audience sculpture, engineering modules, the One Search phone and a brand chevron sculpture.
- The six scenes retain brushed titanium, matte inserts and neutral studio reflections. The One Search walkthrough maps screens at their recorded aspect ratios and blends them as controls or scroll chapters change. Its procedural miniature train, aircraft and car each move differently, and the phone adjusts its pose to match the chapter. The gallery uses a native dialog, touch and keyboard controls, plus focus restoration.
- Each scene has a full poster and a smaller image for the preview rail. Canvas startup follows poster and font readiness and an initial paint opportunity. Off-screen canvases pause immediately and release resources after 1.2 seconds. The corporate product scene uses four textures, and the One Search hero loads its single texture. Software rendering starts at 0.64 pixel ratio with a 20 fps ceiling and a smaller environment map. Reduced motion and WebGL failure retain the static view.
- GSAP runs the 1.04-second shared-element morph by revealing a fixed viewport stage with a rounded clip. The preview artwork moves with a uniform transform. FLIP repositions the rail, and the matching poster holds the destination until the new model is ready. Manual selection, autoplay, keyboard navigation, swipes and focus remain available.
- GSAP coordinates word masks, handwritten reveals, underlines and staggered headings, product artwork, copy and actions. Below-fold ScrollTrigger registration follows the critical first-paint opportunity. Service demos retain scroll-driven controls, and the header stays visible as users scroll.

### Route loaders

| Animation | Default destination group |
| --- | --- |
| Orbit | Home and Technology |
| Liquid Fill | App Development and Products |
| Square Morph | Services and Web Development |
| Chasing Squares | Digital Marketing, Insights and scoped Work previews |
| Battery Charge | One Search, product support, Support Centre and the orange privacy transition |
| Bouncing Ball | About, Careers, Industries and Contact |

Navigation requests start immediately. Fast routes complete the signature and reveal in about 0.93 seconds. A timeout clears interrupted or stalled in-app transitions. Direct visits keep the content usable under a small, decorative introductory mark. Reduced motion skips the overlay, and same-page controls use their local transitions.

### Independent privacy draft

The original sibling `Landing page` project identifies itself as the One Search Privacy Center. Its source marks the legal copy **Draft 0.1** and includes unverified references to creative-media, AI and face processing. Legal identity, effective date, app data practices, vendors and contact or deletion operations still require confirmation. The integrated static export preserves the original language, layout, styling, navigation, motion and reader. A return link connects to One Search. The source contains no background video files, so the original pauseable animated fallback remains active. The integration introduces no public policy claim.

Only loopback can serve the draft when `YMS_LOCAL_PRIVACY_PREVIEW=true` and `SITE_URL` is unset. The route responds with `noindex, nofollow` and stays outside the sitemap. The compiled independent assets reside in `privacy-export/`, outside the public asset folder. The original source and media were hash-checked unchanged. To refresh the generated export, run `powershell -File scripts/import-one-search-privacy.ps1` with the source dependencies already installed. The import builds a staged copy and rewrites the base path and return link only.

## Development and deployment

Node.js 22 or later and npm are required. Deploy to a Node-capable Next.js host. The enquiry handler needs the Node runtime and outbound HTTPS access.

```powershell
npm ci
npm run dev -- --webpack --hostname 127.0.0.1 --port 3000
```

The production preview can run alongside the development server on a separate port.

```powershell
npm run typecheck
npm run lint
$env:YMS_LOCAL_PRIVACY_PREVIEW='true'
npm run build
npm start -- --hostname 127.0.0.1 --port 3012
# In a separate terminal
$env:YMS_LOCAL_PRIVACY_PREVIEW='true'
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3012'
npm test
```

For a release build, unset `YMS_LOCAL_PRIVACY_PREVIEW` before building, then set the approved deployment variables at build and runtime. Use the approved HTTPS origin at the hosting edge and verify enquiry receipt in a protected release environment. Review the published routes, sitemap, robots.txt, legal information and support links before release. For the local Chrome evidence, run `npx playwright install ffmpeg`, set `PREVIEW_URL` to the preview origin, and run `node scripts/capture-final.mjs`.

### Environment

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Verified HTTPS origin with no path, query or fragment. Generates canonical URLs, Open Graph image URLs, structured data and the sitemap. Without it the preview blocks indexing. |
| `BUSINESS_LEGAL_NAME`, `BUSINESS_REGISTERED_ADDRESS` | Exact approved legal/operator details. |
| `BUSINESS_EMAIL`, `BUSINESS_PHONE`, `SUPPORT_EMAIL` | Verified business and customer support contacts. |
| `GOOGLE_SITE_VERIFICATION` | Search Console HTML-tag token when using an eligible URL-prefix property. Domain properties use DNS ownership verification. [Search Console ownership verification](https://support.google.com/webmasters/answer/9008080) |
| `FORM_DELIVERY_URL`, `FORM_DELIVERY_TOKEN` | Approved HTTPS receiver with bearer authentication. A 2xx must indicate the receiver has accepted the enquiry for processing. |
| `RATE_LIMIT_REST_URL`, `RATE_LIMIT_REST_TOKEN` | Optional Redis REST endpoint supporting the `EVAL` command for an atomic shared counter. Configure both in a multi-instance deployment. |
| `FORM_CLIENT_IP_HEADER` | Optional trusted single-IP header that the hosting ingress replaces on every request. Without it, callers share one limiter bucket. |
| `CAREER_APPLICATIONS_ENABLED` | Set to `true` after a monitored careers intake process is ready. |
| `ONE_SEARCH_DELETION_ENABLED` | Set to `true` only after the account-deletion page and operational process are approved and enabled. |

The receiver accepts JSON with `requestId`, `kind`, `name`, `email`, `area`, `message` and `consent`. Deduplicate with the `Idempotency-Key` request header. The site limits each bucket to six valid submissions per ten minutes. It uses same-origin checks, a bounded payload, Zod validation and a honeypot. The deployed receiver must define access, retention and downstream delivery. With no configured receiver, forms show that online submissions are unavailable and use a verified email if configured.

## Outstanding business inputs

1. Verify the operating legal name, registered address, official domain, business email and phone, customer support and grievance contacts, and approved wording for the association with York Media Solutions.
2. Connect the approved enquiry and support receiver. Confirm how requests are triaged, retained and deleted.
3. Inventory One Search app permissions, account functionality, data categories, advertising SDKs, third parties, sharing, retention, security and deletion handling. Approve actual policy wording and publish the appropriate independently routed pages. When accounts can be created, review Google Play’s in-app and website deletion requirements against the operational process. [Google Play user data requirements](https://support.google.com/googleplay/android-developer/answer/10144311)
4. Verify site ownership with the authorised Google account before requesting association in Play Console. Sole proprietorship and receipt of a D-U-N-S number were reported in the brief. The site does not publish confidential identifiers or assert that identity verification has occurred. [Play Console developer identity verification](https://support.google.com/googleplay/android-developer/answer/10841920)
5. Supply approved project assets and service scopes before publishing the portfolio and secondary services. Supply the standalone homepage image if exact composition matching is required.
6. Establish post-launch measurement after privacy review. Performance targets are LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1.

## Verification

The production build, TypeScript, ESLint and all **17 Playwright checks passed**. The responsive checks covered 1920, 1440, 1024, 768, 390 and 360 px. Existing checks verified source-card expansion, live canvas rendering, autoplay, mobile touch and navigation, text and handwriting, reduced motion, metadata, and WebGL fallback. A separate Chrome run rendered all six homepage scenes in live WebGL without console or page errors. The final suite also verified the six destination loaders, same-page anchors, all 15 product asset responses and natural sizes, visible desktop and mobile screenshots, Railway, Flight and Vehicle Search texture changes, keyboard gallery controls, and the standalone privacy draft with JavaScript disabled. Its separate policy reader route and pauseable motion controls also passed.

The preview still blocks indexing, and its sitemap is empty without an approved origin. A previous production-handler check with a synthetic HTTPS origin produced exactly 15 sitemap URLs and excluded the drafts. A separate default-production process returned 404 for the privacy document, subsidiary route and logo asset. The local draft preview keeps its `noindex` response. All 25 hashed privacy source and media files matched their pre-integration hashes. The isolated HTTPS delivery check passed authenticated forwarding, idempotency headers, downstream error handling and rate limiting. Live receiving accounts and external Redis remain dependent on release configuration.

### Performance and evidence

Two independent visits per viewport used loopback production, Chrome 158, forced SwiftShader WebGL and no configured CPU or network throttling. The desktop poster finished transferring in 108–214 ms, while the first contentful paint occurred at 2.53–3.99 s. The delay is after delivery. Deferred scroll-motion registration, the later WebGL handoff and fewer preloaded fonts reduce the work competing with first paint. Desktop LCP improved in these samples and remained above the 2.5-second target. Mobile LCP increased and stayed below 2.5 seconds. All four captured visits reported no console or page errors. [Previous capture](artifacts/v3/performance.json) · [Final readings](artifacts/final/performance.json)

| Metric | Previous refinement | Consolidated pass |
| --- | ---: | ---: |
| 1440 px desktop LCP | 4.08–8.35 s | 2.53–3.99 s |
| 390 px mobile LCP | 0.94–1.42 s | 1.72–2.32 s |
| Desktop pre-input layout shift sum | 0.004 | 0.004 |
| Mobile pre-input layout shift sum | 0 | 0 |

The six dedicated rail thumbnails total 46 KiB. The active scene uses the full poster while its live model starts. Inactive cards use the smaller assets. The short frame sample immediately after WebGL readiness was 0.47–0.81 fps on desktop and 7.64–15.56 fps on mobile. The previous capture gave WebGL 450 ms to settle before sampling, so its cadence readings have a different sampling window. Hardware frame cadence and field LCP, CLS and INP remain unverified.

- Homepage [desktop](artifacts/final/homepage-desktop.png) and [mobile](artifacts/final/homepage-mobile.png)
- App Development [desktop](artifacts/final/app-development-desktop.png) and [mobile](artifacts/final/app-development-mobile.png)
- Web Development [desktop](artifacts/final/web-development-desktop.png) and [mobile](artifacts/final/web-development-mobile.png)
- Digital Marketing [desktop](artifacts/final/digital-marketing-desktop.png) and [mobile](artifacts/final/digital-marketing-mobile.png)
- One Search hero [desktop](artifacts/final/one-search-desktop.png) and [mobile](artifacts/final/one-search-mobile.png)
- One Search walkthrough [desktop](artifacts/final/one-search-walkthrough-desktop.png) and [mobile](artifacts/final/one-search-walkthrough-mobile.png)
- One Search gallery [desktop](artifacts/final/one-search-gallery-desktop.png) and [mobile](artifacts/final/one-search-gallery-mobile.png)
- Independent privacy draft [desktop](artifacts/final/one-search-privacy-desktop.png) and [mobile](artifacts/final/one-search-privacy-mobile.png)
- Recordings of [all six loaders](artifacts/final/route-loaders.webm), [page transitions](artifacts/final/page-transitions.webm), [the One Search demo](artifacts/final/one-search-experience.webm) and [privacy navigation](artifacts/final/privacy-navigation.webm)

### Known limitations

- The local site has no official domain or delivery credential. Forms therefore show that they are unavailable, and the preview blocks search indexing. The optional shared Redis backend requires an ingress and Redis instance to verify in the release environment.
- Software rasterisation produced uneven frame cadence, and desktop LCP missed the target on this test host. The browser shows an optimised poster while the live model loads or when WebGL is unavailable.
- React Three Fiber’s use of Three’s deprecated clock may produce a browser warning. A graphics driver can also emit shader compiler warnings.
- Canonical metadata, search verification and release performance depend on the deployment configuration. Actual Search Console and Play Console ownership remain unverified.
