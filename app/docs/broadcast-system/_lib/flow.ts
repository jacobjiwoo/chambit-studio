/**
 * 신호 흐름도의 그래프 — `system.ts`의 장비·외부 지점·연결을 점과 선으로 바꾸고, 장비를
 * 골랐을 때 칠할 하류·상류를 계산한다. React를 쓰지 않는 순수 함수만 둔다.
 *
 * 하류·상류는 연결 방향을 따라가는 단순 탐색이다. 장비마다 필수 입력을 정하는 정밀 모델은
 * 직렬 구조가 확인될 때까지 미룬다(.scratch/broadcast-system-visuals/map.md).
 */
import type { Connection, Endpoint } from "./system";

/** 그래프의 점. 장비, 외부 지점, 연결마다 따로 생기는 미상 끝점 셋이다. */
export type FlowNode = {
  readonly id: string;
  readonly kind: "equipment" | "external" | "unknown";
  /** 그림에 보이는 이름. */
  readonly label: string;
  /**
   * 점 자체가 미확인이면 true다. 지금은 미상 끝점만 그렇다. 장비의 확인할 거리(모델, 위치 등)는
   * 장비 대부분에 있어 그림에 배지로 달면 구분이 안 되므로, 고르면 보이는 자세히에만 둔다.
   */
  readonly unconfirmed: boolean;
};

/** 그래프의 선. `index`는 `connections` 배열 안의 자리다. */
export type FlowEdge = {
  readonly id: string;
  readonly index: number;
  readonly source: string;
  readonly target: string;
  readonly unconfirmed: boolean;
};

export type FlowGraph = { readonly nodes: readonly FlowNode[]; readonly edges: readonly FlowEdge[] };

type Item = { readonly id: string };

/**
 * 장비·외부 지점·연결로 그래프를 만든다. 미상 끝점은 연결마다 따로 점이 된다. 같은 "미상"이라도
 * 같은 장비라는 근거가 없어서다. 후보 장비로 선을 잇지 않는다.
 */
export function flowGraph(
  equipment: readonly Item[],
  externals: readonly Item[],
  connections: readonly Connection[],
): FlowGraph {
  const nodes: FlowNode[] = [
    ...equipment.map(
      (e): FlowNode => ({ id: e.id, kind: "equipment", label: e.id, unconfirmed: false }),
    ),
    ...externals.map(
      (e): FlowNode => ({ id: e.id, kind: "external", label: e.id, unconfirmed: false }),
    ),
  ];

  const endpointId = (end: Endpoint, index: number, side: "from" | "to"): string => {
    if (!("unknown" in end)) return end.id;
    const id = unknownNodeId(index, side);
    nodes.push({ id, kind: "unknown", label: end.unknown, unconfirmed: true });
    return id;
  };

  const edges = connections.map(
    (c, index): FlowEdge => ({
      id: `c${index}`,
      index,
      source: endpointId(c.from, index, "from"),
      target: endpointId(c.to, index, "to"),
      unconfirmed: c.unconfirmed,
    }),
  );

  return { nodes, edges };
}

/** 미상 끝점의 점 id. 장비 id와 겹치지 않게 `?`로 시작한다. */
export function unknownNodeId(index: number, side: "from" | "to"): string {
  return `?${index}-${side}`;
}

/** `start`에서 연결 방향(또는 반대 방향)을 따라 닿는 점. `start`는 넣지 않는다. */
function reach(graph: FlowGraph, start: string, forward: boolean): string[] {
  const seen = new Set<string>([start]);
  const order: string[] = [];
  const queue = [start];
  while (queue.length > 0) {
    const at = queue.shift() as string;
    for (const e of graph.edges) {
      const [from, to] = forward ? [e.source, e.target] : [e.target, e.source];
      if (from !== at || seen.has(to)) continue;
      seen.add(to);
      order.push(to);
      queue.push(to);
    }
  }
  return order;
}

/** 이 점이 꺼지면 영향 받을 수 있는 점. 연결을 따라 닿는 곳 전부다. */
export function downstream(graph: FlowGraph, id: string): string[] {
  return reach(graph, id, true);
}

/** 이 점에 문제가 보이면 확인할 점. 연결을 거슬러 닿는 곳 전부다. */
export function upstream(graph: FlowGraph, id: string): string[] {
  return reach(graph, id, false);
}

/**
 * 장비를 골랐을 때 칠할 선 id. 고른 점이나 하류에서 나가는 선, 고른 점이나 상류로 들어오는
 * 선이다. 상류 점에서 하류 점으로 곧장 가는 선(고른 장비를 지나지 않는 곁길)은 칠하지 않는다.
 */
export function tracedEdges(graph: FlowGraph, id: string): string[] {
  const down = new Set([id, ...downstream(graph, id)]);
  const up = new Set([id, ...upstream(graph, id)]);
  return graph.edges.filter((e) => down.has(e.source) || up.has(e.target)).map((e) => e.id);
}
