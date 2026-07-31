/**
 * 정답 쌍은 발명한 것이 아니라 **옮겨 적은 것**이다.
 *
 * `.scratch/subtitle-extractor/issues/04-red-text-rules.md`의 Answer가 확정한 입력→출력 쌍
 * 9개를 `StyledRun` 배열 리터럴로 그대로 옮겼다. 1~8은 실물 원고 3편에서 뜬 것이고 9는
 * 미발동 방어 조항의 **의도를 고정하기 위한** 케이스다.
 *
 * 이 층의 회귀는 조용하다 — 자막이 8장이어야 하는데 7장이 나와도 화면은 멀쩡해 보인다.
 * 그래서 자막뿐 아니라 걸러낸 것과 모르는 색까지 함께 본다.
 */
import { describe, expect, it } from "vitest";

import { toSubtitles, type StyledRun } from "./rules";

const R = "#FF0000";
const K = "#000000";

describe("자막 장", () => {
  it("[1] 문단 전체가 빨강이면 그대로 한 장 — 끝의 개행만 잘린다", () => {
    const runs: StyledRun[] = [
      {
        text: "“십자가의 도가 멸망하는 자들에게는 미련한 것이요 구원을 받는 우리에게는 하나님의 능력이라” (고린도전서 1:18)\n",
        color: R,
        paragraph: 12,
      },
    ];

    expect(toSubtitles(runs)).toEqual({
      subtitles: [
        "“십자가의 도가 멸망하는 자들에게는 미련한 것이요 구원을 받는 우리에게는 하나님의 능력이라” (고린도전서 1:18)",
      ],
      dropped: [],
      unknownColors: [],
    });
  });

  it("[2] 한 문단의 3조각을 이어붙인다 — 첫 조각 끝의 공백이 살아 있어야 한다", () => {
    const runs: StyledRun[] = [
      { text: "“다른 이들도 너희에게 이런 권리를 가졌거든 하물며 우리일까보냐 ", color: R, paragraph: 30 },
      {
        text: "그러나 우리가 이 권리를 쓰지 아니하고 범사에 참는 것은 그리스도의 복음에 아무 장애가 없게 하려 함이로다",
        color: R,
        paragraph: 30,
      },
      { text: "” (고린도전서 9:12)\n", color: R, paragraph: 30 },
    ];

    // 조각별로 strip한 뒤 join하면 `우리일까보냐그러나`로 단어가 붙어버린다
    expect(toSubtitles(runs).subtitles).toEqual([
      "“다른 이들도 너희에게 이런 권리를 가졌거든 하물며 우리일까보냐 그러나 우리가 이 권리를 쓰지 아니하고 범사에 참는 것은 그리스도의 복음에 아무 장애가 없게 하려 함이로다” (고린도전서 9:12)",
    ]);
  });

  it("[3] 2조각도 마찬가지로 이어붙인다", () => {
    const runs: StyledRun[] = [
      { text: "둘째, ", color: R, paragraph: 51 },
      { text: "복음을 위하여 기꺼이 종이 되어야 합니다.\n", color: R, paragraph: 51 },
    ];

    expect(toSubtitles(runs).subtitles).toEqual(["둘째, 복음을 위하여 기꺼이 종이 되어야 합니다."]);
  });

  it("[6] 중복 자막을 둘 다 유지하고, 순서는 문단 오름차순이다", () => {
    const runs: StyledRun[] = [
      { text: "“십자가의 도가 … 하나님의 능력이라” (고린도전서 1:18)\n", color: R, paragraph: 12 },
      { text: "“너는 무엇을 능력이라고 생각하느냐?”\n", color: R, paragraph: 40 },
      { text: "“십자가의 도가 … 하나님의 능력이라” (고린도전서 1:18)\n", color: R, paragraph: 34 },
    ];

    // 글자 그대로 같은 두 장이 둘 다 나가고(dedupe 금지), 배열에 담긴 순서가 아니라
    // 문단 번호 순으로 줄을 선다
    expect(toSubtitles(runs).subtitles).toEqual([
      "“십자가의 도가 … 하나님의 능력이라” (고린도전서 1:18)",
      "“십자가의 도가 … 하나님의 능력이라” (고린도전서 1:18)",
      "“너는 무엇을 능력이라고 생각하느냐?”",
    ]);
  });

  it("[7] 긴 자막을 쪼개지 않는다 — 절 번호가 있어도", () => {
    const runs: StyledRun[] = [
      {
        text: "“6 지혜를 버리지 말라 … 그가 너를 영화롭게 하리라” (잠언 4:6~8)\n",
        color: R,
        paragraph: 53,
      },
    ];

    expect(toSubtitles(runs).subtitles).toEqual([
      "“6 지혜를 버리지 말라 … 그가 너를 영화롭게 하리라” (잠언 4:6~8)",
    ]);
  });

  it("[8] 안쪽의 연속 공백을 그대로 내보낸다", () => {
    const runs: StyledRun[] = [
      {
        text: "“나는 최고의 선수를 찾는 것이 아니라, …” /  허브 브룩스(Herb Brooks)\n",
        color: R,
        paragraph: 71,
      },
    ];

    // "/" 뒤 공백 두 칸이 살아 있다 (원고 자체의 오타이지만 정리하지 않는다)
    expect(toSubtitles(runs).subtitles).toEqual([
      "“나는 최고의 선수를 찾는 것이 아니라, …” /  허브 브룩스(Herb Brooks)",
    ]);
  });
});

