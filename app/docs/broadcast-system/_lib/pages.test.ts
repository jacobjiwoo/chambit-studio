/**
 * 방송 시스템 페이지 목록 — frontmatter 실수가 빌드에서 잡히는지 본다.
 *
 * 페이지는 여러 세션이 따로 쓴다. 폴더와 `slug`가 어긋나거나 `order`가 겹쳐도 화면은
 * 그럴듯하게 나오고 링크 하나만 404가 되므로, 여기서 멈추는 것이 유일한 통로다.
 */
import { describe, expect, it } from "vitest";

import { toPages, type PageSource } from "./pages";

function frontmatter(slug: string, order: number): string {
  return `---\ntitle: ${slug} 제목\ndescription: 설명\nslug: ${slug}\norder: ${order}\n---\n\n# 본문\n`;
}

function page(slug: string, order: number): PageSource {
  return { dir: slug, source: frontmatter(slug, order) };
}

describe("방송 시스템 페이지 목록", () => {
  it("order 순으로 title·href·order를 낸다", () => {
    expect(toPages([page("equipment", 2), page("glossary", 1)])).toEqual([
      { title: "glossary 제목", href: "/docs/broadcast-system/glossary", order: 1 },
      { title: "equipment 제목", href: "/docs/broadcast-system/equipment", order: 2 },
    ]);
  });

  it("페이지가 없으면 빈 목록이다", () => {
    expect(toPages([])).toEqual([]);
  });

  it("`_`로 시작하는 폴더와 page.mdx가 없는 폴더는 건너뛴다", () => {
    expect(
      toPages([
        { dir: "_lib", source: "export {}" },
        { dir: "empty" },
        page("glossary", 1),
      ]),
    ).toEqual([{ title: "glossary 제목", href: "/docs/broadcast-system/glossary", order: 1 }]);
  });

  it("frontmatter가 없으면 멈춘다", () => {
    expect(() => toPages([{ dir: "a", source: "# 본문" }])).toThrow("frontmatter");
  });

  it("키가 빠지면 멈춘다", () => {
    expect(() =>
      toPages([{ dir: "a", source: "---\ntitle: t\nslug: a\norder: 1\n---\n" }]),
    ).toThrow("description");
  });

  it("description이 150자를 넘으면 멈춘다", () => {
    const long = `---\ntitle: t\ndescription: ${"가".repeat(151)}\nslug: a\norder: 1\n---\n`;
    expect(() => toPages([{ dir: "a", source: long }])).toThrow("150");
  });

  it("slug가 폴더와 다르면 멈춘다", () => {
    expect(() => toPages([{ dir: "a", source: frontmatter("b", 1) }])).toThrow("폴더 `a`");
  });

  it("order가 겹치면 멈춘다", () => {
    expect(() => toPages([page("a", 1), page("b", 1)])).toThrow("겹친다");
  });
});
