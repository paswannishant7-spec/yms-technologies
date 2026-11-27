import assert from "node:assert/strict";
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
  for (let attempt = 0; attempt < 40; attempt++) {
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
  const accepted = await submit(base);
  assert.equal(accepted.status, 202);
  assert.equal((await accepted.json()).message, "Your enquiry was received.");
  assert.equal(deliveries.get(base.requestId)?.email, base.email);
  assert.equal((await submit(base)).status, 202);
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
