/**
 * 화면이 쓰는 모양 — **잠정이다.**
 *
 * 프로토타입이 화면을 그리려고 발명한 타입이라 규칙 층의 진짜 출력과 일치하는지 검증된 적이
 * 없다. 지금 확정된 타입은 `StyledRun` 하나뿐이며, 여기 있는 것들은 규칙 층이 서는 날
 * (`build/04-drop-to-download.md`) 실출력에 맞춰 다시 본다.
 *
 * 규칙 층 출력을 화면 사정으로 비틀지 않는다 — 필요한 모양은 화면 쪽에서 유도한다.
 *
 * **`rules.ts`와 이름이 겹친다.** `Dropped`·`UnknownColor`가 양쪽에 있고 `Dropped.paragraph`는
 * 뜻이 정반대다 — 여기서는 문단 전문(string), `rules.ts`에서는 문단 인덱스(number).
 * 04에서 이 파일을 다시 볼 때 한쪽으로 정리한다. 그때까지는 import 대상을 확인할 것.
 */

export type Verdict = "subtitle" | "mixed" | "directive" | "black";

export type Block = {
  paragraph: number;
  text: string;
  verdict: Verdict;
  runs: { text: string; color: string }[];
  /** 자막이 된 문단이면 그 장 번호 (1부터) */
  index?: number;
  /** 빨갛지만 자막이 되지 못한 조각들 */
  redFragments?: string[];
};

export type Doc = {
  filename: string;
  blocks: Block[];
  subtitles: string[];
};

/** 빨강도 검정도 아닌 색 — 화면의 노출 의무 2. */
export type UnknownColor = {
  color: string;
  text: string;
  /** 원고의 어느 문단에 있는가 — 화면이 "원고에서 보기"로 데려갈 좌표 */
  paragraph: number;
};

/** 규칙이 버린 빨간 조각 — 문단을 맥락으로 달고 다닌다. 화면의 노출 의무 1. */
export type Dropped = {
  fragment: string;
  paragraph: string;
  /** 목록에서 이 조각이 원래 있던 자리 (앞선 자막 장 번호) */
  after: number;
};

export function droppedInOrder(doc: Doc): Dropped[] {
  const out: Dropped[] = [];
  let after = 0;
  for (const b of doc.blocks) {
    if (b.verdict === "subtitle") after = b.index ?? after;
    const fragments = b.redFragments ?? (b.verdict === "directive" ? [b.text] : []);
    for (const fragment of fragments) {
      out.push({ fragment, paragraph: b.text, after });
    }
  }
  return out;
}

export function charCount(s: string): number {
  return [...s].length;
}
