/**
 * 화면이 쓰는 모양 — 규칙 층 출력에서 **유도**한다.
 *
 * 04가 문서 상태를 세우면서 정리한 것 — **규칙 층 출력을 화면 사정으로 비틀지 않는다.**
 * 걸러낸 것과 모르는 색은 `rules.ts`의 타입을 그대로 쓴다.
 *
 * 프로토타입이 원고 패널을 그리려고 발명한 `Doc`/`Block`/`Verdict`는 여기 없다. 규칙 층
 * 실출력과 대조된 적이 없는 모양이었고, 특히 `Verdict`는 문단마다 판정 이름을 붙였지만
 * **화면이 그 이름으로 갈라지는 자리가 없다** — 원고 패널이 문단 하나를 두고 묻는 것은
 * "이게 몇 번 자막이 됐나" 하나뿐이라 `subtitle: number | null`이면 끝난다.
 */
import type { StyledRun, Subtitle } from "./rules";

/** 색을 지닌 조각 하나 — 원고 그대로 그린다 */
type Fragment = { text: string; color: string };

/**
 * 원고 패널의 한 줄 = 문단 하나.
 *
 * 자막의 단위가 문단이므로(규칙 2) 원고를 문단으로 세워야 두 패널의 짝이 1:1로 선다.
 */
export type ScriptLine = {
  paragraph: number;
  /** 문단의 조각들. 색이 원고 그대로 실려 온다 — 빨강은 빨강으로 보여야 대조가 성립한다 */
  runs: Fragment[];
  /** 이 문단이 된 자막 장 번호(1부터). 자막이 되지 못한 문단은 `null` */
  subtitle: number | null;
};

/**
 * 조각들을 문단으로 묶고, 자막이 된 문단에 장 번호를 붙인다.
 *
 * **장 번호는 세지 않고 규칙 층에게 받는다.** 여기서 "어떤 문단이 자막이 되는가"를 다시
 * 판정하면 규칙이 두 벌이 되고, 그 둘이 어긋나는 날 화면은 멀쩡한 얼굴로 엉뚱한 짝을
 * 강조한다 — 담당자는 검수했다고 믿은 채 넘어간다.
 */
export function toScript(runs: StyledRun[], subtitles: Subtitle[]): ScriptLine[] {
  const chapterOf = new Map<number, number>();
  subtitles.forEach((s, i) => chapterOf.set(s.paragraph, i + 1));

  const lines = new Map<number, Fragment[]>();
  for (const { text, color, paragraph } of runs) {
    const line = lines.get(paragraph);
    if (line) line.push({ text, color });
    else lines.set(paragraph, [{ text, color }]);
  }

  return [...lines.keys()]
    .sort((a, b) => a - b)
    .map((paragraph) => ({
      paragraph,
      runs: dropParagraphBreak(lines.get(paragraph)!),
      subtitle: chapterOf.get(paragraph) ?? null,
    }));
}

/**
 * 문단 끝의 **개행만** 뗀다. 빈 조각도 함께 버린다.
 *
 * 문단 하나가 이미 화면의 한 줄이라 개행을 그대로 두면 문단마다 빈 줄이 하나씩 낀다. 공백은
 * 안쪽이든 앞뒤든 **건드리지 않는다**(`String.trimEnd`와 다르다) — 한글에서 보던 그 모습이어야
 * 대조가 성립한다.
 */
function dropParagraphBreak(runs: Fragment[]): Fragment[] {
  const kept = runs.filter((r) => r.text !== "");
  const last = kept[kept.length - 1];
  if (!last) return kept;

  const text = last.text.replace(/\n+$/, "");
  if (text === last.text) return kept;
  return text === "" ? kept.slice(0, -1) : [...kept.slice(0, -1), { ...last, text }];
}

export function charCount(s: string): number {
  return [...s].length;
}
