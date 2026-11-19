/**
 * 오디오 분배기(Drawmer DA6)의 생김새 그림. 앞 시점은 조작부, 뒤 시점은 단자다.
 *
 * 근거는 Drawmer "DA6 Operators' Manual"의 조작부 그림(PDF 8·9쪽, 인쇄된 쪽 번호 6·7)과 케이스 치수(PDF 11쪽, 482 × 44 × 200mm),
 * 그리고 Drawmer 제품 페이지의 앞·뒷면 선 그림(da6_line.png)과 뒷면 사진이다. 매뉴얼에는 뒷면
 * 그림이 없어 뒷면은 제품 페이지의 선 그림을 따랐다. 부품의 자리는 선 그림에서 재서 mm로 옮겼다.
 *
 * 좌표는 장비 좌표다. X: 앞에서 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, roundRect, scene, type DeviceFigure, type DeviceView, type Plane, type Scene, type ViewKey } from "./device-figure";

const WIDTH = 482;
const DEPTH = 200;
const TALL = 44;
/** 앞판 두께. 앞판은 랙 귀까지 482mm이고, 그 뒤의 몸통은 선 그림에서 잰 434.6mm다 */
const PANEL_T = 3;
const BODY = [(WIDTH - 434.6) / 2, (WIDTH + 434.6) / 2];

const FLOOR = plane(0, 0, 0);
const FRONT = plane(PANEL_T, 0, 90);
const REAR = plane(DEPTH, 0, 90, true);
/** 앞판 인쇄면의 높이. 손잡이와 표시등은 여기서 솟는다 */
const FACE = PANEL_T + 0.3;
/** 뒷면 인쇄면의 높이 */
const BACK = 0.4;

const AREA = {
  inputs: "Input L&R",
  inputMeter: "Input Display",
  outputs: "Output L&R",
  mono: "Mono/Stereo",
  select: "Chan Select",
  phones: "H/Phone",
  jack: "Headphone jack",
  outputMeter: "Output Display",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  inputs: "입력 음량(±15dB). 뒷면 AUX. OUTPUT의 음량도 같이 바뀐다",
  inputMeter: "입력 음량 표시. +15 LED는 잠깐씩만 켜져야 한다",
  outputs: "OUTPUT 1–6마다 L·R 출력 음량",
  mono: "출력마다 스테레오와 모노(L·R 합침)를 고른다. 위의 LED가 상태를 보인다",
  select: "헤드폰과 Output Display로 볼 출력(1–6)을 고른다",
  phones: "헤드폰 음량",
  jack: "6.35mm 스테레오(TRS) 헤드폰 단자",
  outputMeter: "Chan Select로 고른 출력의 L·R 음량 표시",
};

/** 뒷면에 인쇄된 단자 이름(제품 페이지 선 그림). 출력은 OUTPUTS 아래 CHANNEL 1–6이다 */
export const DA_6_PORTS: string[] = ["INPUT", "CHANNEL 1", "CHANNEL 2", "CHANNEL 3", "CHANNEL 4", "CHANNEL 5", "CHANNEL 6", "AUX. OUTPUT", "Power supply socket"];
const PORT_NOTES: Record<string, string> = {
  INPUT: "XLR 암 2개(RIGHT·LEFT). 밸런스 +4dBu",
  ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`CHANNEL ${n}`, `OUTPUTS. XLR 수 2개(RIGHT·LEFT). 앞면 OUTPUT ${n}의 손잡이가 음량을 정한다`])),
  "AUX. OUTPUT": "6.35mm TRS 2개(L·R). 다른 DA6를 이어 출력을 늘릴 때 쓴다",
  "Power supply socket": "IEC 전원 단자",
};
const FUSE = "Fuse drawer";

/** 출력 칸 하나의 폭과 간격 */
const MODULE_W = 49;
const PITCH = 50.95;
const moduleX = (n: number) => 77 + (n - 1) * PITCH;
/** 손잡이 가운데 높이 */
const KNOB_Z = 19.4;
/** 표시등 두 줄 높이(L, R) */
const ROWS = [37.5, 31.9];

/** 위에서 시계 방향으로 잰 각도(도) → 면 위의 점 */
const polar = ([X, s]: number[], r: number, degrees: number) => [X + r * Math.sin((degrees * Math.PI) / 180), s + r * Math.cos((degrees * Math.PI) / 180)];

