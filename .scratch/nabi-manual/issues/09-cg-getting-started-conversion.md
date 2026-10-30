# cg/getting-started 변환

Type: task
Status: resolved
Blocked by: 05, 06, 07

## Question

Chapter 2 `2. 시작하기`(PDF 36–48)를 `/docs/nabi/cg/getting-started`로 옮긴다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `app/docs/nabi/cg/getting-started/page.mdx`에 `2. 시작하기`(PDF 36–48)를 옮겼다. 2단계 절 8개가 H2, 3단계가 H3, `2.2.1.1.`–`2.3.1.4.` 4단계 7개가 굵은 글씨 소제목이다.
- 07이 정한 변환 방식을 그대로 따랐다. 새로 정한 것은 없다. 이 페이지에서 고른 것만 적는다.
  - `※ *.nbi 파일은…` 두 곳(PDF 36, 41)은 04대로 `<Callout type="warning">`이다. PDF 37의 굵은 문장 "단, 자동백업이 송출에…"는 `※`가 없어 굵은 글씨 문단으로 둔다.
  - 경로(`C:\Compix\Nabi\Documents`, `D:\Data`)와 확장자 패턴(`*.nbi`, `*.nbk` 등), 파일 이름(`Untitled-1.nbk`)은 인라인 코드다. 확장자만 쓴 `nbi파일`, `jpg, bmp` 같은 낱말은 글자 그대로다.
  - PDF 39의 굵은 `[파일명.nbe]파일과`는 `**`가 `]` 뒤 한글 앞에서 닫히지 않아(CommonMark flanking 규칙) `<strong>`으로 썼다.
  - PDF 42의 `. nbi :` 확장자 목록과 Import Option 두 선택지는 목록 `- `이고, 원문이 굵게 쓴 낱말만 굵게 둔다.
- 개발 서버에서 페이지가 렌더되고 사이드바 `NABI-CG (Version 2.5)` 아래 `시작하기`가 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본(머리글·바닥글 제거)과 MDX를 공백·서식 기호·이미지를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 넷과 글머리표 `.`뿐인 것을 확인했다.

### 확인 필요

없다. 읽기 어려운 곳이 없어 MDX에 `{/* 확인 필요 */}`를 남기지 않았다.

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 36 -l 48`의 `num` 열이다. 쪽마다 나오는 머리글 이미지(0, 4, 6, 9, 13, 17, 22, 25, 28, 32, 35, 40, 44)는 뺐다. 화면 27개, 인라인 아이콘 5개로 모두 32개다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-getting-started-01.png` | 36 | 1 | 새로 만들기 아이콘(본문 안) |
| `cg-getting-started-02.png` | 36 | 2 | 저장 아이콘(본문 안) |
| `cg-getting-started-03.png` | 36 | 3 | Save 창 |
| `cg-getting-started-04.png` | 37 | 5 | Options 창의 General 탭 |
| `cg-getting-started-05.png`–`06.png` | 38 | 7–8 | Save 창(nbi 파일 형식, nbe 파일 형식) |
| `cg-getting-started-07.png` | 39 | 10 | Export NBE 압축 진행 창 |
| `cg-getting-started-08.png` | 39 | 11 | NBE Created Successfully 메시지 창 |
| `cg-getting-started-09.png` | 39 | 12 | Test_Resource 폴더가 보이는 탐색기 창 |
| `cg-getting-started-10.png`–`12.png` | 40 | 14–16 | Save As Text File 창, 로딩 여부 창, 저장된 텍스트를 연 메모장 |
| `cg-getting-started-13.png` | 41 | 18 | 위치 고정 아이콘(압정, 본문 괄호 안) |
| `cg-getting-started-14.png` | 41 | 19 | 락 아이콘(자물쇠, 본문 괄호 안) |
| `cg-getting-started-15.png` | 41 | 20 | 열기 아이콘(본문 안) |
| `cg-getting-started-16.png` | 41 | 21 | 파일 형식 목록을 펼친 Open 창 |
| `cg-getting-started-17.png` | 42 | 23 | Import Option 창 |
| `cg-getting-started-18.png` | 42 | 24 | 폰트 경고 창 |
| `cg-getting-started-19.png` | 43 | 26 | 외부 파일 경로를 지정하는 Open 창 |
| `cg-getting-started-20.png` | 43 | 27 | 페이지리스트의 `?`와 작업창의 No File 표시(한 객체) |
| `cg-getting-started-21.png`–`22.png` | 44 | 29–30 | 디폴트 이미지 폴더 지정 질문 창, 외부 파일 객체 삭제 질문 창 |
| `cg-getting-started-23.png` | 44 | 31 | NBA 파일 경로 재설정 질문 창 |
| `cg-getting-started-24.png` | 45 | 33 | Open Folder 창 |
| `cg-getting-started-25.png` | 45 | 34 | Save as Image 창 |
| `cg-getting-started-26.png` | 46 | 36 | 작게 불러온 자막 → 변환한 자막(화살표까지 한 객체) |
| `cg-getting-started-27.png` | 46 | 37 | Convert File Resolution 창 |
| `cg-getting-started-28.png`–`29.png` | 46 | 38–39 | Converting File Size 창, Ratio 창 |
| `cg-getting-started-30.png`–`31.png` | 47 | 41–42 | 해상도 목록을 펼친 Edit Resolution 창, 다시 시작 안내 창 |
| `cg-getting-started-32.png` | 47 | 43 | Print 창 |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `getting-started` 2.1 | 36 | `‘Untilted-1’탭이` | `‘Untitled-1’탭이`(37쪽 `Untitled-1.nbk`와 같은 이름) |
| `getting-started` 2.3.1 | 41 | `‘D:\Data‘라면` | 닫는 따옴표 `’` |
| `getting-started` 2.3.1 | 41 | `다음번 ’열기’다이얼로그` | 여는 따옴표 `‘` |
| `getting-started` 2.3.1 | 41 | `‘D:\Data‘로 열린다` | 닫는 따옴표 `’` |
