import type { Timestamp } from "firebase/firestore";

const fmt = new Intl.DateTimeFormat("en-MY", {
  timeZone: "Asia/Kuala_Lumpur",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatTime(t?: Timestamp | null): string {
  if (!t || typeof t.toDate !== "function") return "";
  return fmt.format(t.toDate());
}

export function formatRM(v?: number | null): string {
  if (v == null || !Number.isFinite(v)) return "";
  return "RM " + v.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function firebaseErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  if (code === "permission-denied") return "You don't have permission to do that.";
  if (code === "unavailable") return "Network unavailable. Check your connection.";
  return "Something went wrong. Please try again.";
}
