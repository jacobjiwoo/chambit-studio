/**
 * 신호 흐름도 배치 — 빌드 때 서버 컴포넌트에서 elkjs layered로 좌표를 계산한다. 브라우저는
 * 이 좌표를 받아 그리고 상호작용만 한다(`output: "export"`라 요청 시점 계산이 없다).
 *
 * 흐름 방향은 위(입력) → 아래(출력)이다. 문서 본문 폭과 휴대폰 폭에 맞춰 세로로 둔다. 단계(입력/처리/출력)를 데이터에 따로 두지 않는다.
 * 연결 방향만으로 layered 배치가 그 순서를 만든다.
 */
import ELK, { type ElkExtendedEdge, type ElkNode } from "elkjs/lib/elk.bundled.js";

import type { FlowGraph, FlowNode } from "./flow";

export type Point = { readonly x: number; readonly y: number };
export type Box = Point & { readonly width: number; readonly height: number };

/** 점 id → 왼쪽 위 자리와 크기, 선 id → 꺾인 선의 점들(출발 → 도착). */
export type FlowLayout = {
  readonly nodes: Record<string, Box>;
  readonly edges: Record<string, Point[]>;
};

export const NODE_HEIGHT = 34;
/** 장비 이름 글자 크기(px). 그리는 쪽 CSS와 맞춘다. */
export const NODE_FONT = 12;
/** 미확인 배지 아이콘 자리(px). */
export const BADGE_SPACE = 18;

/** 글자 폭 어림. 브라우저 없이 재므로 한글은 글자 크기만큼, 그 밖은 그 0.6배로 본다. */
function textWidth(text: string): number {
  let width = 0;
  for (const ch of text) {
    width += /[ㄱ-힝·]/.test(ch) ? NODE_FONT : ch === " " ? NODE_FONT * 0.3 : NODE_FONT * 0.62;
  }
  return width;
}

export function nodeWidth(node: FlowNode): number {
  return Math.ceil(textWidth(node.label) + 24 + (node.unconfirmed ? BADGE_SPACE : 0));
}

export async function layoutFlow(graph: FlowGraph): Promise<FlowLayout> {
  const elk = new ELK();
  const input: ElkNode & { edges: ElkExtendedEdge[] } = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.spacing.nodeNodeBetweenLayers": "56",
      "elk.spacing.nodeNode": "16",
      "elk.spacing.edgeNode": "12",
      "elk.spacing.edgeEdge": "8",
      "elk.spacing.componentComponent": "40",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    },
    children: graph.nodes.map((n) => ({ id: n.id, width: nodeWidth(n), height: NODE_HEIGHT })),
    edges: graph.edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  };
  const result = await elk.layout(input);

  const nodes: Record<string, Box> = {};
  for (const c of result.children ?? []) {
    nodes[c.id] = { x: c.x ?? 0, y: c.y ?? 0, width: c.width ?? 0, height: c.height ?? 0 };
  }

  const edges: Record<string, Point[]> = {};
  for (const e of result.edges ?? []) {
    const section = e.sections?.[0];
    if (!section) continue;
    edges[e.id] = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map(
      ({ x, y }) => ({ x, y }),
    );
  }

  return { nodes, edges };
}
