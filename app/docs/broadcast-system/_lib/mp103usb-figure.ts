/**
 * CD/USB 플레이어(Numark MP103USB)의 생김새 그림. 앞 시점은 조작부, 뒤 시점은 단자다.
 *
 * 근거는 Numark "MP103USB Quickstart Guide v1.2"의 앞면 그림(FRONT PANEL FEATURES, 4쪽),
 * 뒷면 그림(REAR PANEL FEATURES, 6쪽), 치수(SPECIFICATIONS, 23쪽)다. 부품 자리는 PDF의 벡터 그림에서
 * 포인트(pt) 좌표로 재서 mm로 옮겼다. 아래 `fx`·`fz`·`rx`·`rz`에 넘기는 수가 그 pt 좌표다.
 *
 * 좌표는 장비 좌표다. X: 앞에서 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Plane, type Scene, type ViewKey } from "./device-figure";

/** 높이는 사양의 89mm(3.5")다. 가로는 앞면 그림의 비율로 정했다(사양의 483mm와 다르다. caveat 참고) */
const WIDTH = 422;
const DEPTH = 269;
const TALL = 89;
/** 뒷면 패널이 덮개 안으로 들어간 깊이와 덮개 두께. 뒷면 그림의 테두리에서 짐작했다 */
const LIP = 6;
const SKIN = 1.5;

const FLOOR = plane(0, 0, 0);
const FRONT = plane(0, 0, 90);
const REAR = plane(DEPTH - LIP, 0, 90, true);
const FACE = 0.6;

/** 앞면 그림(4쪽)의 pt 좌표 → 장비 좌표(mm). 앞면 테두리 x 29.36–365.35, y 65.73–136.44 */
const FS = 1.256;
const fx = (x: number) => (x - 29.36) * FS;
const fz = (y: number) => (136.44 - y) * FS;
const fr = (r: number) => r * FS;

/** 뒷면 그림(6쪽)의 pt 좌표 → 장비 좌표(mm). 테두리 x 29.34–365.69, y 67.2–133.98. 뒤에서 본 왼쪽이 장비의 오른쪽이다 */
const rx = (x: number) => WIDTH - ((x - 29.34) * WIDTH) / 336.35;
const rz = (y: number) => ((133.98 - y) * TALL) / 66.78;

/** 앞면 조작부. 이름은 매뉴얼 FRONT PANEL FEATURES의 번호 순서다 */
const AREA = {
  power: "POWER SWITCH",
  eject: "EJECT",
  usb: "USB",
  source: "SOURCE",
  folder: "FOLDER",
  track: "TRACK KNOB",
  play: "PLAY / PAUSE",
  cue: "CUE",
  scratch: "SCRATCH",
  search: "SEARCH",
  reverse: "REVERSE",
  brake: "BRAKE",
  jog: "JOG WHEEL",
  loopIn: "LOOP IN",
  loopOut: "LOOP OUT",
  reloop: "RELOOP",
  program: "PROGRAM",
  single: "SINGLE",
  time: "TIME",
  pitch: "PITCH",
  fader: "PITCH FADER",
  bend: "PITCH BEND -/+",
  tempo: "MASTER TEMPO",
  tap: "TAP",
  lcd: "LCD",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  usb: "USB 메모리(FAT16·FAT32)를 꽂는다",
  source: "CD와 USB 중 틀 곳을 고른다. 고른 쪽 표시등이 켜진다",
  folder: "폴더 보기와 파일 보기를 바꾼다",
  track: "돌려서 곡을 고르고, 눌러서 정한다",
  cue: "재생을 시작했던 자리로 돌아가 멈춘다",
  scratch: "켜면 JOG WHEEL로 스크래치 소리를 낸다",
  search: "켜면 JOG WHEEL로 빠르게 찾아간다",
  reverse: "거꾸로 재생한다",
  brake: "멈출 때 턴테이블처럼 느려지며 선다",
  loopIn: "루프의 시작점을 찍는다",
  loopOut: "루프의 끝점을 찍고 루프를 돈다",
  reloop: "루프를 처음부터 다시 돈다",
  program: "틀 곡의 순서를 미리 짠다",
  single: "한 곡이 끝나면 멈출지, 이어 틀지 바꾼다",
  time: "흐른 시간·남은 시간 표시를 바꾼다",
  pitch: "PITCH FADER의 범위(±4·8·16·100%)를 고르거나 끈다",
  fader: "재생 속도를 바꾼다",
  bend: "누르는 동안만 잠깐 빠르게·느리게 한다",
  tempo: "속도를 바꿔도 음정은 그대로 둔다",
  tap: "박자에 맞춰 두드려 BPM을 넣는다",
};

