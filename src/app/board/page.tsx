"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import AuthGuard, { Spinner } from "@/components/AuthGuard";
import RoomPanel from "@/components/RoomPanel";
import { HotelSelect, LogoutButton, UserName } from "@/components/ui";
import { CATEGORIES, STATUS, defaultHotel, type RoomStatus } from "@/lib/constants";
import { subscribeHotelRooms } from "@/lib/rooms";
import { useAuth } from "@/store/auth";
import { useBoard, type Filter } from "@/store/board";

export default function BoardPage() {
  return (
    <AuthGuard>
      <Board />
    </AuthGuard>
  );
}

function Board() {
  const placeName = useAuth((s) => s.profile?.placeName);
  const { hotel, rooms, loaded, error, filter, selectedId, setHotel, setCategoryRooms, setError, setFilter, select } =
    useBoard();

  useEffect(() => {
    if (!hotel) setHotel(defaultHotel(placeName));
  }, [hotel, placeName, setHotel]);

  useEffect(() => {
    if (!hotel) return;
    return subscribeHotelRooms(
      hotel,
      (cat, list) => {
        setCategoryRooms(cat, list);
        setError(null);
      },
      (e) => {
        console.error(e);
        setError("Couldn't load live room data. Check your connection or permissions.");
      },
    );
  }, [hotel, setCategoryRooms, setError]);

  const all = useMemo(() => [...rooms.double, ...rooms.triple, ...rooms.quad], [rooms]);
  const selected = all.find((r) => r.id === selectedId) ?? null;

  // Close the panel if the selected room was deleted (here or by another counter).
  useEffect(() => {
    if (selectedId && !selected && loaded.double && loaded.triple && loaded.quad) select(null);
  }, [selectedId, selected, loaded, select]);

  if (!hotel) return <Spinner />;

  const count = (list: typeof all, s: RoomStatus) => list.filter((r) => r.status === s).length;
  const filters: { key: Filter; label: string; color: string; n: number }[] = [
    { key: "all", label: "All rooms", color: "#c9c9c2", n: all.length },
    ...(["empty", "occupied", "online"] as RoomStatus[]).map((k) => ({
      key: k,
      label: STATUS[k].label,
      color: STATUS[k].color,
      n: count(all, k),
    })),
  ];
  const allLoaded = loaded.double && loaded.triple && loaded.quad;

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-4 pb-16 pt-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-end gap-4">
        <div className="mr-auto flex flex-col gap-1">
          <div className="text-[13px] uppercase tracking-[.08em] text-muted">ARK Board</div>
          <h1 className="m-0 text-[28px] font-medium">{hotel}</h1>
          <Link
            href="/add-room"
            className="mt-1 self-start border-b border-disabled pb-0.5 text-[14px] text-ink no-underline hover:text-[#555]"
          >
            + Add a room
          </Link>
        </div>
        <label className="flex w-full flex-col gap-1.5 text-[13px] text-muted sm:w-auto">
          Hotel
          <HotelSelect value={hotel} onChange={setHotel} className="px-3 py-2.5 sm:min-w-[260px]" />
        </label>
        <div className="flex items-center gap-3">
          <UserName />
          <LogoutButton />
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-input px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: error ? STATUS.empty.color : "oklch(0.62 0.17 150)",
                boxShadow: error ? "none" : "0 0 0 4px oklch(0.62 0.17 150 / .18)",
              }}
            />
            <span className="text-[17px] font-medium">Live</span>
            <span className="text-[14px] text-muted">Real-time room status</span>
          </div>
          {!allLoaded && !error && <span className="text-[14px] text-secondary">Connecting…</span>}
        </div>
        {error && (
          <div className="border-b border-input bg-error-bg px-5 py-3 text-[14px] text-error-fg">{error}</div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-input px-5 py-3.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] text-ink"
              style={{
                borderColor: filter === f.key ? "#1d1d1f" : "#e0e0da",
                background: filter === f.key ? "#f0f0ec" : "#fff",
              }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: f.color }} />
              <span className="whitespace-nowrap">{f.label}</span>
              <span className="text-muted tabular-nums">{f.n}</span>
            </button>
          ))}
        </div>

        {CATEGORIES.map((c) => {
          const list = rooms[c.key];
          return (
            <section key={c.key} className="flex flex-col gap-4 border-b border-divider px-5 pb-6 pt-5 last:border-b-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="m-0 text-[17px] font-medium">{c.title}</h2>
                <div className="text-[13px] text-muted tabular-nums">
                  {list.length} rooms · {count(list, "empty")} empty · {count(list, "occupied")} occupied ·{" "}
                  {count(list, "online")} online
                </div>
              </div>
              {list.length === 0 ? (
                <div className="text-[14px] text-muted">{loaded[c.key] ? "No rooms yet." : "Loading…"}</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] justify-items-center gap-x-2 gap-y-3">
                  {list.map((r) => {
                    const isSel = r.id === selectedId;
                    return (
                      <button
                        key={r.id}
                        onClick={() => select(isSel ? null : r.id)}
                        title={`Room ${r.roomNumber} — ${STATUS[r.status].label}`}
                        className="h-11 w-11 cursor-pointer rounded-full border-0 text-[15px] text-white tabular-nums transition-[opacity,box-shadow] duration-150"
                        style={{
                          background: STATUS[r.status].color,
                          opacity: filter === "all" || filter === r.status ? 1 : 0.15,
                          boxShadow: isSel ? "0 0 0 3px #fff, 0 0 0 5px #1d1d1f" : "none",
                          fontSize: r.roomNumber.length > 3 ? 12 : 15,
                        }}
                      >
                        {r.roomNumber}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {selected && <RoomPanel key={selected.id} room={selected} onClose={() => select(null)} />}
    </div>
  );
}
