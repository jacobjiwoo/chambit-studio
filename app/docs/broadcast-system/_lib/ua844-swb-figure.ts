/**
 * 안테나 분배기(Shure UA844SWB)의 생김새 그림. 앞 시점은 랙 패널, 뒤 시점은 단자다.
 * 방송실에는 이 분배기가 두 대 있고, 장비 행 "안테나 분배기 A"와 "안테나 분배기 B"가 이 그림 하나를
 * 같이 쓴다.
 *
 * 근거는 Shure "UA844SWB Antenna Distribution System" 사용 설명서 27A21406 (Rev. 2)의 치수(2쪽:
 * 45 × 483 × 172mm, H × W × D)와 앞·뒷면 그림(3쪽)이다. 앞면 부품의 자리는 그 그림에서 재서 mm로
 * 옮겼다. 뒷몸통의 폭은 매뉴얼에 없어 랙 장비의 흔한 폭(432mm)으로 잡고, 뒷면 그림을 그 폭에 맞춰 옮겼다.
 *
 * 좌표는 장비 좌표다. X: 앞에서 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Scene, type ViewKey } from "./device-figure";

const WIDTH = 483;
const DEPTH = 172;
const TALL = 45;
/** 앞 랙 패널의 높이(1U)와 두께 */
const PANEL_TALL = 44.5;
const PANEL = 3;
/** 뒷몸통의 가로 자리. 폭은 매뉴얼에 없어 랙 장비의 흔한 폭으로 잡았다 */
const BODY = [25.5, 457.5];

const FRONT = plane(0, 0, 90);
const REAR = plane(DEPTH, 0, 90, true);

/** 앞면 구역(매뉴얼 3쪽 ①·②·③·⑩) */
const AREA = {
  antennaA: "Antenna A Connector",
  power: "Power Indicator",
  switch: "Power Switch",
  antennaB: "Antenna B Connector",
} as const;
const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  antennaA: "안테나를 앞에 달 때 쓰는 BNC",
  antennaB: "안테나를 앞에 달 때 쓰는 BNC",
  switch: "나라에 따라 없는 장비도 있다",
};

/** 뒷면 단자(매뉴얼 3쪽 ④–⑨). 뒤에서 본 왼쪽부터다 */
export const UA844_SWB_PORTS: string[] = [
  "RF Input, Antenna B",
  "RF Output B Connectors",
  "14 to 18 Vdc Power Input",
  "14 to 18 Vdc Power Output",
  "RF Output A Connectors",
  "RF Input, Antenna A",
];
const PORT_NOTES: Record<string, string> = {
  "RF Input, Antenna B": "BNC. 안테나에 12V DC(150mA)를 내보낸다",
  "RF Output B Connectors": "BNC 넷. 수신기 넷에 안테나 B의 RF를 나눠 보낸다",
  "14 to 18 Vdc Power Input": "어댑터를 꽂는다",
  "14 to 18 Vdc Power Output": "수신기 넷에 전원을 나눠 준다. 모두 합쳐 2.5A까지",
  "RF Output A Connectors": "BNC 넷. 수신기 넷에 안테나 A의 RF를 나눠 보낸다",
  "RF Input, Antenna A": "BNC. 안테나에 12V DC(150mA)를 내보낸다",
};

function body(sc: Scene) {
  sc.halo(0);
  // 발이 없는 랙 장비라 몸통이 바로 선반에 닿는다(`stand.`)
  sc.box("stand.chassis", plane(0, 0, 0), BODY, [PANEL, DEPTH], [0, TALL - 1], { tone: "mid" }, { r: 0.8, steps: 2 });
}

