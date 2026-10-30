# cg/editing 변환 2 (3.4–3.5)

Type: task
Status: resolved
Blocked by: 05, 06, 07, 10

## Question

Chapter 2 `3.4. Style Catalog`–`3.5. 보기`(PDF 65–77)를 `/docs/nabi/cg/editing` 페이지 뒤에 이어 쓴다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `app/docs/nabi/cg/editing/page.mdx` 뒤에 `3.4. Style Catalog`–`3.5. 보기`(PDF 65–77)를 이어 썼다. 변환 방식은 [10 Answer](10-cg-editing-1-conversion.md)의 "11–13이 이어 쓸 때"를 따랐다.
- 개발 서버에서 페이지가 렌더되고(H2 5개, H3 37개, 표 5개, 이미지 자리표시자 95개, Callout 1개) 사이드바에 `편집`이 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본과 MDX를 글자 단위로 비교해, 차이가 글머리표, 표 칸 순서, Callout이 대신한 `※`뿐인 것을 확인했다. 고친 오탈자는 없다.
- PDF 66 표는 `Style 추가`/`Style 적용` 두 줄 머리글과 종류마다 두 줄인 행 병합을 풀어 4열(`종 류`, `기 능`, `Style 추가`, `Style 적용`)로 옮겼다.
- PDF 75 `※` 문단(04가 정한 9곳 중 하나)은 `<Callout type="warning">`이다.
- 확장자 패턴 `*.nba`, `*.nbi`, `*.nbs`는 한 문단에 둘 나오면 기울임꼴로 읽히므로 `\*`로 가린다. 파일 이름이 아니라 패턴이라 인라인 코드로 바꾸지 않는다.
- 3.5.10.1의 ⓐ–ⓖ처럼 원문이 굵게 쓴 말머리는 굵은 글씨로 두고, 굵게 쓰지 않은 3.5.10.2의 ⓐ–ⓓ는 글자 그대로 둔다. PDF 74 버튼 설명 줄은 버튼 그림마다 자리표시자를 하나씩 두었다(▶와 ■은 객체가 둘이다).

### 확인 필요

없다.

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 10과 같은 `pdfimages -list -f 49 -l 100`의 `num` 열이다(`-f`를 바꾸면 번호가 0부터 다시 시작한다). 쪽마다 맨 앞의 503×93 머리글 로고는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-063.png` | 65 | 79 | Style Catalog 창 |
| `cg-editing-064.png` | 67 | 82 | Style Catalog의 New 메뉴와 새로 생긴 New Style Catalog |
| `cg-editing-065.png` | 67 | 83 | STYLES 폴더의 다른 이름으로 저장 창 |
| `cg-editing-066.png` | 67 | 84 | Style 위의 마우스 오른쪽 버튼 메뉴 |
| `cg-editing-067.png` | 68 | 86 | 보기 메뉴 |
| `cg-editing-068.png` | 69 | 88 | Safe Area, Horizontal Center, Vertical Center, SD Area 안내선 |
| `cg-editing-069.png` | 69 | 89 | 격자점 |
| `cg-editing-070.png` | 69 | 90 | 눈금자의 정렬선 포인트와 녹색 정렬 영역 |
| `cg-editing-071.png` | 70 | 92 | Snap, Snap To 메뉴 |
| `cg-editing-072.png` | 70 | 93 | 포인터 8개가 나타난 안내선 |
| `cg-editing-073.png` | 71 | 95 | 송출 미리보기 아이콘(제목 안) |
| `cg-editing-074.png` | 71 | 96 | Preview Window |
| `cg-editing-075.png` | 71 | 97 | NABI 화면 위의 Preview Window |
| `cg-editing-076.png` | 71 | 98 | 페이지 리스트 윈도우 아이콘(제목 안) |
| `cg-editing-077.png` | 72 | 100 | Page List Window |
| `cg-editing-078.png` | 72 | 101 | 오디오 타임라인 윈도우 아이콘(제목 안) |
| `cg-editing-079.png` | 73 | 103 | Audio Timeline Window(A–G 표시) |
| `cg-editing-080.png` | 73 | 104 | 분홍색 테두리의 PGM 페이지와 하늘색 테두리의 NEXT 페이지 |
| `cg-editing-081.png` | 74 | 106 | Playback의 NEXT, PGM 페이지 |
| `cg-editing-082.png` | 74 | 107 | 오디오파일 설정 및 플레이 영역 |
| `cg-editing-083.png`–`084.png` | 74 | 108–109 | Play, Stop 버튼 |
| `cg-editing-085.png` | 74 | 110 | PlayHead 맨 앞으로 이동 버튼 |
| `cg-editing-086.png` | 74 | 111 | CG 버튼 |
| `cg-editing-087.png` | 74 | 112 | 재생 시간 표시 |
| `cg-editing-088.png` | 74 | 113 | File 버튼 |
| `cg-editing-089.png` | 74 | 114 | 볼륨 조절 막대 |
| `cg-editing-090.png` | 75 | 116 | Nabi Audio Files(\*.nba) 형식의 Save 창 |
| `cg-editing-091.png` | 76 | 118 | 오디오 파일이 존재하지 않는다는 경고 메시지 |
| `cg-editing-092.png` | 76 | 119 | .nba 파일 삽입 메뉴와 삽입 결과 |
| `cg-editing-093.png` | 76 | 120 | X표시된 nba 프로젝트 파일 페이지 |
| `cg-editing-094.png` | 77 | 122 | 편집 창의 NoNBAFile, NoAudioFile 표시 |
| `cg-editing-095.png` | 77 | 123 | 작업용 프리뷰 모니터 메뉴 |

### 고친 오탈자

없다.
