/**
 * 사이드바 목록 — frontmatter 실수가 빌드에서 잡히는지 본다.
 *
 * 절 페이지는 여러 세션이 따로 쓴다. 폴더와 `slug`가 어긋나거나 `order`가 겹쳐도 화면은
 * 그럴듯하게 나오고 링크 하나만 404가 되므로, 여기서 멈추는 것이 유일한 통로다.
 */
import { describe, expect, it } from "vitest";

import { readFrontmatter, toNav, type PageSource } from "./pages";

function page(chapter: string, slug: string, order: number): PageSource {
  return {
    chapterDir: chapter,
    sectionDir: slug,
    source: `---\ntitle: ${slug} 제목\ndescription: 설명\nslug: ${slug}\nchapter: ${chapter}\norder: ${order}\n---\n\n# 본문\n`,
  };
}

describe("frontmatter", () => {
  it("다섯 키를 읽는다", () => {
    expect(readFrontmatter(page("cg", "edit", 3).source, "f")).toEqual({
      title: "edit 제목",
      description: "설명",
      slug: "edit",
      chapter: "cg",
      order: 3,
    });
  });

  it("frontmatter가 없으면 멈춘다", () => {
    expect(() => readFrontmatter("# 본문\n", "f")).toThrow("frontmatter(---)가 없다");
  });

  it("description이 150자를 넘으면 멈춘다", () => {
    const long = `---\ntitle: t\ndescription: ${"가".repeat(151)}\nslug: s\nchapter: db\norder: 1\n---\n`;
    expect(() => readFrontmatter(long, "f")).toThrow("150자");
  });

  it("모르는 chapter면 멈춘다", () => {
    expect(() => readFrontmatter(page("etc", "s", 1).source, "f")).toThrow("setup·cg·db");
  });
});

describe("사이드바 목록", () => {
  it("Chapter는 원문 순서, 절은 order 순서다. 절이 없는 Chapter는 빠진다", () => {
    const nav = toNav([page("db", "church", 1), page("setup", "control", 2), page("setup", "screen", 1)]);

    expect(nav).toEqual([
      {
        key: "setup",
        title: "Setting & Control",
        pages: [
          { title: "screen 제목", href: "/docs/nabi/setup/screen", order: 1 },
          { title: "control 제목", href: "/docs/nabi/setup/control", order: 2 },
        ],
      },
      {
        key: "db",
        title: "교회DB",
        pages: [{ title: "church 제목", href: "/docs/nabi/db/church", order: 1 }],
      },
    ]);
  });

  it("slug가 폴더 이름과 다르면 멈춘다 — 링크가 404가 된다", () => {
    const wrong = { ...page("cg", "edit", 1), sectionDir: "editing" };
    expect(() => toNav([wrong])).toThrow("폴더 `editing`와 다르다");
  });

  it("chapter가 폴더와 다르면 멈춘다", () => {
    const wrong = { ...page("cg", "edit", 1), chapterDir: "db" };
    expect(() => toNav([wrong])).toThrow("폴더 `db`와 다르다");
  });

  it("한 Chapter 안에서 order가 겹치면 멈춘다", () => {
    expect(() => toNav([page("cg", "a", 1), page("cg", "b", 1)])).toThrow("`order: 1`가 겹친다");
  });
});
