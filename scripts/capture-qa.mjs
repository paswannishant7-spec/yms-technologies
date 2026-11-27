import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";
const output = "artifacts/v3";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const timings = [];
const round = (value) => typeof value === "number" ? Math.round(value * 1000) / 1000 : null;
async function showOpeningScene(page) {
  await page.getByRole("button", { name: "Pause autoplay" }).click();
  const hero = page.locator(".cinematic-hero");
  const order = ["mobile", "web", "marketing", "technology", "product", "brand"];
  for (let index = order.indexOf(await hero.getAttribute("data-scene")); index > 0; index--) {
    await page.locator(".scene-flight").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "Previous scene" }).click();
    await hero.and(page.locator(`[data-scene='${order[index - 1]}']`)).waitFor();
    await page.locator(".scene-flight").waitFor({ state: "hidden" });
    await page.waitForTimeout(350);
  }
  await page.mouse.move(2, 2);
}

async function screenshot(name, viewport, path = "/", mobile = false, fullPage = false) {
  const context = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile,
    reducedMotion: fullPage ? "reduce" : "no-preference" });
  try {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    if (path === "/") await page.addInitScript(() => {
      window.captureMetrics = { lcp: null, shifts: 0, errors: [] };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.captureMetrics.lcp = entry.startTime;
          window.captureMetrics.lcpElement = entry.element?.className || entry.element?.tagName;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.captureMetrics.shifts += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      window.addEventListener("error", (event) => { if (event.message) window.captureMetrics.errors.push(event.message); });
    });
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    if (path === "/") {
      await page.locator('.hero-art [data-renderer="webgl"]').waitFor({ timeout: 25_000 });
      await page.waitForTimeout(450);
      const metrics = await page.evaluate(async () => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const intervals = [];
        await new Promise((resolve) => {
          let first;
          let previous;
          const sample = (now) => {
            first ??= now;
            if (previous !== undefined) intervals.push(now - previous);
            previous = now;
            if (now - first < 850) requestAnimationFrame(sample);
            else resolve();
          };
          requestAnimationFrame(sample);
        });
        const frameRate = intervals.length * 1000 / intervals.reduce((total, value) => total + value, 0);
        return { ...window.captureMetrics, frameRate, domContentLoaded: navigation.domContentLoadedEventEnd };
      });
      timings.push({ name, viewport, lcpMs: round(metrics.lcp), layoutShiftSum: round(metrics.shifts),
        domContentLoadedMs: round(metrics.domContentLoaded), softwareFrameSampleFps: round(metrics.frameRate),
        lcpElement: metrics.lcpElement ?? null,
        browserErrors: [...new Set([...metrics.errors, ...consoleErrors])] });
      await showOpeningScene(page);
      await page.locator('.hero-art [data-renderer="webgl"]').waitFor({ timeout: 35_000 });
    }
    await page.screenshot({ path: `${output}/${name}.png`, fullPage });
    console.log(`Saved ${name}.png`);
  } finally {
    await context.close();
  }
}

try {
  if (!process.argv.includes("--record-only")) {
    await screenshot("home-desktop", { width: 1440, height: 960 });
    await screenshot("home-mobile", { width: 390, height: 844 }, "/", true);
    for (const service of ["app-development", "web-development", "digital-marketing"]) {
      await screenshot(`${service}-desktop`, { width: 1440, height: 960 }, `/services/${service}`);
      await screenshot(`${service}-mobile`, { width: 390, height: 844 }, `/services/${service}`, true);
    }
    await screenshot("one-search-mobile", { width: 390, height: 844 }, "/products/one-search", true, true);
    await writeFile(`${output}/performance.json`, JSON.stringify({
      conditions: "Local production server, headless Chrome, software WebGL, no network or CPU throttling. Layout shifts are summed before input. No field Web Vitals or INP measurement.",
      browser: browser.version(),
      visits: timings,
    }, null, 2) + "\n");
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 820 }, recordVideo: { dir: ".preview/video", size: { width: 1280, height: 820 } } });
  const page = await context.newPage();
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator('.hero-art [data-renderer="webgl"]').waitFor({ timeout: 25_000 });
    await showOpeningScene(page);
    await page.waitForTimeout(450);
    await page.getByRole("button", { name: "Show scene 02, Web Development" }).click();
    await page.locator(".cinematic-hero[data-scene='web']").waitFor();
    await page.locator(".scene-flight").waitFor({ state: "hidden" });
    await page.waitForTimeout(1_100);
    await page.getByRole("button", { name: "Show scene 03, Digital Marketing" }).click();
    await page.locator(".cinematic-hero[data-scene='marketing']").waitFor();
    await page.locator(".scene-flight").waitFor({ state: "hidden" });
    await page.waitForTimeout(1_100);
    await page.getByRole("button", { name: "Show scene 05, Our Digital Products" }).click();
    await page.locator(".cinematic-hero[data-scene='product']").waitFor();
    await page.locator(".scene-flight").waitFor({ state: "hidden" });
    await page.waitForTimeout(900);
  } finally {
    const video = page.video();
    await context.close();
    if (video) await video.saveAs(`${output}/homepage-transition.webm`);
  }

  const demoContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: ".preview/video", size: { width: 1280, height: 900 } },
  });
  const demo = await demoContext.newPage();
  try {
    await demo.goto(base + "/products/one-search", { waitUntil: "networkidle" });
    await demo.getByRole("link", { name: "Explore the app" }).click();
    await demo.locator("#one-search-tour").evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
    const stage = demo.locator(".product-experience");
    await stage.locator('[data-renderer="webgl"]').waitFor({ timeout: 25_000 });
    await demo.waitForTimeout(850);
    await demo.screenshot({ path: `${output}/one-search-desktop.png` });
    await demo.getByRole("tab", { name: "Flight" }).click();
    await demo.waitForTimeout(850);
    await demo.getByRole("tab", { name: "RTO" }).click();
    await demo.getByRole("button", { name: "Vehicle lookup", exact: true }).click();
    await demo.waitForTimeout(1100);
    await demo.screenshot({ path: `${output}/one-search-vehicle-lookup.png` });
  } finally {
    const video = demo.video();
    await demoContext.close();
    if (video) await video.saveAs(`${output}/one-search-demo.webm`);
  }
} finally {
  await browser.close();
}
