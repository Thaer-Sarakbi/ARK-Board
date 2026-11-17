"use client";

import { useState } from "react";
import { CATEGORY_LABEL, STATUS, STATUS_KEYS, type RoomStatus } from "@/lib/constants";
import { deleteRoom, type Room } from "@/lib/rooms";
import { firebaseErrorMessage, formatRM, formatTime } from "@/lib/format";
import { GuestFormModal, StatusConfirmModal } from "./GuestModals";
import { ErrorBanner } from "./ui";

function InfoGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 rounded-lg bg-page px-3.5 py-3 text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <span className="text-muted">{k}</span>
          <span className="min-w-0 break-words text-ink tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  );
}

/** Rendered with key={room.id} so local state resets when another room is selected. */
export default function RoomPanel({ room, onClose }: { room: Room; onClose: () => void }) {
  const [pending, setPending] = useState<RoomStatus | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  const target = pending ?? room.status;
  const changed = target !== room.status;
  const isEmpty = room.status === "empty";
  const color = STATUS[room.status].color;

  async function doDelete() {
    setDeleting(true);
    setErr("");
    try {
      await deleteRoom(room);
      onClose();
    } catch (e) {
      setErr(firebaseErrorMessage(e));
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-10 flex max-h-[calc(100vh-48px)] w-[300px] max-w-[calc(100vw-48px)] flex-col gap-3.5 overflow-y-auto rounded-xl border border-line bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] text-white tabular-nums"
              style={{ background: color }}
            >
              {room.roomNumber}
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="text-[16px] font-medium">Room {room.roomNumber}</div>
              <div className="text-[13px] text-muted">{CATEGORY_LABEL[room.category]} room</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer border-0 bg-transparent p-1 text-[22px] leading-none text-muted"
          >
            ×
          </button>
        </div>

        {isEmpty ? (
          <>
            <InfoGrid rows={[["Check-out time", formatTime(room.checkOut)]]} />
            <div className="text-[14px] text-body">Available tonight.</div>
          </>
        ) : (
          <>
            <div className="text-[14px] text-body">
              {room.status === "occupied" ? "Checked in." : "Online reservation."}
            </div>
            <InfoGrid
              rows={[
                ["Guest", room.guest ?? ""],
                ["ID number", room.idNumber ?? ""],
                ["Check-in time", formatTime(room.checkIn)],
                ["Nights", room.nights ?? ""],
                ["Paid", formatRM(room.paid)],
                [
                  "Phone",
                  room.phoneNumber ? (
                    <a href={`tel:${room.phoneNumber}`} className="text-ink no-underline">
                      {room.phoneNumber}
                    </a>
                  ) : (
                    ""
                  ),
                ],
              ]}
            />
          </>
        )}

        <button
          onClick={() => setGuestOpen(true)}
          className="cursor-pointer rounded-lg border border-ink bg-white px-1.5 py-2.5 text-[14px] text-ink"
        >
          {isEmpty ? "Add guest" : "Edit guest info"}
        </button>

        <div className="flex flex-col gap-1.5">
          <div className="text-[12px] uppercase tracking-[.06em] text-muted">Set status</div>
          <div className="flex gap-1.5">
            {STATUS_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setPending(k)}
                className="flex-1 cursor-pointer rounded-lg border px-1.5 py-[9px] text-[13px]"
                style={{
                  borderColor: STATUS[k].color,
                  background: target === k ? STATUS[k].color : "#fff",
                  color: target === k ? "#fff" : "#1d1d1f",
                }}
              >
                {STATUS[k].short}
              </button>
            ))}
          </div>
          <button
            onClick={() => changed && setConfirming(true)}
            disabled={!changed}
            className={`mt-1 rounded-lg border-0 px-1.5 py-2.5 text-[14px] text-white ${changed ? "cursor-pointer bg-ink" : "cursor-not-allowed bg-disabled"}`}
          >
            Submit status
          </button>
        </div>

        <div className="flex flex-col gap-2 border-t border-divider pt-3.5">
          {err && <ErrorBanner>{err}</ErrorBanner>}
          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              className="cursor-pointer rounded-lg border border-input bg-white px-1.5 py-[9px] text-[13px] text-error"
            >
              Delete room
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-[14px] text-body">Delete room {room.roomNumber} from this hotel?</div>
              <div className="flex gap-1.5">
                <button
                  onClick={doDelete}
                  disabled={deleting}
                  className="flex-1 cursor-pointer rounded-lg border-0 bg-error px-1.5 py-[9px] text-[13px] text-white"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="flex-1 cursor-pointer rounded-lg border border-input bg-white px-1.5 py-[9px] text-[13px] text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirming && (
        <StatusConfirmModal
          room={room}
          to={target}
          onClose={() => setConfirming(false)}
          onDone={() => {
            setConfirming(false);
            setPending(null);
          }}
        />
      )}
      {guestOpen && <GuestFormModal room={room} onClose={() => setGuestOpen(false)} />}
    </>
  );
}
