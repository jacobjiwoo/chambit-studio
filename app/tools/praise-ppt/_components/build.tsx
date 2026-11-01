import type { Plan } from "../_lib/plan";

/**
 * 만들기 버튼과 만들기 창(10). 창의 상태(진행 중·성공·실패)와 `.pptx` 쓰기 모듈은 10이 이
 * 컴포넌트 아래에 둔다.
 */
export type BuildProps = {
  /** "PPT 만들기 · N곡". 0이면 버튼을 막는다 */
  songCount: number;
  /**
   * 지금 셋리스트의 생성 계획. 실패면 사유를 실패 창에 그대로 보인다. "다시 시도"도 이 계획으로
   * 다시 만든다
   */
  plan: Plan;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 빈 자리. 채우는 티켓이 지운다
export function Build(_: BuildProps) {
  return (
    <section>
      <h2>PPT 만들기</h2>
    </section>
  );
}
