/**
 * 조명 콘솔(Botex DC-2448 Light Operator)의 생김새 그림. 앞 시점은 윗면의 페이더·버튼, 뒤 시점은 단자다.
 *
 * 근거는 Thomann "DC-2448 Light Operator User Manual" (2024-01-11, ID 216405 V2)의 윗면 그림
 * (Front - fader area 10쪽, Front - control area 11–12쪽), 뒷면 그림(13쪽), 사양(27쪽)이다.
 * 부품의 자리는 그 그림에서 재서 mm로 옮겼다. 윗면 그림은 폭 716mm·깊이 267mm로, 뒷면 그림은 윗판
 * 폭 716mm로 맞췄다. 매뉴얼에 옆모습이 없어 윗면은 평평하게 그렸고, 몸통 높이는 뒷면 그림의 비율로
 * 잰 값이다.
 *
 * 좌표는 장비 좌표다. X: 조작하는 사람이 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Plane, type Scene, type ViewKey } from "./device-figure";

const WIDTH = 716;
const DEPTH = 267;
const FOOT = 5;
/** 뒷면 그림에서 잰 몸통 높이와 윗판 두께 */
const BODY = 47;
const PLATE_T = 1.6;
const TALL = FOOT + BODY + PLATE_T;
/** 윗판이 몸통 양옆으로 나온 폭. 랙 고정 구멍이 여기 있다 */
const EAR = 20;

const FLOOR = plane(0, 0, 0);
const TOP = plane(0, TALL, 0);
const REAR = plane(DEPTH, 0, 90, true);
/** 구역 판의 두께. 버튼과 페이더가 그 위에 선다 */
const INLAY = 0.4;

/* ── 이름 ───────────────────────────────────────────── */

const AREA = {
  presetA: "PRESET A 1-24",
  fadersA: "Channel faders 1-24",
  flashA: "FLASH 1-24",
  presetB: "PRESET B 25-48",
  scenes: "SCENES 1-24",
  fadersB: "Channel faders 25-48 / Scene faders 1-24",
  flashB: "FLASH 25-48",
  display: "Display · REC STEP · DIMMER · SPEED TIME · FADE TIME",
  fog: "FOG MACHINE",
  edit: "DOWN/BEAT REV · UP/CHASE REV · DELETE/REV ONE · INSERT/% OR 255 · EDIT/ALL REV",
  program: "DARK · MODE SELECT/REC SPEED · PAGE/REC CLEAR · ADD KILL/REC EXIT · RECORD/SHIFT",
  run: "MASTER · PARK · HOLD · STEP · AUDIO",
  masters: "MASTER · MASTER B",
  timing: "FADE · SPEED",
  audioLevel: "AUDIO LEVEL",
  output: "BLIND · HOME · TAP SYNC · FULL ON · BLACK OUT",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  presetA: "채널 1–24의 지금 밝기를 보이는 표시등",
  fadersA: "채널 1–24의 밝기를 손으로 정한다",
  flashA: "누르는 동안 그 채널을 100%로 켠다",
  presetB: "채널 25–48의 지금 밝기를 보이는 표시등",
  scenes: "켜진 장면의 표시등",
  fadersB: "채널 25–48, 또는 모드에 따라 장면 1–24의 밝기",
  flashB: "누르는 동안 그 채널을 100%로 켠다",
  display: "지금 상태나 값을 숫자로 보인다. 왼쪽 표시등이 무엇을 보이는지 알린다",
  fog: "포그 머신 버튼과 HEATING·READY 표시등",
  edit: "장면을 만들고 고칠 때 쓴다",
  program: "PAGE는 네 뱅크를 넘기고, MODE SELECT는 운용 방식(장면·더블 프리셋·싱글 프리셋)을 고른다",
  run: "MASTER는 누르는 동안 Master A를 100%로 올린다",
  masters: "왼쪽(A)은 채널 1–24, 오른쪽(B)은 채널 25–48 전체의 밝기",
  timing: "장면이 넘어가는 시간과 체이스 속도",
  audioLevel: "소리에 반응하는 감도",
  output: "BLACK OUT은 모든 출력을 0으로 내린다",
};

