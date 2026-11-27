import { expect, test } from "@playwright/test";
import { productScreens } from "../src/content/one-search";

const product = "/products/one-search";
const privacy = `${product}/privacy-policy`;

test("every product image decodes at its documented dimensions and remains inspectable", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const screen of productScreens) expect((await request.get(screen.image)).status(), screen.id).toBe(200);
  await page.goto(product);
  const cards = page.locator(".gallery-card");
  await expect(cards).toHaveCount(productScreens.length);
  const dimensions = await cards.locator("img").evaluateAll(async (images) => Promise.all(images.map(async (element) => {
    const image = element as HTMLImageElement;
    image.loading = "eager";
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  })));
  expect(dimensions).toEqual(productScreens.map(({ width, height }) => [width, height]));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("tab", { name: "Railway" }).click();
    await page.getByRole("button", { name: "Train results", exact: true }).click();
    await expect(page.locator('[data-readable-screen="rail-results"] img')).toBeVisible();
    await page.getByRole("tab", { name: "Flight" }).click();
    await page.getByRole("button", { name: "Route details", exact: true }).click();
    await expect(page.locator('[data-readable-screen="flight-details"] img')).toBeVisible();
    await page.getByRole("tab", { name: "RTO" }).click();
    await page.getByRole("button", { name: "Vehicle lookup", exact: true }).click();
    await expect(page.locator('[data-readable-screen="vehicle-search"] img')).toBeVisible();
  }
  const gallery = page.locator(".one-search-gallery");
  await gallery.getByRole("button", { name: "Flight", exact: true }).click();
  await expect(cards).toHaveCount(3);
  const trigger = gallery.getByRole("button", { name: "Inspect Route results" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Route results" });
  await expect(dialog.getByRole("img")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog", { name: "Route details" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("route loader follows each destination and leaves same-page interactions usable", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const read = () => {
      const loader = document.querySelector<HTMLElement>(".route-transition");
      const kind = loader?.dataset.loader;
      if (kind) sessionStorage.setItem(`seen-loader-${kind}`, "true");
    };
    new MutationObserver(read).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-loader"] });
  });
  await page.goto("/about");
  await page.waitForFunction(() => performance.getEntriesByType("navigation").length > 0);
  for (const [path, name, kind] of [
    ["/", "YMS Technologies home", "orbit"], ["/services/app-development", "Mobile App Development", "liquid"],
    ["/services/web-development", "Web Development", "square"], ["/services/digital-marketing", "Digital Marketing", "chase"],
    ["/products/one-search", "One Search", "battery"], ["/about", "About", "bounce"],
  ]) {
    const header = page.locator("header.site-header");
    if (await header.locator(`a[href="${path}"]:visible`).count() === 0) {
      const menu = path === product ? /products/i : /services/i;
      await header.getByRole("button", { name: menu }).first().click();
    }
    const link = header.locator(`a[href="${path}"]:visible`).first();
    await expect(link, name).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${path === "/" ? "^http[^/]+//[^/]+/" : path}$`));
    await expect.poll(() => page.evaluate((key) => sessionStorage.getItem(`seen-loader-${key}`), kind)).toBe("true");
    await expect(page.locator(".route-transition")).toHaveCount(0);
    if (path === product) {
      await page.getByRole("link", { name: "Browse screenshots" }).click();
      await expect(page).toHaveURL(/#one-search-gallery$/);
      await expect(page.locator(".route-transition")).toHaveCount(0);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const contact = page.locator('a[href="/contact"]:visible').first();
  await contact.click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator(".route-transition")).toHaveCount(0);
});

test("privacy remains gated or opens its independent interactive draft on loopback", async ({ page, request, browser, baseURL }) => {
  const enabled = process.env.YMS_LOCAL_PRIVACY_PREVIEW === "true";
  const response = await request.get(privacy);
  expect(response.status()).toBe(enabled ? 200 : 404);
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  if (!enabled) return;
  const failedMedia: string[] = [];
  page.on("response", res => { if (res.url().includes(`${privacy}/`) && res.status() >= 400) failedMedia.push(res.url()); });
  await page.goto(`${product}#one-search-help`);
  await page.getByRole("link", { name: /Privacy Policy/ }).first().click();
  await expect(page.locator('.route-transition[data-privacy="true"]')).toHaveAttribute("data-loader", "battery");
  await expect(page).toHaveURL(new RegExp(`${privacy}$`));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Draft 0\.1/i).first()).toBeVisible();
  await expect(page.getByRole("img", { name: /Animated abstract privacy network/i })).toBeVisible();
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Policy", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${privacy}/privacy-policy$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/privacy policy/i);
  expect(failedMedia).toEqual([]);
  await page.getByRole("link", { name: "Return to One Search" }).click();
  await expect(page).toHaveURL(new RegExp(`${product}$`));
  const staticContext = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const staticPage = await staticContext.newPage();
    await staticPage.goto(privacy);
    await expect(staticPage.getByText("Introduction and privacy commitment").last()).toBeVisible();
  } finally { await staticContext.close(); }
});
