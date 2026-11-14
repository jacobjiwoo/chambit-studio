/**
 * 장비 생김새 그림의 공통 틀. 장비 하나를 앞·뒤 두 시점으로 그리고, 그림 속 단자·구역에 이름을 단다.
 *
 * 장비 모듈(`av-hs410-figure.ts` 등)은 장비 좌표(X: 조작하는 사람이 본 왼쪽 → 오른쪽, Y: 앞 → 뒤,
 * Z: 위, 단위 mm)로 부품을 놓는다. 이 모듈이 시점에 맞춰 세계 좌표로 옮기고, anatomy audit
 * 기록기에 실제 모양을 남겨 겹치는 곳의 앞뒤 순서를 정한다(`A.settle`).
 *
 * 빌드 때 서버에서 한 번 계산한다. 브라우저는 결과 SVG만 받는다.
 */
import * as A from "./anatomy/audit.mjs";
import * as k from "./anatomy/iso-kit.mjs";
import * as G from "./anatomy/lathe.mjs";

export type Point3 = number[];
type Flat = number[];
export interface Frame {
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
  put(options: Record<string, unknown>): Item;
  solid<T>(shape: T): T;
}
export type Style = { tone?: string; crease?: string; lit?: boolean; flat?: boolean; inner?: string };
export interface PartOptions {
  /** 이 부품이 속한 단자·구역 이름. 누르면 이 이름이 켜진다 */
  spot?: string;
  /** 몸통 위에 얹는 선·글자 */
  extra?: string;
  bias?: number;
}

/** 그림 속에서 누를 수 있는 단자나 구역 */
export interface Spot {
  /** 매뉴얼에 적힌 이름 그대로 */
  name: string;
  kind: "port" | "area";
  /** 이름만으로 알 수 없을 때만 붙이는 한 줄 */
  note?: string;
}

export type ViewKey = "front" | "back";

export interface DeviceView {
  key: ViewKey;
  width: number;
  height: number;
  /** 화면 낭독기에 읽어 줄 그림 설명 */
  label: string;
  svg: string;
  spots: Spot[];
  /** 테스트가 audit을 돌릴 기록 */
  recorder: unknown;
  P: unknown;
}

export interface DeviceFigure {
  /** `system.ts`의 장비 id */
  id: string;
  model: string;
  /** 그림의 근거 문서 */
  source: string;
  /** 실물과 다른 점. 캡션에 그대로 쓴다 */
  caveat: string;
  views: DeviceView[];
  /** 매뉴얼의 단자 이름. `system.ts`의 `port`가 여기 있어야 한다 */
  ports: string[];
  /**
   * `system.ts`가 아직 다른 표기로 적은 단자 이름 → 매뉴얼 이름. 데이터를 매뉴얼 표기로 고치면 비운다.
   */
  aliases: Record<string, string>;
}

/** 기울어진 평면. 장비 좌표의 X축을 품고, 앞에서 뒤로 `angle`만큼 올라간다 */
export interface Plane {
  /** 평면 위의 점. `s`는 기준선에서 오르막으로 잰 거리, `h`는 평면에서 떠 있는 높이 */
  at(X: number, s: number, h?: number): Point3;
  /** 바깥을 보는 법선(장비 좌표) */
  normal: Point3;
  /** 오르막 방향(장비 좌표) */
  rise: Point3;
}

/**
 * `(y0, z0)`를 지나고 앞에서 뒤로 `degrees`만큼 올라가는 평면. `flip`이면 법선이 뒤(+Y)를 본다.
 * 뒷면 패널은 `plane(깊이, 0, 90, true)`다.
 */
export function plane(y0: number, z0: number, degrees: number, flip = false): Plane {
  const angle = (degrees * Math.PI) / 180;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  const rise = [0, cos, sin];
  const normal = flip ? [0, sin, -cos] : [0, -sin, cos];
  return {
    rise,
    normal,
    at: (X, s, h = 0) => [X + normal[0] * h, y0 + cos * s + normal[1] * h, z0 + sin * s + normal[2] * h],
  };
}

