import { useEffect } from "react";
import { DesktopIcons } from "../components/shell/Desktop";
import { usePortfolio } from "../context/PortfolioContext";

/** The bare desktop, shown after closing the Home window. The brand name stays in the middle. */
export function DesktopPage() {
  const { data } = usePortfolio();
  const name = data?.profile.fullName || "William Brost";

  useEffect(() => {
    document.title = name;
  }, [name]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 p-6 text-center">
      <h1 className="display animate-type text-6xl text-white [text-shadow:3px_3px_0_rgb(0_0_0/0.55)] sm:text-8xl">
        {name}
      </h1>
      <p className="animate-fade-up rounded-sm bg-black/40 px-3 py-1 text-[15px] text-white [animation-delay:500ms]">
        Click an icon to open a window, or use the Start menu.
      </p>
      {/* the side icons are hidden on small screens, so show them here instead */}
      <DesktopIcons grid className="lg:hidden" />
    </div>
  );
}
