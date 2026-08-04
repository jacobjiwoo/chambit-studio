/**
 * 소스 폴더 하나가 들어가고 문서 사이트가 나온다 — **이 사이트의 유일한 seam**이다.
 *
 * ```
 * _content/*.md  ┐
 * _values        ├──▶ buildDocs() ──▶ { pages, index, nav, sidecar }
 * _meta/*        ┘                      ↑02    ↑05    ↑02    ↑04
 * ```
 *
 * 지금 나오는 것은 `pages`·`nav`·`sidecar` 셋이다. 색인은 05가 **같은 함수에** 붙는다.
 * 게이트 여섯이 전부 이 함수의 산출물에 대한 `expect()`가 되므로, 토크나이저·치환기·태그 파서에
 * 별도 테스트를 두지 않는다 — 전부 이 아래에 있다.
 *
 * **본문은 여기서 문자열로 나오고 렌더는 Server Component가 한다.** `output: 'export'`라 HTML이
 * 빌드 타임에 구워져 나가고 `react-markdown`이 브라우저로 안 간다.
 */
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import { LANDING, NAV, type NavEntry } from "../_meta/nav";

/** 문서 뿌리. 둘째 문서는 `/docs/handover/`로 **옆에** 서면 되고 여기 URL은 안 깨진다. */
const BASE = "/docs/nabi-cg";

/** 랜딩(`/docs/nabi-cg/`)의 소스. 사이드바에 안 서는 유일한 페이지다. */
const LANDING_FILE = "index.md";

/**
 * **URL 슬러그 규칙 — ASCII 소문자·숫자·하이픈만.**
 *
 * 사용자 스토리 13(*"주소를 북마크하고 다른 사람에게 불러줄 수 있기를 원한다"*)이 제약이고,
 * 재는 잣대는 둘이다 — 복사했을 때 퍼센트 인코딩으로 터지는가, 입으로 부를 수 있는가.
 * 한글 슬러그는 첫째에서 진다(`글자속성` → `%EA%B8%80...` 36자). 부르는 쪽은 인수인계 때
 * 받아 적는 주소가 **뿌리 하나**(`chambitstudio.com/docs/nabi-cg/`)라 딥 페이지에 걸리는
 * 하중이 애초에 작다. 근거 전문은 티켓 02 §남길 결정 하나.
 *
 * 규칙이 주석이 아니라 **가드**인 이유는, 이름을 짓는 자리가 앞으로 여섯 번 더 오기 때문이다.
 */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 한 장. `title`·`lede`는 `_meta/nav.ts`에서 오고 `body`만 마크다운에서 온다. */
export type DocPage = NavEntry & {
  href: string;
  /** 마크다운 원문. 첫 줄이 *"어디서 여는가"*이고 제목은 여기 없다 */
  body: string;
};

/** 사이드바 한 줄. `ready`가 false면 본문이 아직 없다 — 서 있되 링크가 아니다. */
export type DocNavItem = NavEntry & { href: string; ready: boolean };

/**
 * 문장 하나가 무엇에 묶여 있는가. `[원본 p.NN]`·`[화면 YYYY.MM]`은 낡는 조건이 다른 두 시계라
 * 페이지·빌드 번호를 들고 다닌다 — 06의 게이트가 `화면`을 `NABI_BUILD`와 바로 비교한다.
 */
export type SidecarTag =
  | { kind: "원본"; page: number }
  | { kind: "추론" }
  | { kind: "운영 지식 필요" }
  | { kind: "운영" }
  | { kind: "화면"; build: string };

/** 사이드카 한 줄. `sentence`는 정확한 문장 분리가 아니라 검수자가 자리를 찾을 만큼만 잘린다. */
export type SidecarEntry = { slug: string; sentence: string; tag: SidecarTag };

export type Sidecar = SidecarEntry[];

export type Docs = { pages: DocPage[]; nav: DocNavItem[]; sidecar: Sidecar };

/**
 * **문장별 출처 태그 — 마크다운 문법 한 줄.**
 *
 * 문장 끝에 공백 없이 바로 붙인다: `문장이다.[추론]`. 다섯 종류뿐이다 —
 * `[원본 p.42]` · `[추론]` · `[운영 지식 필요]` · `[운영]` · `[화면 2026.02]`.
 *
 * 대괄호만 있고 뒤에 `(...)`가 없으면 CommonMark가 링크로 안 읽고 리터럴 텍스트로 남기므로
 * 별도 이스케이프가 필요 없다. `buildDocs()`가 이 정규식 하나로 태그를 걷고(사이드카) 지운다(본문).
 */
const TAG = /\[(원본 p\.(\d+)|추론|운영 지식 필요|운영|화면 (\d{4}\.\d{2}))\]/g;

/** `[추론]`이 화면에서 바뀌는 자리 — react-markdown 링크로 심어 `components.a`가 배지로 바꾼다. */
export const BADGE_HREF = "#unconfirmed";

function parseTag(inner: string, page: string | undefined, build: string | undefined): SidecarTag {
  if (page !== undefined) return { kind: "원본", page: Number(page) };
  if (inner === "추론") return { kind: "추론" };
  if (inner === "운영 지식 필요") return { kind: "운영 지식 필요" };
  if (inner === "운영") return { kind: "운영" };
  return { kind: "화면", build: build! };
}

/** 목록·인용·표는 줄 하나가 그 자체로 한 단위다. 나머지 줄은 소프트 줄바꿈이므로 이어 붙인다. */
const UNIT_LINE = /^\s*(?:[-*]\s|\d+\.\s|>\s|\|)/;

