# 문서 기반 세우기

Type: task
Status: resolved
Blocked by: 01

## Question

절별 변환이 MDX 파일만 쓰면 되도록 `/docs/nabi` 기반을 세운다. 하는 일이지만, 이것 없이는 첫 변환 티켓의 결과를 사이트에서 확인할 수 없다. `Callout`은 `Callout 컴포넌트`가 따로 맡는다.

- `Next.js 16에서 MDX 문서 기반을 세우는 방법`의 답대로 MDX 설정, `mdx-components.tsx`, frontmatter, `remark-gfm`, `rehype-slug`를 들인다
- `/docs/nabi` 레이아웃과 사이드바(Chapter → 절)를 만든다. 사이드바는 frontmatter를 읽으므로 페이지 목록이 정해지기 전에 만들 수 있다
- 루트 표에 없는 것(`mdx-components.tsx`, `public/`)은 Next.js 문서를 확인하고 [project-structure.md](../../../.claude/rules/project-structure.md)를 먼저 고친다
- 홈(`app/page.tsx`) 도구 목록에 문서 링크를 둘지 정한다
- 샘플 페이지로 표·인라인 코드·이미지 자리표시자·앵커가 렌더되는지 확인하고, 빌드한 HTML에서 frontmatter가 `metadata`로 들어가는지와 한국어 앵커 id를 실제로 확인한다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과해야 끝난다

## Answer

### 한 일

- `@next/mdx@16.2.12`(`next`와 같은 버전으로 고정), `@mdx-js/loader`, `@mdx-js/react`, `remark-gfm`, `remark-frontmatter`, `remark-mdx-frontmatter`, `rehype-slug`, `yaml`, `@types/mdx`(dev)를 설치했다.
- `next.config.ts`에 `pageExtensions: ["ts", "tsx", "mdx"]`와 `createMDX`를 더했다. 플러그인은 문자열 이름이다.
- 루트 `mdx-components.tsx`가 본문 요소(제목, 문단, 목록, 표, 코드, 이미지 등)에 Tailwind class를 준다. `@tailwindcss/typography`는 들이지 않았다. `img`는 일반 `<img>`다.
- [project-structure.md](../../../.claude/rules/project-structure.md) 루트 표에 `mdx-components.tsx`·`public/`을, 라우팅 파일에 `page.mdx`를 더했다.
- `app/docs/nabi/layout.tsx`가 빌드 때 `_lib/pages.ts`의 `loadNav()`로 `app/docs/nabi/<chapter>/<절>/page.mdx`의 frontmatter를 읽어 `_components/sidebar.tsx`에 넘긴다. Chapter는 원문 순서(setup → cg → db), 절은 `order` 순이다. 절이 없는 Chapter는 사이드바에 나오지 않는다. 지금 보는 절은 강조한다.
- 페이지 `<title>`은 `"<frontmatter title> — NABI 매뉴얼"`이다(레이아웃의 title template).
- `/docs/nabi`는 사이드바와 "왼쪽 목록에서 절을 고르세요" 한 줄만 둔다. 홈 도구 목록에 `NABI 매뉴얼` 카드를 더해 `/docs/nabi`로 잇는다(둘 다 사용자 결정).
- `public/docs/nabi/images/.gitkeep`으로 이미지 폴더를 만들었다.
- 확인용 샘플 `app/docs/nabi/setup/sample/page.mdx`(`order: 999`)를 두었다.

### 확인한 사실 (빌드 결과 `out/docs/nabi/setup/sample.html`)

- frontmatter가 `metadata`로 들어간다: `<title>샘플 페이지 — NABI 매뉴얼</title>`, `<meta name="description" content="…">`. `slug`·`chapter`·`order`는 HTML에 나오지 않는다.
- `rehype-slug` id: `1.1. 화면 구성` → `11-화면-구성`, `자막 편집 (CG)` → `자막-편집-cg`, `「Ctrl+N」 단축키` → `ctrln-단축키`, `교회DB 설정` → `교회db-설정`. H1에도 id가 붙는다(`샘플-페이지`). 조사 노트의 계산과 같다.
- 표는 `<table>`로, 인라인 코드는 `<code>`로, ```` ```text ```` 블록은 `<code class="language-text">`로 나온다. 이미지 `![…](/docs/nabi/images/setup-sample-01.png)`는 `<img src="/docs/nabi/images/setup-sample-01.png">`이고 파일이 없어도 빌드는 통과한다(깨진 이미지).
- **`<!-- … -->`는 MDX에서 빌드를 깨뜨린다.** `Unexpected character '!' … (note: to create a comment in MDX, use {/* text */})`. 확인 필요 표시는 `{/* 확인 필요: … */}`로 쓴다. 이 주석은 HTML에 남지 않는다.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`(vitest 포함)가 통과한다.

### 절별 변환이 알아야 할 것

- 파일은 `app/docs/nabi/<chapter>/<slug>/page.mdx` 하나다. 맨 앞 frontmatter 다섯 키가 모두 있어야 한다. 사이드바에 손댈 것은 없다.
- 빌드가 멈추는 경우(`pages.ts`, 테스트 `pages.test.ts`): frontmatter가 없거나 키가 비었을 때, `chapter`가 setup·cg·db 밖이거나 폴더와 다를 때, `slug`가 폴더 이름과 다를 때, `description`이 150자를 넘을 때, 한 Chapter 안에서 `order`가 겹칠 때.
- `export const metadata`를 손으로 쓰지 않는다. frontmatter가 이미 그 이름으로 export된다.
- 확인 필요 표시는 `{/* 확인 필요: … */}`다. 지도 Notes의 `<!-- … -->`는 쓸 수 없다.
- 본문의 `<`와 `{`는 MDX가 JSX로 읽는다. 원문에 그대로 나오면 `\<`, `\{`로 이스케이프하거나 인라인 코드에 넣는다.
- 마크다운만 쓰고 class를 달지 않는다. 스타일은 `mdx-components.tsx`가 맡는다.
- **첫 절 변환 티켓이 `app/docs/nabi/setup/sample/` 폴더를 지운다.**
- `next build`가 "multiple lockfiles" 경고를 내는데, worktree가 원래 저장소 안에 있어서 생기는 것이고 빌드에는 영향이 없다.