/** 매뉴얼 13쪽 뒷면 그림의 단자 이름 */
export const DC_2448_PORTS: string[] = ["DC IN", "MIDI THRU", "MIDI OUT", "MIDI IN", "DMX OUT", "AUDIO", "REMOTE", "FOG MACHINE"];
const PORT_NOTES: Record<string, string> = {
  "DC IN": "전원 어댑터 입력",
  "MIDI THRU": "MIDI 장비 연결(DIN 5핀)",
  "MIDI OUT": "MIDI 장비 연결(DIN 5핀)",
  "MIDI IN": "MIDI 장비 연결(DIN 5핀)",
  "DMX OUT": "조명기로 DMX 신호를 보낸다. 3핀 XLR",
  AUDIO: "소리에 맞춰 움직일 때 쓰는 음향 입력. RCA(Cinch)",
  REMOTE: "BLACK OUT·FULL ON 원격 스위치. 6.35mm 스테레오 잭",
  "FOG MACHINE": "포그 머신 연결(DIN 5핀)",
};
const POWER = "POWER";

/* ── 윗면 좌표 ──────────────────────────────────────── */

/** 채널 n(1–24)의 가로 자리 */
const channelX = (index: number) => 40.3 + index * 20.08;
const CHANNELS = Array.from({ length: 24 }, (_, index) => index);

/** 조작부 다섯 줄의 가로 자리 */
const COLUMNS = [544.8, 578, 608.5, 642.4, 673.6];
const ROW = { edit: 207.5, program: 172.2, run: 124.7, output: 27.8 };

/** 페이더 눈금: 0과 10의 자리 */
const A_ZERO = 175.9;
const A_TEN = 216.3;
const B_ZERO = 52.5;
const B_TEN = 92.5;

/* ── 몸통 ───────────────────────────────────────────── */

/** 아래에서 위로 읽는 글자(옆으로 세운 인쇄) */
function textUp(sc: Scene, on: Plane, [X, s]: number[], text: string, size: number, tone = "lo") {
  const origin = sc.at(on.at(X, s, INLAY + 0.05));
  const right = sc.at(on.at(X, s + 1, INLAY + 0.05));
  const down = sc.at(on.at(X + 1, s, INLAY + 0.05));
  const matrix = [right[0] - origin[0], right[1] - origin[1], down[0] - origin[0], down[1] - origin[1], origin[0], origin[1]].map((value) => Math.round(value * 1000) / 1000);
  return `<text class="iso-face-text" data-tone="${tone}" transform="matrix(${matrix.join(" ")})" font-size="${size}" text-anchor="middle">${text}</text>`;
}

function body(sc: Scene) {
  const front = sc.view === "front";
  sc.halo(0);
  for (const [X, Y] of [[50, 30], [WIDTH - 50, 30], [50, DEPTH - 30], [WIDTH - 50, DEPTH - 30]]) sc.round("stand.foot", FLOOR, [X, Y], 10, [0, FOOT], { tone: "lo" });
  sc.box("chassis", FLOOR, [EAR, WIDTH - EAR], [0, DEPTH], [FOOT, FOOT + BODY], { tone: "mid" }, { r: 1.5 });

  const marks: string[] = [];
  // 랙 고정 구멍: 양옆으로 나온 윗판에 둘씩
  const slot = (X: number, Y: number) => sc.line(sc.lineOn(TOP, [[X - 4.5, Y - 2.8], [X + 4.5, Y - 2.8], [X + 4.5, Y + 2.8], [X - 4.5, Y + 2.8]], 0, true), { tone: "lo" });
  for (const X of [9.5, WIDTH - 9.5]) for (const Y of [229.5, 37.3]) marks.push(slot(X, Y));
  if (front) {
    // 페이더 구역 판 둘과 조작부 판의 테두리
    marks.push(sc.line(sc.rectOn(TOP, [23.1, 518], [137.3, 255.3]), { tone: "faint" }));
    marks.push(sc.line(sc.rectOn(TOP, [23.1, 518], [10.8, 136.3]), { tone: "faint" }));
    marks.push(sc.line(sc.rectOn(TOP, [527.9, 692.3], [8.5, 255.9]), { tone: "faint" }));
    marks.push(textUp(sc, TOP, [12.4, 135], "BOTEX", 8, "mid"));
    marks.push(textUp(sc, TOP, [27.4, 196], "PRESET A", 3));
    marks.push(textUp(sc, TOP, [27.4, 72], "PRESET B", 3));
    marks.push(sc.textOn(TOP, [610, 249.4], "SCENE SETTER-48", { size: 6, tone: "mid", h: 0.05 }));
    marks.push(sc.textOn(TOP, [571.3, 244.6], "DC-2448", { size: 3.4, tone: "mid", h: 0.05, anchor: "start" }));
    marks.push(sc.textOn(TOP, [598.4, 244.6], "48CH Dimmer Console", { size: 3, h: 0.05, anchor: "start" }));
  }
  sc.box("plate", TOP, [0, WIDTH], [0, DEPTH], [-PLATE_T, 0], { tone: "mid" }, { r: 4, extra: marks.join("") });
}

