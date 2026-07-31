"use client";

import { useState } from "react";
import type { Dropped, UnknownColor } from "../_lib/view";

/**
 * 노출 의무 둘을 **칩 한 줄**로 합친다.
 *
 * 띠를 둘로 나누면 「모르는 색」이 있는 날 가로 줄이 셋 쌓인다. 기본 상태에서 읽을 것은
 * **숫자 둘**뿐이고, 눌러야 상세가 열린다. 색은 띠 배경이 아니라 **칩이 진다.**
 * **할 말이 없는 날엔 줄 자체가 없다** — 그래야 칩이 보이는 날 그것이 진짜 신호다.
 */
export function Chips({
  dropped,
  unknown,
  onReveal,
}: {
  dropped: Dropped[];
  unknown: UnknownColor[];
  onReveal: (key: string) => void;
}) {
  const [open, setOpen] = useState<"unknown" | "dropped" | null>(null);

  if (dropped.length === 0 && unknown.length === 0) return null;

  function toggle(which: "unknown" | "dropped") {
    setOpen((v) => (v === which ? null : which));
  }

  return (
    <div className="shrink-0 border-b border-neutral-200 px-6 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {unknown.length > 0 && (
          <Chip on={open === "unknown"} tone="amber" onClick={() => toggle("unknown")}>
            ⚠ 모르는 색 {unknown.length}곳
          </Chip>
        )}
        {dropped.length > 0 && (
          <Chip on={open === "dropped"} tone="neutral" onClick={() => toggle("dropped")}>
            자막에서 뺀 것 {dropped.length}개
          </Chip>
        )}
        <span className="text-xs text-neutral-400">
          {open === "unknown"
            ? "빨강도 검정도 아닌 색입니다. 자막으로 쓰지 않았습니다"
            : open === "dropped"
              ? "빨갛지만 검은 글 사이에 섞여 있어 뺐습니다"
              : "눌러서 확인"}
        </span>
      </div>

      {open === "unknown" && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {unknown.map((u, i) => (
            <li key={i}>
              <button
                onClick={() => onReveal(`u${i}`)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 ring-1 ring-amber-200 hover:ring-amber-500"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded ring-1 ring-black/20"
                  style={{ background: u.color }}
                />
                <span className="font-mono text-xs text-amber-900">{u.color}</span>
                <span className="max-w-64 truncate text-amber-900">{u.text}</span>
                <span className="ml-1 text-xs text-amber-700">원고에서 보기 →</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open === "dropped" && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {dropped.map((d, i) => (
            <li key={i}>
              <button
                onClick={() => onReveal(`d${i}`)}
                className="rounded-lg bg-neutral-50 px-2.5 py-1 ring-1 ring-neutral-200 hover:ring-neutral-900"
              >
                <span className="line-through decoration-neutral-400">{d.fragment}</span>
                <span className="ml-2 text-xs text-neutral-500">원고에서 보기 →</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  on,
  tone,
  onClick,
  children,
}: {
  on: boolean;
  tone: "amber" | "neutral";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const amber = tone === "amber";
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 font-medium ring-1 transition ${
        amber
          ? "bg-amber-100 text-amber-900 ring-amber-300 hover:bg-amber-200"
          : "bg-neutral-100 text-neutral-700 ring-neutral-300 hover:bg-neutral-200"
      } ${on ? "ring-2 ring-offset-1" : ""}`}
    >
      {children}
      <span className="ml-1.5 text-xs opacity-60">{on ? "▲" : "▼"}</span>
    </button>
  );
}
