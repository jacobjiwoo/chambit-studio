"use client";

import { useState } from "react";
import type { Dropped, UnknownColor } from "../_lib/rules";

/** 펼칠 수 있는 상세 둘. 한 번에 하나만 열린다 */
type Panel = "unknown" | "dropped";

/** 상세 목록의 공통 자 — 띠를 밀어 올리지 않고 제 안에서 스크롤한다 */
const DETAIL = "mt-2 max-h-48 space-y-1.5 overflow-y-auto";

/**
 * 노출 의무 둘을 **칩 한 줄**로 합친다.
 *
 * 띠를 둘로 나누면 「모르는 색」이 있는 날 가로 줄이 셋 쌓인다. 기본 상태에서 읽을 것은
 * **숫자 둘**뿐이고, 눌러야 상세가 열린다. 색은 띠 배경이 아니라 **칩이 진다.**
 * **할 말이 없는 날엔 줄 자체가 없다** — 그래야 칩이 보이는 날 그것이 진짜 신호다.
 *
 * 편집을 막은 대가는 여기서 **노출**로 갚는다. 규칙이 틀린 날 담당자가 알아챌 유일한 통로이며,
 * 특히 모르는 색은 자막 한 장을 소리 없이 삼킬 수 있다 — 그것을 방송 중이 아니라 준비 중에
 * 알아야 한다.
 */
export function Chips({
  dropped,
  unknownColors,
  onReveal,
}: {
  dropped: Dropped[];
  unknownColors: UnknownColor[];
  /** 「원고에서 보기 →」 — 항목이 나온 **문단**으로 데려간다 */
  onReveal: (paragraph: number) => void;
}) {
  const [open, setOpen] = useState<Panel | null>(null);

  if (dropped.length === 0 && unknownColors.length === 0) return null;

  function toggle(which: Panel) {
    setOpen((v) => (v === which ? null : which));
  }

  return (
    <div className="shrink-0 border-b border-neutral-200 px-6 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {unknownColors.length > 0 && (
          <Chip on={open === "unknown"} tone="amber" onClick={() => toggle("unknown")}>
            ⚠ 모르는 색 {unknownColors.length}곳
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

      {/* 상세는 띠를 밀어 올리지 않는다 — 원고와 자막이 세로로 밀려나면 검수하던 자리를
          잃는다. 항목이 많은 날엔 이 안에서 스크롤한다 */}
      {open === "unknown" && (
        <ul className={DETAIL}>
          {unknownColors.map((u, i) => (
            <li key={i}>
              <button
                onClick={() => onReveal(u.paragraph)}
                className="flex w-full items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-left ring-1 ring-amber-200 hover:ring-amber-500"
              >
                {/* 색값과 그 텍스트 둘 다 — 담당자가 목사님께 "이 부분 색이 다릅니다"라고
                    정확히 말할 수 있어야 한다 */}
                <span
                  className="h-4 w-4 shrink-0 rounded ring-1 ring-black/20"
                  style={{ background: u.color }}
                />
                <span className="shrink-0 font-mono text-xs text-amber-900">{u.color}</span>
                {/* 긴 조각은 줄여 담되 통째로는 잃지 않는다 — 원고에서 보기가 본길이고
                    `title`이 그 자리에서 읽는 샛길이다 */}
                <span className="flex-1 truncate text-amber-900" title={u.text}>
                  {u.text}
                </span>
                <span className="shrink-0 text-xs text-amber-700">원고에서 보기 →</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open === "dropped" && (
        <ul className={DETAIL}>
          {dropped.map((d, i) => (
            <li key={i}>
              <button
                onClick={() => onReveal(d.paragraph)}
                className="block w-full rounded-lg bg-neutral-50 px-3 py-1.5 text-left ring-1 ring-neutral-200 hover:ring-neutral-900"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="line-through decoration-neutral-400 decoration-2">
                    {d.fragment}
                  </span>
                  <span className="shrink-0 text-xs text-neutral-500">원고에서 보기 →</span>
                </span>
                {/* 조각만으로는 왜 빠졌는지 알 수 없다 — 검은 글 사이에 섞여 있었다는 것은
                    문단을 봐야 보인다 */}
                <span className="mt-0.5 line-clamp-2 text-xs text-neutral-400">{d.context}</span>
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
