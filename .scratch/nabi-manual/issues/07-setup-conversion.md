# setup 변환

Type: task
Status: resolved
Blocked by: 05, 06

## Question

Chapter 1 `Setting & Control` 전체(PDF 12, 14–27)를 옮긴다. 이 지도의 시범 변환 티켓이다.

- `/docs/nabi` 첫 페이지와 `/docs/nabi/setup` Chapter 첫 페이지를 만든다
- `hd200-install`(PDF 14), `cg-board`(15–17), `software-install`(18–25), `troubleshooting`(25–27) 네 페이지를 옮긴다. PDF 25는 `3.6.` 끝과 `4.` 시작이 나눠 쓴다
- 해 보고 map의 Not yet specified 두 항목을 정한다: 확인 필요·이미지 목록을 모으는 방식, 오탈자 수정 기록을 어디에 둘지. 정한 것을 `## Answer`에 적고 map을 고친다

변환 규칙은 [map.md](../map.md)의 Notes와 [03 페이지 목록과 slug](03-page-list-and-slugs.md)의 Answer를 따른다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- 절 페이지 넷: `setup/hd200-install`, `setup/cg-board`, `setup/software-install`, `setup/troubleshooting`.
- 첫 페이지: `/docs/nabi`(`app/docs/nabi/page.mdx`, 05의 `page.tsx`를 바꿨다)와 Chapter 첫 페이지 **셋 모두**(`setup`, `cg`, `db`의 `page.mdx`). 아래 "03과 05 맞추기"가 이유다.
- 샘플 `app/docs/nabi/setup/sample/`을 지웠다.
- 개발 서버에서 여섯 페이지가 렌더되고 사이드바에 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본과 MDX를 공백·서식 기호를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 셋과 글머리표뿐인 것을 확인했다.

### 03과 05 맞추기

03은 `/docs/nabi`와 Chapter 첫 페이지에도 frontmatter를 두고 목록을 거기서 만든다고 했고, 05의 `pages.ts`는 `<chapter>/<절>/page.mdx`만 읽었다. 03의 의도(목록을 손으로 쓰지 않는다)를 따라 `pages.ts`를 넓혔다.

- `loadNav()`가 `<chapter>/page.mdx`도 읽는다. Chapter 첫 페이지는 다섯 키를 모두 갖고 `slug`와 `chapter`가 둘 다 폴더 이름이다(`slug: cg`, `chapter: cg`).
- **사이드바의 Chapter 이름과 순서는 Chapter 첫 페이지의 `title`·`order`다.** 05가 `pages.ts`에 손으로 둔 Chapter 이름(`Setting & Control` 등)을 지웠다. 남은 `CHAPTER_KEYS`는 폴더 이름 오타만 막는다. Chapter 이름은 사이드바에서 그 첫 페이지로 가는 링크다.
- Chapter `title`은 표지 제목에서 `ChapterN.`만 뺀 것이다: `Setting & Control (천하통일HD200/HD200K)`, `NABI-CG (Version 2.5)`, `교회DB Version 4.0`. 03이 첫 페이지 목록에 버전을 보이라고 했으므로 버전까지 넣는다. H1은 표지 그대로(`# Chapter2. NABI-CG (Version 2.5)`)다.
- 빌드가 새로 멈추는 경우: 절은 있는데 그 Chapter 첫 페이지가 없을 때, Chapter 첫 페이지끼리 `order`가 겹칠 때, Chapter 첫 페이지의 `slug`가 폴더와 다를 때. 절이 없는 Chapter도 첫 페이지가 있으면 사이드바에 나온다.
- **Chapter 첫 페이지 셋을 07이 모두 만들었다.** 03은 "그 Chapter의 첫 변환 티켓이 만든다"고 했지만, cg 티켓 08–17은 병렬로 돌아 누가 먼저 끝날지 모른다. 첫 페이지가 없으면 빌드가 멈추므로 미리 만들어 둔다. 표지 글(PDF 28, 141)은 한 줄씩이라 07에서 옮겼다. 08·18 본문에서 첫 페이지 만들기를 지웠다.
- `/docs/nabi/page.mdx`는 `title`, `description`, `slug: nabi`만 두고 `chapter`·`order`가 없다. 목록에 들지 않으므로 `pages.ts`가 읽지 않는다. 레이아웃의 title template은 같은 segment에 적용되지 않아 `<title>`은 `NABI 매뉴얼`이다.
- 두 첫 페이지의 목록은 `app/docs/nabi/_components/page-links.tsx`의 `ChapterLinks`·`SectionLinks`가 `loadNav()`로 만든다. 첫 페이지 MDX가 상대 경로로 import한다. 절 페이지는 import할 일이 없다.

### 정한 변환 방식 (08–18이 따른다. map Notes에도 옮겼다)

