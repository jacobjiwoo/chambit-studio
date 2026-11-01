import type { Background } from "../_lib/background";

/** 공통 배경 막대(09). 셋리스트 상세 안에 보인다. 이름은 `_lib/background`의 `backgroundName`이다. */
export type CommonBackgroundBarProps = {
  background: Background;
  /** "배경 바꾸기" — 배경 서랍을 공통 범위로 연다 */
  onOpen: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 빈 자리. 채우는 티켓이 지운다
export function CommonBackgroundBar(_: CommonBackgroundBarProps) {
  return (
    <section>
      <h3>공통 배경</h3>
    </section>
  );
}
