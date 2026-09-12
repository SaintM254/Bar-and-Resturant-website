import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Printer, X } from "lucide-react";
import { SITE } from "../site";
import logoUrl from "../assets/logo.png";

export interface ReceiptDetails {
  ref: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guestsLabel: string;
  request?: string;
}

export function formatBookingDate(iso: string) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatGuests(label: string) {
  const g = label.trim();
  if (/guest/i.test(g)) return g;
  return `${g} ${g === "1" ? "guest" : "guests"}`;
}

function printReceipt() {
  document.body.classList.add("printing-receipt");
  const done = () => document.body.classList.remove("printing-receipt");
  window.addEventListener("afterprint", done, { once: true });
  window.setTimeout(done, 3000); // safety net for browsers without afterprint
  window.print();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export default function BookingReceipt({ details }: { details: ReceiptDetails }) {
  const [copied, setCopied] = useState(false);

  const rows: Array<[string, string]> = [
    ["Guest", details.name],
    ["Phone", details.phone],
    ["Date", formatBookingDate(details.date)],
    ["Time", details.time],
    ["Guests", formatGuests(details.guestsLabel)],
  ];
  if (details.request?.trim()) rows.push(["Request", details.request.trim()]);

  const onCopy = async () => {
    if (await copyText(details.ref)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full">
      <div
        id="booking-receipt"
        className="receipt-sheet mx-auto w-full max-w-[440px] border border-line bg-ivory text-left shadow-[0_18px_50px_-20px_rgba(60,40,20,0.35)]"
      >
        {/* Hotel header */}
        <div className="border-b border-line px-7 pb-6 pt-7 text-center">
          <img
            src={logoUrl}
            alt={`${SITE.name} logo`}
            className="mx-auto h-14 w-14 rounded-full border border-gold/60 object-cover"
          />
          <p className="mt-4 font-serif text-[22px] font-medium leading-tight text-ink">
            {SITE.name}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-gold">
            Table Reservation
          </p>
        </div>

        {/* Booking code */}
        <div className="border-b border-dashed border-gold/70 px-7 py-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-mute">
            Booking code
          </p>
          <p className="mt-2 text-[34px] font-semibold tracking-[0.1em] text-ink">
            {details.ref}
          </p>
          <p className="mt-2 text-sm text-body">Please show this code when you arrive.</p>
        </div>

        {/* Guest details */}
        <dl className="divide-y divide-line px-7 py-2">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[92px_1fr] gap-3 py-2.5">
              <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-mute">
                {k}
              </dt>
              <dd className="text-sm leading-relaxed text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Footer */}
        <div className="border-t border-dashed border-gold/70 px-7 py-5 text-center">
          <p className="text-[13px] leading-relaxed text-body">
            {SITE.address} · {SITE.phone}
          </p>
          <p className="mt-1 text-[13px] italic text-mute">
            We confirm by phone within the hour, 8:00 – 21:00. Asante!
          </p>
        </div>
      </div>

      {/* Screen-only actions */}
      <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={printReceipt}
          className="btn btn-primary btn-sm inline-flex items-center gap-2"
        >
          <Printer size={15} strokeWidth={2} />
          Print / Save PDF
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="btn btn-outline btn-sm inline-flex items-center gap-2"
        >
          {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={2} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
    </div>
  );
}

export function BookingReceiptModal({
  details,
  onClose,
}: {
  details: ReceiptDetails;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onKey]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Receipt for booking ${details.ref}`}
    >
      <div
        className="fixed inset-0 bg-[rgba(24,16,8,0.6)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[480px] py-10">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close receipt"
          className="no-print absolute -top-1 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-ink transition-colors hover:bg-cream"
        >
          <X size={18} strokeWidth={2} />
        </button>
        <BookingReceipt details={details} />
      </div>
    </div>
  );
}