/** 뒷면 단자. 이름은 뒷면에 인쇄된 글자다(매뉴얼 6쪽 그림). 전원 단자는 인쇄된 이름이 없어 매뉴얼 목록의 이름이다 */
export const MP103USB_PORTS: string[] = ["BALANCED OUTPUT", "LINE OUT", "DIGITAL OUT", "POWER PLUG CONNECTOR"];
const PORT_NOTES: Record<string, string> = {
  "BALANCED OUTPUT": "XLR 둘(R·L). 믹서로 가는 밸런스드 출력",
  "LINE OUT": "RCA 둘(L·R). 믹서로 가는 라인 레벨 출력",
  "DIGITAL OUT": "RCA 하나. S/PDIF 디지털 소리",
};
const VOLTAGE = "VOLTAGE SELECTOR";

/** 면에 박힌 작은 표시등 */
function led(sc: Scene, on: Plane, at: number[], r: number, spot: string) {
  sc.round("led", on, at, r, [FACE, FACE + 0.5], { tone: "mid" }, { spot });
}

/** 앞면의 네모난 고무 버튼. 테두리는 그림의 pt 좌표다 */
function pad(sc: Scene, [x0, x1]: number[], [y0, y1]: number[], spot: string, base = FACE, tall = 2.4) {
  sc.box("pad", FRONT, [fx(x0), fx(x1)], [fz(y1), fz(y0)], [base, base + tall], { tone: "hi" }, { r: 0.8, spot });
}

function body(sc: Scene) {
  sc.halo(0);
  // 발은 매뉴얼 그림에 없어 몸통이 바로 바닥(선반)에 놓인다
  sc.box("stand.chassis", FLOOR, [0, WIDTH], [0, DEPTH - LIP], [0, TALL], { tone: "mid" }, { r: 1.2 });
  // 덮개가 뒷면 패널보다 뒤로 나와 위와 양옆을 감싼다(6쪽 그림의 모서리 빗금)
  sc.box("cover.top", FLOOR, [0, WIDTH], [DEPTH - LIP, DEPTH], [TALL - SKIN, TALL], { tone: "mid" });
  sc.box("cover.side", FLOOR, [0, SKIN], [DEPTH - LIP, DEPTH], [0, TALL - SKIN], { tone: "mid" });
  sc.box("cover.side", FLOOR, [WIDTH - SKIN, WIDTH], [DEPTH - LIP, DEPTH], [0, TALL - SKIN], { tone: "mid" });
}

