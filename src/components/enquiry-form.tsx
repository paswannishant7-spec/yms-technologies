"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { enquirySchema, projectServices, supportAreas, type EnquiryKind } from "@/content/enquiries";

export function EnquiryForm({ initialKind: kind, available, email, privacyHref }: { initialKind: EnquiryKind; available: boolean; email?: string; privacyHref?: string }) {
  const [state, setState] = useState<{ status: "idle" | "pending" | "success" | "error"; message: string }>({ status: "idle", message: "" });
  const id = useId();
  const activeRequest = useRef<{ fingerprint: string; id: string } | null>(null);
  const pending = useRef(false);
  const topics = kind === "support" ? supportAreas : [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || pending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (key: string) => data.get(key)?.toString() ?? "";
    const services = data.getAll("services").map(String);
    if (kind === "project" && !services.length) {
      setState({ status: "error", message: "Select at least one service." });
      form.querySelector<HTMLInputElement>('input[name="services"]')?.focus();
      return;
    }
    const fields = {
      kind,
      name: data.get("name")?.toString() ?? "",
      email: data.get("email")?.toString().trim() ?? "",
      area: kind === "project" ? services[0] : read("area"),
      message: data.get("message")?.toString() ?? "",
      companyWebsite: data.get("companyWebsite")?.toString() ?? "",
      consent: data.get("consent") === "on",
      ...(kind === "project" && { project: { company: read("company"), phone: read("phone"), services, budget: read("budget"), timeline: read("timeline") } }),
    };
    const fingerprint = JSON.stringify(fields);
    if (activeRequest.current?.fingerprint !== fingerprint) activeRequest.current = { fingerprint, id: crypto.randomUUID() };
    const parsed = enquirySchema.safeParse({ ...fields, requestId: activeRequest.current.id });
    if (!parsed.success) {
      setState({ status: "error", message: "Check your contact details, service selections, project description and permission to reply." });
      return;
    }
    pending.current = true;
    setState({ status: "pending", message: "Sending your enquiry…" });
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(12_000),
      });
      const { message } = await response.json() as { message: string };
      if (response.ok) {
        form.reset();
        activeRequest.current = null;
      }
      setState({ status: response.ok ? "success" : "error", message });
    } catch {
      setState({ status: "error", message: "Delivery could not be confirmed. Please try again." });
    } finally {
      pending.current = false;
    }
  }

  return (
    <form className="enquiry-form" onSubmit={submit} aria-label={kind === "support" ? "One Search support enquiry" : "Send an enquiry"}>
      {!available && <p className="form-notice">Online submissions are currently unavailable.{email && <> You can email <a href={`mailto:${email}`}>{email}</a>.</>}</p>}
      <fieldset disabled={state.status === "pending"} aria-describedby={`${id}-feedback`}>
        <div className="form-row">
          <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        </div>
        {kind === "project" && <>
          <div className="form-row">
            <label>Company name <small>Optional</small><input name="company" autoComplete="organization" maxLength={100} /></label>
            <label>Phone number <small>Optional</small><input name="phone" type="tel" autoComplete="tel" maxLength={32} /></label>
          </div>
          <fieldset className="project-services">
            <legend>Service requirements <small>Select at least one</small></legend>
            <div>{projectServices.map((service) => <label key={service}><input type="checkbox" name="services" value={service} />{service}</label>)}</div>
          </fieldset>
          <div className="form-row">
            <label>Estimated budget <small>Optional</small><input name="budget" maxLength={80} /></label>
            <label>Preferred timeline <small>Optional</small><input name="timeline" maxLength={80} /></label>
          </div>
        </>}
        {topics.length > 0 && <label>{kind === "support" ? "App section" : "What are you exploring?"}
          <select key={kind} name="area" defaultValue="" required>
            <option value="" disabled>Select a topic</option>
            {topics.map((topic) => <option key={topic}>{topic}</option>)}
          </select>
        </label>}
        <label>{kind === "project" ? "Project description" : "How can we help?"}
          <textarea name="message" required minLength={12} maxLength={2400} rows={5} aria-describedby={`${id}-message`} />
        </label>
        <p id={`${id}-message`} className="small-copy">Leave out passwords, payment details and identity documents.</p>
        <div className="form-trap" aria-hidden="true"><label>Website<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="form-consent"><input name="consent" type="checkbox" required /><span>You may use these details to respond to my enquiry.{privacyHref && <> See the <a href={privacyHref}>corporate privacy notice</a>.</>}</span></label>
        <button type="submit" disabled={!available || state.status === "pending"} className="button button-solid">{state.status === "pending" ? "Sending…" : "Send enquiry"}</button>
      </fieldset>
      <p id={`${id}-feedback`} className={`form-feedback ${state.status}`} role="status" aria-atomic="true">{state.message}</p>
    </form>
  );
}
