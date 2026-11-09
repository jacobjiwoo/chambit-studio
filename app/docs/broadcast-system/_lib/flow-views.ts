/**
 * 신호 흐름도의 그림(탭) — 연결의 `layers`로 전체 그래프를 그림별로 나누고, 주소·탭 전환에서
 * 어느 그림에 어느 장비를 보일지 정한다. React를 쓰지 않는 순수 함수만 둔다.
 *
 * 그림마다 배치를 따로 계산하므로(숨기는 필터가 아니다) 그림에는 그 그림의 연결에 닿는 점만 나온다.
 * 선의 `index`는 전체 `connections` 배열의 자리 그대로 둔다. 자세히와 미상 끝점 id가 이 자리에 기대서다.
 */
import type { FlowGraph } from "./flow";
import type { Layer } from "./system";

export type ViewId = Layer;

/** 탭 순서와 이름. 처음에는 첫 탭을 연다. */
export const views: readonly { readonly id: ViewId; readonly label: string }[] = [
  { id: "video", label: "영상" },
  { id: "audio", label: "오디오" },
  { id: "power", label: "전력" },
  { id: "network", label: "네트워크·제어" },
];

export const DEFAULT_VIEW: ViewId = views[0].id;

export function isViewId(value: string | null): value is ViewId {
  return views.some((v) => v.id === value);
}

/** 고른 점. 장비 점이나 선이다. 아무것도 고르지 않으면 null이다. */
export type Selection = { readonly kind: "node" | "edge"; readonly id: string } | null;

/**
 * 전체 그래프에서 `view`에 속한 연결과 그 연결에 닿는 점만 남긴다. 점 순서는 전체 그래프의 순서를
 * 따른다. `layersOf[i]`는 `edges[i]`가 아니라 `edge.index`번째 연결의 `layers`다.
 */
export function viewGraph(
  graph: FlowGraph,
  layersOf: readonly { readonly layers: readonly ViewId[] }[],
  view: ViewId,
): FlowGraph {
  const edges = graph.edges.filter((e) => layersOf[e.index].layers.includes(view));
  const touched = new Set(edges.flatMap((e) => [e.source, e.target]));
  return { nodes: graph.nodes.filter((n) => touched.has(n.id)), edges };
}

export type ViewGraphs = Readonly<Record<ViewId, FlowGraph>>;

/** 이 점이 나오는 그림. 탭 순서대로다. */
export function viewsWithNode(graphs: ViewGraphs, id: string): ViewId[] {
  return views.filter((v) => graphs[v.id].nodes.some((n) => n.id === id)).map((v) => v.id);
}

export type Entry = { readonly view: ViewId; readonly device: string | null };

/**
 * 주소(`?view=&device=`)로 처음 열 그림과 고를 장비.
 * - `view`가 맞으면 그 그림. 장비가 그 그림에 없으면 장비는 고르지 않는다.
 * - `view`가 없거나 틀리고 `device`만 맞으면 그 장비가 나오는 첫 탭.
 * - 그 밖에는 첫 탭에서 아무것도 고르지 않는다.
 */
export function resolveEntry(search: string, graphs: ViewGraphs): Entry {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  const device = params.get("device");
  if (isViewId(view)) {
    const has = device !== null && graphs[view].nodes.some((n) => n.id === device);
    return { view, device: has ? device : null };
  }
  const first = device === null ? undefined : viewsWithNode(graphs, device)[0];
  return first ? { view: first, device } : { view: DEFAULT_VIEW, device: null };
}

/**
 * 탭을 바꿀 때 남길 선택. 새 그림에도 있는 장비는 그대로 두고, 없거나 선이면 푼다. 선의 자리는
 * 그림마다 달라서 선은 넘기지 않는다.
 */
export function selectionAfterSwitch(selection: Selection, next: FlowGraph): Selection {
  if (selection?.kind === "node" && next.nodes.some((n) => n.id === selection.id)) {
    return selection;
  }
  return null;
}

/** 현재 주소의 쿼리에 `view`와 `device`를 쓴 새 쿼리. `device`가 null이면 지운다. 다른 쿼리는 둔다. */
export function withViewParams(search: string, view: ViewId, device: string | null): string {
  const params = new URLSearchParams(search);
  params.set("view", view);
  if (device === null) params.delete("device");
  else params.set("device", device);
  return `?${params.toString()}`;
}
