export const HOTELS = [
  "LUMUT",
  "AMPANG H1",
  "DE GLORY",
  "HARTAMAS H1",
  "KAJANG STAR",
  "KDH 1",
  "KDH 2",
  "MELAKKA",
  "MELAWATHI H2",
  "NEW KAJANG",
  "NEW RAWANG",
  "SUBANG",
  "SG BESI H2",
  "SERANDAH",
  "PUCHONG",
  "ARK RAWANG",
  "BANTING",
  "ARK Porkdickson",
  "Avani sepang goldcost",
  "Ampang 3 tower Office",
] as const;

export type Category = "double" | "triple" | "quad";
export type RoomStatus = "empty" | "occupied" | "online";

export const CATEGORIES: { key: Category; title: string; label: string }[] = [
  { key: "double", title: "Double rooms", label: "Double" },
  { key: "triple", title: "Triple rooms", label: "Triple" },
  { key: "quad", title: "Quad rooms", label: "Quad" },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  double: "Double",
  triple: "Triple",
  quad: "Quad",
};

export const STATUS: Record<RoomStatus, { label: string; short: string; color: string }> = {
  empty: { label: "Empty", short: "Empty", color: "oklch(0.58 0.2 25)" },
  occupied: { label: "Occupied", short: "Occupied", color: "oklch(0.58 0.16 150)" },
  online: { label: "Online booking", short: "Online", color: "oklch(0.55 0.17 258)" },
};

export const STATUS_KEYS: RoomStatus[] = ["empty", "occupied", "online"];

export function defaultHotel(placeName?: string | null): string {
  return placeName && (HOTELS as readonly string[]).includes(placeName) ? placeName : HOTELS[0];
}
