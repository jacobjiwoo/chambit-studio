/**
 * 여러 장비 그림이 같이 쓰는 단자 부품. 모두 면(`Plane`) 위의 자리 `[X, s]`와 그 면에서 뜬 높이
 * `base`를 받아 그린다. 치수는 규격 단자의 실제 크기(mm)다.
 */
import type { Plane, Scene } from "./device-figure";

/** 나사 머리. 면에 붙은 고리와 점이라 따로 솟지 않는다 */
export function screw(sc: Scene, on: Plane, at: number[], h = 0) {
  return sc.line(sc.ringOn(on, at, 1.7, h), { tone: "lo" }) + sc.dots(on, [at], h);
}

/** BNC 단자: 육각 너트와 몸통 */
export function bnc(sc: Scene, on: Plane, at: number[], base: number, spot: string) {
  sc.round("bnc.nut", on, at, 6.1, [base, base + 2], { tone: "mid" }, { spot });
  sc.round("bnc.barrel", on, at, 4.6, [base + 2, base + 11], { tone: "mid" }, {
    spot,
    extra: sc.line(sc.ringOn(on, at, 3, base + 11), { tone: "lo" }) + sc.dots(on, [at], base + 11, { size: 0.6 }),
  });
}

/** D-sub 단자(9핀·15핀): 받침판, 사다리꼴 껍데기, 양옆 고정 기둥 */
export function dsub(sc: Scene, on: Plane, [X, s]: number[], base: number, pins: 9 | 15, spot: string) {
  const wide = pins === 9 ? 31 : 39.5;
  const top = pins === 9 ? 17 : 25.4;
  const columns = pins === 9 ? 5 : 8;
  const dotsAt = [
    ...Array.from({ length: columns }, (_, index) => [X + (index - (columns - 1) / 2) * 2.75, s + 1.4]),
    ...Array.from({ length: columns - 1 }, (_, index) => [X + (index - (columns - 2) / 2) * 2.75, s - 1.4]),
  ];
  sc.box("dsub.flange", on, [X - wide / 2, X + wide / 2], [s - 6.2, s + 6.2], [base, base + 1], { tone: "mid" }, { r: 1.2, spot });
  sc.post(
    "dsub.shell",
    on,
    [[X - top / 2, s + 4], [X + top / 2, s + 4], [X + top / 2 - 1.5, s - 4], [X - top / 2 + 1.5, s - 4]],
    [base + 1, base + 6.6],
    { tone: "mid" },
    { spot, extra: sc.dots(on, dotsAt, base + 6.6, { size: 0.4, tone: "lo" }) },
  );
  for (const side of [-1, 1]) sc.round("dsub.post", on, [X + side * (wide / 2 - 3.6), s], 2.3, [base + 1, base + 5], { tone: "mid" }, { spot });
}

/** RJ-45 단자: 받침판에 걸쇠 홈이 있는 구멍 테두리와 표시등 둘 */
export function rj45(sc: Scene, on: Plane, [X, s]: number[], base: number, spot: string) {
  const jack = [[X - 5.6, s - 4.6], [X + 5.6, s - 4.6], [X + 5.6, s + 2.2], [X + 2, s + 2.2], [X + 2, s + 4.4], [X - 2, s + 4.4], [X - 2, s + 2.2], [X - 5.6, s + 2.2]];
  sc.box("rj45", on, [X - 8, X + 8], [s - 6.4, s + 6.4], [base, base + 1.4], { tone: "mid" }, {
    r: 1,
    spot,
    extra: sc.line(sc.lineOn(on, jack, base + 1.4, true), { tone: "lo" }) + sc.dots(on, [[X - 5.4, s + 4.6], [X + 5.4, s + 4.6]], base + 1.4, { size: 0.5 }),
  });
}

/** 납작한 구멍 단자(HDMI, USB 등): 받침판과 안쪽 구멍 테두리. 구멍 모양은 꼭짓점으로 준다 */
export function slotJack(sc: Scene, on: Plane, [X, s]: number[], base: number, [w, d]: number[], hole: number[][], spot: string, name = "jack") {
  sc.box(name, on, [X - w / 2, X + w / 2], [s - d / 2, s + d / 2], [base, base + 1], { tone: "mid" }, {
    r: 1,
    spot,
    extra: sc.line(sc.lineOn(on, hole.map(([dx, ds]) => [X + dx, s + ds]), base + 1, true), { tone: "lo" }),
  });
}

/** 둥근 구멍 단자(전원 잭, 3.5mm 등): 낮은 테와 구멍 */
export function roundJack(sc: Scene, on: Plane, at: number[], base: number, r: number, spot: string, name = "jack") {
  sc.round(name, on, at, r, [base, base + 1.6], { tone: "mid" }, {
    spot,
    extra: sc.line(sc.ringOn(on, at, r * 0.5, base + 1.6), { tone: "lo" }) + sc.dots(on, [at], base + 1.6, { size: 0.5 }),
  });
}
