import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { countUsedSlides } from "../_lib/plan";
import type { Setlist, SetlistEntry } from "../_lib/setlist";
import type { FindSong, Song } from "../_lib/song";

/** dnd-kit 기본 안내는 영어라 한국어로 준다. 끌기 손잡이의 `aria-describedby`가 읽는다 */
const SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "스페이스 바를 누르면 곡을 들어요. 위아래 화살표로 옮기고, 스페이스 바를 다시 누르면 놓아요. " +
    "Esc를 누르면 취소해요.",
};

/** 셋리스트 순서 목록(07). "N장 사용"은 `_lib/plan`의 `countUsedSlides`로 센다. */
export type SetlistOrderProps = {
  setlist: Setlist;
  /** 곡 목록과 올린 곡에서 찾는다. 못 찾으면 `undefined`다 */
  findSong: FindSong;
  onRemove: (songId: number) => void;
  /** `from` 자리의 곡을 `to` 자리로 옮긴다. 같은 자리거나 범위 밖이면 아무 일도 없다 */
  onMove: (from: number, to: number) => void;
};

export function SetlistOrder({ setlist, findSong, onRemove, onMove }: SetlistOrderProps) {
  // 4px 안의 클릭은 드래그로 시작하지 않는다
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // 놓은 자리에 있던 곡의 위치로 옮긴다
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = setlist.findIndex((entry) => entry.songId === active.id);
    const to = setlist.findIndex((entry) => entry.songId === over.id);
    onMove(from, to);
  };

  // 곡 목록에서 못 찾은 곡은 정리되기 전까지 순번·곡 수·드래그 대상에서 모두 뺀다
  const rows = setlist.flatMap((entry) => {
    const song = findSong(entry.songId);
    return song ? [{ entry, song }] : [];
  });

  // 스크린 리더 안내. id 대신 곡 제목과 1부터 센 자리로 말한다
  const titleOf = (id: UniqueIdentifier) =>
    rows.find(({ entry }) => entry.songId === id)?.song.title ?? "곡";
  const orderOf = (id: UniqueIdentifier) =>
    rows.findIndex(({ entry }) => entry.songId === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${titleOf(active.id)}을(를) 들었어요.`,
    onDragOver: ({ active, over }) =>
      over ? `${titleOf(active.id)}을(를) ${orderOf(over.id)}번째 자리 위에 두었어요.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${titleOf(active.id)}을(를) ${orderOf(over.id)}번째로 옮겼어요.`
        : `${titleOf(active.id)}을(를) 놓았어요.`,
    onDragCancel: ({ active }) =>
      `옮기기를 취소했어요. ${titleOf(active.id)}은(는) 제자리에 있어요.`,
  };

  return (
    <section>
      <h2>셋리스트 순서</h2>
      <p>{rows.length}곡</p>
      {rows.length === 0 ? (
        <p>아직 담긴 곡이 없어요. 곡을 검색해 담아 보세요.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
          accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
        >
          <SortableContext
            items={rows.map(({ entry }) => entry.songId)}
            strategy={verticalListSortingStrategy}
          >
            <ol>
              {rows.map(({ entry, song }, index) => (
                <SetlistOrderItem
                  key={entry.songId}
                  order={index + 1}
                  song={song}
                  entry={entry}
                  onRemove={() => onRemove(entry.songId)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

type SetlistOrderItemProps = {
  /** 1부터 센 순번. 기본 스타일이 `<ol>`의 번호를 지우니 직접 쓴다 */
  order: number;
  song: Song;
  entry: SetlistEntry;
  onRemove: () => void;
};

function SetlistOrderItem({ order, song, entry, onRemove }: SetlistOrderItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: entry.songId,
  });

  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <button type="button" aria-label={`${song.title} 순서 바꾸기`} {...attributes} {...listeners}>
        ⠿
      </button>{" "}
      {order}. {song.title} — {countUsedSlides(song, entry)}장 사용{" "}
      <button type="button" aria-label={`${song.title} 빼기`} onClick={onRemove}>
        빼기
      </button>
    </li>
  );
}
