"use client";

import { create } from "zustand";
import type { Category, RoomStatus } from "@/lib/constants";
import type { Room, RoomsByCategory } from "@/lib/rooms";

export type Filter = "all" | RoomStatus;

interface BoardState {
  hotel: string | null;
  rooms: RoomsByCategory;
  loaded: Record<Category, boolean>;
  error: string | null;
  filter: Filter;
  selectedId: string | null;
  setHotel: (h: string) => void;
  setCategoryRooms: (c: Category, rooms: Room[]) => void;
  setError: (e: string | null) => void;
  setFilter: (f: Filter) => void;
  select: (id: string | null) => void;
}

const emptyRooms = (): RoomsByCategory => ({ double: [], triple: [], quad: [] });
const notLoaded = () => ({ double: false, triple: false, quad: false });

export const useBoard = create<BoardState>((set) => ({
  hotel: null,
  rooms: emptyRooms(),
  loaded: notLoaded(),
  error: null,
  filter: "all",
  selectedId: null,
  setHotel: (hotel) =>
    set((s) =>
      s.hotel === hotel
        ? s
        : { hotel, rooms: emptyRooms(), loaded: notLoaded(), selectedId: null, filter: "all", error: null },
    ),
  setCategoryRooms: (c, rooms) =>
    set((s) => ({ rooms: { ...s.rooms, [c]: rooms }, loaded: { ...s.loaded, [c]: true } })),
  setError: (error) => set({ error }),
  setFilter: (filter) => set({ filter }),
  select: (selectedId) => set({ selectedId }),
}));
