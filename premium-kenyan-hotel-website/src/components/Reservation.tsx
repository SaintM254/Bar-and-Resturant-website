import { useState, type FormEvent } from "react";
import { CONTACT } from "../data";
import { ApiError, createReservation } from "../lib/api";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

const TIME_SLOTS = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
];

const GUESTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9+ (Group)"];

interface FormState {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  request: string;
}

const initialForm: FormState = {
  name: "",
  phone: "",
  date: "",
  time: "7:00 PM",
  guests: "2",
  request: "",
};

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

export default function Reservation() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const displayDate = form.date
    ? new Date(`${form.date}T12:00:00`).toLocaleDateString("en-KE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <section id="reserve" className="border-b border-line bg-ivory py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: invitation */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel num="06" title="Reservations" />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-7 font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.01em] text-ink">
                Reserve Your Table
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-md text-[15.5px] leading-[1.85] text-body">
                Tell us when you would like to come and we will keep a table ready. For parties of
                nine or more, call us and we will set the long table on the terrace.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 divide-y divide-line border-y border-line">
                <div className="grid grid-cols-[120px_1fr] gap-4 py-3.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                    Phone
                  </span>
                  <a href="tel:+254712345678" className="text-sm text-body hover:text-clay">
                    {CONTACT.phone}
                  </a>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-4 py-3.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                    Walk-ins
                  </span>
                  <span className="text-sm text-body">Always welcome, whenever there is room</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-4 py-3.5">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute">
                    Kitchen
                  </span>
                  <span className="text-sm text-body">
                    Breakfast 6:30 — 10:30 · All day from 12:00
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal delay={150} className="lg:col-span-7">
            {submitted ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center border border-line bg-parchment px-6 py-16 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gold">
                  Request received
                </p>
                <h3 className="mt-4 font-serif text-3xl font-medium text-ink">
                  Asante, {form.name.split(" ")[0] || "friend"}.
                </h3>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-body">
                  We have your request for{" "}
                  <span className="font-medium text-ink">{form.guests} guest(s)</span>
                  {form.date && (
                    <>
                      {" "}
                      on <span className="font-medium text-ink">{displayDate}</span>
                    </>
                  )}{" "}
                  at <span className="font-medium text-ink">{form.time}</span>. We will confirm by
                  phone within the hour, between 8:00 and 21:00.
                </p>
                {bookingRef && (
                  <p className="mt-6 inline-block border border-dashed border-gold bg-ivory px-5 py-3 text-sm text-body">
                    Booking reference:{" "}
                    <span className="font-semibold tracking-wider text-ink">{bookingRef}</span>
                    <span className="mt-1 block text-[13px] text-mute">
                      Please show this code when you arrive.
                    </span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setBookingRef("");
                    setForm(initialForm);
                  }}
                  className="btn btn-outline mt-9"
                >
                  Make Another Reservation
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="border border-line bg-parchment p-6 sm:p-9">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="r-name" className="field-label">
                      Name
                    </label>
                    <input
                      id="r-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your full name"
                      className="field"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="r-phone" className="field-label">
                      Phone
                    </label>
                    <input
                      id="r-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="field"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="r-date" className="field-label">
                      Date
                    </label>
                    <input
                      id="r-date"
                      type="date"
                      required
                      min={today}
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="r-time" className="field-label">
                      Time
                    </label>
                    <select
                      id="r-time"
                      required
                      value={form.time}
                      onChange={(e) => update("time", e.target.value)}
                      className="field"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="r-guests" className="field-label">
                      Number of Guests
                    </label>
                    <select
                      id="r-guests"
                      required
                      value={form.guests}
                      onChange={(e) => update("guests", e.target.value)}
                      className="field"
                    >
                      {GUESTS.map((g) => (
                        <option key={g} value={g}>
                          {g === "1" ? "1 guest" : g.includes("+") ? g : `${g} guests`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="r-request" className="field-label">
                      Special Request <span className="normal-case text-mute/70">(optional)</span>
                    </label>
                    <textarea
                      id="r-request"
                      rows={4}
                      value={form.request}
                      onChange={(e) => update("request", e.target.value)}
                      placeholder="A quiet corner, a birthday, dietary needs — anything we should know."
                      className="field resize-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-primary mt-7 w-full sm:w-auto disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Make Reservation"}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
