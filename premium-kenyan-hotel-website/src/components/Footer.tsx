import { CONTACT, NAV_LINKS } from "../data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bark text-[#E9E0D0]">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <p className="font-serif text-2xl font-medium tracking-tight text-[#F6F0E4]">
              The Acacia House
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[#A99B84]">
              Hotel · Restaurant · Bar
            </p>
            <p className="mt-6 max-w-xs text-sm leading-[1.8] text-[#B9AC95]">
              A small Kenyan hotel in Westlands, Nairobi — good food, a well-stocked bar and quiet
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
                <a href="tel:+254712345678" className="transition-colors hover:text-[#F6F0E4]">
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
                <span className="text-[#B9AC95]">6:30 — 10:30</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Kitchen</span>
                <span className="text-[#B9AC95]">12:00 — 22:00</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>The Bar</span>
                <span className="text-[#B9AC95]">Until midnight</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Front Desk</span>
                <span className="text-[#B9AC95]">Always open</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[#3B3022] pt-7 text-[13px] text-[#93876F] sm:flex-row sm:items-center">
          <p>© {year} The Acacia House, Nairobi. All rights reserved.</p>
          <p>Good food. Good company.</p>
        </div>
      </div>
    </footer>
  );
}
