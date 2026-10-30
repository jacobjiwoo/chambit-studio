# NABI 매뉴얼 웹 문서

Label: `wayfinder:map`

## Destination

Compix **NABI User Manual**(PDF 153쪽, `/Users/jiwoo/Downloads/NABI_2.5_docs.pdf`)이 방송부 내부 사이트의 `/docs/nabi/<chapter>/<절>` 아래 MDX 페이지로 **원문 그대로** 옮겨져 있다. 사이드바로 오갈 수 있고, 페이지마다 '확인 필요' 목록과 따로 준비할 이미지 목록이 모여 있다.

## Notes

**이 지도는 실행까지 한다.** wayfinder 기본은 결정만 내리지만, 이 작업은 결정이 적고 변환 분량이 많다. 문서 기반 세우기와 절별 변환을 `task` 티켓으로 지도 안에서 처리한다. 한 세션에 티켓 하나다.

**허락** — Compix 지원팀이 2026-10-29 메일로 웹 문서 변환과 온라인 배포를 조건 없이 허락했다. 사이트는 방송부 내부용이다.

**원문** — Hancom PDF로 만든 A4 문서다(2024-05-07). 표지·목차 뒤에 Chapter 셋이 이어지고, 쪽 번호는 Chapter마다 1부터 다시 시작한다. 목차는 최대 6단계(`3.1.1.1.1.`)까지 내려간다. 단축키는 `「Ctrl+N」`처럼 낫표로 적는다.

| Chapter | 원문 제목 | 경로 |
| - | - | - |
| 1 | Setting & Control | `/docs/nabi/setup/...` |
| 2 | NABI-CG | `/docs/nabi/cg/...` |
| 3 | 교회DB | `/docs/nabi/db/...` |

**차팅 단계에서 확정된 것**

- 경로는 문서 구조를 따라 중첩한다: `/docs/nabi/<chapter>/<절>`. 파일은 `app/docs/nabi/<chapter>/<절>/page.mdx`다. 다른 문서도 나중에 `/docs/` 아래 들어올 수 있다. 버전은 경로에 넣지 않고 frontmatter와 첫 페이지에 적는다.
- 페이지 하나 = 1단계 절이다. 그 절이 H1, 2단계가 H2, 3단계가 H3이다. 4단계부터는 굵은 글씨 소제목으로 내린다.
- H2·H3에는 제목에서 자동으로 만든 앵커(`rehype-slug`)를 단다. 한국어 앵커를 허용한다.
- frontmatter는 `title`, `description`(150자 이내), `slug`, `chapter`, `order`다.
- 이미지 자리표시자는 `public/docs/nabi/images/<chapter>-<절>-NN.png`를 가리킨다. 실제 파일이 들어오기 전까지는 깨진 이미지로 둔다. `public/`은 [project-structure.md](../../.claude/rules/project-structure.md) 표에 없으므로 Next.js 문서를 확인하고 표를 고친 뒤 만든다.
- 주의·경고 문구는 `<Callout type="warning">` 같은 컴포넌트로 바꾼다.
- 탐색은 왼쪽 사이드바(Chapter → 절)만 둔다.

**변환 규칙(사용자 지시)** — 원문을 추가·삭제·요약·의역하지 않는다. 명백한 오탈자만 고치고 고친 곳을 기록한다. 읽기 어려운 곳은 추측하지 않고 `<!-- 확인 필요: ... -->`를 남긴다. PDF 머리글·바닥글·쪽 번호는 지우고, 줄바꿈으로 끊긴 문장은 잇는다. 표는 마크다운 표로, 코드·명령어는 언어를 지정한 코드 블록으로 바꾼다.

**참고할 skill** — 결정 티켓은 `grilling`과 `domain-modeling`을 쓴다.

## Decisions so far

- [Next.js 16에서 MDX 문서 기반을 세우는 방법](issues/01-mdx-foundation-research.md): `@next/mdx` + 루트 `mdx-components.tsx`, 플러그인은 문자열로(Turbopack). frontmatter는 `remark-mdx-frontmatter`로 `metadata`에, 표는 `remark-gfm`, 앵커는 `rehype-slug`(번호의 `.`는 빠진다). 사이드바는 레이아웃이 빌드 때 frontmatter를 읽는다. 이미지에 `next/image`를 쓰지 않는다(정적 export)
- [PDF 원문 실측](issues/02-pdf-survey.md): `pdftotext -layout` 추출로 변환할 수 있다(깨진 글자 없음). 표·인라인 아이콘·낱말 중간 줄바꿈만 페이지 이미지를 본다. Ch2 `3. 편집` 52쪽이 가장 크다. 주의 표현은 `※` + 굵은 글씨 10곳이고, 코드 블록 대상은 없다

## Not yet specified

- **절별 변환 티켓** — `페이지 목록과 slug`가 페이지 단위를 정하고 `문서 기반 세우기`가 끝나면 페이지마다 `task` 티켓 하나로 졸업한다. Chapter 2 `3. 편집`은 원문 50쪽이 넘어 한 세션에 안 들어갈 수 있다.
- **확인 필요·이미지 목록을 모으는 방식** — 절 티켓마다 `## Answer`에 남길지, 한 파일로 모을지. 첫 변환 티켓을 해 보고 정한다.
- **오탈자 수정 기록을 어디에 둘지** — 위와 같다.

## Out of scope

- 실제 이미지 추출·준비 — 사용자가 목록을 받아 따로 준비한다.
- 페이지 안 H2·H3 목차 — 써 보고 필요하면 새로 시작한다.
- `/docs/` 아래 다른 문서 — 이 지도는 NABI 매뉴얼만 다룬다.
