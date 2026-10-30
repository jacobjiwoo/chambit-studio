# cg/editing 변환 3 (3.6)

Type: task
Status: resolved
Blocked by: 05, 06, 07, 11

## Question

Chapter 2 `3.6. 삽입`(PDF 78–88)을 `/docs/nabi/cg/editing` 페이지 뒤에 이어 쓴다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `app/docs/nabi/cg/editing/page.mdx` 뒤에 `3.6. 삽입`을 이어 썼다. 티켓은 PDF 78–88이라 했지만 `3.6.13`의 Distribute Objects 그림과 `3.6.14. 특수문자 입력 「F2」`가 PDF 89 위쪽에 있어 3.6을 끝까지 이 티켓에서 옮겼다. 13은 PDF 89의 `3.7. 도구`부터 잇는다.
- 개발 서버에서 페이지가 렌더되고(H2 6개, H3 51개, 표 6개, 이미지 자리표시자 136개) 사이드바에 `편집`이 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본(PDF 78–88과 89의 3.6.14까지)과 MDX를 글자 단위로 비교해, 차이가 글머리표와 `\*`·`\` 같은 이스케이프뿐인 것을 확인했다. 고친 오탈자는 없다.
- PDF 80 제어 문자 표는 `제어 문자`·`기 능` 두 병합 머리글을 풀어 4열로 옮겼다. `공백 줄`·`//` 줄의 옵션 체크 상자 스크린샷은 넷째 칸의 이미지 자리표시자다. `<<`, `<>`는 표 칸과 이미지 alt에서도 JSX로 읽히므로 `\<`로 가린다.
- PDF 80의 `* 설정한 편집화면 템플릿 저장 위치는 …`는 줄 첫머리 `*`가 목록이 되지 않게 `\*`로 쓰고, 경로 `C:\Compix\Nabi\TEMPLATES\TextImport`는 인라인 코드다.
- PDF 86 `▶ Play`, `■ Stop`의 ▶·■는 글자이고, `Rewind` 앞 아이콘과 `포인터( )` 안 아이콘은 이미지 객체라 자리표시자를 두었다.

### 확인 필요

없다. 다만 3.6.14(PDF 89)는 10에서 확인 필요로 둔 `Windings, Weddings`를 `Windings, Webdings`로 쓴다. `Weddings`가 `Webdings`의 오타라는 근거다. `Windings`는 두 곳 모두 같으므로 원문대로 둔다.

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 10과 같은 `pdfimages -list -f 49 -l 100`의 `num` 열이다. 쪽마다 맨 앞의 503×93 머리글 로고는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-096.png` | 78 | 125 | 삽입 메뉴 |
| `cg-editing-097.png` | 79 | 127 | Text Import Manager 창 |
| `cg-editing-098.png` | 79 | 128 | 가로, 세로 포인트로 설정한 기준 영역 |
| `cg-editing-099.png` | 79 | 129 | 페이지 리스트 업데이트 아이콘(본문 괄호 안) |
| `cg-editing-100.png` | 80 | 131 | 페이지 넘김 설정 목록과 적용 버튼 |
| `cg-editing-101.png` | 80 | 132 | 템플릿 목록과 편집 화면 템플릿 버튼 |
| `cg-editing-102.png`–`103.png` | 80 | 133–134 | `Use "//" as Page delimiter…` 체크 해제, 체크(표 칸 안) |
| `cg-editing-104.png` | 80 | 135 | 글자 정렬 속성 아이콘 셋(본문 안) |
| `cg-editing-105.png` | 81 | 137 | 첫 줄에 `<<`를 쓴 텍스트 파일(메모장) |
| `cg-editing-106.png` | 81 | 138 | 왼쪽 정렬로 삽입된 텍스트 |
| `cg-editing-107.png` | 81 | 139 | 첫 줄에 `&&`를 쓴 텍스트 파일(메모장) |
| `cg-editing-108.png` | 81 | 140 | 영화자막 정렬로 삽입된 텍스트 |
| `cg-editing-109.png` | 82 | 142 | 메모장에서 일본어 텍스트 복사 |
| `cg-editing-110.png` | 82 | 143 | 작업창의 마우스 오른쪽 버튼 메뉴 |
| `cg-editing-111.png` | 82 | 144 | 네모 박스로 보이는 일본어 텍스트 |
| `cg-editing-112.png` | 82 | 145 | 정상적으로 보이는 일본어 텍스트 |
| `cg-editing-113.png` | 83 | 147 | Slide Size 창 |
| `cg-editing-114.png` | 83 | 148 | Exporting Slide Images 창 |
| `cg-editing-115.png` | 83 | 149 | 이미지 시퀀스 Open 창 |
| `cg-editing-116.png` | 84 | 151 | 이미지 아이콘(제목 안) |
| `cg-editing-117.png` | 84 | 152 | 애니메이션 아이콘(제목 안) |
| `cg-editing-118.png` | 84 | 153 | TAD 애니메이션 파일 만들기 확인 창 |
| `cg-editing-119.png` | 85 | 155 | Creating a TAD file 창 |
| `cg-editing-120.png` | 85 | 156 | tad 파일의 Attributes |
| `cg-editing-121.png` | 85 | 157 | 비디오 파일의 Attributes |
| `cg-editing-122.png` | 86 | 159 | Video Preview 아이콘(㉤ 옆) |
| `cg-editing-123.png` | 86 | 160 | Video Preview 창과 Attributes |
| `cg-editing-124.png` | 86 | 161 | Rewind 아이콘(목록 안) |
| `cg-editing-125.png` | 86 | 162 | Start/End Time 포인터 아이콘(본문 괄호 안) |
| `cg-editing-126.png` | 86 | 163 | Mark 구간이 지정된 Video Preview |
| `cg-editing-127.png` | 87 | 165 | 배경 이미지 아이콘(제목 안) |
| `cg-editing-128.png` | 87 | 166 | 배경이미지 삭제 아이콘(본문 안) |
| `cg-editing-129.png` | 87 | 167 | 배경 애니메이션 아이콘(제목 안) |
| `cg-editing-130.png` | 87 | 168 | 배경애니메이션 삭제 아이콘(본문 안) |
| `cg-editing-131.png` | 87 | 169 | Clock/Timer 창 |
| `cg-editing-132.png` | 88 | 171 | Clock의 Attributes |
| `cg-editing-133.png` | 88 | 172 | Clock Format 목록(목록 안) |
| `cg-editing-134.png` | 88 | 173 | Timer의 Attributes |
| `cg-editing-135.png` | 88 | 174 | Timer Format 목록(목록 안) |
| `cg-editing-136.png` | 89 | 176 | Distribute Objects 창 |

### 고친 오탈자

없다.
