"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-[14px] text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-input border-t-ink" />
      {label}
    </div>
  );
}

/** Renders children only for signed-in users; otherwise redirects to /login. */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, init } = useAuth();
  const router = useRouter();

  useEffect(() => init(), [init]);
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <Spinner />;
  return <>{children}</>;
}
