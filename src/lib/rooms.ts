import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { CATEGORIES, type Category, type RoomStatus } from "./constants";

export interface Room {
  id: string; // `${category}/${roomNumber}`
  hotelName: string;
  category: Category;
  roomNumber: string;
  status: RoomStatus;
  guest?: string;
  idNumber?: string;
  phoneNumber?: string;
  nights?: number;
  paid?: number;
  checkIn?: Timestamp | null;
  checkOut?: Timestamp | null;
}

export interface GuestData {
  guest: string;
  idNumber: string;
  phoneNumber: string;
  nights: number;
  paid: number;
}

export type RoomsByCategory = Record<Category, Room[]>;

const roomRef = (hotel: string, category: Category, number: string) =>
  doc(db(), "rooms", hotel, category, number);

const VALID_STATUS: RoomStatus[] = ["empty", "occupied", "online"];

/** Live-subscribe to all three category subcollections of a hotel. Returns unsubscribe. */
export function subscribeHotelRooms(
  hotel: string,
  onData: (cat: Category, rooms: Room[]) => void,
  onError: (err: Error) => void,
): () => void {
  const unsubs = CATEGORIES.map(({ key }) =>
    onSnapshot(
      collection(db(), "rooms", hotel, key),
      (snap) => {
        const rooms = snap.docs.map((d) => {
          const data = d.data({ serverTimestamps: "estimate" });
          const status = VALID_STATUS.includes(data.status) ? (data.status as RoomStatus) : "empty";
          return {
            ...data,
            id: `${key}/${d.id}`,
            hotelName: hotel,
            category: key,
            roomNumber: d.id,
            status,
          } as Room;
        });
        rooms.sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber) || a.roomNumber.localeCompare(b.roomNumber));
        onData(key, rooms);
      },
      onError,
    ),
  );
  return () => unsubs.forEach((u) => u());
}

export function setRoomEmpty(room: Room) {
  return setDoc(
    roomRef(room.hotelName, room.category, room.roomNumber),
    {
      hotelName: room.hotelName,
      category: room.category,
      roomNumber: room.roomNumber,
      status: "empty",
      checkOut: serverTimestamp(),
      guest: deleteField(),
      idNumber: deleteField(),
      phoneNumber: deleteField(),
      nights: deleteField(),
      paid: deleteField(),
      checkIn: deleteField(),
    },
    { merge: true },
  );
}

export function setRoomGuest(room: Room, status: "occupied" | "online", g: GuestData) {
  return setDoc(
    roomRef(room.hotelName, room.category, room.roomNumber),
    {
      hotelName: room.hotelName,
      category: room.category,
      roomNumber: room.roomNumber,
      status,
      ...g,
      checkIn: serverTimestamp(),
      checkOut: deleteField(),
    },
    { merge: true },
  );
}

export function updateGuest(room: Room, g: GuestData) {
  return updateDoc(roomRef(room.hotelName, room.category, room.roomNumber), { ...g });
}

export class RoomExistsError extends Error {}

export async function addRoom(hotel: string, category: Category, number: string) {
  // Room numbers are unique per hotel across all categories.
  const existing = await Promise.all(CATEGORIES.map((c) => getDoc(roomRef(hotel, c.key, number))));
  if (existing.some((s) => s.exists())) throw new RoomExistsError(`Room ${number} already exists at ${hotel}.`);
  await setDoc(roomRef(hotel, category, number), {
    hotelName: hotel,
    category,
    roomNumber: number,
    status: "empty",
  });
}

export function deleteRoom(room: Room) {
  return deleteDoc(roomRef(room.hotelName, room.category, room.roomNumber));
}
