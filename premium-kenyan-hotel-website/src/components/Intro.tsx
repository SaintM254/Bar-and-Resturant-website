import { SITE } from "../site";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

const HOURS = [
  { label: "Breakfast", time: SITE.breakfastTime },
  { label: "Kitchen", time: SITE.kitchenTime },
  { label: "The Bar", time: SITE.barShort },
];

export default function Intro() {
  return (
    <section id="about" className="border-b border-line bg-ivory py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal className="flex justify-center">
          <SectionLabel num="01" title="Karibu — Welcome" />
        </Reveal>

        <Reveal delay={100}>
          <h2 className="mx-auto mt-7 max-w-3xl text-center font-serif text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-[1.15] tracking-[-0.01em] text-ink">
            Dining, Made <span className="italic font-light text-clay">Effortless</span>
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-[15.5px] leading-[1.85] text-body">
            From a relaxed breakfast to an evening drink, our restaurant and bar bring together
            fresh food, warm service and a comfortable atmosphere for every occasion — whether you
            are staying the night or simply passing through {SITE.place}.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {HOURS.map((h) => (
              <div key={h.label} className="px-4 py-6 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-mute">
                  {h.label}
                </p>
                <p className="mt-2 font-serif text-lg font-medium text-ink">{h.time}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
