import type { Background } from "./background";
import { appliedBackground, type Setlist, type SetlistEntry } from "./setlist";
import type { FindSong, Song } from "./song";

/** PPT에 들어갈 한 장 — 슬라이드 이미지 주소와 그 장에 깔 배경. */
export type PlannedSlide = { image: string; background: Background };

/**
 * 생성 계획. 실패는 사유를 담는다 — 만들기 창이 그대로 보여 준다.
 * 화면의 "총 N장"과 성공 창의 슬라이드 수는 `slides.length`다.
 */
export type Plan = { ok: true; slides: PlannedSlide[] } | { ok: false; error: string };

/**
 * 셋리스트 순서대로, 곡 안에서는 번호 오름차순으로, 뺀 장 없이 늘어놓는다. 배경은 곡별 배경,
 * 없으면 공통 배경이다. 곡을 찾지 못한 항목은 건너뛴다.
 */
export function planSlides(setlist: Setlist, findSong: FindSong, common: Background): Plan {
  if (setlist.length === 0) return { ok: false, error: "곡이 선택되지 않았습니다" };

  const slides = setlist.flatMap((entry) => {
    const song = findSong(entry.songId);
    if (!song) return [];
    const background = appliedBackground(entry, common);
    return usedSlides(song, entry).map((s) => ({ image: s.image, background }));
  });

  if (slides.length === 0) return { ok: false, error: "생성할 슬라이드가 없습니다" };
  return { ok: true, slides };
}

function usedSlides(song: Song, entry: SetlistEntry) {
  return song.slides
    .filter((s) => !entry.excluded.has(s.index))
    .sort((a, b) => a.index - b.index);
}

/** 곡 하나에서 PPT에 들어갈 장수. 순서 목록과 곡 카드의 "N장 사용"이다. */
export function countUsedSlides(song: Song, entry: SetlistEntry): number {
  return usedSlides(song, entry).length;
}
