import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const source = "product-assets/one-search-ui";
const output = "public/media/one-search-ui";
await mkdir(output, { recursive: true });
const assets = [
  ["railway", "Android Compact - 35.png", 668],
  ["flight", "Android Compact - 34.png", 668],
  ["vehicle-search", "Vehicle Search.png"],
  ["transport-art", "Group 2147223793.png"],
  ["home", "Home Revised.png"],
  ["home-services", "Android Compact - 26.png"],
  ["vehicle-services", "Section - Promotional Banner.png"],
  ["traffic-rules-card", "Group 18.png"],
  ["rail-tools", "Frame 65.png"],
  ["welcome", "app-welcome.png"],
  ["rail-results", "rail-results.png"],
  ["rail-timetable", "rail-timetable.png"],
  ["rail-stations", "rail-stations.png"],
  ["flight-results", "flight-results.png"],
  ["flight-details", "flight-details.png"],
];

for (const [id, filename, height] of assets) {
  const input = sharp(`${source}/${filename}`);
  const image = height ? input.extract({ left: 0, top: 0, width: 360, height }) : input;
  await image.webp({ quality: 93, alphaQuality: 98 }).toFile(`${output}/${id}.webp`);
}