/* ── 윗면 부품 ──────────────────────────────────────── */

/** 구역 판. 그 구역의 이름을 갖고, 표시등·눈금 같은 인쇄를 얹는다 */
function zone(sc: Scene, name: string, X: number[], Y: number[], spot: string, extra = "") {
  sc.box(`zone.${name}`, TOP, X, Y, [0, INLAY], { tone: "lo", crease: "none" }, { r: 1.5, spot, extra });
}

const text = (sc: Scene, [X, Y]: number[], value: string, size = 2.2, anchor = "middle") => (sc.view === "front" ? sc.textOn(TOP, [X, Y - size * 0.36], value, { size, h: INLAY + 0.05, anchor }) : "");

/** 표시등: 테와 가운데 점 */
const leds = (sc: Scene, points: number[][]) => sc.line(points.map((point) => sc.ringOn(TOP, point, 1.6, INLAY)).join(""), { tone: "lo" }) + sc.dots(TOP, points, INLAY, { size: 0.5 });

/**
 * 페이더 홈과 눈금. 눈금은 홈 오른쪽(`side` 1) 또는 왼쪽(-1)에 붙고, 홈 테두리에서 세로 자까지 간다.
 * `labels`는 0 → 10 차례의 눈금 글자다.
 */
function fader(sc: Scene, X: number, [zero, ten]: number[], [bottom, top]: number[], sides: Array<{ side: number; labels?: string[]; every?: number; size?: number }>) {
  const parts = [sc.line(sc.rectOn(TOP, [X - 1.2, X + 1.2], [bottom, top], INLAY), { tone: "lo" })];
  for (const { side, labels, every = 2, size = 2 } of sides) {
    const ticks = Array.from({ length: 11 }, (_, index) => zero + ((ten - zero) * index) / 10);
    const [near, far] = [X + side * 1.2, X + side * 4.6];
    parts.push(sc.line([sc.lineOn(TOP, [[far, zero], [far, ten]], INLAY), ...ticks.map((Y) => sc.lineOn(TOP, [[near, Y], [far, Y]], INLAY))].join(""), { tone: "lo" }));
    if (labels) {
      labels.forEach((value, index) => {
        if (value && index % every === 0) parts.push(text(sc, [X + side * 5.4, ticks[index]], value, size, side > 0 ? "start" : "end"));
      });
    }
  }
  return parts.join("");
}

const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

/** 페이더 손잡이: 길쭉한 둥근 상자와 윗면의 가로 홈 */
function knob(sc: Scene, X: number, Y: number, spot: string) {
  const ribs = Array.from({ length: 9 }, (_, index) => Y - 5.6 + index * 1.4).map((s) => sc.lineOn(TOP, [[X - 4.75, s], [X + 4.75, s]], INLAY + 8));
  sc.box("fader.knob", TOP, [X - 4.75, X + 4.75], [Y - 8.8, Y + 8.8], [INLAY, INLAY + 8], { tone: "mid" }, { r: 2.4, spot, extra: sc.line(ribs.join(""), { tone: "lo" }) });
}

/** 네모 버튼 */
function button(sc: Scene, name: string, [X, Y]: number[], side: number, spot: string) {
  sc.box(name, TOP, [X - side / 2, X + side / 2], [Y - side / 2, Y + side / 2], [INLAY, INLAY + 2.2], { tone: "mid" }, { r: 1.8, spot });
}

