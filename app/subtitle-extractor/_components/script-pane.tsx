"use client";

import { memo } from "react";

import type { ScriptLine } from "../_lib/view";
import { useFollow, type Picked, type RegisterMark } from "./follow";

/**
 * 한 줄의 공통 골격 — 자막이 된 문단(버튼)과 아닌 문단(문단)이 같은 자를 쓴다.
 *
 * `whitespace-pre-wrap`이라 원고의 연속 공백과 들여쓰기가 살아 있고, `min-h`는 빈 문단이
 * 납작하게 사라지지 않게 한다 — 문단 사이 간격도 원고의 모습이다.
 */
const LINE =
  "-mx-2 flex min-h-[1.75rem] gap-2 rounded-lg px-2 py-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap";

/**
 * 왼쪽 원고 전문.
 *
 * 자막만 보면 **없는 자막**은 절대 못 잡는다. 원고를 나란히 세우는 것이 검수의 본질이며
 * 이게 이 화면의 존재 이유다.
 *
 * 빨간 글자는 **원래 색 그대로** 보인다 — 한글에서 보던 원고와 같은 모습이어야 대조가
 * 성립한다. (걸러낸 빨강의 취소선과 모르는 색의 물결 밑줄은 06이 얹는다.)
 */
export function ScriptPane({
  lines,
  picked,
  onSelect,
}: {
  lines: ScriptLine[];
  picked: Picked;
  onSelect: (subtitle: number) => void;
}) {
  const register = useFollow(picked, "script");
  const active = picked?.subtitle ?? null;

  return (
    <div className="min-h-0 overflow-y-auto px-6 py-5">
      <p className="sticky top-0 -mt-5 bg-white pt-5 pb-2 text-xs font-semibold tracking-wide text-neutral-400">
        원고
      </p>
      {lines.map((line) => (
        <Line
          key={line.paragraph}
          line={line}
          // `active`가 null일 때 자막이 아닌 문단(`subtitle`도 null)이 전부 켜지지 않도록
          active={active !== null && line.subtitle === active}
          onSelect={onSelect}
          register={register}
        />
      ))}
    </div>
  );
}

/**
 * 문단 하나.
 *
 * `memo`인 이유는 원고가 길기 때문이다 — 문단 100개짜리 원고에서 자막 하나를 누를 때마다
 * 문단 전체를 다시 그리면 클릭이 눈에 띄게 늦는다. `line`은 `toScript`가 만든 뒤 변하지
 * 않고 `onSelect`·`register`는 부모가 붙들고 있으므로, 실제로 다시 그려지는 것은 강조가
 * 켜지고 꺼지는 문단 둘뿐이다.
 */
const Line = memo(function Line({
  line,
  active,
  onSelect,
  register,
}: {
  line: ScriptLine;
  active: boolean;
  onSelect: (subtitle: number) => void;
  register: RegisterMark;
}) {
  const body = (
    <>
      {/* 순번 자리는 자막이 아닌 문단에도 비워 둔다 — 본문 왼쪽 끝이 들쭉날쭉하면
          한글에서 보던 원고와 다른 모습이 된다 */}
      <span className="w-6 shrink-0 text-right font-mono text-xs text-neutral-400 tabular-nums">
        {line.subtitle}
      </span>
      <span className="flex-1">
        {line.runs.map((run, i) => (
          // 색은 파서가 읽어온 값 그대로 — 빨강이 빨강으로 보이는 것이 이 패널의 전부다
          <span key={i} style={{ color: run.color }}>
            {run.text}
          </span>
        ))}
      </span>
    </>
  );

  // 자막이 되지 못한 문단은 누를 것이 없다. 그래서 버튼이 아니고, 눌러도 아무 일이
  // 일어나지 않는다 — 원고의 대부분이 이쪽이라 탭 순서도 자막 장 수만큼만 늘어난다
  if (line.subtitle === null) return <p className={LINE}>{body}</p>;

  const subtitle = line.subtitle;

  return (
    <button
      ref={(el) => register(subtitle, el)}
      onClick={() => onSelect(subtitle)}
      className={`${LINE} w-full text-left ${
        active ? "bg-red-50 ring-2 ring-red-300" : "hover:bg-neutral-50"
      }`}
    >
      {body}
    </button>
  );
});