- **글머리표** — 원문의 `.`, `·`, `-` 글머리표는 마크다운 목록 `- `로 바꾼다. 표를 마크다운 표로 바꾸는 것과 같은 서식 변환이다. `①.`, `1.` 같은 번호는 글자로 둔다.
- **강제 줄바꿈** — 오른쪽 끝까지 차지 않고 끊긴 줄(문장 끝 뒤 새 줄, 목록 안 아래 줄)은 줄 끝 `\`로 hard break를 둔다. 끝까지 찬 줄은 자동 줄바꿈이니 잇는다.
- **목차에 없는 번호 소제목** — `4. 이상증상 대처법`의 `1. 송출 자막이 떨리는 경우`처럼 번호 체계 밖 소제목은 굵은 글씨 문단이다. 원문이 굵게 쓴 `①. HD-SDI 연결` 같은 말머리도 굵은 글씨로 둔다.
- **파일 이름** — 확장자가 있는 파일 이름은 인라인 코드다(`` `DesktopVideo.msi` ``). 폴더 이름은 글자 그대로 둔다.
- **이미지** — PDF 이미지 객체 하나가 자리표시자 하나다. 격자로 늘어선 스크린샷도 하나씩 둔다(`pdfimages`로 뽑으면 바로 파일이 된다). 번호는 페이지 안 나오는 순서다. alt는 그림이 무엇인지 짧게 쓴다.
- **인라인 아이콘** — 원문 자리에 이미지 마크다운을 그대로 둔다. 제목 안이면 제목 안에 둔다. 이때 앵커 끝에 `-`가 붙는다(`333-cpx-dl-controller-`). 앵커는 링크 대상이 아니라 그대로 둔다.
- **링크** — 원문의 URL(`www.compix.co.kr`)은 `[www.compix.co.kr](http://www.compix.co.kr)`처럼 명시 링크로 쓴다. GFM 자동 링크는 `)나`처럼 붙은 글자까지 링크로 먹는다.
- **목록 모으기(map Not yet specified 두 항목)** — 각 변환 티켓의 `## Answer`에 `### 확인 필요`, `### 이미지`, `### 고친 오탈자` 표 셋을 둔다. 한 파일로 모으면 병렬 세션이 같은 파일을 고쳐 충돌한다. 확인 필요와 이미지는 MDX의 `{/* 확인 필요: … */}`와 `/docs/nabi/images/` 경로가 원천이라 `grep`으로 다시 뽑을 수 있다. 오탈자는 MDX에 표시를 남기지 않고 Answer 표가 유일한 기록이다.
- **오탈자로 볼 것** — 한 번 나온 철자 실수만 고친다(`Patten`, `문자발생기기`). 두 번 똑같이 나오거나 이름일 수 있는 것(`UCA`, `Contro S/W`)은 고치지 않고 확인 필요로 둔다. 띄어쓰기와 문장 끝 마침표 누락은 고치지 않는다.

### 확인 필요

| 페이지 | PDF | 내용 |
| - | - | - |
| `software-install` 3.1.1 | 18 | "V10.0.2이후 부터는 아래와 같이 보일 수도 있다" 뒤에 가리키는 그림이 원문에 없다(이미지 객체도 없다) |
| `software-install` 3.3.1 | 19 | `UCA`가 두 번 나온다. Windows 기능 이름은 UAC다. 원문대로 뒀다 |
| `software-install` 3.3.2 | 21 | `Contro S/W폴더`가 `Control S/W`의 오타인지 설치 CD 폴더 이름으로 확인한다 |

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 14 -l 27`의 `num` 열이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `setup-cg-board-01.png` | 15 | 0 | 천하통일HD200 보드와 Bypass B/D 연결도 |
| `setup-cg-board-02.png` | 16 | 1 | 천하통일HD200K 스위처 연결도 |
| `setup-cg-board-03.png` | 17 | 2 | 천하통일HD200K Overlay 연결도 |
| `setup-software-install-01.png` | 18 | 3 | 장치관리자의 Blackmagic 장치 목록 |
| `setup-software-install-02.png` | 19 | 4 | 장치관리자의 SafeNet 장치 목록 |
| `setup-software-install-03.png` | 19 | 5 | 사용자 계정 컨트롤 경고 창 |
| `setup-software-install-04.png`–`07.png` | 20 | 6–9 | 제어판, 사용자 계정 및 가족 보호, 사용자 계정 변경, 사용자 계정 컨트롤 설정 |
| `setup-software-install-08.png`–`13.png` | 21 | 10–15 | CPX-DL Utilities 설치 창 6개(왼→오, 위→아래) |
| `setup-software-install-14.png` | 22 | 16 | CPX-DL Controller 아이콘(제목 옆 48px) |
| `setup-software-install-15.png` | 22 | 17 | CPX-DL Controller 창 |
| `setup-software-install-16.png`–`18.png` | 22 | 18–20 | Output Display Format, Connection Input, Connection Output 목록 |
| `setup-software-install-19.png` | 23 | 21 | Test Pattern 목록 |
| `setup-software-install-20.png`–`23.png` | 23 | 22–25 | NABI 2.0 설치 창 4개(왼→오, 위→아래) |
| `setup-software-install-24.png` | 24 | 26 | NABI-CG 실행 화면 |
| `setup-software-install-25.png` | 24 | 27 | Download VLC Player 창 |
| `setup-software-install-26.png` | 25 | 28 | Edit Resolution 창 |
| `setup-troubleshooting-01.png` | 25 | 29 | CMOS의 PCI Express bandwidth 설정 줄. 26쪽 BIOS 화면과 같은 객체를 잘라 보인 것이라 직접 잘라야 한다 |
| `setup-troubleshooting-02.png` | 26 | 30 | ASUS UEFI BIOS Utility 화면 |
| `setup-troubleshooting-03.png` | 26 | 31 | 작업창 중앙의 빨간색 십자선 |
| `setup-troubleshooting-04.png` | 27 | 32 | Output Display Format 목록 |

`hd200-install`에는 이미지가 없다.

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `cg-board` 2.1 | 15 | `‘천하통일 HD200/200K‘는` | 닫는 따옴표 `’` |
| `cg-board` 2.1.1 | 15 | `문자발생기기 보드를` | `문자발생기 보드를` |
| `software-install` 3.3.3 | 23 | `Test Patten :` | `Test Pattern :`(바로 위 스크린샷 글자가 `Test Pattern`) |
