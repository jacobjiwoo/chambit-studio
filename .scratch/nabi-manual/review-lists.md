# NABI 매뉴얼 변환 검토 목록

변환 티켓 07–18의 `## Answer`에서 확인 필요·이미지·고친 오탈자 표를 모은다. 원천은 각 티켓이고, 이 파일은 모아 보기 위한 사본이다.

## 확인 필요

### [setup 변환](issues/07-setup-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `software-install` 3.1.1 | 18 | "V10.0.2이후 부터는 아래와 같이 보일 수도 있다" 뒤에 가리키는 그림이 원문에 없다(이미지 객체도 없다) |
| `software-install` 3.3.1 | 19 | `UCA`가 두 번 나온다. Windows 기능 이름은 UAC다. 원문대로 뒀다 |
| `software-install` 3.3.2 | 21 | `Contro S/W폴더`가 `Control S/W`의 오타인지 설치 CD 폴더 이름으로 확인한다 |

### [cg/overview 변환](issues/08-cg-overview-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `overview` 1.2.2.1 | 32 | `In`/`효과가`가 줄바꿈으로 갈려 띄어쓰기 여부를 알 수 없다. `In 효과가`로 이었다 |
| `overview` 1.3 | 35 | `복원`/`된다`가 줄바꿈으로 갈려 띄어쓰기 여부를 알 수 없다. `복원된다`로 이었다 |
| `overview` 1.3 | 35 | `← 스핀컨트롤`, `↑`, `입력창`은 그림 옆·아래에 붙은 글자다. 글자는 두고 줄만 나눴다. 이미지를 준비할 때 이 글자까지 그림에 넣을지 정한다 |

### [cg/getting-started 변환](issues/09-cg-getting-started-conversion.md)

없다. 읽기 어려운 곳이 없어 MDX에 `{/* 확인 필요 */}`를 남기지 않았다.

### [cg/editing 변환 1 (3.1–3.3)](issues/10-cg-editing-1-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `editing` 3.1.1.1.1 | 49 | `Windings, Weddings`가 Windows 서체 이름 Wingdings, Webdings와 철자가 다르다. 서체 이름이라 원문대로 뒀다 |
| `editing` 3.2.12.2 | 58 | `아래 속성상에 보이는 속성`의 `속성상`이 3.2.12.3의 `속성창`과 같은 말의 오타인지 확인한다 |

### [cg/editing 변환 2 (3.4–3.5)](issues/11-cg-editing-2-conversion.md)

없다.

### [cg/editing 변환 3 (3.6)](issues/12-cg-editing-3-conversion.md)

없다. 다만 3.6.14(PDF 89)는 10에서 확인 필요로 둔 `Windings, Weddings`를 `Windings, Webdings`로 쓴다. `Weddings`가 `Webdings`의 오타라는 근거다. `Windings`는 두 곳 모두 같으므로 원문대로 둔다.

### [cg/editing 변환 4 (3.7–3.8)](issues/13-cg-editing-4-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `editing` 3.7.1 | 90 | ①과 ③의 `Data & Time`이 ②와 Schedule Item 창의 `Date & Time`과 다르다. 두 번 똑같이 나와 원문대로 뒀다 |
| `editing` 3.7.6.3.12 | 97 | 제목 `Use Alternate fonts when is no font`에 General 탭 옵션 이름(`… when there is no font`)의 `there`가 빠져 있다. 낱말을 더하는 일이라 원문대로 뒀다 |

### [cg/attributes 변환](issues/14-cg-attributes-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `attributes` 4.2.2.4 | 105 | Width 단축키 줄이 `확대 Ctrl+J, Ctrl+K`로 `Ctrl+K` 앞 '축소'가 없다. 원문대로 뒀다 |
| `attributes` 4.4 | 112 | 이미지 객체 절인데 "도형 객체 속성을 조절할 수 있는 메뉴"라고 썼다. 원문대로 뒀다 |

### [cg/effects 변환](issues/15-cg-effects-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `effects` 5.3.4 | 127 | Zoom 표 마지막 행 단축키가 그림에서는 `₩`로 보인다. 한국어 글꼴이 백슬래시를 `₩`로 그린 것으로 보고 추출본대로 `\`로 옮겼다 |
| `effects` 5.4.9 | 131 | `깜빡임의 회수`의 `회수`는 표준어로 `횟수`다. 사전에 있는 낱말이라 원문대로 뒀다 |

### [cg/playout 변환](issues/16-cg-playout-conversion.md)

없다.

### [cg/shortcuts 변환](issues/17-cg-shortcuts-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `shortcuts` 7.3 | 138 | `정렬선 On/Off`의 단축키가 `Alt+’`(오른쪽 작은따옴표 U+2019)다. 키보드 키 `'`가 자동 변환된 것인지 확인한다. 원문 글자대로 뒀다 |
| `shortcuts` 7.4, 7.5 | 139, 140 | `그림변경`과 `프롬프터 송출 On/Off`가 모두 `Alt+P`다. 원문대로 뒀다 |

### [db 변환](issues/18-db-conversion.md)

| 페이지 | PDF | 내용 |
| - | - | - |
| `templates` 3.1.6 | 148 | "기본 폴더로 (`C:\Compix\ChurchDB\Template`)로"에 `로`가 두 번 나온다. 철자 실수가 아니라 원문대로 뒀다 |

## 고친 오탈자

### [setup 변환](issues/07-setup-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `cg-board` 2.1 | 15 | `‘천하통일 HD200/200K‘는` | 닫는 따옴표 `’` |
| `cg-board` 2.1.1 | 15 | `문자발생기기 보드를` | `문자발생기 보드를` |
| `software-install` 3.3.3 | 23 | `Test Patten :` | `Test Pattern :`(바로 위 스크린샷 글자가 `Test Pattern`) |

### [cg/overview 변환](issues/08-cg-overview-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `overview` 1.2.2.2 | 34 | `‘배경객체‘ 해제` | 닫는 따옴표 `’` |

