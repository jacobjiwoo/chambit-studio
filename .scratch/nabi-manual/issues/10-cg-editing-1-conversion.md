# cg/editing 변환 1 (3.1–3.3)

Type: task
Status: resolved
Blocked by: 05, 06, 07

## Question

Chapter 2 `3. 편집`의 `3.1. 객체 입력`–`3.3. 페이지 편집`(PDF 49–64)을 `/docs/nabi/cg/editing`으로 옮긴다. 페이지 파일과 H1 `3. 편집`을 이 티켓이 만들고, 11–13이 뒤에 이어 쓴다. 표 4개(PDF 50, 56, 59, 64)가 있다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `app/docs/nabi/cg/editing/page.mdx`를 만들고 H1 `# 3. 편집`과 `3.1. 객체 입력`–`3.3. 페이지 편집`(PDF 49–64)을 옮겼다. frontmatter `description`은 11–13이 이어 쓸 범위(3.4–3.8)까지 담았다.
- 개발 서버에서 페이지가 렌더되고(H2 3개, H3 25개, 표 4개, 이미지 자리표시자 62개) 사이드바 `NABI-CG` 아래 `편집`이 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본과 MDX를 공백·서식 기호를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 둘, 글머리표, 표 칸 순서뿐인 것을 확인했다.

### 11–13이 이어 쓸 때

