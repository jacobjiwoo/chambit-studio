# db 변환

Type: task
Status: resolved
Blocked by: 05, 06, 07

## Question

Chapter 3 `교회DB` 전체(PDF 143–153)를 옮긴다. `/docs/nabi/db` Chapter 첫 페이지(표지 PDF 141)는 07이 이미 만들었다.

- `getting-started`(PDF 143), `search`(144–146), `templates`(147–150), `options`(151–153) 네 페이지를 옮긴다

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- 절 페이지 넷: `db/getting-started`, `db/search`, `db/templates`, `db/options`. Chapter 첫 페이지 `db/page.mdx`는 07이 만든 그대로다.
- 개발 서버에서 네 페이지가 렌더되고 사이드바 `교회DB Version 4.0` 아래에 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다.
- 원문 추출본과 MDX를 공백·서식 기호를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 여섯 곳과 3.2.3 병합 셀 풀이뿐인 것을 확인했다.

### 07 방식에 더한 것

07이 다루지 않은 원문 서식이 Chapter 3에 있어서 이렇게 옮겼다.

- **쪽에 걸친 표** — 2.1 성경 축약어 표(PDF 144–145)는 한 표로 잇는다. 신약 칸이 빈 `호세아`–`말라기` 행은 빈 칸으로 둔다. 원문이 굵게 쓴 축약어 열은 굵은 글씨다.
- **행 병합** — 3.2.3 교독문 표의 `함께 읽는 교독문`은 `다같이:`·`다함께:` 두 행에 걸친 병합 칸이다. 마크다운 표에는 병합이 없어 두 행에 같은 글을 둔다.
- **`*.nbi`와 `/*`** — `*.nbi`는 파일 이름 규칙대로 인라인 코드다(`*`가 기울임으로 읽히는 것도 막는다). DB 구분 기호 `/*`도 인라인 코드다.
- **`<Left>`** — 4.4.1 목록의 `<Left>`는 `\<Left>`로 이스케이프한다.
- **밑줄** — PDF 152 "정렬선이란?" 문단의 밑줄 친 `녹색 라인`은 `<u>`로 둔다. 마크다운에 밑줄이 없고, 04가 정한 Callout 대상(빨간 굵은 밑줄 경고)과 다른 낱말 강조다.
- **그림 아래 대괄호 문구** — PDF 153의 `[Word Wrap미사용]`, `[Word Wrap사용]`은 각 그림 바로 아래 문단으로 둔다.
- **`1단계 Template 선택`** 같은 굵은 단계 이름은 07의 번호 소제목처럼 굵은 글씨 문단이다. `정렬선이란?`도 같다.

### 확인 필요

| 페이지 | PDF | 내용 |
| - | - | - |
| `templates` 3.1.6 | 148 | "기본 폴더로 (`C:\Compix\ChurchDB\Template`)로"에 `로`가 두 번 나온다. 철자 실수가 아니라 원문대로 뒀다 |

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 143 -l 153`의 `num` 열이다. 쪽마다 나오는 머리글 `교회DB` 이미지(객체 852)는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `db-getting-started-01.png` | 143 | 1 | 교회DB 아이콘(1.1 제목 안) |
| `db-getting-started-02.png` | 143 | 2 | 교회DB 아이콘(1.1 본문 안) |
| `db-getting-started-03.png` | 143 | 3 | 교회DB 검색 창과 Select·Search·Enter 순서 표시 |
| `db-search-01.png` | 145 | 6 | 찬송가 탭 제목 검색 결과 |
| `db-search-02.png` | 146 | 8 | DB 편집 상태의 검색 결과 수정 화면 |
| `db-templates-01.png` | 147 | 10 | Template Catalog 창과 ①–③ 표시 |
| `db-templates-02.png` | 148 | 12 | 편집 메뉴의 템플릿 썸네일 새로만들기 |
| `db-templates-03.png` | 149 | 14 | 객체 오른쪽 메뉴의 Alias 지정 |
| `db-templates-04.png` | 149 | 15 | Enter Alias 창 |
| `db-templates-05.png` | 149 | 16 | 성경 DB 텍스트의 제목줄·내용 표시 예 |
| `db-options-01.png` | 151 | 19 | 옵션 영역 |
| `db-options-02.png` | 151 | 20 | 가로정렬 목록 |
| `db-options-03.png` | 152 | 22 | 작업창의 녹색 정렬선 영역 |
| `db-options-04.png` | 152 | 23 | 성경 검색 결과의 Line 1, Line2 표시 |
| `db-options-05.png` | 152 | 24 | Lines 2로 둔 옵션 영역 |
| `db-options-06.png` | 153 | 26 | Word Wrap 미사용 송출 화면 |
| `db-options-07.png` | 153 | 27 | Word Wrap 사용 송출 화면 |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `search` 2.1 | 144 | `누가목음` | `누가복음` |
| `search` 2.1 | 144 | `에배소서` | `에베소서` |
| `templates` 3.1.3 | 148 | `무조건 썸내일을` | `무조건 썸네일을` |
| `templates` 3.1.7 | 148 | `‘템플릿 삭제‘버튼` | 닫는 따옴표 `’` |
| `templates` 3.2 | 148 | `‘Alias지정‘을` | 닫는 따옴표 `’` |
| `options` 4.4.1 | 151 | `템플릿 차제의` | `템플릿 자체의` |
