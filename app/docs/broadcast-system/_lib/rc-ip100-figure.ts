/**
 * PTZ 컨트롤러(Canon RC-IP100)의 생김새 그림. 앞 시점은 조작부, 뒤 시점은 단자다.
 *
 * 근거는 Canon "User Manual (Basic)"의 각부 명칭(21쪽)과 치수 그림(23쪽)이다. 부품의 자리는 그
 * 그림에서 재서 mm로 옮겼다. 치수 그림은 폭 350, 깊이 182, 뒤 높이 60, 레버 끝 높이 110만 적는다.
 * 앞쪽 높이와 조작부가 기울어진 각도는 옆모습 그림에서 잰 값이다. 버튼과 단자에 인쇄된 글자는
 * 매뉴얼 그림에 없어, 뒷면에만 매뉴얼의 단자 이름을 적었다.
 *
 * 좌표는 장비 좌표다. X: 조작하는 사람이 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Scene, type ViewKey } from "./device-figure";

const WIDTH = 350;
const DEPTH = 182;
const TALL = 110;

const FOOT = 2;
/** 조작부 앞 모서리 높이와, 뒤쪽 턱이 시작하는 자리의 높이 */
const FRONT_TOP = 16;
const LEDGE_Y = 161;
const SLOPE_TOP = 54;
const LEDGE_TOP = 58;
const TILT = (Math.atan((SLOPE_TOP - FRONT_TOP) / LEDGE_Y) * 180) / Math.PI;
const COS = Math.cos((TILT * Math.PI) / 180);

const FLOOR = plane(0, 0, 0);
const PANEL = plane(0, FRONT_TOP, TILT);
const LEDGE = plane(LEDGE_Y, LEDGE_TOP, 0);
const REAR = plane(DEPTH, 0, 90, true);
/** 뒤 모서리에서 잰 거리 → 조작부 오르막 거리 */
const up = (r: number) => (DEPTH - r) / COS;
const span2 = (r0: number, r1: number) => [up(Math.max(r0, r1)), up(Math.min(r0, r1))];

const AREA = {
  panel: "Operation panel",
  lever: "Control lever",
  f3: "F3 knob",
  zoom: "Zoom lever",
  user1: "USER1 button",
  user2: "USER2 button",
  f1: "F1 knob",
  f2: "F2 knob",
  f4: "F4 knob",
  alarm: "ALARM lamp",
  power: "POWER lamp",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  panel: "터치 패널",
  lever: "카메라를 좌우·상하로 돌린다",
  zoom: "카메라 줌",
  alarm: "경보가 나면 빨갛게 켜진다",
};

/** 매뉴얼 21쪽의 단자 이름 */
export const RC_IP100_PORTS: string[] = ["DC 12V terminal", "LAN terminal", "SERVICE terminal", "TALLY terminal", "SERIAL terminal"];
const PORT_NOTES: Record<string, string> = {
  "SERVICE terminal": "정비용",
  "SERIAL terminal": "RS-422. LAN terminal과 같은 RJ-45 모양이라 헷갈리기 쉽다",
};
const SWITCH = "Power switch";
const CLAMP = "Wire Clamp";
const SETTING = "SETTING switch";

/** 손잡이: 낮은 받침 위에 홈이 난 몸통 */
function knob(sc: Scene, [X, r]: number[], spot: string) {
  sc.turned("knob", PANEL, [X, up(r)], [[0, 7.4], [1.6, 7.4], [1.6, 6.2], [10, 5.6]], { tone: "mid" }, { spot, ribs: [1.6, 10, 6.2, 24, 5.6] });
}

function body(sc: Scene) {
  const front = sc.view === "front";
  sc.halo(0);
  for (const [X, Y] of [[22, 22], [WIDTH - 22, 22], [22, DEPTH - 22], [WIDTH - 22, DEPTH - 22]]) sc.round("stand.foot", FLOOR, [X, Y], 8, [0, FOOT], { tone: "lo" });
  const marks = [sc.line(sc.rectOn(PANEL, [3, WIDTH - 3], [3 / COS, (LEDGE_Y - 3) / COS]), { tone: "faint" })];
  if (front) {
    const FRONT = plane(0, 0, 90);
    marks.push(sc.line(sc.lineOn(FRONT, [[0, 7], [WIDTH, 7]]), { tone: "faint" }));
  }
  sc.span("chassis", [0, WIDTH], [[0, FOOT], [0, FRONT_TOP], [LEDGE_Y, SLOPE_TOP], [DEPTH, SLOPE_TOP], [DEPTH, FOOT]], { tone: "mid" }, { extra: marks.join("") });
  sc.span("chassis.ledge", [0, WIDTH], [[LEDGE_Y, SLOPE_TOP], [LEDGE_Y, LEDGE_TOP], [DEPTH, LEDGE_TOP], [DEPTH, SLOPE_TOP]], { tone: "mid" }, {
    extra: sc.line(sc.rectOn(LEDGE, [4, WIDTH - 4], [3, DEPTH - LEDGE_Y - 3]), { tone: "faint" }),
  });
}

