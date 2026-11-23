/**
 * 오디오 임베더(Blackmagic Mini Converter Audio to SDI)의 생김새 그림.
 *
 * 단자가 상자의 두 끝에 나뉘어 있다. 앞 시점은 SDI 쪽 끝(BNC 셋, Mini-B USB, SDI LOCK 표시등,
 * 전원)과 앞쪽 긴 옆면을, 뒤 시점은 오디오 쪽 끝(1/4인치 잭 넷)을 본다. 윗면에는 단자 이름이
 * 인쇄돼 있다.
 *
 * 근거는 "Blackmagic Converters Installation and Operation Manual"(2024년 7월)의 윗면 그림과
 * 단자 설명(62쪽), 전원 단자와 케이블 타이 구멍 그림(5쪽), 그리고 제조사 Tech Specs의 치수
 * 사진이다. 가로·깊이 자리는 62쪽 윗면 그림에서 재서 mm로 옮겼다.
 *
 * 좌표는 장비 좌표다. X: 오디오 쪽 끝 → SDI 쪽 끝(윗면 글자를 바로 읽는 방향), Y: 앞(POWER 글자
 * 쪽 긴 옆면) → 뒤(로고 쪽 긴 옆면), Z: 위.
 */
import * as C from "./device-connectors";
import { endPlane, plane, roundRect, scene, type DeviceFigure, type DeviceView, type Scene, type ViewKey } from "./device-figure";

/** 몸통 길이. Tech Specs의 4.52in(114.8mm)은 단자까지 잰 길이라, 62쪽 그림의 비율로 몸통만 잰다 */
const LENGTH = 97.5;
/** Tech Specs 3.63in */
const DEPTH = 92.2;
/** Tech Specs 0.90in */
const TALL = 22.9;
/** 윗면과 두 긴 옆면을 감싼 덮개의 두께 */
const SKIN = 0.8;
/** 덮개가 끝면보다 튀어나온 길이. 끝면은 그만큼 안으로 들어가 있다 */
const INSET = 1.5;

const FLOOR = plane(0, 0, 0);
const TOP = plane(0, TALL, 0);
const SIDE = plane(0, 0, 90);
/** SDI 쪽 끝면. 첫 번째 값이 장비의 Y다 */
const SDI_END = endPlane(LENGTH - INSET, 1);
/** 오디오 쪽 끝면. 첫 번째 값이 -Y다 */
const AUDIO_END = endPlane(INSET, -1);

/** 매뉴얼 62쪽의 단자 이름. 1–4는 윗면에 두 줄로 인쇄돼 있다 */
const CH = ["CH 1 ANALOG or CH 1&2 AES/EBU", "CH 2 ANALOG or CH 3&4 AES/EBU", "CH 3 ANALOG or CH 5&6 AES/EBU", "CH 4 ANALOG or CH 7&8 AES/EBU"];
const USB = "Mini-B USB Port";
const SDI_OUT = "SDI OUT";
const ALT_SDI_IN = "ALT SDI IN";
const SDI_IN = "SDI IN";
const POWER = "POWER +12V";
const SDI_LOCK = "SDI LOCK";
const TIE = "Cable tie point";

/** 앞 시점(SDI 쪽)과 뒤 시점(오디오 쪽)의 단자. 테스트가 이 차례로 대조한다 */
export const MINI_CONVERTER_AUDIO_TO_SDI_PORTS: string[] = [USB, SDI_OUT, ALT_SDI_IN, SDI_IN, POWER, ...CH];

const PORT_NOTES: Record<string, string> = {
  [USB]: "Converters Setup 프로그램 연결과 내부 소프트웨어 갱신용",
  [SDI_OUT]: "소리를 실은 SDI가 나가는 BNC",
  [ALT_SDI_IN]: "예비 SDI 입력. SDI IN 신호가 끊기면 이 입력으로 넘어간다",
  [SDI_IN]: "주 SDI 입력",
  [POWER]: "12V 전원 입력",
  [CH[0]]: "1/4인치 TRS 잭. 아날로그 1채널 또는 AES/EBU 2채널",
  [CH[1]]: "1/4인치 TRS 잭. 아날로그 1채널 또는 AES/EBU 2채널",
  [CH[2]]: "1/4인치 TRS 잭. 아날로그 1채널 또는 AES/EBU 2채널",
  [CH[3]]: "1/4인치 TRS 잭. 아날로그 1채널 또는 AES/EBU 2채널",
};

