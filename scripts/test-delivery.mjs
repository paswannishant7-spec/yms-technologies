import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rmdir, unlink } from "node:fs/promises";
import https from "node:https";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";

const folder = await mkdtemp(join(tmpdir(), "yms-test-delivery-"));
const key = join(folder, "key.pem");
const cert = join(folder, "cert.pem");
let receiver;
let app;
try {
  execFileSync(process.env.OPENSSL_BIN ?? "openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-noenc", "-days", "1",
    "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1", "-keyout", key, "-out", cert,
  ], { stdio: "ignore" });
  const deliveries = new Map();
  const token = randomUUID();
  receiver = https.createServer({ key: await readFile(key), cert: await readFile(cert) }, async (request, response) => {
    try {
      assert.equal(request.headers.authorization, `Bearer ${token}`);
      let body = "";
      for await (const chunk of request) body += chunk.toString("utf-8");
      const payload = JSON.parse(body);
      assert.equal(payload.requestId, request.headers["idempotency-key"]);
      assert.equal(Object.hasOwn(payload, "companyWebsite"), false);
      if (payload.message.includes("expected receiver failure")) {
        response.writeHead(500).end();
        return;
      }
      deliveries.set(payload.requestId, payload);
      response.writeHead(202).end();
    } catch {
      response.writeHead(400).end();
    }
  });
  await new Promise((ready, fail) => receiver.listen(0, "127.0.0.1", ready).on("error", fail));
  const port = process.env.YMS_DELIVERY_TEST_PORT ?? "3136";
  const origin = `http://127.0.0.1:${port}`;
  app = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", port], {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", SITE_URL: "", FORM_CLIENT_IP_HEADER: "",
      NODE_EXTRA_CA_CERTS: cert, FORM_DELIVERY_URL: `https://127.0.0.1:${receiver.address().port}/deliver`,
      FORM_DELIVERY_TOKEN: token, RATE_LIMIT_REST_URL: "", RATE_LIMIT_REST_TOKEN: "",
    },
    stdio: ["ignore", "inherit", "inherit"],
  });
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (app.exitCode !== null) throw new Error("Local test app exited");
    try { ready = (await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok; } catch {}
    if (ready) break;
    await setTimeout(250);
  }
  assert.ok(ready, "test app started on loopback");
  const base = {
    kind: "project", requestId: randomUUID(), name: "Example QA",
    email: "qa@example.test", area: "Mobile App Development", message: "Synthetic project enquiry for end-to-end QA.",
    companyWebsite: "", consent: true,
  };
  const submit = (fields) => fetch(`${origin}/api/enquiries`, {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(fields),
  });
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? "chrome" });
  let received;
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, reducedMotion: "reduce" });
    await page.goto(origin + "/contact");
    const button = page.getByRole("button", { name: "Send enquiry" });
    await button.click();
    assert.equal(await page.locator('input[name="name"]').evaluate((input) => input.validity.valueMissing), true);
    assert.equal(deliveries.size, 0);
    await page.getByLabel("Full name").fill(base.name);
    await page.getByLabel("Email address").fill(base.email);
    await page.locator('input[name="company"]').fill("Example Company");
    await page.locator('input[name="phone"]').fill("+1 555 0100");
    await page.locator('input[name="budget"]').fill("Exploring budgets");
    await page.locator('input[name="timeline"]').fill("Next quarter");
    await page.getByLabel("Project description").fill(base.message);
    await page.getByLabel(/You may use these details/).check();
    await button.click();
    await page.getByText("Select at least one service.", { exact: true }).waitFor();
    await page.getByRole("checkbox", { name: "Mobile App Development" }).check();
    await page.getByRole("checkbox", { name: "Web Development" }).check();
    await button.click();
    await page.getByText("Your enquiry was received.", { exact: true }).waitFor();
    received = Array.from(deliveries.values())[0];
    assert.equal(received.email, base.email);
    assert.deepEqual(received.project.services, ["Mobile App Development", "Web Development"]);
    assert.equal(received.project.company, "Example Company");
    if (process.env.CONTACT_SCREENSHOTS === "true") {
      await mkdir("artifacts/lock", { recursive: true });
      for (const [label, viewport] of [["desktop", { width: 1440, height: 1050 }], ["mobile", { width: 390, height: 844 }]]) {
        await page.setViewportSize(viewport);
        await page.goto(origin + "/contact");
        await page.locator(".contact-art img").evaluate((image) => image.decode());
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
        await page.screenshot({ path: `artifacts/lock/contact-${label}.png`, fullPage: true });
      }
    }
  } finally { await browser.close(); }
  assert.equal((await submit({ ...base, requestId: received.requestId, project: received.project })).status, 202);
  assert.equal(deliveries.size, 1);
  const support = { ...base, requestId: randomUUID(), kind: "support", area: "Railway" };
  assert.equal((await submit(support)).status, 202);
  assert.equal(deliveries.get(support.requestId)?.kind, "support");
  const rejected = await submit({ ...base, requestId: randomUUID(), message: "This is an expected receiver failure." });
  assert.equal(rejected.status, 502);
  assert.match((await rejected.json()).message, /could not be confirmed/);
  for (const attempt of [5, 6]) assert.equal((await submit({ ...base, requestId: randomUUID() })).status, 202, `request ${attempt}`);
  const limited = await submit({ ...base, requestId: randomUUID() });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "600");
  console.log("HTTPS forwarding, idempotency header, downstream error and rate limiting passed.");
} finally {
  app?.kill();
  receiver?.close();
  await Promise.allSettled([unlink(key), unlink(cert)]);
  await rmdir(folder);
}