/** 랙 귀의 긴 구멍. 가운데 `[X, z]`, 길이 11, 높이 5.9 */
function slot(sc: Scene, [X, z]: number[]) {
  const points: number[][] = [];
  for (const [cx, start] of [[X + 2.55, -Math.PI / 2], [X - 2.55, Math.PI / 2]] as const) {
    for (let index = 0; index <= 8; index++) {
      const t = start + (index / 8) * Math.PI;
      points.push([cx + 2.95 * Math.cos(t), z + 2.95 * Math.sin(t)]);
    }
  }
  return sc.line(sc.lineOn(FRONT, points, 0, true), { tone: "lo" });
}

/** 육각 너트 위의 BNC. 앞면 안테나 단자다 */
function bulkhead(sc: Scene, at: number[], spot: string) {
  const hex = Array.from({ length: 6 }, (_, index) => {
    const t = (index / 6) * 2 * Math.PI;
    return [at[0] + 9 * Math.cos(t), at[1] + 9 * Math.sin(t)];
  });
  sc.post("front.hex", FRONT, hex, [0, 1.6], { tone: "mid" }, { spot });
  C.bnc(sc, FRONT, at, 1.6, spot);
}

function frontPanel(sc: Scene) {
  const SLOTS = [[9.1, 39.4], [9.1, 5.6], [WIDTH - 9.1, 39.4], [WIDTH - 9.1, 5.6]];
  // 아래쪽 홈 셋. 양끝이 랙 귀 구멍의 둥근 끝에 닿는다
  const grooves = [[7.9, 13.9], [6.1, 14.96], [4.2, 14.65]].map(([z, X]) => sc.lineOn(FRONT, [[X, z], [WIDTH - X, z]])).join("");
  const text = (X: number, z: number, value: string, size: number, anchor = "middle", tone = "lo") => sc.textOn(FRONT, [X, z], value, { size, anchor, tone });
  const printed = [
    ...SLOTS.map((at) => slot(sc, at)),
    sc.line(grooves, { tone: "lo" }),
    text(64.7, 27.8, "UHF ANTENNA/POWER DISTRIBUTION SYSTEM", 3.9, "start"),
    text(353.8, 25.4, "POWER", 2),
    text(422.4, 34.6, "SHURE", 7, "middle", "mid"),
    text(422.4, 27, "UA844SWB", 5.4, "middle", "mid"),
  ];
  sc.box("front.panel", FRONT, [0, WIDTH], [0, PANEL_TALL], [-PANEL, 0], { tone: "mid" }, { r: 0.8, extra: printed.join("") });

  bulkhead(sc, [30.6, 22.5], AREA.antennaA);
  bulkhead(sc, [457.5, 22.5], AREA.antennaB);

  sc.round("front.led", FRONT, [353.8, 18], 2.4, [0, 0.8], { tone: "lo" }, { spot: AREA.power, extra: sc.line(sc.ringOn(FRONT, [353.8, 18], 1.4, 0.8), { tone: "mid" }) });

  // 전원 스위치: 받침 위 시소 스위치. 위에 I, 아래에 ● 가 인쇄돼 있다
  sc.box("front.switch", FRONT, [378.2, 386.3], [14.3, 33.9], [0, 0.8], { tone: "lo" }, { r: 0.6, spot: AREA.switch });
  sc.box("front.switch.rocker", FRONT, [379.2, 385.3], [15.3, 32.9], [0.8, 3], { tone: "hi" }, {
    r: 0.6,
    spot: AREA.switch,
    extra:
      sc.line(sc.lineOn(FRONT, [[379.2, 24.1], [385.3, 24.1]], 3), { tone: "lo" }) +
      sc.line(sc.lineOn(FRONT, [[382.25, 26.6], [382.25, 30.4]], 3), { tone: "mid", free: true }) +
      sc.dots(FRONT, [[382.25, 19.4]], 3, { size: 1 }),
  });
}

/** 뒤에서 본 왼쪽 → 오른쪽 거리(매뉴얼 3쪽 뒷면 그림의 가로를 뒷몸통 폭에 맞춘 것) → 장비 X */
const U = (u: number) => BODY[1] - u;
const FACE = 0.5;
const BNC_Z = 15.8;
const JACK_Z = 23.4;

