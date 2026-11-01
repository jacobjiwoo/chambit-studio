import type { Slide } from "../_lib/song";

/** PPT 올리기(06). 슬라이드 추출 `_lib`과 올리기 상태는 06이 둔다. */
export type PptUploadProps = {
  /**
   * 추출이 끝난 올린 곡을 넘긴다. 루트가 음수 id를 배정해 올린 곡 목록에 더하고 셋리스트 맨
   * 뒤에 담는다. `title`은 파일 이름에서 `.ppt`/`.pptx`를 뗀 것, `slides`는 번호 0부터에 이미지
   * data URL이다.
   */
  onAddSong: (title: string, slides: Slide[]) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 빈 자리. 채우는 티켓이 지운다
export function PptUpload(_: PptUploadProps) {
  return (
    <section>
      <h2>PPT 올리기</h2>
    </section>
  );
}