### [cg/getting-started 변환](issues/09-cg-getting-started-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `getting-started` 2.1 | 36 | `‘Untilted-1’탭이` | `‘Untitled-1’탭이`(37쪽 `Untitled-1.nbk`와 같은 이름) |
| `getting-started` 2.3.1 | 41 | `‘D:\Data‘라면` | 닫는 따옴표 `’` |
| `getting-started` 2.3.1 | 41 | `다음번 ’열기’다이얼로그` | 여는 따옴표 `‘` |
| `getting-started` 2.3.1 | 41 | `‘D:\Data‘로 열린다` | 닫는 따옴표 `’` |

### [cg/editing 변환 1 (3.1–3.3)](issues/10-cg-editing-1-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `editing` 3.1.1.8 | 52 | `‘4.속성편집‘ 단원` | 닫는 따옴표 `’` |
| `editing` 3.2.12.1 | 58 | `‘객체속성 일괄지정‘ 메뉴` | 닫는 따옴표 `’` |

### [cg/editing 변환 2 (3.4–3.5)](issues/11-cg-editing-2-conversion.md)

없다.

### [cg/editing 변환 3 (3.6)](issues/12-cg-editing-3-conversion.md)

없다.

### [cg/editing 변환 4 (3.7–3.8)](issues/13-cg-editing-4-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `editing` 3.7.6.3.3 | 94 | `Scheduler Alter` | `Scheduler Alert`(General 탭 스크린샷 글자와 3.7.1의 `Schedule Alert`) |
| `editing` 3.7.6.3.13 | 97 | `when creading TAD` | `when creating TAD`(General 탭 스크린샷 글자) |

### [cg/attributes 변환](issues/14-cg-attributes-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `attributes` 4.4.2.1 | 113 | `32bit *.tag` | `32bit *.tga`(같은 문서의 형식 목록과 4.4.2.3.3이 모두 `tga`) |
| `attributes` 4.4.2.3.1 | 115 | `Magic Wand Tool로 선택한고` | `선택하고` |

### [cg/effects 변환](issues/15-cg-effects-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `effects` 5.3.1.1 | 124 | `작업창을 통에 직접 편집하지만` | `작업창을 통해` |

### [cg/playout 변환](issues/16-cg-playout-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `playout` 6.4 | 134 | `OnAir중이였다면` | `OnAir중이었다면` |

### [cg/shortcuts 변환](issues/17-cg-shortcuts-conversion.md)

없다.

### [db 변환](issues/18-db-conversion.md)

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `search` 2.1 | 144 | `누가목음` | `누가복음` |
| `search` 2.1 | 144 | `에배소서` | `에베소서` |
| `templates` 3.1.3 | 148 | `무조건 썸내일을` | `무조건 썸네일을` |
| `templates` 3.1.7 | 148 | `‘템플릿 삭제‘버튼` | 닫는 따옴표 `’` |
| `templates` 3.2 | 148 | `‘Alias지정‘을` | 닫는 따옴표 `’` |
| `options` 4.4.1 | 151 | `템플릿 차제의` | `템플릿 자체의` |

## 이미지

413개 모두 `public/docs/nabi/images/`에 들어 있다(`feat/nabi-manual-images`). 파일은 WebP다. 티켓 표의 `.png` 이름은 확장자만 `.webp`로 바뀌었다. 만든 방식은 아래와 같다.

- `pdfimages -png`로 뽑은 객체를 q90 손실 WebP와 무손실 WebP 중 작은 쪽으로 저장한다. 작은 아이콘 42개가 무손실이다. 합계 약 7.4MB다.
- PDF가 clip으로 일부만 보이는 23개는 보이는 영역대로 자른다. clip 영역은 `pdftocairo -svg`의 clipPath와 이미지 행렬로 셈한다. `setup-troubleshooting-01`(26쪽 BIOS 화면 객체의 한 줄), `cg-shortcuts-22`(Take In·Take Out 아이콘 중 왼쪽)가 여기 든다.
- `cg-editing-139`는 따로 나오는 마스크(`pdfimages` 181, `mask` 행)를 alpha로 합쳐 투명 배경을 살린다. 마스크 행은 번호를 차지하지만 목록 번호는 이미 이를 셈해 두었다. `smask`는 없다.
- PDF가 이미지 위나 옆에 벡터로 덧그린 빨간 표시 두 곳은 `pdftocairo -svg`의 좌표를 이미지 픽셀로 옮겨 그려 넣는다. `setup-troubleshooting-02`의 강조 상자 둘, `cg-editing-033` 오른쪽의 빨간 화살표다. 색 있는 벡터는 이 둘뿐이다(27쪽 파란색은 링크 밑줄).

