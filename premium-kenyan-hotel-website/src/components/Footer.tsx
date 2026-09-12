import { CONTACT, NAV_LINKS } from "../data";
import { SITE } from "../site";
import logoImg from "../assets/logo.png";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bark text-[#E9E0D0]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt={`${SITE.name} logo`}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
              <div>
                <p className="font-serif text-2xl font-medium tracking-tight text-[#F6F0E4]">
                  {SITE.name}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[#A99B84]">
                  {SITE.tagline}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-[1.8] text-[#B9AC95]">
              A small Kenyan hotel in {SITE.place} — good food, a well-stocked bar and quiet
              rooms, all under one roof. Karibu.
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#A99B84]">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#D9CDB6] transition-colors hover:text-[#F6F0E4]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#reserve"
                  className="text-sm text-[#D9CDB6] transition-colors hover:text-[#F6F0E4]"
                >
                  Reserve a Table
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#A99B84]">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#D9CDB6]">
              <li>
                {CONTACT.address}
                <br />
                {CONTACT.city}
              </li>
              <li>
                <a href={SITE.phoneHref} className="transition-colors hover:text-[#F6F0E4]">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors hover:text-[#F6F0E4]"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#A99B84]">
              Hours
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[#D9CDB6]">
              <li className="flex justify-between gap-6">
                <span>Breakfast</span>
                <span className="text-[#B9AC95]">{SITE.breakfastTime}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Kitchen</span>
                <span className="text-[#B9AC95]">{SITE.kitchenTime}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>The Bar</span>
                <span className="text-[#B9AC95]">{SITE.barShort}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Front Desk</span>
                <span className="text-[#B9AC95]">Always open</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[#3B3022] pt-7 text-[13px] text-[#93876F] sm:flex-row sm:items-center">
          <p>
            © {year} {SITE.name}, {SITE.city}. All rights reserved.
          </p>
          <p className="flex items-center gap-4">
            <span>Good food. Good company.</span>
            <a href="#/admin" className="text-[#6E6455] transition-colors hover:text-[#F6F0E4]">
              Staff
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
