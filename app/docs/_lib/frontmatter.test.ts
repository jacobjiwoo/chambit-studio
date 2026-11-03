/**
 * 문서 페이지 frontmatter — 모든 문서 라우트가 같이 쓰는 네 키(`title`·`description`·`slug`·`order`)를 본다.
 */
import { describe, expect, it } from "vitest";

import { readBaseFrontmatter, sortByOrder } from "./frontmatter";

describe("공용 frontmatter", () => {
  it("네 키를 읽는다", () => {
    const source = "---\ntitle: 용어집\ndescription: 설명\nslug: glossary\norder: 2\n---\n\n# 본문\n";
    expect(readBaseFrontmatter(source, "f")).toEqual({
      title: "용어집",
      description: "설명",
      slug: "glossary",
      order: 2,
    });
  });

  it("frontmatter가 없으면 멈춘다", () => {
    expect(() => readBaseFrontmatter("# 본문\n", "f")).toThrow("frontmatter(---)가 없다");
  });

  it("description이 150자를 넘으면 멈춘다", () => {
    const long = `---\ntitle: t\ndescription: ${"가".repeat(151)}\nslug: s\norder: 1\n---\n`;
    expect(() => readBaseFrontmatter(long, "f")).toThrow("150자");
  });

  it("order가 정수가 아니면 멈춘다", () => {
    const bad = "---\ntitle: t\ndescription: d\nslug: s\norder: 1.5\n---\n";
    expect(() => readBaseFrontmatter(bad, "f")).toThrow("정수");
  });
});

describe("order 정렬", () => {
  it("order 순으로 늘어놓는다", () => {
    const sorted = sortByOrder([
      { order: 2, file: "b" },
      { order: 1, file: "a" },
    ]);
    expect(sorted.map((p) => p.file)).toEqual(["a", "b"]);
  });

  it("order가 겹치면 멈춘다", () => {
    expect(() =>
      sortByOrder([
        { order: 1, file: "a" },
        { order: 1, file: "b" },
      ]),
    ).toThrow("`order: 1`가 겹친다");
  });
});
