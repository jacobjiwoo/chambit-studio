/**
 * 원고 패널이 그리는 줄 — 규칙 층 출력에서 **유도**한 것이 맞는지 본다.
 *
 * 여기가 조용히 틀리는 방식은 화면이 깨지는 것이 아니라 **짝이 어긋나는 것**이다. 3번 자막을
 * 눌렀는데 원고의 다른 자리가 강조되면 담당자는 그 자리를 검수한 것으로 착각한다. 눈으로는
 * 잡히지 않으므로(양쪽 다 그럴듯해 보인다) 테스트가 유일한 통로다.
 */
import { describe, expect, it } from "vitest";

import { toSubtitles, type StyledRun } from "./rules";
import { toScript } from "./view";

const R = "#FF0000";
const K = "#000000";
const BLUE = "#0000FF";

describe("원고 줄", () => {
  it("문단 하나가 줄 하나다 — 조각 여럿이 색을 지닌 채 한 줄에 모인다", () => {
    const runs: StyledRun[] = [
      { text: "그때 ", color: K, paragraph: 4 },
      { text: "허브 브룩스", color: R, paragraph: 4 },
      { text: " 감독은 이런 말을 했습니다.\n", color: K, paragraph: 4 },
    ];

    // 가운데 조각이 `dropped`인 것은 검은 글 사이의 빨강이기 때문이다 — 표기가 갈리는
    // 자리는 아래 「원고 패널의 표기」가 따로 본다
    expect(toScript(runs, [])).toEqual([
      {
        paragraph: 4,
        runs: [
          { text: "그때 ", color: K, marking: "plain" },
          { text: "허브 브룩스", color: R, marking: "dropped" },
          { text: " 감독은 이런 말을 했습니다.", color: K, marking: "plain" },
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

    expect(toScript(runs, [])[0].runs).toEqual([{ text: "한 줄", color: K, marking: "plain" }]);
  });

  it("안쪽의 공백은 원고 그대로다 — 앞뒤로도 자르지 않는다", () => {
    const runs: StyledRun[] = [
      { text: "  들여쓴 문장 /  두 칸  \n", color: K, paragraph: 0 },
    ];

    // 자막은 앞뒤를 자르지만(규칙 3) 원고 패널은 한글에서 보던 그 모습이어야 대조가 선다
    expect(toScript(runs, [])[0].runs).toEqual([
      { text: "  들여쓴 문장 /  두 칸  ", color: K, marking: "plain" },
    ]);
  });

  it("개행만 남은 조각은 줄에서 빠지고, 빈 문단은 빈 줄로 남는다", () => {
    const runs: StyledRun[] = [
      { text: "본문", color: K, paragraph: 0 },
      { text: "\n", color: K, paragraph: 0 },
      { text: "", color: K, paragraph: 1 },
    ];

    // 빈 문단을 통째로 버리면 원고의 문단 간격이 사라져 한글에서 보던 모습과 어긋난다
    expect(toScript(runs, [])).toEqual([
      { paragraph: 0, runs: [{ text: "본문", color: K, marking: "plain" }], subtitle: null },
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

/**
 * 표기 셋 — 자막이 된 빨강(원래 색) · 걸러낸 빨강(취소선) · 모르는 색(물결 밑줄).
 *
 * 여기가 조용히 틀리는 방식은 **규칙이 버린 것을 화면이 숨기는 것**이다. 취소선이 안 그려지면
 * 담당자는 원고를 읽으면서 "이건 뺐구나"를 영영 모르고, 물결 밑줄이 안 그려지면 자막 한 장을
 * 삼킨 색이 원고 어디에 있는지 눈으로 찾지 못한다.
 */
const marks = (runs: StyledRun[], subtitles: Parameters<typeof toScript>[1] = []) =>
  toScript(runs, subtitles).flatMap((line) => line.runs.map((r) => r.marking));

describe("원고 패널의 표기", () => {
  it("자막이 된 문단의 빨강은 원래 색 그대로다 — 표기를 얹지 않는다", () => {
    const runs: StyledRun[] = [{ text: "“자막 본문입니다”\n", color: R, paragraph: 3 }];

    expect(marks(runs, [{ text: "“자막 본문입니다”", paragraph: 3 }])).toEqual(["plain"]);
  });

  it("검은 글 사이에 섞여 자막이 되지 못한 빨강은 걸러낸 것으로 표기된다", () => {
    const runs: StyledRun[] = [
      { text: "사도 바울은 고린도를 방문하여 ", color: K, paragraph: 5 },
      { text: "<사진을 띄운다.>", color: R, paragraph: 5 },
      { text: " 복음을 전했고,\n", color: K, paragraph: 5 },
    ];

    expect(marks(runs)).toEqual(["plain", "dropped", "plain"]);
  });

  it("문단을 통째로 차지한 꺾쇠 지시문은 조각이 여럿이어도 전부 취소선이 걸린다", () => {
    // 규칙 4가 걸러낸 것을 **문단 전문 한 덩어리**로 내놓으므로(`Dropped.fragment`), 조각을
    // 문구로 되찾으려 하면 여기서 취소선이 통째로 사라진다
    const runs: StyledRun[] = [
      { text: "<사진과 ", color: R, paragraph: 7 },
      { text: "함께 글을 띄운다.>\n", color: R, paragraph: 7 },
    ];

    expect(marks(runs)).toEqual(["dropped", "dropped"]);
  });

  it("빨강도 검정도 아닌 색은 모르는 색으로 표기된다 — 같은 문단의 빨강과 갈린다", () => {
    const runs: StyledRun[] = [
      { text: "빨간 앞부분 ", color: R, paragraph: 9 },
      { text: "파란 뒷부분\n", color: BLUE, paragraph: 9 },
    ];

    expect(marks(runs)).toEqual(["dropped", "unknown"]);
  });

  it("공백만인 조각에는 표기를 얹지 않는다 — 취소선도 밑줄도 그을 글자가 없다", () => {
    const runs: StyledRun[] = [
      { text: "  ", color: R, paragraph: 2 },
      { text: "   ", color: BLUE, paragraph: 2 },
      { text: "검은 본문\n", color: K, paragraph: 2 },
    ];

    expect(marks(runs)).toEqual(["plain", "plain", "plain"]);
  });

  it("모르는 색이 자막 한 장을 삼킨 원고에서 그 문단이 표기로 드러난다", () => {
    // 프로토타입에서 8장 → 7장이 실제로 재현된 방식이다. 자막이 되어야 할 문단의 조각
    // 하나가 다른 색이면 그 문단은 통째로 자막이 되지 못하고, 화면에는 **아무 흔적도 남지
    // 않는다** — 물결 밑줄과 취소선이 그 유일한 흔적이다
    const runs: StyledRun[] = [
      { text: "“십자가의 도가 멸망하는 자들에게는 ", color: R, paragraph: 12 },
      { text: "미련한 것이요", color: "#FF0100", paragraph: 12 },
      { text: " 구원을 받는 우리에게는 하나님의 능력이라”\n", color: R, paragraph: 12 },
    ];

    const [line] = toScript(runs, toSubtitles(runs).subtitles);

    expect(line.subtitle).toBeNull();
    expect(line.runs.map((r) => r.marking)).toEqual(["dropped", "unknown", "dropped"]);
  });

  it("표기한 모르는 색의 수가 규칙 층이 센 수와 같다 — 칩의 숫자와 원고가 어긋나지 않는다", () => {
    // 화면이 색을 **다시 판정하면** 칩은 "모르는 색 2곳"이라 말하는데 원고에는 밑줄이 하나만
    // 그어지는 날이 온다. 담당자는 나머지 한 곳을 영영 찾지 못한다
    const runs: StyledRun[] = [
      { text: "검은 본문\n", color: K, paragraph: 0 },
      { text: "파란 조각", color: BLUE, paragraph: 1 },
      { text: " 검은 꼬리\n", color: K, paragraph: 1 },
      { text: "   ", color: "#00FF00", paragraph: 2 },
      { text: "초록 조각\n", color: "#00FF00", paragraph: 3 },
    ];

    const marked = marks(runs).filter((m) => m === "unknown");

    expect(marked).toHaveLength(toSubtitles(runs).unknownColors.length);
    expect(marked).toHaveLength(2);
  });
});