- **이미지 번호는 세 자리다**(`cg-editing-001.png`). 이 페이지 하나에 이미지가 100개를 넘으므로(PDF 49–100) 07의 두 자리 대신 세 자리로 둔다. 11은 `063`부터 잇는다.
- **표 머리글 병합은 칸을 풀어 쓴다.** PDF 50의 `특 수 문 자`(1–9 위 병합 머리글)는 머리글 줄 셋째 칸에 두고, 1–9는 첫 본문 줄로 내렸다. `자음`·`특수문자`의 행 병합은 머리글 줄에만 두고 본문 줄 칸은 비운다.
- **대각선 머리글과 칸 안 줄바꿈은 `<br />`다.** PDF 59의 `구분`/`메뉴명`은 `구분<br />메뉴명`, PDF 64의 두 줄 칸도 `<br />`로 잇는다. 칸 안 아이콘은 이미지 마크다운을 그대로 둔다.
- **PDF 56 정렬 격자는 표로 옮겼다.** 칸마다 글자가 있어 이미지로만 두면 글이 빠진다. 왼쪽 정렬 메뉴 그림은 표 앞의 이미지 자리표시자다.
- **MDX가 먹는 글자는 `\`로 가린다.** 표 칸의 `{`, `}`, `<`가 JSX로 읽혀 빌드가 멈췄다(`\{`, `\}`, `\<`). 칸 하나뿐인 `-`도 `\-`로 둔다.
- 4단계 이하 제목에 붙은 아이콘은 굵은 글씨 안에 둔다(`**3.1.1.9. 문장 정렬 ![…](…)**`).

### 확인 필요

| 페이지 | PDF | 내용 |
| - | - | - |
| `editing` 3.1.1.1.1 | 49 | `Windings, Weddings`가 Windows 서체 이름 Wingdings, Webdings와 철자가 다르다. 서체 이름이라 원문대로 뒀다 |
| `editing` 3.2.12.2 | 58 | `아래 속성상에 보이는 속성`의 `속성상`이 3.2.12.3의 `속성창`과 같은 말의 오타인지 확인한다 |

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 49 -l 64`의 `num` 열이다. 쪽마다 맨 앞의 503×93 객체(머리글 로고)는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-001.png` | 49 | 1 | 글자 입력 아이콘(본문 안) |
| `cg-editing-002.png` | 49 | 2 | 두 줄로 입력한 글자 객체와 텍스트커서 |
| `cg-editing-003.png` | 49 | 3 | Special Character Map 창(Arial) |
| `cg-editing-004.png` | 50 | 5 | Special Character Map 창(Webdings) |
| `cg-editing-005.png` | 50 | 6 | 특수문자 선택 창(가로 막대) |
| `cg-editing-006.png` | 51 | 8 | 한자 선택창 |
| `cg-editing-007.png` | 52 | 10 | 글자 객체 간 커서 이동 전후 |
| `cg-editing-008.png` | 52 | 11 | 부분 글자 범위 지정과 속성 변경 전후 |
| `cg-editing-009.png` | 52 | 12 | Attributes 탭 |
| `cg-editing-010.png` | 53 | 14 | 문장 정렬 아이콘 셋(제목 옆) |
| `cg-editing-011.png` | 53 | 15 | 도형 모드 아이콘(본문 괄호 안) |
| `cg-editing-012.png` | 53 | 16 | 드래그 중인 도형 영역과 생성된 도형 |
| `cg-editing-013.png` | 53 | 17 | Shape Type 목록 |
| `cg-editing-014.png`–`021.png` | 53 | 18–25 | 도형 8개: Box, Framed Box, Circle, Framed Circle, Diamond, Framed Diamond, Rounded Rectangle, Octagon |
| `cg-editing-022.png` | 54 | 27 | 선택 모드 아이콘(제목 옆) |
| `cg-editing-023.png` | 54 | 28 | 선택된 객체 |
| `cg-editing-024.png` | 54 | 29 | 여러 개 선택된 객체 |
| `cg-editing-025.png`–`027.png` | 55 | 31–33 | 잘라내기, 복사하기, 붙이기 아이콘(제목 안) |
| `cg-editing-028.png` | 55 | 34 | 크기 조절 상자 8개 |
| `cg-editing-029.png` | 55 | 35 | 크기 조절 방향 화살표 |
| `cg-editing-030.png`–`032.png` | 56 | 37–39 | 안내선, 정렬선, 선택 객체 기준 정렬 아이콘(목록 안) |
| `cg-editing-033.png` | 56 | 40 | 정렬 위치 선택 메뉴(표 왼쪽 그림. 사이의 빨간 화살표는 벡터라 빠진다) |
| `cg-editing-034.png` | 56 | 41 | 가로, 세로, 가로+세로 크기 맞추기 아이콘 |
| `cg-editing-035.png` | 57 | 43 | 기준객체와 선택된 객체들 |
| `cg-editing-036.png` | 57 | 44 | 크기 맞추기 결과 셋(위에 아이콘 줄 포함) |
| `cg-editing-037.png` | 57 | 45 | 객체 순서 맞추기 아이콘 4개 |
| `cg-editing-038.png` | 57 | 46 | Undo, Redo 아이콘 |
| `cg-editing-039.png` | 58 | 48 | 빨간색 점선으로 표시된 그룹 객체 |
| `cg-editing-040.png` | 58 | 49 | 객체 속성 일괄 지정 아이콘(제목 옆) |
| `cg-editing-041.png` | 58 | 50 | 객체 속성 일괄 지정 아이콘(본문 안) |
| `cg-editing-042.png` | 59 | 52 | 페이지 리스트 업데이트 아이콘(제목 옆) |
| `cg-editing-043.png` | 59 | 53 | 객체 위치 고정 아이콘(제목 옆) |
| `cg-editing-044.png` | 60 | 55 | 회색 선으로 표시된 위치 고정 객체 |
| `cg-editing-045.png` | 60 | 56 | 객체 락 아이콘(제목 옆) |
| `cg-editing-046.png` | 60 | 57 | Timeline의 자물쇠 아이콘 |
| `cg-editing-047.png` | 60 | 58 | 페이지 리스트의 바로가기 메뉴 |
| `cg-editing-048.png` | 61 | 60 | .nba 파일 삽입 메뉴와 삽입 결과 |
| `cg-editing-049.png`–`052.png` | 62 | 62–65 | 첫·이전·다음·마지막 페이지로 이동 아이콘 |
| `cg-editing-053.png` | 62 | 66 | Go to Page 창 |
| `cg-editing-054.png` | 62 | 67 | Find 창 |
| `cg-editing-055.png` | 63 | 69 | Replace 창 |
| `cg-editing-056.png` | 63 | 70 | 위치 고정 아이콘(본문 괄호 안) |
| `cg-editing-057.png` | 63 | 71 | 락 아이콘(본문 괄호 안) |
| `cg-editing-058.png` | 63 | 72 | 흰색 점선으로 표시된 위치고정된객체 |
| `cg-editing-059.png` | 64 | 74 | 위치 고정 아이콘(표 칸 안) |
| `cg-editing-060.png` | 64 | 75 | 락 아이콘(표 칸 안) |
| `cg-editing-061.png` | 64 | 76 | 페이지 템플릿 일괄지정 전후의 Page List |
| `cg-editing-062.png` | 64 | 77 | 페이지 템플릿 일괄지정 전후의 페이지 |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `editing` 3.1.1.8 | 52 | `‘4.속성편집‘ 단원` | 닫는 따옴표 `’` |
| `editing` 3.2.12.1 | 58 | `‘객체속성 일괄지정‘ 메뉴` | 닫는 따옴표 `’` |
