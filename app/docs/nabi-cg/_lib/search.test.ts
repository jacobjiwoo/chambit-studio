/**
 * **게이트 1 — 이 사이트에서 가장 값이 큰 테스트다.**
 *
 * 09가 카테고리 결정(1단 트리를 기능 축으로 가른 것)의 뒤집힐 조건으로 **재현율 92%**를 남겼다.
 * 테스트가 없으면 그 선을 넘은 것을 **아무도 모른다** — 본문을 사람이 읽기 좋게 풀어 쓰다가
 * 검색 키를 흘리면 화면은 멀쩡해 보이고 검색만 0건이 된다. 실제로 두 번 재현된 사고다
 * (프로토타입 42에 `자간`이 0회, 검색 시안에서 `줄간격`·`스타일`이 각 0건).
 *
 * **게이트는 색인 산출물에 걸린다.** 들어가는 것은 `buildDocs()`가 구운 색인 문자열 하나이고,
 * 나오는 것은 사람이 화면에서 보는 결과 줄이다. 토크나이저가 2-gram을 어떤 자료구조로 만드는지
 * 이 파일은 모른다 — **색인 방식을 통째로 갈아도 재현율이 유지되면 통과한다.**
 */
import { describe, expect, it } from "vitest";

import { LANDING, NAV } from "../_meta/nav";
import { buildDocs, CONTENT_DIR } from "./build-docs";
import { loadIndex } from "./search";

const docs = buildDocs(CONTENT_DIR);
const search = loadIndex(docs.index);

/** 본문이 저장소에 있는 슬러그 — 유예 판정의 유일한 근거다. */
const ready = new Set(docs.pages.map((p) => p.slug));

const find = (query: string) => search.find(query);
const slugs = (query: string) => find(query).map((hit) => hit.slug);

/**
 * **질의 20개 — 리터럴로 옮겨 적는다.** 원본에서 뽑아올 수 없는 세트다. 방송부 사람이 화면에서
 * 본 영문(`Kerning`)과 **우리가 지은 한글 이름**(`줄간격`·`굵기`·`윤곽선`) 둘 다로 친다.
 *
 * `줄간격`과 `스타일`이 **두 종류의 대표 표본**이다 —
 * - `줄간격`은 **색인 쪽**이다. 본문은 `Leading(줄 간격)`으로 띄어 쓰므로 공백 제거 정규화가
 *   죽는 순간 0건이 된다. **2-gram만으로는 어절 경계를 넘는 `줄간`이 색인에 없다**
 * - `스타일`은 **본문 쪽**이다. `Style Catalog`의 한글 이름을 안 지으면 0건이 된다
 *
 * `page`는 그 질의가 떨어져야 하는 자리다. **본문이 아직 없는 페이지를 겨냥한 질의는 유예된다** —
 * 정답 페이지가 저장소에 생기는 순간 자동으로 게이트에 들어오고 그때부터 92%를 함께 지킨다.
 */
const QUERIES: { query: string; page: string }[] = [
  // ── 글자 속성 (본문 있음) ──────────────────────────────────────────────
  { query: "자간", page: "text-attributes" },
  { query: "Kerning", page: "text-attributes" },
  { query: "줄간격", page: "text-attributes" },
  { query: "Ctrl+H", page: "text-attributes" },
  { query: "글자 크기", page: "text-attributes" },
  { query: "굵기", page: "text-attributes" },
  { query: "윤곽선", page: "text-attributes" },
  { query: "기울임", page: "text-attributes" },
  { query: "띄어쓰기", page: "text-attributes" },
  { query: "서체", page: "text-attributes" },
  { query: "회전", page: "text-attributes" },
  { query: "Text Link", page: "text-attributes" },
  { query: "Width", page: "text-attributes" },
  { query: "자막", page: "text-attributes" },
  // ── 본문이 나중에 들어온 여섯 (07–10이 다섯을 채웠고 `송출` 하나가 11을 기다린다) ──
  { query: "스타일", page: "style-catalog" },
  { query: "임포트", page: "text-import" },
  { query: "배경판", page: "shape-attributes" },
  { query: "일괄 지정", page: "object-editing" },
  { query: "송출", page: "playback" },
  { query: "단축키", page: "shortcuts" },
];