### [setup 변환](issues/07-setup-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 14 -l 27`의 `num` 열이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `setup-cg-board-01.webp` | 15 | 0 | 천하통일HD200 보드와 Bypass B/D 연결도 |
| `setup-cg-board-02.webp` | 16 | 1 | 천하통일HD200K 스위처 연결도 |
| `setup-cg-board-03.webp` | 17 | 2 | 천하통일HD200K Overlay 연결도 |
| `setup-software-install-01.webp` | 18 | 3 | 장치관리자의 Blackmagic 장치 목록 |
| `setup-software-install-02.webp` | 19 | 4 | 장치관리자의 SafeNet 장치 목록 |
| `setup-software-install-03.webp` | 19 | 5 | 사용자 계정 컨트롤 경고 창 |
| `setup-software-install-04.webp`–`07.webp` | 20 | 6–9 | 제어판, 사용자 계정 및 가족 보호, 사용자 계정 변경, 사용자 계정 컨트롤 설정 |
| `setup-software-install-08.webp`–`13.webp` | 21 | 10–15 | CPX-DL Utilities 설치 창 6개(왼→오, 위→아래) |
| `setup-software-install-14.webp` | 22 | 16 | CPX-DL Controller 아이콘(제목 옆 48px) |
| `setup-software-install-15.webp` | 22 | 17 | CPX-DL Controller 창 |
| `setup-software-install-16.webp`–`18.webp` | 22 | 18–20 | Output Display Format, Connection Input, Connection Output 목록 |
| `setup-software-install-19.webp` | 23 | 21 | Test Pattern 목록 |
| `setup-software-install-20.webp`–`23.webp` | 23 | 22–25 | NABI 2.0 설치 창 4개(왼→오, 위→아래) |
| `setup-software-install-24.webp` | 24 | 26 | NABI-CG 실행 화면 |
| `setup-software-install-25.webp` | 24 | 27 | Download VLC Player 창 |
| `setup-software-install-26.webp` | 25 | 28 | Edit Resolution 창 |
| `setup-troubleshooting-01.webp` | 25 | 29 | CMOS의 PCI Express bandwidth 설정 줄. 26쪽 BIOS 화면과 같은 객체를 잘라 보인 것이라 직접 잘라야 한다 |
| `setup-troubleshooting-02.webp` | 26 | 30 | ASUS UEFI BIOS Utility 화면(벡터 빨간 상자 둘을 그려 넣었다) |
| `setup-troubleshooting-03.webp` | 26 | 31 | 작업창 중앙의 빨간색 십자선 |
| `setup-troubleshooting-04.webp` | 27 | 32 | Output Display Format 목록 |

`hd200-install`에는 이미지가 없다.

### [cg/overview 변환](issues/08-cg-overview-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 30 -l 35`의 `num` 열이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-overview-01.webp` | 30 | 1 | NABI-CG 실행 화면 |
| `cg-overview-02.webp` | 30 | 2 | 1–8 번호를 붙인 화면 구성 |
| `cg-overview-03.webp` | 31 | 4 | 아이콘 메뉴 두 줄 |
| `cg-overview-04.webp` | 32 | 6 | 페이지 모드 목록 |
| `cg-overview-05.webp` | 32 | 7 | Roll 모드 작업창과 수직 스크롤바 |
| `cg-overview-06.webp` | 33 | 9 | Roll 페이지의 Effects 탭 |
| `cg-overview-07.webp` | 33 | 10 | 타임라인 오른쪽 메뉴로 배경 객체를 지정하기 전과 후(화살표까지 한 객체) |
| `cg-overview-08.webp` | 34 | 12 | Crawl 모드 작업창과 수평 스크롤바 |
| `cg-overview-09.webp` | 34 | 13 | MultiLayer 모드 작업창과 타임라인 |
| `cg-overview-10.webp` | 35 | 15 | 수치 입력창과 스핀 컨트롤(55×18) |

### [cg/getting-started 변환](issues/09-cg-getting-started-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 36 -l 48`의 `num` 열이다. 쪽마다 나오는 머리글 이미지(0, 4, 6, 9, 13, 17, 22, 25, 28, 32, 35, 40, 44)는 뺐다. 화면 27개, 인라인 아이콘 5개로 모두 32개다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-getting-started-01.webp` | 36 | 1 | 새로 만들기 아이콘(본문 안) |
| `cg-getting-started-02.webp` | 36 | 2 | 저장 아이콘(본문 안) |
| `cg-getting-started-03.webp` | 36 | 3 | Save 창 |
| `cg-getting-started-04.webp` | 37 | 5 | Options 창의 General 탭 |
| `cg-getting-started-05.webp`–`06.webp` | 38 | 7–8 | Save 창(nbi 파일 형식, nbe 파일 형식) |
| `cg-getting-started-07.webp` | 39 | 10 | Export NBE 압축 진행 창 |
| `cg-getting-started-08.webp` | 39 | 11 | NBE Created Successfully 메시지 창 |
| `cg-getting-started-09.webp` | 39 | 12 | Test_Resource 폴더가 보이는 탐색기 창 |
| `cg-getting-started-10.webp`–`12.webp` | 40 | 14–16 | Save As Text File 창, 로딩 여부 창, 저장된 텍스트를 연 메모장 |
| `cg-getting-started-13.webp` | 41 | 18 | 위치 고정 아이콘(압정, 본문 괄호 안) |
| `cg-getting-started-14.webp` | 41 | 19 | 락 아이콘(자물쇠, 본문 괄호 안) |
| `cg-getting-started-15.webp` | 41 | 20 | 열기 아이콘(본문 안) |
| `cg-getting-started-16.webp` | 41 | 21 | 파일 형식 목록을 펼친 Open 창 |
| `cg-getting-started-17.webp` | 42 | 23 | Import Option 창 |
| `cg-getting-started-18.webp` | 42 | 24 | 폰트 경고 창 |
| `cg-getting-started-19.webp` | 43 | 26 | 외부 파일 경로를 지정하는 Open 창 |
| `cg-getting-started-20.webp` | 43 | 27 | 페이지리스트의 `?`와 작업창의 No File 표시(한 객체) |
| `cg-getting-started-21.webp`–`22.webp` | 44 | 29–30 | 디폴트 이미지 폴더 지정 질문 창, 외부 파일 객체 삭제 질문 창 |
| `cg-getting-started-23.webp` | 44 | 31 | NBA 파일 경로 재설정 질문 창 |
| `cg-getting-started-24.webp` | 45 | 33 | Open Folder 창 |
| `cg-getting-started-25.webp` | 45 | 34 | Save as Image 창 |
| `cg-getting-started-26.webp` | 46 | 36 | 작게 불러온 자막 → 변환한 자막(화살표까지 한 객체) |
| `cg-getting-started-27.webp` | 46 | 37 | Convert File Resolution 창 |
| `cg-getting-started-28.webp`–`29.webp` | 46 | 38–39 | Converting File Size 창, Ratio 창 |
| `cg-getting-started-30.webp`–`31.webp` | 47 | 41–42 | 해상도 목록을 펼친 Edit Resolution 창, 다시 시작 안내 창 |
| `cg-getting-started-32.webp` | 47 | 43 | Print 창 |