function splitUnits(block: string): string[] {
  const units: string[] = [];
  let buf: string[] = [];
  const flush = () => {
    if (buf.length > 0) units.push(buf.join(" "));
    buf = [];
  };
  for (const line of block.split("\n")) {
    if (line.trim() === "") {
      flush();
    } else if (UNIT_LINE.test(line)) {
      flush(); // 새 목록·인용·표 항목이 시작됐다 — 이전 단위를 닫는다
      buf.push(line.trim());
    } else {
      // 소프트 줄바꿈이다. 목록 항목이 둘째 줄로 이어지는 경우도 포함해 그대로 이어 붙인다
      buf.push(line.trim());
    }
  }
  flush();
  return units;
}

/** 문장 끝 표시 뒤에 마크다운 강조 기호가 남아 있을 수 있다 — `...좁힌다.**[운영]`. */
const TERMINATOR = /[.!?][*_`)"'」』]*(?=\s|$)/g;
/** 단위가 목록·인용 줄에서 왔으면 마커가 문장 앞에 남는다 — 잘라낸다. */
const LEADING_MARKER = /^(?:[-*]\s+|\d+\.\s+|>\s+)/;

function sentenceBefore(unit: string, from: number, to: number): string {
  const scanned = unit.slice(from, to);
  let cut = from;
  for (const m of scanned.matchAll(TERMINATOR)) {
    const end = m.index + m[0].length;
    // 태그 바로 앞에 붙은 마침표는 지금 문장 자신의 끝이다 — 자르는 경계가 아니라 문장에 남는다
    if (end === scanned.length) continue;
    cut = from + end;
  }
  return unit.slice(cut, to).replace(LEADING_MARKER, "").trim();
}

/** 한 페이지 원문에서 사이드카 항목을 걷는다. 태그 파서 자체는 이 함수 하나뿐이고 별도 테스트가
 * 없다 — `buildDocs()` 산출물(사이드카)에 대한 `expect()`로만 검증된다. */
function extractSidecar(slug: string, body: string): SidecarEntry[] {
  const entries: SidecarEntry[] = [];
  for (const block of body.split(/\n{2,}/)) {
    for (const unit of splitUnits(block)) {
      let cursor = 0;
      for (const match of unit.matchAll(TAG)) {
        const sentence = sentenceBefore(unit, cursor, match.index);
        if (sentence) entries.push({ slug, sentence, tag: parseTag(match[1], match[2], match[3]) });
        cursor = match.index + match[0].length;
      }
    }
  }
  return entries;
}

/** 화면에 뜨는 것은 `[추론]` 하나뿐이다 — 나머지 넷은 아무 흔적도 안 남기고 지워진다. */
function renderBody(body: string): string {
  return body.replace(TAG, (_, inner: string) => (inner === "추론" ? `[확인 전](${BADGE_HREF})` : ""));
}

/**
 * 실물 소스 폴더.
 *
 * `import.meta.url`이 아니라 `process.cwd()`인 이유는 이 모듈이 **번들을 지나** 서버
 * 컴포넌트에서도 불리기 때문이다 — 번들러가 `import.meta.url`을 `.next/server/...`로 다시
 * 쓴다. `next build`도 `vitest`도 저장소 뿌리에서 도는 것이 전제다.
 */
export const CONTENT_DIR = join(process.cwd(), "app/docs/nabi-cg/_content");

const hrefOf = (slug: string) => (slug ? `${BASE}/${slug}` : BASE);

export function buildDocs(contentDir: string): Docs {
  const entries = [LANDING, ...NAV];

  for (const entry of entries) {
    if (entry.slug !== LANDING.slug && !SLUG.test(entry.slug)) {
      throw new Error(
        `_meta/nav.ts: 슬러그 '${entry.slug}'(${entry.title})가 규칙을 어긴다 — ASCII 소문자·숫자·하이픈만 쓴다.`,
      );
    }
    if (!entry.title.trim() || !entry.lede.trim()) {
      throw new Error(
        `_meta/nav.ts: '${entry.slug}'에 제목이나 한 줄 설명이 비어 있다 — 그 한 줄이 이 사이트의 발견 면 전부다.`,
      );
    }
  }

  const bodies = new Map<string, string>();
  for (const file of readdirSync(contentDir).filter((name) => name.endsWith(".md"))) {
    const slug = file === LANDING_FILE ? LANDING.slug : basename(file, ".md");

    if (!entries.some((entry) => entry.slug === slug)) {
      throw new Error(
        `_content/${file}: 흐름 순서에 없는 페이지다 — _meta/nav.ts의 NAV에 한 줄을 넣거나 파일을 지운다.`,
      );
    }

    const body = readFileSync(join(contentDir, file), "utf8").trim();
    if (!body) {
      // 빈 페이지가 뜨는 것이 이 사이트 최악의 실패다 — *"찾았는데 없다"*
      throw new Error(`_content/${file}: 본문이 비어 있다.`);
    }

    bodies.set(slug, body);
  }

  if (!bodies.has(LANDING.slug)) {
    throw new Error(`_content/${LANDING_FILE}가 없다 — /docs/nabi-cg/가 빈 화면으로 뜬다.`);
  }

  // 흐름 순을 그대로 물려준다. 페이지 목록이 파일 이름 순으로 서면 05의 색인과 사이드바가
  // 서로 다른 순서를 말하게 된다
  const ready = entries.filter((entry) => bodies.has(entry.slug));
  const sidecar = ready.flatMap((entry) => extractSidecar(entry.slug, bodies.get(entry.slug)!));
  const pages = ready.map((entry) => ({
    ...entry,
    href: hrefOf(entry.slug),
    body: renderBody(bodies.get(entry.slug)!),
  }));

  const nav = NAV.map((entry) => ({
    ...entry,
    href: hrefOf(entry.slug),
    ready: bodies.has(entry.slug),
  }));

  return { pages, nav, sidecar };
}
