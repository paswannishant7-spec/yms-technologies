# YMS Technologies · The Digital Shift

## Current state

The website is implemented in this workspace as a Next.js App Router application. The local preview uses [127.0.0.1:3000](http://127.0.0.1:3000). Public release requires verified business information, operational enquiry delivery and content approval. The project has not been deployed.

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

- The source folder supplied `references/yms-technologies-logo.jpeg` and `references/website-reference.mp4`. A separate `homepage-reference.png` was unavailable. The homepage follows the brief’s hierarchy and visual rhythm from the video.
- The 720 × 540, 18.85-second video was sampled at 12 positions. The left title, low right preview rail and bottom transport repeat across scenes. Around 14.26 seconds the selected card expands from its position while nearby cards remain in place. At 3.27 seconds the next title is partially revealed through a text mask. The video’s outdoor imagery informed motion and layout only. [Reference contact sheet](artifacts/reference-video-frames.jpg)
- The original logo stays in `references/`. `yms-identity.webp` is a full optimised conversion. `yms-navigation-derivative.webp` isolates the approved mark for small headers and the footer. The favicon is a chevron derivative.
- The One Search logo and Railway, Flight and RTO views come from `product-assets/`. WebP crops remove the phone status strip and the test-ad portions from the Flight and RTO views. The site shows no store links or unconfirmed app functionality.
- The stage architecture is an original SVG in `public/media/architecture.svg`. Live 3D meshes, lighting, mock service interface textures and still renders are generated locally. The service interface and marketing visualisation represent the disciplines. One Search uses the supplied application assets.
- Barlow Condensed and Manrope are installed and served locally through Fontsource. Their SIL Open Font License copies are included with the respective packages.

## 3D and motion

- The active scene runs in a lazy-loaded React Three Fiber canvas. Scene geometry includes a layered smartphone, responsive browser panels, a search and audience sculpture, engineering modules, the One Search phone and a brand chevron sculpture.
- The scenes use physically based materials, studio light reflections, pointer-driven camera response and scroll-driven model movement. Each scene uses a prerendered WebP from the same geometry. Rendering is suspended off-screen, resolution is capped on mobile and software rendering runs at a lower pixel ratio with a 24 fps ceiling. Poster mode covers reduced motion and WebGL failure.
- GSAP expands the selected preview from its measured browser bounds into the viewport over 0.96 seconds. The scene reference and preview share the same poster. FLIP moves the remaining preview cards, and masked text reveals the new heading and CTA. The gallery provides previous and next buttons, arrow keys, touch swipes, autoplay and a pause button.
- GSAP ScrollTrigger handles selected editorial reveals. Route entries use a short masked heading transition. Reduced motion disables these sequences.

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

The November 27, 2026 production build passed TypeScript, ESLint and all 10 Playwright checks across the Chrome suite and focused transition retest. The retest observes the source card dimensions before the click and verifies the full-viewport destination, which avoids missing an individual animation frame on the software renderer. The responsive test opened the homepage, confirmed service pages, One Search and Contact at 1920, 1440, 1024, 768, 390 and 360 pixels. Chrome verified live canvas movement, automatic and manual navigation, touch gestures, menu focus, reduced motion, missing-WebGL fallback, product tabs, the supplied Railway UI on the live 3D phone, internal links, metadata and the custom 404.

The production page tests confirmed that draft content returns 404 and the local preview lacks sitemap entries. A separate production-handler check with a synthetic HTTPS origin produced exactly 15 sitemap URLs and excluded the drafts. The local HTTPS integration test verified project and product support delivery, an idempotency key, downstream failure handling and rate limiting. Production receiving accounts and external Redis were outside that local test.

### Performance and evidence

Two local Chrome visits used software WebGL without network or CPU throttling. Desktop LCP was 4.01 seconds at 1440 px, above the 2.5-second engineering target in this sample. Mobile LCP was 0.64 seconds at 390 px. Recorded pre-input layout shifts totalled 0.001 on desktop and zero on mobile. Neither visit reported browser errors. Field LCP, CLS and INP remain to be measured on the deployed origin. [Local performance readings](artifacts/performance.json)

The six shared scene posters total about 193 KiB. The asynchronous 3D JavaScript chunks total about 265 KiB gzipped. On slower software renderers, the poster stays visible while live geometry becomes ready.

- [Desktop homepage](artifacts/home-desktop.png) and [desktop App Development page](artifacts/app-development-desktop.png)
- [Mobile homepage](artifacts/home-mobile.png) and [mobile One Search page](artifacts/one-search-mobile.png)
- [Homepage transition recording](artifacts/homepage-transition.webm)

### Known limitations

- The local site has no official domain or delivery credential. Forms therefore show that they are unavailable, and the preview blocks search indexing. The optional shared Redis backend requires an ingress and Redis instance to verify in the release environment.
- The immersive scene choreography is concentrated on the homepage. Interior navigation uses a heading entry mask, and service pages use their own graphics and scroll responses.
- React Three Fiber’s use of Three’s deprecated clock may produce a browser warning. A graphics driver can also emit shader compiler warnings.
- Canonical metadata, search verification and release performance depend on the deployment configuration. Actual Search Console and Play Console ownership remain unverified.