function frontPanel(sc: Scene) {
  const text = (x: number, y: number, value: string, size = 1.9, anchor = "middle") => sc.textOn(FRONT, [fx(x), fz(y)], value, { size, h: 0.05, anchor });
  const printed = [
    text(47.55, 96.2, "POWER", 2.2),
    text(173.6, 119.9, "MP103 USB", 7.4),
    text(173.6, 123.9, "PROFESSIONAL MP3 USB/CD PLAYER", 1.75),
    text(184.9, 71.2, "USB", 1.8),
    text(184.9, 73.6, "INPUT", 1.8),
    text(203.2, 71.3, "EJECT", 1.8),
    text(251.6, 70.5, "TRACK", 1.8),
    text(251.6, 82.8, "PUSH SELECT (+10)", 1.4),
    text(254.4, 86.3, "CD", 1.6, "start"),
    text(254.4, 91, "USB", 1.6, "start"),
    text(299.6, 108.1, "SEARCH", 1.6),
    text(309.6, 108.1, "SCRATCH", 1.6),
    text(319.6, 108.1, "REVERSE", 1.6),
    text(329.5, 108.1, "BRAKE", 1.6),
    text(305, 111.2, "MASTER TEMPO", 1.6),
    text(331.2, 111.2, "4%", 1.5, "end"),
    text(331.2, 116, "8%", 1.5, "end"),
    text(331.2, 120.8, "16%", 1.5, "end"),
    text(335.2, 116, "100%", 1.5, "start"),
    text(324.5, 133.1, "PITCH BEND", 1.8),
    text(345.4, 72.3, "−%", 2),
    text(345.4, 134.8, "+%", 2),
  ];
  // 피치 눈금: 슬롯 양옆으로 3.98pt 간격, 위·아래 끝은 굵다. 바깥 끝은 인쇄된 눈금이라 그냥 멈춘다
  const ticks = [77.9, 81.9, 85.9, 89.9, 93.8, 105.8, 109.7, 113.7, 117.7, 121.7, 125.7]
    .flatMap((y) => [
      [[337.25, y], [344.27, y]],
      [[353.46, y], [346.63, y]],
    ])
    .map((points) => sc.line(sc.lineOn(FRONT, points.map(([x, y]) => [fx(x), fz(y)]), FACE), { tone: "lo", free: "start" }))
    .join("");
  const slot = sc.line(sc.rectOn(FRONT, [fx(344.27), fx(346.63)], [fz(129.45), fz(73.95)], FACE), { tone: "lo" });
  sc.box("front.face", FRONT, [0.8, WIDTH - 0.8], [0.8, TALL - 0.8], [0, FACE], { tone: "lo", crease: "none" }, { r: 1.6, extra: printed.join("") + ticks + slot });

  /* 1. POWER SWITCH */
  const power = [fx(47.55), fz(106.06)];
  sc.round("front.power.ring", FRONT, power, fr(8.26), [FACE, FACE + 1], { tone: "mid" }, { spot: AREA.power });
  sc.round("front.power", FRONT, power, fr(6.1), [FACE + 1, FACE + 4], { tone: "hi" }, { spot: AREA.power });

  /* CD 넣는 곳: 테두리와 문, 아래쪽 틈. 매뉴얼은 이름을 달지 않았다 */
  sc.box("front.tray.bezel", FRONT, [fx(61.7), fx(156)], [fz(104.13), fz(84.75)], [FACE, FACE + 1.4], { tone: "mid" }, { r: fr(4.3) });
  sc.box("front.tray.door", FRONT, [fx(65.75), fx(152.28)], [fz(101.34), fz(87.56)], [FACE + 1.4, FACE + 2], { tone: "mid" }, {
    r: 1,
    extra: sc.line(sc.rectOn(FRONT, [fx(68), fx(150)], [fz(99.6), fz(89.3)], FACE + 2), { tone: "faint" }),
  });
  sc.box("front.tray.slot", FRONT, [fx(67.4), fx(150.9)], [fz(103.2), fz(102.4)], [FACE + 1.4, FACE + 1.6], { tone: "lo" });

  /* 3. USB 단자(세워 박힌 USB-A) */
  C.slotJack(sc, FRONT, [fx(184.91), fz(79.99)], FACE, [8.6, 14], [[-2.4, -6], [2.4, -6], [2.4, 6], [-2.4, 6]], AREA.usb, "front.usb");

  /* 2. EJECT */
  sc.round("front.eject", FRONT, [fx(203.24), fz(76.41)], fr(3.65), [FACE, FACE + 2.4], { tone: "hi" }, { spot: AREA.eject });

  /* 13. JOG WHEEL: 받침 테, 손가락 홈 26개가 난 테, 홈 파인 판, 가운데 */
  const jog = [fx(220.77), fz(104.27)];
  const dimples = Array.from({ length: 26 }, (_, index) => {
    const t = (index / 26) * Math.PI * 2;
    return [jog[0] + 29.6 * Math.cos(t), jog[1] + 29.6 * Math.sin(t)];
  });
  sc.round("front.jog.bezel", FRONT, jog, fr(28.22), [FACE, FACE + 1.2], { tone: "lo" }, { spot: AREA.jog });
  sc.round("front.jog.rim", FRONT, jog, fr(26), [FACE + 1.2, FACE + 7], { tone: "mid" }, {
    spot: AREA.jog,
    extra: sc.line(dimples.map((at) => sc.ringOn(FRONT, at, 1.3, FACE + 7)).join(""), { tone: "lo" }),
  });
  const grooves = Array.from({ length: 10 }, (_, index) => 24.6 - index * 1.5);
  sc.round("front.jog.platter", FRONT, jog, fr(20.9), [FACE + 7, FACE + 8.2], { tone: "mid" }, {
    spot: AREA.jog,
    extra: sc.line(grooves.map((r) => sc.ringOn(FRONT, jog, r, FACE + 8.2)).join(""), { tone: "faint" }),
  });
  sc.round("front.jog.hub", FRONT, jog, fr(7.65), [FACE + 8.2, FACE + 8.8], { tone: "hi" }, { spot: AREA.jog });

  /* 5. FOLDER, 6. TRACK KNOB, 4. SOURCE 표시등(CD·USB) */
  pad(sc, [237.63, 242.45], [73.96, 78.86], AREA.folder);
  sc.turned("front.track", FRONT, [fx(251.6), fz(76.4)], [[FACE, 5.6], [FACE + 1.2, 5.6], [FACE + 1.2, 4.8], [FACE + 7, 4.4]], { tone: "mid" }, { spot: AREA.track, ribs: [FACE + 1.2, FACE + 7, 4.8, 20, 4.4] });
  led(sc, FRONT, [fx(251.7), fz(85.55)], 1.45, AREA.source);
  led(sc, FRONT, [fx(251.7), fz(90.2)], 1.45, AREA.source);

  /* 25. LCD: 테와 유리. 화면 내용은 그리지 않는다 */
  const glass = sc.patchOn(FRONT, [fx(268.62), fx(327.86)], [fz(92.47), fz(74.68)], FACE + 1.6) + sc.line(sc.rectOn(FRONT, [fx(268.62), fx(327.86)], [fz(92.47), fz(74.68)], FACE + 1.6), { tone: "lo" });
  sc.box("front.lcd.bezel", FRONT, [fx(260.62), fx(335.47)], [fz(96.95), fz(69.89)], [FACE, FACE + 1], { tone: "mid" }, { r: 1, spot: AREA.lcd });
  sc.box("front.lcd", FRONT, [fx(261.67), fx(334.42)], [fz(95.3), fz(71.5)], [FACE + 1, FACE + 1.6], { tone: "lo" }, { spot: AREA.lcd, extra: glass });

  /* 버튼 줄: 4. SOURCE, 19. TIME, 18. SINGLE, 17. PROGRAM, 10. SEARCH, 9. SCRATCH, 11. REVERSE, 12. BRAKE */
  [AREA.source, AREA.time, AREA.single, AREA.program].forEach((spot, index) => {
    const x0 = 257.39 + index * 9.96;
    pad(sc, [x0, x0 + 4.82], [99.43, 104.33], spot);
  });
  [AREA.search, AREA.scratch, AREA.reverse, AREA.brake].forEach((spot, index) => {
    const x0 = 296.83 + index * 9.96;
    pad(sc, [x0, x0 + 5.62], [99.35, 105.84], spot);
  });

  /* 루프·CUE·PLAY 묶음: 인쇄된 테 안에 14. LOOP IN, 15. LOOP OUT, 16. RELOOP, 8. CUE, 7. PLAY / PAUSE */
  const LOOP_BASE = FACE + 0.3;
  sc.box("front.transport", FRONT, [fx(255.07), fx(294.34)], [fz(131.74), fz(107.62)], [FACE, LOOP_BASE], { tone: "mid" }, { r: fr(3) });
  [AREA.loopIn, AREA.loopOut, AREA.reloop].forEach((spot, index) => {
    const x0 = [257.39, 270.93, 284.48][index];
    pad(sc, [x0, x0 + 7.62], [108.18, 113.88], spot, LOOP_BASE, 2.2);
  });
  for (const [x0, spot] of [[256.36, AREA.cue], [276.27, AREA.play]] as const) {
    sc.box("front.big.bezel", FRONT, [fx(x0), fx(x0 + 16.85)], [fz(130.1), fz(117.4)], [LOOP_BASE, LOOP_BASE + 0.8], { tone: "mid" }, { r: 1.8, spot });
    pad(sc, [x0 + 1.6, x0 + 15.25], [118.8, 128.7], spot, LOOP_BASE + 0.8, 2.8);
  }

  /* 23. MASTER TEMPO와 표시등, 20. PITCH와 범위 표시등 셋, 24. TAP, 22. PITCH BEND -/+ */
  pad(sc, [302.41, 307.23], [112.13, 117.02], AREA.tempo);
  led(sc, FRONT, [fx(313.1), fz(114.9)], fr(1.35), AREA.tempo);
  pad(sc, [317.14, 321.96], [112.13, 117.02], AREA.pitch);
  for (const y of [110.5, 115.25, 120]) led(sc, FRONT, [fx(333), fz(y)], fr(1.35), AREA.pitch);
  sc.round("front.tap", FRONT, [fx(304.82), fz(126.55)], fr(3.5), [FACE, FACE + 2.4], { tone: "hi" }, { spot: AREA.tap });
  pad(sc, [316.75, 322.36], [123.3, 129.79], AREA.bend);
  pad(sc, [326.7, 332.32], [123.3, 129.79], AREA.bend);

  /* 21. PITCH FADER: 슬롯 속 기둥과 손잡이 */
  sc.box("front.fader.stem", FRONT, [fx(344.75), fx(346.15)], [fz(102), fz(100)], [FACE, FACE + 2], { tone: "lo" }, { spot: AREA.fader });
  const grip = [98.4, 100.65, 102.6, 103.75]
    .map((y) => sc.line(sc.lineOn(FRONT, [[fx(339.13), fz(y)], [fx(351.77), fz(y)]], FACE + 8), { tone: "lo" }))
    .join("");
  sc.box("front.fader.cap", FRONT, [fx(339.13), fx(351.77)], [fz(105.16), fz(96.93)], [FACE + 2, FACE + 8], { tone: "hi" }, { spot: AREA.fader, extra: grip });
}

