/**
 * CG 출력 원리 그림의 정적 기하. 빌드 때 서버에서 한 번 계산하고, 브라우저는 결과 SVG만 받는다.
 *
 * 작업대 위에 세 가지가 놓인다.
 * - 왼쪽: CG PC 문자발생기 보드. 브래킷의 BNC 단자 둘에서 FILL과 KEY 케이블이 나온다.
 * - 가운데 앞: 영상 스위처. 뒤쪽 단자대에 FILL·KEY가 들어오고 PGM이 나간다. 위에 카메라 버튼과 DSK 버튼.
 * - 뒤: PGM 모니터. 화면에 PGM과 DSK가 얹은 CG가 보인다.
 *
 * 모든 부품의 실제 모양을 anatomy audit 기록기에 남기고, 겹치는 곳의 앞뒤 순서를 그 기록에서 정한다
 * (`A.settle`). 테스트가 같은 기록으로 audit을 돌린다.
 */
import * as A from "./anatomy/audit.mjs";
import * as k from "./anatomy/iso-kit.mjs";
import * as G from "./anatomy/lathe.mjs";
import { tubePieces, tubeSvg } from "./anatomy/tube.mjs";
import { CAMERAS } from "./cg-output-model";

/** 키트(.mjs)가 돌려주는 점은 길이 없는 배열로 추론되므로 튜플 대신 배열로 받는다 */
type Point3 = number[];
type Flat = number[];
interface Plan {
  x: number;
  y: number;
  w: number;
  d: number;
  r: number;
}
interface Frame {
  o: Point3;
  a: Point3;
  u: Point3;
  v: Point3;
}
interface Item {
  key: number;
  name: string;
  svg: string;
}
interface Recorder {
  items: Item[];
  routes: Array<{ name: string }>;
  put(options: Record<string, unknown>): Item;
  solid<T>(shape: T): T;
  route(name: string, points: Point3[], radius: number, options?: Record<string, unknown>): unknown;
}
type Style = { tone?: string; crease?: string; lit?: boolean; flat?: boolean; inner?: string };

export const WIDTH = 600;
export const HEIGHT = 380;
const AZIMUTH = 58;

const BASE: Plan = { x: -160, y: -78, w: 320, d: 150, r: 9 };
const BASE_H = 10;
const FOOT_H = 5;

const PCB: Plan = { x: -148, y: -46, w: 73, d: 54, r: 1.5 };
const PCB_Z = 8;
const PCB_TOP = PCB_Z + 1.6;
const BRACKET_X = -75;
const BRACKET_FACE = BRACKET_X + 2;
const BRACKET_TOP = 34;
const BOARD_JACK_Z = 22;
const KEY_Y = -30;
const FILL_Y = -12;

const PANEL: Plan = { x: -30, y: 0, w: 126, d: 60, r: 3 };
const PANEL_TOP = 12;
const RISER: Plan = { x: -26, y: 3, w: 118, d: 10, r: 1.5 };
const RISER_TOP = 20;
const RISER_FACE = RISER.y + RISER.d;
const JACK_Y = 8;
const FILL_X = -14;
const KEY_X = -2;
const PGM_X = 84;

const FOOT: Plan = { x: 13, y: -74, w: 64, d: 22, r: 4 };
const FOOT_TOP = 7;
const NECK: Plan = { x: 38, y: -64, w: 14, d: 6, r: 1 };
const BODY: Plan = { x: -40, y: -66, w: 170, d: 10, r: 1.5 };
const BODY_Z = 30;
const BODY_TOP = 130;
const FACE_Y = BODY.y + BODY.d;
const MONITOR_JACK: Point3 = [BODY.x + BODY.w, -61, 40];

/** 모니터 화면. 화면 좌표(가로 u, 아래로 v)로 그린다 */
export const SCREEN = { x: -34.5, z: 125, w: 159, h: 90 };
/** 장면은 106 × 60 화면 좌표로 그리고 이만큼 키운다 */
const SCENE_SCALE = 1.5;

