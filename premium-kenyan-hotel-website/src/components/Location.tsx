import { CONTACT } from "../data";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

const ROWS = [
  { label: "Address", value: `${CONTACT.address}, ${CONTACT.city}` },
  { label: "Phone", value: CONTACT.phone, href: "tel:+254712345678" },
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: "Hours", value: "Open daily 6:30 AM — 11:00 PM · Bar until midnight" },
];

export default function Location() {
  return (
    <section id="contact" className="border-b border-line bg-parchment py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Details */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <Reveal>
              <SectionLabel num="07" title="Find Us" />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-7 font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.01em] text-ink">
                In the Heart of Westlands
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-md text-[15.5px] leading-[1.85] text-body">
                A short walk from the malls and offices of Westlands, with secure parking on site.
                Karibu — we look forward to hosting you.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 divide-y divide-line border-y border-line">
                {ROWS.map((row) => (
                  <div key={row.label} className="grid grid-cols-[92px_1fr] gap-4 py-4">
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                      {row.label}
                    </span>
                    {row.href ? (
                      <a href={row.href} className="text-sm text-body transition-colors hover:text-clay">
                        {row.value}
                      </a>
                    ) : (
                      <span className="text-sm leading-relaxed text-body">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Map */}
          <Reveal delay={150} className="lg:col-span-7">
            <div className="map-tint h-full min-h-[320px] overflow-hidden border border-line sm:min-h-[420px]">
              <iframe
                title="Map — The Acacia House, Riverside Drive, Westlands, Nairobi"
                src="https://www.google.com/maps?q=Riverside+Drive,+Westlands,+Nairobi,+Kenya&output=embed"
                className="h-full min-h-[320px] w-full sm:min-h-[420px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-4 text-[13px] text-mute">
              Riverside Drive, Westlands — tell your driver "The Acacia House, past the fig tree."
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
