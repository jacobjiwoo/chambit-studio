/**
 * 소스 폴더 하나가 들어가고 문서 사이트가 나온다 — **이 사이트의 유일한 seam**이다.
 *
 * ```
 * _content/*.md  ┐
 * _values        ├──▶ buildDocs() ──▶ { pages, index, nav, sidecar }
 * _meta/*        ┘                      ↑02    ↑05    ↑02    ↑04
 * ```
 *
 * 지금 나오는 것은 `pages`와 `nav` 둘이다. 색인은 05가, 사이드카는 04가 **같은 함수에** 붙는다.
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

export type Docs = { pages: DocPage[]; nav: DocNavItem[] };

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
  const pages = entries
    .filter((entry) => bodies.has(entry.slug))
    .map((entry) => ({ ...entry, href: hrefOf(entry.slug), body: bodies.get(entry.slug)! }));

  const nav = NAV.map((entry) => ({
    ...entry,
    href: hrefOf(entry.slug),
    ready: bodies.has(entry.slug),
  }));

  return { pages, nav };
}
