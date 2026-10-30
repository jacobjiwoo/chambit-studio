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
- 주의·경고 문구는 `<Callout type="warning">`·`<Callout type="danger">`로 바꾼다(티켓 04).
- 탐색은 왼쪽 사이드바(Chapter → 절)만 둔다.

**변환 규칙(사용자 지시)** — 원문을 추가·삭제·요약·의역하지 않는다. 명백한 오탈자만 고치고 고친 곳을 기록한다. 읽기 어려운 곳은 추측하지 않고 `{/* 확인 필요: ... */}`를 남긴다(MDX는 `<!-- -->`를 못 쓴다. 사용자 지시의 `<!-- -->`를 이것으로 바꾼다). PDF 머리글·바닥글·쪽 번호는 지우고, 줄바꿈으로 끊긴 문장은 잇는다. 표는 마크다운 표로, 코드·명령어는 언어를 지정한 코드 블록으로 바꾼다(실측 결과 코드 블록 대상은 없고, 경로·파일명은 인라인 코드다).

**시범 변환이 정한 방식(티켓 07)** — 자세한 것과 실제 예는 [07 Answer](issues/07-setup-conversion.md)와 `app/docs/nabi/setup/*/page.mdx`다.

- 원문의 `.`·`·`·`-` 글머리표는 마크다운 목록 `- `로, 끝까지 차지 않고 끊긴 줄은 줄 끝 `\`(hard break)로 옮긴다. 목차에 없는 번호 소제목(`1. 송출 자막이 떨리는 경우`)과 원문이 굵게 쓴 `①.` 말머리는 굵은 글씨다.
- 이미지는 PDF 이미지 객체 하나에 자리표시자 하나다. 인라인 아이콘은 제목 안이어도 원문 자리에 둔다. URL은 명시 링크로 쓴다.
- 한 번 나온 철자 실수만 고친다. 두 번 똑같이 나오거나 이름일 수 있는 것은 확인 필요로 둔다. 띄어쓰기는 고치지 않는다.
- 변환 티켓마다 `## Answer`에 `### 확인 필요`, `### 이미지`(파일·PDF 쪽·`pdfimages` 번호·무엇), `### 고친 오탈자` 표 셋을 둔다.
- Chapter 첫 페이지 셋(`setup`, `cg`, `db`)은 07이 모두 만들었다. 절 티켓은 `<chapter>/<slug>/page.mdx`만 쓴다.

**참고할 skill** — 결정 티켓은 `grilling`과 `domain-modeling`을 쓴다.

## Decisions so far

