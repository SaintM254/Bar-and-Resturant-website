import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { IMAGES } from "../data";
import { getGallery, resolveAsset, type ApiGalleryImage } from "../lib/api";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

/* Shown instantly, and kept if the backend is unreachable. */
const FALLBACK: ApiGalleryImage[] = [
  { id: "f-dining", caption: "The dining room, set for lunch", category: "Restaurant", src: IMAGES.restaurant },
  { id: "f-grill", caption: "From the charcoal grill", category: "Restaurant", src: IMAGES.grillFood },
  { id: "f-bar", caption: "Evenings at the bar", category: "Bar", src: IMAGES.bar },
  { id: "f-room", caption: "Quiet rooms upstairs", category: "Rooms", src: IMAGES.room },
];

export default function Gallery() {
  const [images, setImages] = useState<ApiGalleryImage[]>(FALLBACK);
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    getGallery()
      .then((g) => {
        if (!cancelled && g.images.length > 0) {
          setImages(g.images);
          setFilter("All");
          setLightbox(null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category)))];
  const visible = filter === "All" ? images : images.filter((i) => i.category === filter);

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setLightbox((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, close, step]);

  const current = lightbox !== null ? visible[lightbox] : null;

  return (
    <section id="gallery" className="border-b border-line bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionLabel num="05" title="The Gallery" />
            <h2 className="mt-7 font-serif text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-[1.15] tracking-[-0.01em] text-ink">
              Moments at the House
            </h2>
          </Reveal>
          <Reveal delay={120} className="md:text-right">
            <p className="max-w-xs text-sm leading-relaxed text-mute md:ml-auto">
              Dining rooms, the bar, quiet corners.
              <br />
              <span className="italic">Tap any photo to look closer.</span>
            </p>
          </Reveal>
        </div>

        {categories.length > 1 && (
          <Reveal delay={150}>
            <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter photos">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={filter === c}
                  onClick={() => {
                    setFilter(c);
                    setLightbox(null);
                  }}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    filter === c
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-ivory text-body hover:border-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={180}>
          <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`Enlarge photo: ${img.caption}`}
                className="group cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay"
              >
                <span className="img-zoom block overflow-hidden rounded-[3px] border border-line">
                  <img
                    src={resolveAsset(img.src)}
                    alt={img.caption}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </span>
                <span className="mt-3 block font-serif text-[17px] font-medium leading-snug text-ink transition-colors group-hover:text-clay">
                  {img.caption}
                </span>
                <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                  {img.category}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo: ${current.caption}`}
        >
          <div
            className="absolute inset-0 bg-[rgba(24,16,8,0.88)]"
            onClick={close}
            aria-hidden="true"
          />
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close photo"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-ink transition-colors hover:bg-cream"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
          {visible.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-ink transition-colors hover:bg-ivory sm:left-6"
              >
                <ChevronLeft size={22} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-ink transition-colors hover:bg-ivory sm:right-6"
              >
                <ChevronRight size={22} strokeWidth={1.75} />
              </button>
            </>
          )}
          <figure className="relative max-h-full">
            <img
              src={resolveAsset(current.src)}
              alt={current.caption}
              className="max-h-[76vh] w-auto max-w-full rounded-[3px] object-contain"
            />
            <figcaption className="mt-4 flex items-baseline justify-between gap-6 text-[#F3E9D6]">
              <span className="font-serif text-lg">{current.caption}</span>
              <span className="shrink-0 text-[12px] font-medium uppercase tracking-[0.2em] text-[#F3E9D6]/70">
                {(lightbox ?? 0) + 1} / {visible.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
