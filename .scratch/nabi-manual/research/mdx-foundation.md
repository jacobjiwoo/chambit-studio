# Next.js 16에서 MDX 문서 기반을 세우는 방법

티켓: [01-mdx-foundation-research](../issues/01-mdx-foundation-research.md)

조사 날짜: 2026-10-30. 저장소 기준 버전은 `next` 16.2.12, `react` 19.2.4, Tailwind 4, `next.config.ts`의 `output: "export"`다. Next.js 문서는 `node_modules/next/dist/docs/`에 같이 들어 있는 16.2.12판을 1차 출처로 쓰고, 같은 내용의 웹 주소를 함께 적는다.

## 결론

- `@next/mdx` + `pageExtensions`에 `md`·`mdx` 추가 + 루트 `mdx-components.tsx`면 `app/docs/nabi/<chapter>/<절>/page.mdx`가 그대로 라우트가 된다.
- Next.js 16은 Turbopack이 기본 bundler다. remark·rehype 플러그인은 **문자열 이름**(옵션이 있으면 `['이름', {직렬화 가능한 옵션}]`)으로 넘긴다. 함수 값 옵션은 쓸 수 없다.
- frontmatter는 `remark-frontmatter` + `remark-mdx-frontmatter`(`name: 'metadata'`)로 YAML을 `export const metadata`로 바꾸는 길을 권한다. Next.js는 `title`·`description`만 쓰고 `slug`·`chapter`·`order`는 무시한다(소스 확인).
- 표는 `remark-gfm`, 앵커는 `rehype-slug`다. 한국어 제목은 한글을 그대로 남긴 id가 된다(예: `자막 편집 (CG)` → `자막-편집-cg`).
- 코드 블록은 플러그인 없이도 `<pre><code className="language-xxx">`로 렌더된다. 색이 필요하면 `rehype-pretty-code` + `shiki`를 빌드 때 돌린다. 기반 단계에서는 필수가 아니다.
- 사이드바는 빌드 때 서버 컴포넌트가 `fs`로 `page.mdx`의 frontmatter를 읽어 만든다. `output: "export"`에서도 서버 컴포넌트는 빌드 중에 돈다.
- 마크다운 이미지는 `public/docs/nabi/images/...` → `/docs/nabi/images/...`로 열린다. `img`를 `next/image`로 바꾸면 안 된다(정적 export에서 기본 loader 미지원).

## 1. `@next/mdx` 설정

### 설치

공식 가이드가 드는 패키지는 넷이다.

```bash
pnpm add @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

- 출처: [How to use markdown and MDX in Next.js](https://nextjs.org/docs/app/guides/mdx) (`node_modules/next/dist/docs/01-app/02-guides/mdx.md`)
- `@next/mdx`는 `next`와 같은 버전으로 나온다. `@next/mdx@16.2.12`가 npm에 있다(`npm view @next/mdx@16.2.12 version`). 조사 시점 최신은 16.4.3이다. `next`에 맞춰 16.2.12로 고정하는 편이 맞다.
- `@next/mdx`의 peerDependencies는 `@mdx-js/loader`, `@mdx-js/react` `>=0.15.0`이다. 조사 시점 `@mdx-js/loader` 최신은 3.1.1이다.

### `next.config.ts`

```ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      ["remark-mdx-frontmatter", { name: "metadata" }],
    ],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
