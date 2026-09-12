import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { MenuItem } from "../data";
import { SITE } from "../site";

interface DishModalProps {
  dish: MenuItem | null;
  onClose: () => void;
}

export default function DishModal({ dish, onClose }: DishModalProps) {
  const [current, setCurrent] = useState<MenuItem | null>(null);
  const [visible, setVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dish) {
      setCurrent(dish);
      const raf = requestAnimationFrame(() => {
        setVisible(true);
        closeRef.current?.focus();
      });
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
    setVisible(false);
    const t = window.setTimeout(() => setCurrent(null), 280);
    return () => window.clearTimeout(t);
  }, [dish, onClose]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${current.name} — photo`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[rgba(24,16,8,0.68)] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-[560px] border border-line bg-ivory transition-all duration-300 ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className="aspect-[4/3] w-full overflow-hidden bg-cream">
          <img
            src={current.img}
            alt={`${current.name}, as served at ${SITE.name}`}
            className="h-full w-full object-cover"
            decoding="async"
          />
        </div>

        <div className="p-6 sm:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-[24px] font-medium leading-snug text-ink">
              {current.name}
            </h3>
            <span className="whitespace-nowrap text-[16px] font-medium tracking-tight text-clay">
              {current.price}
            </span>
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-body">{current.desc}</p>
          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
              {SITE.name} · Kitchen
            </p>
            <a
              href="#reserve"
              onClick={onClose}
              className="text-[13px] font-medium text-clay underline-offset-4 hover:underline"
            >
              Reserve a table
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
