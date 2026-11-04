import { describe, expect, it } from "vitest";

import { TOUR_LENGTH, layersOf, readoutOf, tourAt } from "./cg-output-model";

describe("readoutOf", () => {
  it("DSK 상태와 PGM 카메라를 적는다", () => {
    expect(readoutOf({ camera: 0, dsk: false })).toBe("DSK OFF · PGM CAM1");
    expect(readoutOf({ camera: 2, dsk: true })).toBe("DSK ON · PGM CAM3 + CG");
  });
});

describe("tourAt", () => {
  it("DSK OFF·CAM1에서 시작한다", () => {
    expect(tourAt(0)).toEqual({ camera: 0, dsk: false });
  });

  it("DSK가 켜진 동안 카메라가 바뀌어도 DSK는 켜진 채로 남는다", () => {
    const seen = new Set<number>();
    let wasOn = false;
    let turnedOff = 0;
    for (let t = 0; t < TOUR_LENGTH; t += 0.05) {
      const state = tourAt(t);
      if (state.dsk) seen.add(state.camera);
      if (wasOn && !state.dsk) turnedOff += 1;
      wasOn = state.dsk;
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
    expect(turnedOff).toBe(1);
  });

  it("한 바퀴를 돌면 처음으로 돌아온다", () => {
    expect(tourAt(TOUR_LENGTH + 0.1)).toEqual(tourAt(0.1));
  });
});

describe("layersOf", () => {
  it("DSK OFF면 구멍도 FILL도 없다", () => {
    expect(layersOf(0)).toEqual({ hole: 0, fill: 0 });
  });

  it("DSK ON이면 KEY 모양 구멍이 FILL로 꽉 찬다", () => {
    expect(layersOf(1)).toEqual({ hole: 1, fill: 1 });
  });

  it("켜지는 중에는 먼저 KEY 모양대로 오리고, 그다음 FILL을 채운다", () => {
    const early = layersOf(0.3);
    expect(early.hole).toBeGreaterThan(0.5);
    expect(early.fill).toBe(0);
    const late = layersOf(0.8);
    expect(late.hole).toBe(1);
    expect(late.fill).toBeGreaterThan(0.5);
  });
});
