/**
 * 영상 스위처(Panasonic AV-HS410)의 생김새 그림. 앞 시점은 조작 패널, 뒤 시점은 단자다.
 *
 * 근거는 Panasonic "Operating Instructions, Basics"의 조작 패널 그림(17–26쪽), 뒷면 그림(27쪽),
 * 치수(37쪽)다. 버튼과 단자의 자리는 그 그림에서 재서 mm로 옮겼다. 매뉴얼에 옆모습이 없어서
 * 패널이 기울어진 각도와 앞쪽 높이는 추정이다. 옵션 슬롯은 장착 여부를 몰라 비워 그린다.
 *
 * 좌표는 장비 좌표다. X: 조작하는 사람이 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위. 조작 패널의 자리는
 * 매뉴얼 평면도에서 뒤 모서리부터 잰 거리(`r`)로 적는다.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Scene, type ViewKey } from "./device-figure";

const WIDTH = 440;
const DEPTH = 361;
const TALL = 158;

const FOOT = 4;
/** 패널 앞 모서리와 뒤 모서리의 높이. 추정이다 */
const FRONT_TOP = 40;
const REAR_TOP = 108;
const TILT = (Math.atan((REAR_TOP - FRONT_TOP) / DEPTH) * 180) / Math.PI;
const COS = Math.cos((TILT * Math.PI) / 180);
const panelZ = (Y: number) => FRONT_TOP + ((REAR_TOP - FRONT_TOP) * Y) / DEPTH;

const FLOOR = plane(0, 0, 0);
const PANEL = plane(0, FRONT_TOP, TILT);
const FRONT = plane(0, 0, 90);
const REAR = plane(DEPTH, 0, 90, true);
/** 뒤 모서리에서 잰 거리 → 패널 오르막 거리 */
const up = (r: number) => (DEPTH - r) / COS;
const span2 = (r0: number, r1: number) => [up(Math.max(r0, r1)), up(Math.min(r0, r1))];

/** 디스플레이 화면이 놓인 면 */
const SCREEN_Y = 206;
const SCREEN_Z = panelZ(SCREEN_Y) + 2.2;
const SCREEN_TILT = 35.4;
const SCREEN = plane(SCREEN_Y, SCREEN_Z, SCREEN_TILT);
const SCREEN_LENGTH = 122.6;
const HOUSING = [24, 186];

const PLATE = 0.8;

/* ── 이름 ───────────────────────────────────────────── */

const AREA = {
  display: "Built-in display",
  encoders: "Rotary encoders [F1] to [F5]",
  menu: "Display mode buttons (DISPLAY) · Menu selection buttons (MENU SELECT)",
  card: "Memory card slot",
  user: "User buttons (USER BUTTON) [U1 to U8]",
  memory: "Memory/wipe pattern/number key area",
  positioner: "Positioner (POSITIONER) [X/Y] · Rotary encoder [Z]",
  indicators: "POWER · ALARM · LINK indicators",
  delegation: "AUX bus selector buttons (AUX BUS DELEGATION)",
  source: "Crosspoint buttons exclusively for AUX/DISP buses (AUX/DISP SOURCE)",
  aux: "AUX bus crosspoint buttons",
  pgm: "PGM/A bus crosspoint buttons [PGM/A 1 to 12]",
  pst: "PST/B bus crosspoint buttons [PST/B 1 to 12]",
  direction: "Wipe direction selection buttons (WIPE DIRECTION) [N/R], [R]",
  target: "[BKGD] button · [KEY] button",
  mode: "[MIX] button · [WIPE] button",
  cut: "[CUT] button",
  auto: "[AUTO] button",
  fader: "Fader lever",
  keyOn: "[KEY ON] button",
  ftb: "[FTB ON] button",
  pinp: "PinP button [PinP1 ON] [PinP2 ON]",
  dsk: "[DSK ON] button",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  pgm: "지금 내보내는 화면(PGM)을 고르는 줄",
  pst: "다음에 내보낼 화면을 고르는 줄",
  cut: "PST/B의 화면으로 바로 넘긴다",
  auto: "정해 둔 시간에 걸쳐 넘긴다",
  fader: "손으로 밀어서 넘긴다",
  ftb: "화면을 검게 내리거나 다시 올린다",
  dsk: "CG를 켜고 끈다",
};

const sdiIn = (n: number) => `SDI INPUTS ${n}`;
const sdiOut = (n: number) => `SDI OUTPUTS ${n}`;

