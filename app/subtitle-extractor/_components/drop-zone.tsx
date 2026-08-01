"use client";

import { useRef, useState } from "react";
import { TitleBar } from "./header";

/**
 * 첫 화면 — 라우트를 나누지 않고 **같은 자리에서** 결과로 바뀐다.
 *
 * 드래그 앤 드롭과 파일 고르기 버튼을 둘 다 쓸 수 있어야 하고, 파일을 놓는 순간 추출이
 * 자동으로 시작된다 — "이제 변환하기를 누르세요" 같은 단계를 만들지 않는다. 그래서
 * `onFile`을 부르는 자리가 둘뿐이고, 둘 다 사용자가 파일을 정한 **그 순간**이다.
 *
 * 확장자로 거르지 않는다 — 파일 고르기의 `accept`도 두지 않는다. 확장자만 `.hwp`인 파일과
 * 메신저가 이름을 뭉갠 파일이 갈리는 곳은 파서의 내용 판정이며, 두 입구가 서로 다른 기준을
 * 쓰면 같은 파일이 끌어다 놓으면 열리고 골라서는 안 열린다.
 */
export function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [over, setOver] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-screen flex-col bg-white">
      <TitleBar />
      <div className="flex flex-1 items-center justify-center p-8">
        <button
          onClick={() => picker.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={(e) => {
            // 자식 span으로 옮겨가도 dragleave가 올라온다. 그때마다 테두리가 꺼지면
            // 파일을 든 채 드롭존 위에 있는 내내 화면이 깜빡인다
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            const file = e.dataTransfer.files[0];
            if (file) onFile(file);
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

        <input
          ref={picker}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            // 값을 비우지 않으면 **같은 파일을 다시 고를 때** change가 뜨지 않는다.
            // 원고를 고쳐 저장하고 같은 파일을 다시 올리는 것이 이 앱의 수정 경로다
            e.target.value = "";
            if (file) onFile(file);
          }}
        />
      </div>
    </div>
  );
}
