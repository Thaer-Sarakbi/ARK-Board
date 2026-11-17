"use client";

import type { GuestErrors, GuestForm } from "@/lib/validation";

interface Props {
  form: GuestForm;
  errors: GuestErrors;
  onChange: (key: keyof GuestForm, value: string) => void;
}

const inputCls = (bad?: string) =>
  `rounded-lg border px-3 py-[11px] text-[15px] text-ink outline-none tabular-nums focus:border-ink min-w-0 ${bad ? "border-empty" : "border-input"}`;

function Err({ msg }: { msg?: string }) {
  return msg ? <span className="text-[13px] text-error">{msg}</span> : null;
}

export default function GuestFields({ form, errors, onChange }: Props) {
  const lbl = "flex flex-col gap-1.5 text-[13px] text-muted min-w-0";
  return (
    <>
      <label className={lbl}>
        Guest name
        <input
          type="text"
          autoFocus
          value={form.guest}
          onChange={(e) => onChange("guest", e.target.value)}
          className={inputCls(errors.guest)}
        />
        <Err msg={errors.guest} />
      </label>
      <label className={lbl}>
        ID number
        <input
          type="text"
          inputMode="numeric"
          value={form.idNumber}
          onChange={(e) => onChange("idNumber", e.target.value)}
          className={inputCls(errors.idNumber)}
        />
        <Err msg={errors.idNumber} />
      </label>
      <label className={lbl}>
        Phone number
        <input
          type="tel"
          placeholder="+60 12 345 6789"
          value={form.phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          className={inputCls(errors.phoneNumber)}
        />
        <Err msg={errors.phoneNumber} />
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
        <label className={lbl}>
          Nights
          <input
            type="number"
            min={1}
            max={90}
            value={form.nights}
            onChange={(e) => onChange("nights", e.target.value)}
            className={inputCls(errors.nights)}
          />
          <Err msg={errors.nights} />
        </label>
        <label className={lbl}>
          Amount paid (RM)
          <div className="relative flex">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted">RM</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.paid}
              onChange={(e) => onChange("paid", e.target.value)}
              className={`flex-1 pl-11 ${inputCls(errors.paid)}`}
            />
          </div>
          <Err msg={errors.paid} />
        </label>
      </div>
    </>
  );
}
