/**
 * 백업 송출 장비(AJA HELO Plus)의 생김새 그림. 앞 시점은 버튼과 표시등, 뒤 시점은 단자다.
 *
 * 근거는 AJA "HELO Plus Installation and Operation Guide v2.1r3"의 앞면 사진(Figure 3, 12쪽),
 * 뒷면 사진(Figure 4, 15쪽), 치수(100쪽)다. 부품의 가로 자리는 사진에서 재서 mm로 옮겼다.
 * 사진이 비스듬히 찍혀 있어 가로 자리는 몇 mm쯤 어긋날 수 있다.
 *
 * 좌표는 장비 좌표다. X: 앞에서 본 왼쪽 → 오른쪽, Y: 앞 → 뒤, Z: 위.
 */
import * as C from "./device-connectors";
import { plane, scene, type DeviceFigure, type DeviceView, type Scene, type ViewKey } from "./device-figure";

const WIDTH = 215.9;
const DEPTH = 139.7;
const TALL = 25.9;
const FOOT = 1.5;

const FLOOR = plane(0, 0, 0);
const TOP = plane(0, TALL, 0);
const FRONT = plane(0, 0, 90);
const REAR = plane(DEPTH, 0, 90, true);
const FACE = 0.5;

const AREA = {
  record: "Record Button",
  recordLeds: "Record LEDs",
  stream: "Stream Button",
  streamLeds: "Stream LEDs",
  meter: "Audio Level Meters",
  reset: "Reset Button",
  usb: "USB Storage Port",
  usbLed: "USB LED",
  sd: "SD Storage Port",
  sdLed: "SD LED",
  power: "Power LED",
} as const;

const NOTES: Partial<Record<keyof typeof AREA, string>> = {
  record: "녹화를 시작하고 멈춘다",
  recordLeds: "MAIN·BACKUP 녹화 상태. 초록이 깜박이면 녹화 중",
  stream: "송출을 시작하고 멈춘다",
  streamLeds: "송출 1·2 상태. 초록이 깜박이면 송출 중",
  reset: "클립으로 누르는 구멍. 5초 넘게 누르면 공장 초기화",
};

/** 뒷면에 인쇄된 단자 이름(매뉴얼 Figure 4) */
export const HELO_PLUS_PORTS: string[] = ["AUDIO IN", "AUDIO OUT", "SDI IN", "SDI OUT", "HDMI IN", "HDMI OUT", "USB CONFIG", "LAN", "PWR"];
const PORT_NOTES: Record<string, string> = {
  "AUDIO IN": "3.5mm 스테레오",
  "AUDIO OUT": "3.5mm 스테레오",
  "USB CONFIG": "처음 설정과 펌웨어 갱신용 Mini-USB",
  PWR: "12V 전원",
};
const SDI_LED = "SDI In LED";
const HDMI_LED = "HDMI In LED";

/** 앞면에 인쇄된 이름과 가로 자리 */
const FRONT_NAMES: Array<[number, string]> = [[19, "RECORD"], [44, "STREAM"], [83, "AUDIO LEVEL"], [131, "USB STORAGE"], [171, "SD CARD"], [203, "POWER STATUS"]];
/** 뒷면에 인쇄된 이름과, 뒤에서 본 왼쪽부터의 가로 자리 */
const REAR_NAMES: Array<[number, string]> = [[15, "AUDIO IN"], [32, "AUDIO OUT"], [52, "SDI IN"], [69, "SDI OUT"], [99, "HDMI IN"], [123, "HDMI OUT"], [148, "USB CONFIG"], [171, "LAN"], [199, "PWR"]];

/** 면에 박힌 작은 표시등 */
function led(sc: Scene, on: ReturnType<typeof plane>, at: number[], spot: string) {
  sc.round("led", on, at, 1, [FACE, FACE + 0.5], { tone: "mid" }, { spot });
}

function body(sc: Scene) {
  sc.halo(0);
  for (const [X, Y] of [[16, 14], [WIDTH - 16, 14], [16, DEPTH - 14], [WIDTH - 16, DEPTH - 14]]) sc.round("stand.foot", FLOOR, [X, Y], 5, [0, FOOT], { tone: "lo" });
  const marks = [
    sc.line(sc.rectOn(TOP, [4, WIDTH - 4], [4, DEPTH - 4]), { tone: "faint" }),
    sc.dots(TOP, [[9, 9], [WIDTH - 9, 9], [9, DEPTH - 9], [WIDTH - 9, DEPTH - 9]]),
  ];
  marks.push(sc.textOn(TOP, [WIDTH / 2, 34], "AJA", { size: 13, tone: "mid" }));
  marks.push(sc.textOn(TOP, [WIDTH / 2, 23], "HELO Plus", { size: 5.4 }));
  // 윗면 가장자리에도 이름이 인쇄돼 있다. 앞쪽은 앞에서, 뒤쪽은 뒤에서 읽는 방향이다
  for (const [X, name] of FRONT_NAMES) marks.push(sc.textOn(TOP, [X, 5], name, { size: 2.2 }));
  for (const [u, name] of REAR_NAMES) marks.push(sc.textOn(TOP, [WIDTH - u, DEPTH - 5], name, { size: name.startsWith("AUDIO") ? 1.8 : 2.2, turn: true }));
  sc.box("chassis", FLOOR, [0, WIDTH], [0, DEPTH], [FOOT, TALL], { tone: "mid" }, { r: 2.5, steps: 4, extra: marks.join("") });
}

