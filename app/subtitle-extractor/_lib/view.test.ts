/**
 * 원고 패널이 그리는 줄 — 규칙 층 출력에서 **유도**한 것이 맞는지 본다.
 *
 * 여기가 조용히 틀리는 방식은 화면이 깨지는 것이 아니라 **짝이 어긋나는 것**이다. 3번 자막을
 * 눌렀는데 원고의 다른 자리가 강조되면 담당자는 그 자리를 검수한 것으로 착각한다. 눈으로는
 * 잡히지 않으므로(양쪽 다 그럴듯해 보인다) 테스트가 유일한 통로다.
 */
import { describe, expect, it } from "vitest";

import type { StyledRun } from "./rules";
import { toScript } from "./view";

const R = "#FF0000";
const K = "#000000";

describe("원고 줄", () => {
  it("문단 하나가 줄 하나다 — 조각 여럿이 색을 지닌 채 한 줄에 모인다", () => {
    const runs: StyledRun[] = [
      { text: "그때 ", color: K, paragraph: 4 },
      { text: "허브 브룩스", color: R, paragraph: 4 },
      { text: " 감독은 이런 말을 했습니다.\n", color: K, paragraph: 4 },
    ];

    expect(toScript(runs, [])).toEqual([
      {
        paragraph: 4,
        runs: [
          { text: "그때 ", color: K },
          { text: "허브 브룩스", color: R },
          { text: " 감독은 이런 말을 했습니다.", color: K },
        ],
        subtitle: null,
      },
    ]);
  });

  it("문단 번호 오름차순으로 선다 — 파서가 넘긴 순서가 아니라", () => {
    const runs: StyledRun[] = [
      { text: "뒤\n", color: K, paragraph: 9 },
      { text: "앞\n", color: K, paragraph: 2 },
    ];

    expect(toScript(runs, []).map((line) => line.paragraph)).toEqual([2, 9]);
  });

  it("자막이 된 문단은 장 번호를 달고, 나머지는 null이다", () => {
    const runs: StyledRun[] = [
      { text: "검은 본문\n", color: K, paragraph: 0 },
      { text: "첫 자막\n", color: R, paragraph: 1 },
      { text: "또 검은 본문\n", color: K, paragraph: 2 },
      { text: "둘째 자막\n", color: R, paragraph: 3 },
    ];
    const subtitles = [
      { text: "첫 자막", paragraph: 1 },
      { text: "둘째 자막", paragraph: 3 },
    ];

    expect(toScript(runs, subtitles).map((line) => line.subtitle)).toEqual([null, 1, null, 2]);
  });

  it("글자 그대로 같은 자막이 두 번 나와도 각자 제 장 번호를 단다", () => {
    // 규칙 5가 dedupe를 금지하므로 문구로 짝을 찾으면 두 문단이 같은 장을 가리킨다
    const runs: StyledRun[] = [
      { text: "같은 자막\n", color: R, paragraph: 3 },
      { text: "다른 자막\n", color: R, paragraph: 5 },
      { text: "같은 자막\n", color: R, paragraph: 8 },
    ];
    const subtitles = [
      { text: "같은 자막", paragraph: 3 },
      { text: "다른 자막", paragraph: 5 },
      { text: "같은 자막", paragraph: 8 },
    ];

    expect(toScript(runs, subtitles).map((line) => line.subtitle)).toEqual([1, 2, 3]);
  });

  it("문단 끝의 개행을 뗀다 — 문단이 이미 한 줄이라 두면 빈 줄이 하나씩 낀다", () => {
    const runs: StyledRun[] = [{ text: "한 줄\n", color: K, paragraph: 0 }];

    expect(toScript(runs, [])[0].runs).toEqual([{ text: "한 줄", color: K }]);
  });

  it("안쪽의 공백은 원고 그대로다 — 앞뒤로도 자르지 않는다", () => {
    const runs: StyledRun[] = [
      { text: "  들여쓴 문장 /  두 칸  \n", color: K, paragraph: 0 },
    ];

    // 자막은 앞뒤를 자르지만(규칙 3) 원고 패널은 한글에서 보던 그 모습이어야 대조가 선다
    expect(toScript(runs, [])[0].runs).toEqual([{ text: "  들여쓴 문장 /  두 칸  ", color: K }]);
  });

  it("개행만 남은 조각은 줄에서 빠지고, 빈 문단은 빈 줄로 남는다", () => {
    const runs: StyledRun[] = [
      { text: "본문", color: K, paragraph: 0 },
      { text: "\n", color: K, paragraph: 0 },
      { text: "", color: K, paragraph: 1 },
    ];

    // 빈 문단을 통째로 버리면 원고의 문단 간격이 사라져 한글에서 보던 모습과 어긋난다
    expect(toScript(runs, [])).toEqual([
      { paragraph: 0, runs: [{ text: "본문", color: K }], subtitle: null },
      { paragraph: 1, runs: [], subtitle: null },
    ]);
  });

  it("빨간 글자가 하나도 없는 원고도 전문이 그대로 선다", () => {
    const runs: StyledRun[] = [
      { text: "검은 본문 하나\n", color: K, paragraph: 0 },
      { text: "검은 본문 둘\n", color: K, paragraph: 1 },
    ];

    expect(toScript(runs, [])).toHaveLength(2);
  });

  it("조각이 하나도 없으면 줄도 없다", () => {
    expect(toScript([], [])).toEqual([]);
  });
});
