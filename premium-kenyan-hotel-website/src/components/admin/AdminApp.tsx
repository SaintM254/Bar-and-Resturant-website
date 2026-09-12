import { useState, type FormEvent } from "react";
import { ApiError, adminLogin, adminLogout, getToken } from "../../lib/api";
import BookingsTab from "./BookingsTab";
import MenuTab from "./MenuTab";

type Tab = "bookings" | "menu";

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => getToken() !== null);
  const [tab, setTab] = useState<Tab>("bookings");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loggingIn) return;
    setLoggingIn(true);
    setLoginError(null);
    try {
      await adminLogin(password);
      setPassword("");
      setAuthed(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoggingIn(false);
    }
  };

  const onLogout = async () => {
    await adminLogout();
    setAuthed(false);
  };

  const onSessionExpired = () => setAuthed(false);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-5 py-16">
        <div className="w-full max-w-md border border-line bg-parchment p-8 sm:p-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gold">Staff only</p>
          <h1 className="mt-3 font-serif text-3xl font-medium text-ink">Acacia House Admin</h1>
          <p className="mt-3 text-sm leading-relaxed text-body">
            Sign in to see reservations and update the menu.
          </p>
          <form onSubmit={onLogin} className="mt-7">
            {loginError && (
              <div role="alert" className="mb-5 border border-clay/50 bg-clay/10 px-4 py-3 text-sm text-clay">
                {loginError}
              </div>
            )}
            <label htmlFor="admin-password" className="field-label">
              Staff password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="Enter the staff password"
              autoComplete="current-password"
              autoFocus
            />
            <button type="submit" disabled={loggingIn} className="btn btn-primary mt-6 w-full disabled:opacity-60">
              {loggingIn ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <a href="#home" className="mt-6 block text-center text-sm text-mute hover:text-clay">
            ← Back to the website
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory font-sans text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 px-5 py-4 sm:px-8">
          <div className="mr-auto">
            <p className="font-serif text-xl font-medium">Acacia House · Staff</p>
          </div>
          <nav className="flex gap-2" aria-label="Admin sections">
            <button
              type="button"
              onClick={() => setTab("bookings")}
              className={`rounded-[4px] px-4 py-2 text-sm font-medium transition-colors ${
                tab === "bookings" ? "bg-ink text-ivory" : "text-body hover:bg-sand"
              }`}
            >
              Reservations
            </button>
            <button
              type="button"
              onClick={() => setTab("menu")}
              className={`rounded-[4px] px-4 py-2 text-sm font-medium transition-colors ${
                tab === "menu" ? "bg-ink text-ivory" : "text-body hover:bg-sand"
              }`}
            >
              Menu & Bar
            </button>
          </nav>
          <a href="#home" className="text-sm text-mute hover:text-clay">
            View website
          </a>
          <button type="button" onClick={onLogout} className="text-sm font-medium text-clay hover:underline">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
        {tab === "bookings" ? (
          <BookingsTab onSessionExpired={onSessionExpired} />
        ) : (
          <MenuTab onSessionExpired={onSessionExpired} />
        )}
      </main>
    </div>
  );
}

export function sessionExpired(err: unknown, onSessionExpired: () => void): boolean {
  if (err instanceof ApiError && err.status === 401) {
    onSessionExpired();
    return true;
  }
  return false;
}