describe("게이트 1 — 질의 20개 재현율", () => {
  it("세트가 20개이고 `줄간격`과 `스타일`이 들어 있다", () => {
    expect(QUERIES).toHaveLength(20);
    const asked = QUERIES.map((q) => q.query);
    expect(asked).toContain("줄간격");
    expect(asked).toContain("스타일");
    expect(new Set(asked).size).toBe(20);
  });

  it("우리가 지은 한글 이름이 세트에 들어 있다 — 원본에서 뽑아올 수 없는 부분이다", () => {
    // 화면의 영문만으로 세트를 채우면 게이트가 **본문 쪽 사고**(한글 이름을 안 짓는 것)를
    // 통째로 못 잡는다. `Leading`은 매뉴얼에 있지만 `줄간격`은 우리가 짓는 이름이다
    const korean = QUERIES.filter((q) => /^[가-힣][가-힣 ]*$/.test(q.query));
    expect(korean.length).toBeGreaterThanOrEqual(10);
  });

  it("정답 페이지가 실재하는 슬러그다 — 오타 하나면 그 질의가 영영 유예된다", () => {
    // 유예의 근거가 **저장소에 본문이 있는가** 하나뿐이라, 없는 슬러그를 적으면 그 질의는
    // 실패하지 않고 **조용히 빠진다.** 게이트에서 질의가 사라지는 유일한 길이 여기다
    const known = new Set([LANDING.slug, ...NAV.map((entry) => entry.slug)]);
    for (const { query, page } of QUERIES) {
      expect(known, `'${query}'의 정답 페이지 '${page}'`).toContain(page);
    }
  });


  it("재현율이 0.92 아래로 떨어지면 실패한다", () => {
    const active = QUERIES.filter((q) => ready.has(q.page));
    const missed = active.filter((q) => !slugs(q.query).includes(q.page));
    const recall = (active.length - missed.length) / active.length;

    expect(
      recall,
      missed.length === 0
        ? ""
        : `걸리지 않은 질의 — ${missed.map((q) => `'${q.query}' → ${q.page}`).join(", ")}\n` +
          `본문에서 그 단어를 흘렸는지 먼저 본다. 첫 등장 병기(\`Kerning(자간)\`)가 풀어 써져 있으면 여기서 터진다.`,
    ).toBeGreaterThanOrEqual(0.92);
  });
});

describe("색인 크기 — 스펙이 예산을 잡았는데 재는 자가 없었다", () => {
  // 스펙 §검색이 `어절 + 2-gram`에 **~36 KB**를 잡았고(32p 환산), 조사의 실측표를 보면 그
  // 숫자는 **gzip 단위**다(같은 설정 raw 391 KB / gzip 83 KB). 그런데 여기에는 재는 자가
  // 아예 없어서, 본문이 늘 때마다 아무도 모르게 불었다 — 09를 끝냈을 때 raw 292 KB였다.
  //
  // **2026-08-07에 절반을 덜어냈다.** 색인이 들고 있던 「합친 어절」(`줄 간격` → `줄간격`)을
  // 빼고 그 일을 질의 쪽 `plan()`으로 옮겼다. 재현율은 그대로다(아래 게이트 1이 증인).
  const bytes = Buffer.byteLength(docs.index);
  const chars = docs.pages.reduce((n, p) => n + p.body.length, 0);

  it("본문 한 글자당 색인 바이트 — **설정이 부푸는 것**을 잡는 자다", () => {
    // 절대 크기는 본문이 늘면 정당하게 는다. 부당하게 느는 것은 **글자당 비용**이고, 그건
    // 토크나이저·필드 구성이 바뀔 때만 움직인다. 09 시점 21.7 B/자 → 지금 13 B/자.
    // 조사가 같은 설정으로 잰 값은 3.7 B/자였다(105,846자 코퍼스) — 우리가 아직 그 4배인
    // 이유는 색인 칸이 페이지가 아니라 **섹션**이라 같은 항이 여러 칸에 실리기 때문이다
    expect(bytes / chars).toBeLessThan(17);
  });

  it("합친 어절이 색인에 없다 — 크기의 절반이 거기 있었다", () => {
    // `줄간격`은 **항으로 없고** `줄간`·`간격` 둘로 걸린다. 이 한 줄이 무너지면(누가 색인 쪽에
    // 붙이기를 되돌리면) 위 글자당 게이트가 같이 터진다 — 둘은 같은 사실의 두 얼굴이다
    expect(docs.index).not.toContain("줄간격");
    expect(slugs("줄간격")).toContain("text-attributes");
  });

  it("절대 크기도 본다 — 본문 다섯 장이 더 붙어도 안 터지는 선이다", () => {
    // 10·11이 두 장을 더 얹는다. 이 선에 닿으면 그때는 **본문이 아니라 설계를 봐야 한다**
    // (색인 칸을 섹션에서 페이지로 되돌리거나, 검색을 다시 여는 티켓).
    expect(bytes).toBeLessThan(320_000);
  });
});

