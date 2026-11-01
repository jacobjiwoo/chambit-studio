import type { ReactNode } from "react";

import type { Background } from "../_lib/background";
import type { Setlist } from "../_lib/setlist";
import type { FindSong } from "../_lib/song";
import { SongCard } from "./song-card";

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

export function SetlistDetail({
  setlist,
  findSong,
  commonBackground,
  slideTotal,
  commonBackgroundBar,
  onClearAll,
  onOpenSlideEditor,
  onOpenSongBackground,
}: SetlistDetailProps) {
  const count = setlist.length;

  return (
    <section>
      {commonBackgroundBar}
      <header>
        <h2>
          이번 예배 찬양{count > 0 && ` · ${count}곡`}
        </h2>
        <p>
          {count > 0
            ? `총 ${slideTotal}장의 슬라이드가 PPT로 만들어집니다`
            : "찬양을 검색해 셋리스트에 추가하세요"}
        </p>
        {count > 0 && (
          <button type="button" onClick={onClearAll}>
            전체 비우기
          </button>
        )}
      </header>

      {count === 0 ? (
        <SetlistEmpty />
      ) : (
        setlist.map((entry, order) => {
          const song = findSong(entry.songId);
          if (!song) return null;
          return (
            <SongCard
              key={entry.songId}
              order={order}
              song={song}
              entry={entry}
              commonBackground={commonBackground}
              onOpenSlideEditor={() => onOpenSlideEditor(entry.songId)}
              onOpenSongBackground={() => onOpenSongBackground(entry.songId)}
            />
          );
        })
      )}
    </section>
  );
}

const START_STEPS = [
  { title: "찬양 검색하기", description: "제목으로 찾거나 곡 목록을 둘러봐요" },
  { title: "예배 순서대로 담기", description: "곡을 누르면 셋리스트에 순서대로 담겨요" },
  { title: "PPT 만들기", description: "배경을 고르고 만들기 버튼을 누르면 pptx 파일로 받아요" },
];

/** 셋리스트가 비었을 때의 3단계 시작 안내. */
function SetlistEmpty() {
  return (
    <div>
      <h3>이번 주 예배, 이렇게 준비해요</h3>
      <ol>
        {START_STEPS.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
