// Talks to the Acacia House backend.
// - In local preview the dev server forwards /api to the backend (see vite.config.ts).
// - For a hosted backend, rebuild with:  VITE_API_URL=https://your-api.example.com npm run build

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export interface ApiMenuItem {
  id: string;
  name: string;
  desc: string;
  price: string;
  img: string;
  thumb: string;
  available: boolean;
}

export interface ApiDrink {
  id: string;
  name: string;
  desc: string;
  price: string;
  available: boolean;
}

export interface ApiMenu {
  featured: ApiMenuItem[];
  groups: { group: string; items: ApiMenuItem[] }[];
  drinks: ApiDrink[];
}

export interface ReservationInput {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  request: string;
}

export interface BookingResult {
  ref: string;
  name: string;
  date: string;
  time: string;
  guests: string;
}

export interface AdminReservation extends ReservationInput {
  id: string;
  ref: string;
  guestsLabel: string;
  guestsCount: number;
  status: "pending" | "confirmed" | "seated" | "cancelled" | "no-show";
  source: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminStats {
  today: string;
  pending: number;
  todayCount: number;
  upcomingCount: number;
  upcomingGuests: number;
}

export interface AdminMenuItem {
  id: string;
  name: string;
  desc: string;
  priceKES: number;
  pexelsId: number | null;
  imageUrl: string | null;
  category: "featured" | "grill" | "sides" | "mornings";
  available: boolean;
}

export interface AdminDrink {
  id: string;
  name: string;
  desc: string;
  priceKES: number;
  available: boolean;
}

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function req<T>(path: string, init?: RequestInit, timeoutMs = 9000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      fields?: Record<string, string>;
    } & T;
    if (!res.ok) {
      throw new ApiError(res.status, data.error || "Something went wrong.", data.fields);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "Could not reach the server. Please check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}

const TOKEN_KEY = "ah_admin_token";
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY);

async function adminReq<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  try {
    return await req<T>(path, {
      ...init,
      headers: { ...(init?.headers || {}), Authorization: `Bearer ${token ?? ""}` },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) setToken(null);
    throw err;
  }
}

/* ---------- public ---------- */

export const getMenu = () => req<ApiMenu>("/api/menu");

export const createReservation = (input: ReservationInput) =>
  req<{ message: string; reservation: BookingResult }>(
    "/api/reservations",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    45000 // free-tier backends nap when idle; the first request can take ~30s to wake them
  );

/* ---------- staff ---------- */

export const adminLogin = async (password: string) => {
  const data = await req<{ message: string; token: string; expiresAt: string }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  setToken(data.token);
  return data;
};

export const adminLogout = async () => {
  try {
    await adminReq("/api/admin/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
};

export const adminStats = () => adminReq<AdminStats>("/api/admin/stats");

export const adminListReservations = (params: { date?: string; status?: string; upcoming?: boolean }) => {
  const q = new URLSearchParams();
  if (params.date) q.set("date", params.date);
  if (params.status) q.set("status", params.status);
  if (params.upcoming) q.set("upcoming", "1");
  const qs = q.toString();
  return adminReq<{ reservations: AdminReservation[] }>(`/api/admin/reservations${qs ? `?${qs}` : ""}`);
};

export const adminSetStatus = (id: string, status: AdminReservation["status"]) =>
  adminReq<{ message: string; reservation: AdminReservation }>(`/api/admin/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const adminGetMenu = () => adminReq<{ items: AdminMenuItem[]; drinks: AdminDrink[] }>("/api/admin/menu");

export const adminCreateItem = (item: {
  name: string;
  desc: string;
  priceKES: number;
  category: AdminMenuItem["category"];
  pexelsId?: number | null;
  imageUrl?: string | null;
  available?: boolean;
}) =>
  adminReq<{ message: string; item: AdminMenuItem }>("/api/admin/menu/items", {
    method: "POST",
    body: JSON.stringify(item),
  });

export const adminUpdateItem = (id: string, patch: Partial<AdminMenuItem>) =>
  adminReq<{ message: string; item: AdminMenuItem }>(`/api/admin/menu/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });

export const adminDeleteItem = (id: string) =>
  adminReq<{ message: string }>(`/api/admin/menu/items/${id}`, { method: "DELETE" });

export const adminCreateDrink = (drink: { name: string; desc: string; priceKES: number; available?: boolean }) =>
  adminReq<{ message: string; drink: AdminDrink }>("/api/admin/menu/drinks", {
    method: "POST",
    body: JSON.stringify(drink),
  });

export const adminUpdateDrink = (id: string, patch: Partial<AdminDrink>) =>
  adminReq<{ message: string; drink: AdminDrink }>(`/api/admin/menu/drinks/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });

export const adminDeleteDrink = (id: string) =>
  adminReq<{ message: string }>(`/api/admin/menu/drinks/${id}`, { method: "DELETE" });

export const isOnline = async () => {
  try {
    await req("/api/health", undefined, 5000);
    return true;
  } catch {
    return false;
  }
};
