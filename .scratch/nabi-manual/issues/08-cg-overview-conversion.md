# cg/overview 변환

Type: task
Status: resolved
Blocked by: 05, 06, 07

## Question

Chapter 2 `1. NABI-CG이해하기`(PDF 30–35)를 `/docs/nabi/cg/overview`로 옮긴다. `/docs/nabi/cg` Chapter 첫 페이지는 07이 이미 만들었다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `app/docs/nabi/cg/overview/page.mdx`에 `1. NABI-CG이해하기`(PDF 30–35)를 옮겼다. 07 Answer의 "정한 변환 방식"을 따랐다. `1.2.2.1.`, `1.2.2.2.`는 4단계라 굵은 글씨 소제목이다. `. Duration :`처럼 원문이 굵게 쓴 낱말은 굵게 남겼다.
- 개발 서버에서 페이지가 렌더되고 사이드바 `NABI-CG (Version 2.5)` 아래에 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본과 MDX를 공백·서식 기호를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 하나와 글머리표뿐인 것을 확인했다.
- 이 Chapter의 쪽마다 머리글 `NABI-CG` 로고가 이미지 객체(`pdfimages` 번호 0, 3, 5, 8, 11, 14, object ID 160)로 들어 있다. 머리글이라 자리표시자를 두지 않았다. Ch1에는 이런 객체가 없었다.

### 확인 필요

| 페이지 | PDF | 내용 |
| - | - | - |
| `overview` 1.2.2.1 | 32 | `In`/`효과가`가 줄바꿈으로 갈려 띄어쓰기 여부를 알 수 없다. `In 효과가`로 이었다 |
| `overview` 1.3 | 35 | `복원`/`된다`가 줄바꿈으로 갈려 띄어쓰기 여부를 알 수 없다. `복원된다`로 이었다 |
| `overview` 1.3 | 35 | `← 스핀컨트롤`, `↑`, `입력창`은 그림 옆·아래에 붙은 글자다. 글자는 두고 줄만 나눴다. 이미지를 준비할 때 이 글자까지 그림에 넣을지 정한다 |

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 30 -l 35`의 `num` 열이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-overview-01.png` | 30 | 1 | NABI-CG 실행 화면 |
| `cg-overview-02.png` | 30 | 2 | 1–8 번호를 붙인 화면 구성 |
| `cg-overview-03.png` | 31 | 4 | 아이콘 메뉴 두 줄 |
| `cg-overview-04.png` | 32 | 6 | 페이지 모드 목록 |
| `cg-overview-05.png` | 32 | 7 | Roll 모드 작업창과 수직 스크롤바 |
| `cg-overview-06.png` | 33 | 9 | Roll 페이지의 Effects 탭 |
| `cg-overview-07.png` | 33 | 10 | 타임라인 오른쪽 메뉴로 배경 객체를 지정하기 전과 후(화살표까지 한 객체) |
| `cg-overview-08.png` | 34 | 12 | Crawl 모드 작업창과 수평 스크롤바 |
| `cg-overview-09.png` | 34 | 13 | MultiLayer 모드 작업창과 타임라인 |
| `cg-overview-10.png` | 35 | 15 | 수치 입력창과 스핀 컨트롤(55×18) |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `overview` 1.2.2.2 | 34 | `‘배경객체‘ 해제` | 닫는 따옴표 `’` |
