import { useEffect, type ChangeEvent } from "react";

import { backgroundName, COLOR_PRESETS, type Background } from "../_lib/background";
import { backgroundStyle } from "./background-style";

/**
 * 서랍이 어느 범위로 열렸나. 곡 범위면 곡 제목, 곡별 배경 유무, "글로벌로 되돌리기"(곡별 배경
 * 지우기)가 있다.
 */
export type BackgroundTarget =
  | { scope: "common" }
  | { scope: "song"; title: string; hasSongBackground: boolean; onResetToCommon: () => void };

/**
 * 배경 서랍(09). 루트는 서랍이 열렸을 때만 그린다. 콜백은 열린 범위에 묶여 있다.
 */
export type BackgroundDrawerProps = {
  target: BackgroundTarget;
  /** 그 범위에 지금 적용된 배경. 곡 범위에서 곡별 배경이 없으면 공통 배경이다 */
  background: Background;
  /** 프리셋이나 이미지를 고르면 바로 부른다. 곡 범위면 곡별 배경을 정한다 */
  onChange: (background: Background) => void;
  /** 완료, Esc, 바깥 클릭 */
  onClose: () => void;
};

export function BackgroundDrawer({ target, background, onChange, onClose }: BackgroundDrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSong = target.scope === "song";
  const title = isSong ? `${target.title} 배경` : "배경 선택";
  // 곡별 배경이 없는 곡에서 `background`는 공통 배경이다. 그것을 선택으로 보이면 이 곡에 무언가
  // 정해진 것처럼 읽히니, 그때는 아무것도 선택 표시하지 않는다
  const showSelection = !isSong || target.hasSongBackground;

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    // 같은 파일을 다시 골라도 change가 나도록 비운다
    input.value = "";
    if (!file) return;
    try {
      const data = await readAsDataUrl(file);
      onChange({ type: "image", data });
    } catch {
      // 읽기에 실패하면 아무것도 바꾸지 않는다
    }
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40">
      {/* 바깥을 누르면 닫히고 안을 누른 것은 닫기가 아니다 */}
      <aside
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-white"
      >
        <header className="border-b border-neutral-200 p-4">
          <h2>{title}</h2>
          <p>
            {!isSong
              ? "전체 슬라이드에 적용됩니다"
              : target.hasSongBackground
                ? "이 곡에만 적용됩니다"
                : "현재 글로벌 배경 사용 중 — 색을 선택하면 이 곡에만 적용됩니다"}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <h3>색상</h3>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((preset) => {
              const selected =
                showSelection &&
                background.type === "color" &&
                background.value.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ type: "color", value: preset.value })}
                  className={`aspect-video rounded border-2 ${selected ? "border-blue-600" : "border-neutral-300"}`}
                  style={backgroundStyle({ type: "color", value: preset.value })}
                >
                  <span className="rounded bg-white/80 px-1 text-xs text-black">{preset.name}</span>
                </button>
              );
            })}
          </div>

          <h3>이미지 업로드</h3>
          <input type="file" accept="image/*" onChange={onFile} />

          {showSelection && background.type === "image" && (
            <>
              <h3>현재 업로드 이미지</h3>
              <div
                className="aspect-video w-40 rounded border-2 border-blue-600"
                style={backgroundStyle(background)}
              />
            </>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-neutral-200 p-4">
          <span>{showSelection ? `선택: ${backgroundName(background)}` : "적용된 곡별 배경 없음"}</span>
          <div className="flex gap-2">
            {isSong && target.hasSongBackground && (
              <button type="button" onClick={target.onResetToCommon}>
                글로벌로 되돌리기
              </button>
            )}
            <button type="button" onClick={onClose}>
              완료
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("FileReader 결과가 문자열이 아니다"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("파일 읽기 실패"));
    reader.readAsDataURL(file);
  });
}
