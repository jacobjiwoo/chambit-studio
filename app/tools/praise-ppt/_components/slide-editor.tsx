import type { Background } from "../_lib/background";
import type { SetlistEntry } from "../_lib/setlist";
import type { Song } from "../_lib/song";

/**
 * 슬라이드 편집 서랍(08). 루트는 서랍이 열려 있고 곡을 찾았을 때만 그린다. 콜백은 이 곡에
 * 묶여 있다.
 */
export type SlideEditorProps = {
  song: Song;
  entry: SetlistEntry;
  commonBackground: Background;
  onToggleSlide: (index: number) => void;
  onIncludeAll: () => void;
  onExcludeAll: () => void;
  /** 완료, Esc, 바깥 클릭 */
  onClose: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 빈 자리. 채우는 티켓이 지운다
export function SlideEditor(_: SlideEditorProps) {
  return (
    <section>
      <h2>슬라이드 편집</h2>
    </section>
  );
}