export interface SceneOptions {
  view: ViewKey;
  width: number;
  height: number;
  azimuth: number;
  elevation: number;
  pad?: number;
  /** 장비의 가로·깊이·높이(mm) */
  size: [number, number, number];
  /** 그림에 꼭 들어와야 하는 바깥 점들(장비 좌표). 없으면 장비를 감싼 상자의 여덟 모서리다 */
  extents?: Point3[];
}

/** 모서리를 둥글린 사각형. 가운데가 원점이다 */
export function roundRect(w: number, d: number, r = 0, steps = 3): number[][] {
  const radius = Math.min(r, w / 2, d / 2);
  if (radius <= 0) return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
  const points: number[][] = [];
  const corners = [
    [w / 2 - radius, -d / 2 + radius, -Math.PI / 2],
    [w / 2 - radius, d / 2 - radius, 0],
    [-w / 2 + radius, d / 2 - radius, Math.PI / 2],
    [-w / 2 + radius, -d / 2 + radius, Math.PI],
  ];
  for (const [cx, cy, start] of corners) {
    for (let index = 0; index <= steps; index++) {
      const t = start + (index / steps) * (Math.PI / 2);
      points.push([cx + radius * Math.cos(t), cy + radius * Math.sin(t)]);
    }
  }
  return points;
}

