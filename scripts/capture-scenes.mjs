import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";
const size = 760;
const sceneIds = ["mobile", "web", "marketing", "technology", "product", "brand"];
const selection = process.argv.slice(2);
if (selection.some((id) => !sceneIds.includes(id))) throw new Error("Choose known scene IDs.");
const ids = selection.length ? selection : sceneIds;
try {
  await mkdir("public/media", { recursive: true });
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => console.error(error.message));
  for (const id of ids) {
    await page.goto(`${base}/scene-preview/${id}`, { waitUntil: "networkidle", timeout: 120_000 });
    await page.locator('[data-renderer="capture-ready"]').waitFor({ timeout: 45_000 });
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".scene-canvas")).opacity === "1");
    const render = await page.screenshot({ omitBackground: true, animations: "disabled" });
    await sharp(render).webp({ quality: 90, alphaQuality: 96 }).toFile(`public/media/scene-${id}.webp`);
    console.log(`Captured ${id}`);
  }
  const arch = await sharp("public/media/architecture.svg").resize(1200, 630, { fit: "cover" }).toBuffer();
  const mark = await sharp("public/media/yms-navigation-derivative.webp").resize(250).png().toBuffer();
  const phone = await sharp("public/media/scene-mobile.webp").resize(650).extract({ left: 0, top: 10, width: 650, height: 630 }).png().toBuffer();
  const typeset = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <path d="M70 194h62" stroke="#EA173C" stroke-width="5"/>
    <text x="70" y="290" fill="#F4F6FA" font-size="78" font-weight="800" font-family="Arial,sans-serif">TECHNOLOGY</text>
    <text x="70" y="384" fill="#F4F6FA" font-size="78" font-weight="800" font-family="Arial,sans-serif">IN MOTION.</text>
    <text x="72" y="457" fill="#B1C8EC" font-size="27" font-family="Arial,sans-serif">YMS Technologies</text>
  </svg>`);
  await sharp(arch).composite([{ input: phone, left: 550, top: 0 }, { input: mark, left: 59, top: 34 }, { input: typeset }])
    .webp({ quality: 90 }).toFile("public/media/social.webp");
} finally {
  await browser.close();
}
