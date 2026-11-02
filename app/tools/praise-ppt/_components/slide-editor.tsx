import { useEffect, useRef } from "react";

import type { Background } from "../_lib/background";
import { countUsedSlides } from "../_lib/plan";
import { appliedBackground, type SetlistEntry } from "../_lib/setlist";
import type { Song } from "../_lib/song";
import { SlideThumb } from "./slide-thumb";

/**
 * 슬라이드 편집 서랍(08). 루트는 서랍이 열려 있고 곡을 찾았을 때만 그린다. 콜백은 이 곡에
 * 묶여 있다.
 */
export type SlideEditorProps = {
  song: Song;
  entry: SetlistEntry;
  commonBackground: Background;
  onToggleSlide: (index: number) => void;
  onIncludeAll: () => void;
  onExcludeAll: () => void;
  /** 완료, Esc, 바깥 클릭 */
  onClose: () => void;
};

export function SlideEditor({
  song,
  entry,
  commonBackground,
  onToggleSlide,
  onIncludeAll,
  onExcludeAll,
  onClose,
}: SlideEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 그려질 때가 곧 열릴 때다. 모달로 열어야 Esc와 backdrop이 생긴다. 닫기는 루트가 이 컴포넌트를
  // 빼는 것이라 cleanup에서 close()하지 않는다 — close 이벤트가 다시 onClose를 부르기 때문이다
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const total = song.slides.length;
  const used = countUsedSlides(song, entry);
  const background = appliedBackground(entry, commonBackground);

  return (
    // 바깥 클릭: dialog에 padding이 없으니 dialog 자신이 눌렸다면 backdrop이다.
    // 키보드로는 Esc가 같은 일을 한다
    <dialog
      ref={dialogRef}
      aria-labelledby="slide-editor-title"
      style={{ padding: 0 }}
      onCancel={(event) => {
        // 닫기는 루트 상태가 정한다. 브라우저가 먼저 닫지 않게 막는다
        event.preventDefault();
        onClose();
      }}
      // cancel을 막지 못하고 브라우저가 닫아 버린 경우에도 루트 상태를 맞춘다
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div style={{ padding: 16 }}>
        <header>
          <h2 id="slide-editor-title">{song.title}</h2>
          <p>사용할 슬라이드를 골라주세요 · 전체 {total}장</p>
          <button type="button" onClick={onIncludeAll}>
            전체 포함
          </button>
          <button type="button" onClick={onExcludeAll}>
            전체 제외
          </button>
        </header>

        <ul style={{ display: "flex", flexWrap: "wrap", listStyle: "none", padding: 0 }}>
          {song.slides.map((slide) => {
            const excluded = entry.excluded.has(slide.index);
            return (
              <li key={slide.index}>
                <button type="button" aria-pressed={!excluded} onClick={() => onToggleSlide(slide.index)}>
                  <SlideThumb slide={slide} background={background} excluded={excluded} />
                  {excluded ? "제외" : "포함"}
                </button>
              </li>
            );
          })}
        </ul>

        <footer>
          <span>
            {used} / {total}장 사용
          </span>
          <button type="button" onClick={onClose}>
            완료
          </button>
        </footer>
      </div>
    </dialog>
  );
}
