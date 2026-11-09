/**
 * 신호 흐름도 그림(탭) 나누기 — 연결의 `layers`가 그림을 어떻게 가르는지, 주소와 탭 전환이 어느 그림·
 * 장비로 가는지. 실제 `system.ts` 데이터로 확인한다.
 */
import { describe, expect, it } from "vitest";

import { flowGraph } from "./flow";
import {
  resolveEntry,
  selectionAfterSwitch,
  viewGraph,
  views,
  viewsWithNode,
  withViewParams,
  type ViewGraphs,
  type ViewId,
} from "./flow-views";
import { connections, equipment, externals } from "./system";

const full = flowGraph(equipment, externals, connections);
const graphs = Object.fromEntries(
  views.map((v) => [v.id, viewGraph(full, connections, v.id)]),
) as ViewGraphs;
const ids = (view: ViewId) => graphs[view].nodes.map((n) => n.id);

describe("탭", () => {
  it("순서는 영상·오디오·전력·네트워크·제어다", () => {
    expect(views.map((v) => v.label)).toEqual(["영상", "오디오", "전력", "네트워크·제어"]);
  });
});

describe("그림 나누기", () => {
  it("연결마다 그림이 하나 이상이고, 선의 index는 전체 connections의 자리 그대로다", () => {
    for (const c of connections) expect(c.layers.length).toBeGreaterThan(0);
    for (const v of views) {
      for (const e of graphs[v.id].edges) {
        expect(connections[e.index].layers).toContain(v.id);
        expect(e).toBe(full.edges[e.index]);
      }
    }
  });

  it("연결 54개가 분류대로 갈린다", () => {
    const count = (v: ViewId) => graphs[v].edges.length;
    expect(connections).toHaveLength(54);
    expect(count("power")).toBe(8);
    expect(count("video")).toBe(7 + 6 + 5 + 4 + 4 + 3);
    expect(count("audio")).toBe(2 + 8 + 4 + 3);
    expect(count("network")).toBe(7 + 3);
  });

  it("각 그림에는 그 그림의 연결에 닿는 점만 나온다", () => {
    for (const v of views) {
      const touched = new Set(graphs[v.id].edges.flatMap((e) => [e.source, e.target]));
      expect(new Set(ids(v.id))).toEqual(touched);
    }
  });

  it("연결이 없는 장비 6대는 어느 그림에도 나오지 않는다", () => {
    const none = [
      "음향 파워 컨디셔너",
      "NABI USB 동글",
      "LED 스크린 전원 버튼",
      "연결 패널",
      "방송실 스피커",
      "DVD 레코더",
    ];
    for (const id of none) expect(viewsWithNode(graphs, id), id).toEqual([]);
  });

  it("소리는 임베더에서 합쳐져 그 뒤 구간은 영상과 오디오 양쪽에 그린다", () => {
    expect(viewsWithNode(graphs, "오디오 임베더")).toEqual(["video", "audio"]);
    expect(viewsWithNode(graphs, "백업 녹화기")).toEqual(["video", "audio", "power"]);
    expect(viewsWithNode(graphs, "공유기")).toEqual(["video", "audio", "power", "network"]);
  });

  it("전력 그림에는 전원 연결만, 오디오 그림에는 영상 장비가 나오지 않는다", () => {
    expect(ids("power")).toContain("영상 전원 시퀀서");
    expect(ids("audio")).not.toContain("영상 스위처");
    expect(ids("video")).not.toContain("음향 콘솔");
  });
});

describe("주소 해석", () => {
  it("view가 맞으면 그 그림을 연다", () => {
    expect(resolveEntry("?view=audio", graphs)).toEqual({ view: "audio", device: null });
  });

  it("view와 device가 맞으면 그 그림에서 그 장비를 고른다", () => {
    expect(resolveEntry("?view=audio&device=음향 콘솔", graphs)).toEqual({
      view: "audio",
      device: "음향 콘솔",
    });
  });

  it("view 없이 device만 있으면 탭 순서대로 그 장비가 나오는 첫 탭을 연다", () => {
    expect(resolveEntry("?device=영상 전원 시퀀서", graphs)).toEqual({
      view: "power",
      device: "영상 전원 시퀀서",
    });
    expect(resolveEntry("?device=공유기", graphs).view).toBe("video");
    expect(resolveEntry("?device=음향 콘솔", graphs).view).toBe("audio");
  });

  it("잘못된 view는 device만 있는 것처럼 본다", () => {
    expect(resolveEntry("?view=nope&device=음향 콘솔", graphs)).toEqual({
      view: "audio",
      device: "음향 콘솔",
    });
  });

  it("어느 탭에도 없는 장비는 기본 동작이다", () => {
    expect(resolveEntry("?device=연결 패널", graphs)).toEqual({ view: "video", device: null });
    expect(resolveEntry("?device=없는 장비", graphs)).toEqual({ view: "video", device: null });
    expect(resolveEntry("", graphs)).toEqual({ view: "video", device: null });
  });

  it("view가 맞아도 장비가 그 그림에 없으면 장비는 고르지 않는다", () => {
    expect(resolveEntry("?view=power&device=영상 스위처", graphs)).toEqual({
      view: "power",
      device: null,
    });
  });
});

describe("탭 전환", () => {
  it("새 그림에도 있는 장비는 고른 채로 둔다", () => {
    const sel = { kind: "node", id: "공유기" } as const;
    expect(selectionAfterSwitch(sel, graphs.power)).toEqual(sel);
  });

  it("새 그림에 없는 장비와 고른 선은 푼다", () => {
    expect(selectionAfterSwitch({ kind: "node", id: "영상 스위처" }, graphs.power)).toBeNull();
    expect(selectionAfterSwitch({ kind: "edge", id: "c8" }, graphs.video)).toBeNull();
    expect(selectionAfterSwitch(null, graphs.video)).toBeNull();
  });
});

describe("교차 그림 링크", () => {
  it("고른 장비가 나오는 다른 그림만 탭 순서대로 나온다", () => {
    const others = viewsWithNode(graphs, "공유기").filter((v) => v !== "video");
    expect(others).toEqual(["audio", "power", "network"]);
    expect(viewsWithNode(graphs, "음향 콘솔").filter((v) => v !== "audio")).toEqual(["power"]);
  });
});

describe("주소 쓰기", () => {
  it("view와 device를 쓰고 device가 없으면 지운다", () => {
    const written = new URLSearchParams(withViewParams("", "audio", "음향 콘솔"));
    expect(written.get("view")).toBe("audio");
    expect(written.get("device")).toBe("음향 콘솔");
    expect(withViewParams("?view=video&device=a&x=1", "power", null)).toBe("?view=power&x=1");
  });
});
