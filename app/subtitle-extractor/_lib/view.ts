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
import { inkOf, type StyledRun, type Subtitle } from "./rules";

/**
 * 규칙이 이 조각을 어떻게 다뤘는가 — 원고 패널이 표기를 가르는 근거다.
 *
 * - `plain` — 자막이 된 빨강, 그리고 검정. 규칙이 손대지 않았다
 * - `dropped` — 빨갛지만 자막이 되지 못했다
 * - `unknown` — 빨강도 검정도 아니라 규칙이 읽지 못했다
 *
 * 편집을 막은 대가는 **노출**로 갚는다. 규칙이 버린 것을 화면이 숨기면 담당자가 규칙의 실수를
 * 알아챌 통로가 남지 않는다. 셋이 각각 **어떻게 보이는지**는 그것을 그리는 쪽이 정한다
 * (`script-pane.tsx`의 `MARKING`).
 */
export type Marking = "plain" | "dropped" | "unknown";

/** 색을 지닌 조각 하나 — 원고 그대로 그리되 규칙이 어떻게 다뤘는지를 함께 단다 */
type Fragment = { text: string; color: string; marking: Marking };

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

  const lines = new Map<number, StyledRun[]>();
  for (const run of runs) {
    const line = lines.get(run.paragraph);
    if (line) line.push(run);
    else lines.set(run.paragraph, [run]);
  }

  return [...lines.keys()]
    .sort((a, b) => a - b)
    .map((paragraph) => {
      const subtitle = chapterOf.get(paragraph) ?? null;
      const fragments = lines
        .get(paragraph)!
        .map(({ text, color }) => ({ text, color, marking: markingOf(color, text, subtitle) }));

      return { paragraph, runs: dropParagraphBreak(fragments), subtitle };
    });
}

/**
 * 조각 하나의 표기를 정한다.
 *
 * **"이 문단이 자막인가"는 여기서 다시 판정하지 않는다** — 그 답은 `subtitle`에 이미 규칙 층이
 * 실어 보냈다. 이 함수가 하는 일은 그 답과 조각의 잉크(`inkOf`, 규칙 층의 눈)를 맞춰 보는
 * 것뿐이라 규칙이 두 벌이 되지 않는다.
 *
 * 걸러낸 빨강을 `Dropped.fragment`와 **문구로 맞추지 않는 이유**는 규칙 4가 걸러낸 것을 문단
 * 전문 한 덩어리로 내놓기 때문이다 — 꺾쇠 지시문이 조각 둘로 쪼개져 있는 날 어느 조각도
 * 문구와 맞지 않아 취소선이 통째로 사라진다. "자막이 되지 못한 문단의 빨강"이면 충분하고, 그
 * 집합이 곧 `dropped`다.
 *
 * 공백만인 조각은 어느 쪽으로도 표기하지 않는다 — 그을 글자가 없고, 규칙 층도 같은 이유로
 * 이런 조각을 세지 않는다(규칙 2·6).
 */
function markingOf(color: string, text: string, subtitle: number | null): Marking {
  if (!text.trim()) return "plain";

  const ink = inkOf(color);
  if (ink === "unknown") return "unknown";
  return ink === "red" && subtitle === null ? "dropped" : "plain";
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
