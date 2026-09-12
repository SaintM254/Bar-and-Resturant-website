import { useCallback, useEffect, useState } from "react";
import {
  adminListReservations,
  adminSetStatus,
  adminStats,
  type AdminReservation,
  type AdminStats,
} from "../../lib/api";
import { sessionExpired } from "./AdminApp";
import { BookingReceiptModal } from "../BookingReceipt";

type Status = AdminReservation["status"];

const STATUS_LABEL: Record<Status, string> = {
  pending: "New",
  confirmed: "Confirmed",
  seated: "Seated",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

const STATUS_PILL: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  seated: "bg-sky-100 text-sky-900",
  cancelled: "bg-rose-100 text-rose-900",
  "no-show": "bg-stone-200 text-stone-700",
};

const NEXT_ACTIONS: Record<Status, { label: string; to: Status; primary?: boolean }[]> = {
  pending: [
    { label: "Confirm", to: "confirmed", primary: true },
    { label: "Cancel", to: "cancelled" },
  ],
  confirmed: [
    { label: "Seat", to: "seated", primary: true },
    { label: "No-show", to: "no-show" },
    { label: "Cancel", to: "cancelled" },
  ],
  seated: [{ label: "No-show", to: "no-show" }],
  cancelled: [{ label: "Re-open as new", to: "pending" }],
  "no-show": [{ label: "Re-open as new", to: "pending" }],
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BookingsTab({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rows, setRows] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [receipt, setReceipt] = useState<AdminReservation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, list] = await Promise.all([
        adminStats(),
        adminListReservations({
          upcoming: upcomingOnly,
          date: dateFilter || undefined,
          status: statusFilter || undefined,
        }),
      ]);
      setStats(s);
      setRows(list.reservations);
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        setError(err instanceof Error ? err.message : "Could not load reservations.");
      }
    } finally {
      setLoading(false);
    }
  }, [upcomingOnly, dateFilter, statusFilter, onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: Status) => {
    setActingId(id);
    try {
      await adminSetStatus(id, status);
      await load();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not update the booking.");
      }
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-medium">Reservations</h2>
          <p className="mt-1 text-sm text-mute">New bookings from the website land here instantly.</p>
        </div>
        <button type="button" onClick={load} className="btn btn-outline btn-sm">
          Refresh
        </button>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Needs confirm", value: stats.pending },
            { label: "Today", value: stats.todayCount },
            { label: "Upcoming", value: stats.upcomingCount },
            { label: "Guests coming", value: stats.upcomingGuests },
          ].map((c) => (
            <div key={c.label} className="border border-line bg-parchment px-5 py-4">
              <p className="font-serif text-3xl font-medium">{c.value}</p>
              <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-mute">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-4 border border-line bg-parchment p-4">
        <label className="flex items-center gap-2 text-sm text-body">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
            className="h-4 w-4 accent-[#A05A2C]"
          />
          Upcoming only
        </label>
        <div>
          <label htmlFor="f-date" className="field-label">
            Day
          </label>
          <input
            id="f-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="field"
            style={{ width: "auto" }}
          />
        </div>
        <div>
          <label htmlFor="f-status" className="field-label">
            Status
          </label>
          <select
            id="f-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="field"
            style={{ width: "auto" }}
          >
            <option value="">All</option>
            {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setDateFilter("");
              setStatusFilter("");
            }}
            className="text-sm text-clay hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="mt-6 border border-clay/50 bg-clay/10 px-5 py-4 text-sm text-clay">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-mute">Loading reservations…</p>
      ) : rows.length === 0 ? (
        <div className="mt-8 border border-dashed border-line bg-parchment px-6 py-14 text-center">
          <p className="font-serif text-xl">No bookings here yet</p>
          <p className="mt-2 text-sm text-mute">
            Try the website booking form — new reservations will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="border border-line bg-parchment p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl font-medium">
                    {r.name}{" "}
                    <span className="ml-2 align-middle font-sans text-[12px] font-semibold tracking-wider text-mute">
                      {r.ref}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-body">
                    {formatDate(r.date)} · {r.time} · {r.guestsLabel}{" "}
                    {r.guestsCount > 1 ? "guests" : "guest"}
                  </p>
                  <p className="mt-1 text-sm">
                    <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="text-clay hover:underline">
                      {r.phone}
                    </a>
                  </p>
                  {r.request && <p className="mt-2 text-sm italic text-body">“{r.request}”</p>}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] ${STATUS_PILL[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                {NEXT_ACTIONS[r.status].map((a) => (
                  <button
                    key={a.to}
                    type="button"
                    disabled={actingId === r.id}
                    onClick={() => setStatus(r.id, a.to)}
                    className={a.primary ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  >
                    {actingId === r.id ? "…" : a.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setReceipt(r)}
                  className="btn btn-outline btn-sm"
                >
                  Receipt
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {receipt && (
        <BookingReceiptModal
          details={{
            ref: receipt.ref,
            name: receipt.name,
            phone: receipt.phone,
            date: receipt.date,
            time: receipt.time,
            guestsLabel: receipt.guestsLabel,
            request: receipt.request,
          }}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}
