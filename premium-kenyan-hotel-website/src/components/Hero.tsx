import { IMAGES } from "../data";
import { SITE } from "../site";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100svh] items-end overflow-hidden">
      {/* Photograph — our team hosting our guests */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt={`A waitress serving African guests their meal at ${SITE.name}, Nairobi`}
          className="h-full w-full object-cover"
          loading="eager"
        />
        {/* Uniform black overlay at 25% opacity for text legibility */}
        <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative mx-auto w-full max-w-[1200px] px-5 pb-20 pt-40 sm:px-8 sm:pb-24">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#E9D9B8]/70" aria-hidden="true" />
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#F3E9D6]/90">
              {SITE.heroEyebrow}
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mt-6 font-serif text-[clamp(2.4rem,6.2vw,4.4rem)] font-medium leading-[1.06] tracking-[-0.01em] text-[#FBF7EF]">
            The Neighborhood
            <br />
            <span className="italic font-light">Bar &amp; Restaurant.</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-[#F3E9D6]/90">
            Experience relaxed dining, carefully prepared dishes and a well-stocked bar in a
            welcoming hotel setting.
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#menu" className="btn btn-primary w-full sm:w-auto">
              View Menu
            </a>
            <a href="#reserve" className="btn btn-outline-light w-full sm:w-auto">
              Reserve a Table
            </a>
          </div>
        </Reveal>
      </div>

      {/* Bottom strip */}
      <div className="absolute inset-x-0 bottom-0 hidden border-t border-[#FBF7EF]/15 sm:block">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#F3E9D6]/75">
          <span>{SITE.heroHours}</span>
          <span className="hidden lg:inline">Restaurant · Bar · Rooms</span>
          <span>{SITE.phone}</span>
        </div>
      </div>
    </section>
  );
}