describe("토크나이저가 지는 것 셋", () => {
  it("어절 — 조사가 붙어도 걸린다", () => {
    // `자막이`·`자막을`이 색인에 통째로 들어 있어도 `자막`으로 걸려야 한다
    expect(slugs("자막")).toContain("text-attributes");
  });

  it("2-gram — 복합명사 안쪽이 열린다", () => {
    // 본문에는 `띄어쓰기 칸`만 있고 `칸`이라는 어절은 없다
    expect(slugs("쓰기")).toContain("text-attributes");
  });

  it("공백 제거 정규화 — `줄간격`으로 붙여 쳐도 `줄 간격`이 걸린다", () => {
    // 시안에서 실제로 0건이 났던 자리다. 2-gram만으로는 어절 경계를 넘는 `줄간`이 색인에 없다
    expect(slugs("줄간격")).toContain("text-attributes");
    expect(slugs("줄 간격")).toContain("text-attributes");
    expect(find("줄간격")[0].href).toBe(find("줄 간격")[0].href);
  });
});

describe("화면에 보이는 단어를 그대로 친다", () => {
  it("`자간`과 `Kerning` 중 무엇을 쳐도 같은 곳이 나온다", () => {
    // 첫 등장 병기 `Kerning(자간)`이 사는 이유 전부가 이 한 줄이다
    expect(find("자간")[0].href).toBe(find("Kerning")[0].href);
    expect(find("자간")[0].heading).toContain("Kerning");
  });

  it("`Ctrl+H` 같은 단축키 문자열로도 걸린다", () => {
    // `+`가 구분자로 먹히면 `ctrl`과 `h`로 갈라져 아무 데나 걸린다
    expect(slugs("Ctrl+H")).toContain("text-attributes");
    expect(find("Ctrl+H")[0].heading).toContain("Kerning");
  });

  it("사이드바 한 줄 설명이 색인에 들어간다", () => {
    // 그 한 줄이 이 사이트의 발견 면 전부인데 색인에서 빠지면 검색으로는 영영 안 만난다.
    // 한 줄을 통째로 쳐서 그 페이지가 나오는 것으로 본다 — 색인을 어떻게 담았는지는 안 본다
    for (const item of docs.nav.filter((n) => ready.has(n.slug))) {
      expect(slugs(item.lede), item.slug).toContain(item.slug);
    }
    // 랜딩의 한 줄에만 있는 단어로도 그 페이지가 나온다
    expect(slugs("참빛교회")).toContain(LANDING.slug);
  });

  it("걸리는 게 없으면 빈 결과다 — 아무거나 채워 넣지 않는다", () => {
    // 한때 이 자리가 `교회DB 성경 장절`이었다. 12가 안내문을 세우면서 **그게 정확히 반대로
    // 뒤집혔다** — 이제 그 질의는 걸려야 하고, 아래 §안내문이 그걸 잰다
    expect(find("유튜브 송출")).toEqual([]);
  });

  it("초성 검색이 없다 — 1차에서 뺀 것이 실제로 빠져 있다", () => {
    expect(find("ㅈㄱ")).toEqual([]);
    expect(find("ㄷㅊㅋ")).toEqual([]);
  });
});

