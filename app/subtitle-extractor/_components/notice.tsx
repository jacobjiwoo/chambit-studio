"use client";

import { TitleBar } from "./header";

/**
 * 잘 안 되는 날의 화면 — 거부와 빈 결과.
 *
 * 톤으로 가른다. 빈 결과는 실패가 아니므로 빨강이 아니라 노랑이고, "원고는 정상적으로
 * 열렸습니다"를 먼저 말한다. 어느 쪽이든 **다음 행동**을 주고 막힌 채로 끝내지 않는다.
 */
export function Notice({
  tone,
  title,
  body,
  file,
  onBack,
}: {
  tone: "red" | "amber";
  title: string;
  body: string;
  file: string;
  onBack: () => void;
}) {
  const red = tone === "red";
  return (
    <div className="flex h-screen flex-col bg-white">
      <TitleBar />
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-neutral-200 p-8 text-center shadow-sm">
          <div className="text-4xl">{red ? "✕" : "🔍"}</div>
          <h2 className={`mt-4 text-xl font-bold ${red ? "text-red-900" : "text-amber-900"}`}>
            {title}
          </h2>
          <p className="mt-2 text-neutral-600">{body}</p>
          <p className="mt-1 font-mono text-xs text-neutral-400">{file}</p>
          <button
            onClick={onBack}
            className="mt-6 rounded-xl bg-neutral-900 px-6 py-3 font-bold text-white"
          >
            다른 파일 올리기
          </button>
        </div>
      </div>
    </div>
  );
}