/** 62쪽 그림에서 잰 단자의 Y */
const Y = {
  ch: [68.1, 50.6, 33.0, 15.4],
  sdiOut: 56.5,
  altSdiIn: 41.3,
  sdiIn: 26.2,
  power: 9.5,
  usb: 76,
  lock: 84,
};
const JACK_Z = 11;
const BNC_Z = 10.6;

/** 윗면 인쇄. 62쪽 그림의 자리와 크기다 */
function topPrint(sc: Scene) {
  const text = (X: number, Yv: number, value: string, size: number, anchor = "start", tone = "lo") => sc.textOn(TOP, [X, Yv], value, { size, anchor, tone });
  const marks: string[] = [];
  const chLines: Array<[number, number, string, string]> = [
    [69.0, 66.6, "CH 1 ANALOG or", "CH 1&2 AES/EBU"],
    [51.6, 49.1, "CH 2 ANALOG or", "CH 3&4 AES/EBU"],
    [34.0, 31.5, "CH 3 ANALOG or", "CH 5&6 AES/EBU"],
    [16.5, 14.0, "CH 4 ANALOG or", "CH 7&8 AES/EBU"],
  ];
  for (const [y1, y2, first, second] of chLines) marks.push(text(2.9, y1, first, 1.8), text(2.9, y2, second, 1.8));
  for (const [Yv, value] of [[64.2, "SDI LOCK"], [56, "SDI OUT"], [41, "ALT SDI IN"], [26, "SDI IN"]] as const) marks.push(text(94.5, Yv, value, 1.6, "end"));
  marks.push(text(90.2, 12, "POWER", 1.6, "end"), text(90.2, 9.6, "+12V", 1.6, "end"));
  marks.push(text(27.1, 49.7, "Mini Converter", 4.8, "start", "mid"));
  marks.push(text(27, 40.1, "Audio to SDI", 6.4, "start", "hi"));
  // 제품 이름 아래 밑줄. 인쇄된 선이라 끝이 면 위에서 멈춘다
  marks.push(sc.line(sc.lineOn(TOP, [[27.3, 48], [76.4, 48]], 0.05), { tone: "lo", free: true }));
  marks.push(text(85.5, 80.7, "Blackmagicdesign", 3.1, "end", "mid"));
  // 로고의 둥근 네모 셋
  for (const Yv of [86, 81.9, 77.8]) {
    marks.push(sc.line(sc.lineOn(TOP, roundRect(3.4, 3.2, 0.9, 3).map(([dx, dy]) => [87.6 + dx, Yv + dy]), 0.05, true), { tone: "mid" }));
  }
  return marks.join("");
}

function body(sc: Scene) {
  sc.halo(0);
  // 끝면을 가진 속 상자. 덮개보다 INSET만큼 짧다. 발 없이 바닥에 놓여 audit의 받침(`stand.`)이다
  sc.box("stand.core", FLOOR, [INSET, LENGTH - INSET], [SKIN, DEPTH - SKIN], [0, TALL - SKIN], { tone: "mid" });
  // 덮개: 두 긴 옆면과 윗면
  const screws = [0.23, 0.7]
    .map((t) => [LENGTH * t, TALL / 2] as [number, number])
    .map(([X, z]) =>
      C.screw(sc, SIDE, [X, z], 0.05) +
      sc.line(sc.lineOn(SIDE, [[X - 1.7, z], [X + 1.7, z]], 0.05) + sc.lineOn(SIDE, [[X, z - 1.7], [X, z + 1.7]], 0.05), { tone: "lo" }),
    )
    .join("");
  sc.box("lid.side", FLOOR, [0, LENGTH], [0, SKIN], [0, TALL - SKIN], { tone: "mid" }, { extra: screws });
  sc.box("lid.side", FLOOR, [0, LENGTH], [DEPTH - SKIN, DEPTH], [0, TALL - SKIN], { tone: "mid" });
  sc.box("lid.top", FLOOR, [0, LENGTH], [0, DEPTH], [TALL - SKIN, TALL], { tone: "mid" }, { r: 0.6, steps: 2, extra: topPrint(sc) });
  // 전원 케이블을 묶는 구멍(5쪽). 윗면 POWER 글자 옆이다
  sc.box("lid.tie", TOP, [91.9, 94.3], [9.1, 13.7], [0, 0.12], { tone: "lo", crease: "none" }, { r: 1.1, steps: 3, spot: TIE });
}

/** 면에 박힌 작은 표시등 */
function led(sc: Scene, at: number[], spot: string) {
  sc.round("led", SDI_END, at, 0.8, [0, 0.4], { tone: "mid" }, { spot });
}

