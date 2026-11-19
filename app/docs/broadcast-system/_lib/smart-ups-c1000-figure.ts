/**
 * 음향 UPS(APC Smart-UPS C1000)의 생김새 그림. 앞 시점은 표시창 둘레의 표시등과 버튼, 뒤 시점은 단자다.
 *
 * 근거는 APC "Smart-UPS C 1000/1500 VA 120/230 Vac, 2000/3000 VA 230 Vac Tower Installation Guide"
 * (990-4494H)의 뒷면 그림(5쪽, 1000/1500 VA 230 Vac 판)과 앞면 그림(6쪽), "Operation Manual"(990-4493G)의
 * 표시창 그림(8쪽)과 표시등 설명(9쪽), SMC1000I 데이터시트의 치수와 제품 사진이다.
 * 매뉴얼 그림에는 축척이 없어 부품 자리는 그림에서 재서 치수에 맞춰 늘렸다.
 *
 * 데이터에 정확한 모델 번호가 없다. 한국에서 쓰는 230V 판(SMC1000I: 입력 C14, 출력 C13 8구)으로 그린다.
 *
 * 좌표는 장비 좌표다. X: 앞에서 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Plane, type Scene, type ViewKey } from "./device-figure";

/** 데이터시트 SMC1000I: 높이 219, 너비 171, 깊이 439mm */
const WIDTH = 171;
const DEPTH = 439;
const TALL = 219;
/** 앞 덮개(Bezel)의 두께와, 윗모서리가 뒤로 깎이기 시작하는 높이 */
const BEZEL = 18;
const BEVEL = 206;

const FLOOR = plane(0, 0, 0);
const FRONT = plane(0, 0, 90);
const REAR = plane(DEPTH, 0, 90, true);
/** 오른쪽 옆면. `[Y, Z]`로 자리를 받는다. 옆면에는 선만 그린다 */
const RIGHT: Plane = { at: (Y, Z, h = 0) => [WIDTH + h, Y, Z], normal: [1, 0, 0], rise: [0, 0, 1] };

const AREA = {
  online: "Online/On Battery LED",
  power: "UPS ON/OFF button",
  alert: "Site Wiring Fault/Alert LED",
  display: "Display interface",
  displayButton: "DISPLAY button",
  mute: "MUTE button",
  bezel: "Bezel",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  online: "초록이면 전기로 공급 중, 주황이면 배터리로 공급 중(정전)",
  power: "UPS를 켜고 끈다",
  alert: "빨갛게 켜지면 내부 오류, 빨갛게 깜박이면 건물 배선 결함",
  display: "상태를 보이는 LCD",
  mute: "배터리로 공급하는 동안 울리는 경고음을 2초 눌러 끈다",
  bezel: "앞 덮개. 안쪽에 배터리가 있다",
};

/** 뒷면 단자 이름(Installation Guide 5쪽 1000/1500 VA 230 Vac 그림의 번호 순서) */
export const SMART_UPS_C1000_PORTS: string[] = [
  "USB port",
  "Serial port",
  "Battery connector",
  "Circuit breaker/Overload protection",
  "UPS input",
  "Outlets",
  "Chassis ground screw",
];
const PORT_NOTES: Record<string, string> = {
  "USB port": "컴퓨터와 이어 PowerChute로 상태를 보거나 끈다",
  "Serial port": "상태를 보는 직렬 단자",
  "Battery connector": "내부 배터리를 잇는 커넥터",
  "UPS input": "IEC C14 입력(데이터시트)",
  Outlets: "IEC C13 8구(데이터시트)",
};

/* ── 앞면 ─────────────────────────────────────────────── */

/** 표시창 둘레(Installation Guide 6쪽 그림)의 가로·세로. 그림의 1px를 0.336mm로 옮긴다 */
const MODULE = { X0: 44, X1: 127, top: 200, bottom: 120 };
const mx = (px: number) => MODULE.X0 + (px - 188) * 0.336;
const mz = (py: number) => MODULE.top - (py - 140) * 0.336;
const FACE = 1.2;
const MOD = FACE + 1.2;

