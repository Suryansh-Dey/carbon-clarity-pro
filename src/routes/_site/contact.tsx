import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Check, Copy, Cookie, FileText, Lock } from "lucide-react";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import { Eyebrow, GlassCard, Note, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    d: "This website’s enquiry tool prepares text in your browser and does not submit it to CliSo Tech. Do not enter sensitive personal information. A company-approved privacy policy and contact point will be added before collecting enquiries online.",
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
  const [prepared, setPrepared] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const outRef = useRef<HTMLTextAreaElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setPrepared(
      `Enquiry for CliSo Tech Private Limited\n\nName: ${d.get("name")}\nEmail: ${d.get("email")}\n\n${d.get("message")}`,
    );
    setStatus("");
    requestAnimationFrame(() => outRef.current?.focus());
  }

  async function onCopy() {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(prepared);
      setStatus("Copied");
    } catch {
      outRef.current?.select();
      setStatus("Select and copy the text above.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Reveal>
        <GlassCard className="h-full p-8 sm:p-10">
          <Eyebrow>Start a conversation</Eyebrow>
          <p className="mt-4 text-muted-foreground">
            Prepare an enquiry for business, consulting or media discussions.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                name="name"
                required
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
                autoComplete="email"
                className="h-11 bg-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">How can we help?</Label>
              <Textarea id="message" name="message" required rows={5} className="bg-white/[0.03]" />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-periwinkle text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgb(115_108_237/0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#8580f0]"
            >
              Prepare enquiry
            </button>
            <Note>This form prepares an enquiry to copy. It does not send a message.</Note>
          </form>
        </GlassCard>
      </Reveal>

      <div style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait">
          {prepared ? (
            <motion.div
              key="out"
              initial={{ opacity: 0, rotateY: -40, x: 40 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <GlassCard className="flex h-full flex-col p-8 sm:p-10">
                <Label htmlFor="prepared" className="mb-3">
                  Your enquiry
                </Label>
                <Textarea
                  id="prepared"
                  ref={outRef}
                  readOnly
                  value={prepared}
                  className="min-h-[260px] flex-1 bg-white/[0.03] font-mono text-sm"
                />
                <div className="mt-5 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-white hover:border-lavender/60 hover:bg-white/[0.05]"
                  >
                    {status === "Copied" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copy enquiry
                  </button>
                  <span role="status" className="text-sm text-lavender">
                    {status}
                  </span>
                </div>
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
                <div className="relative mb-6 h-24 w-24 animate-float rounded-full border border-lavender/30 bg-gradient-to-br from-periwinkle/40 to-indigo-cosmic shadow-[0_0_60px_-10px_rgb(115_108_237/0.9)]" />
                <p className="relative font-display text-2xl text-white">
                  Your enquiry appears here
                </p>
                <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">
                  Fill in the form and we’ll prepare a message you can copy into your email client.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