```

- `pageExtensions`에 `md`·`mdx`를 넣어야 `.mdx` 파일이 page·route가 된다. 가이드 원문: "This allows `.mdx` files to act as pages, routes, or imports in your application." ([guide](https://nextjs.org/docs/app/guides/mdx#configure-nextconfigmjs), [pageExtensions](https://nextjs.org/docs/app/api-reference/config/next-config-js/pageExtensions))
- 기본으로는 `.mdx`만 컴파일한다(`extension` 기본값 `/\.mdx$/`, `@next/mdx` `index.js`). 이 작업은 `.mdx`만 쓰니 `extension`을 바꿀 필요가 없다. `pageExtensions`에서 `md`를 빼도 된다.
- remark·rehype 생태계가 ESM 전용이라 설정은 `next.config.mjs`나 `next.config.ts`여야 한다고 가이드가 적는다. 저장소는 이미 `.ts`다.

### 루트 `mdx-components.tsx`

App Router에서 `@next/mdx`를 쓰려면 **필수**다. 원문: "`mdx-components.tsx` is **required** to use `@next/mdx` with App Router and will not work without it." ([mdx-components.js](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components))

- 위치는 프로젝트 루트, `app/`과 같은 높이다(`src/`를 쓰면 그 안). 이 저장소는 `src/`가 없으니 `/mdx-components.tsx`다.
- `useMDXComponents`라는 함수 하나를 export해야 하고, 이 함수는 인자를 받지 않는다.
- 역할은 모든 MDX에 적용되는 전역 컴포넌트 매핑이다. `h1`, `img`, `table` 등 HTML 요소를 바꾸거나 `Callout` 같은 컴포넌트를 import 없이 쓰게 할 수 있다.
- `@next/mdx` 소스를 보면 webpack에서는 `next-mdx-import-source-file`을 `src/mdx-components` → `mdx-components` → `@mdx-js/react` 순서로 찾고, Turbopack에서는 `@vercel/turbopack-next/mdx-import-source`로 alias한다(`packages/next-mdx/index.js`, [GitHub](https://github.com/vercel/next.js/blob/canary/packages/next-mdx/index.js)).

**저장소 규칙과의 관계** — [project-structure.md](../../../.claude/rules/project-structure.md)의 루트 표에 `mdx-components.tsx`가 없다. 공식 문서가 루트 위치를 요구하므로 문서 기반 세우기에서 표에 더한다. `public/`도 마찬가지다([public Folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder)는 "a folder called `public` in the root directory"라고 한다). `page.mdx`는 라우팅 파일 `page`의 확장자 변형이라 라우트 폴더 바로 아래에 둔다.

### 공통 레이아웃

MDX 페이지도 App Router `layout.tsx`를 그대로 쓴다(가이드 "Shared layouts"). 사이드바와 본문 스타일은 `app/docs/nabi/layout.tsx`에 둔다. 본문 타이포그래피는 가이드가 `@tailwindcss/typography`의 `prose`를 예로 든다. Tailwind 4에서 쓸지는 문서 기반 티켓에서 정한다.

## 2. Turbopack과 플러그인 넘기기

- Next.js 16.0.0부터 Turbopack이 기본 bundler다. "Turbopack is now the **default bundler** in Next.js." ([Turbopack](https://nextjs.org/docs/app/api-reference/turbopack), Version History `v16.0.0`). 저장소 `dev`·`build` 스크립트에 `--webpack`이 없으니 Turbopack으로 돈다.
- 가이드 "Using Plugins with Turbopack": 플러그인 이름을 문자열로 준다. 옵션이 있으면 `['remark-toc', { heading: 'The Table' }]` 꼴이다. 원문: "remark and rehype plugins without serializable options cannot be used yet with Turbopack, because JavaScript functions can't be passed to Rust."
- 문자열은 `@next/mdx`의 `mdx-js-loader.js`가 `require.resolve(pluginPath, { paths: [projectRoot] })` 후 `import()`로 불러온다. 그래서 문자열로 넘기는 플러그인은 저장소 `package.json`에 직접 의존성으로 있어야 한다. 이 경로는 webpack에서도 똑같이 동작하므로 **언제나 문자열로 넘기면** bundler에 상관없이 한 설정으로 된다.
- `experimental.mdxRs`(Rust MDX 컴파일러)는 실험 기능이라 가이드가 프로덕션에 권하지 않는다. `rehype-pretty-code` 문서도 플러그인이 안 먹으면 `mdxRs`를 끄라고 한다. 켜지 않는다.

## 3. frontmatter

### 기본 동작

`@next/mdx`는 frontmatter를 지원하지 않는다. 원문: "`@next/mdx` does **not** support frontmatter by default". 가이드는 대안으로 `remark-frontmatter`, `remark-mdx-frontmatter`, `gray-matter`를 든다. 대신 MDX 안의 `export`는 쓸 수 있고, App Router의 MDX 페이지는 `metadata`도 쓸 수 있다고 한다("In App Router apps, that includes being able to use metadata"). ([guide#frontmatter](https://nextjs.org/docs/app/guides/mdx#frontmatter))

가이드의 frontmatter 단락을 그대로 두면 YAML 블록은 MDX 본문에 찍힌다(CommonMark에서 첫 `---`는 thematic break이고, 닫는 `---`는 바로 위 줄을 setext H2 제목으로 만든다). 그래서 YAML을 쓸 거면 플러그인이 꼭 있어야 한다.

### 길 A — YAML frontmatter를 `metadata` export로 바꾼다 (권장)

[`remark-mdx-frontmatter`](https://github.com/remcohaszing/remark-mdx-frontmatter) 6.0.0:

- `remark-frontmatter`가 만든 `yaml`·`toml` 노드에 기대므로 둘을 함께 설치하고 `remark-frontmatter`를 먼저 둔다. README의 설치: `npm install remark-frontmatter remark-mdx-frontmatter`.
- frontmatter를 `export const frontmatter = {...}`로 바꾼다. 옵션 `name`으로 변수 이름을 바꾼다(기본 `frontmatter`). 그 밖의 옵션은 `default`, `parsers`, 그리고 `unist-util-mdx-define` 옵션(`export`, `conflict` — 기본 `'throw'`)이다.
- 선언은 모듈 맨 앞에 붙는다. [`unist-util-mdx-define`](https://github.com/remcohaszing/unist-util-mdx-define) README: "it prepends the variable declarations to the root".
- 옵션이 문자열·객체뿐이라 Turbopack 제약에 걸리지 않는다.
- Node.js 22 이상과 호환한다고 README가 적는다. 로컬은 v26.9.0이다. Cloudflare Pages 빌드 이미지의 Node 버전은 배포 쪽에서 확인한다.

`name: 'metadata'`로 두면 이 페이지가

```mdx
---
title: 화면 구성
description: ...
slug: screen
chapter: setup
order: 1
---

