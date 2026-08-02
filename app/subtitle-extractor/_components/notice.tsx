"use client";

import type { Guidance } from "../_lib/guidance";
import { TitleBar } from "./header";

/**
 * 잘 안 되는 날의 화면 — 거부와 빈 결과.
 *
 * **문구도 톤도 고르지 않는다.** 둘 다 `guidance.ts`가 파서·규칙 층의 출력에서 유도해
 * 넘겨준다. 화면이 톤을 따로 고르면 거부를 노랑으로, 빈 결과를 빨강으로 칠하는 날이 오고
 * 그날 담당자는 급한 일과 급하지 않은 일을 구분할 수 없다.
 *
 * 여기서 정하는 것은 **그 톤이 어떻게 보이는지**뿐이다. 빨강은 고쳐야 할 일이라 아이콘부터
 * 테두리까지 물들이고, 노랑은 확인할 일이라 한 톤 낮다. 잘 돌아가는 날의 결과 화면은 아예
 * 색이 없다(`result.tsx`) — 셋이 색으로 갈린다.
 */
const TONE = {
  red: {
    icon: "✕",
    badge: "bg-red-100 text-red-700",
    title: "text-red-900",
    card: "border-red-200",
    next: "border-red-200 bg-red-50 text-red-900",
  },
  amber: {
    icon: "🔍",
    badge: "bg-amber-100 text-amber-700",
    title: "text-amber-900",
    card: "border-amber-200",
    next: "border-amber-200 bg-amber-50 text-amber-900",
  },
} as const;

/**
 * 어느 화면에서든 **다음 행동**을 주고 막힌 채로 끝내지 않는다. 다음 행동이 따로 선 상자에
 * 앉는 이유는 그것이 담당자가 이 화면에서 유일하게 가져갈 것이기 때문이다 — 설명에 섞으면
 * 읽히지 않는다.
 */
export function Notice({
  guidance,
  file,
  onBack,
}: {
  guidance: Guidance;
  file: string;
  onBack: () => void;
}) {
  const tone = TONE[guidance.tone];

  return (
    <div className="flex h-screen flex-col bg-white">
      <TitleBar />
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className={`max-w-lg rounded-2xl border ${tone.card} p-8 shadow-sm`}>
          <div
            className={`flex size-11 items-center justify-center rounded-full text-xl ${tone.badge}`}
          >
            {tone.icon}
          </div>

          <h2 className={`mt-5 text-xl font-bold ${tone.title}`}>{guidance.title}</h2>
          <p className="mt-2 leading-relaxed text-neutral-600">{guidance.body}</p>

          <p className={`mt-5 rounded-xl border px-4 py-3 leading-relaxed ${tone.next}`}>
            <b className="mr-1.5">다음 할 일</b>
            {guidance.next}
          </p>

          {/* 원고 여러 편을 연달아 처리하다 보면 어느 파일이 막힌 건지 헷갈린다 */}
          <p className="mt-5 truncate font-mono text-xs text-neutral-400">{file}</p>

          {/* 거부든 빈 결과든 여기서 다시 올릴 수 있다 — 새로고침이 필요 없다 */}
          <button
            onClick={onBack}
            className="mt-2 w-full rounded-xl bg-neutral-900 px-6 py-3 font-bold text-white transition hover:bg-neutral-700"
          >
            다른 파일 올리기
          </button>
        </div>
      </div>
    </div>
  );
}
