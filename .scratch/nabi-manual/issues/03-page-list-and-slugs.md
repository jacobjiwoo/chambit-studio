# 페이지 목록과 slug

Type: grilling
Status: resolved
Blocked by: 02

## Question

1단계 절마다 페이지 하나를 둔다는 원칙 아래, 실제 페이지 목록과 영어 slug를 확정한다.

- 각 절의 slug(예: Chapter 2 `4. 속성편집(Attribute)` → `/docs/nabi/cg/attributes`). Chapter 2와 3에 똑같이 `시작하기`가 있지만 Chapter 경로가 달라 겹치지 않는다
- 원문 분량이 한 세션을 넘는 절(Chapter 2 `3. 편집`은 50쪽이 넘는다)을 나눌지, 나눈다면 어디서 끊고 제목 계층을 어떻게 맞출지
- 각 Chapter의 첫 페이지(`/docs/nabi/cg`)와 매뉴얼 첫 페이지(`/docs/nabi`)에 무엇을 둘지(표지의 버전 정보, 목차)
- `order` 값을 매기는 방식

## Answer

**페이지와 slug** — 1단계 절 15개가 페이지 15개다. slug는 짧은 영어 명사구이고 Chapter 안에서만 겹치지 않으면 된다. 쪽 수는 [pdf-survey.md](../research/pdf-survey.md) 4절의 PDF 쪽 수다.

| Ch | 절 | PDF 쪽 | 경로 |
| - | - | - | - |
| setup | 1. 천하통일 HD200/200K 설치하기 | 14 | `/docs/nabi/setup/hd200-install` |
| setup | 2. 문자발생기 보드 장착 | 15–17 | `/docs/nabi/setup/cg-board` |
| setup | 3. 프로그램 설치하기 | 18–25 | `/docs/nabi/setup/software-install` |
| setup | 4. 이상증상 대처법 | 25–27 | `/docs/nabi/setup/troubleshooting` |
| cg | 1. NABI-CG이해하기 | 30–35 | `/docs/nabi/cg/overview` |
| cg | 2. 시작하기 | 36–48 | `/docs/nabi/cg/getting-started` |
| cg | 3. 편집 | 49–100 | `/docs/nabi/cg/editing` |
| cg | 4. 속성편집(Attribute) | 101–121 | `/docs/nabi/cg/attributes` |
| cg | 5. Effects | 122–131 | `/docs/nabi/cg/effects` |
| cg | 6. 송출 | 132–135 | `/docs/nabi/cg/playout` |
| cg | 7. 단축키 | 136–140 | `/docs/nabi/cg/shortcuts` |
| db | 1. 시작하기 | 143 | `/docs/nabi/db/getting-started` |
| db | 2. DB검색 | 144–146 | `/docs/nabi/db/search` |
| db | 3. Template 선택 | 147–150 | `/docs/nabi/db/templates` |
| db | 4. 옵션 | 151–153 | `/docs/nabi/db/options` |

`송출`은 방송 업계 용어인 `playout`으로 옮긴다. Ch1 `1.`은 1쪽뿐이지만 원칙대로 페이지 하나다.

**`3. 편집`은 나누지 않는다** — 52쪽이지만 페이지는 `/docs/nabi/cg/editing` 하나로 두고, 변환 티켓만 2단계 절로 묶어 넷으로 나눈다(3.1–3.3, 3.4–3.5, 3.6, 3.7–3.8). 경로·제목 계층·사이드바에 예외를 만들지 않기 위해서다. 페이지가 읽기 어려울 만큼 길면 Out of scope의 페이지 안 목차를 새로 시작한다.

**첫 페이지** — 원문 목차(PDF 2–11)는 옮기지 않는다. 사이드바가 같은 일을 한다.

- `/docs/nabi`: 매뉴얼 이름, 원문 날짜(2024-05-07), Chapter 세 개의 링크와 각 Chapter 표지 제목(버전 포함), Compix 허락 사실 한 줄
- `/docs/nabi/<chapter>`: Chapter 표지 제목이 H1이다(예: `Chapter2. NABI-CG (Version 2.5)`). 그 아래 절 목록 링크를 둔다

두 페이지의 목록은 손으로 쓰지 않고 사이드바와 같은 frontmatter에서 만든다.

**frontmatter**

- `title`은 번호를 뺀 원문 제목이다(`편집`). H1과 H2·H3은 번호까지 원문 그대로 둔다(`# 3. 편집`, `## 3.1. 객체 입력`).
- `slug`는 경로의 마지막 조각이고 폴더 이름과 같다(`editing`). Chapter 첫 페이지는 `slug: cg`, `chapter: cg`이고, `/docs/nabi`는 `slug: nabi`에 `chapter`가 없다.
- `order`는 원문 1단계 번호다(`editing`은 3). Chapter 순서(setup 1, cg 2, db 3)는 Chapter 첫 페이지의 `order`다.

**변환 티켓** — 한 세션에 PDF 20쪽 안쪽을 기준으로 07–18 열두 개로 묶는다. Ch1과 Ch3은 Chapter 하나에 티켓 하나다. 모두 `05 문서 기반 세우기`와 `06 Callout 컴포넌트`에 막힌다. 07(setup)이 시범 티켓이다. `※` 문단 다섯 곳이 여기 있어서, 확인 필요·이미지 목록을 모으는 방식과 오탈자 기록 위치를 07이 정한다. 08–18은 07에 막힌다. `editing` 넷은 같은 파일에 이어 쓰므로 10 → 11 → 12 → 13 순서로 막는다. Chapter 첫 페이지는 그 Chapter의 첫 변환 티켓이 만든다.