function topPanel(sc: Scene) {
  /* 터치 패널. 화면 내용은 매뉴얼 그림에 없어 비워 둔다 */
  const [X0, X1, r0, r1] = [84, 238, 45, 144];
  const [s0, s1] = span2(r0, r1);
  const glass =
    sc.patchOn(PANEL, [X0 + 6, X1 - 6], [s0 + 6, s1 - 6], 0.8) +
    sc.line(sc.rectOn(PANEL, [X0 + 6, X1 - 6], [s0 + 6, s1 - 6], 0.8), { tone: "lo" });
  sc.box("panel", PANEL, [X0, X1], [s0, s1], [0, 0.8], { tone: "lo", crease: "none" }, { r: 3, spot: AREA.panel, extra: glass });

  /* 왼쪽: USER 버튼, F1·F2 손잡이, 줌 레버 */
  for (const [r, spot] of [[59, AREA.user1], [89, AREA.user2]] as const) {
    sc.box("user", PANEL, [49, 67], span2(r - 9, r + 9), [0, 3], { tone: "mid" }, { r: 2.4, spot, extra: sc.line(sc.rectOn(PANEL, [52, 64], span2(r - 6, r + 6), 3), { tone: "faint" }) });
  }
  knob(sc, [28, 59], AREA.f1);
  knob(sc, [28, 89], AREA.f2);
  sc.box("zoom.seat", PANEL, [16, 60], span2(122, 142), [0, 1.2], { tone: "mid" }, { r: 4, spot: AREA.zoom });
  sc.box("zoom.rocker", PANEL, [21, 55], span2(126, 138), [1.2, 7], { tone: "hi" }, { r: 3, spot: AREA.zoom, extra: sc.line(sc.lineOn(PANEL, [[38, up(138)], [38, up(126)]], 7), { tone: "lo" }) });

  /* 오른쪽: 컨트롤 레버와 그 머리의 F3 손잡이, F4 손잡이 */
  const LEVER = [296, up(74)];
  sc.round("lever.ring", PANEL, LEVER, 34, [0, 2], { tone: "mid" }, { spot: AREA.lever, extra: sc.line(sc.ringOn(PANEL, LEVER, 30, 2), { tone: "faint" }) });
  sc.turned("lever.boot", PANEL, LEVER, [[2, 23], [6, 19, 1], [11, 10, 1], [14, 7]], { tone: "mid" }, { spot: AREA.lever });
  sc.round("lever.stick", PANEL, LEVER, 5, [14, 46], { tone: "mid" }, { spot: AREA.lever });
  sc.turned("lever.head", PANEL, LEVER, [[46, 13], [47.6, 15], [66, 15], [66, 13], [68, 12]], { tone: "mid" }, { spot: AREA.f3, ribs: [47.6, 66, 15, 40] });
  knob(sc, [276, 133], AREA.f4);

  /* 표시등 */
  for (const [X, spot] of [[112, AREA.alarm], [220, AREA.power]] as const) {
    sc.box("lamp", PANEL, [X - 3.5, X + 3.5], span2(23.6, 26.4), [0, 0.8], { tone: "mid" }, { r: 1, spot });
  }
}

/** 뒤에서 본 왼쪽 → 오른쪽 거리(매뉴얼 21쪽 Rear Panel 그림의 가로) → 장비 X */
const U = (u: number) => WIDTH - u;
const uu = (u0: number, u1: number) => [U(u1), U(u0)];