describe("안내문 넷 — 검색이 유일한 길이다", () => {
  // 안내문은 1단 트리에 없다. **여기서 안 걸리면 존재하지 않는 것과 같다** — 그래서 이 블록이
  // 12의 진짜 게이트다. *"찾았는데 없다"*가 이 사이트 최악의 실패이고, 안내문이 그걸 덮는 대신
  // 자기가 안 걸리면 실패가 그대로 남는다
  it("잘라낸 34페이지를 겨냥한 낱말이 전부 안내문으로 떨어진다", () => {
    for (const query of ["교회DB", "성경", "찬송", "설치", "오디오"]) {
      expect(slugs(query), query).toContain("not-covered");
    }
  });

  it("장비 이름으로도 걸린다 — 이름은 모르고 화면에 뜬 글자만 아는 경우", () => {
    expect(slugs("CPX-DL Controller")).toContain("not-covered");
    expect(slugs("교회DB 성경 장절")).toContain("not-covered");
  });

  it("결과 줄이 어느 안내문인지 말한다 — 열기 전에 답이 보인다", () => {
    // 결과 줄은 `섹션 › 소제목`이다. 페이지 하나에 안내문 넷을 얹었으므로 소제목이 곧
    // 안내문 이름이 되고, 여덟 줄 중에서 고르는 사람이 **누르기 전에** 무엇인지 안다
    const hit = find("교회DB").find((h) => h.slug === "not-covered")!;
    expect(hit.section).toBe("이 문서가 다루지 않는 것");
    expect(hit.heading).toBe("성경·찬송 자막");
    expect(hit.href).toMatch(/^\/docs\/nabi-cg\/not-covered#/);
  });
});

describe("2차 자리 — 제목뿐이어도 걸린다", () => {
  it("자리 이름으로 치면 *아직 안 쓴 것*이 뜬다", () => {
    // 본문이 0줄이라 색인에 든 글자는 **제목뿐이다.** 그래도 *"찾았는데 아무것도 없다"*와
    // *"아직 안 썼다"*는 읽는 사람에게 전혀 다른 답이다
    for (const query of ["이상증상", "Global Animation", "Custom 도형", "옵션창"]) {
      expect(slugs(query), query).toContain("not-yet");
    }
  });

  it("**답이 있는 페이지를 밀어내지는 않는다** — 제목뿐인 칸은 본문 아래다", () => {
    // 2차 자리의 소제목 17개는 전부 본문 0줄인 칸이라 **소제목 부스트(×3)만 받고도** 같은
    // 낱말을 여러 번 쓴 본문을 이긴다. `스타일`에서 실제로 그랬다 — `## 객체 스타일`이 1위,
    // Style Catalog이 2위였다. 그 페이지의 임무는 만나지는 것이지 답을 가리는 것이 아니다
    expect(find("스타일")[0].slug).toBe("style-catalog");
    expect(slugs("스타일")).toContain("not-yet");
  });
});

describe("결과 한 줄", () => {
  const hit = () => find("자간")[0];

  it("`섹션 › 소제목`과 매치 문맥이 함께 온다", () => {
    expect(hit().section).toBe("글자 속성");
    expect(hit().heading).not.toBe("");
    expect(hit().context.map((part) => part.text).join("")).not.toBe("");
  });

  it("문맥 안에서 매치된 자리가 표시된다 — 하이라이트가 화면 쪽 장식이 아니다", () => {
    const marked = hit().context.filter((part) => part.hit);
    expect(marked.length).toBeGreaterThan(0);
    expect(marked.map((part) => part.text.toLowerCase())).toContain("자간");
  });

  it("결과를 누르면 그 페이지의 그 자리로 떨어진다", () => {
    expect(hit().href).toMatch(/^\/docs\/nabi-cg\/text-attributes#/);
    // 주소를 복사했을 때 퍼센트 인코딩으로 안 터진다 — 02의 슬러그 결정과 같은 잣대다
    expect(encodeURI(hit().href)).toBe(hit().href);
  });

  it("본문에서 지워진 사이드카 태그가 색인에도 문맥에도 안 남는다", () => {
    // `[원본 p.74]`가 색인에 들어가면 `원본`·`74`가 검색어가 되고 문맥에도 튀어나온다
    expect(find("추론")).toEqual([]);
    expect(find("운영 지식 필요")).toEqual([]);
    // 화면 배지(`[확인 전](#unconfirmed)`)도 본문이 아니라 표시다 — 색인에 안 들어간다
    expect(find("unconfirmed")).toEqual([]);
    // 태그가 붙어 있던 문장 자체는 멀쩡히 걸린다 — 지워지는 것은 태그뿐이다
    expect(slugs("음수까지 내려가면")).toContain("text-attributes");
  });
});