### [cg/editing 변환 1 (3.1–3.3)](issues/10-cg-editing-1-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 49 -l 64`의 `num` 열이다. 쪽마다 맨 앞의 503×93 객체(머리글 로고)는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-001.webp` | 49 | 1 | 글자 입력 아이콘(본문 안) |
| `cg-editing-002.webp` | 49 | 2 | 두 줄로 입력한 글자 객체와 텍스트커서 |
| `cg-editing-003.webp` | 49 | 3 | Special Character Map 창(Arial) |
| `cg-editing-004.webp` | 50 | 5 | Special Character Map 창(Webdings) |
| `cg-editing-005.webp` | 50 | 6 | 특수문자 선택 창(가로 막대) |
| `cg-editing-006.webp` | 51 | 8 | 한자 선택창 |
| `cg-editing-007.webp` | 52 | 10 | 글자 객체 간 커서 이동 전후 |
| `cg-editing-008.webp` | 52 | 11 | 부분 글자 범위 지정과 속성 변경 전후 |
| `cg-editing-009.webp` | 52 | 12 | Attributes 탭 |
| `cg-editing-010.webp` | 53 | 14 | 문장 정렬 아이콘 셋(제목 옆) |
| `cg-editing-011.webp` | 53 | 15 | 도형 모드 아이콘(본문 괄호 안) |
| `cg-editing-012.webp` | 53 | 16 | 드래그 중인 도형 영역과 생성된 도형 |
| `cg-editing-013.webp` | 53 | 17 | Shape Type 목록 |
| `cg-editing-014.webp`–`021.webp` | 53 | 18–25 | 도형 8개: Box, Framed Box, Circle, Framed Circle, Diamond, Framed Diamond, Rounded Rectangle, Octagon |
| `cg-editing-022.webp` | 54 | 27 | 선택 모드 아이콘(제목 옆) |
| `cg-editing-023.webp` | 54 | 28 | 선택된 객체 |
| `cg-editing-024.webp` | 54 | 29 | 여러 개 선택된 객체 |
| `cg-editing-025.webp`–`027.webp` | 55 | 31–33 | 잘라내기, 복사하기, 붙이기 아이콘(제목 안) |
| `cg-editing-028.webp` | 55 | 34 | 크기 조절 상자 8개 |
| `cg-editing-029.webp` | 55 | 35 | 크기 조절 방향 화살표 |
| `cg-editing-030.webp`–`032.webp` | 56 | 37–39 | 안내선, 정렬선, 선택 객체 기준 정렬 아이콘(목록 안) |
| `cg-editing-033.webp` | 56 | 40 | 정렬 위치 선택 메뉴(표 왼쪽 그림. 사이의 빨간 벡터 화살표를 오른쪽에 그려 넣었다) |
| `cg-editing-034.webp` | 56 | 41 | 가로, 세로, 가로+세로 크기 맞추기 아이콘 |
| `cg-editing-035.webp` | 57 | 43 | 기준객체와 선택된 객체들 |
| `cg-editing-036.webp` | 57 | 44 | 크기 맞추기 결과 셋(위에 아이콘 줄 포함) |
| `cg-editing-037.webp` | 57 | 45 | 객체 순서 맞추기 아이콘 4개 |
| `cg-editing-038.webp` | 57 | 46 | Undo, Redo 아이콘 |
| `cg-editing-039.webp` | 58 | 48 | 빨간색 점선으로 표시된 그룹 객체 |
| `cg-editing-040.webp` | 58 | 49 | 객체 속성 일괄 지정 아이콘(제목 옆) |
| `cg-editing-041.webp` | 58 | 50 | 객체 속성 일괄 지정 아이콘(본문 안) |
| `cg-editing-042.webp` | 59 | 52 | 페이지 리스트 업데이트 아이콘(제목 옆) |
| `cg-editing-043.webp` | 59 | 53 | 객체 위치 고정 아이콘(제목 옆) |
| `cg-editing-044.webp` | 60 | 55 | 회색 선으로 표시된 위치 고정 객체 |
| `cg-editing-045.webp` | 60 | 56 | 객체 락 아이콘(제목 옆) |
| `cg-editing-046.webp` | 60 | 57 | Timeline의 자물쇠 아이콘 |
| `cg-editing-047.webp` | 60 | 58 | 페이지 리스트의 바로가기 메뉴 |
| `cg-editing-048.webp` | 61 | 60 | .nba 파일 삽입 메뉴와 삽입 결과 |
| `cg-editing-049.webp`–`052.webp` | 62 | 62–65 | 첫·이전·다음·마지막 페이지로 이동 아이콘 |
| `cg-editing-053.webp` | 62 | 66 | Go to Page 창 |
| `cg-editing-054.webp` | 62 | 67 | Find 창 |
| `cg-editing-055.webp` | 63 | 69 | Replace 창 |
| `cg-editing-056.webp` | 63 | 70 | 위치 고정 아이콘(본문 괄호 안) |
| `cg-editing-057.webp` | 63 | 71 | 락 아이콘(본문 괄호 안) |
| `cg-editing-058.webp` | 63 | 72 | 흰색 점선으로 표시된 위치고정된객체 |
| `cg-editing-059.webp` | 64 | 74 | 위치 고정 아이콘(표 칸 안) |
| `cg-editing-060.webp` | 64 | 75 | 락 아이콘(표 칸 안) |
| `cg-editing-061.webp` | 64 | 76 | 페이지 템플릿 일괄지정 전후의 Page List |
| `cg-editing-062.webp` | 64 | 77 | 페이지 템플릿 일괄지정 전후의 페이지 |