function body(sc: Scene) {
  const front = sc.view === "front";
  sc.halo(0);
  const marks: string[] = [];
  // 오른쪽 옆면 뒤쪽 위의 통풍구(데이터시트 사진). 앞 시점에서만 오른쪽 옆면이 보인다
  if (front) {
    const slots = Array.from({ length: 9 }, (_, index) => {
      const Y = 330 + index * 10;
      return sc.lineOn(RIGHT, [[Y, 130], [Y + 4, 130], [Y + 4, 196], [Y, 196]], 0, true);
    });
    marks.push(sc.line(slots.join(""), { tone: "lo" }));
  }
  marks.push(sc.line(sc.rectOn(plane(0, TALL, 0), [6, WIDTH - 6], [BEZEL + 6, DEPTH - 6]), { tone: "faint" }));
  // 이름이 "stand."로 시작해야 audit이 바닥에 놓인 부품으로 본다
  sc.box("stand.chassis", FLOOR, [0, WIDTH], [BEZEL, DEPTH], [0, TALL], { tone: "mid" }, { r: 3, extra: marks.join("") });
  sc.span("bezel", [0, WIDTH], [[0, 0], [0, BEVEL], [BEZEL - 6, TALL], [BEZEL, TALL], [BEZEL, 0]], { tone: "mid" }, { spot: front ? AREA.bezel : undefined });
}

/** 면에 박힌 가로로 긴 표시등 */
function lamp(sc: Scene, [X0, X1]: number[], [z0, z1]: number[], spot: string) {
  sc.box("front.led", FRONT, [X0, X1], [z0, z1], [MOD, MOD + 0.5], { tone: "hi" }, { r: 0.6, spot });
}

function frontPanel(sc: Scene) {
  // 가운데 세로 판: 위에 표시창 둘레, 아래에 로고와 모델 이름이 인쇄된 덮개
  const printed = [
    sc.textOn(FRONT, [85.5, 60], "APC", { size: 22, tone: "mid", h: FACE + 0.05 }),
    sc.textOn(FRONT, [85.5, 24], "Smart-UPS", { size: 5, h: FACE + 0.05 }),
    sc.textOn(FRONT, [85.5, 16], "C 1000", { size: 5, h: FACE + 0.05 }),
    sc.line(sc.lineOn(FRONT, [[36, 112], [135, 112]], FACE), { tone: "lo" }),
  ];
  sc.box("front.panel", FRONT, [36, 135], [6, 204], [0, FACE], { tone: "mid" }, { r: 2.5, spot: AREA.bezel, extra: printed.join("") });

  // 표시창 둘레. 화면 내용은 그리지 않는다
  const [lx0, lx1, lz0, lz1] = [mx(235), mx(388), mz(338), mz(188)];
  const glass = sc.patchOn(FRONT, [lx0, lx1], [lz0, lz1], MOD) + sc.line(sc.rectOn(FRONT, [lx0, lx1], [lz0, lz1], MOD), { tone: "lo" });
  // 표시등 위의 인쇄 기호: 체크와 경고 세모
  const icons = [
    sc.line(sc.lineOn(FRONT, [[mx(208), mz(168)], [mx(214), mz(174)], [mx(225), mz(160)]], MOD), { tone: "lo", free: true }),
    sc.line(sc.lineOn(FRONT, [[mx(409), mz(158)], [mx(418), mz(174)], [mx(400), mz(174)]], MOD, true), { tone: "lo" }),
  ];
  sc.box("front.module", FRONT, [MODULE.X0, MODULE.X1], [MODULE.bottom, MODULE.top], [FACE, MOD], { tone: "lo", crease: "none" }, { r: 2, extra: icons.join("") });
  sc.box("front.display", FRONT, [lx0 - 1.5, lx1 + 1.5], [lz0 - 1.5, lz1 + 1.5], [MOD, MOD + 0.3], { tone: "mid" }, { r: 0.8, spot: AREA.display, extra: glass });

  lamp(sc, [mx(205), mx(228)], [mz(188), mz(178)], AREA.online);
  lamp(sc, [mx(397), mx(420)], [mz(188), mz(178)], AREA.alert);

  // 버튼 셋. 전원 버튼에는 전원 기호, 아래 둘에는 기호 자리의 짧은 선이 있다
  const button = (name: string, [px0, px1]: number[], [py0, py1]: number[], spot: string, mark: string) =>
    sc.box(name, FRONT, [mx(px0), mx(px1)], [mz(py1), mz(py0)], [MOD, MOD + 1.6], { tone: "hi" }, { r: 0.8, spot, extra: mark });
  const pc = [mx(310), mz(169.5)];
  button("front.power", [268, 352], [158, 181], AREA.power, sc.line(sc.ringOn(FRONT, pc, 1.6, MOD + 1.6) + sc.lineOn(FRONT, [[pc[0], pc[1]], [pc[0], pc[1] + 2.2]], MOD + 1.6), { tone: "lo" }));
  const mute = [mx(246.5), mz(355.5)];
  button("front.mute", [205, 288], [345, 366], AREA.mute, sc.dots(FRONT, [mute], MOD + 1.6, { size: 0.6, tone: "lo" }));
  const show = [mx(376.5), mz(355.5)];
  button("front.show", [335, 418], [345, 366], AREA.displayButton, sc.dots(FRONT, [show], MOD + 1.6, { size: 0.6, tone: "lo" }));
}

