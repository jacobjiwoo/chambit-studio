/**
 * 무선 마이크 수신기(Shure QLXD4)의 생김새 그림. 앞 시점은 화면과 버튼, 뒤 시점은 단자다.
 * 방송실에는 이 수신기가 여섯 대 있고, 장비 행 "무선 마이크 수신기 1~4"와 "무선 마이크 수신기 5~6"이
 * 이 그림 하나를 같이 쓴다.
 *
 * 근거는 Shure "QLX-D Wireless System" 사용 설명서 8.2판의 앞·뒷면 그림(11–12쪽), 바닥 발 그림(7쪽),
 * 치수(47쪽: 41 × 197 × 151mm, H × W × D)다. 부품의 자리는 앞·뒷면 그림에서 재서 mm로 옮겼다.
 *
 * 좌표는 장비 좌표다. X: 앞에서 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Plane, type Scene, type ViewKey } from "./device-figure";

const WIDTH = 197;
const DEPTH = 151;
const TALL = 41;
/** 바닥 발 두께. 매뉴얼에 없어 얇게 잡았다 */
const FOOT = 1.5;
/** 앞 베젤 두께 */
const BEZEL = 3;

const FLOOR = plane(0, 0, 0);
const FRONT = plane(0, 0, 90);
const REAR = plane(DEPTH, 0, 90, true);

/** 앞면 구역(매뉴얼 11쪽 ①–⑩) */
const AREA = {
  display: "Display",
  arrows: "Arrow Buttons",
  enter: "Enter Button",
  sync: "Sync Button",
  power: "Power Switch",
  audio: "Audio LED",
  menu: "Menu Button",
  rf: "RF LED",
  ir: "IR Window",
  syncLed: "Sync LED",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  arrows: "게인을 올리고 내리거나 메뉴 값을 바꾼다",
  audio: "초록은 정상, 노랑은 리미터에 가까움, 빨강은 리미터가 동작 중",
  rf: "송신기와 RF로 이어져 있으면 켜진다",
  ir: "IR sync 때 송신기의 IR 창과 마주 댄다",
  syncLed: "깜박이면 IR sync 대기, 켜져 있으면 송신기와 맞춰짐",
};

/** 뒷면 단자(매뉴얼 12쪽 ⑫·⑬·⑮·⑰·⑱). 뒤에서 본 왼쪽부터다 */
export const QLXD4_PORTS: string[] = ["Power Supply Jack", "Ethernet Port", "Antenna Connector B", "XLR Audio Output", '1/4" Instrument/Auxiliary Output', "Antenna Connector A"];
const PORT_NOTES: Record<string, string> = {
  "Power Supply Jack": "12V DC 어댑터",
  "Ethernet Port": "주황 LED는 속도, 초록 LED는 네트워크 연결",
  "Antenna Connector B": "BNC. 뒷면에 antenna B로 인쇄돼 있다",
  "XLR Audio Output": "밸런스 출력. 레벨은 옆 mic / line 스위치로 고른다",
  '1/4" Instrument/Auxiliary Output': "악기·보조 출력",
  "Antenna Connector A": "BNC. 뒷면에 antenna A로 인쇄돼 있다",
};
const STRAIN = "Power Cord Strain Relief";
const RESET = "Receiver Reset";
const MIC_LINE = "Mic/Line Switch";

/** 볼록 껍질. XLR 받침판처럼 원 몇 개를 감싼 모양을 만든다 */
function hull(points: number[][]): number[][] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: number[][]) => {
    const out: number[][] = [];
    for (const point of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], point) <= 0) out.pop();
      out.push(point);
    }
    out.pop();
    return out;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}
const circle = ([X, s]: number[], r: number, steps = 24) => Array.from({ length: steps }, (_, index) => [X + r * Math.cos((index / steps) * 2 * Math.PI), s + r * Math.sin((index / steps) * 2 * Math.PI)]);

