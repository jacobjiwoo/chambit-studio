# cg/effects 변환

Type: task
Status: resolved
Blocked by: 05, 06, 07

## Question

Chapter 2 `5. Effects`(PDF 122–131)를 `/docs/nabi/cg/effects`로 옮긴다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `app/docs/nabi/cg/effects/page.mdx`에 `5. Effects`(PDF 122–131) 전체를 옮겼다. 4단계 이하(`5.3.1.1.`, `5.3.1.2.1.`, `5.3.2.1.`, `5.3.4.1.`)는 굵은 글씨 소제목이다.
- `•` 글머리표도 `.`처럼 `- `로 옮겼고, Wipe `Type` 아래 `- Soft` 등은 중첩 목록이다. `5.3.1.2. Layer 종류`의 `→ 글자객체` 줄은 그림 옆 설명이라 그림 바로 뒤에 hard break 줄로 두었다. Tile 예 그림 아래 캡션 `Tile Random Radial`은 한 줄 글자로 두었다.
- 매 쪽 머리글의 `NABI-CG` 로고 이미지(`pdfimages` object 160)는 머리글이라 옮기지 않았다.
- 원문 추출본과 MDX를 공백·서식 기호를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 하나뿐인 것을 확인했다.
- 개발 서버에서 페이지가 렌더되고 사이드바 NABI-CG 아래 `Effects`가 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다.

### 확인 필요

| 페이지 | PDF | 내용 |
| - | - | - |
| `effects` 5.3.4 | 127 | Zoom 표 마지막 행 단축키가 그림에서는 `₩`로 보인다. 한국어 글꼴이 백슬래시를 `₩`로 그린 것으로 보고 추출본대로 `\`로 옮겼다 |
| `effects` 5.4.9 | 131 | `깜빡임의 회수`의 `회수`는 표준어로 `횟수`다. 사전에 있는 낱말이라 원문대로 뒀다 |

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 122 -l 131`의 `num` 열이다. 머리글 로고(0, 3, 5, 8, 17, 20, 26, 30, 34, 38)는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-effects-01.png` | 122 | 1 | Effects 창 |
| `cg-effects-02.png` | 122 | 2 | ①–⑤ 번호를 붙인 Effects 창 |
| `cg-effects-03.png` | 123 | 4 | In Effects·Out Effects가 지정된 Timeline |
| `cg-effects-04.png` | 124 | 6 | Layer 오른쪽 버튼 편집메뉴 |
| `cg-effects-05.png` | 124 | 7 | 객체 종류별 레이어 |
| `cg-effects-06.png`–`12.png` | 125 | 9–15 | 레이어 아이콘 7개(View, Disable, Mask, Mask 영향, In Pause, Out Pause, Exclude). 목록 줄 앞 인라인 |
| `cg-effects-13.png` | 125 | 16 | 오디오 파일 삽입/변경·삭제 메뉴 |
| `cg-effects-14.png` | 126 | 18 | In/Out Effects가 지정된 Timeline(Effect Reset) |
| `cg-effects-15.png` | 126 | 19 | Timeline의 Reset Effects 메뉴 |
| `cg-effects-16.png` | 127 | 21 | Timeline 오른쪽 아래 Zoom 버튼 |
| `cg-effects-17.png`–`20.png` | 127 | 22–25 | Zoom 버튼 아이콘 4개(확대, 축소, 기본 길이, 전체길이). 표 `구분` 칸 |
| `cg-effects-21.png` | 128 | 27 | Wipe 효과 샘플 |
| `cg-effects-22.png` | 128 | 28 | Organic 효과 샘플 |
| `cg-effects-23.png` | 128 | 29 | Move 효과 샘플 |
| `cg-effects-24.png` | 129 | 31 | Scale 효과 샘플 |
| `cg-effects-25.png` | 129 | 32 | Curl 효과 샘플과 옵션 |
| `cg-effects-26.png` | 129 | 33 | Tile 효과 샘플과 옵션 |
| `cg-effects-27.png` | 130 | 35 | Tile·Random·Radial 효과 예(한 객체에 셋) |
| `cg-effects-28.png` | 130 | 36 | Banner 효과 샘플 |
| `cg-effects-29.png` | 130 | 37 | Text 효과 Typing 샘플 |
| `cg-effects-30.png` | 131 | 39 | Blink 효과와 Count 옵션 |
| `cg-effects-31.png` | 131 | 40 | Mask 효과 예 |
| `cg-effects-32.png`–`33.png` | 131 | 41–42 | Mask, Mask 영향 아이콘. 목록 줄 앞 인라인 |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `effects` 5.3.1.1 | 124 | `작업창을 통에 직접 편집하지만` | `작업창을 통해` |
