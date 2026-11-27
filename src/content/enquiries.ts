import { z } from "zod";

export const enquiryKinds = ["project", "general", "support", "careers", "deletion"] as const;
export type EnquiryKind = (typeof enquiryKinds)[number];
export const projectAreas = ["Mobile App Development", "Web Development", "Digital Marketing", "I’m exploring options"] as const;
export const projectServices = ["Mobile App Development", "Web Development", "Digital Marketing", "Other Requirements"] as const;
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
  project: z.object({
    company: cleanText(0, 100),
    phone: z.string().trim().max(32).regex(/^[+\d(). -]*$/),
    services: z.array(z.enum(projectServices)).min(1, "Select at least one service.").max(projectServices.length)
      .refine((services) => new Set(services).size === services.length),
    budget: cleanText(0, 80),
    timeline: cleanText(0, 80),
  }).strict().optional(),
}).strict().superRefine(({ kind, area, project }, ctx) => {
  if (project && (kind !== "project" || project.services[0] !== area)) {
    ctx.addIssue({ code: "custom", path: ["project", "services"], message: "Choose valid project services." });
  }
  const allowed: readonly string[] = kind === "project" ? (project ? projectServices : projectAreas) : kind === "support" ? supportAreas : [""];
  if (!allowed.includes(area)) ctx.addIssue({ code: "custom", path: ["area"], message: "Choose a valid enquiry topic." });
});