function faderArea(sc: Scene) {
  /* PRESET A */
  zone(sc, "preset-a", [32.5, 509.5], [233.9, 247.5], AREA.presetA, leds(sc, CHANNELS.map((index) => [channelX(index), 237.6])) + CHANNELS.map((index) => text(sc, [channelX(index), 243.9], `${index + 1}`)).join(""));
  zone(sc, "faders-a", [32.5, 509.5], [165.4, 225.4], AREA.fadersA, CHANNELS.map((index) => fader(sc, channelX(index), [A_ZERO, A_TEN], [169.5, 222.7], [{ side: 1, labels: NUMBERS }])).join(""));
  for (const index of CHANNELS) knob(sc, channelX(index), A_ZERO, AREA.fadersA);
  zone(sc, "flash-a", [32.5, 509.5], [142.4, 161], AREA.flashA);
  for (const index of CHANNELS) button(sc, "flash.button", [channelX(index), 151.9], 12.2, AREA.flashA);

  /* PRESET B와 장면 표시등 */
  zone(sc, "preset-b", [32.5, 509.5], [122, 132.2], AREA.presetB, leds(sc, CHANNELS.map((index) => [channelX(index), 124.4])) + CHANNELS.map((index) => text(sc, [channelX(index), 129.4], `${index + 25}`)).join(""));
  const scenes = leds(sc, CHANNELS.map((index) => [channelX(index), 114.2])) + CHANNELS.map((index) => text(sc, [channelX(index), 118.6], `${index + 1}`, 1.8)).join("") + text(sc, [270, 108.6], "SCENES", 2.6);
  zone(sc, "scenes", [35.5, 507], [106.4, 120.2], AREA.scenes, scenes);
  zone(sc, "faders-b", [32.5, 509.5], [41.4, 101.7], AREA.fadersB, CHANNELS.map((index) => fader(sc, channelX(index), [B_ZERO, B_TEN], [45.4, 98.6], [{ side: 1, labels: NUMBERS }])).join(""));
  for (const index of CHANNELS) knob(sc, channelX(index), B_ZERO, AREA.fadersB);
  zone(sc, "flash-b", [32.5, 509.5], [18.6, 37.3], AREA.flashB);
  for (const index of CHANNELS) button(sc, "flash.button", [channelX(index), 28.1], 12.2, AREA.flashB);
}

