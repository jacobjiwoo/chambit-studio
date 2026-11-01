/**
 * 생성 계획 — 셋리스트 + 곡 찾기 + 공통 배경을 넣고 PPT에 들어갈 슬라이드 목록을 본다.
 */
import { describe, expect, it } from "vitest";

import type { Background } from "./background";
import { countUsedSlides, planSlides } from "./plan";
import type { SetlistEntry } from "./setlist";
import { catalogSong, type FindSong, type Song } from "./song";

const white: Background = { type: "color", value: "FFFFFF" };
const navy: Background = { type: "color", value: "1A1A40" };
const photo: Background = { type: "image", data: "data:image/jpeg;base64,BBBB" };

const amazing = catalogSong({ id: 12, title: "놀라운 은혜", slideCount: 3 });
const holy = catalogSong({ id: 7, title: "거룩 거룩 거룩", slideCount: 2 });
// 올린 곡. 추출 결과의 순서가 번호 순서가 아니어도 계획은 번호 순서다
const uploaded: Song = {
  id: -1,
  title: "올린 찬양",
  slides: [
    { index: 1, image: "data:image/png;base64,ONE" },
    { index: 0, image: "data:image/png;base64,ZERO" },
  ],
};

const songs = new Map([amazing, holy, uploaded].map((s) => [s.id, s]));
const find: FindSong = (id) => songs.get(id);

function entry(songId: number, excluded: number[] = [], background?: Background): SetlistEntry {
  return background
    ? { songId, excluded: new Set(excluded), background }
    : { songId, excluded: new Set(excluded) };
}

function images(setlist: SetlistEntry[], common = white) {
  const plan = planSlides(setlist, find, common);
  if (!plan.ok) throw new Error(plan.error);
  return plan.slides.map((s) => s.image);
}

describe("순서", () => {
  it("셋리스트 순서대로, 곡 안에서는 번호 오름차순이다", () => {
    expect(images([entry(-1), entry(7)])).toEqual([
      "data:image/png;base64,ZERO",
      "data:image/png;base64,ONE",
      "https://praise-ppt-images.chambitstudio.com/images/7/0.png",
      "https://praise-ppt-images.chambitstudio.com/images/7/1.png",
    ]);
  });
});

describe("이미지 주소", () => {
  it("곡 목록 곡은 R2 주소 규칙 `images/{id}/{n}.png`이다", () => {
    expect(images([entry(12)])).toEqual([
      "https://praise-ppt-images.chambitstudio.com/images/12/0.png",
      "https://praise-ppt-images.chambitstudio.com/images/12/1.png",
      "https://praise-ppt-images.chambitstudio.com/images/12/2.png",
    ]);
  });

  it("올린 곡은 data URL 그대로다", () => {
    expect(images([entry(-1)])).toEqual([
      "data:image/png;base64,ZERO",
      "data:image/png;base64,ONE",
    ]);
  });
});

describe("제외", () => {
  it("뺀 번호의 슬라이드를 넣지 않는다", () => {
    expect(images([entry(12, [1]), entry(-1, [0])])).toEqual([
      "https://praise-ppt-images.chambitstudio.com/images/12/0.png",
      "https://praise-ppt-images.chambitstudio.com/images/12/2.png",
      "data:image/png;base64,ONE",
    ]);
  });
});

describe("배경", () => {
  it("곡별 배경이 있으면 그것, 없으면 공통 배경이다", () => {
    const plan = planSlides([entry(7, [], photo), entry(-1, [1])], find, navy);
    expect(plan.ok && plan.slides.map((s) => s.background)).toEqual([photo, photo, navy]);
  });
});

describe("찾지 못한 곡", () => {
  it("건너뛴다", () => {
    expect(images([entry(99), entry(7), entry(-5)])).toEqual([
      "https://praise-ppt-images.chambitstudio.com/images/7/0.png",
      "https://praise-ppt-images.chambitstudio.com/images/7/1.png",
    ]);
  });
});

describe("실패", () => {
  it("셋리스트가 비면 곡이 선택되지 않았다", () => {
    expect(planSlides([], find, white)).toEqual({
      ok: false,
      error: "곡이 선택되지 않았습니다",
    });
  });

  it("모두 뺐으면 생성할 슬라이드가 없다", () => {
    expect(planSlides([entry(7, [0, 1]), entry(-1, [0, 1])], find, white)).toEqual({
      ok: false,
      error: "생성할 슬라이드가 없습니다",
    });
  });

  it("곡을 하나도 찾지 못해도 생성할 슬라이드가 없다", () => {
    expect(planSlides([entry(99)], find, white)).toEqual({
      ok: false,
      error: "생성할 슬라이드가 없습니다",
    });
  });
});

describe("사용 장수", () => {
  it("곡의 장수에서 뺀 장을 덜고, 곡에 없는 번호는 세지 않는다", () => {
    expect(countUsedSlides(amazing, entry(12))).toBe(3);
    expect(countUsedSlides(amazing, entry(12, [0, 2]))).toBe(1);
    expect(countUsedSlides(amazing, entry(12, [0, 5]))).toBe(2);
  });
});
