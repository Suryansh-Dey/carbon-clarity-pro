import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calculator,
  History,
  Shield,
  LogOut,
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Menu,
  Gauge,
  TrendingDown,
  Building2,
  Droplets,
  Globe,
  TrendingUp,
} from "lucide-react";
import { type ReactNode } from "react";
import { logout, clearAuthCache } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { amIAdmin } from "@/lib/calculations.functions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AiCopilotSheet } from "./ai-copilot";
import { Logo } from "@/components/site/header";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const { data: adminInfo } = useQuery({
    queryKey: ["me", "admin"],
    queryFn: () => amIAdmin(),
    staleTime: 60_000,
  });

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/calculator", label: "Calculator", icon: Calculator },
    { to: "/brsr", label: "SEBI BRSR Suite", icon: FileSpreadsheet },
    { to: "/reports", label: "Report Builder", icon: FileText },
    { to: "/cbam", label: "EU CBAM Hub", icon: Globe },
    { to: "/ccts", label: "CCTS Trading", icon: TrendingUp },
    { to: "/water-accounting", label: "Water Accounting", icon: Droplets },
    { to: "/decarbonization", label: "Decarbonization", icon: TrendingDown },
    { to: "/joint-ventures", label: "JV Hub", icon: Building2 },
    { to: "/gwp-odp", label: "GWP-ODP Calc", icon: Gauge },
    { to: "/history", label: "History", icon: History },
    ...(adminInfo?.isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ] as const;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    clearAuthCache();
    await logout();
    toast.success("Signed out");
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <header className="glass-strong flex h-16 items-center justify-between border-x-0 border-t-0 px-4 text-sidebar-foreground md:hidden">
        <Logo />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="glass-strong w-64 text-sidebar-foreground p-0 flex flex-col"
          >
            <div className="border-b px-5 py-5">
              <Logo />
            </div>
            <nav className="flex-1 space-y-1 px-3 mt-4">
              {nav.map((n) => {
                const active = pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-periwinkle/15 text-white font-medium shadow-[inset_2px_0_0_0_#736CED]"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                    )}
                  >
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 pb-5">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="glass-strong fixed inset-y-0 left-0 hidden w-60 flex-col border-y-0 border-l-0 text-sidebar-foreground md:flex">
        <div className="px-5 py-6">
          <Logo />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-lavender">
            clisomumbai workspace
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-periwinkle/15 text-white font-medium shadow-[inset_2px_0_0_0_#736CED]"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-5">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="md:pl-60">
        <div className="flex h-14 items-center justify-between border-b px-4 md:px-8 bg-void/60 backdrop-blur-xl sticky top-0 z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> CliSo Tech website
          </Link>
          <div className="flex items-center gap-3">
            <AiCopilotSheet />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
