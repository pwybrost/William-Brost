import { usePortfolio } from "../../context/PortfolioContext";
import { mediaUrl } from "../../lib/api";

/**
 * Fixed desktop background. Uses the owner's uploaded wallpaper if there is one,
 * otherwise the built-in green-hills scene (drawn in CSS, with a night version in dark mode).
 */
export function Wallpaper() {
  const { data } = usePortfolio();
  const custom = mediaUrl(data?.profile.wallpaperMediaId);
  return (
    <div aria-hidden className="wallpaper fixed inset-0 -z-10">
      {custom && <img src={custom} alt="" className="h-full w-full object-cover dark:brightness-75" />}
    </div>
  );
}
