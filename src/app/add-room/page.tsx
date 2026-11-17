"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { HotelSelect, LogoutButton, UserName } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABEL, STATUS, defaultHotel, type Category } from "@/lib/constants";
import { addRoom, RoomExistsError } from "@/lib/rooms";
import { validateRoomNumber } from "@/lib/validation";
import { firebaseErrorMessage } from "@/lib/format";
import { useAuth } from "@/store/auth";

export default function AddRoomPage() {
  return (
    <AuthGuard>
      <AddRoom />
    </AuthGuard>
  );
}

function AddRoom() {
  const placeName = useAuth((s) => s.profile?.placeName);
  const [hotel, setHotel] = useState(() => defaultHotel(placeName));
  const [cat, setCat] = useState<Category>("double");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const num = number.trim();
    const v = validateRoomNumber(num);
    if (v) {
      setError(v);
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await addRoom(hotel, cat, num);
      setNumber("");
      setSuccess(`Room ${num} (${CATEGORY_LABEL[cat]}) added to ${hotel}.`);
    } catch (ex) {
      setError(ex instanceof RoomExistsError ? ex.message : firebaseErrorMessage(ex));
    } finally {
      setSaving(false);
    }
  }

  const lbl = "flex flex-col gap-1.5 text-[13px] text-muted";
  const sel = "cursor-pointer rounded-lg border border-input bg-white p-3 text-[16px] text-ink";

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6 px-4 pb-16 pt-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-[13px] uppercase tracking-[.08em] text-muted">ARK Board</div>
          <h1 className="m-0 text-[28px] font-medium">Add a room</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/board"
            className="border-b border-disabled pb-0.5 text-[15px] text-ink no-underline hover:text-[#555]"
          >
            ← ARK Board
          </Link>
          <UserName />
          <LogoutButton />
        </div>
      </header>

      <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-xl border border-line bg-white p-6">
        <label className={lbl}>
          Hotel
          <HotelSelect
            value={hotel}
            onChange={(h) => {
              setHotel(h);
              setError("");
            }}
            className="p-3"
          />
        </label>
        <label className={lbl}>
          Category
          <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className={sel}>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className={lbl}>
          Room number
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 214"
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              setError("");
            }}
            className={`rounded-lg border bg-white p-3 text-[16px] text-ink tabular-nums outline-none focus:border-ink ${error ? "border-empty" : "border-input"}`}
          />
          {error && <span className="text-[13px] text-error">{error}</span>}
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 text-[14px] text-body">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] text-white tabular-nums"
              style={{ background: STATUS.empty.color }}
            >
              {number.trim() || "—"}
            </span>
            <span>New rooms start as empty</span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`cursor-pointer rounded-lg border-0 px-[22px] py-3 text-[15px] text-white ${saving ? "bg-secondary" : "bg-ink"}`}
          >
            {saving ? "Adding…" : "Add room"}
          </button>
        </div>
      </form>

      {success && (
        <div className="rounded-[10px] bg-success-bg px-[18px] py-3.5 text-[14px] text-success-fg">{success}</div>
      )}
    </div>
  );
}
