import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Intro from "./components/Intro";
import MenuSection from "./components/MenuSection";
import Restaurant from "./components/Restaurant";
import Bar from "./components/Bar";
import Experience from "./components/Experience";
import Reservation from "./components/Reservation";
import Location from "./components/Location";
import Footer from "./components/Footer";
import Reveal from "./components/Reveal";
import AdminApp from "./components/admin/AdminApp";

function useIsAdminRoute() {
  const read = () => window.location.hash.startsWith("#/admin");
  const [isAdmin, setIsAdmin] = useState(read);
  useEffect(() => {
    const onHash = () => {
      const next = read();
      // Only jump to the top when actually switching between the website
      // and the staff area — never on normal menu clicks (#menu, #bar…).
      setIsAdmin((prev) => {
        if (prev !== next) window.scrollTo(0, 0);
        return next;
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return isAdmin;
}

function PullQuote() {
  return (
    <div className="border-b border-line bg-ivory py-16 md:py-20">
      <Reveal>
        <blockquote className="mx-auto max-w-3xl px-6 text-center">
          <span className="font-serif text-5xl leading-none text-gold" aria-hidden="true">
            “
          </span>
          <p className="font-serif text-[clamp(1.4rem,3vw,2rem)] font-light italic leading-[1.4] text-ink">
            Good food and good company — the two things
            <br className="hidden sm:block" /> we never compromise on.
          </p>
          <footer className="mt-6 text-[11px] font-medium uppercase tracking-[0.26em] text-mute">
            The Mwangi Family · Proprietors
          </footer>
        </blockquote>
      </Reveal>
    </div>
  );
}

export default function App() {
  const isAdmin = useIsAdminRoute();
  if (isAdmin) return <AdminApp />;

  return (
    <div className="min-h-screen bg-ivory font-sans text-ink">
      <Header />
      <main>
        <Hero />
        <Intro />
        <MenuSection />
        <Restaurant />
        <Bar />
        <PullQuote />
        <Experience />
        <Reservation />
        <Location />
      </main>
      <Footer />
    </div>
  );
}
