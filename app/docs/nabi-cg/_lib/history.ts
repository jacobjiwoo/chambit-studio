/**
 * `_meta/nabi-history.md` 파서 — compix 게시글 하단 `- History -`를 그대로 옮겨 적은 저장소
 * 사본을 읽어, 게이트 4·6이 검사할 형태로 편다. 06 티켓.
 *
 * 태그 파서(`extractSidecar`)와 같은 자리에 선다 — 이 함수 자체에는 별도 테스트가 없고,
 * `_meta/nabi-build.test.ts`의 게이트 4·6·소스가 잘못됐을 때가 이 함수의 산출물로 검증한다.
 *
 * 형식: `## YYYY.MM` 아래 `- 항목` 줄이 이어지고, 항목마다 다음 줄에 `  영향: ...`이 붙는다.
 * 항목에 `영향:` 줄이 없으면 `impact`가 `null`로 남는다 — 게이트 6이 그 자리를 잡는다.
 */

export type HistoryItem = { text: string; impact: string | null };
export type HistoryEntry = { date: string; items: HistoryItem[] };

/** `## YYYY.MM` — 날짜만 뽑고 나머지는 버린다. 게이트 4·5가 이 값을 그대로 비교한다. */
const DATE_HEADING = /^##\s+(\d{4}\.\d{2})\s*$/;
/** `- 항목` — 들여쓰기 없이 시작해야 새 항목이다. `영향:` 줄과 구분하는 유일한 표식이 이 위치다. */
const ITEM_LINE = /^-\s+(.*)$/;
/** `  영향: ...` — 항목 줄과 달리 **들여써야** 한다. 들여쓰기가 없으면 새 항목으로 읽혀 게이트 6이
 * "영향: 줄이 없다"로 잘못 잡는다. */
const IMPACT_LINE = /^\s+영향:\s*(.*)$/;

/** 날짜 순서는 파일에 쓰인 순서를 그대로 물려준다 — 최신이 맨 위(게이트 4가 `entries[0]`을 본다). */
export function parseHistory(content: string): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  let current: HistoryEntry | null = null;
  let currentItem: HistoryItem | null = null;

  for (const line of content.split("\n")) {
    const heading = DATE_HEADING.exec(line);
    if (heading) {
      current = { date: heading[1], items: [] };
      entries.push(current);
      currentItem = null;
      continue;
    }

    const item = ITEM_LINE.exec(line);
    if (item && current) {
      currentItem = { text: item[1].trim(), impact: null };
      current.items.push(currentItem);
      continue;
    }

    const impact = IMPACT_LINE.exec(line);
    if (impact && currentItem) {
      currentItem.impact = impact[1].trim();
    }
  }

  return entries;
}
