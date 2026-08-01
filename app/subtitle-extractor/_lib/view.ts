/**
 * 화면이 쓰는 모양.
 *
 * 04가 문서 상태를 세우면서 정리한 것 — **규칙 층 출력을 화면 사정으로 비틀지 않는다.**
 * 걸러낸 것과 모르는 색은 `rules.ts`의 타입을 그대로 쓴다. 여기 같은 이름의 타입이 따로
 * 있었고 `Dropped.paragraph`가 한쪽은 문단 전문, 한쪽은 문단 인덱스라 뜻이 정반대였다.
 * 화면이 필요로 하는 모양은 규칙 층 출력에서 **유도**하지, 나란히 두고 고르지 않는다.
 *
 * 아래 `Doc`/`Block`/`Verdict`는 **아직 잠정이다.** 프로토타입이 원고 패널을 그리려고
 * 발명한 모양이고, 04의 화면(헤더 + 자막 장)은 이것들을 하나도 쓰지 않아 규칙 층 실출력과
 * 대조된 적이 없다. 원고 패널이 서는 날(`build/05-script-pane.md`) `StyledRun[]`에서
 * 유도하며 다시 본다.
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

export function charCount(s: string): number {
  return [...s].length;
}
