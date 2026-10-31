import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Link } from "react-router";
import { PictureIcon } from "../../components/win98/Icons";
import { mediaUrl } from "../../lib/api";
import { CATEGORY_LABELS, type Project } from "../../lib/types";

/**
 * Featured projects as a slideshow: the current slide in the middle with the next and
 * previous ones peeking at the sides. ‹ › buttons, arrow keys and swiping all work.
 * It never moves on its own (auto-advancing carousels are hard to read and to use).
 */
export function FeaturedCarousel({ projects }: { projects: Project[] }) {
  const [index, setIndex] = useState(0);
  const swipe = useRef<number | null>(null);
  const count = projects.length;
  if (count === 0) return null;

  const go = (i: number) => setIndex((i + count) % count);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipe.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <section aria-roledescription="carousel" aria-label="Featured projects" className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <ul
          className="flex gap-4 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ transform: `translateX(calc(7% - ${index} * (86% + 1rem)))` }}
        >
          {projects.map((p, i) => {
            const cover = mediaUrl(p.coverMediaId ?? p.images[0]?.mediaId);
            const active = i === index;
            return (
              <li
                key={p.id}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${p.title}`}
                aria-hidden={!active}
                className={`win-raised w-[86%] shrink-0 p-[3px] transition-[opacity,scale] duration-500 ${
                  active ? "opacity-100" : "scale-[0.94] opacity-50"
                }`}
              >
                <Link
                  to={`/projects/${p.id}`}
                  tabIndex={active ? 0 : -1}
                  className="group win-sunken relative block aspect-[16/9] overflow-hidden p-[2px] sm:aspect-[21/9]"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      draggable={false}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <PictureIcon size={64} />
                    </span>
                  )}
                  <span className="absolute inset-x-[2px] bottom-[2px] flex flex-col gap-1 bg-linear-to-t from-black/85 via-black/45 to-transparent px-5 pt-16 pb-5 text-white sm:px-8">
                    <span className="font-mono text-[12px] tracking-[0.14em] uppercase opacity-90">
                      ★ Featured · {CATEGORY_LABELS[p.category]}
                    </span>
                    <span className="display text-4xl sm:text-6xl">{p.title}</span>
                    {p.summary && <span className="line-clamp-2 max-w-2xl text-[15px] opacity-90">{p.summary}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous featured project"
              className="win-button absolute top-1/2 left-2 size-11 -translate-y-1/2 p-0 text-xl"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next featured project"
              className="win-button absolute top-1/2 right-2 size-11 -translate-y-1/2 p-0 text-xl"
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2" role="group" aria-label="Choose slide">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${p.title}`}
              aria-current={i === index}
              className={`h-3 cursor-pointer transition-all duration-300 ${
                i === index ? "win-sunken w-8 bg-accent!" : "win-raised w-3"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