function rearPanel(sc: Scene) {
  const text = (u: number, z: number, value: string, size = 2.8) => sc.textOn(REAR, [U(u), z], value, { size, h: 0.05 });
  const Z = 24;
  const printed = [
    text(38, 9.6, "POWER"),
    text(106, 12.6, "DC 12V"),
    text(123, 12.6, "LAN"),
    text(145, 12.6, "SERVICE"),
    text(188, 12.6, "TALLY"),
    text(222, 12.6, "SETTING"),
    text(283, 12.6, "SERIAL"),
    ...[[125, 46], [228, 46], [325, 30], [20, 46]].map(([u, z]) => C.screw(sc, REAR, [U(u), z])),
    // 정격 라벨. 인쇄된 글자를 대신하는 줄이라 면 위에서 끝난다
    sc.line(sc.rectOn(REAR, uu(236, 268), [38, 52]), { tone: "faint" }),
    sc.line(sc.lineOn(REAR, [[U(240), 48], [U(262), 48]]), { tone: "lo", free: true }),
    sc.line(sc.lineOn(REAR, [[U(240), 44.5], [U(256), 44.5]]), { tone: "lo", free: true }),
    sc.line(sc.lineOn(REAR, [[U(240), 41], [U(250), 41]]), { tone: "lo", free: true }),
  ];
  sc.box("rear.face", REAR, [6, WIDTH - 6], [5, 55], [0, 0.6], { tone: "lo", crease: "none" }, { extra: printed.join("") });
  const FACE = 0.6;

  sc.box("rear.power", REAR, uu(29, 47), [14, 40], [FACE, FACE + 1], { tone: "mid" }, { r: 1.5, spot: SWITCH });
  sc.box("rear.power.rocker", REAR, uu(32.5, 43.5), [17.5, 36.5], [FACE + 1, FACE + 4.4], { tone: "hi" }, { r: 1, spot: SWITCH, extra: sc.line(sc.lineOn(REAR, [[U(43.5), 27], [U(32.5), 27]], FACE + 4.4), { tone: "lo" }) });
  sc.round("rear.clamp", REAR, [U(60), 20], 3, [FACE, FACE + 1.6], { tone: "mid" }, { spot: CLAMP, extra: sc.dots(REAR, [[U(60), 20]], FACE + 1.6, { size: 0.7 }) });
  C.roundJack(sc, REAR, [U(106), Z], FACE, 4.6, "DC 12V terminal", "rear.dc");
  C.rj45(sc, REAR, [U(123), Z], FACE, "LAN terminal");
  C.slotJack(sc, REAR, [U(145), Z], FACE, [11, 6.4], [[-3.6, -1.5], [3.6, -1.5], [3.6, 0.6], [2.6, 1.5], [-2.6, 1.5], [-3.6, 0.6]], "SERVICE terminal", "rear.service");
  C.dsub(sc, REAR, [U(188), Z], FACE, 9, "TALLY terminal");
  const dips = Array.from({ length: 8 }, (_, index) => sc.rectOn(REAR, [U(222) - 9.4 + index * 2.4, U(222) - 7.8 + index * 2.4], [Z - 1.8, Z + 1.8], FACE + 1)).join("");
  sc.box("rear.setting", REAR, [U(222) - 12, U(222) + 12], [Z - 4.2, Z + 4.2], [FACE, FACE + 1], { tone: "mid" }, { r: 0.8, spot: SETTING, extra: sc.line(dips, { tone: "lo" }) });
  C.rj45(sc, REAR, [U(283), Z], FACE, "SERIAL terminal");
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    view,
    width: 760,
    height: front ? 470 : 380,
    azimuth: front ? 60 : 76,
    elevation: front ? 38 : 22,
    pad: 22,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, 0, 0], [WIDTH, 0, 0], [0, DEPTH + 8, 0], [WIDTH, DEPTH + 8, 0],
      [0, 0, FRONT_TOP], [WIDTH, 0, FRONT_TOP], [0, DEPTH, LEDGE_TOP], [WIDTH, DEPTH, LEDGE_TOP],
      [281, DEPTH - 74, TALL], [311, DEPTH - 74, TALL],
    ],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((key) => sc.spot(AREA[key], "area", NOTES[key]));
  } else {
    for (const name of RC_IP100_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(SWITCH, "area");
    sc.spot(CLAMP, "area", "AC 어댑터 선이 빠지지 않게 묶는 자리");
    sc.spot(SETTING, "area", "1–4는 TALLY 입출력 전환, 5–8은 정비용");
  }

  body(sc);
  topPanel(sc);
  if (!front) rearPanel(sc);

  return sc.finish(
    front
      ? "앞에서 내려다본 Canon RC-IP100. 가운데에 터치 패널이 있고, 오른쪽에 컨트롤 레버, 왼쪽에 USER 버튼 둘과 손잡이 둘, 그 아래에 줌 레버가 있다."
      : "뒤에서 본 Canon RC-IP100. 왼쪽부터 전원 스위치, 와이어 클램프, DC 12V, LAN, SERVICE, TALLY, SETTING 스위치, SERIAL이 있다.",
  );
}

export const RC_IP100_FIGURE: DeviceFigure = {
  id: "PTZ 컨트롤러",
  model: "Canon RC-IP100",
  source: "Canon RC-IP100 User Manual (Basic) 21·23쪽",
  caveat: "매뉴얼의 그림과 치수를 보고 단순화해 그렸다. 버튼에 인쇄된 글자와 터치 패널 화면은 매뉴얼 그림에 없어 그리지 않았다.",
  views: [build("front"), build("back")],
  ports: RC_IP100_PORTS,
  // 데이터는 인쇄된 글자대로 "LAN"이라 적고, 매뉴얼의 이름은 "LAN terminal"이다
  aliases: { LAN: "LAN terminal" },
};
