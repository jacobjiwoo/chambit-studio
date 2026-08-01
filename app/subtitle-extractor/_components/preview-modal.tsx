"use client";

import { useEffect } from "react";

import { toNabiBody } from "../_lib/nabi-cg";

/**
 * 받기 전 마지막 확인 — 자막 목록이 아니라 **파일에 들어갈 원문 그대로**.
 *
 * 목록은 장 단위로 끊어 보여줄 뿐 나비CG가 실제로 읽을 모습과 생김새가 다르다. 카드 사이의
 * 여백은 화면이 낸 것이고 파일의 빈 줄은 나비CG의 **페이지 구분**이라, 둘이 닮았다는 것이
 * 같다는 뜻이 아니다.
 *
 * **받기가 모달 안에도 있다.** 확인한 뒤 닫고 헤더의 버튼을 다시 찾는 걸음이 생기면, 확인이
 * 받기의 일부가 아니라 받기 앞의 장애물이 된다. `onDownload`를 헤더와 **같은 것으로** 받으므로
 * 두 버튼이 다른 파일을 떨굴 길이 없다.
 */
export function PreviewModal({
  name,
  subtitles,
  onDownload,
  onClose,
}: {
  name: string;
  subtitles: string[];
  onDownload: () => void;
  onClose: () => void;
}) {
  // 확인만 하고 나가는 것이 이 모달의 흔한 끝이다. 그 길이 마우스로 닫기 버튼을 겨누는
  // 것뿐이면, 방송 직전에 열어 본 사람에게는 그것도 한 걸음이다
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-8"
    >
      {/* 바깥을 눌러 닫되 안을 누른 것은 닫기가 아니다 — 원문을 드래그해 읽는 동안 모달이
          사라지면 확인하던 자리를 잃는다 */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="받을 파일 미리보기"
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3">
          {/* `min-w-0`이 없으면 flex 항목의 최소 너비가 내용 너비라 긴 파일명이 닫기 버튼을
              밀어낸다 — 자르라고 시킨 자리에서 자르지 않는다 */}
          <span className="min-w-0 truncate font-mono text-sm text-neutral-600">{name}</span>
          <button
            onClick={onClose}
            className="shrink-0 rounded px-2 py-1 text-neutral-400 hover:bg-neutral-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 나비CG가 실제로 읽을 바로 그 글. 장 구분이 빈 줄이므로 **빈 줄로 보인다** —
            페이지가 제대로 갈릴지 미리 아는 통로가 이 여백이다.

            원고 19장이면 이 안이 스크롤한다. `min-h-0`이 없으면 flex 항목의 최소 높이가
            내용 높이라 모달이 화면 밖으로 자란다 */}
        <pre className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap">
          {toNabiBody(subtitles)}
        </pre>

        {/* 손으로 맞추던 형식이 제대로 들어갔는지 여기서 확인한다 */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-3">
          <span className="font-mono text-xs text-neutral-500">
            UTF-8 BOM · CRLF · 자막 {subtitles.length}장 · 장 구분은 빈 줄
          </span>
          <button
            onClick={onDownload}
            className="rounded-xl bg-neutral-900 px-5 py-2.5 font-bold text-white transition hover:bg-neutral-700"
          >
            ⤓ 받기
          </button>
        </div>
      </div>
    </div>
  );
}
