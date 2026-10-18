import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./motion";
import { CtaLink, Eyebrow, Section } from "./ui";

export function ContactBand() {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-cosmic via-midnight to-void p-10 text-center sm:p-20">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-periwinkle/30 blur-[100px]" />
          <div className="relative space-y-6">
            <Eyebrow>Contact us</Eyebrow>
            <h2 className="mx-auto max-w-3xl font-display text-4xl leading-tight text-white sm:text-6xl">
              Let’s turn your sustainability{" "}
              <span className="text-gradient italic">goals into action.</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Tell us where you are in your ESG journey, the locations and value chains involved,
              and the outcomes you want to achieve.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <CtaLink to="/contact">Start a conversation</CtaLink>
              <Link
                to="/calculator"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-lavender hover:text-white"
              >
                Try the calculator{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
