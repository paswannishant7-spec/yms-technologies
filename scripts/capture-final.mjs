import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3012";
const product = "/products/one-search";
const privacy = `${product}/privacy-policy`;
const output = "artifacts/final";
const desktop = { width: 1440, height: 960 };
const mobile = { width: 390, height: 844 };
const videoViewport = { width: 1280, height: 900 };
const onlyVideo = process.argv.find((argument) => argument.startsWith("--record="))?.slice(9);
const refreshOpeningStills = process.argv.includes("--refresh-opening-stills");
const timings = [];
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
await mkdir(output, { recursive: true });

async function visit(page, path) {
  const response = await page.goto(base + path, { waitUntil: "load" });
  if (!response?.ok()) throw new Error(`${path}: HTTP ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
}

async function goTo(page, selector) {
  await page.locator(selector).evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "start" }));
}

async function save(page, name, options = {}) {
  await page.screenshot({ path: `${output}/${name}.png`, ...options });
  console.log(`Saved ${name}.png`);
}

async function withPage(viewport, task, reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport, reducedMotion, hasTouch: viewport.width < 500, isMobile: viewport.width < 500 });
  try { await task(await context.newPage()); }
  finally { await context.close(); }
}

async function record(name, task) {
  const context = await browser.newContext({ viewport: videoViewport, recordVideo: { dir: ".preview/video", size: videoViewport } });
  const page = await context.newPage();
  let complete = false;
  try { await task(page); complete = true; }
  finally {
    const video = page.video();
    await context.close();
    if (complete && video) { await video.saveAs(`${output}/${name}.webm`); console.log(`Saved ${name}.webm`); }
  }
}

async function nav(page, path, menu, kind) {
  const header = page.locator(".site-header");
  const anchor = header.locator(`a[href="${path}"]:visible`).first();
  if (menu && !await anchor.count()) await header.getByRole("button", { name: `Open ${menu} menu` }).click();
  if (kind) await Promise.all([page.locator(`.route-transition[data-loader="${kind}"]`).waitFor(), anchor.click()]);
  else await anchor.click();
  await page.waitForURL((url) => url.pathname === path);
  await page.locator(".route-transition").waitFor({ state: "hidden" });
}

async function measure(viewport, run, name) {
  await withPage(viewport, async (page) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.addInitScript(() => {
      window.qaReadings = { lcpMs: null, lcpElement: null, layoutShift: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.qaReadings.lcpMs = entry.startTime;
          window.qaReadings.lcpElement = entry.element?.className || entry.element?.tagName;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.qaReadings.layoutShift += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await visit(page, "/");
    await page.locator('.hero-art [data-renderer="webgl"]').waitFor({ timeout: 40_000 });
    const result = await page.evaluate(async () => {
      const starts = [];
      await new Promise((resolve) => {
        function draw(now) { starts.push(now); if (now - starts[0] < 850) requestAnimationFrame(draw); else resolve(); }
        requestAnimationFrame(draw);
      });
      const paint = performance.getEntriesByType("paint").find((read) => read.name === "first-contentful-paint")?.startTime;
      const poster = performance.getEntriesByName(new URL("/media/scene-mobile.webp", location.href).href)[0];
      return { ...window.qaReadings, fcpMs: paint, posterResponseEndMs: poster?.responseEnd,
        softwareFrameSampleFps: (starts.length - 1) * 1000 / (starts.at(-1) - starts[0]) };
    });
    timings.push({ run, viewport, ...result, browserErrors: [...new Set(errors)] });
    if (name) {
      await page.getByRole("button", { name: "Pause autoplay" }).click();
      const order = ["mobile", "web", "marketing", "technology", "product", "brand"];
      const current = await page.locator(".cinematic-hero").getAttribute("data-scene");
      for (let scene = order.indexOf(current); scene > 0; scene--) {
        await page.locator(".scene-flight").waitFor({ state: "hidden" });
        await page.getByRole("button", { name: "Previous scene" }).click();
        await page.locator(`.cinematic-hero[data-scene='${order[scene - 1]}']`).waitFor();
        await page.locator(".scene-flight").waitFor({ state: "hidden" });
        await page.waitForTimeout(320);
      }
      await save(page, name);
    }
  });
}

try {
  if (refreshOpeningStills) {
    for (const [label, viewport] of [["desktop", desktop], ["mobile", mobile]]) {
      await withPage(viewport, async (page) => {
        await visit(page, "/");
        await page.locator(".hero-poster").evaluate((image) => image.decode());
        await save(page, `homepage-${label}`);
        await visit(page, "/services/digital-marketing");
        await page.locator(".experience-art > img").first().evaluate((image) => image.decode());
        await save(page, `digital-marketing-${label}`);
      }, "reduce");
    }
  } else if (!onlyVideo && !process.argv.includes("--video-only")) {
    for (const [label, viewport] of [["desktop", desktop], ["mobile", mobile]]) {
      await measure(viewport, 1, `homepage-${label}`);
      await measure(viewport, 2);
    }
    await writeFile(`${output}/performance.json`, JSON.stringify({ browser: browser.version(),
      conditions: "Loopback production, Chrome headless, SwiftShader WebGL, no network or CPU throttling. Two independent visits per viewport. Frame cadence sampled for 850 ms after live rendering. No field vitals or INP.", visits: timings }, null, 2) + "\n");
    for (const [label, viewport] of [["desktop", desktop], ["mobile", mobile]]) {
      await withPage(viewport, async (page) => {
        for (const service of ["app-development", "web-development", "digital-marketing"]) {
          await visit(page, `/services/${service}`);
          await page.locator(".experience-art > img").first().evaluate((image) => image.decode());
          await save(page, `${service}-${label}`);
        }
        await visit(page, product);
        await page.locator(".one-search-hero .product-static-phone img").evaluate((img) => img.decode());
        await save(page, `one-search-${label}`);
        await goTo(page, "#one-search-tour");
        const readable = page.locator(".product-screen-reference img");
        await readable.evaluate((img) => img.decode());
        await save(page, `one-search-walkthrough-${label}`);
        await goTo(page, "#one-search-gallery");
        await page.locator(".gallery-card img").evaluateAll((images) => Promise.all(images.slice(0, 4).map((img) => img.decode())));
        await save(page, `one-search-gallery-${label}`);
        await visit(page, privacy);
        await save(page, `one-search-privacy-${label}`);
      }, "reduce");
    }
  }

  if (!refreshOpeningStills && !process.argv.includes("--stills-only")) {
    if (!onlyVideo || onlyVideo === "route-loaders") await record("route-loaders", async (page) => {
      await visit(page, "/about");
      for (const [path, menu, kind] of [["/", null, "orbit"], ["/services/app-development", "services", "liquid"], ["/services/web-development", "services", "square"],
        ["/services/digital-marketing", "services", "chase"], [product, "products", "battery"], ["/about", null, "bounce"]]) {
        await nav(page, path, menu, kind);
        await page.waitForTimeout(480);
      }
    });
    if (!onlyVideo || onlyVideo === "page-transitions") await record("page-transitions", async (page) => {
      await visit(page, "/");
      await page.getByRole("button", { name: "Pause autoplay" }).click();
      await page.getByRole("button", { name: "Show scene 02, Web Development" }).click();
      await page.locator(".cinematic-hero[data-scene='web']").waitFor();
      await page.locator(".scene-flight").waitFor({ state: "hidden" });
      await page.waitForTimeout(520);
      await page.getByRole("link", { name: "Explore Web Development" }).click();
      await page.waitForURL("**/services/web-development");
      await page.locator(".route-transition").waitFor({ state: "hidden" });
      await page.waitForTimeout(550);
      await nav(page, "/services/digital-marketing", "services");
      await page.waitForTimeout(650);
    });
    if (!onlyVideo || onlyVideo === "one-search-experience") await record("one-search-experience", async (page) => {
      await visit(page, product);
      await page.waitForTimeout(800);
      await page.getByRole("link", { name: "Explore the app" }).click();
      await goTo(page, "#one-search-tour");
      const canvas = page.locator(".product-walkthrough canvas");
      await canvas.waitFor({ timeout: 35_000 });
      await page.getByRole("tab", { name: "Railway" }).click();
      await page.getByRole("button", { name: "Train results", exact: true }).click();
      await canvas.and(page.locator('[data-product-texture="rail-results"]')).waitFor();
      await canvas.evaluate((element) => element.scrollIntoView({ block: "nearest" }));
      await page.waitForTimeout(900);
      await page.getByRole("tab", { name: "Flight" }).click();
      await page.getByRole("button", { name: "Route details", exact: true }).click();
      await canvas.and(page.locator('[data-product-texture="flight-details"]')).waitFor();
      await page.waitForTimeout(800);
      await page.getByRole("tab", { name: "RTO" }).click();
      await page.getByRole("button", { name: "Vehicle lookup", exact: true }).click();
      await canvas.and(page.locator('[data-product-texture="vehicle-search"]')).waitFor();
      await page.waitForTimeout(800);
      await goTo(page, "#one-search-gallery");
      await page.getByRole("button", { name: "Inspect App home" }).click();
      await page.waitForTimeout(900);
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(650);
      await page.keyboard.press("Escape");
      await goTo(page, "#one-search-help");
      await page.waitForTimeout(650);
    });
    if (!onlyVideo || onlyVideo === "privacy-navigation") await record("privacy-navigation", async (page) => {
      await visit(page, product);
      await goTo(page, "#one-search-help");
      await page.getByRole("link", { name: /Privacy Policy/ }).first().click();
      await page.waitForURL((url) => url.pathname === privacy);
      const pause = page.getByRole("button", { name: "Pause motion" });
      await pause.waitFor();
      await page.waitForTimeout(650);
      await pause.scrollIntoViewIfNeeded();
      await pause.click();
      await page.waitForTimeout(550);
      await page.getByRole("link", { name: "Return to One Search" }).click();
      await page.waitForURL((url) => url.pathname === product);
      await page.waitForTimeout(700);
    });
  }
} finally { await browser.close(); }
