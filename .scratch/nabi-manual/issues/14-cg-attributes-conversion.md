# cg/attributes 변환

Type: task
Status: resolved
Blocked by: 05, 06, 07

## Question

Chapter 2 `4. 속성편집(Attribute)`(PDF 101–121)를 `/docs/nabi/cg/attributes`로 옮긴다. 21쪽에 큰 이미지가 77개라 한 세션에 넘칠 수 있다. 넘치면 2단계 절 경계에서 끊고, 남은 범위로 이어 쓰는 티켓을 새로 만든다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `cg/attributes`(PDF 101–121) 한 페이지를 옮겼다. 21쪽이 한 세션에 들어가 티켓을 나누지 않았다. PDF 121이 `4.5.6.`으로 끝나고 `5. Effects`는 PDF 122에서 시작한다.
- 4단계(`4.1.1.1.`)와 5단계(`4.4.2.3.1.`) 소제목은 굵은 글씨 문단이다.
- `※ 주의 :`(PDF 108, Text Link)는 04대로 `<Callout type="warning">` 안에 `**주의 :**`로 두고, 바로 뒤 "만일 다른 PC로…" 문장은 원문처럼 Callout 밖 보통 문단이다.
- PDF 117의 밑줄 문장 "반드시 32Bits로 저장해야 Alpha채널 값이 저장된다."는 `<u>`로 남겼다. 04가 Callout이 아니라고 정한 문장이고, 마크다운에 밑줄이 없어서 HTML 태그를 쓴다.
- 그림 옆·아래 설명 글(`왼쪽정렬 가운데정렬 오른쪽정렬`, PDF 120의 Gradation 설정 Bar 설명 셋)은 이미지 객체가 아니라 글자라서 그림 바로 뒤에 보통 문단으로 둔다.
- 개발 서버에서 페이지가 렌더되고(이미지 88개, Callout 하나) 사이드바에 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본과 MDX를 공백·서식 기호를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 둘과 PDF 120 한 줄에 둘 붙은 글머리표 `.`뿐인 것을 확인했다.

### 확인 필요