/**
 * 손잡이 둘레에 인쇄된 눈금. 손잡이를 감싼 원에서 눈금이 바깥으로 나가고, 그 끝에 숫자가 붙는다.
 * 맨 위에는 기준 삼각형이 있다.
 */
function dial(sc: Scene, centre: number[], ring: number, marks: Array<[number, string]>) {
  const lines = [sc.ringOn(FRONT, centre, ring, FACE)];
  const texts: string[] = [];
  for (const [angle, label] of marks) {
    lines.push(sc.lineOn(FRONT, [polar(centre, ring, angle), polar(centre, ring + 1.1, angle)], FACE));
    // 옆쪽 숫자는 눈금 끝에서 바깥으로 붙여, 이웃 손잡이의 숫자와 겹치지 않게 한다
    const side = Math.abs(angle) < 25 || Math.abs(angle) > 155 ? 0 : Math.sign(angle);
    const [X, s] = polar(centre, side ? ring + 1.6 : ring + 2.7, angle);
    texts.push(sc.textOn(FRONT, [X, s - 0.5], label, { size: 1.3, anchor: side > 0 ? "start" : side < 0 ? "end" : "middle" }));
  }
  const tip = polar(centre, ring + 0.2, 0);
  lines.push(sc.lineOn(FRONT, [tip, [tip[0] - 0.9, tip[1] + 1.4], [tip[0] + 0.9, tip[1] + 1.4]], FACE, true));
  return sc.line(lines.join(""), { tone: "lo" }) + texts.join("");
}

/** 손잡이: 낮은 치마 위에 홈이 난 몸통, 윗면에 가리킴 선 */
function knob(sc: Scene, [X, s]: number[], skirt: number, spot: string) {
  const bodyR = skirt - 0.9;
  const top = FACE + 12;
  sc.turned("knob", FRONT, [X, s], [[FACE, skirt], [FACE + 1.4, skirt], [FACE + 1.4, bodyR], [top, bodyR - 0.5]], { tone: "mid" }, {
    spot,
    ribs: [FACE + 1.4, top, bodyR, 24, bodyR - 0.5],
    extra: sc.line(sc.lineOn(FRONT, [[X, s + 0.6], [X, s + bodyR - 0.5]], top), { tone: "hi" }) + sc.dots(FRONT, [[X, s]], top, { size: 0.5 }),
  });
}

function led(sc: Scene, at: number[], spot: string) {
  sc.round("led", FRONT, at, 1.25, [FACE, FACE + 0.8], { tone: "mid" }, { spot });
}

/** 면 위에 둥근 모서리 사각형 선 */
function outline(sc: Scene, on: Plane, [X0, X1]: number[], [s0, s1]: number[], r: number, h: number) {
  const points = roundRect(X1 - X0, s1 - s0, r, 3).map(([dx, ds]) => [(X0 + X1) / 2 + dx, (s0 + s1) / 2 + ds]);
  return sc.lineOn(on, points, h, true);
}

function body(sc: Scene) {
  sc.halo(0);
  // 랙에 얹혀 있어 몸통이 바닥이다
  sc.box("stand.chassis", FLOOR, BODY, [PANEL_T, DEPTH], [0, TALL], { tone: "mid" }, {});
}

const INPUT_MARKS: Array<[number, string]> = [[-135, "-15"], [-90, "-10"], [-45, "-5"], [0, "0"], [45, "+5"], [90, "+10"], [135, "+15"]];
const OUTPUT_MARKS: Array<[number, string]> = [[-150, "OFF"], [-123, "-30"], [-95, "-20"], [-60, "-10"], [-22, "-5"], [20, "0"], [58, "+5"], [100, "10"], [130, "+15"]];
const SELECT_MARKS: Array<[number, string]> = [1, 2, 3, 4, 5, 6].map((n) => [-150 + (n - 1) * 30, `${n}`]);
const PHONES_MARKS: Array<[number, string]> = Array.from({ length: 11 }, (_, n) => [-150 + n * 30, `${n}`]);