/* ── 뒷면 ─────────────────────────────────────────────── */

/** 뒤에서 본 왼쪽 → 오른쪽 거리 → 장비 X */
const U = (u: number) => WIDTH - u;
/** Installation Guide 5쪽 그림(su0325e)의 px → mm. 가로 0.1954, 세로 0.222 */
const pu = (px: number) => (px - 35) * 0.1954;
const pz = (py: number) => (1140 - py) * 0.222;
const RF = 0.5;

/** C13 콘센트 하나: 둘레 판 위에 아래 모서리를 깎은 구멍과 슬롯 셋 */
function outlet(sc: Scene, [u, z]: number[], base: number) {
  const X = U(u);
  const h = base + 1.4;
  const hole = [[-10, 7.5], [10, 7.5], [10, -3.5], [6, -7.5], [-6, -7.5], [-10, -3.5]].map(([dx, dz]) => [X + dx, z + dz]);
  const slot = (dx: number, dz: number, w: number, d: number) => sc.rectOn(REAR, [X + dx - w / 2, X + dx + w / 2], [z + dz - d / 2, z + dz + d / 2], h);
  sc.box("rear.outlet", REAR, [X - 13, X + 13], [z - 10.5, z + 10.5], [base, h], { tone: "mid" }, {
    r: 2,
    spot: "Outlets",
    extra: sc.line(sc.lineOn(REAR, hole, h, true), { tone: "lo" }) + sc.line(slot(-6, 2, 1.6, 5) + slot(6, 2, 1.6, 5) + slot(0, -3.6, 1.6, 4), { tone: "lo" }),
  });
}

