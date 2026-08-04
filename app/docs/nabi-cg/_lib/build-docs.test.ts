/**
 * `buildDocs()`는 이 사이트의 **유일한 seam**이다 — 소스 폴더가 들어가고 페이지·내비가 나온다.
 * 게이트는 전부 이 산출물에 대한 `expect()`이고, 프런트매터를 어떻게 읽는지·마크다운을 어떤
 * 파서로 자르는지는 이 파일이 모른다. **읽는 방식을 통째로 갈아도 산출물이 같으면 통과한다.**
 *
 * 이 층의 회귀는 조용하다. 사이드바 한 줄을 흘리거나 흐름 순서가 뒤집혀도 화면은 멀쩡해
 * 보이고, `Kerning(자간)` 병기를 풀어 쓰면 검색만 0건이 된다 — **프로토타입 42에서 실제로
 * 재현된 사고다.** 그래서 실물 소스를 그대로 태워 보고(위쪽), 소스가 잘못됐을 때 빌드가
 * 멈추는지도 함께 본다(아래쪽, 임시 폴더).
 */
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { LANDING, NAV } from "../_meta/nav";
import { BADGE_HREF, buildDocs, CONTENT_DIR } from "./build-docs";

const docs = buildDocs(CONTENT_DIR);

const page = (slug: string) => docs.pages.find((p) => p.slug === slug);
const item = (slug: string) => docs.nav.find((n) => n.slug === slug);

/** 본문에서 `## ` 제목만 뽑는다 — 기본형 슬롯이 서 있는지 보는 눈이다. */
const h2 = (body: string) =>
  body
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim());

describe("사이드바 일곱 줄", () => {
  it("흐름 순으로 선다 — 매뉴얼 챕터 순서가 아니라 하루의 작업 순서다", () => {
    expect(docs.nav.map((n) => n.slug)).toEqual([
      "text-import",
      "text-attributes",
      "shape-attributes",
      "object-editing",
      "style-catalog",
      "playback",
      "shortcuts",
    ]);
  });

  it("항목마다 우리 문장 한 줄이 붙는다 — 이 한 줄이 발견 면 전부다", () => {
    for (const n of docs.nav) {
      expect(n.title.trim(), `${n.slug}의 제목`).not.toBe("");
      expect(n.lede.trim(), `${n.slug}의 한 줄 설명`).not.toBe("");
    }
  });

  it("단축키가 하위가 아니라 같은 층위에 단일 페이지로 선다", () => {
    // 기능 축에 안 붙는다고 서랍("기타")에 넣으면 클릭이 하나 늘고 치트시트가 쪼개진다.
    // 층위가 하나뿐이라는 것은 **모든 href의 깊이가 같다**는 것으로 관찰된다
    const depths = new Set(docs.nav.map((n) => n.href.split("/").length));
    expect(depths.size).toBe(1);
    expect(item("shortcuts")?.href).toBe("/docs/nabi-cg/shortcuts");
  });

  it("랜딩은 사이드바에 안 선다 — 개요 페이지를 만들지 않는다", () => {
    expect(docs.nav.map((n) => n.slug)).not.toContain(LANDING.slug);
    expect(page(LANDING.slug)?.href).toBe("/docs/nabi-cg");
  });
});

