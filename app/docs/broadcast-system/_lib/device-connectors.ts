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

/** XLR 패널 단자. 수(male)는 둥근 껍데기 안에 핀 셋, 암(female)은 구멍 셋과 위쪽 걸쇠다. 고정 나사는 장비마다 자리가 달라 따로 그린다 */
export function xlr(sc: Scene, on: Plane, [X, s]: number[], base: number, spot: string, female = false, name = "xlr") {
  const pins = [[X - 4, s + 0.9], [X + 4, s + 0.9], [X, s - 3.4]];
  sc.round(`${name}.flange`, on, [X, s], 11.1, [base, base + 1], { tone: "mid" }, { spot });
  if (female) {
    sc.round(`${name}.insert`, on, [X, s], 8.6, [base + 1, base + 2.4], { tone: "mid" }, {
      spot,
      extra: sc.line(pins.map((pin) => sc.ringOn(on, pin, 1.1, base + 2.4)).join(""), { tone: "lo" }) + sc.dots(on, pins, base + 2.4, { size: 0.45 }),
    });
    sc.box(`${name}.latch`, on, [X - 2.2, X + 2.2], [s + 8.9, s + 10.5], [base + 1, base + 2], { tone: "hi" }, { r: 0.5, spot });
    return;
  }
  sc.round(`${name}.shell`, on, [X, s], 9.4, [base + 1, base + 3.2], { tone: "mid" }, {
    spot,
    extra: sc.line(sc.ringOn(on, [X, s], 8.2, base + 3.2) + pins.map((pin) => sc.ringOn(on, pin, 0.8, base + 3.2)).join(""), { tone: "lo" }) + sc.dots(on, pins, base + 3.2, { size: 0.4 }),
  });
}

/** 6.35mm(1/4") 잭. `hex`면 육각 너트, 아니면 둥근 너트 위에 몸통이 선다 */
export function quarterJack(sc: Scene, on: Plane, [X, s]: number[], base: number, spot: string, hex = false, name = "jack") {
  const nut = hex ? 7.4 : 5.3;
  if (hex) {
    const corners = Array.from({ length: 6 }, (_, index) => {
      const angle = (index * Math.PI) / 3;
      return [X + nut * Math.cos(angle), s + nut * Math.sin(angle)];
    });
    sc.post(`${name}.nut`, on, corners, [base, base + 1.6], { tone: "mid" }, { spot });
  } else {
    sc.round(`${name}.nut`, on, [X, s], nut, [base, base + 1.2], { tone: "mid" }, { spot });
  }
  const top = base + (hex ? 1.6 : 1.2) + 2.2;
  sc.round(`${name}.barrel`, on, [X, s], 4.6, [top - 2.2, top], { tone: "mid" }, {
    spot,
    extra: sc.line(sc.ringOn(on, [X, s], 3.2, top) + sc.ringOn(on, [X, s], 2.2, top), { tone: "lo" }),
  });
}

/**
 * IEC 전원 단자(C14)와 그 아래 퓨즈 서랍. `[X, s]`는 받침판의 가운데다. 받침판은 폭 27.4, 높이 31이다.
 */