# 1. 화면 구성
```

`export const metadata = { title, description, slug, chapter, order }`가 된다. Next.js는 이 객체를 Metadata로 읽는데, `next/dist/lib/metadata/resolve-metadata.js`의 `mergeMetadata`는 `for (const key_ in metadata) switch (key)`로 아는 키만 처리하고 `default:` 가지에서 아무것도 하지 않는다. 그래서 `title`·`description`만 `<title>`·`<meta name="description">`에 쓰이고 `slug`·`chapter`·`order`는 무시된다(16.2.12 소스로 확인. 공식 문서에 적힌 보장은 아니므로 문서 기반 티켓에서 빌드 결과 HTML로 한 번 확인한다).

주의: 같은 파일에 `export const metadata`를 손으로 또 쓰면 `conflict: 'throw'` 때문에 빌드가 실패한다. 손으로 쓸 일이 없게 규칙으로 막는다.

변형: 기본 이름 `frontmatter`를 그대로 두고 페이지마다 `export const metadata = { title: frontmatter.title, description: frontmatter.description }`를 한 줄 쓰는 길도 있다. 선언이 앞에 붙으니 참조는 된다. 다만 절 페이지마다 같은 줄이 늘고, 변환 티켓이 원문 외 줄을 더 관리해야 한다.

### 길 B — frontmatter 없이 `export const metadata`만 쓴다

플러그인이 필요 없고 가이드 기본 경로 그대로다. `export const metadata = { title, description }` 아래에 `slug`·`chapter`·`order`를 함께 두거나 별도 export로 둔다. 단점은 지도에서 확정한 "frontmatter는 `title`, `description`, `slug`, `chapter`, `order`"와 형식이 다르고, 사이드바가 파일을 읽을 때 JS 객체 리터럴을 파싱해야 한다는 점이다(YAML보다 다루기 어렵다).

→ 지도의 결정(YAML frontmatter)을 지키면서 Next.js `metadata`와 사이드바 둘 다에 쓸 수 있는 길 A를 권한다.

## 4. 표 — `remark-gfm`

- 가이드가 GFM 예로 직접 드는 플러그인이다: "you can use `remark-gfm` to support GitHub Flavored Markdown." 조사 시점 버전 4.0.1.
- 마크다운 표 외에 취소선, 각주, 작업 목록, 자동 링크도 켜진다.
- 문자열 `'remark-gfm'`으로 넘긴다.

## 5. 제목 앵커 — `rehype-slug`

- [`rehype-slug`](https://github.com/rehypejs/rehype-slug) 6.0.0은 `id`가 없는 `h1`–`h6`에 텍스트로 만든 `id`를 단다. 알고리즘은 [`github-slugger`](https://github.com/Flet/github-slugger) 2.0.0이다("which matches how GitHub works"). 옵션은 `prefix`(기본 `''`) 하나다.
- `github-slugger`의 `slug()`는 소문자로 바꾸고, 생성된 정규식 `regex`(유니코드 문자·숫자·`-`·`_` 밖의 문자)를 지운 뒤 공백 하나를 `-` 하나로 바꾼다. 한글 음절(U+AC00–D7A3)은 지우는 대상이 아니라 남는다. 같은 slug가 또 나오면 `-1`, `-2`를 붙인다.
- 패키지에 들어 있는 정규식을 그대로 옮겨 계산한 결과:

| 제목 | id |
| - | - |
| `1.1. 화면 구성` | `11-화면-구성` |
| `자막 편집 (CG)` | `자막-편집-cg` |
| `「Ctrl+N」 단축키` | `ctrln-단축키` |
| `교회DB 설정` | `교회db-설정` |
| `3.1.1 송출 · 미리보기` | `311-송출--미리보기` |

- 번호의 `.`가 빠져 `11-`, `311-`처럼 붙는다. 낫표·`+`·`·`도 빠지고, `·` 양옆 공백이 남아 `--`가 생긴다. 지도는 H2·H3에 번호를 붙일지 정하지 않았으니, 번호를 제목에 넣으면 id가 이렇게 된다는 점을 `페이지 목록과 slug` 티켓에서 알고 정한다.
- URL에서는 `#자막-편집-cg`가 퍼센트 인코딩되지만 브라우저 주소창은 한글로 보여 준다.
- H1에도 id가 붙는다. 막을 필요는 없다.

