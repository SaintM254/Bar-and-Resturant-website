import { useCallback, useEffect, useState } from "react";
import { FEATURED_MENU, EXTRA_MENU, type MenuItem } from "../data";
import { getMenu } from "../lib/api";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";
import DishModal from "./DishModal";

interface MenuRowProps {
  item: MenuItem;
  onOpen: (item: MenuItem) => void;
}

function MenuRow({ item, onOpen }: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`View photo of ${item.name}`}
      className="group flex w-full items-center gap-3.5 border-b border-line py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay sm:gap-4"
    >
      {/* Mini dish photo */}
      <span
        className="h-12 w-12 shrink-0 overflow-hidden rounded-[3px] sm:h-14 sm:w-14"
        aria-hidden="true"
      >
        <img
          src={item.thumb}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </span>

      {/* Name + description */}
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-[18px] font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-clay group-focus-visible:text-clay sm:text-[19px]">
          {item.name}
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-mute sm:text-sm">
          {item.desc}
        </span>
      </span>

      {/* Price + clear tap cue */}
      <span className="flex shrink-0 flex-col items-end gap-2">
        <span className="whitespace-nowrap text-[15px] font-medium tracking-tight text-clay">
          {item.price}
        </span>
        <span
          className="inline-flex items-center rounded-[4px] border border-[#CBBEA7] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-clay transition-colors duration-300 group-hover:border-clay group-hover:bg-clay group-hover:text-ivory"
          aria-hidden="true"
        >
          View
        </span>
      </span>
    </button>
  );
}

export default function MenuSection() {
  const [expanded, setExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  // Live menu from the backend; falls back to the built-in menu when offline
  // (e.g. the static GitHub Pages site) so the page never breaks.
  const [live, setLive] = useState<{ featured: MenuItem[]; groups: { group: string; items: MenuItem[] }[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMenu()
      .then((m) => {
        if (!cancelled && m.featured.length > 0) setLive({ featured: m.featured, groups: m.groups });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const openItem = useCallback((item: MenuItem) => setActiveItem(item), []);
  const closeItem = useCallback(() => setActiveItem(null), []);

  const featured = live?.featured ?? FEATURED_MENU;
  const groups = live?.groups ?? EXTRA_MENU;
  const first = featured.slice(0, 5);
  const second = featured.slice(5);

  return (
    <section id="menu" className="bg-parchment py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionLabel num="02" title="The Menu" />
            <h2 className="mt-7 font-serif text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-[1.15] tracking-[-0.01em] text-ink">
              A Few House Favourites
            </h2>
          </Reveal>
          <Reveal delay={120} className="md:text-right">
            <p className="max-w-xs text-sm leading-relaxed text-mute md:ml-auto">
              All prices in Kenyan Shillings (KES).
              <br />
              <span className="italic">
                Tap <span className="font-medium not-italic text-clay">View</span> to see any dish
                plated.
              </span>
            </p>
          </Reveal>
        </div>

        {/* Featured items */}
        <Reveal delay={150}>
          <div className="mt-12 grid gap-x-16 lg:grid-cols-2">
            <div className="border-t border-line">
              {first.map((item) => (
                <MenuRow key={item.name} item={item} onOpen={openItem} />
              ))}
            </div>
            <div className="lg:border-t lg:border-line">
              {second.map((item) => (
                <MenuRow key={item.name} item={item} onOpen={openItem} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Expandable full menu */}
        <div
          className={`grid transition-all duration-700 ease-in-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!expanded}
        >
          <div className="overflow-hidden">
            <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group.group}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold">
                    {group.group}
                  </p>
                  <div className="mt-4 border-t border-line">
                    {group.items.map((item) => (
                      <MenuRow key={item.name} item={item} onOpen={openItem} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Reveal delay={100}>
          <div className="mt-12 flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="btn btn-outline w-full sm:w-auto"
            >
              {expanded ? "Show Less" : "View Full Menu"}
            </button>
            <p className="text-[13px] text-mute">
              Allergies or preferences? Tell us when you book — the kitchen is happy to adapt.
            </p>
          </div>
        </Reveal>
      </div>

      <DishModal dish={activeItem} onClose={closeItem} />
    </section>
  );
}
