/**
 * 셋리스트 조작과 localStorage 문자열 왕복. 넣은 셋리스트와 나온 셋리스트만 본다.
 */
import { describe, expect, it } from "vitest";

import type { Background } from "./background";
import {
  addSong,
  clearSongBackground,
  excludeAllSlides,
  includeAllSlides,
  moveSong,
  parseSetlist,
  pruneMissing,
  removeSong,
  serializeSetlist,
  setSongBackground,
  toggleSlide,
  toggleSong,
  type Setlist,
  type SetlistEntry,
} from "./setlist";

const navy: Background = { type: "color", value: "1A1A40" };
const photo: Background = { type: "image", data: "data:image/png;base64,AAAA" };

function entry(songId: number, excluded: number[] = [], background?: Background): SetlistEntry {
  return background
    ? { songId, excluded: new Set(excluded), background }
    : { songId, excluded: new Set(excluded) };
}

const ids = (setlist: Setlist) => setlist.map((e) => e.songId);
const excludedOf = (setlist: Setlist, songId: number) =>
  [...(setlist.find((e) => e.songId === songId)?.excluded ?? [])].sort((a, b) => a - b);

describe("곡 담기·빼기", () => {
  it("맨 뒤에 담는다", () => {
    expect(ids(addSong(addSong([], 3), 1))).toEqual([3, 1]);
  });

  it("이미 있으면 다시 담지 않는다", () => {
    const setlist = [entry(3, [0]), entry(1)];
    expect(addSong(setlist, 3)).toEqual(setlist);
  });

  it("뺀다", () => {
    expect(ids(removeSong([entry(3), entry(1), entry(2)], 1))).toEqual([3, 2]);
  });

  it("토글은 없으면 맨 뒤에 담고 있으면 뺀다", () => {
    const once = toggleSong([entry(3)], 1);
    expect(ids(once)).toEqual([3, 1]);
    expect(ids(toggleSong(once, 3))).toEqual([1]);
  });
});

describe("순서 바꾸기", () => {
  const setlist = [entry(1), entry(2), entry(3), entry(4)];

  it("from 자리의 곡을 to 자리로 옮긴다", () => {
    expect(ids(moveSong(setlist, 0, 2))).toEqual([2, 3, 1, 4]);
    expect(ids(moveSong(setlist, 3, 0))).toEqual([4, 1, 2, 3]);
  });

  it("같은 자리면 그대로다", () => {
    expect(ids(moveSong(setlist, 2, 2))).toEqual([1, 2, 3, 4]);
  });

  it("범위 밖이면 그대로다", () => {
    expect(ids(moveSong(setlist, 1, 4))).toEqual([1, 2, 3, 4]);
    expect(ids(moveSong(setlist, 1, -1))).toEqual([1, 2, 3, 4]);
    expect(ids(moveSong(setlist, 4, 0))).toEqual([1, 2, 3, 4]);
    expect(ids(moveSong(setlist, -1, 0))).toEqual([1, 2, 3, 4]);
  });
});

describe("슬라이드 제외", () => {
  it("토글한다", () => {
    const once = toggleSlide([entry(1), entry(2)], 1, 3);
    expect(excludedOf(once, 1)).toEqual([3]);
    expect(excludedOf(once, 2)).toEqual([]);
    expect(excludedOf(toggleSlide(once, 1, 3), 1)).toEqual([]);
  });

  it("전체 포함은 그 곡의 제외를 비운다", () => {
    const setlist = includeAllSlides([entry(1, [0, 2]), entry(2, [1])], 1);
    expect(excludedOf(setlist, 1)).toEqual([]);
    expect(excludedOf(setlist, 2)).toEqual([1]);
  });

  it("전체 제외는 그 곡의 모든 번호를 뺀다", () => {
    const setlist = excludeAllSlides([entry(1, [2]), entry(2)], 1, [0, 1, 2, 3]);
    expect(excludedOf(setlist, 1)).toEqual([0, 1, 2, 3]);
    expect(excludedOf(setlist, 2)).toEqual([]);
  });

  it("다른 곡은 같은 객체로 남는다", () => {
    const other = entry(2, [1]);
    expect(toggleSlide([entry(1), other], 1, 0)[1]).toBe(other);
  });
});

