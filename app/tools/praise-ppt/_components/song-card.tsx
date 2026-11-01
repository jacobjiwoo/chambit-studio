import type { MouseEvent } from "react";

import { backgroundName, type Background } from "../_lib/background";
import { countUsedSlides } from "../_lib/plan";
import { appliedBackground, type SetlistEntry } from "../_lib/setlist";
import type { Song } from "../_lib/song";
import { backgroundStyle } from "./background-style";
import { SlideThumb } from "./slide-thumb";

type SongCardProps = {
  order: number;
  song: Song;
  entry: SetlistEntry;
  commonBackground: Background;
  onOpenSlideEditor: () => void;
  onOpenSongBackground: () => void;
};

/** 셋리스트 상세의 곡 카드. 썸네일 줄 밖을 누르면 슬라이드 편집이 열린다. */
export function SongCard({
  order,
  song,
  entry,
  commonBackground,
  onOpenSlideEditor,
  onOpenSongBackground,
}: SongCardProps) {
  const total = song.slides.length;
  const used = countUsedSlides(song, entry);
  const excludedCount = total - used;
  const background = appliedBackground(entry, commonBackground);
  const hasSongBackground = entry.background !== undefined;

  // 썸네일 줄과 버튼은 카드 클릭으로 치지 않는다
  const openFromCard = (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest("[data-thumbs], button")) return;
    onOpenSlideEditor();
  };

  return (
    // 카드 클릭은 "슬라이드 편집" 버튼과 같은 일을 하는 지름길이다. 키보드는 그 버튼을 쓴다
    <article onClick={openFromCard}>
      <header>
        <span>{order + 1}</span>
        <h3>{song.title}</h3>
        <p>
          {used}장 사용 · {excludedCount > 0 ? `${excludedCount}장 제외` : "전체"} · {total}장 중
        </p>
        <button
          type="button"
          onClick={onOpenSongBackground}
          title={hasSongBackground ? `곡별 배경: ${backgroundName(background)}` : "곡별 배경 지정"}
        >
          <span
            aria-hidden
            style={{ ...backgroundStyle(background), display: "inline-block", width: 16, height: 16 }}
          />
          {hasSongBackground ? `곡별 배경: ${backgroundName(background)}` : "곡별 배경"}
        </button>
        <button type="button" onClick={onOpenSlideEditor}>
          슬라이드 편집
        </button>
      </header>
      <ol data-thumbs="" style={{ display: "flex", overflowX: "auto", listStyle: "none", padding: 0 }}>
        {song.slides.map((slide) => (
          <li key={slide.index}>
            <SlideThumb
              slide={slide}
              background={background}
              excluded={entry.excluded.has(slide.index)}
            />
          </li>
        ))}
      </ol>
    </article>
  );
}
