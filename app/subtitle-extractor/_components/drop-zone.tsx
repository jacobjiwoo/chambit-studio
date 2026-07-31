"use client";

import { useState } from "react";
import { TitleBar } from "./header";

/**
 * 첫 화면 — 라우트를 나누지 않고 **같은 자리에서** 결과로 바뀐다.
 *
 * 드래그 앤 드롭과 파일 고르기 버튼을 둘 다 쓸 수 있어야 하고, 파일을 놓는 순간 추출이
 * 자동으로 시작된다 — "이제 변환하기를 누르세요" 같은 단계를 만들지 않는다.
 */
export function DropZone({ onPick }: { onPick: () => void }) {
  const [over, setOver] = useState(false);
  return (
    <div className="flex h-screen flex-col bg-white">
      <TitleBar />
      <div className="flex flex-1 items-center justify-center p-8">
        <button
          onClick={onPick}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            onPick();
          }}
          className={`flex w-full max-w-xl flex-col items-center rounded-3xl border-2 border-dashed px-8 py-20 transition ${
            over
              ? "border-neutral-900 bg-neutral-50"
              : "border-neutral-300 hover:border-neutral-400"
          }`}
        >
          <span className="text-5xl">📄</span>
          <span className="mt-5 text-xl font-bold">
            한글 원고(.hwp)를 여기에 끌어다 놓으세요
          </span>
          <span className="mt-2 text-neutral-500">
            목사님께 받은 파일 그대로 올리시면 됩니다
          </span>
          <span className="mt-6 rounded-xl bg-neutral-900 px-6 py-3 font-bold text-white">
            파일 고르기
          </span>
          <span className="mt-6 text-xs text-neutral-400">
            원고는 이 컴퓨터 밖으로 나가지 않습니다
          </span>
        </button>
      </div>
    </div>
  );
}
