# Next.js 16에서 MDX 문서 기반을 세우는 방법

Type: research
Status: resolved

## Question

이 저장소(Next.js 16.2, App Router, Turbopack, Tailwind 4)에 MDX 문서 페이지를 들이는 공식 방법을 확인한다. `문서 기반 세우기`가 이 답을 그대로 따른다.

확인할 것:

- `@next/mdx`로 `app/**/page.mdx`를 라우트로 쓰는 설정. `next.config.ts`의 `pageExtensions`, 루트 `mdx-components.tsx`의 위치와 역할
- Turbopack에서 remark·rehype 플러그인을 넘기는 방식(플러그인을 문자열 이름으로 넘겨야 하는지 등)
- **frontmatter** — `@next/mdx`는 기본으로 frontmatter를 읽지 않는다고 알려져 있다. `title`, `description`, `slug`, `chapter`, `order`를 YAML frontmatter로 쓰면서 페이지 `metadata`와 사이드바 목록에 쓰려면 무엇이 필요한가. `export const metadata`로 대신하는 길과 비교한다
- 마크다운 표(GFM)를 쓰기 위한 `remark-gfm`
- 제목 앵커 `rehype-slug`가 한국어 제목에서 만드는 id
- 코드 블록 언어 지정이 그대로 렌더되는지, 하이라이트가 필요하면 무엇을 쓰는가
- 사이드바가 `app/docs/nabi/` 아래 페이지 목록을 만드는 방법(빌드 때 파일을 읽는가, 목록을 손으로 두는가)
- 마크다운 이미지 `![...](/docs/nabi/images/...)`가 `public/`에서 어떻게 열리는가

출처는 Next.js 공식 문서와 각 패키지 저장소를 우선한다. 결과는 `.scratch/nabi-manual/research/mdx-foundation.md`에 쓴다.

## Answer

`@next/mdx@16.2.12` + `pageExtensions`에 `mdx` + 루트 `mdx-components.tsx`(필수)면 `app/docs/nabi/<chapter>/<절>/page.mdx`가 라우트가 된다. Next.js 16은 Turbopack이 기본이라 플러그인은 문자열 이름(옵션은 직렬화 가능한 것만)으로 넘긴다. frontmatter는 `remark-frontmatter` + `remark-mdx-frontmatter`(`name: 'metadata'`)로 YAML을 `export const metadata`로 바꾼다. Next.js는 `title`·`description`만 쓰고 나머지 키는 무시한다. 표는 `remark-gfm`, 앵커는 `rehype-slug`(한글은 남는다: `자막 편집 (CG)` → `자막-편집-cg`, 번호의 `.`는 빠진다). 코드 블록은 플러그인 없이 `language-*` 클래스로 렌더되고, 하이라이트는 필요하면 `rehype-pretty-code` + `shiki`다. 사이드바는 레이아웃 서버 컴포넌트가 빌드 때 `fs`로 frontmatter를 읽어 만든다. 이미지는 `public/docs/nabi/images/` → `/docs/nabi/images/`이며 `next/image`로 바꾸지 않는다(정적 export 미지원).

자세한 내용: [mdx-foundation.md](../research/mdx-foundation.md)