function rearPanel(sc: Scene) {
  const text = (x: number, y: number, value: string, size = 1.9, anchor = "middle") => sc.textOn(REAR, [rx(x), rz(y)], value, { size, h: 0.05, anchor });
  const printed = [
    text(104.6, 101.7, "BALANCED OUTPUT", 2.1),
    text(81, 115.6, "R", 2.1),
    text(129.2, 115.6, "L", 2.1),
    text(144.2, 98.4, "LINE", 2.1),
    text(144.2, 101.7, "OUT", 2.1),
    text(138.3, 109.2, "L", 2.1),
    text(138.3, 120.1, "R", 2.1),
    text(166.3, 109.1, "DIGITAL", 2.1),
    text(166.3, 112.3, "OUT", 2.1),
    text(265.8, 98.4, "MP103 USB", 9.4),
    text(265.8, 102.6, "PROFESSIONAL MP3 USB/CD PLAYER", 2.4),
    text(266.3, 122.8, "115V", 1.8, "end"),
    text(266.3, 125.4, "60Hz", 1.8, "end"),
    text(285.6, 122.8, "230V", 1.8, "start"),
    text(285.6, 125.4, "50Hz", 1.8, "start"),
  ];
  // 패널 윗변 가운데의 홈(6쪽 그림)
  const notch = sc.line(sc.lineOn(REAR, [[rx(191.25), TALL - SKIN], [rx(191.25), rz(75.29)], [rx(203.77), rz(75.29)], [rx(203.77), TALL - SKIN]], FACE), { tone: "lo" });
  sc.box("rear.face", REAR, [SKIN, WIDTH - SKIN], [1.2, TALL - SKIN], [0, FACE], { tone: "lo", crease: "none" }, { extra: printed.join("") + notch });

  /* 3. BALANCED OUTPUT(XLR) R·L, 4. LINE OUT(RCA) L·R, 5. DIGITAL OUT(RCA) */
  C.xlr(sc, REAR, [rx(91.95), rz(114.56)], FACE, "BALANCED OUTPUT");
  C.xlr(sc, REAR, [rx(117.29), rz(114.56)], FACE, "BALANCED OUTPUT");
  C.rca(sc, REAR, [rx(145.14), rz(108.16)], FACE, "LINE OUT");
  C.rca(sc, REAR, [rx(145.14), rz(119.09)], FACE, "LINE OUT");
  C.rca(sc, REAR, [rx(166.26), rz(119.25)], FACE, "DIGITAL OUT");

  /* 1. VOLTAGE SELECTOR: 미닫이 스위치. 손잡이는 230V 쪽에 그렸다 */
  sc.box("rear.voltage", REAR, [rx(279.99), rx(271.58)], [rz(114.58), rz(111.97)], [FACE, FACE + 0.8], { tone: "lo" }, { r: 0.6, spot: VOLTAGE });
  sc.box("rear.voltage.knob", REAR, [rx(279.4), rx(276.4)], [rz(114.25), rz(112.3)], [FACE + 0.8, FACE + 3], { tone: "hi" }, { r: 0.4, spot: VOLTAGE });

  /* 2. POWER PLUG CONNECTOR: 한쪽이 둥근 2핀 구멍 */
  const [ix, iz] = [rx(314.9), rz(91.3)];
  const hx = (x: number) => rx(x) - ix;
  const hz = (y: number) => rz(y) - iz;
  const lobe = Array.from({ length: 9 }, (_, index) => {
    const t = -Math.PI / 2 + (index / 8) * Math.PI;
    return [hx(317.3) - Math.cos(t) * (hx(317.3) - hx(320.64)), hz(91.3) + Math.sin(t) * hz(87.96)];
  });
  const hole = [[hx(308.3), hz(94.64)], ...lobe, [hx(308.3), hz(87.96)]];
  C.slotJack(sc, REAR, [ix, iz], FACE, [rx(303.69) - rx(326.11), rz(84.92) - rz(97.68)], hole, "POWER PLUG CONNECTOR", "rear.inlet");
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    name: "mp103usb",
    view,
    width: 760,
    height: 260,
    azimuth: 80,
    elevation: 12,
    pad: 22,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, -10, 0], [WIDTH, -10, 0], [0, DEPTH + 4, 0], [WIDTH, DEPTH + 4, 0],
      [0, 0, TALL], [WIDTH, 0, TALL], [0, DEPTH, TALL], [WIDTH, DEPTH, TALL],
    ],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((key) => sc.spot(AREA[key], "area", NOTES[key]));
  } else {
    for (const name of MP103USB_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(VOLTAGE, "area", "115V·230V 전환. 쓰는 곳의 전압에 맞춘다");
  }

  body(sc);
  if (front) frontPanel(sc);
  else rearPanel(sc);

  return sc.finish(
    front
      ? "앞에서 본 Numark MP103USB. 왼쪽부터 POWER 스위치, CD 넣는 곳, USB 단자, EJECT, JOG WHEEL, TRACK KNOB, LCD와 그 아래 버튼들, 맨 오른쪽 PITCH FADER가 있다."
      : "뒤에서 본 Numark MP103USB. 왼쪽부터 BALANCED OUTPUT(XLR 둘), LINE OUT(RCA 둘), DIGITAL OUT(RCA 하나), 전압 스위치, 전원 단자가 있다.",
  );
}

export const MP103USB_FIGURE: DeviceFigure = {
  id: "CD/USB 플레이어",
  slug: "mp103usb",
  model: "Numark MP103USB",
  source: "Numark MP103USB Quickstart Guide v1.2 4·6·23쪽",
  caveat:
    "매뉴얼의 앞·뒷면 그림과 치수를 보고 단순화해 그렸다. 매뉴얼 사양의 가로 483mm(19인치)는 랙 귀를 포함한 값으로 보이는데, 매뉴얼 그림에는 랙 귀가 없어 그리지 않았고 가로는 앞면 그림의 비율(약 422mm)로 그렸다. 옆모습이 없어 버튼·JOG WHEEL이 튀어나온 높이와 뒷면 패널이 들어간 깊이는 짐작이다. 그림에서 번호에 가려진 버튼 글자와 LCD 화면 내용은 비웠다. 전압 스위치의 손잡이 자리는 실물을 보지 못해 230V 쪽에 그렸다.",
  views: [build("front"), build("back")],
  ports: MP103USB_PORTS,
  aliases: {},
};