const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttribute = (text: string) => escapeText(text).replace(/"/g, "&quot;");

export type Scene = ReturnType<typeof scene>;

export function scene({ view, width, height, azimuth, elevation, pad = 28, size, extents }: SceneOptions) {
  const [WIDTH, DEPTH, TALL] = size;
  // 앞 시점은 앞면이, 뒤 시점은 뒷면이 보는 사람 쪽(+y)으로 온다
  const sx = view === "front" ? 1 : -1;
  const sy = view === "front" ? -1 : 1;
  /** 장비 좌표의 점 → 세계 좌표 */
  const W = ([X, Y, Z]: Point3): Point3 => [sx * (X - WIDTH / 2), sy * (Y - DEPTH / 2), Z];
  /** 장비 좌표의 방향 → 세계 좌표 */
  const D = ([X, Y, Z]: Point3): Point3 => [sx * X, sy * Y, Z];

  const P = k.fitProjection(
    (extents ?? [[0, 0, 0], [WIDTH, 0, 0], [0, DEPTH, 0], [WIDTH, DEPTH, 0], [0, 0, TALL], [WIDTH, 0, TALL], [0, DEPTH, TALL], [WIDTH, DEPTH, TALL]]).map(W) as never,
    width,
    height,
    { pad, azimuth, elevation },
  );
  const R = A.recorder(P) as unknown as Recorder;
  const at = (point: Point3): Flat => k.iso(W(point) as [number, number, number], P);
  const S = (paths: unknown, style: Style = {}) => k.solidSvg(paths, { tone: "mid", ...style }) as string;
  const spots: Spot[] = [];
  const back: string[] = [];

  function spot(name: string, kind: Spot["kind"], note?: string) {
    if (!spots.some((entry) => entry.name === name)) spots.push({ name, kind, ...(note ? { note } : {}) });
    return name;
  }

  function put(name: string, ref: Point3, svg: string, shapes: unknown[], { spot: on, bias = 0 }: PartOptions = {}) {
    const body = on ? `<g data-spot="${escapeAttribute(on)}">${svg}</g>` : svg;
    return R.put({ name, at: W(ref), bias, svg: body, shapes, piece: "device" });
  }

  /** 오른손 좌표 틀. 법선 `a`와 가로 방향 `u`는 장비 좌표로 준다 */
  function frame(o: Point3, a: Point3, u: Point3): Frame {
    const [aw, uw] = [G.unit3(D(a)), G.unit3(D(u))];
    return G.frameOf(W(o), aw, uw, G.cross3(aw, uw)) as Frame;
  }
  const local = (F: Frame, point: Point3) => {
    const delta = G.sub3(W(point), F.o);
    return [G.dot3(delta, F.u), G.dot3(delta, F.v)];
  };

  /** 평면 위에 선 상자. `X0..X1`, `s0..s1`이 바닥이고 `h0..h1`이 높이다 */
  function box(name: string, on: Plane, [X0, X1]: number[], [s0, s1]: number[], [h0, h1]: number[], style: Style = {}, options: PartOptions & { r?: number; steps?: number } = {}) {
    const centre = on.at((X0 + X1) / 2, (s0 + s1) / 2, 0);
    const F = frame(centre, on.normal, [1, 0, 0]);
    const polygon = roundRect(Math.abs(X1 - X0), Math.abs(s1 - s0), options.r ?? 0, options.steps ?? 2);
    const shape = R.solid(A.prism(F as never, polygon, h0, h1, { name }));
    put(name, on.at((X0 + X1) / 2, (s0 + s1) / 2, (h0 + h1) / 2), S(G.prismOf(F as never, polygon, h0, h1, P as never), style) + (options.extra ?? ""), [shape], options);
    return F;
  }

  /** 평면 위에 선 임의 다각형 기둥. 꼭짓점은 `[X, s]`다 */
  function post(name: string, on: Plane, points: number[][], [h0, h1]: number[], style: Style = {}, options: PartOptions = {}) {
    const cx = points.reduce((sum, [X]) => sum + X, 0) / points.length;
    const cs = points.reduce((sum, [, s]) => sum + s, 0) / points.length;
    const F = frame(on.at(cx, cs, 0), on.normal, [1, 0, 0]);
    const polygon = points.map(([X, s]) => local(F, on.at(X, s, 0)));
    const shape = R.solid(A.prism(F as never, polygon, h0, h1, { name }));
    put(name, on.at(cx, cs, (h0 + h1) / 2), S(G.prismOf(F as never, polygon, h0, h1, P as never), style) + (options.extra ?? ""), [shape], options);
  }

  /** 평면 위에 선 원기둥 */
  function round(name: string, on: Plane, [X, s]: number[], r: number, [h0, h1]: number[], style: Style = {}, options: PartOptions = {}) {
    const F = frame(on.at(X, s, 0), on.normal, [1, 0, 0]);
    const shape = R.solid(A.disc(F as never, h0, h1, r, { name }));
    put(name, on.at(X, s, (h0 + h1) / 2), S(G.disc(h0, h1, r, F as never, P as never, {}), style) + (options.extra ?? ""), [shape], options);
    return F;
  }

  /** 평면에서 돌려 깎은 부품. `profile`은 `[높이, 반지름]`이다 */
  function turned(name: string, on: Plane, [X, s]: number[], profile: number[][], style: Style = {}, options: PartOptions & { ribs?: number[] } = {}) {
    const F = frame(on.at(X, s, 0), on.normal, [1, 0, 0]);
    const meta = { radius: null, name };
    const shape = R.solid(A.solid(F as never, profile, meta));
    const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
    // 손잡이의 세로 홈 `[시작 높이, 끝 높이, 반지름, 개수, 끝 반지름?]`. 옆으로 돌아가며 흐려진다
    const ribs = options.ribs ? (k.fadedSvg(G.ribsOf(F as never, options.ribs[0], options.ribs[1], options.ribs[2], options.ribs[3], P as never, { fade: [0.1, 0.55] as never, r1: options.ribs[4] ?? options.ribs[2] }), { tone: "lo" }) as string) : "";
    put(name, on.at(X, s, mid), S(G.solidOf(profile, F as never, P as never, {}), { ...style, inner: ribs }) + (options.extra ?? ""), [shape], options);
    return F;
  }

  /** 장비를 가로(X)로 꿰는 기둥. `profile`은 옆에서 본 단면 `[Y, Z]`다 */
  function span(name: string, [X0, X1]: number[], profile: number[][], style: Style = {}, options: PartOptions = {}) {
    const F = frame([X0, 0, 0], [1, 0, 0], [0, 1, 0]);
    const polygon = profile.map(([Y, Z]) => local(F, [X0, Y, Z]));
    const shape = R.solid(A.prism(F as never, polygon, 0, X1 - X0, { name, ...(name.startsWith("stand.") ? { ground: true } : {}) }));
    const cy = profile.reduce((sum, [Y]) => sum + Y, 0) / profile.length;
    const cz = profile.reduce((sum, [, Z]) => sum + Z, 0) / profile.length;
    put(name, [(X0 + X1) / 2, cy, cz], S(G.prismOf(F as never, polygon, 0, X1 - X0, P as never), style) + (options.extra ?? ""), [shape], options);
  }

  /** 평면 위의 꺾은선. 꼭짓점은 `[X, s]`다 */
  const lineOn = (on: Plane, points: number[][], h = 0, closed = false) => k.pathOf(points.map(([X, s]) => at(on.at(X, s, h))), closed) as string;
  const rectOn = (on: Plane, [X0, X1]: number[], [s0, s1]: number[], h = 0) => lineOn(on, [[X0, s0], [X1, s0], [X1, s1], [X0, s1]], h, true);
  const ringOn = (on: Plane, [X, s]: number[], r: number, h = 0) => G.circleOf(frame(on.at(X, s, 0), on.normal, [1, 0, 0]) as never, h, r, P as never) as string;
  const line = (d: string, style: Record<string, unknown> = {}) => k.lineSvg(d, style) as string;
  const dots = (on: Plane, points: number[][], h = 0, style: Record<string, unknown> = {}) => k.dotsSvg(points.map(([X, s]) => at(on.at(X, s, h))), { size: 0.5, ...style }) as string;

  /** 평면 위에 칠한 조각. 화면 유리처럼 주변보다 어두운 면에 쓴다 */
  const patchOn = (on: Plane, [X0, X1]: number[], [s0, s1]: number[], h = 0, className = "device-glass") => `<path class="${className}" d="${rectOn(on, [X0, X1], [s0, s1], h)}"/>`;

  /**
   * 평면에 인쇄된 글자. 읽는 방향이 화면 오른쪽이 되도록 눕힌다. 조작 패널(법선이 위)은 앞 시점에서,
   * 뒷면 패널은 뒤 시점에서만 바로 읽힌다.
   */
  function textOn(on: Plane, [X, s]: number[], text: string, { size = 3, tone = "lo", anchor = "middle", h = 0.05 }: { size?: number; tone?: string; anchor?: string; h?: number } = {}) {
    const facesBack = on.normal[1] > 0.5;
    const along = facesBack ? -1 : 1;
    const origin = at(on.at(X, s, h));
    const right = at(on.at(X + along, s, h));
    const down = at(on.at(X, s - 1, h));
    const matrix = [right[0] - origin[0], right[1] - origin[1], down[0] - origin[0], down[1] - origin[1], origin[0], origin[1]].map((value) => Math.round(value * 1000) / 1000);
    return `<text class="iso-face-text" data-tone="${tone}" transform="matrix(${matrix.join(" ")})" font-size="${size}" text-anchor="${anchor}">${escapeText(text)}</text>`;
  }

  /** 바닥 그림자. 순서와 상관없이 맨 먼저 그린다 */
  function halo(z: number) {
    const corners = [[0, 0], [WIDTH, 0], [WIDTH, DEPTH], [0, DEPTH]].map(([X, Y]) => at([X, Y, z]));
    back.push(`<path class="iso-halo" d="${k.pathOf(corners, true)}"/>`);
  }

  function finish(label: string): DeviceView {
    A.settle(R as never, P as never);
    R.items.sort((a, b) => a.key - b.key);
    return { key: view, width, height, label, svg: back.join("") + R.items.map((item) => item.svg).join(""), spots, recorder: R, P };
  }

  return { view, P, R, at, spot, put, box, post, round, turned, span, lineOn, rectOn, ringOn, patchOn, line, dots, textOn, halo, finish };
}