### [cg/editing 변환 2 (3.4–3.5)](issues/11-cg-editing-2-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 10과 같은 `pdfimages -list -f 49 -l 100`의 `num` 열이다(`-f`를 바꾸면 번호가 0부터 다시 시작한다). 쪽마다 맨 앞의 503×93 머리글 로고는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-063.webp` | 65 | 79 | Style Catalog 창 |
| `cg-editing-064.webp` | 67 | 82 | Style Catalog의 New 메뉴와 새로 생긴 New Style Catalog |
| `cg-editing-065.webp` | 67 | 83 | STYLES 폴더의 다른 이름으로 저장 창 |
| `cg-editing-066.webp` | 67 | 84 | Style 위의 마우스 오른쪽 버튼 메뉴 |
| `cg-editing-067.webp` | 68 | 86 | 보기 메뉴 |
| `cg-editing-068.webp` | 69 | 88 | Safe Area, Horizontal Center, Vertical Center, SD Area 안내선 |
| `cg-editing-069.webp` | 69 | 89 | 격자점 |
| `cg-editing-070.webp` | 69 | 90 | 눈금자의 정렬선 포인트와 녹색 정렬 영역 |
| `cg-editing-071.webp` | 70 | 92 | Snap, Snap To 메뉴 |
| `cg-editing-072.webp` | 70 | 93 | 포인터 8개가 나타난 안내선 |
| `cg-editing-073.webp` | 71 | 95 | 송출 미리보기 아이콘(제목 안) |
| `cg-editing-074.webp` | 71 | 96 | Preview Window |
| `cg-editing-075.webp` | 71 | 97 | NABI 화면 위의 Preview Window |
| `cg-editing-076.webp` | 71 | 98 | 페이지 리스트 윈도우 아이콘(제목 안) |
| `cg-editing-077.webp` | 72 | 100 | Page List Window |
| `cg-editing-078.webp` | 72 | 101 | 오디오 타임라인 윈도우 아이콘(제목 안) |
| `cg-editing-079.webp` | 73 | 103 | Audio Timeline Window(A–G 표시) |
| `cg-editing-080.webp` | 73 | 104 | 분홍색 테두리의 PGM 페이지와 하늘색 테두리의 NEXT 페이지 |
| `cg-editing-081.webp` | 74 | 106 | Playback의 NEXT, PGM 페이지 |
| `cg-editing-082.webp` | 74 | 107 | 오디오파일 설정 및 플레이 영역 |
| `cg-editing-083.webp`–`084.webp` | 74 | 108–109 | Play, Stop 버튼 |
| `cg-editing-085.webp` | 74 | 110 | PlayHead 맨 앞으로 이동 버튼 |
| `cg-editing-086.webp` | 74 | 111 | CG 버튼 |
| `cg-editing-087.webp` | 74 | 112 | 재생 시간 표시 |
| `cg-editing-088.webp` | 74 | 113 | File 버튼 |
| `cg-editing-089.webp` | 74 | 114 | 볼륨 조절 막대 |
| `cg-editing-090.webp` | 75 | 116 | Nabi Audio Files(\*.nba) 형식의 Save 창 |
| `cg-editing-091.webp` | 76 | 118 | 오디오 파일이 존재하지 않는다는 경고 메시지 |
| `cg-editing-092.webp` | 76 | 119 | .nba 파일 삽입 메뉴와 삽입 결과 |
| `cg-editing-093.webp` | 76 | 120 | X표시된 nba 프로젝트 파일 페이지 |
| `cg-editing-094.webp` | 77 | 122 | 편집 창의 NoNBAFile, NoAudioFile 표시 |
| `cg-editing-095.webp` | 77 | 123 | 작업용 프리뷰 모니터 메뉴 |

### [cg/editing 변환 3 (3.6)](issues/12-cg-editing-3-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 10과 같은 `pdfimages -list -f 49 -l 100`의 `num` 열이다. 쪽마다 맨 앞의 503×93 머리글 로고는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-096.webp` | 78 | 125 | 삽입 메뉴 |
| `cg-editing-097.webp` | 79 | 127 | Text Import Manager 창 |
| `cg-editing-098.webp` | 79 | 128 | 가로, 세로 포인트로 설정한 기준 영역 |
| `cg-editing-099.webp` | 79 | 129 | 페이지 리스트 업데이트 아이콘(본문 괄호 안) |
| `cg-editing-100.webp` | 80 | 131 | 페이지 넘김 설정 목록과 적용 버튼 |
| `cg-editing-101.webp` | 80 | 132 | 템플릿 목록과 편집 화면 템플릿 버튼 |
| `cg-editing-102.webp`–`103.webp` | 80 | 133–134 | `Use "//" as Page delimiter…` 체크 해제, 체크(표 칸 안) |
| `cg-editing-104.webp` | 80 | 135 | 글자 정렬 속성 아이콘 셋(본문 안) |
| `cg-editing-105.webp` | 81 | 137 | 첫 줄에 `<<`를 쓴 텍스트 파일(메모장) |
| `cg-editing-106.webp` | 81 | 138 | 왼쪽 정렬로 삽입된 텍스트 |
| `cg-editing-107.webp` | 81 | 139 | 첫 줄에 `&&`를 쓴 텍스트 파일(메모장) |
| `cg-editing-108.webp` | 81 | 140 | 영화자막 정렬로 삽입된 텍스트 |
| `cg-editing-109.webp` | 82 | 142 | 메모장에서 일본어 텍스트 복사 |
| `cg-editing-110.webp` | 82 | 143 | 작업창의 마우스 오른쪽 버튼 메뉴 |
| `cg-editing-111.webp` | 82 | 144 | 네모 박스로 보이는 일본어 텍스트 |
| `cg-editing-112.webp` | 82 | 145 | 정상적으로 보이는 일본어 텍스트 |
| `cg-editing-113.webp` | 83 | 147 | Slide Size 창 |
| `cg-editing-114.webp` | 83 | 148 | Exporting Slide Images 창 |
| `cg-editing-115.webp` | 83 | 149 | 이미지 시퀀스 Open 창 |
| `cg-editing-116.webp` | 84 | 151 | 이미지 아이콘(제목 안) |
| `cg-editing-117.webp` | 84 | 152 | 애니메이션 아이콘(제목 안) |
| `cg-editing-118.webp` | 84 | 153 | TAD 애니메이션 파일 만들기 확인 창 |
| `cg-editing-119.webp` | 85 | 155 | Creating a TAD file 창 |
| `cg-editing-120.webp` | 85 | 156 | tad 파일의 Attributes |
| `cg-editing-121.webp` | 85 | 157 | 비디오 파일의 Attributes |
| `cg-editing-122.webp` | 86 | 159 | Video Preview 아이콘(㉤ 옆) |
| `cg-editing-123.webp` | 86 | 160 | Video Preview 창과 Attributes |
| `cg-editing-124.webp` | 86 | 161 | Rewind 아이콘(목록 안) |
| `cg-editing-125.webp` | 86 | 162 | Start/End Time 포인터 아이콘(본문 괄호 안) |
| `cg-editing-126.webp` | 86 | 163 | Mark 구간이 지정된 Video Preview |
| `cg-editing-127.webp` | 87 | 165 | 배경 이미지 아이콘(제목 안) |
| `cg-editing-128.webp` | 87 | 166 | 배경이미지 삭제 아이콘(본문 안) |
| `cg-editing-129.webp` | 87 | 167 | 배경 애니메이션 아이콘(제목 안) |
| `cg-editing-130.webp` | 87 | 168 | 배경애니메이션 삭제 아이콘(본문 안) |
| `cg-editing-131.webp` | 87 | 169 | Clock/Timer 창 |
| `cg-editing-132.webp` | 88 | 171 | Clock의 Attributes |
| `cg-editing-133.webp` | 88 | 172 | Clock Format 목록(목록 안) |
| `cg-editing-134.webp` | 88 | 173 | Timer의 Attributes |
| `cg-editing-135.webp` | 88 | 174 | Timer Format 목록(목록 안) |
| `cg-editing-136.webp` | 89 | 176 | Distribute Objects 창 |

