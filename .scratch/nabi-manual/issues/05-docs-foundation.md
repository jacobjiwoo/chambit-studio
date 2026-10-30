# 문서 기반 세우기

Type: task
Status: open
Blocked by: 01

## Question

절별 변환이 MDX 파일만 쓰면 되도록 `/docs/nabi` 기반을 세운다. 하는 일이지만, 이것 없이는 첫 변환 티켓의 결과를 사이트에서 확인할 수 없다. `Callout`은 `Callout 컴포넌트`가 따로 맡는다.

- `Next.js 16에서 MDX 문서 기반을 세우는 방법`의 답대로 MDX 설정, `mdx-components.tsx`, frontmatter, `remark-gfm`, `rehype-slug`를 들인다
- `/docs/nabi` 레이아웃과 사이드바(Chapter → 절)를 만든다. 사이드바는 frontmatter를 읽으므로 페이지 목록이 정해지기 전에 만들 수 있다
- 루트 표에 없는 것(`mdx-components.tsx`, `public/`)은 Next.js 문서를 확인하고 [project-structure.md](../../../.claude/rules/project-structure.md)를 먼저 고친다
- 홈(`app/page.tsx`) 도구 목록에 문서 링크를 둘지 정한다
- 샘플 페이지로 표·인라인 코드·이미지 자리표시자·앵커가 렌더되는지 확인하고, 빌드한 HTML에서 frontmatter가 `metadata`로 들어가는지와 한국어 앵커 id를 실제로 확인한다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과해야 끝난다