function body(sc: Scene) {
  sc.halo(0);
  // 바닥 발(매뉴얼 7쪽 Installing Footpads)
  for (const [X, Y] of [[22, 20], [WIDTH - 22, 20], [22, DEPTH - 20], [WIDTH - 22, DEPTH - 20]]) sc.round("stand.foot", FLOOR, [X, Y], 6, [0, FOOT], { tone: "lo" });
  // 강철 덮개. 앞 베젤보다 조금 안쪽에 있다
  sc.box("chassis", FLOOR, [0.8, WIDTH - 0.8], [BEZEL, DEPTH], [FOOT, TALL - 0.8], { tone: "mid" }, { r: 1, steps: 3 });
}

/** 앞면에 박힌 작은 표시등 */
function led(sc: Scene, X: number, z: number, spot: string) {
  sc.box("front.led", FRONT, [X - 2.6, X + 2.6], [z - 0.95, z + 0.95], [FACE_FRONT, FACE_FRONT + 0.5], { tone: "mid" }, { r: 0.9, spot });
}
const FACE_FRONT = 0.4;

/** 앞면 버튼. 윗면에 인쇄된 이름이 있다 */
function key(sc: Scene, X: number, z: number, spot: string, label: string | ((on: Plane, h: number) => string)) {
  const top = FACE_FRONT + 1.8;
  const print = typeof label === "string" ? sc.textOn(FRONT, [X, z - 0.75], label, { size: 2.1, tone: "mid", h: top + 0.05 }) : label(FRONT, top + 0.05);
  sc.box("front.key", FRONT, [X - 4.45, X + 4.45], [z - 2.75, z + 2.75], [FACE_FRONT, top], { tone: "hi" }, {
    r: 1.3,
    spot,
    extra: sc.line(sc.rectOn(FRONT, [X - 3.6, X + 3.6], [z - 1.9, z + 1.9], top), { tone: "faint" }) + print,
  });
}

function frontPanel(sc: Scene) {
  const text = (X: number, z: number, value: string, size = 1.6, anchor = "middle", tone = "lo") => sc.textOn(FRONT, [X, z], value, { size, h: 0.05, anchor, tone });
  const printed = [
    text(17.8, 33.6, "SHURE", 5.6, "middle", "mid"),
    text(4.4, 29.6, "QLXD4", 2.6, "start", "mid"),
  ];
  // 베젤: 앞에서 본 모서리가 둥글다
  sc.box("front.bezel", FRONT, [0, WIDTH], [0, TALL], [-BEZEL, 0], { tone: "mid" }, { r: 3.5, steps: 4, extra: printed.join("") });

  // 화면과 버튼을 두른 창틀(매뉴얼 그림의 회색 테)
  const lamps = [[120.8, "audio"], [133.9, "rf"], [146.5, "ir"]] as const;
  sc.box("front.frame", FRONT, [53.3, 155], [8.3, 34.7], [0, FACE_FRONT], { tone: "lo", crease: "none" }, {
    r: 1.6,
    extra: lamps.map(([X, value]) => sc.textOn(FRONT, [X, 18.4], value, { size: 1.6, h: FACE_FRONT + 0.05 })).join(""),
  });
  // 화면. 내용은 그리지 않는다
  sc.box("front.display", FRONT, [56.3, 108], [10.2, 32.7], [FACE_FRONT, FACE_FRONT + 0.3], { tone: "lo", crease: "none" }, {
    r: 0.8,
    spot: AREA.display,
    extra: sc.patchOn(FRONT, [57.8, 106.5], [11.7, 31.2], FACE_FRONT + 0.3) + sc.line(sc.rectOn(FRONT, [57.8, 106.5], [11.7, 31.2], FACE_FRONT + 0.3), { tone: "lo" }),
  });

  // 화살표 버튼: 인쇄된 갈매기표. 글자를 대신하는 줄이라 면 위에서 끝난다
  const chevron = (z: number, up: boolean) => (on: Plane, h: number) =>
    sc.line(sc.lineOn(on, [[117.6, z + (up ? -0.9 : 0.9)], [120.5, z + (up ? 0.9 : -0.9)], [123.4, z + (up ? -0.9 : 0.9)]], h), { tone: "mid", free: true });
  key(sc, 120.5, 27.3, AREA.arrows, chevron(27.3, true));
  key(sc, 120.5, 14.4, AREA.arrows, chevron(14.4, false));
  key(sc, 133.2, 27.3, AREA.menu, "menu");
  key(sc, 133.2, 14.4, AREA.enter, "enter");
  key(sc, 145.7, 14.4, AREA.sync, "sync");
  led(sc, 120.8, 21.4, AREA.audio);
  led(sc, 133.9, 21.4, AREA.rf);
  led(sc, 146.5, 21.4, AREA.syncLed);

  // IR 창: 빗금이 인쇄된 어두운 창
  const hatch = [-2.2, 0, 2.2].map((dx) => sc.lineOn(FRONT, [[146.9 + dx - 1, 26.4], [146.9 + dx + 1, 29.8]], FACE_FRONT + 0.3)).join("");
  sc.box("front.ir", FRONT, [142.5, 151.4], [25.4, 30.8], [FACE_FRONT, FACE_FRONT + 0.3], { tone: "lo", crease: "none" }, {
    r: 1,
    spot: AREA.ir,
    extra: sc.patchOn(FRONT, [143.3, 150.6], [26.2, 30], FACE_FRONT + 0.3) + sc.line(hatch, { tone: "mid", free: true }),
  });

  // 전원 스위치: 둥근 테와 누름 버튼. 버튼 위의 전원 표시는 인쇄라 면 위에서 끝난다
  const POWER = [175.1, 20.4];
  sc.round("front.power.ring", FRONT, POWER, 7.4, [0, 0.8], { tone: "lo" }, { spot: AREA.power });
  sc.round("front.power", FRONT, POWER, 4.6, [0.8, 2.6], { tone: "hi" }, {
    spot: AREA.power,
    extra:
      sc.line(sc.ringOn(FRONT, POWER, 3.6, 2.6), { tone: "faint" }) +
      sc.line(sc.ringOn(FRONT, POWER, 1.6, 2.6) + sc.lineOn(FRONT, [[POWER[0], POWER[1] + 0.2], [POWER[0], POWER[1] + 2.4]], 2.6), { tone: "mid", free: true }),
  });
}

