# 01: 문서 사이드바를 `app/docs/`로 올리기

Type: task
Status: resolved
Blocked by: 없음 — 바로 시작할 수 있다

## 무엇을 하나

`/docs/broadcast-system`이 `/docs/nabi`와 같은 사이드바·본문 레이아웃을 쓰게 되므로, 둘이 함께 쓰는 부분을 가장 가까운 공통 조상인 `app/docs/_components`·`app/docs/_lib`로 올린다([project-structure.md](../../../.claude/rules/project-structure.md) "코드는 쓰는 라우트 안에 둔다"). 동작은 바꾸지 않는 리팩터다.

## 알아 둘 것

- 지금은 `app/docs/nabi/_components/sidebar.tsx`, `page-links.tsx`, `_lib/pages.ts`에 있다. lint가 사촌 라우트의 private folder import를 막는다.
- NABI 사이드바는 **Chapter → 절** 두 단계이고 `CHAPTER_KEYS = ["setup", "cg", "db"]`가 박혀 있다. 방송 시스템은 **페이지 한 단계**(용어집, 장비 목록표, …)다. frontmatter는 `title`, `description`(150자 이내), `slug`, `order`면 된다.
- 그래서 통째로 옮기지 않는다. 실제로 둘이 같은 것(사이드바 표시, 레이아웃 껍데기, frontmatter 읽기·`order` 정렬·`description` 길이 검사 등)만 올리고, Chapter 처리처럼 NABI에만 있는 것은 `app/docs/nabi/` 안에 남긴다. 무엇을 올렸는지와 이유를 Answer에 적는다.
- 미리 올리지 않는다. 방송 시스템이 쓰지 않을 것을 "나중을 위해" 올리지 않는다.

## 건드리지 않는 것

02와 동시에 돈다. `app/_components/`, `mdx-components.tsx`, `.claude/rules/`, `CONTEXT.md`, `app/docs/broadcast-system/`은 고치지 않는다.

## 끝난 조건

- `/docs/nabi`의 사이드바, 첫 페이지 링크, 지금 보는 절 강조가 전과 같다. 빌드한 `out/docs/nabi/**` HTML을 전후로 비교해 확인한다.
- 기존 `pages.test.ts`가 통과하고, 옮긴 함수의 테스트는 대상 파일 옆으로 따라간다.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다.

## Answer

### `app/docs/`로 올린 것

- `_lib/frontmatter.ts` — `readBaseFrontmatter`(`title`·`description`·`slug`·`order` 확인, `description` 150자 검사), `readFrontmatterData`(YAML 블록 읽기), `sortByOrder`(`order` 정렬·중복 검사). 방송 시스템 frontmatter가 바로 이 네 키라 같은 규칙을 쓴다. 테스트는 `frontmatter.test.ts`로 따라갔다.
- `_lib/page-link.ts` — `PageLink` 타입과 `toLink`. 사이드바와 첫 페이지 링크 목록의 공통 단위다.
- `_components/docs-shell.tsx` — 사이드바(`aside`) + 본문(`article`) 껍데기. 사이드바 내용은 `sidebar` prop으로 받는다.
- `_components/sidebar-page-link.tsx` — 사이드바의 페이지 링크 하나와 지금 보는 페이지 강조(`aria-current`).
- `_components/page-link-list.tsx` — 첫 페이지의 링크 목록.

### NABI에 남긴 것

- `CHAPTER_KEYS`, `chapter` 키 검사, 폴더와 `chapter`·`slug` 대조, `toNav`, `loadNav`, Chapter 첫 페이지 필수 검사 — Chapter → 절 두 단계라서 NABI에만 있다.
- `Sidebar`(Chapter 제목 링크와 목록 구성), `ChapterLinks`·`SectionLinks` — 방송 시스템은 한 단계라 모양이 다르다. 공용 조각만 위로 올렸다.

### 확인

`out/docs/nabi/**`의 HTML을 전후로 비교했다. `<script>`와 해시가 든 `/_next/` 경로·폰트 클래스를 지우면 DOM이 바이트 단위로 같다. (script 안 RSC payload의 module id는 파일이 바뀌어 달라지나 화면과 무관하다.) `pnpm lint`, `pnpm typecheck`, `pnpm build`(vitest 포함)가 통과했다.
