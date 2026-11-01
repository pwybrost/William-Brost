import { useState } from "react";
import { Link } from "react-router";
import { Lightbox } from "../components/ui/Lightbox";
import { AppWindow, PageHeader, WindowMessage } from "../components/shell/AppWindow";
import { PleaseWait } from "../components/shell/Loading";
import { usePortfolio } from "../context/PortfolioContext";
import { mediaUrl } from "../lib/api";
import { CATEGORY_LABELS, type ProjectCategory, type ProjectImage } from "../lib/types";

interface GalleryItem extends ProjectImage {
  projectId: string;
  projectTitle: string;
  category: ProjectCategory;
}

/** Every project image in one place (covers and galleries), filterable by type. */
export function GalleryPage() {
  const { data, error, loading } = usePortfolio();
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");
  const [viewing, setViewing] = useState<number | null>(null);

  if (loading || error || !data) {
    return (
      <AppWindow title="Gallery - Image Viewer">
        <WindowMessage>{error ?? <PleaseWait />}</WindowMessage>
      </AppWindow>
    );
  }

  const items: GalleryItem[] = data.projects
    .filter((p) => p.published)
    .flatMap((p) => {
      const base = { projectId: p.id, projectTitle: p.title, category: p.category };
      const cover = p.coverMediaId ? [{ ...base, mediaId: p.coverMediaId, caption: p.title }] : [];
      return [...cover, ...p.images.map((img) => ({ ...base, ...img, caption: img.caption || p.title }))];
    });
  const categories = [...new Set(items.map((i) => i.category))];
  const shown = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <AppWindow title="Gallery - Image Viewer" status={[`${shown.length} picture(s)`]}>
      <PageHeader
        eyebrow="Visuals"
        title="Gallery"
        intro="Screens, posters and design work from my projects. Click any picture to view it full size."
      />

      {categories.length > 1 && (
        <div role="group" aria-label="Filter by type" className="mb-8 flex flex-wrap gap-2">
          <button type="button" className="win-button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="win-button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <WindowMessage>No pictures yet.</WindowMessage>
      ) : (
        // CSS columns give a masonry layout that keeps every picture's own shape
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {shown.map((item, i) => (
            <li
              key={`${item.projectId}-${item.mediaId}`}
              className="mb-4 animate-fade-up break-inside-avoid"
              style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
            >
              <figure className="lift win-raised group p-[3px]">
                <button
                  type="button"
                  onClick={() => setViewing(i)}
                  className="win-sunken relative block w-full cursor-zoom-in overflow-hidden p-[2px]"
                  aria-label={`View ${item.caption}`}
                >
                  <img
                    src={mediaUrl(item.mediaId) ?? ""}
                    alt={item.caption}
                    loading="lazy"
                    className="lift-img w-full"
                  />
                </button>
                <figcaption className="flex items-center justify-between gap-2 px-2 py-2 text-[14px]">
                  <span className="truncate">{item.caption}</span>
                  <Link to={`/projects/${item.projectId}`} className="arrow-link shrink-0 text-[12px]">
                    Project
                  </Link>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}

      <Lightbox images={shown} index={viewing} onIndexChange={setViewing} />
    </AppWindow>
  );
}