/** 뒤에서 본 왼쪽 → 오른쪽 거리(매뉴얼 12쪽 그림의 가로) → 장비 X */
const U = (u: number) => WIDTH - u;
const uu = (u0: number, u1: number) => [U(u1), U(u0)];
const FACE = 0.5;

/** 덮개 뒤 끝의 테. 나사 자리마다 U자로 파였다 */
function coverEdge(sc: Scene) {
  const Z = 38.6;
  const points: number[][] = [[U(0.8), Z]];
  for (const u of [70.3, 143.6]) {
    points.push([U(u - 6.4), Z]);
    for (let index = 0; index <= 12; index++) {
      const t = Math.PI + (index / 12) * Math.PI;
      points.push([U(u + 3.8 * Math.cos(t)), 36.2 + 3.8 * Math.sin(t)]);
    }
    points.push([U(u + 6.4), Z]);
  }
  points.push([U(WIDTH - 0.8), Z]);
  return sc.line(sc.lineOn(REAR, points), { tone: "lo" });
}

function rearPanel(sc: Scene) {
  const text = (u: number, z: number, value: string, size = 2.4, anchor = "middle", tone = "lo") => sc.textOn(REAR, [U(u), z], value, { size, h: 0.05, anchor, tone });
  const printed = [
    text(3.8, 33.4, "SHURE", 4.4, "start", "faint"),
    text(25.6, 33.4, "QLXD4", 3.4, "start", "faint"),
    text(21.9, 2.6, "power"),
    text(21.9, 20.2, "–  ●  +", 1.8),
    text(53.2, 14.4, "reset", 2.2),
    text(64.4, 2.6, "antenna B"),
    text(99, 2.6, "mic / line"),
    text(143.6, 2.6, "inst / aux"),
    text(174.6, 2.6, "antenna A"),
    coverEdge(sc),
    ...[70.3, 143.6].map((u) => C.screw(sc, REAR, [U(u), 36.2], 0)),
    // mic / line 스위치가 XLR 출력에 걸린다는 인쇄 선
    sc.line(sc.lineOn(REAR, [[U(104.4), 13], [U(107.4), 13], [U(107.4), 18.8], [U(108.4), 18.8]]), { tone: "faint" }),
  ];
  sc.box("rear.face", REAR, [U(WIDTH - 0.8), U(0.8)], [FOOT + 0.6, TALL - 1.4], [0, FACE], { tone: "lo", crease: "none" }, { extra: printed.join("") });

  // 전원선 고리
  sc.box("rear.strain", REAR, uu(3.8, 10.7), [11, 26.5], [FACE, FACE + 4], { tone: "mid" }, {
    r: 1.4,
    spot: STRAIN,
    extra: sc.line(sc.lineOn(REAR, [[U(3.8), 15.2], [U(10.7), 15.2]], FACE + 4) + sc.lineOn(REAR, [[U(3.8), 22.4], [U(10.7), 22.4]], FACE + 4), { tone: "lo" }),
  });

  // 전원 단자: 네모난 받침과 둥근 구멍
  sc.box("rear.power", REAR, uu(17, 26.8), [6.8, 18.2], [FACE, FACE + 1.4], { tone: "mid" }, {
    r: 0.6,
    spot: "Power Supply Jack",
    extra: sc.line(sc.ringOn(REAR, [U(21.9), 12.5], 1.6, FACE + 1.4), { tone: "lo" }) + sc.dots(REAR, [[U(21.9), 12.5]], FACE + 1.4, { size: 0.5 }),
  });

  // Ethernet: 걸쇠 홈이 위에 있고 표시등 둘이 아래에 있다
  const [EX, EZ] = [U(38.9), 14.6];
  const jack = [[EX - 6, EZ - 4.4], [EX + 6, EZ - 4.4], [EX + 6, EZ + 3.4], [EX + 3.2, EZ + 3.4], [EX + 3.2, EZ + 5.6], [EX - 3.2, EZ + 5.6], [EX - 3.2, EZ + 3.4], [EX - 6, EZ + 3.4]];
  sc.box("rear.ethernet", REAR, uu(30.1, 47.7), [6.8, 22.3], [FACE, FACE + 1.4], { tone: "mid" }, {
    r: 0.6,
    spot: "Ethernet Port",
    extra:
      sc.line(sc.lineOn(REAR, jack, FACE + 1.4, true), { tone: "lo" }) +
      sc.line(sc.rectOn(REAR, [EX - 6.4, EX - 3.8], [EZ - 6.6, EZ - 5.2], FACE + 1.4) + sc.rectOn(REAR, [EX + 3.8, EX + 6.4], [EZ - 6.6, EZ - 5.2], FACE + 1.4), { tone: "lo" }),
  });

  sc.round("rear.reset", REAR, [U(53.3), 11.2], 1.3, [FACE, FACE + 0.4], { tone: "mid" }, { spot: RESET, extra: sc.dots(REAR, [[U(53.3), 11.2]], FACE + 0.4, { size: 0.6 }) });

  C.bnc(sc, REAR, [U(64.4), 13.1], FACE, "Antenna Connector B");
  C.bnc(sc, REAR, [U(174.6), 13.1], FACE, "Antenna Connector A");

  // mic / line 밀어 바꾸는 스위치
  sc.box("rear.micline", REAR, uu(93.7, 104.4), [10, 15.9], [FACE, FACE + 0.8], { tone: "mid" }, {
    r: 0.5,
    spot: MIC_LINE,
    extra: sc.line(sc.rectOn(REAR, [U(103.2), U(94.9)], [11.2, 14.7], FACE + 0.8), { tone: "lo" }),
  });
  sc.box("rear.micline.slider", REAR, uu(98.4, 101.4), [11.4, 14.5], [FACE + 0.8, FACE + 2.2], { tone: "hi" }, { r: 0.4, spot: MIC_LINE });

  // XLR 출력: 귀 둘 달린 받침판, 소켓, 핀 구멍 셋
  const XLR = [U(120.1), 18.8];
  const ears = [[U(120.1 - 9.8), 18.8 + 9.9], [U(120.1 + 9.8), 18.8 - 9.9]];
  const flange = hull([...circle(XLR, 12.2, 36), ...ears.flatMap((ear) => circle(ear, 3.2, 16))]);
  sc.post("rear.xlr.flange", REAR, flange, [FACE, FACE + 1], { tone: "mid" }, {
    spot: "XLR Audio Output",
    extra: ears.map((ear) => C.screw(sc, REAR, ear, FACE + 1)).join(""),
  });
  const pins = [[-3.9, 0.8], [3.8, 0.8], [-0.1, -2.6]].map(([du, dz]) => [XLR[0] - du, XLR[1] + dz]);
  sc.round("rear.xlr.socket", REAR, XLR, 10.4, [FACE + 1, FACE + 2.6], { tone: "mid" }, {
    spot: "XLR Audio Output",
    extra: sc.line(sc.ringOn(REAR, XLR, 9.2, FACE + 2.6) + pins.map((pin) => sc.ringOn(REAR, pin, 0.9, FACE + 2.6)).join(""), { tone: "lo" }) + sc.dots(REAR, pins, FACE + 2.6, { size: 0.45 }),
  });

  // 1/4" 출력: 너트와 구멍
  const QUARTER = [U(143.6), 13.4];
  sc.round("rear.quarter.nut", REAR, QUARTER, 5.8, [FACE, FACE + 1.2], { tone: "mid" }, { spot: '1/4" Instrument/Auxiliary Output' });
  sc.round("rear.quarter.barrel", REAR, QUARTER, 4.4, [FACE + 1.2, FACE + 3.4], { tone: "mid" }, {
    spot: '1/4" Instrument/Auxiliary Output',
    extra: sc.line(sc.ringOn(REAR, QUARTER, 3.2, FACE + 3.4), { tone: "lo" }) + sc.dots(REAR, [QUARTER], FACE + 3.4, { size: 0.6 }),
  });
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    name: "qlxd4",
    view,
    width: 760,
    height: 380,
    azimuth: 72,
    elevation: front ? 24 : 18,
    pad: 24,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, -BEZEL, 0], [WIDTH, -BEZEL, 0], [0, DEPTH + 12, 0], [WIDTH, DEPTH + 12, 0],
      [0, 0, TALL], [WIDTH, 0, TALL], [0, DEPTH, TALL], [WIDTH, DEPTH, TALL],
    ],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((name) => sc.spot(AREA[name], "area", NOTES[name]));
  } else {
    for (const name of QLXD4_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(STRAIN, "area", "전원선이 빠지지 않게 걸어 두는 고리");
    sc.spot(RESET, "area", "누르면 수신기 설정이 기본값으로 돌아간다");
    sc.spot(MIC_LINE, "area", "XLR 출력의 레벨을 mic 또는 line으로 고른다");
  }

  body(sc);
  if (front) frontPanel(sc);
  else rearPanel(sc);

  return sc.finish(
    front
      ? "앞에서 본 Shure QLXD4. 왼쪽에 SHURE 로고, 가운데에 화면과 화살표·menu·enter·sync 버튼, audio·rf·ir 표시등, IR 창이 있고 오른쪽에 전원 스위치가 있다."
      : "뒤에서 본 Shure QLXD4. 왼쪽부터 전원선 고리, 전원 단자, Ethernet, reset, antenna B, mic / line 스위치, XLR 출력, 1/4인치 출력, antenna A가 있다.",
  );
}

export const QLXD4_FIGURE: DeviceFigure = {
  id: "무선 마이크 수신기 1~4",
  sharedWith: ["무선 마이크 수신기 5~6"],
  slug: "qlxd4",
  model: "Shure QLXD4",
  source: "Shure QLX-D Wireless System 사용 설명서 8.2판 7·11·12·47쪽",
  caveat:
    "매뉴얼의 그림과 치수를 보고 단순화해 그렸다. 방송실에는 같은 수신기가 여러 대 있어 한 대만 그렸다. 화면에 뜨는 내용과 옆면은 그리지 않았다. 바닥 발은 매뉴얼 7쪽대로 붙어 있다고 보고 그렸고 두께는 정해 넣었다.",
  views: [build("front"), build("back")],
  ports: QLXD4_PORTS,
  // 데이터는 "출력"이라고만 적었다. XLR 신호라 XLR Audio Output으로 잇는다. 데이터를 고칠지 사람이 정할 때까지의 임시 연결이다
  aliases: { 출력: "XLR Audio Output" },
};
