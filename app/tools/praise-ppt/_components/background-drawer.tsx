import type { Background } from "../_lib/background";

/**
 * 서랍이 어느 범위로 열렸나. 곡 범위면 곡 제목, 곡별 배경 유무, "글로벌로 되돌리기"(곡별 배경
 * 지우기)가 있다.
 */
export type BackgroundTarget =
  | { scope: "common" }
  | { scope: "song"; title: string; hasSongBackground: boolean; onResetToCommon: () => void };

/**
 * 배경 서랍(09). 루트는 서랍이 열렸을 때만 그린다. 콜백은 열린 범위에 묶여 있다.
 */
export type BackgroundDrawerProps = {
  target: BackgroundTarget;
  /** 그 범위에 지금 적용된 배경. 곡 범위에서 곡별 배경이 없으면 공통 배경이다 */
  background: Background;
  /** 프리셋이나 이미지를 고르면 바로 부른다. 곡 범위면 곡별 배경을 정한다 */
  onChange: (background: Background) => void;
  /** 완료, Esc, 바깥 클릭 */
  onClose: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 빈 자리. 채우는 티켓이 지운다
export function BackgroundDrawer(_: BackgroundDrawerProps) {
  return (
    <section>
      <h2>배경</h2>
    </section>
  );
}