- [Next.js 16에서 MDX 문서 기반을 세우는 방법](issues/01-mdx-foundation-research.md): `@next/mdx` + 루트 `mdx-components.tsx`, 플러그인은 문자열로(Turbopack). frontmatter는 `remark-mdx-frontmatter`로 `metadata`에, 표는 `remark-gfm`, 앵커는 `rehype-slug`(번호의 `.`는 빠진다). 사이드바는 레이아웃이 빌드 때 frontmatter를 읽는다. 이미지에 `next/image`를 쓰지 않는다(정적 export)
- [PDF 원문 실측](issues/02-pdf-survey.md): `pdftotext -layout` 추출로 변환할 수 있다(깨진 글자 없음). 표·인라인 아이콘·낱말 중간 줄바꿈만 페이지 이미지를 본다. Ch2 `3. 편집` 52쪽이 가장 크다. 주의 표현은 `※` + 굵은 글씨 10곳이고, 코드 블록 대상은 없다
- [페이지 목록과 slug](issues/03-page-list-and-slugs.md): 1단계 절 15개가 페이지 15개다(`setup/hd200-install`, `cg/editing`, `db/search` 등). `3. 편집`도 한 페이지이고 변환 티켓만 넷으로 나눈다. `title`은 번호를 빼고 H1은 번호까지 원문 그대로다. `slug`는 경로의 마지막 조각, `order`는 원문 번호다. 변환은 티켓 07–18이고 07(setup)이 시범이다
- [Callout 종류와 원문 표현](issues/04-callout-types.md): `type`은 `warning`(주의·경고 `※` 문단 9곳)과 `danger`(PDF 19 빨간 밑줄 한 곳) 둘이다. `※`와 문단 전체 굵게는 Callout이 대신하므로 지우고 낱말(`주의 :`)은 남긴다. 컴포넌트는 글자 라벨을 넣지 않는다. 용어 설명·문의 안내 `※`(PDF 26, 27), `관련 옵션`, `* ` 보충은 Callout이 아니다
- [문서 기반 세우기](issues/05-docs-foundation.md): `app/docs/nabi/<chapter>/<slug>/page.mdx`만 쓰면 사이드바·`<title>`·앵커가 따라온다. frontmatter·폴더가 어긋나거나 `order`가 겹치면 빌드가 멈춘다. MDX는 `<!-- -->`를 못 쓰므로 확인 필요 표시는 `{/* 확인 필요: … */}`다. 샘플 `setup/sample`은 첫 절 변환이 지운다
- [Callout 컴포넌트](issues/06-callout-component.md): `app/_components/callout.tsx`를 `mdx-components.tsx`에 등록했다. 루트 파일이 라우트 private folder를 import할 수 없어 `app/_components`에 둔다. 절 페이지는 import 없이 `<Callout type="warning">`·`"danger"`로 쓴다
- [setup 변환](issues/07-setup-conversion.md): Chapter 1 네 페이지와 첫 페이지(`/docs/nabi`, Chapter 첫 페이지 셋)를 옮겼다. 사이드바 Chapter 이름·순서는 Chapter 첫 페이지 frontmatter가 정하고, 절만 있고 Chapter 첫 페이지가 없으면 빌드가 멈춘다. 확인 필요·이미지·오탈자 목록은 티켓마다 Answer 표 셋에 모은다
- [cg/overview 변환](issues/08-cg-overview-conversion.md): `cg/overview`(PDF 30–35)를 옮겼다. Ch2는 쪽마다 머리글 로고가 이미지 객체(object ID 160)라 `pdfimages` 목록에서 빼고 센다. 줄바꿈으로 갈린 곳의 띄어쓰기를 알 수 없으면 확인 필요로 남긴다
- [cg/getting-started 변환](issues/09-cg-getting-started-conversion.md): Chapter 2 `2. 시작하기`를 한 페이지로 옮겼다. 07 방식에 새로 정한 것은 없다. 굵은 `[…]` 뒤에 한글이 붙어 `**`가 닫히지 않는 곳은 `<strong>`으로 쓴다. 확인 필요 0, 이미지 32(아이콘 5), 오탈자 4
- [cg/editing 변환 1](issues/10-cg-editing-1-conversion.md): `cg/editing` 페이지와 H1을 만들고 3.1–3.3(PDF 49–64)을 옮겼다. 이미지가 100개를 넘어 번호는 세 자리(`cg-editing-001.png`)다. 병합 머리글은 칸을 풀고, 대각선 머리글과 칸 안 줄바꿈은 `<br />`, 표 칸의 `{` `}` `<`는 `\`로 가린다
- [cg/editing 변환 2](issues/11-cg-editing-2-conversion.md): 3.4–3.5(PDF 65–77)를 이어 썼다. 행 병합 표는 열을 늘려 풀고, 확장자 패턴 `*.nba`는 기울임꼴이 되지 않게 `\*`로 가린다
- [cg/editing 변환 3](issues/12-cg-editing-3-conversion.md): 3.6(PDF 78–89)을 이어 썼다. 3.6.13 그림과 3.6.14가 PDF 89에 있어 3.6을 끝까지 옮겼고 13은 3.7부터다. 줄 첫머리 `* ` 보충은 `\*`, 이미지 alt 안의 `<`도 `\<`로 가린다
- [cg/editing 변환 4](issues/13-cg-editing-4-conversion.md): 3.7–3.8(PDF 89–100)을 이어 써서 `cg/editing`을 끝냈다(이미지 157개). `•` 글머리표도 목록으로, 밑줄 강조는 굵은 글씨로만 옮긴다. 옵션 이름 오타는 스크린샷 글자가 근거일 때만 고친다
- [cg/attributes 변환](issues/14-cg-attributes-conversion.md): `4. 속성편집(Attribute)`(PDF 101–121)를 한 페이지·한 티켓으로 옮겼다(이미지 88개). 5단계 소제목도 굵은 글씨 문단이고, Callout 아닌 원문 밑줄은 `<u>`로 남긴다. 그림 옆 설명 글은 그림 바로 뒤 보통 문단이다
- [cg/effects 변환](issues/15-cg-effects-conversion.md): `5. Effects`(PDF 122–131)를 옮겼다. 매 쪽 머리글 로고 이미지는 자리표시자를 두지 않는다. `•` 글머리표도 `- `다. 이미지 33개, 확인 필요 둘, 고친 오탈자 하나
- [cg/playout 변환](issues/16-cg-playout-conversion.md): `6. 송출`(PDF 132–135)을 옮겼다. 이미지 15개(인라인 아이콘 10개), 확인 필요 없음, 오탈자 하나(`이였다면`). `㉠.` 같은 번호 글자 항목은 목록이 아닌 `\` 문단이고, 쪽마다 있는 `NABI-CG` 머리글 이미지는 옮기지 않는다

## Not yet specified

없다.

## Out of scope

- 실제 이미지 추출·준비 — 사용자가 목록을 받아 따로 준비한다.
- 페이지 안 H2·H3 목차 — 써 보고 필요하면 새로 시작한다.
- `/docs/` 아래 다른 문서 — 이 지도는 NABI 매뉴얼만 다룬다.
