import type { Setlist } from "../_lib/setlist";
import type { FindSong } from "../_lib/song";

/** 셋리스트 순서 목록(07). "N장 사용"은 `_lib/plan`의 `countUsedSlides`로 센다. */
export type SetlistOrderProps = {
  setlist: Setlist;
  /** 곡 목록과 올린 곡에서 찾는다. 못 찾으면 `undefined`다 */
  findSong: FindSong;
  onRemove: (songId: number) => void;
  /** `from` 자리의 곡을 `to` 자리로 옮긴다. 같은 자리거나 범위 밖이면 아무 일도 없다 */
  onMove: (from: number, to: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 빈 자리. 채우는 티켓이 지운다
export function SetlistOrder(_: SetlistOrderProps) {
  return (
    <section>
      <h2>셋리스트 순서</h2>
    </section>
  );
}