function frontPanel(sc: Scene) {
  const text = (X: number, z: number, value: string, size = 1.6, anchor = "middle", tone = "lo") => sc.textOn(FRONT, [X, z], value, { size, anchor, tone, h: FACE - PANEL_T + 0.05 });
  const lines: string[] = [];
  const printed: string[] = [];

  // 랙 귀의 긴 구멍과 나사
  for (const X of [9.3, WIDTH - 9.3]) for (const z of [6, 38]) lines.push(outline(sc, FRONT, [X - 5, X + 5], [z - 3.15, z + 3.15], 3.1, FACE));
  const screws = [[30, 6.3], [30, 38], [452.2, 6.3], [452.2, 38], [moduleX(4) + 11, 6.3]].map((at) => C.screw(sc, FRONT, at, FACE)).join("");

  // INPUT 칸
  lines.push(outline(sc, FRONT, [35, 75.4], [3.3, 41.3], 2, FACE));
  printed.push(text(55.2, 4.8, "INPUT", 2.4, "middle", "mid"), text(44.5, 9.4, "L", 1.8, "middle", "mid"), text(64.5, 9.4, "R", 1.8, "middle", "mid"));
  const inputCols = [42.3, 47.2, 52.1, 57, 61.9, 66.8];
  ["-10", "-5", "0", "+5", "+10", "+15"].forEach((label, index) => printed.push(text(inputCols[index], 34.2, label, 1.2)));
  printed.push(text(39.2, 37, "L", 1.6, "middle", "mid"), text(39.2, 31.4, "R", 1.6, "middle", "mid"), text(69.9, 37, "L", 1.6, "middle", "mid"), text(69.9, 31.4, "R", 1.6, "middle", "mid"));

  // OUTPUT 1–6 칸: 이름을 적는 띠, 손잡이 둘, MONO·STEREO 표시등과 버튼
  for (let n = 1; n <= 6; n++) {
    const X0 = moduleX(n);
    lines.push(outline(sc, FRONT, [X0, X0 + MODULE_W], [3.3, 41.3], 2, FACE));
    lines.push(outline(sc, FRONT, [X0 + 1.4, X0 + MODULE_W - 1.4], [31.6, 39.4], 1.2, FACE));
    printed.push(text(X0 + 3.4, 33.4, `${n}`, 5, "start", "mid"));
    printed.push(text(X0 + 24.5, 4.8, `OUTPUT ${n}`, 2.4, "middle", "mid"));
    printed.push(text(X0 + 11.1, 9.4, "L", 1.8, "middle", "mid"), text(X0 + 38.9, 9.4, "R", 1.8, "middle", "mid"));
    printed.push(text(X0 + 20.8, 28.6, "MONO", 1.3, "end"), text(X0 + 28.9, 28.6, "STEREO", 1.3, "start"));
    // 표시등 둘에서 내려와 버튼으로 모이는 선. 인쇄된 표시라 끝이 면 위에서 멈춘다
    const [a, b, mid] = [X0 + 22.4, X0 + 27.4, X0 + 24.9];
    lines.push(sc.line(sc.lineOn(FRONT, [[a, 27.6], [a, 25.6], [b, 25.6], [b, 27.6]], FACE) + sc.lineOn(FRONT, [[mid, 25.6], [mid, 15.2]], FACE), { tone: "lo", free: true }));
  }

  // OUTPUT MONITOR 칸
  lines.push(outline(sc, FRONT, [383, 447], [3.3, 41.3], 2, FACE));
  printed.push(text(385.2, 37, "OUTPUT", 2.2, "start", "mid"), text(385.2, 33.6, "MONITOR", 2.2, "start", "mid"));
  const monitorCols = Array.from({ length: 8 }, (_, index) => 405.5 + index * 5.05);
  ["-20", "-15", "-10", "-5", "0", "+5", "+10", "+15"].forEach((label, index) => printed.push(text(monitorCols[index], 34.2, label, 1.2)));
  printed.push(text(402.2, 37, "L", 1.6, "middle", "mid"), text(402.2, 31.4, "R", 1.6, "middle", "mid"), text(443.8, 37, "L", 1.6, "middle", "mid"), text(443.8, 31.4, "R", 1.6, "middle", "mid"));
  printed.push(text(399, 8, "SELECT", 1.6, "middle", "mid"), text(399, 5, "CHANNEL", 1.6, "middle", "mid"), text(427.4, 5, "H/PHONE", 1.6, "middle", "mid"));
  lines.push(sc.line(sc.lineOn(FRONT, [[417.9, 10.4], [417.9, 5.6], [422.4, 5.6]], FACE) + sc.lineOn(FRONT, [[432.4, 5.6], [437, 5.6], [437, 8.6]], FACE), { tone: "lo", free: true }));

  // 오른쪽 상표
  printed.push(text(465, 27.4, "DRAWMER", 4, "middle", "hi"), text(465, 21.8, "DISTRIBUTION", 2.4, "middle", "mid"), text(465, 17.6, "AMPLIFIER", 2.4, "middle", "mid"), text(465, 13.4, "DA6", 2.4, "middle", "mid"));

  const dials = [
    dial(sc, [44.5, KNOB_Z], 6.1, INPUT_MARKS),
    dial(sc, [64.5, KNOB_Z], 6.1, INPUT_MARKS),
    ...[1, 2, 3, 4, 5, 6].flatMap((n) => [dial(sc, [moduleX(n) + 11.1, KNOB_Z], 6.1, OUTPUT_MARKS), dial(sc, [moduleX(n) + 38.9, KNOB_Z], 6.1, OUTPUT_MARKS)]),
    dial(sc, [398, KNOB_Z], 7.8, SELECT_MARKS),
    dial(sc, [417.9, KNOB_Z], 6.1, PHONES_MARKS),
  ];

  const plain = lines.filter((entry) => !entry.startsWith("<")).join("");
  const drawn = lines.filter((entry) => entry.startsWith("<")).join("");
  sc.box("front.panel", FRONT, [0, WIDTH], [0, TALL], [0, PANEL_T], { tone: "mid" }, { r: 0.8 });
  sc.box("front.face", FRONT, [1, WIDTH - 1], [1, TALL - 1], [PANEL_T, FACE], { tone: "lo", crease: "none" }, {
    extra: sc.line(plain, { tone: "lo" }) + drawn + dials.join("") + screws + printed.join(""),
  });

  // 부품
  knob(sc, [44.5, KNOB_Z], 5.7, AREA.inputs);
  knob(sc, [64.5, KNOB_Z], 5.7, AREA.inputs);
  for (const z of ROWS) for (const X of inputCols) led(sc, [X, z], AREA.inputMeter);
  for (let n = 1; n <= 6; n++) {
    const X0 = moduleX(n);
    knob(sc, [X0 + 11.1, KNOB_Z], 5.7, AREA.outputs);
    knob(sc, [X0 + 38.9, KNOB_Z], 5.7, AREA.outputs);
    led(sc, [X0 + 22.4, 29.2], AREA.mono);
    led(sc, [X0 + 27.4, 29.2], AREA.mono);
    sc.box("mono.bezel", FRONT, [X0 + 21.9, X0 + 27.9], [9, 15], [FACE, FACE + 1], { tone: "mid" }, { r: 0.6, spot: AREA.mono });
    sc.box("mono.cap", FRONT, [X0 + 22.6, X0 + 27.2], [9.7, 14.3], [FACE + 1, FACE + 3.4], { tone: "hi" }, { r: 0.5, spot: AREA.mono });
  }
  for (const z of ROWS) for (const X of monitorCols) led(sc, [X, z], AREA.outputMeter);
  knob(sc, [398, KNOB_Z], 7.4, AREA.select);
  knob(sc, [417.9, KNOB_Z], 5.7, AREA.phones);
  C.quarterJack(sc, FRONT, [437, 16.9], FACE, AREA.jack, true, "front.jack");
}

