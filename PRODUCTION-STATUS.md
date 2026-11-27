# YMS Technologies · Technology in Motion

## Current state

The website is implemented in this workspace as a Next.js App Router application. The current production build is serving a local preview at [127.0.0.1:3010](http://127.0.0.1:3010). Public release requires verified business information, operational enquiry delivery and content approval. The project has not been deployed.

The original implementation is recoverable at Git commit `a7b4f6e`. The daylight redesign immediately before the final refinement is recoverable at `9ed98e3`. The final pass retains the routing, publication controls, enquiries and SEO integration.

### Visual system

- Midnight navy `#0C1D35` and supporting slate `#46566B` carry the text. Warm white `#FAFAF7`, pure white `#FFFFFF` and ice blue `#EAF3FC` provide the main surfaces. Royal blue `#0866E9` carries primary actions. Golden yellow `#FFC107` uses navy text, while the handwritten foreground uses deep gold `#946600` on light surfaces.
- Plus Jakarta Sans sets the headings, DM Sans carries body and navigation text, Caveat highlights selected phrases, and IBM Plex Mono marks gallery controls and technical captions. The font files are local. Next preloads the three Latin variable families, and the Fontsource packages include their SIL Open Font Licenses.
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
- The supplied export folder includes Railway, Flight, Vehicle Search and a transport illustration. Selected PNG originals are kept in `product-assets/one-search-ui/`. `scripts/prepare-one-search-ui.mjs` produces the public WebP files. The Railway and Flight crops remove the blank ad area while keeping the navigation, input fields and supporting actions intact. Vehicle Search uses the full standalone export. The existing genuine app RTO overview opens the two-screen vehicle sequence because the supplied design overview highlights Flight.
- The supplied design PDF is a wide Figma board. It was reviewed as design context. The web showcase uses the standalone selected exports and the existing RTO overview. Railway and Flight each show one entry view. The vehicle story offers the overview and dedicated lookup. The dates and inputs in the artwork are design samples.
- The stage architecture is an original SVG in `public/media/architecture.svg`. Live 3D meshes, lighting, mock service interface textures and still renders are generated locally. The service interface and marketing visualisation represent the disciplines. One Search uses the supplied application assets.

## 3D and motion

- The active scene runs in a lazy-loaded React Three Fiber canvas. Scene geometry includes a layered smartphone, responsive browser panels, a search and audience sculpture, engineering modules, the One Search phone and a brand chevron sculpture.
- The six scenes retain brushed titanium, matte inserts and neutral studio reflections. One Search now maps each screen using its recorded aspect ratio and blends the previous texture into the new one on the live device. The product walkthrough pairs the sticky desktop device with scroll-linked Railway, Flight and RTO chapters. Tabs and the RTO step controls remain directly usable at every width.
- Each scene has a full poster and a smaller image for the preview rail. The canvas waits for the poster, fonts and an initial paint opportunity. Rendering pauses off-screen. Software rendering starts at 0.64 pixel ratio with a 20 fps ceiling and a smaller environment map. Reduced motion and WebGL failure receive a static view.
- GSAP runs the 1.04-second shared-element morph by revealing a fixed viewport stage with a rounded clip. The preview artwork moves with a uniform transform. FLIP repositions the rail, and the matching poster holds the destination until the new model is ready. Manual selection, autoplay, keyboard navigation, swipes and focus remain available.
- GSAP coordinates word masks, handwritten reveals, underlines and restrained paragraph entrances. ScrollTrigger drives the process line and limited parallax. Service demos retain scroll-driven controls, with route headings revealing as navigation completes. The header stays in view as users scroll.

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
npm run build
npm start -- --hostname 127.0.0.1 --port 3010
# In a separate terminal
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3010'
npm test
```

Set approved deployment variables before building and configure the same values at runtime. Use the official HTTPS origin at the hosting edge and redirect other hostnames to that origin. Verify real enquiry receipt in a protected release environment. Review the published routes, sitemap, robots.txt, legal information and support links before release. For Chrome recording, run `npx playwright install ffmpeg`, set `PREVIEW_URL` to the production preview origin, and run `npm run qa:artifacts`.

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

The November 27, 2026 final refinement passed the production build, TypeScript, ESLint and all 14 Playwright checks against the local production build. The responsive suite covered 1920, 1440, 1024, 768, 390 and 360 px. Chrome verified the rounded source-card and destination clips, rapid navigation, autoplay and pause, touch gestures, menu focus, local fonts, resolved contrast, handwritten stroke drawing, the scroll-driven process line, reduced motion and WebGL fallback. A separate 1024 px check reached live WebGL on all six homepage scenes with no console or page errors. Product checks covered the genuine Railway texture on the live phone, Flight and Vehicle Search screen selection, keyboard navigation, scroll-linked chapters, and the genuine static fallback. Published pages returned 200, internal links resolved to published routes, and the 17 draft content routes returned 404.

The preview still blocks indexing, and its sitemap is empty without an approved origin. A previous production-handler check with a synthetic HTTPS origin produced exactly 15 sitemap URLs and excluded the drafts. The final Playwright suite verified rejected malformed, cross-origin, bot and disabled deletion submissions, and the unavailable-delivery state. The isolated HTTPS delivery check passed forwarding, idempotency headers, downstream error handling and rate limiting. Live receiving accounts and external Redis remain dependent on release configuration.

### Performance and evidence

These are loopback production measurements in headless Chrome with forced software WebGL and no configured network or CPU throttling. The final pass had two capture runs with no browser errors. Desktop LCP exceeded the 2.5-second target in both runs. The desktop poster transferred in under 300 ms in two separate diagnostic traces, while its first paint was recorded at 3.44–3.94 s. Hardware frame cadence and field LCP, CLS and INP still need measurement. [Previous capture](artifacts/v2/performance.json) · [Latest capture](artifacts/v3/performance.json)

| Metric | Daylight redesign | Final pass, two runs |
| --- | ---: | ---: |
| 1440 px desktop LCP | 3.12 s | 4.08–8.35 s |
| 390 px mobile LCP | 0.74 s | 0.94–1.42 s |
| Desktop pre-input layout shift sum | 0.012 | 0.004 |
| Mobile pre-input layout shift sum | 0 | 0 |
| Desktop sampled software frame cadence | 5.66 fps | 6.21–6.67 fps |
| Mobile sampled software frame cadence | 15.51 fps | 6.79–16.52 fps |
| Six full-size posters | 153 KiB | 149 KiB |

The six dedicated rail thumbnails total 46 KiB. The active scene uses the full poster while its live model starts. Inactive cards use the smaller assets.

- Homepage [desktop](artifacts/v3/home-desktop.png) and [mobile](artifacts/v3/home-mobile.png)
- App Development [desktop](artifacts/v3/app-development-desktop.png) and [mobile](artifacts/v3/app-development-mobile.png)
- Web Development [desktop](artifacts/v3/web-development-desktop.png) and [mobile](artifacts/v3/web-development-mobile.png)
- Digital Marketing [desktop](artifacts/v3/digital-marketing-desktop.png) and [mobile](artifacts/v3/digital-marketing-mobile.png)
- One Search [desktop walkthrough](artifacts/v3/one-search-desktop.png), [mobile full page](artifacts/v3/one-search-mobile.png) and [vehicle lookup](artifacts/v3/one-search-vehicle-lookup.png)
- [Homepage transition recording](artifacts/v3/homepage-transition.webm) and [One Search demo](artifacts/v3/one-search-demo.webm)

### Known limitations

- The local site has no official domain or delivery credential. Forms therefore show that they are unavailable, and the preview blocks search indexing. The optional shared Redis backend requires an ingress and Redis instance to verify in the release environment.
- Software rasterisation produced uneven frame cadence, and desktop LCP missed the target on this test host. The browser shows an optimised poster while the live model loads or when WebGL is unavailable.
- React Three Fiber’s use of Three’s deprecated clock may produce a browser warning. A graphics driver can also emit shader compiler warnings.
- Canonical metadata, search verification and release performance depend on the deployment configuration. Actual Search Console and Play Console ownership remain unverified.
