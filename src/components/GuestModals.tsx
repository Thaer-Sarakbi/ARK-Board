"use client";

import { useState } from "react";
import { STATUS, type RoomStatus } from "@/lib/constants";
import { setRoomEmpty, setRoomGuest, updateGuest, type Room } from "@/lib/rooms";
import { emptyGuestForm, validateGuest, type GuestErrors, type GuestForm } from "@/lib/validation";
import { firebaseErrorMessage } from "@/lib/format";
import GuestFields from "./GuestFields";
import { ErrorBanner, Modal } from "./ui";

function formFromRoom(r: Room): GuestForm {
  if (r.status === "empty" || !r.guest) return emptyGuestForm();
  return {
    guest: r.guest ?? "",
    idNumber: r.idNumber ?? "",
    phoneNumber: r.phoneNumber ?? "",
    nights: r.nights != null ? String(r.nights) : "1",
    paid: r.paid != null ? String(r.paid) : "0",
  };
}

function useGuestForm(room: Room) {
  const [form, setForm] = useState<GuestForm>(() => formFromRoom(room));
  const [errors, setErrors] = useState<GuestErrors>({});
  const onChange = (k: keyof GuestForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const validate = () => {
    const r = validateGuest(form);
    setErrors(r.errors);
    return r.data;
  };
  return { form, errors, onChange, validate };
}

function Buttons({ onCancel, label, saving }: { onCancel: () => void; label: string; saving: boolean }) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 cursor-pointer rounded-lg border border-input bg-white p-[11px] text-[14px] text-ink"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className={`flex-1 cursor-pointer rounded-lg border-0 p-[11px] text-[14px] text-white ${saving ? "bg-secondary" : "bg-ink"}`}
      >
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}

function Circle({ number, color }: { number: string; color: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] text-white tabular-nums"
      style={{ background: color }}
    >
      {number}
    </span>
  );
}

/** "Edit guest info" (occupied/online rooms) or "Add guest" (empty rooms → check-in). */
export function GuestFormModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const isAdd = room.status === "empty";
  const g = useGuestForm(room);
  const [type, setType] = useState<"occupied" | "online">("occupied");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = g.validate();
    if (!data) return;
    setSaving(true);
    setErr("");
    try {
      if (isAdd) await setRoomGuest(room, type, data);
      else await updateGuest(room, data);
      onClose();
    } catch (ex) {
      setErr(firebaseErrorMessage(ex));
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} label={isAdd ? "Add guest" : "Edit guest info"}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="m-0 text-[18px] font-medium">{isAdd ? "Add guest" : "Edit guest info"}</h3>
            <div className="text-[13px] text-muted">Room {room.roomNumber}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer border-0 bg-transparent p-1 text-[22px] leading-none text-muted"
          >
            ×
          </button>
        </div>
        {isAdd && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12px] uppercase tracking-[.06em] text-muted">Booking type</div>
            <div className="flex gap-1.5">
              {(
                [
                  ["occupied", "Walk-in (occupied)"],
                  ["online", "Online booking"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k)}
                  className="flex-1 cursor-pointer rounded-lg border px-1.5 py-[9px] text-[13px]"
                  style={{
                    borderColor: STATUS[k].color,
                    background: type === k ? STATUS[k].color : "#fff",
                    color: type === k ? "#fff" : "#1d1d1f",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        <GuestFields form={g.form} errors={g.errors} onChange={g.onChange} />
        {err && <ErrorBanner>{err}</ErrorBanner>}
        <Buttons onCancel={onClose} label={isAdd ? "Check in guest" : "Save guest"} saving={saving} />
      </form>
    </Modal>
  );
}

/** "Change room status?" confirmation. Collects guest data when moving to occupied/online. */
export function StatusConfirmModal({
  room,
  to,
  onClose,
  onDone,
}: {
  room: Room;
  to: RoomStatus;
  onClose: () => void;
  onDone: () => void;
}) {
  const g = useGuestForm(room);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const needsGuest = to !== "empty";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let data;
    if (needsGuest) {
      data = g.validate();
      if (!data) return;
    }
    setSaving(true);
    setErr("");
    try {
      if (to === "empty") await setRoomEmpty(room);
      else await setRoomGuest(room, to, data!);
      onDone();
    } catch (ex) {
      setErr(firebaseErrorMessage(ex));
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} label="Change room status">
      <form onSubmit={submit} noValidate className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-2">
          <h3 className="m-0 text-[18px] font-medium">Change room status?</h3>
          <div className="text-[14px] text-body [text-wrap:pretty]">
            Room {room.roomNumber} will change from{" "}
            <strong className="font-medium">{STATUS[room.status].label}</strong> to{" "}
            <strong className="font-medium">{STATUS[to].label}</strong>.
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Circle number={room.roomNumber} color={STATUS[room.status].color} />
          <span className="text-muted">→</span>
          <Circle number={room.roomNumber} color={STATUS[to].color} />
        </div>
        {needsGuest && (
          <div className="flex flex-col gap-3.5 border-t border-divider pt-4">
            <div className="text-[12px] uppercase tracking-[.06em] text-muted">Guest info</div>
            <GuestFields form={g.form} errors={g.errors} onChange={g.onChange} />
          </div>
        )}
        {err && <ErrorBanner>{err}</ErrorBanner>}
        <Buttons onCancel={onClose} label="Confirm" saving={saving} />
      </form>
    </Modal>
  );
}
