import { BAR_DRINKS, IMAGES } from "../data";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function Bar() {
  return (
    <section id="bar" className="border-b border-line bg-sand py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Text + drinks */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel num="04" title="The Bar" />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-7 font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.01em] text-ink">
                Warm Light, <span className="italic font-light">Honest Pours</span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 text-[15.5px] leading-[1.85] text-body">
                The bar is where the evening settles in — cold Tusker from the tap, dawa shaken the
                proper way, fresh juices through the afternoon and Kenyan coffee long after dark.
                Pull up a stool; there is no hurry here.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-9 border-t border-[#DBCCB2]">
                {BAR_DRINKS.map((drink) => (
                  <div key={drink.name} className="border-b border-[#DBCCB2] py-4">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-serif text-[18px] font-medium text-ink">{drink.name}</h3>
                      <span className="leader" aria-hidden="true" />
                      <span className="whitespace-nowrap text-[15px] font-medium tracking-tight text-clay">
                        {drink.price}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-mute">{drink.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={340}>
              <p className="mt-6 text-[13px] font-medium uppercase tracking-[0.18em] text-mute">
                Happy hour daily · 5:00 — 7:00 PM
              </p>
            </Reveal>
          </div>

          {/* Image */}
          <Reveal className="lg:col-span-7" delay={120}>
            <div className="relative">
              <div className="img-zoom">
                <img
                  src={IMAGES.bar}
                  alt="The wooden bar counter at The Acacia House in the evening"
                  className="h-[320px] w-full object-cover sm:h-[440px] lg:h-[560px]"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-5 left-5 bg-ivory/95 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-mute">
                  The Bar
                </p>
                <p className="mt-0.5 font-serif text-[16px] font-medium text-ink">
                  Open until midnight
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
