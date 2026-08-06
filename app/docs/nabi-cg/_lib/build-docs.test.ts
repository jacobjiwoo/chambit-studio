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
import { readdirSync } from "node:fs";

import { afterAll, describe, expect, it } from "vitest";

import { LANDING, NAV, UNLISTED } from "../_meta/nav";
import { BADGE_HREF, buildDocs, CONTENT_DIR } from "./build-docs";
import { cleanupSandboxes, sandbox } from "./test-sandbox";

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

  it("안내문과 2차 자리도 안 선다 — 페이지로는 서고 트리에는 없다", () => {
    // 잘라낸 34p와 2차 67p를 목차로 남기면 *"344항목 트리를 버리고 새로"* 불변식을 정면으로
    // 어긴다. 자리는 만들되 트리에는 안 넣고, 만나는 길은 검색 하나다(05)
    for (const entry of UNLISTED) {
      expect(docs.nav.map((n) => n.slug), entry.title).not.toContain(entry.slug);
      expect(page(entry.slug), entry.title).toBeDefined();
    }
  });

  it("**뒤집힐 조건** — 1단이 15개를 넘으면 골격 B가 무너진다", () => {
    // 넘어가는 순간 이 형태(항목마다 한 줄이 사이드바에 산다)를 버리고 제목만 사이드바 +
    // 개요 페이지 카드(골격 A)로 간다. 12가 페이지 둘을 더하면서 이 선에 가장 가까이 갔고,
    // 둘 다 트리 밖으로 보내 일곱을 지켰다
    expect(docs.nav).toHaveLength(7);
    expect(docs.nav.length).toBeLessThanOrEqual(15);
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

describe("도형 속성 페이지", () => {
  const shape = page("shape-attributes");
  const body = shape?.body ?? "";

  it("마크다운 한 장에서 렌더돼 나온다", () => {
    expect(shape).toBeDefined();
    expect(shape?.title).toBe("도형 속성");
    expect(shape?.lede).toBe("배경판·하단바의 크기와 색");
    expect(body.length).toBeGreaterThan(1000);
  });

  it("기본형 슬롯 다섯을 갖췄다", () => {
    const sections = h2(body);

    // ①② H1 기능 이름 + 해주는 일 한 줄 — 사이드바와 **같은 문자열**이라 nav에서 온다
    expect(shape?.title).toBeTruthy();
    expect(shape?.lede).toBeTruthy();

    // ③ 어디서 여는가 — 본문 첫 줄이고 제목이 아니다
    expect(body.split("\n")[0]).not.toMatch(/^#/);
    expect(body.split("\n")[0]).toContain("Attributes");

    // ④ H2 작업들 — 기능 이름 나열이 아니라 하려는 일로 갈린다. `Shape Type`이 아니라
    // *"자막이 길어져 배경판을 늘려야 할 때"*가 제목이다
    expect(sections[0]).toBe("자막이 길어져 배경판을 늘려야 할 때");
    expect(sections.indexOf("자막이 길어져 배경판을 늘려야 할 때")).toBeLessThan(
      sections.indexOf("나머지 속성"),
    );

    // ⑤ H2 나머지 속성(레퍼런스 표) / H2 관련 — 이 순서로 끝난다
    expect(sections.slice(-2)).toEqual(["나머지 속성", "관련"]);
  });

  it("손대는 순서가 번호로 붙어 있다 — 도형이 먼저고 글자가 나중이다", () => {
    for (const n of [1, 2]) {
      expect(body).toMatch(new RegExp(`^### ${n}\\. `, "m"));
    }
  });

  it("첫 등장 병기가 들어갔다 — 화면의 영문과 머릿속 한글이 둘 다 색인에 든다", () => {
    for (const pair of ["Shape Type(도형 종류)", "Pen Size(선 굵기)", "Alpha(투명도)"]) {
      expect(body, pair).toContain(pair);
    }
  });

  it("아이콘을 생김새가 아니라 경로로 가리킨다", () => {
    // 매뉴얼은 *"도형 모드 아이콘을 선택하고"*라고만 쓴다 — 글로만 읽는 독자는 그 아이콘을
    // 못 찾는다. 단축키가 있으면 단축키가 경로다(`R` = 도형 입력모드, 원본 p.108)
    expect(body).toMatch(/도형 입력모드/);
    expect(body).toContain("`R`");
    // *"빨간 OnAir 버튼"* 같은 생김새 문장은 PDF에서 안 나오므로 쓰지 않는다
    expect(body).not.toMatch(/빨간|녹색|파란/);
  });

  it("`Custom 도형`이 이 페이지에 없다 — 2차로 내렸다", () => {
    // *"곡선 조절은 손으로 끌어보면서 익히는 것이라 문장으로는 감이 안 온다."*
    expect(body).not.toContain("Custom");
    expect(body).not.toContain("프레임 포인트");
  });

  // 「그림이 0장이다」는 이 페이지만의 조건이 아니라 본문 규칙 셋째라 §실물 소스에서 전 페이지에 건다

  it("`H2 관련`에서 글자 속성으로 **링크**가 나간다 — 크기 조절이 글자↔도형을 넘나든다", () => {
    const related = body.slice(body.lastIndexOf("## 관련"));
    expect(related).toContain(`[글자 속성](${page("text-attributes")!.href})`);
  });

  it("사이드카 태그가 실제로 달려 있다 — 매뉴얼 사실·메운 자리·우리 판단 세 종류가 다 있다", () => {
    const entries = docs.sidecar.filter((e) => e.slug === "shape-attributes");
    const kinds = new Set(entries.map((e) => e.tag.kind));

    expect(kinds).toEqual(new Set(["원본", "추론", "운영"]));
    expect(entries.length).toBeGreaterThan(10);
  });

  it("`[원본 p.NN]`이 실제 PDF 위치와 맞는다 — §4.3은 p.80–83이다", () => {
    // 프로토타입 43은 이 절을 `p.109–111`로 적었는데 그건 **PDF 쪽 번호**다(인쇄 번호 +29).
    // 나머지 태그와 섞이면 검수자가 매번 어느 자를 쓸지 되묻는다 — 자는 인쇄 번호 하나다
    const pages = docs.sidecar
      .filter((e) => e.slug === "shape-attributes" && e.tag.kind === "원본")
      .map((e) => (e.tag as { kind: "원본"; page: number }).page);

    expect(pages.length).toBeGreaterThan(0);
    // §4.3 도형 객체 속성(80–83) · §4.5 Color(89–92) · §7.2 편집 단축키(108)
    const cited = [...new Set(pages)].sort((a, b) => a - b);
    expect(cited.every((p) => (p >= 80 && p <= 83) || (p >= 89 && p <= 92) || p === 108)).toBe(true);
  });

  it("`[추론]` 문장이 화면 배지로 뜨고 나머지 태그는 본문에서 안 보인다", () => {
    expect(body).toContain(`[확인 전](${BADGE_HREF})`);
    expect(body).not.toMatch(/\[원본|\[운영|\[화면|\[추론\]/);
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

afterAll(cleanupSandboxes);

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

describe("안내문 넷 — 잘라낸 34페이지를 덮는다", () => {
  const notice = page("not-covered");
  const body = notice?.body ?? "";
  const sections = h2(body);

  it("넷이 서고 각각 대상을 구체적으로 나열한다", () => {
    expect(sections).toEqual(["성경·찬송 자막", "설치·장비", "오디오·영상", "잘 안 쓰는 도구"]);

    // 대상 나열이 곧 **검색 키 확보**다. 화면에서 본 낱말을 치는 사람에게 이 글자들이 본문에
    // 실제로 박혀 있지 않으면 안내문은 존재해도 영영 안 만난다 — 걸리는지는 05가 잰다
    for (const key of ["교회DB", "성경", "찬송", "교독문", "장절", "설치", "오디오", "인쇄"]) {
      expect(body, key).toContain(key);
    }
  });

  it("이유절이 없다 — 사실만 적는다", () => {
    // 이유를 쓰면 **운영이 바뀔 때 문장이 거짓말이 된다.** 「방송부가 교회DB를 안 쓰므로」는
    // 안 쓰는 동안만 참이고, 쓰기 시작한 날 아무도 이 문장을 안 고친다
    expect(body).not.toMatch(/때문|므로|이라서|여서|왜냐/);
  });

  it("「없습니다」와 「아직 없습니다」가 갈라 쓰였다 — 영영과 지금은", () => {
    // 구별을 구조가 아니라 **문장이 흡수한다.** 기다리면 생기는 것과 안 생기는 것을 읽는
    // 사람이 가를 수 있어야 한다
    expect(body.match(/아직 없습니다/g) ?? []).not.toHaveLength(0);
    expect(body.match(/(?<!아직 )없습니다/g) ?? []).not.toHaveLength(0);
  });

  it("원본을 챕터 이름까지만 가리킨다 — 절 번호까지 내려가면 트리 복제에 닿는다", () => {
    const cited = [...body.matchAll(/원본 매뉴얼 `([^`]+)`/g)].map((m) => m[1]);

    expect(cited).toEqual([
      "Chapter 3. 교회 DB",
      "Chapter 1. Setting & Control",
      "Chapter 2. NABI-CG",
      "Chapter 2. NABI-CG",
    ]);
    expect(body).not.toMatch(/§/);
    expect(body).not.toMatch(/\d\.\d/);
  });

  it("`설치·장비` 안내문이 `CPX-DL Controller`를 담는다", () => {
    // 2차의 이상증상 셋 중 둘이 이 이름을 가리킨다(SD로 실행됨 → Output Format을 HD로).
    // 그 자리에 닿는 사람이 여기서 원본 챕터를 받아 간다
    const install = body.slice(body.indexOf("## 설치·장비"), body.indexOf("## 오디오·영상"));
    expect(install).toContain("CPX-DL Controller");
  });

  it("출처가 전부 `[운영]`이다 — 우리 운영이 바뀌면 다시 볼 곳", () => {
    // 안내문 문장의 주장은 매뉴얼 사실이 아니라 **범위 판정**이고, 범위는 운영의 함수다.
    // `[원본 p.NN]`을 안 다는 이유는 하나 더 있다 — 인쇄 번호가 챕터마다 리셋되므로 Ch1·Ch3를
    // 가리키는 `p.1`은 어느 챕터인지 말하지 못한다. 챕터 이름이 여기서 가장 정밀한 자다
    const kinds = new Set(docs.sidecar.filter((e) => e.slug === "not-covered").map((e) => e.tag.kind));
    expect(kinds).toEqual(new Set(["운영"]));
  });
});

describe("2차 자리 — 제목만 서고 본문은 비운다", () => {
  const later = page("not-yet");
  const body = later?.body ?? "";
  const slots = h2(body);

  it("67페이지가 자리와 제목으로만 선다", () => {
    // 1차/2차 절단의 값이 여기서 한 번 더 나온다 — 본문을 안 쓰면 검수도 갱신도 0이지만
    // *"찾았는데 없다"*는 막힌다
    expect(slots).toContain("이상증상 대처법");
    expect(slots).toContain("Global Animation");
    expect(slots).toContain("Custom 도형");
  });

  it("제목 아래가 실제로 비어 있다", () => {
    const under = body
      .slice(body.indexOf("## "))
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("## "));

    expect(under).toEqual([]);
  });

  it("`[화면]` 태그가 0개다 — 게이트 5의 물량이 안 는다", () => {
    // 06은 `[화면]` 한 줄마다 사람이 나비CG를 열어 재확인하는 비용을 건다. 2차는 본문이
    // 비어 그 비용에 1도 안 보태고, 안내문도 마찬가지다
    for (const slug of UNLISTED.map((entry) => entry.slug)) {
      const screen = docs.sidecar.filter((e) => e.slug === slug && e.tag.kind === "화면");
      expect(screen, slug).toHaveLength(0);
    }
  });
});

describe("실물 소스", () => {
  it("`_content`의 마크다운이 하나도 안 빠지고 페이지가 된다", () => {
    const files = readdirSync(CONTENT_DIR).filter((n) => n.endsWith(".md"));
    expect(docs.pages).toHaveLength(files.length);
  });

  it("그림이 0장이다 — 본문 규칙 셋째", () => {
    // 스크린샷을 다시 부르는 순간 04(공개 범위)에 연쇄한다. 한 장이 새는 것을 눈으로
    // 잡을 수는 없으므로 여기서 막는다
    for (const p of docs.pages) {
      expect(p.body, p.slug).not.toMatch(/!\[|<img/);
    }
  });

  it("페이지끼리 거는 링크가 본문 있는 페이지만 가리킨다", () => {
    // `output: 'export'`라 본문 없는 슬러그는 **라우트 자체가 안 만들어진다** — 사이드바는
    // 그 줄을 링크가 아닌 회색 줄로 세워 막지만, 본문 안에서 건 링크는 그대로 404가 된다.
    // 07이 `글자 속성`으로 링크를 걸면서 생긴 자리이고 08–11이 같은 자리를 네 번 더 지난다
    const ready = new Set(docs.pages.map((p) => p.href));
    for (const p of docs.pages) {
      for (const [, href] of p.body.matchAll(/\]\((\/docs\/nabi-cg[^)#]*)\)/g)) {
        expect(ready, `${p.slug} → ${href}`).toContain(href);
      }
    }
  });
});
