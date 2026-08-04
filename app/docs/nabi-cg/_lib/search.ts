/**
 * 색인 하나가 들어가고 **결과 줄**이 나온다 — 브라우저와 게이트가 **같은 이 함수**를 쓴다.
 *
 * ```
 * buildDocs() ──▶ index(JSON 한 덩이) ──▶ loadIndex().find(질의) ──▶ 결과 줄
 *      빌드 타임                 정적 파일                브라우저 · 게이트 1
 * ```
 *
 * 이 파일에는 **`node:*`가 없다.** 검색을 실제로 쓴 순간에만 `import()`로 내려가는 조각이라
 * 본문 페이지의 짐이 되면 안 된다. 색인을 굽는 쪽(`build-docs.ts`)이 이 파일을 불러 쓰지,
 * 이 파일이 그쪽을 부르지 않는다.
 */
import MiniSearch, { type Options, type SearchResult } from "minisearch";

import { indexTokens, queryTokens } from "./tokenize";

/**
 * **자리 하나** — 검색이 데려다주는 곳이자 결과 줄에 뜨는 이름이다. 색인 · 결과 · 화면이 이
 * 네 칸을 통째로 들고 다니므로 한 타입으로 묶는다.
 */
export type Place = {
  slug: string;
  /** 페이지 제목 — 결과 줄의 왼쪽 */
  section: string;
  /** 소제목 — 결과 줄의 오른쪽. 페이지 머리글(제목·한 줄 설명) 자리는 빈 문자열이다 */
  heading: string;
  /** 그 자리로 떨어지는 주소 — 페이지 주소 + 섹션 앵커 */
  href: string;
};

/** 색인 한 칸 = **페이지가 아니라 섹션**이다. 결과 줄이 `섹션 › 소제목`이려면 이 단위여야 한다. */
export type IndexEntry = Place & {
  /** 색인 글줄. **소제목으로 시작하고** 그 뒤가 본문이다 — 문맥은 여기서 잘려 나간다 */
  text: string;
};

/** 문맥 한 조각. `hit`이 하이라이트 자리다 — 화면이 이걸 `<mark>`로 그린다. */
export type Segment = { text: string; hit: boolean };

/** 결과 한 줄 — 자리 하나에 *"왜 걸렸는가"*가 붙은 것. */
export type Hit = Place & { context: Segment[] };

export type DocSearch = { find(query: string): Hit[] };

/** 모달에 뜨는 줄 수. 게이트도 **사람이 보는 만큼**만 보고 재현율을 센다. */
export const SEARCH_LIMIT = 8;

/** 색인이 놓인 자리. 이 주소를 만드는 라우트는 `search-index.json/route.ts` 하나뿐이다. */
export const INDEX_URL = "/docs/nabi-cg/search-index.json";

/** 문맥 길이와, 매치 앞에 남겨 두는 만큼. 결과 줄 하나가 한 줄로 끝나는 길이다. */
const CONTEXT_LENGTH = 90;
const CONTEXT_LEAD = 24;

/**
 * 색인과 질의가 **같은 설정을 쓴다.** 토크나이저만 양쪽이 다르다 — 공백 제거 정규화는
 * 색인 쪽에만 있다(`tokenize.ts` 참조).
 *
 * `combineWith: "AND"` — 질의의 모든 토큰(2-gram 포함)을 요구한다. 실측에서 이 조합이
 * 재현율 100%에 오탐 0이었다. `prefix`는 조사와 라틴 어미를 흡수한다(`윤곽선` → `윤곽선만`).
 */
const OPTIONS: Options<IndexEntry> = {
  // 주소가 곧 신원이다 — 한 자리에 두 칸이 설 수 없다는 것을 `buildDocs()`가 빌드에서 막는다
  idField: "href",
  fields: ["section", "heading", "text"],
  storeFields: ["slug", "section", "heading", "href", "text"],
  tokenize: indexTokens,
  searchOptions: {
    combineWith: "AND",
    prefix: true,
    // 제목 줄에 걸린 질의가 본문 한 번 스친 것보다 위다
    boost: { heading: 3, section: 2 },
    tokenize: queryTokens,
  },
};

/** 빌드에서 굽는다. 나오는 문자열이 **그대로 브라우저로 내려가는 바이트**다. */
export function bake(entries: IndexEntry[]): string {
  const mini = new MiniSearch<IndexEntry>(OPTIONS);
  mini.addAll(entries);
  return JSON.stringify(mini);
}

export function loadIndex(json: string): DocSearch {
  const mini = MiniSearch.loadJSON<IndexEntry>(json, OPTIONS);

  return {
    find(query: string): Hit[] {
      if (!query.trim()) return [];

      const terms = queryTokens(query)
        .filter((term) => term.length >= 2)
        .sort((a, b) => b.length - a.length);

      return mini
        .search(query)
        .slice(0, SEARCH_LIMIT)
        .map((found: SearchResult) => {
          // `storeFields`에 넣어 둔 칸들이 결과에 그대로 실려 온다
          const result = found as SearchResult & IndexEntry;
          return {
            slug: result.slug,
            section: result.section,
            heading: result.heading,
            href: result.href,
            // 색인 글줄은 소제목으로 시작한다(`text`의 정의). 줄 위에 이미 뜬 소제목을 문맥이
            // 또 읽어 주면 그 줄이 죽으므로 **본문에서 걸린 자리를 먼저** 잡고, 소제목에서만
            // 걸렸으면 그때는 소제목을 보여 준다 — 하이라이트가 사라지는 것보다 낫다
            context: context(result.text, terms, result.heading.length),
          };
        });
    },
  };
}

/** 질의어가 실제로 걸린 자리들. 긴 것부터 잡고 겹치는 것은 버린다. */
function ranges(haystack: string, terms: string[]): { from: number; to: number }[] {
  const found: { from: number; to: number }[] = [];

  for (const term of terms) {
    for (let at = haystack.indexOf(term); at !== -1; at = haystack.indexOf(term, at + 1)) {
      const to = at + term.length;
      if (found.some((range) => at < range.to && range.from < to)) continue;
      found.push({ from: at, to });
    }
  }

  return found.sort((a, b) => a.from - b.from);
}

/**
 * 매치된 자리 둘레를 잘라 온다. **하이라이트가 화면 쪽 장식이 아니라 여기서 나온다** —
 * 결과 줄에서 *"왜 이게 걸렸는가"*를 못 보면 여덟 줄 중 하나를 고를 수가 없다.
 */
function context(text: string, terms: string[], skip: number): Segment[] {
  const found = ranges(text.toLowerCase(), terms);
  const first = found.find((range) => range.from >= skip) ?? found[0];

  const from = first ? Math.max(0, first.from - CONTEXT_LEAD) : 0;
  const to = Math.min(text.length, from + CONTEXT_LENGTH);

  const segments: Segment[] = [];
  let cursor = from;
  for (const range of found) {
    if (range.from < cursor || range.to > to) continue;
    if (range.from > cursor) segments.push({ text: text.slice(cursor, range.from), hit: false });
    segments.push({ text: text.slice(range.from, range.to), hit: true });
    cursor = range.to;
  }
  if (cursor < to) segments.push({ text: text.slice(cursor, to), hit: false });

  if (from > 0) segments.unshift({ text: "…", hit: false });
  if (to < text.length) segments.push({ text: "…", hit: false });

  return segments;
}