/** 단자 묶음 아래의 인쇄된 괄호선. 가운데 글자 자리에서 끊긴다 */
function bracket(sc: Scene, us: number[], gap: number[], z: number, top: number) {
  const [first, last] = [us[0], us[us.length - 1]];
  const paths = [
    sc.line(sc.lineOn(REAR, [[U(first), top], [U(first), z], [U(gap[0]), z]]), { tone: "lo", free: "end" }),
    sc.line(sc.lineOn(REAR, [[U(last), top], [U(last), z], [U(gap[1]), z]]), { tone: "lo", free: "end" }),
  ];
  for (const u of us.slice(1, -1)) paths.push(sc.line(sc.lineOn(REAR, [[U(u), z], [U(u), top]]), { tone: "lo" }));
  return paths.join("");
}

function rearPanel(sc: Scene) {
  const text = (u: number, z: number, value: string, size = 2.2, anchor = "middle") => sc.textOn(REAR, [U(u), z], value, { size, h: 0.05, anchor });
  const OUT_B = [52, 83.5, 115, 146.4];
  const OUT_A = [285.1, 316.3, 347.3, 378.7];
  const POWER_OUT = [193.1, 214.9, 236.2, 257.7];
  const notch: number[][] = [[U(212.5), TALL - 1.5]];
  for (let index = 0; index <= 8; index++) {
    const t = Math.PI + (index / 8) * Math.PI;
    notch.push([U(216.1 + 3.6 * Math.cos(t)), 39.4 + 3.6 * Math.sin(t)]);
  }
  notch.push([U(219.7), TALL - 1.5]);
  const printed = [
    // 인쇄된 칸: 안테나 입력 둘과 POWER IN을 두른 선
    sc.line(sc.lineOn(REAR, [[U(36.3), 1], [U(36.3), TALL - 1.5]]) + sc.lineOn(REAR, [[U(395.7), 1], [U(395.7), TALL - 1.5]]), { tone: "lo" }),
    sc.line(sc.lineOn(REAR, [[U(163.4), 1], [U(163.4), 34.6], [U(184.4), 34.6], [U(184.4), 1]]), { tone: "lo" }),
    sc.line(sc.lineOn(REAR, notch), { tone: "lo" }),
    ...[19.1, 412.6].flatMap((u) => [text(u, 37.4, "12V ⎓ OUT", 2), text(u, 33.4, "150mA CLASS 2", 2)]),
    text(19.1, 3.6, "ANTENNA B", 2.4),
    text(412.6, 3.6, "ANTENNA A", 2.4),
    text(79.4, 34, "SHURE  INCORPORATED"),
    text(132.6, 34, "MADE IN MEXICO"),
    text(248, 34, "MODEL: UA844SWB", 2),
    text(304.9, 34, "ANTENNA/POWER DISTRIBUTION SYSTEM", 2),
    text(363.5, 34, "FREQUENCY RANGE: 470–952MHZ", 2),
    text(99.2, 8.6, "RF", 2.6),
    text(99.2, 3.4, "OUTPUT B", 2.6),
    text(331.5, 8.6, "RF", 2.6),
    text(331.5, 3.4, "OUTPUT A", 2.6),
    bracket(sc, OUT_B, [88.6, 109.8], 4.4, 11),
    bracket(sc, OUT_A, [321, 342], 4.4, 11),
    text(173.9, 13.6, "–  ●  +", 2),
    text(173.9, 8.6, "POWER IN", 2.2),
    text(173.9, 4, "14–18V ⎓ 3.0A", 1.6),
    sc.line(sc.lineOn(REAR, [[U(193.1), 19.5], [U(193.1), 16.6], [U(257.7), 16.6], [U(257.7), 19.5]]), { tone: "lo" }),
    sc.line(sc.lineOn(REAR, [[U(214.9), 16.6], [U(214.9), 19.5]]) + sc.lineOn(REAR, [[U(236.2), 16.6], [U(236.2), 19.5]]), { tone: "lo" }),
    text(204, 12.6, "–  ●  +", 2),
    text(225.5, 12.6, "POWER OUT", 2),
    text(247, 12.6, "–  ●  +", 2),
    text(225.5, 8.4, "14–18V ⎓ 2.5A MAX. TOTAL OUTPUT", 1.9),
    text(225.5, 4.8, "CLASS 2 POWER SUPPLY", 1.9),
  ];
  sc.box("rear.face", REAR, [U(431), U(1)], [1, TALL - 1.5], [0, FACE], { tone: "lo", crease: "none" }, { extra: printed.join("") });

  C.bnc(sc, REAR, [U(19.1), BNC_Z], FACE, "RF Input, Antenna B");
  for (const u of OUT_B) C.bnc(sc, REAR, [U(u), BNC_Z], FACE, "RF Output B Connectors");
  C.roundJack(sc, REAR, [U(173.9), JACK_Z], FACE, 4.6, "14 to 18 Vdc Power Input", "rear.dc");
  for (const u of POWER_OUT) C.roundJack(sc, REAR, [U(u), JACK_Z], FACE, 4.6, "14 to 18 Vdc Power Output", "rear.dc");
  for (const u of OUT_A) C.bnc(sc, REAR, [U(u), BNC_Z], FACE, "RF Output A Connectors");
  C.bnc(sc, REAR, [U(412.6), BNC_Z], FACE, "RF Input, Antenna A");
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    name: "ua844-swb",
    view,
    width: 760,
    height: 300,
    azimuth: front ? 76 : 78,
    elevation: front ? 22 : 16,
    pad: 20,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, -PANEL - 12, 0], [WIDTH, -PANEL - 12, 0], [BODY[0], DEPTH + 12, 0], [BODY[1], DEPTH + 12, 0],
      [0, -PANEL, PANEL_TALL], [WIDTH, -PANEL, PANEL_TALL], [BODY[0], DEPTH, TALL], [BODY[1], DEPTH, TALL],
    ],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((name) => sc.spot(AREA[name], "area", NOTES[name]));
  } else {
    for (const name of UA844_SWB_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
  }

  body(sc);
  if (front) frontPanel(sc);
  else rearPanel(sc);

  return sc.finish(
    front
      ? "앞에서 본 Shure UA844SWB. 1U 랙 패널 양끝에 안테나 단자 A·B가 있고, 오른쪽에 POWER 표시등, 전원 스위치, SHURE 로고가 있다."
      : "뒤에서 본 Shure UA844SWB. 왼쪽부터 ANTENNA B 입력, RF OUTPUT B 넷, POWER IN, POWER OUT 넷, RF OUTPUT A 넷, ANTENNA A 입력이 있다.",
  );
}

export const UA844_SWB_FIGURE: DeviceFigure = {
  id: "안테나 분배기 A",
  sharedWith: ["안테나 분배기 B"],
  slug: "ua844-swb",
  model: "Shure UA844+SWB",
  source: "Shure UA844SWB 사용 설명서 27A21406 (Rev. 2) 2·3쪽",
  caveat:
    "매뉴얼의 그림과 치수를 보고 단순화해 그렸다. 방송실에는 같은 분배기가 두 대 있어 한 대만 그렸다. 뒷몸통의 폭은 매뉴얼에 없어 랙 장비의 흔한 폭으로 잡았고, 뒷면 단자의 자리는 그 폭에 맞춰 옮겼다. 앞면 전원 스위치는 나라에 따라 없는 장비도 있다고 매뉴얼에 적혀 있어, 실물에 있는지는 모른다. 인증 표시는 그리지 않았다.",
  views: [build("front"), build("back")],
  ports: UA844_SWB_PORTS,
  aliases: {},
};
