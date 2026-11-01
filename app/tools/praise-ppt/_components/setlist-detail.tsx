import type { ReactNode } from "react";

import type { Background } from "../_lib/background";
import type { Setlist } from "../_lib/setlist";
import type { FindSong } from "../_lib/song";

/**
 * 셋리스트 상세(08). 곡 카드는 08이 이 컴포넌트 아래에 만든다. 썸네일 배경은
 * `_lib/setlist`의 `appliedBackground`이고 스타일은 `background-style.ts`다.
 */
export type SetlistDetailProps = {
  setlist: Setlist;
  findSong: FindSong;
  commonBackground: Background;
  /** 생성 계획 길이 — "총 N장의 슬라이드가 PPT로 만들어집니다" */
  slideTotal: number;
  /** 공통 배경 막대(09). 루트가 만들어 넘기고 상세는 자리에 그리기만 한다 */
  commonBackgroundBar: ReactNode;
  onClearAll: () => void;
  onOpenSlideEditor: (songId: number) => void;
  /** 곡 카드의 곡별 배경 버튼. 배경 서랍(09)을 그 곡 범위로 연다 */
  onOpenSongBackground: (songId: number) => void;
};

export function SetlistDetail({ commonBackgroundBar }: SetlistDetailProps) {
  return (
    <section>
      <h2>셋리스트 상세</h2>
      {commonBackgroundBar}
    </section>
  );
}