/** 뒤에서 본 왼쪽 → 오른쪽 거리(선 그림의 가로, 몸통 왼쪽 끝이 0) → 장비 X */
const U = (u: number) => BODY[1] - u;
const uu = (u0: number, u1: number) => [U(u1), U(u0)];
/** 출력 칸의 왼쪽 경계. CHANNEL 6이 맨 왼쪽이다 */
const sectionU = (channel: number) => 40 + (6 - channel) * 52.05;
const XLR_Z = 19;

function rearPanel(sc: Scene) {
  const text = (u: number, z: number, value: string, size = 1.8, anchor = "middle", tone = "lo") => sc.textOn(REAR, [U(u), z], value, { size, anchor, tone, h: BACK + 0.05 });
  const screw = (u: number, z: number, h = BACK) => C.screw(sc, REAR, [U(u), z], h);
  const printed: string[] = [];
  const lines: string[] = [];

  // 칸 경계와 아래 묶음선
  for (const u of [40, 92.1, 144.1, 248.2, 300.3, 352.1, 373.2, 425.8]) lines.push(sc.lineOn(REAR, [[U(u), 4.4], [U(u), 38.6]], BACK));
  lines.push(sc.lineOn(REAR, [[U(227.2), 4.4], [U(352.1), 4.4]], BACK));
  // 묶음 이름(OUTPUTS, INPUT) 앞뒤에서 끊기는 인쇄선이라 끝이 면 위에서 멈춘다
  // CHANNEL 4·3 사이 경계는 아래의 OUTPUTS 글자 위에서 멈춘다
  const brackets = [sc.lineOn(REAR, [[U(196.1), 7], [U(196.1), 38.6]], BACK)].concat([[40, 186.6], [206, 223.8], [373.2, 393.2], [406.2, 425.8]].map(([u0, u1]) => sc.lineOn(REAR, [[U(u0), 4.4], [U(u1), 4.4]], BACK)));
  printed.push(sc.line(brackets.join(""), { tone: "lo", free: true }));
  printed.push(text(196.3, 3.6, "OUTPUTS", 2.2, "middle", "mid"), text(399.7, 3.6, "INPUT", 2.2, "middle", "mid"));

  printed.push(text(11.8, 1.4, "AC POWER ONLY", 1.8, "start", "mid"), text(42, 1.4, "50/60Hz 30VA", 1.5, "start"));
  printed.push(text(45.7, 33.8, "~", 4, "middle", "mid"), text(84.4, 33.8, "CE", 3.4, "middle", "mid"));
  for (let channel = 6; channel >= 1; channel--) {
    const u0 = sectionU(channel);
    printed.push(text(channel === 6 ? u0 + 26.6 : channel === 5 ? u0 + 35.7 : u0 + 26, 35.4, `CHANNEL ${channel}`, 2.2, "middle", "mid"));
    if (channel !== 6) printed.push(text(u0 + 13, 31.2, "RIGHT"), text(u0 + 39, 31.2, "LEFT"));
  }
  printed.push(text(355.9, 32.2, "L"), text(370.5, 32.2, "L"), text(355.9, 14.1, "R"), text(370.5, 14.1, "R"));
  printed.push(text(362.9, 4.6, "AUX.", 1.8, "middle", "mid"), text(362.9, 1.6, "OUTPUT", 1.8, "middle", "mid"));
  printed.push(text(390.2, 35.4, "DRAWMER", 3, "middle", "hi"), text(415.9, 35.4, "DA6", 2.6, "middle", "mid"), text(387.4, 31.2, "RIGHT"), text(412.4, 31.2, "LEFT"));

  const xlrScrews = (u: number) => screw(u - 9.8, XLR_Z + 10.1) + screw(u + 10, XLR_Z - 9.5);
  const screws = [
    ...[1, 2, 3, 4, 5, 6].flatMap((channel) => [xlrScrews(sectionU(channel) + 13), xlrScrews(sectionU(channel) + 39)]),
    xlrScrews(387.4),
    xlrScrews(412.4),
    screw(8.9, 4.2),
    screw(225.5, 4.4),
    screw(429.6, 4.2),
  ];

  sc.box("rear.face", REAR, uu(5.7, 428.9), [0, 39.2], [0, BACK], { tone: "lo", crease: "none" }, {
    extra: sc.line(lines.join(""), { tone: "lo" }) + screws.join("") + printed.join(""),
  });
  // 윗덮개가 뒤로 접혀 내려온 띠와 양옆 턱
  sc.box("rear.lid", REAR, uu(0, 434.6), [39.2, TALL], [0, 0.8], { tone: "mid" }, { extra: screw(115, 41.6, 0.8) + screw(319.1, 41.6, 0.8) });
  sc.box("rear.lip", REAR, uu(0, 5.7), [0, 39.2], [0, 0.8], { tone: "mid" });
  sc.box("rear.lip", REAR, uu(428.9, 434.6), [0, 39.2], [0, 0.8], { tone: "mid" });

  C.iecInlet(sc, REAR, [U(25.1), 22.1], BACK, "Power supply socket", FUSE);
  for (let channel = 6; channel >= 1; channel--) {
    const u0 = sectionU(channel);
    C.xlr(sc, REAR, [U(u0 + 13), XLR_Z], BACK, `CHANNEL ${channel}`, false, "rear.out");
    C.xlr(sc, REAR, [U(u0 + 39), XLR_Z], BACK, `CHANNEL ${channel}`, false, "rear.out");
  }
  C.quarterJack(sc, REAR, [U(362.9), 32.9], BACK, "AUX. OUTPUT", false, "rear.aux");
  C.quarterJack(sc, REAR, [U(362.9), 14.8], BACK, "AUX. OUTPUT", false, "rear.aux");
  C.xlr(sc, REAR, [U(387.4), XLR_Z], BACK, "INPUT", true, "rear.in");
  C.xlr(sc, REAR, [U(412.4), XLR_Z], BACK, "INPUT", true, "rear.in");
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    name: "da-6",
    view,
    width: 760,
    height: 180,
    azimuth: 84,
    elevation: 11,
    pad: 16,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, 0, 0], [WIDTH, 0, 0], [BODY[0], DEPTH + 4, 0], [BODY[1], DEPTH + 4, 0],
      [0, 0, TALL], [WIDTH, 0, TALL], [BODY[0], DEPTH, TALL], [BODY[1], DEPTH, TALL],
      ...(front ? [[398, -16, KNOB_Z + 8]] : [[BODY[0], DEPTH + 6, XLR_Z], [BODY[1], DEPTH + 6, XLR_Z]]),
    ],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((key) => sc.spot(AREA[key], "area", NOTES[key]));
  } else {
    for (const name of DA_6_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(FUSE, "area", "전원 퓨즈와 예비 퓨즈가 든 서랍. 전원선을 뽑아야 열린다");
  }

  body(sc);
  if (front) frontPanel(sc);
  else rearPanel(sc);

  return sc.finish(
    front
      ? "앞에서 본 Drawmer DA6. 왼쪽부터 INPUT 칸(입력 음량 손잡이 둘과 표시등), OUTPUT 1–6 칸(칸마다 손잡이 둘과 MONO/STEREO 버튼), OUTPUT MONITOR 칸(SELECT CHANNEL 손잡이, H/PHONE 손잡이, 헤드폰 단자)이 있다."
      : "뒤에서 본 Drawmer DA6. 왼쪽부터 전원 단자와 퓨즈 서랍, OUTPUTS CHANNEL 6–1(칸마다 RIGHT·LEFT XLR), AUX. OUTPUT 잭 둘, INPUT XLR 둘(RIGHT·LEFT)이 있다.",
  );
}