export function iecInlet(sc: Scene, on: Plane, [X, s]: number[], base: number, spot: string, fuseSpot: string) {
  const top = base + 1.2;
  const [z0, z1] = [s + 0.6, s + 14.6];
  const socket = [[X - 12, z0], [X + 12, z0], [X + 12, z1 - 3.6], [X + 8.4, z1], [X - 8.4, z1], [X - 12, z1 - 3.6]];
  const blade = (bx: number, bz: number) => sc.rectOn(on, [bx - 1, bx + 1], [bz - 2.4, bz + 2.4], top);
  sc.box("iec.flange", on, [X - 13.7, X + 13.7], [s - 15.5, s + 15.5], [base, top], { tone: "mid" }, {
    r: 1.6,
    spot,
    extra: sc.line(sc.lineOn(on, socket, top, true) + blade(X - 7, z0 + 6.2) + blade(X, z0 + 9.4) + blade(X + 7, z0 + 6.2), { tone: "lo" }),
  });
  const fuse = sc.rectOn(on, [X - 6, X + 6], [s - 11.2, s - 8.8], top + 1) + sc.lineOn(on, [[X - 11, s - 10], [X - 6, s - 10]], top + 1) + sc.lineOn(on, [[X + 6, s - 10], [X + 11, s - 10]], top + 1);
  sc.box("iec.fuse", on, [X - 11, X + 11], [s - 14.2, s - 5.8], [top, top + 1], { tone: "mid" }, { r: 0.8, spot: fuseSpot, extra: sc.line(fuse, { tone: "lo" }) });
}
/** 보는 사람의 오른쪽이 장비 X의 어느 쪽인지. 뒷면(법선이 뒤)에서는 -X가 오른쪽이다 */
const rightOf = (on: Plane) => (on.normal[1] > 0.5 ? -1 : 1);
/** XLR 3핀 암 단자(패널용): 둥근 몸통, 핀 구멍 셋, 위쪽 PUSH 걸쇠, 대각선의 나사 둘 */
export function xlrFemale(sc: Scene, on: Plane, [X, s]: number[], base: number, spot: string) {
  const right = rightOf(on);
  // 핀 자리는 앞에서 본 모양 그대로다. 1번이 오른쪽 위, 2번이 왼쪽 위, 3번이 아래
  const pins = [[3.4, 3.2], [-3.4, 3.2], [0, -2.6]].map(([dx, ds]) => [X + right * dx, s + ds]);
  sc.round("xlr.body", on, [X, s], 11, [base, base + 2.4], { tone: "mid" }, {
    extra:
      sc.line(sc.ringOn(on, [X, s], 8.6, base + 2.4), { tone: "lo" }) +
      sc.line(pins.map((pin) => sc.ringOn(on, pin, 1.1, base + 2.4)).join(""), { tone: "lo" }) +
      sc.textOn(on, [X + right * 3.4, s + 5.2], "1", { size: 1.6, h: base + 2.45 }) +
      sc.textOn(on, [X - right * 3.4, s + 5.2], "2", { size: 1.6, h: base + 2.45 }),
  sc.box("xlr.latch", on, [X - 3.6, X + 3.6], [s + 11.6, s + 15], [base, base + 1.2], { tone: "mid" }, {
    r: 1.2,
    extra: sc.textOn(on, [X, s + 12.7], "PUSH", { size: 1.6, h: base + 1.25 }),
  return screw(sc, on, [X - right * 8.5, s + 12.3], base) + screw(sc, on, [X + right * 8.9, s - 7.6], base);
/** DIN 5핀 단자(MIDI 등): 둥근 테, 위쪽 홈, 반원으로 늘어선 핀 다섯 */
export function din5(sc: Scene, on: Plane, [X, s]: number[], base: number, spot: string, name = "din") {
  const pins = [180, 225, 270, 315, 0].map((degrees) => [X + 3.6 * Math.cos((degrees * Math.PI) / 180), s + 3.6 * Math.sin((degrees * Math.PI) / 180)]);
  sc.round(`${name}.rim`, on, [X, s], 8.4, [base, base + 1.8], { tone: "mid" }, {
    extra:
      sc.line(sc.ringOn(on, [X, s], 6.6, base + 1.8), { tone: "lo" }) +
      sc.line(sc.rectOn(on, [X - 1, X + 1], [s + 4.4, s + 6], base + 1.8), { tone: "lo" }) +
      sc.dots(on, pins, base + 1.8, { size: 0.55 }),
/** XLR 단자(패널용): 둥근 받침과 낮은 몸통, 안쪽 테와 핀 셋 */
export function xlr(sc: Scene, on: Plane, [X, s]: number[], base: number, spot: string, r = 11) {
  const pins = [[-3, 1.6], [3, 1.6], [0, -3]].map(([dx, ds]) => [X + dx, s + ds]);
  sc.round("xlr.flange", on, [X, s], r, [base, base + 1.4], { tone: "mid" }, { spot });
  sc.round("xlr.shell", on, [X, s], r * 0.76, [base + 1.4, base + 4], { tone: "mid" }, {
    extra: sc.line(sc.ringOn(on, [X, s], r * 0.6, base + 4), { tone: "lo" }) + sc.dots(on, pins, base + 4, { size: 0.55 }),
/** RCA 단자: 받침 테와 몸통, 가운데 핀 구멍 */
export function rca(sc: Scene, on: Plane, at: number[], base: number, spot: string) {
  sc.round("rca.flange", on, at, 5.4, [base, base + 1], { tone: "mid" }, { spot });
  sc.round("rca.barrel", on, at, 4, [base + 1, base + 8], { tone: "mid" }, {
    extra: sc.line(sc.ringOn(on, at, 1.6, base + 8), { tone: "lo" }) + sc.dots(on, [at], base + 8, { size: 0.5 }),
