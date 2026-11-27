import { NextResponse } from "next/server";
import { business } from "@/content/business";
import { enquirySchema } from "@/content/enquiries";
import { deliverySettings, enabledKind, projectDeliveryAvailable, readEnquiry, withinEnquiryLimit } from "@/server/enquiries";

function reply(status: number, message: string, retry = false) {
  return NextResponse.json({ message }, {
    status,
    headers: { "Cache-Control": "no-store", ...(retry && { "Retry-After": "600" }) },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host")?.toLowerCase();
  const loopback = host && /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host) ? `http://${host}` : undefined;
  const expected = business.origin ?? loopback;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!expected || origin !== expected || (fetchSite && fetchSite !== "same-origin")) {
    return reply(403, "Open the enquiry page on this website and try again.");
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply(415, "This enquiry requires JSON.");
  }

  let body: unknown;
  try {
    body = await readEnquiry(request);
  } catch (error) {
    return error instanceof RangeError ? reply(413, "The enquiry is too large.") : reply(400, "The enquiry could not be read.");
  }
  const enquiry = enquirySchema.safeParse(body);
  if (!enquiry.success) return reply(422, "Check the name, email, topic, enquiry and permission to reply.");
  const { kind, requestId, name, email, area, message, project } = enquiry.data;
  if (!enabledKind(kind)) return reply(404, "This enquiry type is unavailable.");

  const delivery = deliverySettings();
  if (!delivery || (kind === "project" && !projectDeliveryAvailable())) return reply(503, "Online submissions are currently unavailable.");
  try {
    if (!await withinEnquiryLimit(request)) return reply(429, "Too many enquiries. Please try again in a few minutes.", true);
    const sent = await fetch(delivery.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${delivery.token}`,
        "Idempotency-Key": requestId,
      },
      body: JSON.stringify({ requestId, kind, name, email, area, message, consent: true, ...(project && { project }) }),
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    if (!sent.ok) return reply(502, "Delivery could not be confirmed. Please try again.");
    return reply(202, "Your enquiry was received.");
  } catch {
    return reply(503, "Delivery could not be confirmed. Please try again.");
  }
}
