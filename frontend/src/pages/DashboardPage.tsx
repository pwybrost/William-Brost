import { Battery, DateStamp, RecDot } from "../components/ui/Misc";

/**
 * Landing page / dashboard. Intentionally empty apart from the brand name:
 * future products (fashion, etc.) will live here.
 */
export function DashboardPage() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-6xl p-4">
      {/* The whole screen is framed like a digital camera viewfinder */}
      <div className="viewfinder lcd scanlines bevel-inset flex flex-1 flex-col overflow-hidden [--vf-size:40px]">
        <div className="relative z-[2] flex items-center justify-between p-5 text-silver">
          <RecDot />
          <span className="label">P · ISO 200 · F2.8 · 1/60</span>
          <Battery />
        </div>

        <div className="relative z-[2] flex flex-1 items-center justify-center px-4">
          {/* center focus reticle */}
          <span
            aria-hidden
            className="pointer-events-none absolute size-40 border border-phosphor/20 sm:size-56"
          />
          <h1 className="animate-flicker text-center font-display text-7xl leading-none text-phosphor chroma sm:text-8xl md:text-9xl">
            William Brost
          </h1>
        </div>

        <div className="relative z-[2] flex items-center justify-between p-5">
          <span className="label text-silver-dark">[ 1600×1200 ]  FINE</span>
          <DateStamp />
        </div>
      </div>
    </section>
  );
}
