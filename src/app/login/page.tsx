"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/store/auth";

const RED = "border-empty";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, init } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => init(), [init]);
  useEffect(() => {
    if (!authLoading && user) router.replace("/board");
  }, [authLoading, user, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const er: typeof errors = {};
    if (!email.trim()) er.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) er.email = "Enter a valid email address.";
    if (!password) er.password = "Enter your password.";
    setErrors(er);
    setFormError("");
    if (Object.keys(er).length) return;
    setLoading(true);
    try {
      await setPersistence(auth(), remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth(), email.trim(), password);
      router.replace("/board");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setFormError(
        code === "auth/too-many-requests"
          ? "Too many attempts. Try again later."
          : code === "auth/network-request-failed"
            ? "Network error. Check your connection."
            : "Incorrect email or password.",
      );
      setLoading(false);
    }
  }

  const inputCls = (bad: boolean) =>
    `rounded-lg border bg-white p-3 text-[16px] text-ink outline-none focus:border-ink ${bad ? RED : "border-input"}`;

  return (
    <div className="box-border flex min-h-screen items-center justify-center px-6 py-8">
      <div className="flex w-full max-w-[400px] flex-col gap-7">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <div className="flex gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-empty" />
            <span className="h-3.5 w-3.5 rounded-full bg-occupied" />
            <span className="h-3.5 w-3.5 rounded-full bg-online" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="text-[13px] uppercase tracking-[.08em] text-muted">ARK Board</div>
            <h1 className="m-0 text-[28px] font-medium">Log in</h1>
          </div>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-[18px] rounded-xl border border-line bg-white p-6"
        >
          {formError && (
            <div className="rounded-lg bg-error-bg px-3.5 py-3 text-[14px] text-error-fg">{formError}</div>
          )}
          <label className="flex flex-col gap-1.5 text-[13px] text-muted">
            Email
            <input
              type="email"
              autoComplete="username"
              placeholder="name@hotelgroup.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
                setFormError("");
              }}
              className={inputCls(!!errors.email || !!formError)}
            />
            {errors.email && <span className="text-[13px] text-error">{errors.email}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-muted">
            Password
            <div className="relative flex">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                  setFormError("");
                }}
                className={`min-w-0 flex-1 pr-16 ${inputCls(!!errors.password || !!formError)}`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-2.5 text-[13px] text-secondary"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <span className="text-[13px] text-error">{errors.password}</span>}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-body">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="m-0 h-4 w-4 accent-ink"
            />
            Remember me
          </label>
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer rounded-lg border-0 px-[22px] py-[13px] text-[15px] text-white ${loading ? "bg-secondary" : "bg-ink"}`}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
