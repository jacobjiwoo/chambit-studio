import type { CatalogEntry } from "./song";

/** 검색 결과는 앞에서부터 이만큼만 보인다. 원본 SQL의 `LIMIT 50`이다. */
export const SEARCH_LIMIT = 50;

/**
 * 제목으로 곡 목록을 거른다. 원본 SQL `title LIKE %q% COLLATE NOCASE LIMIT 50`과 같은 결과다:
 * 앞뒤 공백을 뗀 검색어가 제목에 부분 문자열로 들어 있는 곡을 곡 목록 순서대로 앞의 50곡.
 * 검색어가 비면 결과도 빈다.
 */
export function searchSongs(songs: readonly CatalogEntry[], query: string): CatalogEntry[] {
  const needle = foldCase(query.trim());
  if (needle === "") return [];
  const results: CatalogEntry[] = [];
  for (const song of songs) {
    if (!foldCase(song.title).includes(needle)) continue;
    results.push(song);
    if (results.length === SEARCH_LIMIT) break;
  }
  return results;
}

/** SQLite의 NOCASE는 ASCII 영문자만 대소문자를 가린다. 그대로 따른다. */
function foldCase(text: string): string {
  return text.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
}
