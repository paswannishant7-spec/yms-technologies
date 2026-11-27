# YMS Technologies · Technology in Motion

## Current state

The website is implemented in this workspace as a Next.js App Router application. The local preview uses [127.0.0.1:3000](http://127.0.0.1:3000). Public release requires verified business information, operational enquiry delivery and content approval. The project has not been deployed.

The original implementation is recoverable at Git commit `a7b4f6e`. The redesign retains the existing routing, publication controls, enquiries, application assets and SEO integration.

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
- The One Search logo and Railway, Flight and RTO views come from `product-assets/`. WebP crops remove the phone status strip and the test-ad portions from the Flight and RTO views. The site shows no store links or unconfirmed app functionality.
- The stage architecture is an original SVG in `public/media/architecture.svg`. Live 3D meshes, lighting, mock service interface textures and still renders are generated locally. The service interface and marketing visualisation represent the disciplines. One Search uses the supplied application assets.

## 3D and motion

- The active scene runs in a lazy-loaded React Three Fiber canvas. Scene geometry includes a layered smartphone, responsive browser panels, a search and audience sculpture, engineering modules, the One Search phone and a brand chevron sculpture.
- The six updated models use brushed titanium frames, matte inserts and neutral studio reflections. The phone shows application interface layers. The web model rearranges desktop, tablet and mobile panels. The marketing composition combines an illustrative search object with an audience network. The modular and chevron scenes use bevelled enamel surfaces. One Search transitions across the supplied app textures.
- Each scene uses a prerendered WebP from its own geometry. The canvas waits for the poster and fonts, then starts at an idle opportunity. Rendering pauses off-screen. Narrow viewports use capped resolution and adjusted framing. Software rendering uses a lower pixel ratio and a 24 fps ceiling. Reduced motion and WebGL failure receive a static poster.
- GSAP expands the selected preview from its measured browser bounds into the viewport over 0.96 seconds. The scene reference and preview share the same poster. FLIP moves the remaining preview cards, and masked text reveals the new heading and CTA. The gallery provides previous and next buttons, arrow keys, touch swipes, autoplay and a pause button.
- GSAP handles word, line, handwriting and underline reveals. ScrollTrigger drives selected editorial masks, the process-line draw and a limited parallax treatment. Service demos use scroll-driven assembly with controls for direct exploration. Route navigation uses a restrained exit movement and a short incoming heading mask. Reduced motion disables these sequences.

## Development and deployment

Node.js 22 or later and npm are required. Deploy to a Node-capable Next.js host. The enquiry handler needs the Node runtime and outbound HTTPS access.

```powershell
npm ci
npm run dev -- --webpack --hostname 127.0.0.1 --port 3000
```

For a production-style local preview, stop the dev server before starting the production server on the same port.

```powershell
npm run typecheck
npm run lint
npm run build
npm start -- --hostname 127.0.0.1 --port 3000
# In a separate terminal
npm test
```

Set approved deployment variables before building and configure the same values at runtime. Use the official HTTPS origin at the hosting edge and redirect other hostnames to that origin. Verify real enquiry receipt in a protected release environment. Review the published routes, sitemap, robots.txt, legal information and support links before release. For Chrome recording, run `npx playwright install ffmpeg` followed by `npm run qa:artifacts` against the build.

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

The November 27, 2026 redesign passed the production build, TypeScript, ESLint and 13 distinct Playwright checks across the Chrome suite and focused checks. The typography assertion was corrected to compare actual loaded family names after normalising browser quoting. The responsive suite covered 1920, 1440, 1024, 768, 390 and 360 px. Chrome verified source-card and destination bounds, live canvas rendering, looping, rapid navigation, autoplay and pause, touch gestures, menu focus, loaded local fonts, resolved contrast, handwritten stroke drawing, scroll-driven process tracing, reduced motion, WebGL fallback, the genuine Railway screen on the live phone, routes, metadata and publication gates.

The production page tests confirmed that draft content returns 404 and the local preview lacks sitemap entries. Before the redesign, a production-handler check with a synthetic HTTPS origin produced exactly 15 sitemap URLs and excluded the drafts. The redesign passed the local HTTPS integration test for project and product support delivery, idempotency, downstream failure handling and rate limiting. Live receiving accounts and external Redis remain dependent on release configuration.

### Performance and evidence

The before and after measurements are individual Chrome visits to loopback production builds with software WebGL and no network or CPU throttling. Desktop LCP improved in this sample and remains above the 2.5-second target. The browser frame cadence sampled for about 850 ms with the canvas visible was 5.7 fps on desktop and 15.5 fps on mobile. Hardware rendering and field LCP, CLS and INP remain to be measured. The after visits reported zero browser errors. [Before readings](artifacts/performance.json) · [After readings](artifacts/v2/performance.json)

| Metric | Before | After |
| --- | ---: | ---: |
| 1440 px desktop LCP | 4.01 s | 3.12 s |
| 390 px mobile LCP | 0.64 s | 0.74 s |
| Desktop pre-input layout shift sum | 0.001 | 0.012 |
| Mobile pre-input layout shift sum | 0 | 0 |
| Six poster assets | 193 KiB | 153 KiB |

Asynchronous 3D JavaScript remains about 265 KiB gzipped. The posters are about 20% smaller and keep each scene visible while live rendering starts.

- Desktop homepage [before](artifacts/v2/before-home-desktop.png) and [after](artifacts/v2/home-desktop.png)
- Mobile homepage [before](artifacts/v2/before-home-mobile.png) and [after](artifacts/v2/home-mobile.png)
- App Development [desktop](artifacts/v2/app-development-desktop.png) and [mobile](artifacts/v2/app-development-mobile.png)
- Web Development [desktop](artifacts/v2/web-development-desktop.png) and [mobile](artifacts/v2/web-development-mobile.png)
- Digital Marketing [desktop](artifacts/v2/digital-marketing-desktop.png) and [mobile](artifacts/v2/digital-marketing-mobile.png)
- [One Search](artifacts/v2/one-search-mobile.png)
- [Homepage transition recording](artifacts/v2/homepage-transition.webm) and [homepage scroll recording](artifacts/v2/homepage-scroll.webm)

### Known limitations

- The local site has no official domain or delivery credential. Forms therefore show that they are unavailable, and the preview blocks search indexing. The optional shared Redis backend requires an ingress and Redis instance to verify in the release environment.
- Software rasterisation is visibly slower than the motion target on capable hardware. The browser can show the same scene as an optimised poster while the live model loads or when WebGL is unavailable.
- React Three Fiber’s use of Three’s deprecated clock may produce a browser warning. A graphics driver can also emit shader compiler warnings.
- Canonical metadata, search verification and release performance depend on the deployment configuration. Actual Search Console and Play Console ownership remain unverified.