describe("URL 슬러그", () => {
  // 규칙과 근거는 `.scratch/nabi-cg-docs/build/02-skeleton-and-first-page.md` §남길 결정 하나.
  // 사용자 스토리 13 — *"주소를 북마크하고 다른 사람에게 불러줄 수 있기를 원한다"*
  it("복사해도 퍼센트 인코딩으로 안 터진다", () => {
    // 본문이 아직 없는 여섯 줄도 함께 본다 — 이름을 짓는 자리가 앞으로 여섯 번 더 오고,
    // 그때 한글이 섞이면 주소가 `%EA%B8%80...`로 부푼다
    for (const { href, slug } of [...docs.pages, ...docs.nav]) {
      expect(encodeURI(href), slug).toBe(href);
    }
  });

  it("소문자·숫자·하이픈만 쓴다 — 불러줄 때 대소문자와 밑줄을 안 묻는다", () => {
    for (const n of docs.nav) {
      expect(n.slug, n.title).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

describe("글자 속성 페이지", () => {
  const attrs = page("text-attributes");

  it("마크다운 한 장에서 렌더돼 나온다", () => {
    expect(attrs).toBeDefined();
    expect(attrs?.title).toBe("글자 속성");
    expect(attrs?.lede).toBe("자막이 안 들어갈 때 폭·자간·크기를 줄인다");
    expect(attrs?.body.length).toBeGreaterThan(1000);
  });

  it("기본형 슬롯 다섯을 갖췄다", () => {
    const body = attrs?.body ?? "";
    const sections = h2(body);

    // ① H1 기능 이름 + ② 해주는 일 한 줄 — 사이드바와 **같은 문자열**이라 nav에서 온다
    expect(attrs?.title).toBeTruthy();
    expect(attrs?.lede).toBeTruthy();

    // ③ 어디서 여는가 — 본문 첫 줄이고 제목이 아니다. 글을 읽고도 화면에서 못 찾는 일을 막는다
    expect(body.split("\n")[0]).not.toMatch(/^#/);
    expect(body.split("\n")[0]).toContain("Attributes");

    // ④ H2 작업들 — 기능 이름이 아니라 하려는 일로 갈린다
    expect(sections).toContain("자막이 한 줄에 안 들어갈 때");
    expect(sections.indexOf("자막이 한 줄에 안 들어갈 때")).toBeLessThan(
      sections.indexOf("나머지 속성"),
    );

    // ⑤ H2 나머지 속성(레퍼런스 표) / H2 관련 — 이 순서로 끝난다
    expect(sections.slice(-2)).toEqual(["나머지 속성", "관련"]);
  });

  it("첫 등장 병기 `Kerning(자간)`이 본문에 있다", () => {
    // 프로토타입 42는 이걸 "글자와 글자 사이 간격"으로 풀어 쓰다 `자간`을 **0회**로 만들었다.
    // 화면은 멀쩡했고 검색만 0건이 됐다 — 05의 재현율 게이트가 정확히 이걸 잡으러 온다
    expect(attrs?.body).toContain("Kerning(자간)");
    expect(attrs?.body).toContain("자간");
  });

  it("손대는 순서가 번호로 붙어 있다 — 위에서부터 시도하고 안 되면 내려간다", () => {
    for (const n of [1, 2, 3, 4]) {
      expect(attrs?.body).toMatch(new RegExp(`^### ${n}\\. `, "m"));
    }
  });

  it("사이드카 태그가 실제로 달려 있다 — 매뉴얼 사실·메운 자리·우리 판단 세 종류가 다 있다", () => {
    const entries = docs.sidecar.filter((e) => e.slug === "text-attributes");
    const kinds = new Set(entries.map((e) => e.tag.kind));

    expect(kinds).toEqual(new Set(["원본", "추론", "운영"]));
    expect(entries.length).toBeGreaterThan(10);
  });

  it("`[추론]` 문장이 화면 배지로 뜨고 나머지 태그는 본문에서 안 보인다", () => {
    expect(attrs?.body).toContain(`[확인 전](${BADGE_HREF})`);
    expect(attrs?.body).not.toMatch(/\[원본|\[운영|\[화면|\[추론\]/);
  });
});

describe("본문이 아직 없는 항목", () => {
  it("사이드바에는 서지만 페이지로는 안 나온다", () => {
    const dir = sandbox({
      "index.md": "이 문서는 무엇인가.",
      "text-attributes.md": "글자를 선택하면 Attributes 탭이 뜬다.",
    });
    const only = buildDocs(dir);

    const ready = new Map(only.nav.map((n) => [n.slug, n.ready]));

    expect(only.nav).toHaveLength(NAV.length);
    expect(only.pages.map((p) => p.slug)).toEqual(["", "text-attributes"]);
    expect(ready.get("text-attributes")).toBe(true);
    expect(ready.get("playback")).toBe(false);
  });
});

describe("소스가 잘못되면 빌드가 멈춘다", () => {
  it("흐름 순서에 없는 마크다운이 들어오면 터진다", () => {
    const dir = sandbox({ "index.md": "랜딩", "audio-timeline.md": "본문" });
    expect(() => buildDocs(dir)).toThrow(/audio-timeline/);
  });

  it("본문이 빈 파일이 있으면 터진다 — 빈 페이지가 뜨는 것이 최악의 실패다", () => {
    const dir = sandbox({ "index.md": "랜딩", "playback.md": "\n\n  \n" });
    expect(() => buildDocs(dir)).toThrow(/playback/);
  });

  it("랜딩이 없으면 터진다", () => {
    const dir = sandbox({ "text-attributes.md": "본문" });
    expect(() => buildDocs(dir)).toThrow(/index\.md/);
  });
});

const made: string[] = [];

/** 소스 폴더 하나를 손으로 짓는다 — 실물 `_content`를 안 건드리고 소스 사고를 재현한다. */
function sandbox(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "nabi-docs-"));
  made.push(dir);
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(join(dir, name), body);
  }
  return dir;
}

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

describe("사이드카 — 문장별 출처 태그", () => {
  // 문법: `문장이다.[태그]` — 공백 없이 바로 붙인다. 04 티켓 §태그 다섯.
  it("문단·목록·인용에서 다섯 태그를 걷고 문장을 정확히 자른다", () => {
    const dir = sandbox({
      "index.md": "랜딩",
      "text-attributes.md": [
        "첫 문장이다.[원본 p.74] 둘째 문장은 메운 자리다.[추론]",
        "",
        "- 목록 문장이다.[운영]",
        "",
        "> 인용 문장이다.[화면 2026.02]",
        "",
        "빈 슬롯이다.[운영 지식 필요]",
      ].join("\n"),
    });
    const { sidecar } = buildDocs(dir);
    const entries = sidecar.filter((e) => e.slug === "text-attributes");

    expect(entries).toEqual([
      { slug: "text-attributes", sentence: "첫 문장이다.", tag: { kind: "원본", page: 74 } },
      { slug: "text-attributes", sentence: "둘째 문장은 메운 자리다.", tag: { kind: "추론" } },
      { slug: "text-attributes", sentence: "목록 문장이다.", tag: { kind: "운영" } },
      { slug: "text-attributes", sentence: "인용 문장이다.", tag: { kind: "화면", build: "2026.02" } },
      { slug: "text-attributes", sentence: "빈 슬롯이다.", tag: { kind: "운영 지식 필요" } },
    ]);
  });

  it("`[운영]`과 `[화면]`을 각각 걸러 볼 수 있다 — 두 시계의 인덱스", () => {
    const dir = sandbox({
      "index.md": "랜딩",
      "text-attributes.md": "우리 값이다.[운영] 화면 사실이다.[화면 2026.02] 원본 사실이다.[원본 p.9]",
    });
    const { sidecar } = buildDocs(dir);

    expect(sidecar.filter((e) => e.tag.kind === "운영")).toHaveLength(1);
    expect(sidecar.filter((e) => e.tag.kind === "화면")).toHaveLength(1);
  });

  it("`[추론]`만 화면 배지로 바뀌고 나머지 넷은 본문에서 흔적 없이 사라진다", () => {
    const dir = sandbox({
      "index.md": "랜딩",
      "text-attributes.md":
        "원본 문장.[원본 p.1] 추론 문장.[추론] 빈 슬롯.[운영 지식 필요] 운영 문장.[운영] 화면 문장.[화면 2026.02]",
    });
    const { pages } = buildDocs(dir);
    const body = pages.find((p) => p.slug === "text-attributes")!.body;

    expect(body).not.toContain("[원본");
    expect(body).not.toContain("[운영 지식 필요]");
    expect(body).not.toContain("[운영]");
    expect(body).not.toContain("[화면");
    expect(body).not.toContain("[추론]");
    expect(body).toContain(`[확인 전](${BADGE_HREF})`);
    // 문장 본문 자체는 살아남는다 — 지워지는 것은 태그뿐이다
    expect(body).toContain("추론 문장.");
  });
});

describe("실물 소스", () => {
  it("`_content`의 마크다운이 하나도 안 빠지고 페이지가 된다", () => {
    const files = readdirSync(CONTENT_DIR).filter((n) => n.endsWith(".md"));
    expect(docs.pages).toHaveLength(files.length);
  });
});
