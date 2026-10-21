// "Start a conversation" enquiries: validated server-side and delivered to the
// CliSo team through Gmail SMTP (EMAIL / EMAIL_PASSWORD app password).

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import nodemailer, { type Transporter } from "nodemailer";
import { z } from "zod";

const EnquirySchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(5000),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().max(0).optional().default(""),
});

export type EnquiryResult = { ok: true } | { ok: false; error: string };

/** Enquiry recipients. */
const RECIPIENTS = [
  "Swapnil.choure@clisomumbai.com",
  "Praanjal.agarwal@clisomumbai.com",
  "Business@clisomumbai.com",
];

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.delete(hits.keys().next().value!);
  return recent.length > MAX_PER_WINDOW;
}

let transport: Transporter | null = null;
function mailer() {
  const user = process.env.EMAIL;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) throw new Error("Email is not configured");
  transport ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return { transport, user };
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const sendEnquiry = createServerFn({ method: "POST" })
  .validator((d: unknown) => EnquirySchema.parse(d))
  .handler(async ({ data }): Promise<EnquiryResult> => {
    // Bots that fill the honeypot get a silent success.
    if (data.website) return { ok: true };

    const ip =
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      getRequestHeader("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return { ok: false, error: "Too many enquiries. Please try again in a few minutes." };
    }

    const name = data.name.replace(/[\r\n]+/g, " ");
    try {
      const { transport, user } = mailer();
      await transport.sendMail({
        from: { name: "CliSo Tech website", address: user },
        to: RECIPIENTS,
        replyTo: { name, address: data.email },
        subject: `Website enquiry from ${name}`,
        text: `New enquiry from the CliSo Tech contact page\n\nName: ${name}\nEmail: ${data.email}\n\n${data.message}`,
        html: `<p><b>New enquiry from the CliSo Tech contact page</b></p>
<p><b>Name:</b> ${escapeHtml(name)}<br><b>Email:</b> ${escapeHtml(data.email)}</p>
<p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`,
      });
      return { ok: true };
    } catch (err) {
      console.error("sendEnquiry failed:", err instanceof Error ? err.message : err);
      return {
        ok: false,
        error: "We couldn’t send your enquiry right now. Please try again shortly.",
      };
    }
  });