describe("곡별 배경", () => {
  it("정하고 바꾸고 지운다", () => {
    const set = setSongBackground([entry(1), entry(2)], 1, navy);
    expect(set[0].background).toEqual(navy);
    expect(set[1].background).toBeUndefined();

    const changed = setSongBackground(set, 1, photo);
    expect(changed[0].background).toEqual(photo);

    const cleared = clearSongBackground(changed, 1);
    expect(cleared[0].background).toBeUndefined();
    expect("background" in cleared[0]).toBe(false);
  });
});

describe("곡 목록에 없는 항목 정리", () => {
  it("곡 목록에 없는 곡 목록 곡을 빼고, 올린 곡은 남긴다", () => {
    const setlist = [entry(5), entry(-1), entry(7), entry(9)];
    expect(ids(pruneMissing(setlist, new Set([5, 9])))).toEqual([5, -1, 9]);
  });
});

describe("직렬화", () => {
  it("저장했다가 읽으면 같은 셋리스트다 — 제외 집합과 배경까지", () => {
    const setlist = [entry(3, [2, 0], navy), entry(1), entry(8, [1], photo)];
    const restored = parseSetlist(serializeSetlist(setlist));
    expect(ids(restored)).toEqual([3, 1, 8]);
    expect(excludedOf(restored, 3)).toEqual([0, 2]);
    expect(excludedOf(restored, 8)).toEqual([1]);
    expect(restored[0].background).toEqual(navy);
    expect(restored[1].background).toBeUndefined();
    expect(restored[2].background).toEqual(photo);
  });

  it("저장하는 모양은 `[{ songId, excludedSlideIndices, background? }]`이다", () => {
    expect(JSON.parse(serializeSetlist([entry(3, [1], navy), entry(1)]))).toEqual([
      { songId: 3, excludedSlideIndices: [1], background: navy },
      { songId: 1, excludedSlideIndices: [] },
    ]);
  });

  it("올린 곡은 저장하지 않는다", () => {
    const restored = parseSetlist(serializeSetlist([entry(-1), entry(3), entry(-2, [0])]));
    expect(ids(restored)).toEqual([3]);
  });

  it("값이 없으면 빈 셋리스트다", () => {
    expect(parseSetlist(null)).toEqual([]);
    expect(parseSetlist("")).toEqual([]);
  });

  it("깨진 JSON은 빈 셋리스트다", () => {
    expect(parseSetlist("[{")).toEqual([]);
  });

  it.each([
    ["배열이 아님", { songId: 1, excludedSlideIndices: [] }],
    ["songId 없음", [{ excludedSlideIndices: [] }]],
    ["songId가 문자열", [{ songId: "1", excludedSlideIndices: [] }]],
    ["제외 목록 없음", [{ songId: 1 }]],
    ["제외 번호가 숫자 아님", [{ songId: 1, excludedSlideIndices: ["0"] }]],
    ["항목이 null", [null]],
    [
      "같은 곡이 두 번",
      [
        { songId: 1, excludedSlideIndices: [] },
        { songId: 1, excludedSlideIndices: [0] },
      ],
    ],
  ])("틀린 모양(%s)은 빈 셋리스트다", (_, value) => {
    expect(parseSetlist(JSON.stringify(value))).toEqual([]);
  });

  it.each([
    ["종류 모름", { type: "gradient", value: "FFFFFF" }],
    ["색에 value 없음", { type: "color", data: "FFFFFF" }],
    ["이미지에 data 없음", { type: "image", value: "data:image/png;base64,AAAA" }],
    ["값이 숫자", { type: "color", value: 0xffffff }],
    ["hex가 6자리 아님", { type: "color", value: "FFF" }],
    ["hex가 아님", { type: "color", value: "zzzzzz" }],
    ["앞에 # 붙음", { type: "color", value: "#FFFFFF" }],
    ["이미지가 data URL 아님", { type: "image", data: "https://example.com/a.png" }],
    ["문자열", "FFFFFF"],
  ])("틀린 배경(%s)은 빈 셋리스트다", (_, background) => {
    const raw = JSON.stringify([
      { songId: 1, excludedSlideIndices: [] },
      { songId: 2, excludedSlideIndices: [], background },
    ]);
    expect(parseSetlist(raw)).toEqual([]);
  });
});
