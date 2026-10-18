import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PageTransition } from "@/components/site/motion";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <SiteHeader />
      <main>
        <PageTransition key={pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <SiteFooter />
    </div>
  );
}
