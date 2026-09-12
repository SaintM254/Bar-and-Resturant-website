import { IMAGES } from "../data";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

const OFFERS = [
  { label: "Stay", value: "32 quiet en-suite rooms upstairs" },
  { label: "Gather", value: "Garden terrace for private events" },
  { label: "Work", value: "A small, calm conference room" },
  { label: "Arrive", value: "Airport transfers arranged on request" },
];

export default function Experience() {
  return (
    <section id="experience" className="border-b border-line bg-parchment py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Text column */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <Reveal>
              <SectionLabel num="05" title="The Hotel" />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-7 font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.01em] text-ink">
                More Than a Meal
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 text-[15.5px] leading-[1.85] text-body">
                The Acacia House is a small hotel first — the restaurant and bar simply grew out of
                how we like to host. Guests can move from breakfast in the courtyard to a working
                lunch, an evening at the bar and a quiet room upstairs, all in one address.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.85] text-body">
                Whether you are with us for a night, a week or just a dinner, you are looked after
                by the same team, in the same spirit.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 divide-y divide-line border-y border-line">
                {OFFERS.map((o) => (
                  <div key={o.label} className="grid grid-cols-[92px_1fr] gap-4 py-3.5">
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                      {o.label}
                    </span>
                    <span className="text-sm leading-relaxed text-body">{o.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-9">
                <a href="#contact" className="btn btn-outline">
                  Enquire About a Stay
                </a>
              </div>
            </Reveal>
          </div>

          {/* Editorial image collage */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-12 grid-rows-[auto] gap-4 sm:gap-5">
              <Reveal className="col-span-12 sm:col-span-7">
                <div className="img-zoom h-full">
                  <img
                    src={IMAGES.room}
                    alt="A calm, neutral guest room at The Acacia House"
                    className="h-[260px] w-full object-cover sm:h-[420px] lg:h-[480px]"
                    loading="lazy"
                  />
                </div>
              </Reveal>
              <div className="col-span-12 grid grid-cols-2 gap-4 sm:col-span-5 sm:grid-cols-1 sm:gap-5">
                <Reveal delay={120}>
                  <div className="img-zoom">
                    <img
                      src={IMAGES.breakfast}
                      alt="Coffee, juice and warm pastries for breakfast"
                      className="h-[180px] w-full object-cover sm:h-[200px] lg:h-[229px]"
                      loading="lazy"
                    />
                  </div>
                </Reveal>
                <Reveal delay={220}>
                  <div className="img-zoom">
                    <img
                      src={IMAGES.guests}
                      alt="Friends sharing a meal at a sunlit table"
                      className="h-[180px] w-full object-cover sm:h-[200px] lg:h-[229px]"
                      loading="lazy"
                    />
                  </div>
                </Reveal>
              </div>
            </div>
            <Reveal delay={200}>
              <p className="mt-4 text-[13px] leading-relaxed text-mute">
                Rooms, breakfast and the garden terrace — the rest of the house, at the same address.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
