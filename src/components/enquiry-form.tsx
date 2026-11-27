"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { enquirySchema, projectAreas, supportAreas, type EnquiryKind } from "@/content/enquiries";

export function EnquiryForm({ initialKind, available, email }: { initialKind: EnquiryKind; available: boolean; email?: string }) {
  const [kind, setKind] = useState(initialKind);
  const [state, setState] = useState<{ status: "idle" | "pending" | "success" | "error"; message: string }>({ status: "idle", message: "" });
  const id = useId();
  const activeRequest = useRef<{ fingerprint: string; id: string } | null>(null);
  const topics = kind === "project" ? projectAreas : kind === "support" ? supportAreas : [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || state.status === "pending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = {
      kind,
      name: data.get("name")?.toString() ?? "",
      email: data.get("email")?.toString().trim() ?? "",
      area: data.get("area")?.toString() ?? "",
      message: data.get("message")?.toString() ?? "",
      companyWebsite: data.get("companyWebsite")?.toString() ?? "",
      consent: data.get("consent") === "on",
    };
    const fingerprint = JSON.stringify(fields);
    if (activeRequest.current?.fingerprint !== fingerprint) activeRequest.current = { fingerprint, id: crypto.randomUUID() };
    const parsed = enquirySchema.safeParse({ ...fields, requestId: activeRequest.current.id });
    if (!parsed.success) {
      setState({ status: "error", message: "Check the name, email, topic, enquiry and permission to reply." });
      return;
    }
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
    }
  }

  return (
    <form className="enquiry-form" onSubmit={submit} aria-label={initialKind === "support" ? "One Search support enquiry" : "Send an enquiry"}>
      {!available && <p className="form-notice">Online submissions are currently unavailable.{email && <> You can email <a href={`mailto:${email}`}>{email}</a>.</>}</p>}
      <fieldset disabled={!available || state.status === "pending"} aria-describedby={`${id}-feedback`}>
        {initialKind === "project" && (
          <label>Enquiry type
            <select value={kind} onChange={(event) => setKind(event.target.value as EnquiryKind)}>
              <option value="project">Project enquiry</option>
              <option value="general">General enquiry</option>
            </select>
          </label>
        )}
        <div className="form-row">
          <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        </div>
        {topics.length > 0 && <label>{kind === "support" ? "App section" : "What are you exploring?"}
          <select key={kind} name="area" defaultValue="" required>
            <option value="" disabled>Select a topic</option>
            {topics.map((topic) => <option key={topic}>{topic}</option>)}
          </select>
        </label>}
        <label>{kind === "project" ? "Tell us about the project" : "How can we help?"}
          <textarea name="message" required minLength={12} maxLength={2400} rows={5} aria-describedby={`${id}-message`} />
        </label>
        <p id={`${id}-message`} className="small-copy">Leave out passwords, payment details and identity documents.</p>
        <div className="form-trap" aria-hidden="true"><label>Website<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="form-consent"><input name="consent" type="checkbox" required /> You may use these details to respond to my enquiry.</label>
        <button type="submit" className="button button-solid">{state.status === "pending" ? "Sending…" : "Send enquiry"}</button>
      </fieldset>
      <p id={`${id}-feedback`} className={`form-feedback ${state.status}`} role="status" aria-atomic="true">{state.message}</p>
    </form>
  );
}