function sdiEnd(sc: Scene) {
  C.roundJack(sc, SDI_END, [Y.power, BNC_Z], 0, 4, POWER, "power");
  C.bnc(sc, SDI_END, [Y.sdiIn, BNC_Z], 0, SDI_IN);
  C.bnc(sc, SDI_END, [Y.altSdiIn, BNC_Z], 0, ALT_SDI_IN);
  C.bnc(sc, SDI_END, [Y.sdiOut, BNC_Z], 0, SDI_OUT);
  // Mini-B USB: 아래 모서리가 깎인 구멍
  C.slotJack(sc, SDI_END, [Y.usb, 12.5], 0, [9, 5.4], [[-3.4, 1.5], [3.4, 1.5], [3.4, -0.3], [2.4, -1.5], [-2.4, -1.5], [-3.4, -0.3]], USB, "usb");
  led(sc, [Y.lock, 12.5], SDI_LOCK);
}

function audioEnd(sc: Scene) {
  CH.forEach((name, index) => {
    const at = [-Y.ch[index], JACK_Z];
    sc.round("jack.collar", AUDIO_END, at, 4.6, [0, 3], { tone: "mid" }, {
      spot: name,
      extra: sc.line(sc.ringOn(AUDIO_END, at, 3.25, 3), { tone: "lo" }) + sc.dots(AUDIO_END, [at], 3, { size: 0.6 }),
    });
  });
}

function build(view: ViewKey): DeviceView {
  const front = view === "front";
  const sc = scene({
    name: "mini-converter-audio-to-sdi",
    view,
    width: 720,
    height: 460,
    azimuth: 34,
    elevation: 30,
    pad: 24,
    size: [LENGTH, DEPTH, TALL],
    extents: [
      [-4, 0, 0], [LENGTH + 10, 0, 0], [-4, DEPTH, 0], [LENGTH + 10, DEPTH, 0],
      [0, 0, TALL], [LENGTH, 0, TALL], [0, DEPTH, TALL], [LENGTH, DEPTH, TALL],
    ],
  });

  if (front) {
    for (const name of [USB, SDI_OUT, ALT_SDI_IN, SDI_IN, POWER]) sc.spot(name, "port", PORT_NOTES[name]);
    sc.spot(SDI_LOCK, "area", "SDI 입력 표시등. ALT SDI IN으로 넘어가면 깜박인다");
    sc.spot(TIE, "area", "전원 케이블을 케이블 타이로 묶어 빠지지 않게 하는 구멍");
  } else {
    for (const name of CH) sc.spot(name, "port", PORT_NOTES[name]);
  }

  body(sc);
  if (front) sdiEnd(sc);
  else audioEnd(sc);

  return sc.finish(
    front
      ? "SDI 쪽 끝에서 본 Blackmagic Mini Converter Audio to SDI. 왼쪽부터 POWER +12V, SDI IN, ALT SDI IN, SDI OUT, Mini-B USB 단자와 SDI LOCK 표시등이 있다. 윗면에 단자 이름이 인쇄돼 있다."
      : "오디오 쪽 끝에서 본 Blackmagic Mini Converter Audio to SDI. 왼쪽부터 CH 1, CH 2, CH 3, CH 4 오디오 입력 잭이 있다.",
  );
}

export const MINI_CONVERTER_AUDIO_TO_SDI_FIGURE: DeviceFigure = {
  id: "오디오 임베더",
  slug: "mini-converter-audio-to-sdi",
  model: "Blackmagic Mini Converter Audio to SDI",
  source: "Blackmagic Converters Installation and Operation Manual(2024년 7월) 5·62쪽, Tech Specs 치수",
  caveat:
    "매뉴얼의 윗면 그림과 치수를 보고 단순화해 그렸다. 단자가 두 끝에 나뉘어 있어 앞은 SDI 쪽 끝, 뒤는 오디오 쪽 끝이다. 끝면의 높이 자리는 사진에서 어림했고, SDI LOCK 표시등은 매뉴얼 그림의 USB 단자 옆 작은 구멍 자리에 그렸다. 바닥의 설정 스위치 8개와 로고 쪽 긴 옆면은 이 모델의 그림이 매뉴얼에 없어 그리지 않았다.",
  views: [build("front"), build("back")],
  ports: MINI_CONVERTER_AUDIO_TO_SDI_PORTS,
  aliases: { "CH1·CH2": CH[0] },
};
