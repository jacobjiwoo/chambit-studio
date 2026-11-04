/**
 * 신호 흐름도의 하류·상류 계산 — 장비를 눌렀을 때 무엇을 칠할지.
 *
 * 실제 데이터의 온라인 송출 직렬 구조로 확인한다. 데이터가 바뀌어 이 줄이 끊기면 그림의
 * "영향 받을 수 있음"이 틀려지므로 여기서 멈춘다.
 */
import { describe, expect, it } from "vitest";

import { downstream, flowGraph, tracedEdges, upstream } from "./flow";
import { connections, equipment, externals } from "./system";

const graph = flowGraph(equipment, externals, connections);

describe("하류", () => {
  it("직렬 구조에서 백업 녹화기를 고르면 송출 PC와 유튜브가 하류로 나온다", () => {
    const down = downstream(graph, "백업 녹화기");
    expect(down).toContain("송출 PC 캡처카드");
    expect(down).toContain("송출 PC");
    expect(down).toContain("유튜브");
  });

  it("고른 장비와 상류는 하류에 들지 않는다", () => {
    const down = downstream(graph, "백업 녹화기");
    expect(down).not.toContain("백업 녹화기");
    expect(down).not.toContain("백업 송출 장비");
    expect(down).not.toContain("오디오 임베더");
  });
});

describe("상류", () => {
  it("송출 PC를 고르면 직렬 구조를 거슬러 영상 스위처까지 확인할 곳으로 나온다", () => {
    const up = upstream(graph, "송출 PC");
    for (const id of [
      "송출 PC 캡처카드",
      "백업 녹화기",
      "백업 송출 장비",
      "오디오 임베더",
      "영상 hub",
      "영상 스위처",
    ]) {
      expect(up).toContain(id);
    }
    expect(up).not.toContain("유튜브");
  });

  it("출발을 모르는 연결은 미상 점이 되고 후보 장비로 잇지 않는다", () => {
    const up = upstream(graph, "오디오 임베더");
    const unknown = graph.nodes.find((n) => n.kind === "unknown" && n.label === "음향 소리");
    expect(up).toContain(unknown?.id);
    expect(up).not.toContain("오디오 분배기");
  });
});

describe("칠할 선", () => {
  it("고른 장비에서 하류로 가는 선과 상류에서 오는 선만 칠한다", () => {
    const lines = tracedEdges(graph, "백업 녹화기").map((id) => {
      const e = graph.edges.find((x) => x.id === id);
      return `${e?.source} → ${e?.target}`;
    });
    expect(lines).toContain("백업 녹화기 → 송출 PC 캡처카드");
    expect(lines).toContain("백업 송출 장비 → 백업 녹화기");
    expect(lines).toContain("공유기 → 유튜브");
    // 상류의 영상 전원 시퀀서가 하류의 공유기에 주는 전원은 백업 녹화기를 지나지 않는다.
    expect(lines).not.toContain("영상 전원 시퀀서 → 공유기");
  });
});
