"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { HOTELS } from "@/lib/constants";
import { useAuth } from "@/store/auth";

export function Modal({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-20 flex items-center justify-center overflow-auto bg-[rgba(20,20,18,.45)] p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="m-auto flex w-full max-w-[420px] flex-col gap-[18px] rounded-[14px] bg-white p-6 shadow-[0_20px_48px_rgba(0,0,0,.2)]"
      >
        {children}
      </div>
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return <div className="rounded-lg bg-error-bg px-3.5 py-2.5 text-[13px] text-error-fg">{children}</div>;
}

export function HotelSelect({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer rounded-lg border border-input bg-white text-[16px] text-ink ${className}`}
    >
      {HOTELS.map((h) => (
        <option key={h} value={h}>
          {h}
        </option>
      ))}
    </select>
  );
}

export function LogoutButton() {
  const logout = useAuth((s) => s.logout);
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await logout();
        router.replace("/login");
      }}
      className="flex cursor-pointer items-center whitespace-nowrap rounded-lg border border-input bg-white px-4 py-2.5 text-[14px] text-ink"
    >
      Log out
    </button>
  );
}

export function UserName() {
  const name = useAuth((s) => s.profile?.fullName);
  if (!name) return null;
  return <span className="max-w-[180px] truncate text-[14px] text-secondary">{name}</span>;
}
