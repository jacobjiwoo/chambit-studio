/**
 * 확인 필요 목록 모으기 — 장비·연결의 확인할 거리가 빠짐없이, 파트별로, 우선순위대로 모이는지 본다.
 */
import { describe, expect, it } from "vitest";

import { connections, equipment, priorities } from "./system";
import { collectToConfirm } from "./to-confirm";

describe("collectToConfirm", () => {
  it("장비의 확인할 거리를 파트 순서대로 묶고, 거리가 없는 파트는 뺀다", () => {
    const list = [
      { id: "콘솔", part: "음향", toConfirm: [{ what: "모델" }] },
      { id: "UPS", part: "전원", toConfirm: [{ what: "공급 장비" }] },
      { id: "스위처", part: "영상·온라인 송출", toConfirm: [] },
    ] as const;

    expect(collectToConfirm(list, [])).toEqual([
      { part: "전원", items: [{ subjects: ["UPS"], what: "공급 장비" }] },
      { part: "음향", items: [{ subjects: ["콘솔"], what: "모델" }] },
    ]);
  });

  it("연결의 확인할 거리는 장비인 끝점과 후보를 모두 행으로 걸고, 첫 장비의 파트에 둔다", () => {
    const list = [
      { id: "UPS", part: "전원", toConfirm: [] },
      { id: "콘솔", part: "음향", toConfirm: [] },
      { id: "분배기", part: "음향", toConfirm: [] },
      { id: "임베더", part: "영상·온라인 송출", toConfirm: [] },
    ] as const;
    const links = [
      { from: { id: "UPS" }, to: { id: "콘솔" }, signal: "전원" as const, toConfirm: ["연결 여부"] },
      {
        from: { unknown: "음향 소리", candidates: ["콘솔", "분배기"] },
        to: { id: "임베더", port: "CH1" },
        toConfirm: ["출발 장비"],
      },
      { from: { id: "콘솔" }, to: { id: "바깥" }, toConfirm: [] },
    ];

    expect(collectToConfirm(list, links)).toEqual([
      {
        part: "전원",
        items: [{ subjects: ["UPS", "콘솔"], connection: "UPS → 콘솔 (전원)", what: "연결 여부" }],
      },
      {
        part: "영상·온라인 송출",
        items: [
          {
            subjects: ["임베더", "콘솔", "분배기"],
            connection: "음향 소리(후보: 콘솔, 분배기) → 임베더 CH1",
            what: "출발 장비",
          },
        ],
      },
    ]);
  });

  it("파트 안에서는 우선순위가 높은 것부터, 우선순위가 없는 것은 끝에 데이터 순서대로 둔다", () => {
    const list = [
      { id: "가", part: "음향", toConfirm: [{ what: "a" }, { what: "b", priority: 12 }] },
      { id: "나", part: "음향", toConfirm: [{ what: "c" }] },
    ] as const;
    const links = [
      { from: { id: "가" }, to: { id: "나" }, toConfirm: ["d"], priority: 5 },
    ] as const;

    expect(
      collectToConfirm(list, links)[0].items.map((i) => [i.what, i.priority]),
    ).toEqual([
      ["d", 5],
      ["b", 12],
      ["a", undefined],
      ["c", undefined],
    ]);
  });
});

describe("방송실 데이터의 확인 필요 목록", () => {
  const groups = collectToConfirm(equipment, connections);
  const items = groups.flatMap((g) => g.items);

  it("장비·연결의 확인할 거리를 하나도 빠뜨리지 않는다", () => {
    const total =
      equipment.reduce((n, e) => n + e.toConfirm.length, 0) +
      connections.reduce((n, c) => n + c.toConfirm.length, 0);

    expect(items).toHaveLength(total);
  });

  it("남은 우선순위는 모두 확인할 거리가 있고, 14만 보류다", () => {
    const used = [...new Set(items.flatMap((i) => (i.priority ? [i.priority] : [])))].sort(
      (a, b) => a - b,
    );

    expect(used).toEqual([1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    expect(Object.keys(priorities).map(Number)).toEqual(used);
    expect(
      Object.entries(priorities)
        .filter(([, p]) => "deferred" in p && p.deferred)
        .map(([rank]) => Number(rank)),
    ).toEqual([14]);
  });
});
