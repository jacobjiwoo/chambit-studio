"use client";

import { downloadNabiTxt } from "../_lib/nabi-cg";

/**
 * 받기 전 마지막 확인 — 자막 목록이 아니라 **파일에 들어갈 원문 그대로**.
 *
 * 목록은 장 단위로 끊어 보여줄 뿐 나비CG가 실제로 읽을 모습과 생김새가 다르다.
 */
export function PreviewModal({
  name,
  subtitles,
  onClose,
}: {
  name: string;
  subtitles: string[];
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <span className="font-mono text-sm text-neutral-600">{name}</span>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-neutral-400 hover:bg-neutral-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 나비CG가 실제로 읽을 바로 그 내용. 장 구분은 빈 줄이므로 빈 줄로 보여준다 */}
        <pre className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap">
          {subtitles.join("\n\n")}
        </pre>

        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-5 py-3">
          <span className="font-mono text-xs text-neutral-500">
            UTF-8 BOM · CRLF · 자막 {subtitles.length}장 · 장 구분은 빈 줄
          </span>
          <button
            onClick={() => downloadNabiTxt(subtitles, name)}
            className="rounded-xl bg-neutral-900 px-5 py-2.5 font-bold text-white"
          >
            ⤓ 받기
          </button>
        </div>
      </div>
    </div>
  );
}
