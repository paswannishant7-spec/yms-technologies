import { z } from "zod";

export const enquiryKinds = ["project", "general", "support", "careers", "deletion"] as const;
export type EnquiryKind = (typeof enquiryKinds)[number];
export const projectAreas = ["Mobile App Development", "Web Development", "Digital Marketing", "I’m exploring options"] as const;
export const supportAreas = ["Railway", "Flight", "RTO", "Other"] as const;

const cleanText = (min: number, max: number) =>
  z.string().trim().min(min).max(max).refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value));

export const enquirySchema = z.object({
  kind: z.enum(enquiryKinds),
  requestId: z.uuid(),
  name: cleanText(2, 100).refine((value) => !/[\r\n]/.test(value)),
  email: z.email().max(254),
  area: z.string().max(100),
  message: cleanText(12, 2400),
  companyWebsite: z.literal(""),
  consent: z.literal(true),
}).strict().superRefine(({ kind, area }, ctx) => {
  const allowed: readonly string[] = kind === "project" ? projectAreas : kind === "support" ? supportAreas : [""];
  if (!allowed.includes(area)) ctx.addIssue({ code: "custom", path: ["area"], message: "Choose a valid enquiry topic." });
});