| 페이지 | PDF | 내용 |
| - | - | - |
| `attributes` 4.2.2.4 | 105 | Width 단축키 줄이 `확대 Ctrl+J, Ctrl+K`로 `Ctrl+K` 앞 '축소'가 없다. 원문대로 뒀다 |
| `attributes` 4.4 | 112 | 이미지 객체 절인데 "도형 객체 속성을 조절할 수 있는 메뉴"라고 썼다. 원문대로 뒀다 |

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 101 -l 121`의 `num` 열이다. 쪽마다 있는 머리글 이미지(503×93, 0·4·9·14·…·103번)는 뺐다. 4.5.2·4.5.3의 S·G 버튼, 4.5.4·4.5.5 제목 옆 아이콘, 4.5.3.2의 그러데이션 종류 버튼은 인라인 아이콘이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-attributes-01.png`–`03.png` | 101 | 1–3 | Face·Edge·Shadow 색상 칸, Face Soft 0/20, Edge 설정 화면 |
| `cg-attributes-04.png`–`07.png` | 102 | 5–8 | Edge Size 5/15, Edge Size·Soft 10/0·10/30, Shadow 설정 화면, Shadow Depth 20/80 |
| `cg-attributes-08.png`–`11.png` | 103 | 10–13 | Shadow Soft 0/20, Shadow 방향 -45/31, Shadow Blending 비교, 글자 객체 Attributes 탭 |
| `cg-attributes-12.png`–`14.png` | 104 | 15–17 | Font 목록, Bold, Italic |
| `cg-attributes-15.png`–`18.png` | 105 | 19–22 | Outline·Thickness, Space 100%, Space 400%, Thickness 0/3 |
| `cg-attributes-19.png`–`22.png` | 106 | 24–27 | Leading, Kerning, Rotate, C-Rotate |
| `cg-attributes-23.png`–`26.png` | 107 | 29–32 | 텍스트 정렬 셋, Exclude 전후, Timeline의 Exclude 표시, Char Unit |
| `cg-attributes-27.png`–`28.png` | 108 | 34–35 | 바닥에 비치는 효과 예, Flip Vert/Horz |
| `cg-attributes-29.png` | 108 | 36 | Text Link 적용 전후 |
| `cg-attributes-30.png` | 108 | 37 | 취소선이 그어진 Text Link 파일명 칸(242×22) |
| `cg-attributes-31.png` | 109 | 39 | 도형을 끌어 그리는 중과 그린 뒤 |
| `cg-attributes-32.png`–`39.png` | 109 | 40–47 | Shape Type 8개: Box, Framed Box, Circle, Framed Circle, Diamond, Framed Diamond, Rounded Rectangle, Octagon |
| `cg-attributes-40.png`–`45.png` | 110 | 49–54 | Frame/Control Point, 프레임 추가 메뉴, 프레임 제거 메뉴, 제거한 도형(126×182), 링크 메뉴, 링크로 묶인 포인트 |
| `cg-attributes-46.png`–`49.png` | 111 | 56–59 | 링크 곡선 만드는 중, 곡선 도형, 도형 Rotate 0/10, Pen Size 10/25 |
| `cg-attributes-50.png`–`52.png` | 112 | 61–63 | Arc Height, Arc Width, 이미지 객체 Attributes 탭 |
| `cg-attributes-53.png`–`55.png` | 113 | 65–67 | 이미지 파일 경로 칸(285×24), Use Alpha, Invert Alpha |
| `cg-attributes-56.png`–`59.png` | 114 | 69–72 | Photoshop 이미지, Background 더블클릭, New Layer 창, Layer 0 |
| `cg-attributes-60.png`–`62.png` | 115 | 74–76 | Magic Wand Tool 메뉴, 여백을 지운 이미지, TIFF Options 창 |
| `cg-attributes-63.png`–`65.png` | 116 | 78–80 | 파일 크기 알림 창, Create New Channel, Marquee Tool 메뉴 |
| `cg-attributes-66.png`–`68.png` | 117 | 82–84 | Fill 창, 흰색으로 채운 Alpha 채널, Targa Options 창 |
| `cg-attributes-69.png`–`71.png` | 118 | 86–88 | Change Color S·G·T, Color Mix, Black_White |
| `cg-attributes-72.png` | 119 | 90 | Color 창 |
| `cg-attributes-73.png`–`74.png` | 119 | 91–92 | S 버튼, G 버튼 아이콘(23×20) |
| `cg-attributes-75.png` | 119 | 93 | Gradation 설정 바와 Color 미리보기 |
| `cg-attributes-76.png`–`81.png` | 120 | 95–100 | 기본 설정 Bar, 클릭할 지점, 포인트가 생긴 Bar, 색상 변경, 포인트 삭제, Click·Drag 방향 |
| `cg-attributes-82.png` | 120 | 101 | 그러데이션 종류 버튼 넷(99×18, 소제목 옆) |
| `cg-attributes-83.png` | 120 | 102 | 선형·원형·다이아몬드·방추형 그러데이션 |
| `cg-attributes-84.png` | 121 | 104 | T 버튼 아이콘(23×20, 제목 옆) |
| `cg-attributes-85.png`–`86.png` | 121 | 105–106 | Texture Mapping 경로·미리보기, Fit 선택/해제 |
| `cg-attributes-87.png` | 121 | 107 | 스포이트 버튼 아이콘(30×30, 제목 옆) |
| `cg-attributes-88.png` | 121 | 108 | A 값을 조정하는 Color 창 |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `attributes` 4.4.2.1 | 113 | `32bit *.tag` | `32bit *.tga`(같은 문서의 형식 목록과 4.4.2.3.3이 모두 `tga`) |
| `attributes` 4.4.2.3.1 | 115 | `Magic Wand Tool로 선택한고` | `선택하고` |
