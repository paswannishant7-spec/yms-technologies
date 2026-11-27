import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const output = "public/media";
const logo = "references/yms-technologies-logo.jpeg";
const product = "product-assets/";
await mkdir(output, { recursive: true });
if (!process.argv.includes("--nav-only")) await Promise.all([
  sharp(logo).resize(850).webp({ quality: 91 }).toFile(`${output}/yms-identity.webp`),
  sharp(`${product}ONE_SEARCH_LOGO.jpeg`).resize(400).webp({ quality: 93 }).toFile(`${output}/one-search-logo.webp`),
  ...[
    ["App Refrencee.jpeg", "railway", 1521],
    ["App Refrencee.jpeg.jpeg", "flight", 1131],
    ["App Refrencee.jpeg (2).jpeg", "rto", 991],
  ].map(([filename, id, height]) => sharp(product + filename)
    .extract({ left: 0, top: 62, width: 720, height }).resize(600).webp({ quality: 88 })
    .toFile(`${output}/one-search-${id}.webp`)),
]);

const { data, info } = await sharp(logo).removeAlpha()
  .extract({ left: 173, top: 315, width: 925, height: 460 }).raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = y * info.width + x;
    const red = data[i * 3];
    const green = data[i * 3 + 1];
    const blue = data[i * 3 + 2];
    const letterRegion = y > 155 && y < 446 && (y < 300 || x < 795);
    const letters = letterRegion && red > 87 && green > 86 && blue - red < 52 && red - green < 62 && blue > red * 0.77;
    const crimson = (y < 156 && x > 530 && x < 808 || y > 154 && y < 300 && x < 255)
      && red > 100 && red > green * 1.35 && red > blue * 1.23;
    rgba[i * 4] = red;
    rgba[i * 4 + 1] = green;
    rgba[i * 4 + 2] = blue;
    rgba[i * 4 + 3] = letters || crimson ? Math.min(255, Math.max(red, green) * 3 - 230) : 0;
  }
}
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize(330).webp({ lossless: true }).toFile(`${output}/yms-navigation-derivative.webp`);

const daylight = Buffer.from(rgba);
for (let i = 0; i < daylight.length; i += 4) {
  const [red, green, blue] = [daylight[i], daylight[i + 1], daylight[i + 2]];
  if (red > green * 1.35 && red > blue * 1.23) continue;
  [daylight[i], daylight[i + 1], daylight[i + 2]] = [12, 29, 53];
}
await sharp(daylight, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize(300).webp({ lossless: true }).toFile(`${output}/yms-navigation-light.webp`);