function controlArea(sc: Scene) {
  const [, , c3, c4, c5] = COLUMNS;

  /* 표시창 */
  const indicator = [239, 233.2, 227.1, 221.4];
  const digits = [619.6, 626.2, 632.8].map((X) => sc.line(sc.lineOn(TOP, [[X - 2.2, 226.8], [X + 2.2, 226.8], [X + 2.2, 234.4], [X - 2.2, 234.4]], INLAY + 0.05, true) + sc.lineOn(TOP, [[X - 2.2, 230.6], [X + 2.2, 230.6]], INLAY + 0.05), { tone: "lo" })).join("");
  const display =
    leds(sc, indicator.map((Y) => [595, Y])) +
    ["REC STEP", "DIMMER", "SPEED TIME", "FADE TIME"].map((value, index) => text(sc, [591.4, indicator[index]], value, 1.9, "end")).join("") +
    // 표시등 넷을 묶어 표시창을 가리키는 선
    sc.line(sc.lineOn(TOP, [[596.6, 239], [604, 239], [604, 221.4], [596.6, 221.4]], INLAY) + sc.lineOn(TOP, [[596.6, 233.2], [604, 233.2]], INLAY) + sc.lineOn(TOP, [[596.6, 227.1], [604, 227.1]], INLAY) + sc.lineOn(TOP, [[604, 230.5], [615, 230.5]], INLAY), { tone: "lo" }) +
    sc.patchOn(TOP, [615, 637.4], [223.7, 237.3], INLAY) +
    sc.line(sc.rectOn(TOP, [615, 637.4], [223.7, 237.3], INLAY), { tone: "lo" }) +
    digits;
  zone(sc, "display", [584, 640], [219.5, 242], AREA.display, display);

  /* 포그 머신 */
  const fogMarks = leds(sc, [[654.3, 238], [662.8, 238]]) + text(sc, [666, 243.4], "HEATING", 2) + text(sc, [672.5, 238], "READY", 2) + text(sc, [672.5, 230.4], "FOG", 2) + text(sc, [672.5, 226.6], "MACHINE", 2);
  zone(sc, "fog", [649.9, 682.1], [220.3, 245.8], AREA.fog, fogMarks);
  sc.round("fog.button", TOP, [657.4, 228.8], 6.4, [INLAY, INLAY + 3.4], { tone: "mid" }, { spot: AREA.fog });

  /* 버튼 줄 */
  const row = (name: string, Y: number, spot: string, X0: number, X1: number, Y0: number, Y1: number, extra: string) => {
    zone(sc, name, [X0, X1], [Y0, Y1], spot, extra);
    for (const X of COLUMNS) button(sc, `${name}.button`, [X, Y], 13, spot);
  };
  const above = (Y: number, names: string[][]) => names.map((lines, index) => lines.map((value, line) => text(sc, [COLUMNS[index], Y + (lines.length - 1 - line) * 2.5], value, lines.length > 1 ? 1.8 : 2)).join("")).join("");
  const below = (Y: number, names: string[][]) => names.map((lines, index) => lines.map((value, line) => text(sc, [COLUMNS[index], Y - line * 3], value, 2)).join("")).join("");

  row(
    "edit",
    ROW.edit,
    AREA.edit,
    533,
    688,
    186,
    219.4,
    above(217.6, [["DOWN"], ["UP"], ["DELETE"], ["INSERT"], ["EDIT"]]) +
      below(198.3, [["BEAT REV"], ["CHASE REV"], ["REV ONE"], ["% OR 0-255"], ["ALL REV"]]) +
      leds(sc, [[600.1, 190.5], [605.8, 190.5], [612, 190.5], [618.1, 190.5], [c4, 190.5], [c5, 190.5]]) +
      ["1", "2", "3", "4"].map((value, index) => text(sc, [[600.1, 605.8, 612, 618.1][index], 187.1], value, 1.8)).join(""),
  );
  row(
    "program",
    ROW.program,
    AREA.program,
    533,
    688,
    155,
    185.9,
    above(181.8, [["DARK"], ["MODE", "SELECT"], ["PAGE"], ["ADD", "KILL"], ["RECORD"]]) + below(162.7, [["REC SPEED"], [], ["REC", "CLEAR"], ["REC", "EXIT"], ["SHIFT"]]),
  );
  // 운용 방식 표시등과 체이스 방식 표시등
  const modes = [146.4, 140.7, 134.6];
  const runMarks =
    leds(sc, [...modes.map((Y) => [560.1, Y]), [607.5, 152.5], [607.5, 146.4], [c3, 140.7], [c4, 140.7], [c5, 140.7], [636.3, 113.6], [649.2, 113.6]]) +
    text(sc, [548.6, modes[0]], "CHNS", 1.9, "end") +
    text(sc, [563, modes[0]], "SCENES", 1.9, "start") +
    text(sc, [541, modes[1]], "A", 1.9) +
    text(sc, [556.6, modes[1]], "DOUBLE", 1.4, "end") +
    text(sc, [563, modes[1]], "PRESET  B", 1.4, "start") +
    text(sc, [540, modes[2]], "1-48", 1.9) +
    text(sc, [556.6, modes[2]], "SINGLE", 1.4, "end") +
    text(sc, [563, modes[2]], "PRESET  PARK", 1.4, "start") +
    text(sc, [610.4, 152.5], "SINGLE CHASE", 1.8, "start") +
    text(sc, [610.4, 146.4], "MIX CHASE", 1.8, "start") +
    text(sc, [c3, 134.2], "HOLD", 2) +
    text(sc, [c4, 134.2], "STEP", 2) +
    text(sc, [c5, 134.2], "AUDIO", 2) +
    text(sc, [633.8, 113.6], "5MIN", 1.8, "end") +
    text(sc, [651.8, 113.6], "10MIN", 1.8, "start");
  row("run", ROW.run, AREA.run, 533, 688, 110, 155, runMarks);

  /* 페이더 다섯 */
  const fadeLabels = ["10m", "5m", "2m", "1m", "30s", "10s", "5s", "2s", "1s", ".5s", ".2s"];
  const speedRight = ["10m", "5m", "2m", "1m", "20s", "10s", "5s", "2s", "1s", ".2s", ".1SEC"];
  const speedLeft = ["5m", "2m", "1m", "30s", "10s", "5s", "2s", "1s", ".5s", ".2s", ".1SEC"];
  const reversed = [...NUMBERS].reverse();
  const masters =
    fader(sc, 548.2, [B_ZERO, B_TEN], [45.8, 97.6], [{ side: -1, labels: NUMBERS }]) +
    fader(sc, 574.6, [B_ZERO, B_TEN], [45.8, 97.6], [{ side: 1, labels: reversed }]) +
    // 두 마스터 사이의 크로스페이드 그림
    sc.line(sc.rectOn(TOP, [554.4, 568.4], [52.5, 92.5], INLAY) + sc.lineOn(TOP, [[556.8, 52.5], [566, 92.5]], INLAY), { tone: "lo" }) +
    text(sc, [561.4, 105.1], "MASTER", 2.4) +
    text(sc, [548.2, 41.6], "A", 2) +
    text(sc, [574.6, 41.6], "B", 2);
  zone(sc, "masters", [535, 590], [38.5, 108], AREA.masters, masters);
  const timing =
    fader(sc, c3, [B_ZERO, B_TEN], [45.8, 97.6], [{ side: -1, labels: fadeLabels, every: 1, size: 1.5 }]) +
    fader(sc, c4, [B_ZERO, B_TEN], [45.8, 97.6], [{ side: -1, labels: speedLeft, every: 1, size: 1.5 }, { side: 1, labels: speedRight, every: 1, size: 1.5 }]) +
    text(sc, [c3, 105.1], "FADE", 2.4) +
    text(sc, [c4, 105.1], "SPEED", 2.4) +
    text(sc, [c3 - 5.4, 96.4], "INSTANT", 1.5, "end");
  zone(sc, "timing", [594, 657], [38.5, 108], AREA.timing, timing);
  const audio = fader(sc, c5, [B_ZERO, B_TEN], [45.8, 97.6], [{ side: -1, labels: NUMBERS }, { side: 1, labels: NUMBERS }]) + text(sc, [c5, 105.1], "AUDIO LEVEL", 2.4);
  zone(sc, "audio-level", [660, 688], [38.5, 108], AREA.audioLevel, audio);
  knob(sc, 548.2, B_ZERO, AREA.masters);
  knob(sc, 574.6, B_ZERO, AREA.masters);
  knob(sc, c3, 49.2, AREA.timing);
  knob(sc, c4, 49.2, AREA.timing);
  knob(sc, c5, 55.3, AREA.audioLevel);

  /* 맨 아랫줄 */
  const outputMarks = below(16.9, [["BLIND"], ["HOME"], ["TAP SYNC"], ["FULL-ON"], ["BLACK OUT"]]) + leds(sc, [[658.4, 30.5]]) + sc.line(sc.lineOn(TOP, [[660, 30.5], [c5 - 6.5, 30.5]], INLAY), { tone: "lo" });
  row("output", ROW.output, AREA.output, 533, 688, 12, 37, outputMarks);
}

