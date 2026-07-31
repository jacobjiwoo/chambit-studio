"use client";

import { charCount } from "../_lib/view";

/**
 * 오른쪽 자막 장 — 순번 · **전문** · 글자 수.
 *
 * 전문을 자르지 않는다. 153자짜리 자막이 나온 날에도 그게 무엇인지 알아야 하고, 유난히 긴
 * 자막을 방송 전에 알아채야 목사님께 문단을 나눠 달라고 부탁할 수 있다.
 */
export function SubtitlePane({
  subtitles,
  active,
  onSelect,
}: {
  subtitles: string[];
  active: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="min-h-0 overflow-y-auto bg-neutral-50 px-6 py-5">
      <p className="sticky top-0 -mt-5 bg-neutral-50 pt-5 pb-2 text-xs font-semibold tracking-wide text-neutral-400">
        자막 {subtitles.length}장
      </p>
      <ol className="space-y-2">
        {subtitles.map((s, i) => (
          <li key={i}>
            <button
              onClick={() => onSelect(i + 1)}
              className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
                active === i + 1
                  ? "border-red-400 bg-white ring-2 ring-red-200"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-sm text-neutral-400 tabular-nums">
                {i + 1}
              </span>
              <span className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{s}</span>
              <span className="shrink-0 font-mono text-xs text-neutral-300 tabular-nums">
                {charCount(s)}
              </span>
            </button>
          </li>
        ))}
      </ol>
      {/* 앱에서 못 고치는 것이 고장이 아니라 설계임을 여기서 말한다 */}
      <p className="mt-4 pb-4 text-center text-sm text-neutral-500">
        고칠 곳이 있으면 원고를 고친 뒤 다시 올려 주세요.
      </p>
    </div>
  );
}