function rearPanel(sc: Scene) {
  sc.box("rear.face", REAR, [3, WIDTH - 3], [3, TALL - 3], [0, RF], { tone: "lo", crease: "none" });

  // 1. USB port (USB-B), 2. Serial port (RJ-45 모양)
  C.slotJack(sc, REAR, [U(pu(166.5)), pz(227.5)], RF, [13, 13], [[-4, 4], [4, 4], [4, -2.5], [2.6, -4], [-2.6, -4], [-4, -2.5]], "USB port", "rear.usb");
  const rj = [[-5.6, -4.6], [5.6, -4.6], [5.6, 2.2], [2, 2.2], [2, 4.4], [-2, 4.4], [-2, 2.2], [-5.6, 2.2]];
  C.slotJack(sc, REAR, [U(pu(272.5)), pz(233.5)], RF, [16, 14], rj, "Serial port", "rear.serial");

  // 3. Battery connector: 위가 둥근 손잡이 모양 덮개, 커넥터 머리, 아래로 이어지는 띠와 받침
  const [bu, bz] = [pu(790), pz(355)];
  const cap = Array.from({ length: 9 }, (_, index) => {
    const t = Math.PI * (index / 8);
    return [U(bu) + 13 * Math.cos(t), bz + 4 + 15 * Math.sin(t)];
  });
  sc.post("rear.battery.cap", REAR, [...cap, [U(bu) - 13, bz - 12], [U(bu) + 13, bz - 12]].reverse(), [RF, RF + 2], { tone: "mid" }, { spot: "Battery connector" });
  const plug = [[-6, 2.4], [-2, 2.4], [-2, 3.6], [2, 3.6], [2, 2.4], [6, 2.4], [6, -2.4], [2, -2.4], [2, -3.6], [-2, -3.6], [-2, -2.4], [-6, -2.4]].map(([dx, dz]) => [U(bu) + dx, bz + 2 + dz]);
  sc.box("rear.battery.plug", REAR, [U(bu) - 8, U(bu) + 8], [bz - 3, bz + 7], [RF + 2, RF + 4], { tone: "hi" }, { r: 1.5, spot: "Battery connector", extra: sc.line(sc.lineOn(REAR, plug, RF + 4, true), { tone: "lo" }) });
  sc.box("rear.battery.strap", REAR, [U(bu) - 6, U(bu) + 6], [pz(560), bz - 12], [RF, RF + 1.4], { tone: "mid" }, { r: 1, spot: "Battery connector" });
  sc.box("rear.battery.cradle", REAR, [U(bu) - 13, U(bu) + 13], [pz(665), pz(560)], [RF, RF + 3], { tone: "mid" }, { r: 4, spot: "Battery connector" });

  // 4. Circuit breaker/Overload protection
  const breaker = [U(pu(798)), pz(770)];
  sc.round("rear.breaker.seat", REAR, breaker, 7, [RF, RF + 1.2], { tone: "mid" }, { spot: "Circuit breaker/Overload protection" });
  sc.round("rear.breaker.button", REAR, breaker, 4.6, [RF + 1.2, RF + 5], { tone: "hi" }, {
    spot: "Circuit breaker/Overload protection",
    extra: sc.line(sc.lineOn(REAR, [[breaker[0], breaker[1] - 2], [breaker[0], breaker[1] + 2]], RF + 5), { tone: "lo", free: true }),
  });

  // 5. UPS input (C14). 세로로 놓여 왼쪽에 핀 둘, 오른쪽에 하나다
  const [iu, iz] = [pu(803.5), pz(941.5)];
  const pin = (du: number, dz: number, w: number, d: number) => sc.rectOn(REAR, [U(iu + du) - w / 2, U(iu + du) + w / 2], [iz + dz - d / 2, iz + dz + d / 2], RF + 1.4);
  sc.box("rear.input", REAR, [U(iu) - 9.5, U(iu) + 9.5], [iz - 14, iz + 14], [RF, RF + 1.4], { tone: "mid" }, {
    r: 1,
    spot: "UPS input",
    extra: sc.line(sc.rectOn(REAR, [U(iu) - 7, U(iu) + 7], [iz - 11.5, iz + 11.5], RF + 1.4), { tone: "lo" }) + sc.line(pin(-3, 5.5, 4.4, 2) + pin(-3, -5.5, 4.4, 2) + pin(3.5, 0, 4.4, 2), { tone: "lo" }),
  });

  // 6. Outlets: 네 구씩 두 줄
  for (const [px0, px1] of [[347, 507], [537, 695]]) {
    const [u0, u1] = [pu(px0), pu(px1)];
    sc.box("rear.outlets", REAR, [U(u1), U(u0)], [pz(1070), pz(575)], [RF, RF + 1], { tone: "mid" }, { r: 1, spot: "Outlets" });
    for (const py of [640, 760, 883, 1005]) outlet(sc, [(u0 + u1) / 2, pz(py)], RF + 1);
  }

  // 7. Chassis ground screw
  const ground = [U(pu(88)), pz(1072)];
  sc.round("rear.ground", REAR, ground, 3, [RF, RF + 1], { tone: "mid" }, { spot: "Chassis ground screw", extra: C.screw(sc, REAR, ground, RF + 1) });
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    name: "smart-ups-c1000",
    view,
    width: 640,
    height: 520,
    azimuth: front ? 62 : 66,
    elevation: 22,
    pad: 22,
    size: [WIDTH, DEPTH, TALL],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((key) => sc.spot(AREA[key], "area", NOTES[key]));
  } else {
    for (const name of SMART_UPS_C1000_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
  }

  body(sc);
  if (front) frontPanel(sc);
  else rearPanel(sc);

  return sc.finish(
    front
      ? "앞에서 본 APC Smart-UPS C1000. 앞 덮개 위쪽 표시창 둘레에 Online/On Battery 표시등, UPS ON/OFF 버튼, Site Wiring Fault/Alert 표시등, 표시창, MUTE 버튼, DISPLAY 버튼이 있다."
      : "뒤에서 본 APC Smart-UPS C1000 230V 판. 왼쪽 위에 USB port와 Serial port, 오른쪽에 Battery connector, Circuit breaker, UPS input, 가운데 아래에 Outlets 8구, 왼쪽 아래에 Chassis ground screw가 있다.",
  );
}

export const SMART_UPS_C1000_FIGURE: DeviceFigure = {
  id: "음향 UPS",
  slug: "smart-ups-c1000",
  model: "APC Smart-UPS C1000",
  source: "APC Smart-UPS C Installation Guide 990-4494H 5·6쪽, Operation Manual 990-4493G 8·9쪽, SMC1000I 데이터시트",
  caveat:
    "매뉴얼 그림과 데이터시트의 치수·사진을 보고 단순화해 그렸다. 데이터에 정확한 모델 번호가 없어 판을 정할 수 없다. 한국에서 쓰는 230V 판(SMC1000I 계열: 입력 C14, 출력 C13 8구)으로 그렸고, 120V 판은 뒷면 콘센트와 입력이 다르다. 매뉴얼 그림에 축척이 없어 부품 자리는 몇 mm쯤 어긋날 수 있다. 표시창의 화면 내용과 뒷면 라벨은 그리지 않았다.",
  views: [build("front"), build("back")],
  ports: SMART_UPS_C1000_PORTS,
  aliases: {},
};
