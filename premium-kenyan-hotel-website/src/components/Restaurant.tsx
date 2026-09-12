import { IMAGES } from "../data";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

const FACTS = [
  { label: "Seats", value: "Eighty, inside and on the terrace" },
  { label: "Style", value: "Kenyan produce, coastal and grill-led cooking" },
  { label: "Service", value: "Unhurried, attentive, quietly professional" },
];

export default function Restaurant() {
  return (
    <section id="restaurant" className="border-b border-line bg-ivory py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Image */}
          <Reveal className="lg:col-span-7">
            <div className="relative">
              <div
                className="pointer-events-none absolute -bottom-4 -right-4 h-full w-full border border-gold/50"
                aria-hidden="true"
              />
              <div className="img-zoom relative">
                <img
                  src={IMAGES.restaurant}
                  alt="The dining room at The Acacia House, set for lunch"
                  className="h-[320px] w-full object-cover sm:h-[440px] lg:h-[560px]"
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel num="03" title="The Restaurant" />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-7 font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.01em] text-ink">
                Made for Long Lunches and Easy Evenings
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 text-[15.5px] leading-[1.85] text-body">
                Our kitchen works with the seasons and the markets of Nairobi — coastal coconut
                curries, charcoal-grilled meats and a proper Kenyan breakfast, served without fuss.
                The room is calm and light by day, candlelit and easy by night.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.85] text-body">
                Come as you are. A business lunch, a family Sunday, a quiet table for two — we keep
                the welcome warm and the pace yours.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 divide-y divide-line border-y border-line">
                {FACTS.map((f) => (
                  <div key={f.label} className="grid grid-cols-[92px_1fr] gap-4 py-3.5">
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                      {f.label}
                    </span>
                    <span className="text-sm leading-relaxed text-body">{f.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={360}>
              <a href="#restaurant-gallery" className="btn btn-outline mt-9">
                Explore the Restaurant
              </a>
            </Reveal>
          </div>
        </div>

        {/* Gallery strip */}
        <div id="restaurant-gallery" className="mt-20 md:mt-24">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <figure>
                <div className="img-zoom">
                  <img
                    src={IMAGES.grillFood}
                    alt="Grilled lamb with sauce and fresh salad from the kitchen"
                    className="h-64 w-full object-cover sm:h-80"
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between text-sm">
                  <span className="font-serif text-[17px] font-medium text-ink">
                    From the charcoal grill
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                    Daily from 12:00
                  </span>
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={140}>
              <figure>
                <div className="img-zoom">
                  <img
                    src={IMAGES.morningTable}
                    alt="A bright breakfast table with fresh juice and fruit"
                    className="h-64 w-full object-cover sm:h-80"
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between text-sm">
                  <span className="font-serif text-[17px] font-medium text-ink">
                    Mornings, done properly
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                    From 6:30
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