/* ── 뒷면 ───────────────────────────────────────────── */

/** 뒤에서 본 왼쪽 → 오른쪽 거리(매뉴얼 13쪽 그림의 가로) → 장비 X */
const U = (u: number) => WIDTH - u;

function rearPanel(sc: Scene) {
  // 단자 가운데의 높이는 뒷면 그림에서 바닥부터 잰 값이다
  const Z = FOOT + 17;
  const DIN_Z = FOOT + 18;
  const XLR_Z = FOOT + 21;
  const LABEL = FOOT + 3.4;
  const FACE = 0.5;
  const label = (u: number, z: number, value: string, size = 3) => sc.textOn(REAR, [U(u), z], value, { size, h: FACE + 0.05 });
  const printed = [
    label(94.2, LABEL, "POWER"),
    label(115.1, LABEL, "DC IN"),
    sc.textOn(REAR, [U(108), Z - 6], "+", { size: 2.4, h: FACE + 0.05 }),
    label(138.4, FOOT + 5.6, "THRU", 2.4),
    label(159.9, FOOT + 5.6, "OUT", 2.4),
    label(181.1, FOOT + 5.6, "IN", 2.4),
    label(159.9, FOOT + 2.4, "MIDI", 2.6),
    label(217, LABEL, "DMX OUT"),
    label(263.7, LABEL, "AUDIO"),
    label(289, LABEL, "REMOTE"),
    label(314.7, LABEL, "FOG MACHINE"),
  ];
  // DMX OUT의 나사 둘은 뒷면 판에 박혀 있어 판과 함께 그린다
  const screws = C.xlrFemale(sc, REAR, [U(217), XLR_Z], FACE, "DMX OUT");
  sc.box("rear.face", REAR, [EAR + 2, WIDTH - EAR - 2], [FOOT + 1.2, FOOT + BODY - 1.2], [0, FACE], { tone: "lo", crease: "none" }, { extra: printed.join("") + screws });

  // 전원 스위치: 네모 테와 시소 스위치
  sc.box("rear.power", REAR, [U(102.7), U(85.7)], [Z - 6.5, Z + 6.5], [FACE, FACE + 1.2], { tone: "mid" }, { r: 1, spot: POWER });
  sc.box("rear.power.rocker", REAR, [U(100.2), U(88.2)], [Z - 4.5, Z + 4.5], [FACE + 1.2, FACE + 4], { tone: "hi" }, {
    r: 0.8,
    spot: POWER,
    extra: sc.line(sc.lineOn(REAR, [[U(94.2), Z - 4.5], [U(94.2), Z + 4.5]], FACE + 4), { tone: "lo" }),
  });

  // DC IN: 아래에 나사가 있는 길쭉한 받침과 둥근 잭
  sc.box("rear.dc.flange", REAR, [U(123.1), U(107.1)], [Z - 15.5, Z + 12.5], [FACE, FACE + 1], { tone: "mid" }, { r: 7, spot: "DC IN", extra: C.screw(sc, REAR, [U(115.1), Z - 11], FACE + 1) });
  C.roundJack(sc, REAR, [U(115.1), Z + 1.5], FACE + 1, 5.6, "DC IN", "rear.dc");

  for (const [u, name] of [[138.4, "MIDI THRU"], [159.9, "MIDI OUT"], [181.1, "MIDI IN"], [314.7, "FOG MACHINE"]] as const) C.din5(sc, REAR, [U(u), DIN_Z], FACE, name, "rear.din");
  C.roundJack(sc, REAR, [U(263.7), Z], FACE, 4.6, "AUDIO", "rear.rca");
  C.roundJack(sc, REAR, [U(289), Z], FACE, 5.6, "REMOTE", "rear.jack");
}

