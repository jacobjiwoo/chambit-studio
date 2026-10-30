# 프로젝트 구조 규칙

사람이든 에이전트든 따른다. 근거는 Next.js 공식 문서 [Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure)이다. 문서는 정리 방식을 하나로 정하지 않고 "골라서 일관되게 쓰라"고 한다. 이 저장소는 **기능·라우트별로 나누기**를 고른다.

## 루트에는 아래만 둔다

`src/`는 쓰지 않는다. `app/`이 루트에 있다.

| 경로 | 무엇 | 커밋 |
| - | - | - |
| `app/` | App Router. 코드는 전부 여기 있다 | ✓ |
| `mdx-components.tsx` | MDX 전역 컴포넌트. `@next/mdx`가 루트에서만 찾는다([mdx-components.js](https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components)) | ✓ |
| `public/` | 정적 파일. `public/a/b.png`가 `/a/b.png`로 열린다([public Folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder)) | ✓ |
| `docs/` | 문서, ADR | ✓ |
| `.scratch/` | 조사·스펙·티켓 | ✓ |
| `.claude/` | [claude-directory.md](claude-directory.md)를 따른다 | ✓ |
| `fixtures/` | 테스트가 읽는 실제 원고 | gitignore |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | 의존성, 스크립트 | ✓ |
| `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` | 설정 | ✓ |
| `CLAUDE.md`, `README.md`, `.gitignore` | | ✓ |
| `next-env.d.ts`, `.env*` | | gitignore |

- `.next/`, `out/`, `node_modules/`처럼 도구가 만들고 gitignore한 것은 이 표 밖이다.

## `app/` 안에는 라우팅에 쓰이는 것과 private folder만 둔다

라우트 폴더 바로 아래에는 Next.js 특수 파일만 둔다. 그 밖의 코드는 private folder에 넣는다.

| 무엇 | 예 |
| - | - |
| 라우팅 파일 | `layout.tsx` `page.tsx` `page.mdx` `loading.tsx` `not-found.tsx` `error.tsx` `global-error.tsx` `route.ts` `template.tsx` `default.tsx` |
| metadata 파일 | `favicon.ico` `icon` `apple-icon` `opengraph-image` `twitter-image` `sitemap` `robots` |
| 라우트 폴더 | `subtitle-extractor/` `[slug]/` `(group)/` `@slot/` `(.)folder/` |
| private folder | `_components/` `_lib/` |
| 전역 스타일 | `app/globals.css`. 루트 `layout.tsx`가 import한다 |

## private folder는 `_components`와 `_lib` 둘뿐이다

- React를 import하면 `_components`다. 컴포넌트와 훅이 들어간다.
- React를 import하지 않으면 `_lib`다. 파싱, 변환, 도메인 규칙이 들어간다.
- `_hooks`, `_utils` 같은 다른 private folder는 만들지 않는다.

## 코드는 쓰는 라우트 안에 둔다

- 라우트 하나만 쓰는 코드는 그 라우트의 `_components`·`_lib`에 둔다.
- 두 번째 라우트가 쓰게 되는 순간 **가장 가까운 공통 조상**의 `_components`·`_lib`로 올린다. 독립된 도구끼리라면 `app/_components`·`app/_lib`다. 미리 올리지 않는다.
- 조상의 private folder는 import한다. 형제, 사촌, 자식 라우트의 private folder는 import하지 않는다.
- 라우트의 private folder는 상대 경로로 import한다. `@/` 별칭으로는 `app/_components`·`app/_lib`만 쓴다.

## 테스트는 대상 파일 옆에 둔다

`hwp.ts`의 테스트는 같은 폴더의 `hwp.test.ts`다. `__tests__/`나 `tests/`는 만들지 않는다.

## 파일과 폴더 이름은 kebab-case다

- `preview-modal.tsx`, `use-update-user.ts`처럼 쓴다. 코드 안의 이름은 JS 관례를 따른다(`PreviewModal`, `useUpdateUser`).
- 훅이라고 파일을 따로 나누지 않는다. 함께 쓰는 훅과 타입은 개념 이름의 파일 하나에 둔다.
- 라우트 폴더는 kebab-case에 App Router 문법(`[ ]`, `( )`, `_`, `@`)만 더한다.

## lint가 검사한다

`pnpm lint`가 import 방향과 `app/` 안의 이름을 검사한다(`eslint.config.mjs`). 루트 표와 라우트 폴더 바로 아래 파일은 검사하지 않으니 이 문서를 보고 지킨다.

## 표에 없는 것을 만들려면 문서부터 본다

위 문서를 열어 확인한다. Next.js 규약이면 표를 고치고 진행한다. E2E 테스트 디렉토리처럼 처음 생기는 것도 이 순서를 밟는다. 표와 문서가 어긋나면 문서가 맞다.
