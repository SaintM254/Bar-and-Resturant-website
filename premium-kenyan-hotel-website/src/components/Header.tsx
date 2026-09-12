import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "../data";
import { SITE } from "../site";
import logoImg from "../assets/logo.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solid
            ? "border-b border-line bg-ivory/95 backdrop-blur-sm"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
          {/* Brand */}
          <a
            href="#home"
            className="flex items-center gap-2.5"
            aria-label={`${SITE.name} — home`}
          >
            <img
              src={logoImg}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <span className="flex flex-col leading-none">
              <span
                className={`font-serif text-[21px] font-medium tracking-tight transition-colors duration-500 ${
                  solid ? "text-ink" : "text-[#FBF7EF]"
                }`}
              >
                {SITE.name}
              </span>
              <span
                className={`mt-1 text-[9px] font-medium uppercase tracking-[0.3em] transition-colors duration-500 ${
                  solid ? "text-mute" : "text-[#FBF7EF]/70"
                }`}
              >
                {SITE.tagline}
              </span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link text-[13.5px] font-medium tracking-wide transition-colors duration-500 ${
                  solid ? "text-body hover:text-ink" : "text-[#FBF7EF]/85 hover:text-[#FBF7EF]"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a href="#reserve" className="btn btn-primary btn-sm">
              Reserve a Table
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`flex h-11 w-11 items-center justify-center transition-colors duration-500 md:hidden ${
              solid ? "text-ink" : "text-[#FBF7EF]"
            }`}
          >
            {open ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-ivory transition-all duration-500 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="flex flex-1 flex-col justify-center px-8" aria-label="Mobile">
          <ul className="divide-y divide-line border-y border-line">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                className={`transition-all duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              >
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-5"
                >
                  <span className="font-serif text-[30px] font-medium text-ink">{link.label}</span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold">
                    0{i + 1}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div
            className={`mt-10 transition-all duration-500 ${
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: open ? "460ms" : "0ms" }}
          >
            <a href="#reserve" onClick={() => setOpen(false)} className="btn btn-primary w-full">
              Reserve a Table
            </a>
            <p className="mt-6 text-center text-sm text-mute">
              {SITE.place} · {SITE.phone}
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
