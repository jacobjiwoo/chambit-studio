import { backgroundName, type Background } from "../_lib/background";
import { backgroundStyle } from "./background-style";

/** 공통 배경 막대(09). 셋리스트 상세 안에 보인다. 이름은 `_lib/background`의 `backgroundName`이다. */
export type CommonBackgroundBarProps = {
  background: Background;
  /** "배경 바꾸기" — 배경 서랍을 공통 범위로 연다 */
  onOpen: () => void;
};

export function CommonBackgroundBar({ background, onOpen }: CommonBackgroundBarProps) {
  return (
    <section className="flex items-center gap-3">
      <div
        aria-hidden
        className="aspect-video w-16 rounded border border-neutral-300"
        style={backgroundStyle(background)}
      />
      <div>
        <h3>공통 배경</h3>
        <p>{backgroundName(background)}</p>
      </div>
      <button type="button" onClick={onOpen}>
        배경 바꾸기
      </button>
    </section>
  );
}
