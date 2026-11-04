/**
 * 신호 흐름도 배치 — 빌드 때 elkjs로 계산한 좌표가 그림을 그릴 수 있고 흐름이 읽히는지.
 */
import { describe, expect, it } from "vitest";

import { flowGraph } from "./flow";
import { layoutFlow, toFlowLayout } from "./flow-layout";
import { connections, equipment, externals } from "./system";

const graph = flowGraph(equipment, externals, connections);
const layout = await layoutFlow(graph);

describe("배치", () => {
  it("모든 점과 선이 자리를 받는다", () => {
    for (const n of graph.nodes) {
      expect(layout.nodes[n.id], n.id).toBeDefined();
    }
    for (const e of graph.edges) {
      expect(layout.edges[e.id]?.length, e.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("직렬 구조가 입력 → 출력 방향(위 → 아래)으로 놓인다", () => {
    const chain = [
      "영상 스위처",
      "오디오 임베더",
      "백업 송출 장비",
      "백업 녹화기",
      "송출 PC 캡처카드",
      "송출 PC",
      "유튜브",
    ];
    const ys = chain.map((id) => layout.nodes[id].y);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
    expect(new Set(ys).size).toBe(ys.length);
  });
});

describe("ELK 결과 옮기기", () => {
  it("ELK가 길을 내지 못한 선(sections 없음)은 좌표에서 빠진다", () => {
    const result = toFlowLayout({
      id: "root",
      children: [
        { id: "가", x: 0, y: 0, width: 10, height: 10 },
        { id: "나", x: 0, y: 50, width: 10, height: 10 },
      ],
      edges: [
        {
          id: "c0",
          sources: ["가"],
          targets: ["나"],
          sections: [
            { id: "s0", startPoint: { x: 5, y: 10 }, endPoint: { x: 5, y: 50 } },
          ],
        },
        { id: "c1", sources: ["가"], targets: ["나"] },
      ],
    });
    expect(result.edges).toEqual({ c0: [{ x: 5, y: 10 }, { x: 5, y: 50 }] });
    expect("c1" in result.edges).toBe(false);
  });
});
