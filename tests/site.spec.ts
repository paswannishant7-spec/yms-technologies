import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { publishedPaths, pagePaths } from "../src/content/pages";

test("the selected preview expands from its measured card and activates live 3D", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto("/");
  await page.getByRole("button", { name: "Pause autoplay" }).click();
  const scene = page.locator(".cinematic-hero");
  await expect(scene.locator('[data-renderer="webgl"]')).toHaveCount(1, { timeout: 25_000 });
  const object = scene.locator("canvas");
  const bounds = (await object.boundingBox())!;
  const clip = { x: bounds.x + bounds.width / 2 - 65, y: bounds.y + bounds.height / 2 - 65, width: 130, height: 130 };
  const before = await page.screenshot({ clip });
  await page.mouse.move(1040, 450);
  await page.waitForTimeout(280);
  expect((await page.screenshot({ clip })).equals(before)).toBe(false);

  const preview = page.getByRole("button", { name: "Show scene 02, Web Development" });
  const card = await preview.boundingBox();
  expect(card).toBeTruthy();
  const flight = scene.locator(".scene-flight");
  await flight.evaluate((element, sourceWidth) => {
    const sample = document.createElement("div").style;
    const observer = new MutationObserver((changes) => {
      for (const css of [element.getAttribute("style"), ...changes.map((change) => change.oldValue)]) {
        sample.cssText = css ?? "";
        if (sample.visibility === "visible" && Math.abs(parseFloat(sample.width) - sourceWidth) < 1.5 && parseFloat(sample.borderRadius) > 0) {
          element.setAttribute("data-observed-card-start", "true");
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe(element, { attributes: true, attributeOldValue: true, attributeFilter: ["style"] });
  }, card!.width);
  await preview.click();
  await expect(flight).toHaveAttribute("data-observed-card-start", "true");
  await expect(scene).toHaveAttribute("data-scene", "web");
  await expect(scene.getByRole("link", { name: "Explore Web Development" })).toHaveAttribute("href", "/services/web-development");
  await expect(scene.getByRole("heading", { name: "Websites that work beautifully." })).toBeVisible();
  await expect(flight).toBeHidden();
  await expect(flight).toHaveCSS("width", "1280px");
  await expect(flight).toHaveCSS("border-radius", "0px");
  await expect(scene.getByRole("button", { name: "Show scene 03, Digital Marketing" })).toBeFocused();
  await expect(scene.locator('[data-renderer="webgl"]')).toHaveCount(1, { timeout: 25_000 });
  expect(errors).toEqual([]);
});

test("keyboard controls loop all six scenes and reduced motion uses the poster", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scene = page.locator(".cinematic-hero");
  await expect(scene.getByRole("button", { name: "Pause autoplay" })).toHaveCount(0);
  await expect(scene.locator("canvas")).toHaveCount(0);
  await expect(scene.getByRole("heading", { name: "We Build. We Innovate. You Grow." })).toBeVisible();
  await expect(scene.getByRole("link", { name: "Explore Our Services" })).toHaveAttribute("href", "/services");
  await expect(scene.getByRole("link", { name: "Our Products" })).toHaveAttribute("href", "/products");
  await expect(scene.locator(".hero-poster")).toHaveJSProperty("naturalWidth", 760);
  await scene.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(scene).toHaveAttribute("data-scene", "brand");
  for (const id of ["mobile", "web", "marketing", "technology", "product", "brand", "mobile"]) {
    await page.keyboard.press("ArrowRight");
    await expect(scene).toHaveAttribute("data-scene", id);
  }
  await expect(scene.locator(".scene-flight")).toBeHidden();
});

test("the light design loads local fonts and leaves room for the mobile handwritten headline", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const report = await page.evaluate(async () => {
    await document.fonts.ready;
    const root = getComputedStyle(document.documentElement);
    const heading = document.querySelector<HTMLElement>(".hero-title")!;
    const ink = heading.querySelector<HTMLElement>("[data-ink]")!;
    const actions = document.querySelector<HTMLElement>(".hero-actions")!;
    const preview = document.querySelector<HTMLElement>(".hero-preview")!;
    const stage = document.querySelector<HTMLElement>(".hero-environment")!;
    const cta = document.querySelector<HTMLElement>(".nav-cta")!;
    const firstFamily = (value: string) => value.split(",")[0].trim().replace(/^["']|["']$/g, "");
    const loaded = new Set(Array.from(document.fonts)
      .filter((face) => face.status === "loaded").map((face) => firstFamily(face.family)));
    const uses = (element: HTMLElement, token: string) => {
      const family = firstFamily(root.getPropertyValue(token));
      return firstFamily(getComputedStyle(element).fontFamily) === family && loaded.has(family);
    };
    const luminance = (color: string) => color.match(/\d+/g)!.slice(0, 3).map((num) => Number(num) / 255)
      .reduce((sum, value, i) => sum + [.2126, .7152, .0722][i] * (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4), 0);
    const contrast = (fore: string, back: string) => (luminance(back) + .05) / (luminance(fore) + .05);
    const ctaStyle = getComputedStyle(cta);
    return {
      display: uses(heading, "--font-jakarta"),
      accent: uses(ink, "--font-caveat"),
      captionColor: getComputedStyle(ink).color,
      navBackground: getComputedStyle(document.querySelector(".site-header")!).backgroundColor,
      textContrast: contrast(getComputedStyle(ink).color, getComputedStyle(stage).backgroundColor) >= 4.5 &&
        contrast(ctaStyle.color, ctaStyle.backgroundColor) >= 4.5,
      inkFits: ink.getBoundingClientRect().right <= innerWidth,
      actionsFit: actions.getBoundingClientRect().bottom < preview.getBoundingClientRect().top,
    };
  });
  expect(report).toEqual({ display: true, accent: true, captionColor: "rgb(148, 102, 0)", navBackground: "rgb(255, 255, 255)",
    inkFits: true, actionsFit: true, textContrast: true });
});

test("rapid controls preserve the active scene and leave the next transition usable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pause autoplay" }).click();
  const gallery = page.locator(".cinematic-hero");
  await gallery.evaluate((element) => {
    const next = element.querySelector<HTMLButtonElement>("[data-next]")!;
    for (let press = 0; press < 5; press++) next.click();
  });
  await expect(gallery).toHaveAttribute("data-scene", "web");
  await expect(gallery.locator(".scene-flight")).toBeHidden();
  await expect(gallery.locator(".hero-art")).toHaveAttribute("data-current-render", "true");
  await gallery.getByRole("button", { name: "Next scene" }).click();
  await expect(gallery).toHaveAttribute("data-scene", "marketing");
});

