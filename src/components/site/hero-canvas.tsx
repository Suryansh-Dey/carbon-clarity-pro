import { lazy, Suspense, useEffect, useState } from "react";

const HeroScene = lazy(() => import("./hero-scene"));

/** Client-only WebGL canvas; renders nothing during SSR or without WebGL. */
export function HeroCanvas({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setReady(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setReady(false);
    }
  }, []);
  return (
    <div className={className}>
      {ready && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}
    </div>
  );
}
