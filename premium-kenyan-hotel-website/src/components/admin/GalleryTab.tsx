import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  adminCreateGalleryItem,
  adminDeleteGalleryItem,
  adminGetGallery,
  adminUpdateGalleryItem,
  resolveAsset,
  type AdminGalleryImage,
} from "../../lib/api";
import { sessionExpired } from "./AdminApp";

/* ---------------- photo row (view / edit) ---------------- */

function PhotoRow({
  photo,
  onChanged,
  onSessionExpired,
}: {
  photo: AdminGalleryImage;
  onChanged: () => void;
  onSessionExpired: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    caption: photo.caption,
    category: photo.category,
    position: String(photo.position),
    path: "",
    visible: photo.visible,
  });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateGalleryItem(photo.id, {
        caption: form.caption.trim(),
        category: form.category.trim(),
        position: Number(form.position),
        visible: form.visible,
        ...(form.path.trim() === "" ? {} : { path: form.path.trim() }),
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not save the photo.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async () => {
    try {
      await adminUpdateGalleryItem(photo.id, { visible: !photo.visible });
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not update the photo.");
      }
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove “${photo.caption}” from the gallery?`)) return;
    try {
      await adminDeleteGalleryItem(photo.id);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not remove the photo.");
      }
    }
  };

  if (!editing) {
    return (
      <li
        className={`flex flex-wrap items-center gap-3 border-b border-line py-3 ${
          photo.visible ? "" : "opacity-55"
        }`}
      >
        <img
          src={resolveAsset(photo.path)}
          alt=""
          aria-hidden="true"
          className="h-14 w-[70px] shrink-0 rounded-[3px] border border-line object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {photo.caption}{" "}
            {!photo.visible && (
              <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                Hidden
              </span>
            )}
          </p>
          <p className="truncate text-sm text-mute">
            {photo.category} · position {photo.position}
          </p>
        </div>
        <button type="button" onClick={toggleVisible} className="btn btn-outline btn-sm">
          {photo.visible ? "Hide" : "Show"}
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
        <div className="sm:col-span-2">
          <label className="field-label">Caption</label>
          <input
            className="field"
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="field-label">Category</label>
          <input
            className="field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="field-label">Position (low numbers first)</label>
          <input
            className="field"
            inputMode="numeric"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Replace photo (paste a new image link, or leave blank)</label>
          <input
            className="field"
            placeholder="https://…"
            value={form.path}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
          />
          <p className="mt-1 text-[13px] text-mute">Current: {photo.path}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-body sm:col-span-2">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => setForm({ ...form, visible: e.target.checked })}
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

/* ---------------- add-photo form ---------------- */

function AddPhotoForm({ onChanged, onSessionExpired }: { onChanged: () => void; onSessionExpired: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [path, setPath] = useState("");
  const [position, setPosition] = useState("99");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreateGalleryItem({
        caption: caption.trim(),
        category: category.trim(),
        path: path.trim(),
        position: Number(position),
      });
      setCaption("");
      setCategory("");
      setPath("");
      setPosition("99");
      setOpen(false);
      onChanged();
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        alert(err instanceof Error ? err.message : "Could not add the photo.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        + Add a photo
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border border-gold/60 bg-ivory p-4 sm:grid-cols-2">
      <div>
        <label className="field-label">Caption</label>
        <input className="field" value={caption} onChange={(e) => setCaption(e.target.value)} required />
      </div>
      <div>
        <label className="field-label">Category (e.g. Restaurant, Bar, Rooms)</label>
        <input className="field" value={category} onChange={(e) => setCategory(e.target.value)} required />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label">Image link (https://…)</label>
        <input
          className="field"
          placeholder="Paste the link from your free image host (see the photo guide)"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="field-label">Position</label>
        <input className="field" inputMode="numeric" value={position} onChange={(e) => setPosition(e.target.value)} required />
      </div>
      <div className="flex items-end gap-2">
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm disabled:opacity-60">
          {saving ? "Adding…" : "Add photo"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------------- main tab ---------------- */

export default function GalleryTab({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [photos, setPhotos] = useState<AdminGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const g = await adminGetGallery();
      setPhotos(g.images);
    } catch (err) {
      if (!sessionExpired(err, onSessionExpired)) {
        setError(err instanceof Error ? err.message : "Could not load the gallery.");
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
      <h2 className="font-serif text-3xl font-medium">Gallery</h2>
      <p className="mt-1 text-sm text-mute">
        Changes here appear on the website immediately after a refresh.
      </p>
      <div className="mt-4 border border-gold/60 bg-ivory p-4 text-sm leading-relaxed text-body">
        Your 8 house photos are stored safely with the website code. To add <em>your own</em>{" "}
        photos, upload them to a free image host from your phone and paste the link via “Add a
        photo” — the step-by-step is in <strong>PHOTOS-AND-LOGO-GUIDE.md</strong>. Or simply ask
        your developer to add the files for you.
      </div>

      {error && (
        <div role="alert" className="mt-6 border border-clay/50 bg-clay/10 px-5 py-4 text-sm text-clay">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-mute">Loading gallery…</p>
      ) : (
        <section className="mt-6 border border-line bg-parchment p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-xl font-medium">Photos ({photos.length})</h3>
            <AddPhotoForm onChanged={load} onSessionExpired={onSessionExpired} />
          </div>
          <ul className="mt-2">
            {photos.length === 0 && (
              <li className="py-4 text-sm text-mute">No photos yet — add the first one above.</li>
            )}
            {photos.map((photo) => (
              <PhotoRow key={photo.id} photo={photo} onChanged={load} onSessionExpired={onSessionExpired} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