## 6. 코드 블록

- 플러그인이 없어도 언어 지정은 살아 있다. ```` ```js ```` 블록은 `mdast-util-to-hast`가 `<pre><code className="language-js">`로 바꾼다([mdast-util-to-hast](https://github.com/syntax-tree/mdast-util-to-hast)). 색은 없다.
- 하이라이트가 필요하면 Next.js 가이드가 링크하는 [`rehype-pretty-code`](https://rehype-pretty.pages.dev/)(조사 시점 0.14.5, peer `shiki` `^1 || ^2 || ^3 || ^4`, `shiki` 최신 4.5.0)를 쓴다. Shiki로 빌드 때 칠한다("on the server at build-time"). 옵션 `theme`(기본 `github-dark-dimmed`, `{ dark, light }` 가능), `keepBackground`, `defaultLang`은 문자열·객체라 Turbopack에서 `['rehype-pretty-code', { theme: ... }]`로 넘길 수 있다. 함수 값 옵션(`onVisitLine` 등 콜백)은 못 쓴다.
- NABI 원문의 코드는 단축키·명령 위주라 분량이 적을 가능성이 높다. 기반 단계에서는 `language-*` 클래스만 두고, 하이라이트는 필요할 때 더한다.

## 7. 사이드바 목록

두 길이 있다.

1. **빌드 때 파일을 읽는다 (권장)** — `app/docs/nabi/layout.tsx`(서버 컴포넌트)가 `_lib`의 함수를 불러 `app/docs/nabi/**/page.mdx`를 `fs`로 찾고, 맨 앞 YAML 블록을 `yaml` 패키지로 읽어 `chapter`→`order`로 정렬한다.
   - 가이드: "You can use packages like Node's `fs` module or globby to read a directory of posts and extract the metadata." 그리고 "Using `fs`, `globby`, etc. can only be used server-side."
   - `output: "export"`에서도 된다: "Server Components consumed inside the `app` directory will run during the build, similar to traditional static-site generation." ([Static Exports](https://nextjs.org/docs/app/guides/static-exports#server-components))
   - `yaml`은 `remark-mdx-frontmatter`의 의존성이지만, 직접 import하려면 `package.json`에 직접 넣는다(pnpm은 전이 의존성을 끌어오지 않는다).
   - 장점: 페이지가 늘어도 목록이 어긋나지 않는다. 페이지 frontmatter가 하나뿐인 원천이 된다.
2. **목록을 손으로 둔다** — `_lib`에 `{ chapter, slug, title, order }` 배열을 둔다. 단순하지만 페이지마다 frontmatter와 목록 두 곳을 고쳐야 한다.

참고: `import(\`./${x}/page.mdx\`)`로 각 페이지의 `metadata` export를 불러오는 방법도 가이드의 "Using dynamic imports"에 있지만, 페이지 파일 목록은 여전히 따로 있어야 하므로 1번보다 낫지 않다.

Chapter 이름(`Setting & Control` 등)은 페이지 frontmatter에 없으니 `chapter` 키 → 표시 이름 표 하나는 `_lib`에 둔다.

## 8. 이미지

- `public/` 안의 파일은 `/`부터 그대로 열린다: "the file `public/avatars/me.png` can be viewed by visiting the `/avatars/me.png` path." ([public Folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder)) 따라서 `public/docs/nabi/images/setup-01-01.png`는 `/docs/nabi/images/setup-01-01.png`다. `![...](/docs/nabi/images/...)`는 MDX에서 `<img src="/docs/nabi/images/...">`가 된다.
- 파일이 없으면 브라우저가 깨진 이미지로 보인다. 빌드는 실패하지 않는다(마크다운 이미지는 import가 아니라 URL이기 때문).
- `mdx-components.tsx`에서 `img`를 `next/image`로 바꾸는 가이드 예시는 이 저장소에 맞지 않는다. 정적 export는 "Image Optimization with the default `loader`"를 지원하지 않는다([Static Exports — Unsupported Features](https://nextjs.org/docs/app/guides/static-exports#unsupported-features)). 또 `next/image`는 `width`·`height`가 필요하다. 기본 `<img>`를 두고, 꾸밀 필요가 있으면 `img`를 일반 `<img>` 래퍼로 바꾼다.
- 라우트 `/docs/nabi/...`와 정적 파일 `/docs/nabi/images/...`가 같은 접두어를 쓴다. `images`라는 라우트 폴더를 만들지 않는 한 겹치지 않는다. `페이지 목록과 slug` 티켓에서 절 slug에 `images`를 쓰지 않는다.

## 문서 기반 세우기에 넘기는 체크리스트

- [ ] `pnpm add @next/mdx@16.2.12 @mdx-js/loader @mdx-js/react @types/mdx remark-gfm remark-frontmatter remark-mdx-frontmatter rehype-slug yaml`
- [ ] `next.config.ts`에 `pageExtensions`와 `createMDX`(플러그인은 문자열)
- [ ] 루트 `mdx-components.tsx` (`useMDXComponents`, `Callout` 등록, `img`는 `next/image`로 바꾸지 않음)
- [ ] project-structure.md 루트 표에 `mdx-components.tsx`, `public/` 추가
- [ ] `app/docs/nabi/layout.tsx` + `_lib`의 frontmatter 읽기·정렬 + `_components`의 사이드바
- [ ] 빌드 결과 HTML에서 `<title>`·`description`과 한국어 `id` 확인

## 출처

- Next.js 16.2.12 문서(로컬 `node_modules/next/dist/docs/`)
  - [How to use markdown and MDX in Next.js](https://nextjs.org/docs/app/guides/mdx)
  - [mdx-components.js](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components)
  - [pageExtensions](https://nextjs.org/docs/app/api-reference/config/next-config-js/pageExtensions)
  - [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)
  - [Static Exports](https://nextjs.org/docs/app/guides/static-exports)
  - [public Folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder)
- Next.js 소스
  - [`packages/next-mdx/index.js`, `mdx-js-loader.js`](https://github.com/vercel/next.js/tree/canary/packages/next-mdx) (npm `@next/mdx@16.4.3` tarball로 확인)
  - `next/dist/lib/metadata/resolve-metadata.js`의 `mergeMetadata` (16.2.12 설치본)
- [remark-mdx-frontmatter](https://github.com/remcohaszing/remark-mdx-frontmatter) 6.0.0 README
- [unist-util-mdx-define](https://github.com/remcohaszing/unist-util-mdx-define) README
- [remark-gfm](https://github.com/remarkjs/remark-gfm) 4.0.1
- [rehype-slug](https://github.com/rehypejs/rehype-slug) 6.0.0 README, [github-slugger](https://github.com/Flet/github-slugger) 2.0.0 `index.js`·`regex.js` (npm tarball)
- [mdast-util-to-hast](https://github.com/syntax-tree/mdast-util-to-hast) README
- [rehype-pretty-code](https://rehype-pretty.pages.dev/) 문서