const PORT_NOTES: Record<string, string> = {
  [sdiOut(1)]: "같은 신호가 단자 둘로 나온다",
  "DVI-D IN": "DVI-D 케이블만 쓸 수 있다",
  "DVI-D OUT": "DVI-D 케이블만 쓸 수 있다",
  REF: "외부 동기 신호 입력. 내부 동기일 때는 BB 출력",
  EDITOR: "RS-422 제어",
  COM: "RS-422 제어",
  "TALLY/GPI 1": "탈리·접점 입출력",
  "TALLY/GPI 2": "탈리·접점 입출력",
  "SLOT A": "옵션 보드 자리. 장착 여부를 몰라 비워 그렸다",
  "SLOT B": "옵션 보드 자리. 장착 여부를 몰라 비워 그렸다",
};

/** 매뉴얼 27쪽의 단자 이름 */
export const AV_HS410_PORTS: string[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map(sdiIn),
  ...[1, 2, 3, 4, 5].map(sdiOut),
  "DVI-D IN",
  "DVI-D OUT",
  "REF",
  "LAN",
  "EDITOR",
  "COM",
  "TALLY/GPI 1",
  "TALLY/GPI 2",
  "SLOT A",
  "SLOT B",
  "~ AC IN",
  "SIGNAL GND",
];

const BOOT = "BOOT switch [BOOT]";
const POWER = "Power switch [POWER]";
const FAN = "Cooling fan";

/* ── 몸통 ───────────────────────────────────────────── */

function body(sc: Scene) {
  const front = sc.view === "front";
  sc.halo(0);
  for (const [X, Y] of [[30, 30], [410, 30], [30, 331], [410, 331]]) sc.round("stand.foot", FLOOR, [X, Y], 9, [0, FOOT], { tone: "lo" });

  const marks: string[] = [];
  // 패널을 가로지르는 이음매 둘과 가장자리 홈
  marks.push(sc.line(sc.lineOn(PANEL, [[0, up(302)], [WIDTH, up(302)]]), { tone: "faint" }));
  marks.push(sc.line(sc.lineOn(PANEL, [[0, up(178)], [WIDTH, up(178)]]), { tone: "faint" }));
  marks.push(sc.line(sc.rectOn(PANEL, [2.5, WIDTH - 2.5], [up(358.5), up(2.5)]), { tone: "faint" }));
  if (front) {
    marks.push(sc.textOn(PANEL, [431, up(17)], "Panasonic", { size: 6.5, tone: "mid", anchor: "end" }));
    marks.push(sc.textOn(PANEL, [431, up(27)], "Live Switcher  AV-HS410", { size: 3.6, anchor: "end" }));
    // 앞면의 이음매와 나사
    marks.push(sc.line(sc.lineOn(FRONT, [[0, 12], [WIDTH, 12]]), { tone: "faint" }));
    marks.push(sc.dots(FRONT, [[14, 8], [WIDTH - 14, 8]], 0));
    // 오른쪽 옆면의 통풍 슬롯. 닫힌 테두리라 끝이 없다
    const slots: string[] = [];
    for (let column = 0; column < 9; column++) {
      for (let row = 0; row < 3; row++) {
        const Y = 214 + column * 13;
        const Z = 34 + row * 11;
        slots.push(`M${[[Y, Z], [Y + 8, Z], [Y + 8, Z + 5], [Y, Z + 5]].map(([y, z]) => sc.at([WIDTH, y, z]).map((value) => Math.round(value * 10) / 10).join(" ")).join("L")}Z`);
      }
    }
    marks.push(sc.line(slots.join(""), { tone: "lo" }));
  }
  sc.span("chassis", [0, WIDTH], [[0, FOOT], [0, FRONT_TOP], [DEPTH, REAR_TOP], [DEPTH, FOOT]], { tone: "mid" }, { extra: marks.join("") });
  // 뒤 모서리의 덮개 턱
  sc.span("chassis.lip", [0, WIDTH], [[DEPTH, REAR_TOP - 5], [DEPTH, REAR_TOP + 2.4], [DEPTH + 3, REAR_TOP + 2.4], [DEPTH + 3, REAR_TOP - 5]], { tone: "mid" });
}

/* ── 조작 패널 ───────────────────────────────────────── */

function plate(sc: Scene, name: string, X: number[], r: number[], spot?: string, extra = "") {
  sc.box(`plate.${name}`, PANEL, X, span2(r[0], r[1]), [0, PLATE], { tone: "lo", crease: "none" }, { r: 2.5, spot, extra });
}

/** 버튼 위에 인쇄된 글자. 앞 시점에서만 그린다 */
function legend(sc: Scene, X: number, r: number, h: number, lines: string[], size: number) {
  if (sc.view !== "front") return "";
  const gap = size * 1.1;
  const first = r - ((lines.length - 1) * gap) / 2 + size * 0.36;
  return lines.map((text, index) => sc.textOn(PANEL, [X, up(first + index * gap)], text, { size, h: h + 0.05, tone: "mid" })).join("");
}

