import { describe, expect, it } from "vitest";

import { parseCatalog } from "./song";

describe("곡 목록 JSON 읽기", () => {
  it("모양이 맞으면 그대로다", () => {
    const songs = [
      { id: 12, title: "놀라운 은혜", slideCount: 3 },
      { id: 7, title: "거룩 거룩 거룩", slideCount: 1 },
    ];
    expect(parseCatalog(songs)).toEqual(songs);
  });

  it.each([
    ["배열이 아님", { id: 1, title: "a", slideCount: 1 }],
    ["id가 문자열", [{ id: "1", title: "a", slideCount: 1 }]],
    ["제목 없음", [{ id: 1, slideCount: 1 }]],
    ["장수가 소수", [{ id: 1, title: "a", slideCount: 1.5 }]],
    ["id가 0", [{ id: 0, title: "a", slideCount: 1 }]],
    ["id가 음수", [{ id: -3, title: "a", slideCount: 1 }]],
    ["장수가 0", [{ id: 1, title: "a", slideCount: 0 }]],
    ["항목이 null", [null]],
  ])("모양이 틀리면(%s) null이다", (_, value) => {
    expect(parseCatalog(value)).toBeNull();
  });
});