### [cg/editing 변환 4 (3.7–3.8)](issues/13-cg-editing-4-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 10과 같은 `pdfimages -list -f 49 -l 100`의 `num` 열이다. 쪽마다 맨 앞의 503×93 머리글 로고는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-137.webp` | 89 | 177 | 스케줄 송출 아이콘(제목 안) |
| `cg-editing-138.webp` | 89 | 178 | Schedule Item 창 |
| `cg-editing-139.webp` | 90 | 180 | 2번 모니터의 Prompter 화면과 Prompter 설정 창(마스크 181이 딸림) |
| `cg-editing-140.webp` | 91 | 183 | Prompter 설정 창 |
| `cg-editing-141.webp` | 91 | 184 | Decklink Capture 창 |
| `cg-editing-142.webp` | 92 | 186 | Options 창의 Editor 탭 |
| `cg-editing-143.webp` | 93 | 188 | Safe Area, Horizontal Center, Vertical Center, SD Area 안내기준선 |
| `cg-editing-144.webp` | 93 | 189 | 격자점 |
| `cg-editing-145.webp` | 93 | 190 | Background Pattern 6가지 |
| `cg-editing-146.webp` | 94 | 192 | Options 창의 General 탭 |
| `cg-editing-147.webp` | 95 | 194 | Word Wrap을 끈 텍스트 |
| `cg-editing-148.webp` | 95 | 195 | Word Wrap을 켠 텍스트 |
| `cg-editing-149.webp` | 96 | 197 | Folder List와 Style Catalog |
| `cg-editing-150.webp` | 96 | 198 | URL 아이콘(제목 안) |
| `cg-editing-151.webp` | 96 | 199 | Display layer TopDown 체크와 해제에 따른 Timeline 레이어 순서 |
| `cg-editing-152.webp` | 97 | 201 | 작업창 뷰가 셋으로 나누어진 Multi View |
| `cg-editing-153.webp` | 97 | 202 | Options 창의 Playback 탭 |
| `cg-editing-154.webp` | 98 | 204 | PowerPoint 슬라이드 쇼 리본의 프레젠테이션에 사용할 모니터 |
| `cg-editing-155.webp` | 99 | 206 | 창 메뉴 |
| `cg-editing-156.webp` | 99 | 207 | Custom Layout 메뉴 |
| `cg-editing-157.webp` | 100 | 209 | 도킹 가이드 마커와 하늘색으로 표시된 이동할 위치 |