function button(sc: Scene, name: string, [X, r]: number[], [w, d]: number[], tall: number, spot: string, lines: string[] = [], size = 2.5) {
  sc.box(name, PANEL, [X - w / 2, X + w / 2], span2(r - d / 2, r + d / 2), [PLATE, PLATE + tall], { tone: "mid" }, { r: 1.4, spot, extra: legend(sc, X, r, PLATE + tall, lines, size) });
}

/** 네모 받침 위에 둥근 머리가 올라온 큰 버튼 */
function bigButton(sc: Scene, name: string, [X, r]: number[], side: number, spot: string, text = "") {
  sc.box(`${name}.seat`, PANEL, [X - side / 2, X + side / 2], span2(r - side / 2, r + side / 2), [PLATE, PLATE + 2], { tone: "mid" }, { r: 2.2, spot });
  sc.round(`${name}.cap`, PANEL, [X, up(r)], side * 0.4, [PLATE + 2, PLATE + 4.4], { tone: "mid" }, { spot, extra: legend(sc, X, r, PLATE + 4.4, text ? [text] : [], 2.6) });
}

function topPanel(sc: Scene) {
  const front = sc.view === "front";
  const label = (X: number, r: number, text: string, size = 2.6, anchor = "middle") => (front ? sc.textOn(PANEL, [X, up(r)], text, { size, h: PLATE + 0.05, anchor }) : "");
  const column8 = (index: number) => 210 + index * 21;

  /* 디스플레이 */
  const housing = [
    [SCREEN_Y, panelZ(SCREEN_Y)],
    [341, panelZ(341)],
    [338, 150],
    [316, TALL],
    [306, SCREEN_Z + Math.sin((SCREEN_TILT * Math.PI) / 180) * SCREEN_LENGTH],
    [SCREEN_Y, SCREEN_Z],
  ];
  const [H0, H1] = HOUSING;
  const glass = [
    sc.line(sc.rectOn(SCREEN, [H0 + 3, H1 - 3], [4, SCREEN_LENGTH - 6]), { tone: "faint" }),
    sc.patchOn(SCREEN, [H0 + 7, H1 - 5], [17, 107]),
    sc.line(sc.rectOn(SCREEN, [H0 + 7, H1 - 5], [17, 107]), { tone: "lo" }),
    // 화면 아래쪽의 메뉴 줄. 인쇄된 글자를 대신하는 줄이라 면 위에서 끝난다
    ...(front
      ? [
          sc.line(sc.rectOn(SCREEN, [H0 + 10, H1 - 8], [20, 31]), { tone: "faint" }),
          sc.line(sc.lineOn(SCREEN, [[H0 + 13, 27.5], [H0 + 44, 27.5]]), { tone: "lo", free: true }),
          sc.line(sc.lineOn(SCREEN, [[H0 + 52, 27.5], [H0 + 80, 27.5]]), { tone: "lo", free: true }),
          sc.line(sc.lineOn(SCREEN, [[H0 + 88, 27.5], [H0 + 121, 27.5]]), { tone: "lo", free: true }),
          sc.line(sc.lineOn(SCREEN, [[H0 + 13, 23.5], [H0 + 36, 23.5]]), { tone: "faint", free: true }),
          sc.line(sc.lineOn(SCREEN, [[H0 + 52, 23.5], [H0 + 72, 23.5]]), { tone: "faint", free: true }),
        ]
      : []),
  ];
  // 디스플레이 뒤판의 통풍 슬롯과 이음매. 뒤 시점에서만 보인다
  const BACK = plane(341, panelZ(341), 93.75, true);
  const vents = Array.from({ length: 10 }, (_, index) => sc.rectOn(BACK, [H0 + 38 + index * 9, H0 + 43 + index * 9], [22, 38])).join("");
  const backMarks = sc.line(vents, { tone: "lo" }) + sc.line(sc.rectOn(BACK, [H0 + 5, H1 - 5], [5, 42]), { tone: "faint" }) + sc.dots(BACK, [[H0 + 10, 9], [H1 - 10, 9], [H0 + 10, 38], [H1 - 10, 38]]);
  sc.span("display.housing", HOUSING, housing, { tone: "mid" }, { spot: AREA.display, extra: front ? glass.join("") : backMarks });
  // 메모리 카드 슬롯: 디스플레이 오른쪽 옆면
  const slotLine = `M${sc.at([H1 + 1.2, 251.5, 102.7]).join(" ")}L${sc.at([H1 + 1.2, 260, 108.7]).join(" ")}`;
  sc.span("display.card", [H1, H1 + 1.2], [[247.5, 103.5], [250, 100], [262, 108.5], [259.5, 112]], { tone: "lo" }, { spot: AREA.card, extra: front ? sc.line(slotLine, { tone: "mid" }) : "" });

  plate(sc, "encoders", [24, 186], [157, 174], AREA.encoders, [44, 74, 104, 134, 166].map((X, index) => label(X, 172.6, `F${index + 1}`, 2.4)).join(""));
  for (const X of [44, 74, 104, 134, 166]) {
    sc.turned("encoder", PANEL, [X, up(163.5)], [[PLATE, 7], [PLATE + 1.6, 7], [PLATE + 1.6, 5.8], [PLATE + 11, 5.2]], { tone: "mid" }, { spot: AREA.encoders, ribs: [PLATE + 1.6, PLATE + 11, 5.8, 22] });
  }

  /* 사용자 버튼 */
  plate(sc, "user", [202, 368], [40, 59.5], AREA.user, label(285, 58.6, "USER BUTTON", 2.2));
  for (let index = 0; index < 8; index++) button(sc, "user.button", [column8(index), 48.5], [13, 10.5], 2.4, AREA.user, [`U${index + 1}`]);

  /* 화면 모드·메뉴 선택 */
  plate(sc, "menu", [202, 368], [66, 103.5], AREA.menu, label(221, 102.4, "DISPLAY", 2.2) + label(306, 102.4, "MENU SELECT", 2.2));
  const MENU = [
    [["MENU", "MODE"], ["PICT"], ["BKGD", "CBGD"], ["KEY", "CHRKEY"], ["PinP1", "PinP2"], ["DSK"], ["TIME"], ["PLUGIN"]],
    [["MENU", "OFF"], ["WFM", "VECT"], ["VMEM", "SD Card"], ["SHOT", "EVENT"], ["XPT", "MV"], ["IN", "OUT"], ["CONFIG", "SYS"], ["MENU", "HOLD"]],
  ];
  MENU.forEach((row, line) => row.forEach((lines, index) => button(sc, "menu.button", [column8(index), 75.5 + line * 15], [13, 10.5], 2.4, AREA.menu, lines, 2)));

  /* 메모리·와이프 패턴·숫자 키 */
  plate(sc, "memory", [202, 368], [110, 176.5], AREA.memory, label(285, 175.5, "MEMORY / WIPE PATTERN / 10 KEY", 2.2));
  const ROWS = [119, 133.5, 148, 162.5];
  const KEYS: Array<[number, string[][]]> = [
    [210, [["SHOT", "MEM"], ["EVENT", "MEM"], ["PLUGIN", "MEM1"], ["PLUGIN", "MEM2"]]],
    [231, [["STORE"], ["RE", "CALL"], ["DEL"], ["EDIT"]]],
    [262, [["7"], ["4"], ["1"], ["0/10"]]],
    [284, [["8"], ["5"], ["2"], ["."]]],
    [306, [["9"], ["6"], ["3"], ["C"]]],
    [357, [["MENU", "INPUT"], ["VMEM"], ["BKGD", "PATT"], ["KEY", "PATT"]]],
  ];
  for (const [X, column] of KEYS) column.forEach((lines, row) => button(sc, "memory.button", [X, ROWS[row]], [13, 10.5], 2.4, AREA.memory, lines, lines[0].length <= 2 ? 3 : 2));
  button(sc, "memory.button", [328, ROWS[0]], [13, 10.5], 2.4, AREA.memory, ["XPT", "DSBL"], 2);
  button(sc, "memory.button", [328, ROWS[1]], [13, 10.5], 2.4, AREA.memory, ["- / +", "PAGE"], 2);
  button(sc, "memory.button", [328, (ROWS[2] + ROWS[3]) / 2], [13, 25], 2.4, AREA.memory, ["TAKE", "ENTER"], 2);

  /* 포지셔너와 표시등 */
  plate(sc, "positioner", [373, 435], [79, 157], AREA.positioner, label(404, 155.6, "POSITIONER", 2.2) + label(419, 97, "Z", 2.4) + label(379, 140, "X/Y", 2.2, "start"));
  sc.turned("positioner.z", PANEL, [407, up(92)], [[PLATE, 7], [PLATE + 1.6, 7], [PLATE + 1.6, 5.8], [PLATE + 10, 5.2]], { tone: "mid" }, { spot: AREA.positioner, ribs: [PLATE + 1.6, PLATE + 10, 5.8, 22] });
  sc.round("positioner.ring", PANEL, [398, up(130)], 17, [PLATE, PLATE + 1.6], { tone: "mid" }, { spot: AREA.positioner });
  sc.turned("positioner.boot", PANEL, [398, up(130)], [[PLATE + 1.6, 11.5], [PLATE + 4.5, 9.5, 1], [PLATE + 7.5, 5.5, 1], [PLATE + 9, 3.4]], { tone: "mid" }, { spot: AREA.positioner });
  sc.round("positioner.stick", PANEL, [398, up(130)], 2.6, [PLATE + 9, PLATE + 19], { tone: "mid" }, { spot: AREA.positioner });
  sc.turned("positioner.knob", PANEL, [398, up(130)], [[PLATE + 19, 6.6], [PLATE + 27, 7.4], [PLATE + 27, 6.2], [PLATE + 29, 5.6]], { tone: "mid" }, { spot: AREA.positioner });

  ["POWER", "ALARM", "LINK"].forEach((text, index) => {
    const r = 53 + index * 7;
    sc.box("indicator", PANEL, [423, 431], span2(r - 1.3, r + 1.3), [0, 1], { tone: "mid" }, { r: 1, spot: AREA.indicators, extra: front ? sc.textOn(PANEL, [420.5, up(r + 1)], text, { size: 2.4, anchor: "end", h: 0.05 }) : "" });
  });

  /* 크로스포인트 */
  const column12 = (index: number) => 20.5 + index * 21;
  const numbers = Array.from({ length: 12 }, (_, index) => label(column12(index), 263.6, `${index + 1}/${index + 13}`, 2.6)).join("");
  plate(
    sc,
    "crosspoint",
    [3, 268],
    [182, 297],
    undefined,
    numbers + label(110, 202.5, "AUX BUS DELEGATION", 2.2) + label(230, 202.5, "AUX/DISP SOURCE", 2.2) + label(4.4, 218, "AUX", 2, "start") + label(4.4, 244, "PGM", 2, "start") + label(4.4, 247.2, "A", 2, "start") + label(4.4, 279, "PST", 2, "start") + label(4.4, 282.2, "B", 2, "start"),
  );
  ["KEY", "PinP1", "PinP2", "DSK", "AUX1", "AUX2", "AUX3", "AUX4", "DISP", "MV", "PVW", "PGM"].forEach((text, index) =>
    button(sc, "delegation.button", [column12(index), 192], [12.5, 10.5], 2.4, index < 9 ? AREA.delegation : AREA.source, [text], 2.2),
  );
  for (let index = 0; index < 12; index++) button(sc, "aux.button", [column12(index), 217], [15, 15], 3, AREA.aux, index === 11 ? ["SHIFT"] : [], 2.4);
  for (let index = 0; index < 12; index++) bigButton(sc, "pgm.button", [column12(index), 245], 19, AREA.pgm, index === 11 ? "SHIFT" : "");
  for (let index = 0; index < 12; index++) bigButton(sc, "pst.button", [column12(index), 280], 19, AREA.pst, index === 11 ? "SHIFT" : "");

  /* 전환부 */
  const leds = [[288, 231], [288, 235.4], [309, 231], [309, 235.4], [333.5, 247], [333.5, 278]]
    .map(([X, r]) => sc.line(sc.rectOn(PANEL, [X - 3, X + 3], span2(r - 1.1, r + 1.1), PLATE), { tone: "lo" }))
    .join("");
  const frame = sc.line(sc.rectOn(PANEL, [387.5, 426.5], span2(236.5, 255.5), PLATE), { tone: "faint" });
  plate(sc, "transition", [273, 435], [182, 297], undefined, leds + frame + label(298.5, 202.5, "WIPE DIRECTION", 2.2));
  button(sc, "direction.button", [288, 192], [12.5, 10.5], 2.4, AREA.direction, ["N/R"], 2.4);
  button(sc, "direction.button", [309, 192], [12.5, 10.5], 2.4, AREA.direction, ["R"], 3);
  button(sc, "target.button", [288, 220], [14, 14], 3, AREA.target, ["BKGD"], 2.6);
  button(sc, "target.button", [309, 220], [14, 14], 3, AREA.target, ["KEY"], 2.6);
  button(sc, "mode.button", [288, 247], [14, 14], 3, AREA.mode, ["MIX"], 2.6);
  button(sc, "mode.button", [309, 247], [14, 14], 3, AREA.mode, ["WIPE"], 2.6);
  bigButton(sc, "cut", [286, 278], 20, AREA.cut, "CUT");
  bigButton(sc, "auto", [310, 278], 20, AREA.auto, "AUTO");
  sc.box("fader.housing", PANEL, [339, 372], span2(236, 293), [PLATE, PLATE + 2.4], { tone: "mid" }, { r: 2.5, spot: AREA.fader, extra: sc.line(sc.rectOn(PANEL, [352.5, 358.5], span2(242, 288), PLATE + 2.4), { tone: "lo" }) });
  sc.box("fader.stem", PANEL, [353.5, 357.5], span2(270, 274), [PLATE + 2.4, PLATE + 20], { tone: "mid" }, { spot: AREA.fader });
  sc.box("fader.bar", PANEL, [334, 377], span2(265, 279), [PLATE + 20, PLATE + 27], { tone: "hi" }, { r: 3, spot: AREA.fader });
  button(sc, "key-on", [394, 218], [13, 13], 3, AREA.keyOn, ["KEY", "ON"], 2.4);
  button(sc, "ftb-on", [415, 218], [13, 13], 3, AREA.ftb, ["FTB", "ON"], 2.4);
  button(sc, "pinp-on", [397, 246], [13, 13], 3, AREA.pinp, ["PinP1", "ON"], 2.2);
  button(sc, "pinp-on", [417, 246], [13, 13], 3, AREA.pinp, ["PinP2", "ON"], 2.2);
  button(sc, "dsk-on", [417, 278], [13, 13], 3, AREA.dsk, ["DSK", "ON"], 2.4);
}

