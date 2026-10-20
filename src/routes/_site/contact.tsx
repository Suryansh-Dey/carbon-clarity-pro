import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Check, Cookie, FileText, Loader2, Lock, Send } from "lucide-react";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import { Eyebrow, GlassCard, Note, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendEnquiry } from "@/lib/contact.functions";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact CliSo Tech — Let’s turn your sustainability goals into action" },
      {
        name: "description",
        content:
          "Tell us where you are in your ESG journey, the locations and value chains involved, and the outcomes you want to achieve.",
      },
    ],
  }),
  component: ContactPage,
});

const POLICIES = [
  {
    icon: Lock,
    t: "Privacy policy",
    d: "Enquiries sent through this website are emailed to CliSo Tech and used only to respond to you. Do not enter sensitive personal information. A company-approved privacy policy and contact point will be published separately.",
  },
  {
    icon: FileText,
    t: "Terms of use",
    d: "Website content offers a general introduction and does not constitute a binding service offer. Project scope, deliverables and commercial terms must be agreed separately in writing.",
  },
  {
    icon: Cookie,
    t: "Cookie policy",
    d: "This version does not use analytics, advertising cookies or browser storage. The policy should be reviewed if additional services are introduced.",
  },
];

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Let’s turn your sustainability"
        accent="goals into action."
        description="Tell us where you are in your ESG journey, the locations and value chains involved, and the outcomes you want to achieve."
      />

      <Section className="pt-0 sm:pt-0">
        <EnquiryForm />
      </Section>

      <Section id="policies">
        <SectionHeading eyebrow="Our policies" title="Clarity builds trust." />
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {POLICIES.map((p) => (
            <StaggerItem key={p.t}>
              <Tilt className="h-full rounded-3xl">
                <GlassCard className="h-full space-y-4 p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-cosmic/80 text-lavender">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-sans text-lg font-semibold text-white">{p.t}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                </GlassCard>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
    </>
  );
}

function EnquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const payload = {
      name: String(d.get("name") ?? ""),
      email: String(d.get("email") ?? ""),
      message: String(d.get("message") ?? ""),
      website: String(d.get("website") ?? ""),
    };
    setState("sending");
    setError("");
    try {
      const res = await sendEnquiry({ data: payload });
      if (!res.ok) throw new Error(res.error);
      setSentTo(payload.email);
      setState("sent");
      formRef.current?.reset();
    } catch (err) {
      setState("idle");
      setError(enquiryError(err));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Reveal>
        <GlassCard className="h-full p-8 sm:p-10">
          <Eyebrow>Start a conversation</Eyebrow>
          <p className="mt-4 text-muted-foreground">
            Send an enquiry for business, consulting or media discussions.
          </p>
          <form ref={formRef} onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                name="name"
                required
                maxLength={120}
                autoComplete="name"
                className="h-11 bg-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                className="h-11 bg-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">How can we help?</Label>
              <Textarea
                id="message"
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                className="bg-white/[0.03]"
              />
            </div>
            {/* Honeypot: visually hidden and skipped by keyboard users */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-periwinkle text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgb(115_108_237/0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#8580f0] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {state === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {state === "sending" ? "Sending…" : "Send enquiry"}
            </button>
            <p role="alert" className="min-h-5 text-sm text-rose-300">
              {error}
            </p>
            <Note>
              Your enquiry is emailed to the CliSo Tech team. Do not include sensitive personal
              information.
            </Note>
          </form>
        </GlassCard>
      </Reveal>

      <div style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait">
          {state === "sent" ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, rotateY: -40, x: 40 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <GlassCard
                role="status"
                className="relative flex h-full min-h-[320px] flex-col items-center justify-center overflow-hidden p-10 text-center"
              >
                <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-periwinkle/20 blur-[90px]" />
                <motion.span
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
                  className="relative mb-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-periwinkle to-indigo-cosmic shadow-[0_0_60px_-10px_rgb(115_108_237/0.9)]"
                >
                  <Check className="h-9 w-9 text-white" />
                </motion.span>
                <p className="relative font-display text-3xl text-white">
                  Thank you — enquiry sent.
                </p>
                <p className="relative mt-3 max-w-sm text-sm text-muted-foreground">
                  The CliSo Tech team will reply to <span className="text-lavender">{sentTo}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="relative mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-white hover:border-lavender/60 hover:bg-white/[0.05]"
                >
                  Send another enquiry
                </button>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, rotateY: -30 }}
              className="h-full"
            >
              <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-periwinkle/15 blur-[90px]" />
                <div
                  className={`relative mb-6 h-24 w-24 rounded-full border border-lavender/30 bg-gradient-to-br from-periwinkle/40 to-indigo-cosmic shadow-[0_0_60px_-10px_rgb(115_108_237/0.9)] ${state === "sending" ? "animate-pulse" : "animate-float"}`}
                />
                <p className="relative font-display text-2xl text-white">
                  {state === "sending" ? "Sending your enquiry…" : "We’ll reply by email"}
                </p>
                <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">
                  Fill in the form and your message goes straight to the CliSo Tech team.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Readable message from a server validation (zod) or delivery error. */
function enquiryError(err: unknown) {
  const msg = err instanceof Error ? err.message : "";
  try {
    const issues = JSON.parse(msg) as { message?: string }[];
    if (Array.isArray(issues) && issues[0]?.message) return issues[0].message;
  } catch {
    /* not a zod payload */
  }
  return msg || "We couldn’t send your enquiry right now. Please try again shortly.";
}