export const DA_6_FIGURE: DeviceFigure = {
  id: "오디오 분배기",
  slug: "da-6",
  model: "Drawmer DA6",
  source: "Drawmer DA6 Operators' Manual PDF 8·9·11쪽, Drawmer 제품 페이지의 앞·뒷면 선 그림",
  caveat:
    "매뉴얼의 조작부 그림과 제품 페이지의 선 그림을 보고 단순화해 그렸다. 매뉴얼에는 뒷면 그림이 없어 뒷면은 제품 페이지의 선 그림을 따랐다. 제품 페이지 사진에는 INPUT이 INPUTS로 인쇄돼 있어 생산 시기마다 다를 수 있다. 앞면 1–6 칸의 이름 띠에 붙은 라벨은 그리지 않았다. 매뉴얼과 그림에 전원 스위치가 없어 그리지 않았다. 부품의 자리와 몸통 폭은 선 그림에서 잰 값이라 몇 mm쯤 어긋날 수 있다.",
  views: [build("front"), build("back")],
  ports: DA_6_PORTS,
  // 데이터는 앞면 칸 번호대로 "출력1"·"출력4"라 적는다. 뒷면에 인쇄된 이름은 "CHANNEL 1"·"CHANNEL 4"다.
  // 데이터를 고칠지 사람이 정할 때까지 임시로 잇는다
  aliases: { 출력1: "CHANNEL 1", 출력4: "CHANNEL 4" },
};
