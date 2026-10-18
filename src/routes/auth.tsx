import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Calculator, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { fetchCurrentUser } from "@/lib/auth";
import { HeroCanvas } from "@/components/site/hero-canvas";
import { Logo } from "@/components/site/header";
import { Eyebrow } from "@/components/site/ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CliSo Tech" },
      {
        name: "description",
        content: "Sign in with Google to open the clisomumbai emissions calculator workspace.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  // If already signed in, go straight to the workspace
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  function handleGoogleSignIn() {
    window.location.href = "/api/auth/login";
  }

  return (
    <div className="relative grid min-h-screen overflow-hidden lg:grid-cols-2">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-cosmic blur-[140px]"
      />

      {/* Left: 3D brand panel */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex">
        <HeroCanvas className="absolute inset-0" />
        <Logo className="relative" />
        <div className="relative max-w-md space-y-4">
          <Eyebrow>Featured digital tool</Eyebrow>
          <p className="font-display text-5xl leading-tight text-white">
            Carbon & resource intelligence.
            <br />
            <span className="text-gradient italic">One connected platform.</span>
          </p>
        </div>
        <p className="relative text-xs text-muted-foreground">
          IPCC 2006 · GHG Protocol · India CEA Baseline v19
        </p>
      </div>

      {/* Right: sign-in card */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="mb-10 w-full max-w-md lg:hidden">
          <Logo />
        </div>

        <motion.div
          initial={{ opacity: 0, rotateY: -25, y: 30 }}
          animate={{ opacity: 1, rotateY: 0, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 1400 }}
          className="w-full max-w-md"
        >
          <div className="glass glow-border rounded-3xl p-8 sm:p-10">
            <div className="mb-8 space-y-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-periwinkle to-indigo-cosmic text-white shadow-[0_0_50px_-10px_rgb(115_108_237/1)]">
                <Calculator className="h-7 w-7" />
              </div>
              <h1 className="font-display text-3xl text-white">Open the calculator</h1>
              <p className="text-sm text-muted-foreground">
                Sign in with Google to use the clisomumbai emissions calculator and workspace tools.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-sm font-semibold text-void shadow-[0_12px_40px_-12px_rgb(159_162_232/0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgb(159_162_232/1)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-lavender" />
              <span>Everything else on the site is free to explore without signing in.</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </Link>
            <Link to="/contact" hash="policies" className="hover:text-white">
              Our policies
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