describe("걸러낸 것", () => {
  it("[4] 검은 글 속의 빨간 지시문은 문단째 탈락하고, 문단을 맥락으로 달고 나온다", () => {
    const runs: StyledRun[] = [
      { text: "사도 바울은 2차 전도여행 중 고린도를 방문하여 복음을 전했고, …", color: K, paragraph: 5 },
      { text: "<사진을 띄운다.>", color: R, paragraph: 5 },
      { text: " 고린도는 그리스 남쪽의 항구도시로, …\n", color: K, paragraph: 5 },
    ];

    expect(toSubtitles(runs)).toEqual({
      subtitles: [],
      dropped: [
        {
          fragment: "<사진을 띄운다.>",
          paragraph: 5,
          context:
            "사도 바울은 2차 전도여행 중 고린도를 방문하여 복음을 전했고, …<사진을 띄운다.> 고린도는 그리스 남쪽의 항구도시로, …",
        },
      ],
      unknownColors: [],
    });
  });

  it("[5] 문단 맨 앞의 지시문도 마찬가지로 탈락한다", () => {
    const runs: StyledRun[] = [
      { text: "<사진과 함께 글을 띄운다.>", color: R, paragraph: 70 },
      { text: " 그때 허브 브룩스(Herb Brooks) 감독은 이런 말을 했습니다. \n", color: K, paragraph: 70 },
    ];

    expect(toSubtitles(runs)).toEqual({
      subtitles: [],
      dropped: [
        {
          fragment: "<사진과 함께 글을 띄운다.>",
          paragraph: 70,
          context: "<사진과 함께 글을 띄운다.> 그때 허브 브룩스(Herb Brooks) 감독은 이런 말을 했습니다.",
        },
      ],
      unknownColors: [],
    });
  });
});

describe("[9] 미발동 방어 조항 — 실물에 사례가 없다. 규칙의 의도를 고정한다", () => {
  it("문단 끝의 검은 공백 하나가 자막을 통째로 삼키지 않는다", () => {
    const runs: StyledRun[] = [
      { text: "“자막 본문입니다”", color: R, paragraph: 3 },
      { text: "  ", color: K, paragraph: 3 },
    ];

    // 공백만인 조각은 색을 따지지 않는다 — 이 예외가 없으면 이 자막이 소리 없이 사라진다
    expect(toSubtitles(runs)).toEqual({
      subtitles: ["“자막 본문입니다”"],
      dropped: [],
      unknownColors: [],
    });
  });

  it("문단을 통째로 차지한 꺾쇠 지시문은 꺾쇠 규칙이 잡는다", () => {
    const runs: StyledRun[] = [{ text: "<사진을 띄운다.>\n", color: R, paragraph: 7 }];

    // 실전에서 자막이 사라졌을 때 가장 먼저 의심할 자리 — 그래서 동작이 코드에 박혀 있어야 한다
    expect(toSubtitles(runs)).toEqual({
      subtitles: [],
      dropped: [{ fragment: "<사진을 띄운다.>", paragraph: 7, context: "<사진을 띄운다.>" }],
      unknownColors: [],
    });
  });
});

describe("모르는 색", () => {
  it("검정도 빨강도 아닌 색을 조각 · 색값 · 문단과 함께 알린다", () => {
    const runs: StyledRun[] = [
      { text: "파란 글씨로 강조한 문장\n", color: "#0000FF", paragraph: 2 },
    ];

    // 자막으로는 쓰지 않는다. 다만 침묵하지도 않는다
    expect(toSubtitles(runs)).toEqual({
      subtitles: [],
      dropped: [],
      unknownColors: [{ text: "파란 글씨로 강조한 문장", color: "#0000FF", paragraph: 2 }],
    });
  });

  it("모르는 색이 낀 문단은 자막이 되지 못하고, 그 빨간 조각도 함께 노출된다", () => {
    const runs: StyledRun[] = [
      { text: "빨간 앞부분 ", color: R, paragraph: 9 },
      { text: "파란 뒷부분\n", color: "#0000FF", paragraph: 9 },
    ];

    expect(toSubtitles(runs)).toEqual({
      subtitles: [],
      dropped: [
        { fragment: "빨간 앞부분", paragraph: 9, context: "빨간 앞부분 파란 뒷부분" },
      ],
      unknownColors: [{ text: "파란 뒷부분", color: "#0000FF", paragraph: 9 }],
    });
  });
});
