"use client";

import { memo } from "react";

import type { Subtitle } from "../_lib/rules";
import { charCount } from "../_lib/view";
import { useFollow, type Picked, type RegisterMark } from "./follow";

/**
 * 오른쪽 자막 장 — 순번 · **전문** · 글자 수.
 *
 * 전문을 자르지 않는다. 153자짜리 자막이 나온 날에도 그게 무엇인지 알아야 하고, 유난히 긴
 * 자막을 방송 전에 알아채야 목사님께 문단을 나눠 달라고 부탁할 수 있다.
 */
export function SubtitlePane({
  subtitles,
  picked,
  onSelect,
}: {
  subtitles: Subtitle[];
  picked: Picked;
  onSelect: (subtitle: number) => void;
}) {
  const register = useFollow(picked, "subtitle");
  const active = picked?.subtitle ?? null;

  return (
    <div className="min-h-0 overflow-y-auto bg-neutral-50 px-6 py-5">
      <p className="sticky top-0 -mt-5 bg-neutral-50 pt-5 pb-2 text-xs font-semibold tracking-wide text-neutral-400">
        자막 {subtitles.length}장
      </p>
      <ol className="space-y-2">
        {subtitles.map((s, i) => (
          <Card
            key={i}
            subtitle={i + 1}
            text={s.text}
            active={active === i + 1}
            onSelect={onSelect}
            register={register}
          />
        ))}
      </ol>
      {/* 앱에서 못 고치는 것이 고장이 아니라 설계임을 여기서 말한다 */}
      <p className="mt-4 pb-4 text-center text-sm text-neutral-500">
        고칠 곳이 있으면 원고를 고친 뒤 다시 올려 주세요.
      </p>
    </div>
  );
}

/** 원고 패널의 문단과 같은 이유로 `memo`다 — 자막 19장도 매번 다시 그릴 이유가 없다. */
const Card = memo(function Card({
  subtitle,
  text,
  active,
  onSelect,
  register,
}: {
  subtitle: number;
  text: string;
  active: boolean;
  onSelect: (subtitle: number) => void;
  register: RegisterMark;
}) {
  return (
    <li>
      <button
        ref={(el) => register(subtitle, el)}
        onClick={() => onSelect(subtitle)}
        className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
          active
            ? "border-red-400 bg-white ring-2 ring-red-200"
            : "border-neutral-200 bg-white hover:border-neutral-300"
        }`}
      >
        <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-sm text-neutral-400 tabular-nums">
          {subtitle}
        </span>
        <span className="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{text}</span>
        <span className="shrink-0 font-mono text-xs text-neutral-300 tabular-nums">
          {charCount(text)}
        </span>
      </button>
    </li>
  );
});