/* ── 뒷면 ───────────────────────────────────────────── */

/** 뒤에서 본 왼쪽 → 오른쪽 거리(매뉴얼 27쪽 그림의 가로) → 장비 X */
const U = (u: number) => WIDTH - u;
const uu = (u0: number, u1: number) => [U(u1), U(u0)];

function rearPanel(sc: Scene) {
  const text = (u: number, z: number, value: string, size = 2.8, anchor = "middle") => sc.textOn(REAR, [U(u), z], value, { size, h: 0.05, anchor });
  const strip = (u0: number, u1: number, z: number, value: string) => sc.line(sc.rectOn(REAR, uu(u0, u1), [z, z + 4.2]), { tone: "lo" }) + text((u0 + u1) / 2, z + 0.9, value, 2.8);
  const screw = (u: number, z: number, h = 0) => C.screw(sc, REAR, [U(u), z], h);

  // 뒷면에 인쇄된 이름 띠와 번호
  const printed = [
    strip(14, 43, 23.5, "DVI-D OUT"),
    strip(49, 90, 23.5, "DVI-D IN"),
    strip(92, 189, 23.5, "SDI OUTPUTS"),
    strip(191, 324, 23.5, "SDI INPUTS"),
    strip(326, 343, 23.5, "LAN"),
    strip(16, 147, 28.8, "SLOT B"),
    strip(152, 284, 28.8, "SLOT A"),
    strip(62, 96, 71.2, "EDITOR"),
    strip(102, 136, 71.2, "COM"),
    strip(141, 183, 71.2, "TALLY/GPI 2"),
    strip(186, 228, 71.2, "TALLY/GPI 1"),
    strip(230, 244, 71.2, "BOOT"),
    strip(246, 280, 71.2, "REF"),
    text(370.5, 89.6, "POWER", 3),
    text(392, 80, "ON", 2.4, "start"),
    text(392, 54, "OFF", 2.4, "start"),
    text(408, 50.5, "~ AC IN", 2.8),
    text(403, 19.8, "SIGNAL GND", 2.4, "end"),
    text(232.5, 88.6, "SV", 2, "end"),
    text(241.5, 88.6, "NM", 2, "start"),
    ...[[5, 101], [4, 116], [3, 132], [2, 147], [1, 165], [1, 181]].map(([n, u]) => text(u, 19.4, `${n}`, 2.8)),
    ...[[8, 197], [7, 213], [6, 233], [5, 248], [4, 265], [3, 282], [2, 298], [1, 315]].map(([n, u]) => text(u, 19.4, `${n}`, 2.8)),
    // 단자 사이의 나사
    ...[[109, 16.5], [139, 16.5], [156.5, 16.5], [173, 14.5], [205, 16.5], [240.5, 16.5], [256.5, 16.5], [290, 16.5], [262.5, 85.5], [220, 6.5]].map(([u, z]) => screw(u, z)),
  ];
  sc.box("rear.face", REAR, [14, WIDTH - 14], [5, 101], [0, 0.6], { tone: "lo", crease: "none" }, { extra: printed.join("") });
  const FACE = 0.6;

  // 양옆 브래킷
  for (const [u0, u1] of [[2, 12], [428, 438]]) {
    const slots = [30, 52, 74].map((z) => sc.line(sc.rectOn(REAR, uu(u0 + 3, u1 - 3), [z, z + 9], 2), { tone: "lo" })).join("");
    sc.box("rear.bracket", REAR, uu(u0, u1), [19, 100], [0, 2], { tone: "mid" }, { r: 1.5, extra: slots + screw((u0 + u1) / 2, 24, 2) + screw((u0 + u1) / 2, 95, 2) });
  }

  const bnc = (u: number, z: number, spot: string) => C.bnc(sc, REAR, [U(u), z], FACE, spot);
  const dsub = (u: number, z: number, pins: 9 | 15, spot: string) => C.dsub(sc, REAR, [U(u), z], FACE, pins, spot);

  const dvi = (u: number, z: number, spot: string) => {
    const grid = Array.from({ length: 24 }, (_, index) => [U(u) - 3.5 + ((index % 8) - 3.5) * 2.2, z + (Math.floor(index / 8) - 1) * 2.1]);
    sc.box("rear.dvi.flange", REAR, [U(u) - 19.5, U(u) + 19.5], [z - 5.6, z + 5.6], [FACE, FACE + 1], { tone: "mid" }, { r: 1.2, spot });
    sc.box("rear.dvi.shell", REAR, [U(u) - 13, U(u) + 13], [z - 4.3, z + 4.3], [FACE + 1, FACE + 6.6], { tone: "mid" }, {
      r: 1.6,
      spot,
      extra: sc.dots(REAR, grid, FACE + 6.6, { size: 0.35, tone: "lo" }) + sc.line(sc.rectOn(REAR, [U(u) + 7.4, U(u) + 11.4], [z - 0.5, z + 0.5], FACE + 6.6), { tone: "lo" }),
    });
    for (const side of [-1, 1]) sc.round("rear.dvi.post", REAR, [U(u) + side * 16.4, z], 2.2, [FACE + 1, FACE + 5], { tone: "mid" }, { spot });
  };

  /* 아랫줄: DVI, SDI, LAN */
  const LOW = 11.6;
  dvi(25.5, LOW, "DVI-D OUT");
  dvi(69.5, LOW, "DVI-D IN");
  [[5, 101], [4, 116], [3, 132], [2, 147], [1, 165], [1, 181]].forEach(([n, u]) => bnc(u, LOW, sdiOut(n)));
  [[8, 197], [7, 213], [6, 233], [5, 248], [4, 265], [3, 282], [2, 298], [1, 315]].forEach(([n, u]) => bnc(u, LOW, sdiIn(n)));
  C.rj45(sc, REAR, [U(334), LOW], FACE, "LAN");

  /* 옵션 슬롯: 빈 덮개 */
  for (const [name, u0, u1] of [["SLOT B", 16, 147], ["SLOT A", 152, 284]] as const) {
    const half = name === "SLOT B" ? ["IN/OUT B2", "IN/OUT B1"] : ["IN/OUT A2", "IN/OUT A1"];
    const marks =
      sc.line(sc.rectOn(REAR, uu(u0 + 3, u1 - 3), [38, 65], FACE + 1.2), { tone: "faint" }) +
      [[u0 + 6, 51], [u1 - 6, 51], [u0 + 12, 36.6], [u1 - 12, 36.6]].map(([u, z]) => screw(u, z, FACE + 1.2)).join("") +
      sc.textOn(REAR, [U(u0 + (u1 - u0) * 0.3), 34.6], half[0], { size: 2.2, h: FACE + 1.25 }) +
      sc.textOn(REAR, [U(u0 + (u1 - u0) * 0.7), 34.6], half[1], { size: 2.2, h: FACE + 1.25 });
    sc.box("rear.slot", REAR, uu(u0, u1), [34, 68], [FACE, FACE + 1.2], { tone: "mid" }, { r: 1, spot: name, extra: marks });
  }

  /* 윗줄: 제어 단자, BOOT, REF */
  const HIGH = 82;
  dsub(79, HIGH, 9, "EDITOR");
  dsub(119, HIGH, 9, "COM");
  dsub(162, HIGH, 15, "TALLY/GPI 2");
  dsub(207, HIGH, 15, "TALLY/GPI 1");
  sc.box("rear.boot", REAR, uu(232.5, 241.5), [78.5, 85.5], [FACE, FACE + 0.8], { tone: "mid" }, { r: 0.6, spot: BOOT });
  sc.box("rear.boot.slide", REAR, uu(237.2, 240.4), [80, 84], [FACE + 0.8, FACE + 2.4], { tone: "hi" }, { spot: BOOT });
  bnc(253, HIGH - 1, "REF");
  bnc(272, HIGH - 1, "REF");

  /* 냉각 팬 */
  const cells: string[] = [];
  for (let column = 0; column < 6; column++) {
    for (let row = 0; row < 7; row++) {
      const corner = (column === 0 || column === 5) && (row === 0 || row === 6);
      const hub = column >= 2 && column <= 3 && row >= 2 && row <= 4;
      if (corner || hub) continue;
      const u = 291 + column * 8.6;
      const z = 32.5 + row * 8;
      cells.push(sc.rectOn(REAR, uu(u, u + 6.2), [z, z + 5.6], FACE + 1));
    }
  }
  sc.box("rear.fan", REAR, uu(287, 345), [28, 91], [FACE, FACE + 1], { tone: "mid" }, {
    r: 1.5,
    spot: FAN,
    extra: sc.line(cells.join(""), { tone: "lo" }) + [[294, 35], [338, 35], [294, 84], [338, 84]].map(([u, z]) => screw(u, z, FACE + 1)).join("") + sc.line(sc.ringOn(REAR, [U(316), 59.5], 9, FACE + 1), { tone: "faint" }),
  });

  /* 전원 */
  sc.box("rear.power", REAR, uu(352, 389), [48, 87], [FACE, FACE + 1.2], { tone: "mid" }, { r: 1.5, spot: POWER, extra: sc.line(sc.rectOn(REAR, uu(360, 381), [53, 82], FACE + 1.2), { tone: "faint" }) });
  sc.box("rear.power.rocker", REAR, uu(363, 378), [56, 79], [FACE + 1.2, FACE + 5], { tone: "hi" }, { r: 1, spot: POWER, extra: sc.line(sc.lineOn(REAR, [[U(378), 67.5], [U(363), 67.5]], FACE + 5), { tone: "lo" }) });

  const inlet = [[U(408) - 9, 67], [U(408) + 9, 67], [U(408) + 9, 79], [U(408) + 5.5, 83], [U(408) - 5.5, 83], [U(408) - 9, 79]];
  const pins = [[0, 78.4], [-4.6, 72], [4.6, 72]].map(([dx, z]) => sc.rectOn(REAR, [U(408) + dx - 1.1, U(408) + dx + 1.1], [z - 1.8, z + 1.8], FACE + 1.5)).join("");
  sc.box("rear.inlet", REAR, uu(396, 420), [56, 94], [FACE, FACE + 1.5], { tone: "mid" }, {
    r: 3,
    spot: "~ AC IN",
    extra: sc.line(sc.lineOn(REAR, inlet, FACE + 1.5, true), { tone: "lo" }) + sc.line(pins, { tone: "lo" }) + screw(408, 60, FACE + 1.5) + screw(408, 90, FACE + 1.5),
  });

  sc.round("rear.gnd.washer", REAR, [U(410), 20.5], 3.8, [FACE, FACE + 1.4], { tone: "mid" }, { spot: "SIGNAL GND" });
  sc.round("rear.gnd.screw", REAR, [U(410), 20.5], 2.3, [FACE + 1.4, FACE + 4.4], { tone: "mid" }, {
    spot: "SIGNAL GND",
    extra: sc.line(sc.lineOn(REAR, [[U(410) - 1.6, 20.5], [U(410) + 1.6, 20.5]], FACE + 4.4), { tone: "lo" }),
  });
}