/** BNC 단자 하나의 길이. 너트·몸통·플러그·부트 끝까지. 케이블은 여기서 시작한다 */
const JACK = { nut: 1.6, body: 5, plug: 12, boot: 18 };
const CABLE_R = 1.4;

const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [BODY.x, BODY.y, BODY_TOP],
    [BODY.x + BODY.w, BODY.y + BODY.d, BODY_TOP],
    [158, -61, 40],
    [BRACKET_X, PCB.y, BRACKET_TOP],
  ],
  WIDTH,
  HEIGHT,
  { pad: 30, azimuth: AZIMUTH },
);
const KS = G.scaleOf(P);
const at = (point: Point3): Flat => k.iso(point as [number, number, number], P);
const S = (paths: unknown, style: Style = {}) => k.solidSvg(paths, style);
const Ln = (d: string, style: Record<string, unknown> = {}) => k.lineSvg(d, style);
const Dots = (points: Flat[], style: Record<string, unknown> = {}) => k.dotsSvg(points, style);

const R = A.recorder(P) as unknown as Recorder;

function put(name: string, ref: Point3, svg: string, shapes: unknown[], bias = 0) {
  return R.put({ name, at: ref, bias, svg, shapes, piece: "bench" });
}

function box(name: string, plan: Plan, z: number, h: number, style: Style = {}, { extra = "", steps = 3, bevel = 0, part = "" } = {}) {
  const shape = R.solid(A.slab(plan, z, h, { name }, steps));
  const body = S(k.slabOf(plan, z, h, P, steps, bevel), { tone: "mid", ...style }) + extra;
  put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], part ? `<g data-part="${part}">${body}</g>` : body, [shape]);
  return shape;
}

function cyl(name: string, cx: number, cy: number, r: number, z: number, h: number, style: Style = {}, extra = "") {
  const shape = R.solid(A.cylinder(cx, cy, r, z, h, { name }));
  put(name, [cx, cy, z + h / 2], S(k.cylinder(cx, cy, r, z, h, P, 32, 0.3), { tone: "mid", ...style }) + extra, [shape]);
  return shape;
}

function turned(name: string, F: Frame, profile: number[][], style: Style = {}, extra = "") {
  const meta = { radius: null, name };
  const shape = R.solid(A.solid(F, profile, meta));
  const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
  put(name, G.add3(F.o, G.mul3(F.a, mid)), S(G.solidOf(profile, F, P, {}), { tone: "mid", ...style }) + extra, [shape]);
  return shape;
}

/** BNC 단자와 꽂힌 플러그. 케이블이 시작할 점을 돌려준다 */
function bnc(name: string, F: Frame): Point3 {
  turned(`${name}.nut`, F, [[0, 4], [JACK.nut, 4]]);
  const pins = [0.5, 0.5 + Math.PI].map((angle) => at(G.pointOf(F, 3.4, 2.7, angle + G.angleToward(F, G.viewOf(P)) - 0.5)));
  turned(`${name}.body`, F, [[JACK.nut, 2.7], [JACK.body, 2.7]], {}, Dots(pins, { size: 0.55, tone: "mid" }));
  const ribs = G.ribsOf(F, JACK.body + 0.8, JACK.plug - 0.8, 3.3, 20, P, { fade: [0.1, 0.55] as never, seams: true });
  turned(`${name}.plug`, F, [[JACK.body, 3.3], [JACK.plug, 3.3]], { inner: k.fadedSvg(ribs, { tone: "lo" }) });
  turned(`${name}.boot`, F, [[JACK.plug, 2.5], [JACK.boot, 1.75]], { tone: "mid" });
  return G.add3(F.o, G.mul3(F.a, JACK.boot));
}

function cable(name: string, points: Point3[], bend = 9) {
  const route = G.fillet(points, bend, 10, { P: P as never, tube: CABLE_R });
  R.route(name, route, CABLE_R, { limp: true, piece: "bench" });
  tubePieces(route, CABLE_R, P, { maxLength: 14, spacing: 1.2 }).forEach((piece, index) =>
    put(`${name}:${index}`, piece.mid, `<g data-cable="${name}">${tubeSvg(piece, { tone: "mid" })}</g>`, [A.tube(piece.points, piece.radii)], 0.05),
  );
}