test("the handwritten underline and scroll-driven process line animate", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return type.startsWith("webgl") ? null : Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Pause autoplay" }).click();
  const gallery = page.locator(".cinematic-hero");
  await gallery.evaluate((element) => {
    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        if (!(change.target instanceof SVGElement) || !change.target.matches("[data-underline]")) continue;
        if (parseFloat(change.target.style.strokeDashoffset) > 0 || /stroke-dashoffset:\s*1/.test(change.oldValue ?? "")) {
          element.setAttribute("data-verified-stroke", "true");
          observer.disconnect();
        }
      }
    });
    observer.observe(element, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["style"] });
  });
  await gallery.getByRole("button", { name: "Show scene 02, Web Development" }).click();
  await expect(gallery).toHaveAttribute("data-scene", "web");
  await expect(gallery).toHaveAttribute("data-verified-stroke", "true");
  const line = page.locator(".process-line");
  const scale = () => line.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a);
  await expect.poll(scale).toBeLessThan(.1);
  await page.locator(".process-band").evaluate((element) => element.scrollIntoView({ block: "start" }));
  await expect.poll(scale).toBeGreaterThan(.95);
});

test("autoplay advances, pauses and resumes", async ({ page }) => {
  await page.goto("/");
  const scene = page.locator(".cinematic-hero");
  await page.getByRole("button", { name: "Pause autoplay" }).click();
  const progress = scene.locator(".scene-progress span");
  const paused = await progress.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(500);
  expect(await progress.evaluate((el) => getComputedStyle(el).transform)).toBe(paused);
  await page.getByRole("button", { name: "Play scenes" }).click();
  await expect(scene).toHaveAttribute("data-scene", "web", { timeout: 18_000 });
});