/* ── 조립 ───────────────────────────────────────────── */

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    name: "dc-2448",
    view,
    width: 760,
    height: front ? 420 : 210,
    azimuth: front ? 84 : 82,
    elevation: front ? 56 : 12,
    pad: 20,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, 0, 0], [WIDTH, 0, 0], [0, DEPTH, 0], [WIDTH, DEPTH, 0],
      [0, 0, TALL + 9], [WIDTH, 0, TALL + 9], [0, DEPTH, TALL + 9], [WIDTH, DEPTH, TALL + 9],
    ],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((key) => sc.spot(AREA[key], "area", NOTES[key]));
  } else {
    for (const name of DC_2448_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(POWER, "area", "전원 스위치");
  }

  body(sc);
  if (front) {
    faderArea(sc);
    controlArea(sc);
  } else {
    rearPanel(sc);
  }

  return sc.finish(
    front
      ? "위에서 내려다본 Botex DC-2448. 왼쪽 넓은 자리에 채널 페이더가 24개씩 두 줄 있고, 줄마다 표시등과 FLASH 버튼이 딸려 있다. 오른쪽 조작부에 표시창, 포그 머신 버튼, 버튼 20개, 마스터·FADE·SPEED·AUDIO LEVEL 페이더가 있다."
      : "뒤에서 본 Botex DC-2448. 왼쪽부터 POWER 스위치, DC IN, MIDI THRU·OUT·IN, DMX OUT, AUDIO, REMOTE, FOG MACHINE 단자가 있다.",
  );
}

export const DC_2448_FIGURE: DeviceFigure = {
  id: "조명 콘솔",
  slug: "dc-2448",
  model: "Botex DC-2448",
  source: "Thomann DC-2448 Light Operator User Manual (2024, V2) 10–13·27쪽",
  caveat: "매뉴얼의 그림과 치수를 보고 단순화해 그렸다. 매뉴얼에 옆모습이 없어 윗면은 평평하게 그렸고, 몸통 높이(약 47mm)는 뒷면 그림의 비율로 잰 값이다. 사양의 높이 80mm와는 다르다. 고무 발의 자리는 그림에 없어 추정이다. 랙에 달 때 떼는 플라스틱 판은 그림에 없어 그리지 않았다.",
  views: [build("front"), build("back")],
  ports: DC_2448_PORTS,
  aliases: {},
};
