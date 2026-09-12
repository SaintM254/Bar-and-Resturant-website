import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  adminCreateDrink,
  adminCreateItem,
  adminDeleteDrink,
  adminDeleteItem,
  adminGetMenu,
  adminUpdateDrink,
  adminUpdateItem,
  type AdminDrink,
  type AdminMenuItem,
} from "../../lib/api";
import { sessionExpired } from "./AdminApp";

const CATEGORIES: { key: AdminMenuItem["category"]; label: string }[] = [
  { key: "featured", label: "House Favourites (front page)" },
  { key: "grill", label: "From the Charcoal Grill" },
  { key: "sides", label: "Sides & Small Plates" },
  { key: "mornings", label: "Mornings" },
];

const fmtKES = (n: number) => `KSh ${n.toLocaleString("en-KE")}`;

/* ---------------- dish row (view / edit) ---------------- */

function DishRow({
  item,
  onChanged,
  onSessionExpired,
}: {
  item: AdminMenuItem;
  onChanged: () => void;
  onSessionExpired: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    desc: item.desc,
    priceKES: String(item.priceKES),
    pexelsId: item.pexelsId ? String(item.pexelsId) : "",
    imageUrl: item.imageUrl ?? "",
    available: item.available,
  });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateItem(item.id, {
        name: form.name.trim(),
        desc: form.desc.trim(),
        priceKES: Number(form.priceKES),
        pexelsId: form.pexelsId.trim() === "" ? null : Number(form.pexelsId),
        imageUrl: form.imageUrl.trim() === "" ? null : form.imageUrl.trim(),
        available: form.available,
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not save the dish.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async () => {
    try {
      await adminUpdateItem(item.id, { available: !item.available });
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not update the dish.");
      }
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove “${item.name}” from the menu?`)) return;
    try {
      await adminDeleteItem(item.id);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not remove the dish.");
      }
    }
  };

  if (!editing) {
    return (
      <li
        className={`flex flex-wrap items-center gap-3 border-b border-line py-3 ${
          item.available ? "" : "opacity-55"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {item.name}{" "}
            {!item.available && (
              <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                Hidden
              </span>
            )}
          </p>
          <p className="truncate text-sm text-mute">{item.desc}</p>
        </div>
        <span className="text-[15px] font-medium text-clay">{fmtKES(item.priceKES)}</span>
        <button type="button" onClick={toggleAvailable} className="btn btn-outline btn-sm">
          {item.available ? "Hide" : "Show"}
        </button>
        <button type="button" onClick={() => setEditing(true)} className="btn btn-outline btn-sm">
          Edit
        </button>
        <button type="button" onClick={remove} className="btn btn-outline btn-sm btn-danger">
          Delete
        </button>
      </li>
    );
  }

  return (
    <li className="border border-gold/60 bg-ivory p-4">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="field-label">Dish name</label>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="field-label">Price (KSh, numbers only)</label>
          <input
            className="field"
            inputMode="numeric"
            value={form.priceKES}
            onChange={(e) => setForm({ ...form, priceKES: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Description</label>
          <textarea className="field resize-none" rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} required />
        </div>
        <div>
          <label className="field-label">Photo web address (optional)</label>
          <input
            className="field"
            placeholder="https://…"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Photo library id (optional)</label>
          <input
            className="field"
            placeholder="e.g. 37575745"
            value={form.pexelsId}
            onChange={(e) => setForm({ ...form, pexelsId: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-body sm:col-span-2">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="h-4 w-4 accent-[#A05A2C]"
          />
          Visible on the website
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={saving} className="btn btn-primary btn-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-outline btn-sm">
            Cancel
          </button>
        </div>
      </form>
    </li>
  );
}

/* ---------------- add-dish form ---------------- */

function AddDishForm({
  category,
  onChanged,
  onSessionExpired,
}: {
  category: AdminMenuItem["category"];
  onChanged: () => void;
  onSessionExpired: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreateItem({ name: name.trim(), desc: desc.trim(), priceKES: Number(price), category });
      setName("");
      setDesc("");
      setPrice("");
      setOpen(false);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not add the dish.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        + Add a dish
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border border-gold/60 bg-ivory p-4 sm:grid-cols-3">
      <div>
        <label className="field-label">Dish name</label>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="field-label">Price (KSh)</label>
        <input className="field" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>
      <div className="sm:col-span-3">
        <label className="field-label">Description</label>
        <input className="field" value={desc} onChange={(e) => setDesc(e.target.value)} required />
      </div>
      <div className="flex gap-2 sm:col-span-3">
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm disabled:opacity-60">
          {saving ? "Adding…" : "Add dish"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------------- drink row + add form ---------------- */

function DrinkRow({
  drink,
  onChanged,
  onSessionExpired,
}: {
  drink: AdminDrink;
  onChanged: () => void;
  onSessionExpired: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: drink.name, desc: drink.desc, priceKES: String(drink.priceKES) });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateDrink(drink.id, {
        name: form.name.trim(),
        desc: form.desc.trim(),
        priceKES: Number(form.priceKES),
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not save the drink.");
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove “${drink.name}” from the bar list?`)) return;
    try {
      await adminDeleteDrink(drink.id);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not remove the drink.");
      }
    }
  };

  if (!editing) {
    return (
      <li className="flex flex-wrap items-center gap-3 border-b border-line py-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{drink.name}</p>
          <p className="truncate text-sm text-mute">{drink.desc}</p>
        </div>
        <span className="text-[15px] font-medium text-clay">{fmtKES(drink.priceKES)}</span>
        <button type="button" onClick={() => setEditing(true)} className="btn btn-outline btn-sm">
          Edit
        </button>
        <button type="button" onClick={remove} className="btn btn-outline btn-sm btn-danger">
          Delete
        </button>
      </li>
    );
  }

  return (
    <li className="border border-gold/60 bg-ivory p-4">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="field-label">Name</label>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="field-label">Price (KSh)</label>
          <input className="field" inputMode="numeric" value={form.priceKES} onChange={(e) => setForm({ ...form, priceKES: e.target.value })} required />
        </div>
        <div className="sm:col-span-3">
          <label className="field-label">Description</label>
          <input className="field" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} required />
        </div>
        <div className="flex gap-2 sm:col-span-3">
          <button type="submit" disabled={saving} className="btn btn-primary btn-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-outline btn-sm">
            Cancel
          </button>
        </div>
      </form>
    </li>
  );
}

function AddDrinkForm({ onChanged, onSessionExpired }: { onChanged: () => void; onSessionExpired: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreateDrink({ name: name.trim(), desc: desc.trim(), priceKES: Number(price) });
      setName("");
      setDesc("");
      setPrice("");
      setOpen(false);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not add the drink.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        + Add a drink
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border border-gold/60 bg-ivory p-4 sm:grid-cols-3">
      <div>
        <label className="field-label">Name</label>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="field-label">Price (KSh)</label>
        <input className="field" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>
      <div className="sm:col-span-3">
        <label className="field-label">Description</label>
        <input className="field" value={desc} onChange={(e) => setDesc(e.target.value)} required />
      </div>
      <div className="flex gap-2 sm:col-span-3">
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm disabled:opacity-60">
          {saving ? "Adding…" : "Add drink"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------------- main tab ---------------- */

export default function MenuTab({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [drinks, setDrinks] = useState<AdminDrink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await adminGetMenu();
      setItems(m.items);
      setDrinks(m.drinks);
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        setError(err instanceof Error ? err.message : "Could not load the menu.");
      }
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h2 className="font-serif text-3xl font-medium">Menu & Bar</h2>
      <p className="mt-1 text-sm text-mute">
        Changes here appear on the website immediately after a refresh.
      </p>

      {error && (
        <div role="alert" className="mt-6 border border-clay/50 bg-clay/10 px-5 py-4 text-sm text-clay">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-mute">Loading menu…</p>
      ) : (
        <div className="mt-8 space-y-10">
          {CATEGORIES.map((cat) => (
            <section key={cat.key} className="border border-line bg-parchment p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-medium">{cat.label}</h3>
                <AddDishForm category={cat.key} onChanged={load} onSessionExpired={onSessionExpired} />
              </div>
              <ul className="mt-2">
                {items.filter((i) => i.category === cat.key).length === 0 && (
                  <li className="py-4 text-sm text-mute">Nothing here yet — add the first dish above.</li>
                )}
                {items
                  .filter((i) => i.category === cat.key)
                  .map((item) => (
                    <DishRow key={item.id} item={item} onChanged={load} onSessionExpired={onSessionExpired} />
                  ))}
              </ul>
            </section>
          ))}

          <section className="border border-line bg-parchment p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-xl font-medium">The Bar</h3>
              <AddDrinkForm onChanged={load} onSessionExpired={onSessionExpired} />
            </div>
            <ul className="mt-2">
              {drinks.length === 0 && (
                <li className="py-4 text-sm text-mute">Nothing here yet — add the first drink above.</li>
              )}
              {drinks.map((drink) => (
                <DrinkRow key={drink.id} drink={drink} onChanged={load} onSessionExpired={onSessionExpired} />
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