function frontPanel(sc: Scene) {
  const text = (X: number, z: number, value: string, size = 2.2, anchor = "middle") => sc.textOn(FRONT, [X, z], value, { size, h: 0.05, anchor });
  const printed = [
    text(19, 19.4, "RECORD"),
    text(44, 19.4, "STREAM"),
    text(83, 19.4, "AUDIO LEVEL"),
    text(131, 19.4, "USB STORAGE"),
    text(171, 19.4, "SD CARD"),
    text(203, 20.4, "POWER"),
    text(203, 17.6, "STATUS"),
    text(29.4, 11.4, "MAIN", 1.6, "start"),
    text(29.4, 7.4, "BACKUP", 1.6, "start"),
    text(54.4, 11.4, "1", 1.8, "start"),
    text(54.4, 7.4, "2", 1.8, "start"),
    text(63.4, 11.4, "L", 1.8, "end"),
    text(63.4, 7.4, "R", 1.8, "end"),
  ];
  sc.box("front.face", FRONT, [3, WIDTH - 3], [3.5, 23.5], [0, FACE], { tone: "lo", crease: "none" }, { extra: printed.join("") });

  sc.round("front.record", FRONT, [19, 10], 3.6, [FACE, FACE + 2.2], { tone: "hi" }, { spot: AREA.record });
  led(sc, FRONT, [27, 12.2], AREA.recordLeds);
  led(sc, FRONT, [27, 8.2], AREA.recordLeds);
  sc.round("front.stream", FRONT, [44, 10], 3.6, [FACE, FACE + 2.2], { tone: "hi" }, { spot: AREA.stream });
  led(sc, FRONT, [52, 12.2], AREA.streamLeds);
  led(sc, FRONT, [52, 8.2], AREA.streamLeds);

  // 음량 표시: L·R 두 줄에 LED 일곱 개씩
  const cells = [12.2, 8.2].flatMap((z) => Array.from({ length: 7 }, (_, index) => [67.5 + index * 5, z]));
  sc.box("front.meter", FRONT, [64.5, 100.5], [5.6, 14.8], [FACE, FACE + 0.4], { tone: "mid" }, {
    r: 1,
    spot: AREA.meter,
    extra: sc.line(cells.map((cell) => sc.ringOn(FRONT, cell, 1, FACE + 0.4)).join(""), { tone: "lo" }) + sc.dots(FRONT, cells, FACE + 0.4, { size: 0.45 }),
  });

  sc.round("front.reset", FRONT, [119, 12], 1.5, [FACE, FACE + 0.4], { tone: "mid" }, { spot: AREA.reset, extra: sc.dots(FRONT, [[119, 12]], FACE + 0.4, { size: 0.6 }) });
  C.slotJack(sc, FRONT, [131, 10], FACE, [15.5, 8], [[-6.2, -2.4], [6.2, -2.4], [6.2, 2.4], [-6.2, 2.4]], AREA.usb, "front.usb");
  led(sc, FRONT, [142.5, 6.6], AREA.usbLed);
  C.slotJack(sc, FRONT, [171, 10], FACE, [29, 5.6], [[-12.2, -1.1], [12.2, -1.1], [12.2, 1.1], [-12.2, 1.1]], AREA.sd, "front.sd");
  led(sc, FRONT, [189.5, 8], AREA.sdLed);
  led(sc, FRONT, [203, 8], AREA.power);
}

/** 뒤에서 본 왼쪽 → 오른쪽 거리(매뉴얼 Figure 4의 가로) → 장비 X */
const U = (u: number) => WIDTH - u;

