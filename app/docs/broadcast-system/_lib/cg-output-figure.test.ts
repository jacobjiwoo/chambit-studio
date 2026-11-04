import { describe, expect, it } from "vitest";

import * as A from "./anatomy/audit.mjs";
import { CG_FIGURE } from "./cg-output-figure";
import { CAMERAS } from "./cg-output-model";

describe("CG 출력 원리 그림", () => {
  it("anatomy audit을 통과한다: 케이블이 아무것도 뚫지 않고, 끝이 단자에 닿고, 겹친 곳의 앞뒤가 맞다", () => {
    const result = A.auditOrExit(CG_FIGURE.recorder, CG_FIGURE.P, { argv: ["--audit"] });
    const failed = result ? A.failures(result as never) : 1;
    expect(failed).toBe(0);
  });

  it("카메라 버튼마다 화면 장면이 하나씩 있다", () => {
    for (let camera = 0; camera < CAMERAS; camera++) {
      expect(CG_FIGURE.svg).toContain(`data-part="cam-${camera}"`);
      expect(CG_FIGURE.svg).toContain(`data-scene="${camera}"`);
    }
  });

  it("FILL과 KEY가 문자발생기 보드에서 영상 스위처로, PGM이 영상 스위처에서 모니터로 간다", () => {
    const routes = CG_FIGURE.recorder.routes.map((route: { name: string }) => route.name);
    expect(routes).toEqual(expect.arrayContaining(["cable.fill", "cable.key", "cable.pgm"]));
  });
});
