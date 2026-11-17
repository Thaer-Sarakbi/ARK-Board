import type { GuestData } from "./rooms";

export interface GuestForm {
  guest: string;
  idNumber: string;
  phoneNumber: string;
  nights: string;
  paid: string;
}

export type GuestErrors = Partial<Record<keyof GuestForm, string>>;

export function validateGuest(f: GuestForm): { errors: GuestErrors; data?: GuestData } {
  const errors: GuestErrors = {};
  if (!f.guest.trim()) errors.guest = "Enter the guest name.";
  if (!/^\d{5,15}$/.test(f.idNumber.trim())) errors.idNumber = "ID number must be 5–15 digits.";
  if (f.phoneNumber.replace(/\D/g, "").length < 7 || /[^\d\s+()-]/.test(f.phoneNumber))
    errors.phoneNumber = "Enter a valid phone number.";
  const nights = Number(f.nights);
  if (!Number.isInteger(nights) || nights < 1 || nights > 90) errors.nights = "Nights must be 1–90.";
  const paid = Number(f.paid);
  if (f.paid.trim() === "" || !Number.isFinite(paid) || paid < 0) errors.paid = "Enter an amount (0 or more).";
  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    data: {
      guest: f.guest.trim(),
      idNumber: f.idNumber.trim(),
      phoneNumber: f.phoneNumber.trim(),
      nights,
      paid: Math.round(paid * 100) / 100,
    },
  };
}

export function validateRoomNumber(n: string): string | null {
  const v = n.trim();
  if (!v) return "Enter a room number.";
  if (!/^\d{1,5}$/.test(v)) return "Room number must be digits only.";
  return null;
}

export const emptyGuestForm = (): GuestForm => ({ guest: "", idNumber: "", phoneNumber: "", nights: "1", paid: "0" });
