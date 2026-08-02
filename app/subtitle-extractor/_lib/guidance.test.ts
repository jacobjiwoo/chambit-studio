/**
 * 잘 안 되는 날의 안내 — **사유별로 다른 말이 나오는지**를 본다.
 *
 * 여기가 조용히 틀리는 방식은 화면이 깨지는 것이 아니라 **다섯 사유가 같은 말을 하는
 * 것**이다. 담당자는 안내를 읽고 무엇을 고칠지 정하는데, 암호 문서에 "한글 원고가 맞는지
 * 확인하세요"라고 답하면 고칠 수 없는 것을 붙잡고 있게 된다. 화면을 눈으로 봐서는
 * 그럴듯해 보이므로(문장이 있긴 하다) 테스트가 유일한 통로다.
 */
import { describe, expect, it } from "vitest";

import { emptyGuidance, rejectGuidance } from "./guidance";
import type { RejectReason } from "./hwp";
import type { UnknownColor } from "./rules";

/**
 * 파서가 내놓는 사유 전부. `rejectGuidance`가 `Record<RejectReason, …>` 위에 서 있으므로
 * 사유가 하나 늘면 타입이 먼저 깨지고, 이 목록이 그 사유의 안내를 실제로 검사한다.
 */
const REASONS: RejectReason[] = ["not-hwp", "encrypted", "distribution", "drm", "broken"];

describe("거부 안내", () => {
  it("다섯 사유가 서로 다른 문구를 낸다", () => {
    const said = REASONS.map((reason) => {
      const { title, body, next } = rejectGuidance(reason);
      return `${title}\n${body}\n${next}`;
    });

    expect(new Set(said).size).toBe(REASONS.length);
  });

  it("어느 사유든 다음 행동을 준다 — 막힌 채로 끝나지 않는다", () => {
    for (const reason of REASONS) {
      const { title, body, next } = rejectGuidance(reason);
      expect(title.length, reason).toBeGreaterThan(0);
      expect(body.length, reason).toBeGreaterThan(0);
      expect(next.length, reason).toBeGreaterThan(0);
    }
  });

  it("거부는 전부 빨강이다 — 빈 결과와 톤으로 갈린다", () => {
    for (const reason of REASONS) {
      expect(rejectGuidance(reason).tone, reason).toBe("red");
    }
  });

  it("hwp가 아니면 목사님께 받은 원고를 그대로 올리라고 한다", () => {
    const { next } = rejectGuidance("not-hwp");

    expect(next).toContain("목사님");
    expect(next).toContain(".hwp");
  });

  it("암호 문서는 한글에서 암호를 풀고 다시 저장하라고 한다", () => {
    const { body, next } = rejectGuidance("encrypted");

    expect(body).toContain("암호");
    expect(next).toContain("암호");
    expect(next).toContain("저장");
  });

  it("배포용과 DRM은 각자 무엇을 고쳐야 하는지 말한다", () => {
    const distribution = rejectGuidance("distribution");
    const drm = rejectGuidance("drm");

    expect(distribution.body).toContain("배포용");
    expect(distribution.next).toContain("저장");
    expect(drm.body).toContain("DRM");
    // 배포용은 담당자가 한글에서 풀 수 있지만 DRM은 문서를 내준 쪽에서만 풀 수 있다.
    // 같은 "다시 저장하세요"로 뭉뚱그리면 담당자가 할 수 없는 일을 붙잡고 시간을 쓴다
    expect(drm.next).not.toEqual(distribution.next);
  });

  it("파싱이 깨진 날은 손으로 한다는 선택지를 알려 준다", () => {
    // 다른 넷과 달리 담당자가 파일을 고쳐 해결할 길이 없다. 예배는 오고 있으므로 여기서
    // 줄 수 있는 다음 행동은 "이 파일은 포기하고 손으로 한다"뿐이다
    const { next } = rejectGuidance("broken");

    expect(next).toContain("손으로");
  });
});

describe("빈 결과 안내", () => {
  it("실패가 아니라 노랑이다 — 셋이 톤으로 갈린다", () => {
    expect(emptyGuidance([]).tone).toBe("amber");
  });

  it("「원고는 정상적으로 열렸습니다」를 먼저 말한다", () => {
    // 이 순서가 뒤집히면 담당자는 앱이 고장난 줄 알고 손으로 돌아간다. 문제는 파일이
    // 아니라 원고의 색 표시에 있다
    expect(emptyGuidance([]).title).toMatch(/^원고는 정상적으로 열렸습니다/);
  });

  it("다음 행동이 원고의 빨간색 표시를 가리킨다", () => {
    const { body, next } = emptyGuidance([]);

    expect(body).toContain("자막");
    expect(next).toContain("빨간색");
  });

  it("빨강이 아닌 색이 있으면 그 수와 색값을 알려 준다", () => {
    // 자막이 0장인 원고에서 가장 흔한 원인이다 — 빨갛게 칠했다고 믿는 색이 #FF0000에서
    // 살짝 어긋나 있다. 그 색값을 보여 주지 않으면 담당자는 원고를 눈으로 훑으며
    // "분명히 빨간데"를 반복한다
    const unknownColors: UnknownColor[] = [
      { text: "첫 줄", color: "#FF0100", paragraph: 3 },
      { text: "둘째 줄", color: "#FF0100", paragraph: 7 },
      { text: "셋째 줄", color: "#C00000", paragraph: 9 },
    ];

    const { title, body, next } = emptyGuidance(unknownColors);

    // 열린 것은 열린 것이다 — 원인을 짚어도 첫마디는 바뀌지 않는다
    expect(title).toMatch(/^원고는 정상적으로 열렸습니다/);
    expect(body).toContain("3");
    // 같은 색이 여러 곳이어도 색값은 한 번씩만. 목록이 길어지면 읽히지 않는다
    expect(next).toContain("#FF0100");
    expect(next).toContain("#C00000");
    expect(next.match(/#FF0100/g)).toHaveLength(1);
  });

  it("빨강이 아닌 색이 없으면 색값 이야기를 꺼내지 않는다", () => {
    const { body, next } = emptyGuidance([]);

    expect(`${body}${next}`).not.toContain("#");
  });
});