### [cg/attributes 변환](issues/14-cg-attributes-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 101 -l 121`의 `num` 열이다. 쪽마다 있는 머리글 이미지(503×93, 0·4·9·14·…·103번)는 뺐다. 4.5.2·4.5.3의 S·G 버튼, 4.5.4·4.5.5 제목 옆 아이콘, 4.5.3.2의 그러데이션 종류 버튼은 인라인 아이콘이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-attributes-01.webp`–`03.webp` | 101 | 1–3 | Face·Edge·Shadow 색상 칸, Face Soft 0/20, Edge 설정 화면 |
| `cg-attributes-04.webp`–`07.webp` | 102 | 5–8 | Edge Size 5/15, Edge Size·Soft 10/0·10/30, Shadow 설정 화면, Shadow Depth 20/80 |
| `cg-attributes-08.webp`–`11.webp` | 103 | 10–13 | Shadow Soft 0/20, Shadow 방향 -45/31, Shadow Blending 비교, 글자 객체 Attributes 탭 |
| `cg-attributes-12.webp`–`14.webp` | 104 | 15–17 | Font 목록, Bold, Italic |
| `cg-attributes-15.webp`–`18.webp` | 105 | 19–22 | Outline·Thickness, Space 100%, Space 400%, Thickness 0/3 |
| `cg-attributes-19.webp`–`22.webp` | 106 | 24–27 | Leading, Kerning, Rotate, C-Rotate |
| `cg-attributes-23.webp`–`26.webp` | 107 | 29–32 | 텍스트 정렬 셋, Exclude 전후, Timeline의 Exclude 표시, Char Unit |
| `cg-attributes-27.webp`–`28.webp` | 108 | 34–35 | 바닥에 비치는 효과 예, Flip Vert/Horz |
| `cg-attributes-29.webp` | 108 | 36 | Text Link 적용 전후 |
| `cg-attributes-30.webp` | 108 | 37 | 취소선이 그어진 Text Link 파일명 칸(242×22) |
| `cg-attributes-31.webp` | 109 | 39 | 도형을 끌어 그리는 중과 그린 뒤 |
| `cg-attributes-32.webp`–`39.webp` | 109 | 40–47 | Shape Type 8개: Box, Framed Box, Circle, Framed Circle, Diamond, Framed Diamond, Rounded Rectangle, Octagon |
| `cg-attributes-40.webp`–`45.webp` | 110 | 49–54 | Frame/Control Point, 프레임 추가 메뉴, 프레임 제거 메뉴, 제거한 도형(126×182), 링크 메뉴, 링크로 묶인 포인트 |
| `cg-attributes-46.webp`–`49.webp` | 111 | 56–59 | 링크 곡선 만드는 중, 곡선 도형, 도형 Rotate 0/10, Pen Size 10/25 |
| `cg-attributes-50.webp`–`52.webp` | 112 | 61–63 | Arc Height, Arc Width, 이미지 객체 Attributes 탭 |
| `cg-attributes-53.webp`–`55.webp` | 113 | 65–67 | 이미지 파일 경로 칸(285×24), Use Alpha, Invert Alpha |
| `cg-attributes-56.webp`–`59.webp` | 114 | 69–72 | Photoshop 이미지, Background 더블클릭, New Layer 창, Layer 0 |
| `cg-attributes-60.webp`–`62.webp` | 115 | 74–76 | Magic Wand Tool 메뉴, 여백을 지운 이미지, TIFF Options 창 |
| `cg-attributes-63.webp`–`65.webp` | 116 | 78–80 | 파일 크기 알림 창, Create New Channel, Marquee Tool 메뉴 |
| `cg-attributes-66.webp`–`68.webp` | 117 | 82–84 | Fill 창, 흰색으로 채운 Alpha 채널, Targa Options 창 |
| `cg-attributes-69.webp`–`71.webp` | 118 | 86–88 | Change Color S·G·T, Color Mix, Black_White |
| `cg-attributes-72.webp` | 119 | 90 | Color 창 |
| `cg-attributes-73.webp`–`74.webp` | 119 | 91–92 | S 버튼, G 버튼 아이콘(23×20) |
| `cg-attributes-75.webp` | 119 | 93 | Gradation 설정 바와 Color 미리보기 |
| `cg-attributes-76.webp`–`81.webp` | 120 | 95–100 | 기본 설정 Bar, 클릭할 지점, 포인트가 생긴 Bar, 색상 변경, 포인트 삭제, Click·Drag 방향 |
| `cg-attributes-82.webp` | 120 | 101 | 그러데이션 종류 버튼 넷(99×18, 소제목 옆) |
| `cg-attributes-83.webp` | 120 | 102 | 선형·원형·다이아몬드·방추형 그러데이션 |
| `cg-attributes-84.webp` | 121 | 104 | T 버튼 아이콘(23×20, 제목 옆) |
| `cg-attributes-85.webp`–`86.webp` | 121 | 105–106 | Texture Mapping 경로·미리보기, Fit 선택/해제 |
| `cg-attributes-87.webp` | 121 | 107 | 스포이트 버튼 아이콘(30×30, 제목 옆) |
| `cg-attributes-88.webp` | 121 | 108 | A 값을 조정하는 Color 창 |

### [cg/effects 변환](issues/15-cg-effects-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 122 -l 131`의 `num` 열이다. 머리글 로고(0, 3, 5, 8, 17, 20, 26, 30, 34, 38)는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-effects-01.webp` | 122 | 1 | Effects 창 |
| `cg-effects-02.webp` | 122 | 2 | ①–⑤ 번호를 붙인 Effects 창 |
| `cg-effects-03.webp` | 123 | 4 | In Effects·Out Effects가 지정된 Timeline |
| `cg-effects-04.webp` | 124 | 6 | Layer 오른쪽 버튼 편집메뉴 |
| `cg-effects-05.webp` | 124 | 7 | 객체 종류별 레이어 |
| `cg-effects-06.webp`–`12.webp` | 125 | 9–15 | 레이어 아이콘 7개(View, Disable, Mask, Mask 영향, In Pause, Out Pause, Exclude). 목록 줄 앞 인라인 |
| `cg-effects-13.webp` | 125 | 16 | 오디오 파일 삽입/변경·삭제 메뉴 |
| `cg-effects-14.webp` | 126 | 18 | In/Out Effects가 지정된 Timeline(Effect Reset) |
| `cg-effects-15.webp` | 126 | 19 | Timeline의 Reset Effects 메뉴 |
| `cg-effects-16.webp` | 127 | 21 | Timeline 오른쪽 아래 Zoom 버튼 |
| `cg-effects-17.webp`–`20.webp` | 127 | 22–25 | Zoom 버튼 아이콘 4개(확대, 축소, 기본 길이, 전체길이). 표 `구분` 칸 |
| `cg-effects-21.webp` | 128 | 27 | Wipe 효과 샘플 |
| `cg-effects-22.webp` | 128 | 28 | Organic 효과 샘플 |
| `cg-effects-23.webp` | 128 | 29 | Move 효과 샘플 |
| `cg-effects-24.webp` | 129 | 31 | Scale 효과 샘플 |
| `cg-effects-25.webp` | 129 | 32 | Curl 효과 샘플과 옵션 |
| `cg-effects-26.webp` | 129 | 33 | Tile 효과 샘플과 옵션 |
| `cg-effects-27.webp` | 130 | 35 | Tile·Random·Radial 효과 예(한 객체에 셋) |
| `cg-effects-28.webp` | 130 | 36 | Banner 효과 샘플 |
| `cg-effects-29.webp` | 130 | 37 | Text 효과 Typing 샘플 |
| `cg-effects-30.webp` | 131 | 39 | Blink 효과와 Count 옵션 |
| `cg-effects-31.webp` | 131 | 40 | Mask 효과 예 |
| `cg-effects-32.webp`–`33.webp` | 131 | 41–42 | Mask, Mask 영향 아이콘. 목록 줄 앞 인라인 |