/* ── 조립 ───────────────────────────────────────────── */

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    view,
    width: 760,
    height: front ? 520 : 400,
    azimuth: front ? 60 : 76,
    elevation: front ? 40 : 21,
    pad: 22,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, 0, 0], [WIDTH, 0, 0], [0, DEPTH + 12, 0], [WIDTH, DEPTH + 12, 0],
      [0, 0, FRONT_TOP], [WIDTH, 0, FRONT_TOP], [0, DEPTH, REAR_TOP + 3], [WIDTH, DEPTH, REAR_TOP + 3],
      [HOUSING[0], 316, TALL], [HOUSING[1], 316, TALL], [398, DEPTH - 130, panelZ(DEPTH - 130) + 32],
    ],
  });

  // 이름 목록의 순서를 여기서 정한다
  if (view === "front") {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((key) => sc.spot(AREA[key], "area", NOTES[key]));
  } else {
    for (const name of AV_HS410_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(POWER, "area");
    sc.spot(BOOT, "area", "정비용 스위치. 평소에는 NM에 둔다");
    sc.spot(FAN, "area");
  }

  body(sc);
  topPanel(sc);
  if (view === "back") rearPanel(sc);

  return sc.finish(
    view === "front"
      ? "앞에서 내려다본 Panasonic AV-HS410. 왼쪽 위에 디스플레이가 서 있고, 그 아래에 크로스포인트 버튼 세 줄이 있다. 오른쪽 아래에 전환 버튼과 페이더 레버가 있다."
      : "뒤에서 본 Panasonic AV-HS410. 아랫줄에 왼쪽부터 DVI-D OUT, DVI-D IN, SDI OUTPUTS 5–1, SDI INPUTS 8–1, LAN이 있다. 그 위에 옵션 슬롯 B와 A, 윗줄에 EDITOR, COM, TALLY/GPI 2·1, BOOT, REF가 있고 오른쪽에 냉각 팬, 전원 스위치, AC IN이 있다.",
  );
}

const ALIASES: Record<string, string> = {
  ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`SDI IN${n}`, sdiIn(n)])),
  ...Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`SDI OUT${n}`, sdiOut(n)])),
  "DVI IN": "DVI-D IN",
  "DVI OUT": "DVI-D OUT",
};

export const AV_HS410_FIGURE: DeviceFigure = {
  id: "영상 스위처",
  model: "Panasonic AV-HS410",
  source: "Panasonic AV-HS410 Operating Instructions, Basics 17–27쪽",
  caveat: "매뉴얼의 그림과 치수를 보고 단순화해 그렸다. 패널이 기울어진 각도와 앞쪽 높이는 매뉴얼에 없어 추정이다. 옵션 슬롯은 비워 그렸다.",
  views: [build("front"), build("back")],
  ports: AV_HS410_PORTS,
  aliases: ALIASES,
};
