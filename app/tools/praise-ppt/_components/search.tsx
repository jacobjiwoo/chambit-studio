import type { Catalog } from "./catalog";

/** 검색(05). 검색어 상태와 검색 `_lib`은 05가 이 컴포넌트 아래에 둔다. */
export type SearchProps = {
  /** 곡 목록 불러오기 상태. 성공이면 `songs`가 곡 목록 순서 그대로다 */
  catalog: Catalog;
  /** 결과마다 담김 여부를 보인다 */
  isInSetlist: (songId: number) => boolean;
  /** 결과의 행이나 추가 버튼을 누르면 부른다. 없으면 맨 뒤에 담고, 있으면 뺀다 */
  onToggleSong: (songId: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 빈 자리. 채우는 티켓이 지운다
export function Search(_: SearchProps) {
  return (
    <section>
      <h2>검색</h2>
    </section>
  );
}