### [cg/playout 변환](issues/16-cg-playout-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 131 -l 136`의 `num` 열이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-playout-01.webp` | 132 | 6 | Playback 송출 제어 창 |
| `cg-playout-02.webp` | 132 | 7 | Run Setting 창 |
| `cg-playout-03.webp` | 133 | 9 | Stamp Playback 창 |
| `cg-playout-04.webp` | 133 | 10 | Pause 아이콘(인라인) |
| `cg-playout-05.webp` | 133 | 11 | Refresh 아이콘(인라인) |
| `cg-playout-06.webp` | 134 | 13 | Global Animation Playback 창 |
| `cg-playout-07.webp` | 134 | 14 | 파일설정 `...` 버튼(인라인) |
| `cg-playout-08.webp` | 134 | 15 | Seek 버튼(인라인) |
| `cg-playout-09.webp` | 134 | 16 | OnAir 버튼(인라인) |
| `cg-playout-10.webp` | 134 | 17 | Pause 아이콘(인라인. 04와 같은 그림) |
| `cg-playout-11.webp` | 134 | 18 | Rewind 아이콘(인라인) |
| `cg-playout-12.webp` | 134 | 19 | 위아래 화살표 포인터(인라인) |
| `cg-playout-13.webp` | 135 | 21 | Mark 구간의 Start Time, End Time, Duration |
| `cg-playout-14.webp` | 135 | 22 | Take In, Take Out 아이콘 두 개가 한 객체(인라인) |
| `cg-playout-15.webp` | 135 | 23 | Preview In, Preview Out 아이콘 두 개가 한 객체(인라인) |

### [cg/shortcuts 변환](issues/17-cg-shortcuts-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 136 -l 140`의 `num` 열이다. 쪽마다 나오는 머리글 `NABI-CG` 이미지(0, 9, 15, 20, 26, object 160)는 옮기지 않는다. 140쪽은 `pdfimages` 순서와 표 순서가 달라 페이지에 나오는 순서로 번호를 매겼다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-shortcuts-01.webp`–`03.webp` | 136 | 1–3 | 7.1 새로 만들기, 열기, 저장 아이콘 |
| `cg-shortcuts-04.webp`–`08.webp` | 136 | 4–8 | 7.2 작업취소, 다시실행, 잘라내기, 복사, 붙여넣기 아이콘 |
| `cg-shortcuts-09.webp`–`13.webp` | 137 | 10–14 | 7.2 객체속성일괄지정, 객체 위치 고정, 글자 입력모드, 도형 입력모드, 객체 선택 모드 아이콘 |
| `cg-shortcuts-14.webp`–`17.webp` | 138 | 16–19 | 7.3 텍스트로 보기, 송출 미리보기, 페이지 리스트 윈도우, 오디오 타임라인 윈도우 아이콘 |
| `cg-shortcuts-18.webp`–`21.webp` | 139 | 21–24 | 7.4 이미지, 배경이미지, 애니메이션, 배경애니메이션 아이콘 |
| `cg-shortcuts-22.webp` | 139 | 25 | 7.5 Take In 아이콘. 이미지 객체(57×32)에는 아이콘 두 개가 붙어 있고 페이지에는 왼쪽 재생 삼각형만 보인다. 왼쪽만 잘라야 한다 |
| `cg-shortcuts-23.webp` | 140 | 32 | 7.5 스케줄 송출 아이콘 |
| `cg-shortcuts-24.webp`–`28.webp` | 140 | 27–31 | 7.7 옵션, 교회DB, 타임라인 보기 On/Off, 오디오 타임라인 볼륨 보기 On/Off, 지정 웹사이트 바로가기 아이콘 |

### [db 변환](issues/18-db-conversion.md)

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 143 -l 153`의 `num` 열이다. 쪽마다 나오는 머리글 `교회DB` 이미지(객체 852)는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `db-getting-started-01.webp` | 143 | 1 | 교회DB 아이콘(1.1 제목 안) |
| `db-getting-started-02.webp` | 143 | 2 | 교회DB 아이콘(1.1 본문 안) |
| `db-getting-started-03.webp` | 143 | 3 | 교회DB 검색 창과 Select·Search·Enter 순서 표시 |
| `db-search-01.webp` | 145 | 6 | 찬송가 탭 제목 검색 결과 |
| `db-search-02.webp` | 146 | 8 | DB 편집 상태의 검색 결과 수정 화면 |
| `db-templates-01.webp` | 147 | 10 | Template Catalog 창과 ①–③ 표시 |
| `db-templates-02.webp` | 148 | 12 | 편집 메뉴의 템플릿 썸네일 새로만들기 |
| `db-templates-03.webp` | 149 | 14 | 객체 오른쪽 메뉴의 Alias 지정 |
| `db-templates-04.webp` | 149 | 15 | Enter Alias 창 |
| `db-templates-05.webp` | 149 | 16 | 성경 DB 텍스트의 제목줄·내용 표시 예 |
| `db-options-01.webp` | 151 | 19 | 옵션 영역 |
| `db-options-02.webp` | 151 | 20 | 가로정렬 목록 |
| `db-options-03.webp` | 152 | 22 | 작업창의 녹색 정렬선 영역 |
| `db-options-04.webp` | 152 | 23 | 성경 검색 결과의 Line 1, Line2 표시 |
| `db-options-05.webp` | 152 | 24 | Lines 2로 둔 옵션 영역 |
| `db-options-06.webp` | 153 | 26 | Word Wrap 미사용 송출 화면 |
| `db-options-07.webp` | 153 | 27 | Word Wrap 사용 송출 화면 |
