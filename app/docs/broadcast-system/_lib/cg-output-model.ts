/**
 * CG 출력 원리 그림의 모델. 그림이 보여 주는 상태와 화면 합성 순서를 여기서만 정한다.
 *
 * 장비 목록표 "CG 출력 원리" 절의 사실만 담는다.
 * - 문자발생기 보드가 FILL과 KEY를 낸다.
 * - DSK는 KEY 모양대로 PGM을 오려 내고 그 자리에 FILL을 채운다.
 * - DSK ON/OFF로 CG를 켜고 끈다. 카메라를 바꿔도 CG는 남는다.
 */

export const CAMERAS = 4;

export interface CgState {
  /** PGM으로 고른 카메라. 0이 CAM1이다 */
  camera: number;
  dsk: boolean;
}

export const REST: CgState = { camera: 0, dsk: false };

export function readoutOf({ camera, dsk }: CgState) {
  return dsk ? `DSK ON · PGM CAM${camera + 1} + CG` : `DSK OFF · PGM CAM${camera + 1}`;
}

/** 아무도 만지지 않을 때 도는 순서. [시작 초, 상태] */
const TOUR: Array<[number, CgState]> = [
  [0, { camera: 0, dsk: false }],
  [1.8, { camera: 0, dsk: true }],
  [4.6, { camera: 1, dsk: true }],
  [6.8, { camera: 2, dsk: true }],
  [9, { camera: 3, dsk: true }],
  [11.2, { camera: 3, dsk: false }],
  [13, { camera: 1, dsk: false }],
];

export const TOUR_LENGTH = 15;

export function tourAt(t: number): CgState {
  const at = ((t % TOUR_LENGTH) + TOUR_LENGTH) % TOUR_LENGTH;
  let state = TOUR[0][1];
  for (const [start, next] of TOUR) if (at >= start) state = next;
  return { ...state };
}

/** 오려 내기가 끝나고 FILL이 차기 시작하는 지점 */
const CUT = 0.45;

const smooth = (from: number, to: number, value: number) => {
  const u = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return u * u * (3 - 2 * u);
};

/**
 * DSK가 얼마나 얹혔는지(0–1)에서 화면에 그릴 두 겹의 진하기를 낸다.
 * `hole`은 KEY 모양대로 PGM을 오려 낸 자리, `fill`은 그 자리를 채운 FILL이다.
 * 실제 DSK는 한 번에 얹히지만, 그림은 두 단계를 천천히 나눠 보인다.
 */
export function layersOf(progress: number) {
  return { hole: smooth(0, CUT, progress), fill: smooth(CUT, 1, progress) };
}
