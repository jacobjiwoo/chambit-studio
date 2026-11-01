import { useState } from "react";

import { searchSongs } from "../_lib/search";
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

export function Search({ catalog, isInSetlist, onToggleSong }: SearchProps) {
  const [query, setQuery] = useState("");
  const songs = catalog.status === "success" ? catalog.songs : [];
  const results = searchSongs(songs, query);
  const trimmed = query.trim();

  return (
    <section>
      <h2>찬양 라이브러리</h2>
      <input
        type="search"
        aria-label="찬양 제목으로 검색"
        placeholder="찬양 제목으로 검색"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {catalog.status === "loading" && <p role="status">곡 목록을 불러오는 중이에요</p>}
      {catalog.status === "error" && <p role="alert">곡 목록을 불러오지 못했어요</p>}
      {catalog.status === "success" && (
        <>
          <p>{results.length}곡</p>
          {results.length > 0 ? (
            <ul>
              {results.map((song) => {
                const added = isInSetlist(song.id);
                return (
                  <li key={song.id} onClick={() => onToggleSong(song.id)}>
                    <span>{song.title}</span> <span>{song.slideCount}장</span>{" "}
                    <button
                      type="button"
                      aria-pressed={added}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleSong(song.id);
                      }}
                    >
                      {added ? "담김" : "추가"}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : trimmed === "" ? (
            <p>찬양 제목을 입력하세요</p>
          ) : (
            <p>&ldquo;{trimmed}&rdquo; 검색 결과가 없어요. 다른 키워드로 검색해 보세요</p>
          )}
        </>
      )}
    </section>
  );
}