function rearPanel(sc: Scene) {
  const text = (u: number, z: number, value: string, size = 2) => sc.textOn(REAR, [U(u), z], value, { size, h: 0.05 });
  const Z = 11.2;
  const printed = [
    text(15, 19.8, "AUDIO IN", 1.8),
    text(32, 19.8, "AUDIO OUT", 1.8),
    text(52, 19.8, "SDI IN"),
    text(69, 19.8, "SDI OUT"),
    text(99, 19.8, "HDMI IN"),
    text(123, 19.8, "HDMI OUT"),
    text(148, 19.8, "USB CONFIG"),
    text(171, 19.8, "LAN"),
    text(199, 19.8, "PWR"),
  ];
  sc.box("rear.face", REAR, [3, WIDTH - 3], [3.5, 23.5], [0, FACE], { tone: "lo", crease: "none" }, { extra: printed.join("") });

  C.roundJack(sc, REAR, [U(15), Z], FACE, 3.3, "AUDIO IN", "rear.audio");
  C.roundJack(sc, REAR, [U(32), Z], FACE, 3.3, "AUDIO OUT", "rear.audio");
  C.bnc(sc, REAR, [U(52), Z], FACE, "SDI IN");
  C.bnc(sc, REAR, [U(69), Z], FACE, "SDI OUT");
  led(sc, REAR, [U(60.5), 16.6], SDI_LED);
  const hdmi = [[-7, 2.3], [7, 2.3], [7, -0.3], [5.2, -2.3], [-5.2, -2.3], [-7, -0.3]];
  C.slotJack(sc, REAR, [U(99), Z], FACE, [17.5, 8.4], hdmi, "HDMI IN", "rear.hdmi");
  C.slotJack(sc, REAR, [U(123), Z], FACE, [17.5, 8.4], hdmi, "HDMI OUT", "rear.hdmi");
  led(sc, REAR, [U(111), 16.6], HDMI_LED);
  C.slotJack(sc, REAR, [U(148), Z], FACE, [10.5, 6.4], [[-3.5, 1.5], [3.5, 1.5], [3.5, -0.3], [2.5, -1.5], [-2.5, -1.5], [-3.5, -0.3]], "USB CONFIG", "rear.usb");
  C.rj45(sc, REAR, [U(171), Z], FACE, "LAN");
  // 전원: 잠금식 4핀 단자
  const pins = [[-1.7, 1.7], [1.7, 1.7], [-1.7, -1.7], [1.7, -1.7]].map(([dx, dz]) => [U(199) + dx, Z + dz]);
  sc.round("rear.pwr.nut", REAR, [U(199), Z], 6.2, [FACE, FACE + 1.6], { tone: "mid" }, { spot: "PWR" });
  sc.round("rear.pwr.barrel", REAR, [U(199), Z], 5, [FACE + 1.6, FACE + 5], { tone: "mid" }, {
    spot: "PWR",
    extra: sc.line(sc.ringOn(REAR, [U(199), Z], 3.8, FACE + 5), { tone: "lo" }) + sc.dots(REAR, pins, FACE + 5, { size: 0.5 }),
  });
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    view,
    width: 760,
    height: 330,
    azimuth: 74,
    elevation: 24,
    pad: 24,
    size: [WIDTH, DEPTH, TALL],
    extents: [
      [0, -4, 0], [WIDTH, -4, 0], [0, DEPTH + 12, 0], [WIDTH, DEPTH + 12, 0],
      [0, 0, TALL], [WIDTH, 0, TALL], [0, DEPTH, TALL], [WIDTH, DEPTH, TALL],
    ],
  });

  if (front) {
    (Object.keys(AREA) as Array<keyof typeof AREA>).forEach((key) => sc.spot(AREA[key], "area", NOTES[key]));
  } else {
    for (const name of HELO_PLUS_PORTS) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(SDI_LED, "area", "SDI 입력 신호가 잡히면 켜진다");
    sc.spot(HDMI_LED, "area", "HDMI 입력 신호가 잡히면 켜진다");
  }

  body(sc);
  if (front) frontPanel(sc);
  else rearPanel(sc);

  return sc.finish(
    front
      ? "앞에서 본 AJA HELO Plus. 왼쪽부터 RECORD 버튼, STREAM 버튼, 음량 표시, 리셋 구멍, USB STORAGE 단자, SD CARD 슬롯, 전원 표시등이 있다."
      : "뒤에서 본 AJA HELO Plus. 왼쪽부터 AUDIO IN, AUDIO OUT, SDI IN, SDI OUT, HDMI IN, HDMI OUT, USB CONFIG, LAN, PWR 단자가 있다.",
  );
}

export const HELO_PLUS_FIGURE: DeviceFigure = {
  id: "백업 송출 장비",
  model: "AJA HELO Plus",
  source: "AJA HELO Plus Installation and Operation Guide v2.1r3 12·15·100쪽",
  caveat: "매뉴얼의 사진과 치수를 보고 단순화해 그렸다. 부품의 가로 자리는 비스듬히 찍힌 사진에서 재서 몇 mm쯤 어긋날 수 있다.",
  views: [build("front"), build("back")],
  ports: HELO_PLUS_PORTS,
  aliases: {},
};
