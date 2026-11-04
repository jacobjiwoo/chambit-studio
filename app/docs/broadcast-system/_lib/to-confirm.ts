/**
 * 확인 필요 목록. 장비·연결 데이터(`system.ts`)의 `toConfirm`을 모아 장비 목록표 파트별로 묶는다.
 *
 * 확인이 끝나 데이터에서 `toConfirm`을 지우면 목록에서도 사라진다. 목록을 손으로 고치지 않는다.
 */
import {
  connectionText,
  type AnyEndpoint,
  type AnyLink,
  type Connection,
  type Equipment,
  type EquipmentToConfirm,
  type Part,
  type Priority,
} from "./system";

/** 우선순위가 없는 줄은 맨 끝이다. */
const UNRANKED = Number.MAX_SAFE_INTEGER;

const PART_ORDER: readonly Part[] = ["전원", "영상·온라인 송출", "네트워크", "음향", "조명", "기타"];

/** 장비 목록 밖(테스트 등)에서도 쓰도록 id를 `string`으로 넓힌 장비. */
type EquipmentSource = Pick<Equipment, "part"> & {
  readonly id: string;
  readonly toConfirm: readonly Pick<EquipmentToConfirm, "what" | "priority">[];
};

type LinkSource = AnyLink &
  Pick<Connection, "signal" | "detail" | "evidence" | "toConfirm" | "priority">;

/**
 * 목록의 한 줄. `subjects`는 장비 목록표에서 이 줄이 걸린 행(장비 id)이다. 연결의 확인할
 * 거리면 `connection`에 연결 한 줄이 있다.
 */
export type ToConfirmItem = {
  readonly subjects: readonly string[];
  readonly connection?: string;
  readonly what: string;
  readonly priority?: Priority;
};

export type ToConfirmGroup = {
  readonly part: Part;
  readonly items: readonly ToConfirmItem[];
};

export function collectToConfirm(
  list: readonly EquipmentSource[],
  links: readonly LinkSource[],
): ToConfirmGroup[] {
  const partOf = new Map(list.map((e) => [e.id, e.part]));
  const fromEquipment = list.flatMap((e) =>
    e.toConfirm.map((t) => ({
      part: e.part,
      item: { subjects: [e.id], what: t.what, priority: t.priority },
    })),
  );
  // 연결은 끝점 장비 행 모두에 보이므로 그 행들을 다 건다. 파트는 첫 장비(출발, 도착, 후보 순)를 따른다.
  const fromLinks = links.flatMap((c) => {
    const ends = [c.from, c.to];
    const subjects = [
      ...new Set([...ends.flatMap(knownIds), ...ends.flatMap(candidateIds)]),
    ].filter((id) => partOf.has(id));
    const part = partOf.get(subjects[0]);
    if (!part) return [];
    const connection = connectionText(c);
    return c.toConfirm.map((what) => ({ part, item: { subjects, connection, what, priority: c.priority } }));
  });
  const items = [...fromEquipment, ...fromLinks];
  return PART_ORDER.map((part) => ({
    part,
    // sort는 안정 정렬이라 같은 우선순위끼리는 데이터 순서가 남는다.
    items: items
      .filter((x) => x.part === part)
      .map((x) => x.item)
      .sort((a, b) => (a.priority ?? UNRANKED) - (b.priority ?? UNRANKED)),
  })).filter((g) => g.items.length > 0);
}

function knownIds(end: AnyEndpoint): string[] {
  return "id" in end ? [end.id] : [];
}

function candidateIds(end: AnyEndpoint): string[] {
  return "unknown" in end ? [...(end.candidates ?? [])] : [];
}