test("mobile touch gesture changes scene and the navigation opens and closes", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    await page.goto("/");
    const client = await context.newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 298, y: 524 }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 108, y: 521 }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.locator(".cinematic-hero")).toHaveAttribute("data-scene", "web");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("button", { name: "Open services menu" }).click();
    await expect(primary.getByRole("link", { name: /App Development/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(primary.getByRole("button", { name: "Open services menu" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
  } finally {
    await context.close();
  }
});

test("missing WebGL retains the fallback render", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto("/");
  await expect(page.locator(".hero-art [data-renderer]")).toHaveAttribute("data-renderer", "poster");
  await expect(page.locator(".hero-poster")).toHaveJSProperty("naturalWidth", 760);
  await page.getByRole("button", { name: "Next scene" }).click();
  await expect(page.locator(".cinematic-hero")).toHaveAttribute("data-scene", "web");
  await expect(page.locator(".hero-art canvas")).toHaveCount(0);
});

test("responsive pages have no horizontal overflow at the six requested widths", async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1920, 1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 960 });
    for (const path of ["/", "/services/app-development", "/services/web-development", "/services/digital-marketing", "/products/one-search", "/contact"]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} at ${width}px`).toBeLessThanOrEqual(width);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  }
});

test("product tabs and the route transition work with keyboard navigation", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("link", { name: "Discover One Search" }).click();
  await expect(page).toHaveURL(/\/products\/one-search$/);
  await expect(page.getByRole("heading", { name: /One Search\. More possibilities/ })).toBeVisible();
  const stage = page.locator(".product-experience");
  await stage.scrollIntoViewIfNeeded();
  await expect(stage.locator('[data-renderer="webgl"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(stage.locator(".scene-canvas")).toHaveCSS("opacity", "1");
  const liveFrame = await stage.locator("canvas").screenshot();
  const pixels = await sharp(liveFrame).resize(210).removeAlpha().raw().toBuffer();
  let orange = 0;
  for (let i = 0; i < pixels.length; i += 3) {
    if (pixels[i] > 215 && pixels[i + 1] > 95 && pixels[i + 1] < 188 && pixels[i + 2] < 111) orange++;
  }
  expect(orange, "the provided orange Railway UI is visible on the live phone").toBeGreaterThan(60);
  const tab = page.getByRole("tab", { name: "Railway" });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Flight" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("look up flights");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "RTO" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("vehicle and transport information");
});

test("published pages have unique metadata and internal links resolve", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const titles = new Set();
  const descriptions = new Set();
  const internal = new Set<string>();
  for (const path of publishedPaths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    const title = await page.title();
    expect(title).toContain("YMS Technologies");
    titles.add(title);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    descriptions.add(description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    for (const href of await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")!))) internal.add(href);
  }
  expect(titles.size).toBe(publishedPaths.length);
  expect(descriptions.size).toBe(publishedPaths.length);
  expect([...internal].filter((href) => !publishedPaths.includes(href))).toEqual([]);
});

test("production hides drafts and leaves an unconfigured preview out of the sitemap", async ({ request }) => {
  for (const path of [...pagePaths.filter((route) => !publishedPaths.includes(route)), "/not-a-page", "/scene-preview/mobile"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(await response.text()).toContain("Page unavailable.");
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const content = await sitemap.text();
  expect(content).toContain("<urlset");
  expect(content).not.toContain("<loc>");
});

test("forms reject malformed or bot submissions and report unavailable delivery honestly", async ({ page, request, baseURL }) => {
  await page.goto("/contact");
  await expect(page.getByRole("button", { name: "Send enquiry" })).toBeDisabled();
  await expect(page.getByText("Online submissions are currently unavailable.")).toBeVisible();
  const data = { kind: "project", requestId: "cbaf539e-47ef-4456-9704-8f5d0d6677e3", name: "QA User", email: "qa@example.test",
    area: "Web Development", message: "Can we discuss a sample project?", companyWebsite: "", consent: true };
  const headers = { Origin: new URL(baseURL!).origin };
  const post = (body: unknown, origin = headers.Origin) => request.post("/api/enquiries", { headers: { Origin: origin }, data: body as object });
  expect((await post(data, "https://foreign.example.test")).status()).toBe(403);
  expect((await post({ ...data, email: "bad" })).status()).toBe(422);
  expect((await post({ ...data, companyWebsite: "filled" })).status()).toBe(422);
  expect((await post({ ...data, kind: "deletion", area: "" })).status()).toBe(404);
  expect((await post({ ...data, message: "a".repeat(12_000) })).status()).toBe(413);
  const unavailable = await post(data);
  expect(unavailable.status()).toBe(503);
  expect(await unavailable.json()).toEqual({ message: "Online submissions are currently unavailable." });
});