const along = (o: Point3, a: Point3, u: Point3, v: Point3): Frame => G.frameOf(o, a, u, v);
const up = (x: number, y: number, z: number) => along([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const east = (x: number, y: number, z: number) => along([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);

/* ── 작업대 ─────────────────────────────────────────── */

const back: string[] = [];
back.push(`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`);
const byDepth = (points: number[][]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of byDepth(k.corners(BASE, 24))) {
  back.push(S(k.cylinder(x, y, 7, -BASE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
}
back.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 8, 1.6), { tone: "mid", inner: Ln(k.sideSeam(BASE, -4, P, 8), { tone: "faint" }) }));
back.push(Ln(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: "lo" }));
const baseScrews = k.corners(BASE, 11);
back.push(Ln(baseScrews.map(([x, y]: number[]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
back.push(Dots(baseScrews.map(([x, y]: number[]) => at([x, y, 0])), { size: 0.5 }));
R.solid(A.slab(BASE, -BASE_H, BASE_H, { name: "stand.base", ground: true }, 8));

const STRIP: Plan = { x: -150, y: 62, w: 112, d: 7, r: 1 };
back.push(S(k.slabOf(STRIP, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
const ticks = k.topTicks(STRIP.x + 4, STRIP.x + STRIP.w - 4, 4, 5, STRIP.y, 0.6, [1.8, 3.4], P);
back.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
R.solid(A.slab(STRIP, 0, 0.6, { name: "stand.strip" }, 3));

const LABEL: Plan = { x: 108, y: 50, w: 40, d: 16, r: 1.5 };
back.push(S(k.slabOf(LABEL, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
back.push(Ln(k.planOutline(k.insetPlan(LABEL, 1.6), 0.8, P), { tone: "faint" }));
back.push(
  Ln(k.lineOnTop([LABEL.x + 5, LABEL.y + 5], [LABEL.x + 30, LABEL.y + 5], 0.8, P), { tone: "lo", free: true }),
  Ln(k.lineOnTop([LABEL.x + 5, LABEL.y + 8], [LABEL.x + 24, LABEL.y + 8], 0.8, P), { tone: "lo", free: true }),
  Ln(k.lineOnTop([LABEL.x + 5, LABEL.y + 11], [LABEL.x + 18, LABEL.y + 11], 0.8, P), { tone: "lo", free: true }),
);
back.push(Dots([at([LABEL.x + 3, LABEL.y + 3, 0.8]), at([LABEL.x + LABEL.w - 3, LABEL.y + LABEL.d - 3, 0.8])], { size: 0.45 }));
R.solid(A.slab(LABEL, 0, 0.8, { name: "stand.label" }, 4));

/* ── 문자발생기 보드 ─────────────────────────────────── */

for (const [x, y] of k.corners(PCB, 5)) cyl("board.standoff", x, y, 2.2, 0, PCB_Z, { tone: "mid" });
const fingers = k.topTicks(PCB.x + 10, PCB.x + 52, 1.5, 1000, PCB.y + PCB.d - 3.2, PCB_TOP, [3.2, 3.2], P);
box("board.pcb", PCB, PCB_Z, 1.6, { tone: "lo" }, {
  bevel: 0.4,
  extra: Ln(fingers.minor, { tone: "lo" }) + Ln(k.lineOnTop([PCB.x + 10, PCB.y + PCB.d - 3.2], [PCB.x + 52, PCB.y + PCB.d - 3.2], PCB_TOP, P), { tone: "lo" }) + Dots(k.corners(PCB, 5).map(([x, y]: number[]) => at([x, y, PCB_TOP])), { size: 0.5 }),
});
const SINK: Plan = { x: -136, y: -40, w: 30, d: 30, r: 1 };
box("board.sink", SINK, PCB_TOP, 2.4, { tone: "mid" }, { bevel: 0.4 });
for (let index = 0; index < 6; index++) box("board.fin", { x: SINK.x + 1.2 + index * 5.2, y: SINK.y, w: 1.6, d: SINK.d, r: 0.3 }, PCB_TOP + 2.4, 7, { tone: "mid" }, { steps: 2 });
box("board.chip", { x: -98, y: -42, w: 14, d: 11, r: 0.6 }, PCB_TOP, 1.6, { tone: "mid" }, { extra: Dots([at([-96, -40, PCB_TOP + 1.6])], { size: 0.45 }) });
box("board.chip", { x: -98, y: -26, w: 14, d: 14, r: 0.6 }, PCB_TOP, 1.6, { tone: "mid" }, { extra: Dots([at([-96, -24, PCB_TOP + 1.6])], { size: 0.45 }) });
box("board.chip", { x: -122, y: -4, w: 9, d: 6, r: 0.5 }, PCB_TOP, 1.2, { tone: "mid" });
for (const x of [-108, -103, -98]) cyl("board.cap", x, -4, 1.3, PCB_TOP, 2.8, { tone: "mid" });
box("board.foot", { x: BRACKET_FACE, y: PCB.y, w: 8, d: PCB.d, r: 0.4 }, 0, 1.6, { tone: "lo" }, { extra: Dots([at([BRACKET_FACE + 5, PCB.y + 6, 1.6]), at([BRACKET_FACE + 5, PCB.y + PCB.d - 6, 1.6])], { size: 0.5 }) });
box("board.bracket", { x: BRACKET_X, y: PCB.y, w: 2, d: PCB.d, r: 0.3 }, 0, BRACKET_TOP, { tone: "mid" }, {
  steps: 2,
  extra: Ln(k.planOutline({ x: BRACKET_X, y: PCB.y + 22, w: 2, d: 8, r: 1 }, BRACKET_TOP, P), { tone: "faint" }),
});
const keyStart = bnc("board.key", east(BRACKET_FACE, KEY_Y, BOARD_JACK_Z));
const fillStart = bnc("board.fill", east(BRACKET_FACE, FILL_Y, BOARD_JACK_Z));

/* ── 영상 스위처 ─────────────────────────────────────── */

box("switcher.panel", PANEL, 0, PANEL_TOP, { tone: "mid", inner: Ln(k.sideSeam(PANEL, 4, P, 3), { tone: "faint" }) }, {
  bevel: 1,
  extra:
    Ln(k.planOutline(k.insetPlan({ x: PANEL.x, y: 15, w: PANEL.w, d: 45, r: 3 }, 4), PANEL_TOP, P), { tone: "faint" }) +
    Ln([[-26, 56], [92, 56]].map(([x, y]) => k.ring(x, y, 1.8, PANEL_TOP, P, 16)).join(""), { tone: "lo" }) +
    Dots([at([-26, 56, PANEL_TOP]), at([92, 56, PANEL_TOP])], { size: 0.5 }),
});
box("switcher.riser", RISER, PANEL_TOP, RISER_TOP - PANEL_TOP, { tone: "mid" }, {
  bevel: 0.5,
  extra: [
    [FILL_X, "FILL"],
    [KEY_X, "KEY"],
    [PGM_X, "PGM"],
  ]
    .map(([x, text]) => k.faceTextSvg(k.sideMatrix([x as number, RISER_FACE], PANEL_TOP + 2.2, P, "left"), text as string, { size: 2.6, tone: "lo", anchor: "middle" }))
    .join(""),
});
const fillEnd = bnc("switcher.fill", up(FILL_X, JACK_Y, RISER_TOP));
const keyEnd = bnc("switcher.key", up(KEY_X, JACK_Y, RISER_TOP));
const pgmStart = bnc("switcher.pgm", up(PGM_X, JACK_Y, RISER_TOP));

export const CAMERA_BUTTONS: Plan[] = Array.from({ length: CAMERAS }, (_, index) => ({ x: -4 + index * 15, y: 24, w: 11, d: 9, r: 1.5 }));
CAMERA_BUTTONS.forEach((plan, index) => box("switcher.cam", plan, PANEL_TOP, 3.2, { tone: "mid" }, { bevel: 0.4, part: `cam-${index}` }));
CAMERA_BUTTONS.forEach((plan) => box("switcher.pvw", { x: plan.x + 1, y: 38, w: 9, d: 7, r: 1.2 }, PANEL_TOP, 2.2, { tone: "lo" }, { bevel: 0.3 }));
box("switcher.dsk", { x: 70, y: 24, w: 14, d: 10, r: 1.8 }, PANEL_TOP, 3.6, { tone: "mid" }, { bevel: 0.4, part: "dsk" });
for (const x of [74, 88]) {
  cyl("switcher.knob", x, 47, 4.4, PANEL_TOP, 4.6, { tone: "mid" }, Ln(k.knurl(x, 47, 4.4, PANEL_TOP + 0.6, PANEL_TOP + 4, 28, P), { tone: "lo" }) + Ln(k.lineOnTop([x - 2, 47], [x + 3.2, 47], PANEL_TOP + 4.6, P), { tone: "hi" }));
}

/* ── PGM 모니터 ──────────────────────────────────────── */

box("monitor.foot", FOOT, 0, FOOT_TOP, { tone: "mid" }, {
  steps: 6,
  bevel: 0.8,
  extra: Ln([[FOOT.x + 5, FOOT.y + FOOT.d - 5], [FOOT.x + FOOT.w - 5, FOOT.y + FOOT.d - 5]].map(([x, y]) => k.ring(x, y, 1.6, FOOT_TOP, P, 16)).join(""), { tone: "lo" }),
});
box("monitor.neck", NECK, FOOT_TOP, BODY_Z - FOOT_TOP, { tone: "mid" }, { steps: 2 });
box("monitor.back", { x: -25, y: -73, w: 140, d: 7, r: 3 }, 40, 80, { tone: "lo" }, {
  extra: Ln([0, 1, 2, 3, 4].map((index) => k.planOutline({ x: -8 + index * 24, y: -71, w: 14, d: 2, r: 1 }, 120, P)).join(""), { tone: "faint" }),
});

const SCREEN_MATRIX = k.sideMatrix([SCREEN.x, FACE_Y], SCREEN.z, P, "left");
const [SW, SH] = [106, 60];

/** 카메라마다 다른 장면. 실제 영상이 아니라 "다른 화면"임을 알아볼 만큼만 그린다 */
function sceneOf(camera: number) {
  const wall = `<rect class="cg-wall" width="${SW}" height="${SH}"/>`;
  const floor = (y: number) => `<rect class="cg-floor" y="${y}" width="${SW}" height="${SH - y}"/>`;
  const heads = (y: number, from: number, to: number, gap: number, r: number) =>
    Array.from({ length: Math.floor((to - from) / gap) + 1 }, (_, index) => `<circle class="cg-figure" cx="${from + index * gap}" cy="${y}" r="${r}"/>`).join("");
  const bodies = (y: number, from: number, to: number, gap: number, w: number, h: number) =>
    Array.from({ length: Math.floor((to - from) / gap) + 1 }, (_, index) => `<rect class="cg-figure" x="${from + index * gap - w / 2}" y="${y}" width="${w}" height="${h}" rx="${w / 2}"/>`).join("");
  const scenes = [
    // CAM1: 강대상 가까이
    `${wall}${floor(44)}<path class="cg-mark" d="M53 4V16M48 8H58"/>${bodies(27, 53, 53, 1, 20, 18)}<circle class="cg-figure" cx="53" cy="21" r="5"/><path class="cg-object" d="M38 60 42 36H64L68 60Z"/>`,
    // CAM2: 강단 전체
    `${wall}${floor(40)}${heads(18, 18, 88, 6, 1.8)}${bodies(20, 18, 88, 6, 3.6, 5)}${heads(27, 21, 85, 6, 1.8)}${bodies(29, 21, 85, 6, 3.6, 5)}<path class="cg-object" d="M10 40H96V44H10ZM4 44H102V48H4Z"/>${bodies(30, 53, 53, 1, 5, 8)}<circle class="cg-figure" cx="53" cy="28" r="2"/><path class="cg-object" d="M49 40 50 34H56L57 40Z"/>`,
    // CAM3: 성가대
    `${wall}${floor(50)}${[14, 28, 42].map((y, row) => heads(y, 12 + row * 3, 94, 10, 3.4) + bodies(y + 3.4, 12 + row * 3, 94, 10, 7, 8)).join("")}`,
    // CAM4: 회중석 너머 강단
    `${wall}${floor(30)}<path class="cg-object" d="M30 22H76V30H30Z"/>${[36, 44, 52].map((y, row) => `<rect class="cg-object" x="${6 - row * 4}" y="${y + 4}" width="${94 + row * 8}" height="3"/>` + heads(y, 10 - row * 2, 96 + row * 2, 7 + row, 2 + row * 0.5)).join("")}`,
  ];
  return `<g class="cg-scene" data-scene="${camera}" style="opacity:${camera === 0 ? 1 : 0}">${scenes[camera]}</g>`;
}

/** KEY 모양: 자막 띠와 오른쪽 위 로고. FILL은 같은 모양에 색과 글자를 얹는다 */
const KEY_SHAPE = `<rect x="8" y="42" width="66" height="11" rx="1.2"/><circle cx="94" cy="10" r="4.6"/>`;
const HOLE = `<g class="cg-hole" style="opacity:0">${KEY_SHAPE}</g>`;
const FILL = `<g class="cg-fill" style="opacity:0"><g class="cg-fill-body">${KEY_SHAPE}</g><rect class="cg-fill-tag" x="8" y="42" width="7" height="11" rx="1.2"/><path class="cg-fill-text" d="M19 46H56M19 49.5H44"/><circle class="cg-fill-ring" cx="94" cy="10" r="2.4"/></g>`;
const SCREEN_ART =
  `<g transform="${SCREEN_MATRIX}"><clipPath id="cg-screen-clip"><rect width="${SCREEN.w}" height="${SCREEN.h}"/></clipPath>` +
  `<g clip-path="url(#cg-screen-clip)"><g transform="scale(${SCENE_SCALE})">${Array.from({ length: CAMERAS }, (_, index) => sceneOf(index)).join("")}${HOLE}${FILL}</g></g>` +
  `<rect class="cg-glass" width="${SCREEN.w}" height="${SCREEN.h}"/></g>`;

box("monitor.body", BODY, BODY_Z, BODY_TOP - BODY_Z, { tone: "mid" }, {
  steps: 3,
  bevel: 0.8,
  extra: SCREEN_ART + Dots([at([BODY.x + BODY.w - 4, FACE_Y, BODY_Z + 2.6])], { size: 0.7, tone: "hi" }),
});
const monitorEnd = bnc("monitor.in", east(MONITOR_JACK[0], MONITOR_JACK[1], MONITOR_JACK[2]));

/* ── 케이블 ─────────────────────────────────────────── */

const lift = (point: Point3, by: number): Point3 => [point[0], point[1], point[2] + by];
cable("cable.key", [keyStart, [keyStart[0] + 11, KEY_Y, BOARD_JACK_Z], [KEY_X, JACK_Y, 48], keyEnd].map((p) => p as Point3));
cable("cable.fill", [fillStart, [fillStart[0] + 9, FILL_Y, BOARD_JACK_Z], [FILL_X, JACK_Y, 44], fillEnd].map((p) => p as Point3));
cable("cable.pgm", [pgmStart, lift(pgmStart, 12), [156, -14, 46], [156, MONITOR_JACK[1], MONITOR_JACK[2]], monitorEnd]);

/* ── 순서 ───────────────────────────────────────────── */

A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);

export const CG_FIGURE = {
  P,
  recorder: R,
  /** 앞뒤 순서대로 쌓은 SVG 본문 */
  svg: back.join("") + R.items.map((item) => item.svg).join(""),
  /** 버튼을 누를 때 내려가는 거리(화면 좌표) */
  press: k.translateAlong(P, [0, 0, -0.8]) as string,
  scale: KS,
};
