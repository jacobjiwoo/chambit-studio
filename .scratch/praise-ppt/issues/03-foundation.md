# 03: 토대 — 도메인 로직, 라우트 골격, 상태 연결

Status: resolved
Blocked by: 없음 — 바로 시작할 수 있다

## 무엇을 만드나

`/tools/praise-ppt`가 열리고, **셋리스트**·**곡 목록**·**올린 곡**·공통 배경 상태가 한곳에 이어진 골격을 만든다. 화면 구역은 빈 컴포넌트로 두고 props를 확정한다. 05–10이 이 골격 위에서 **서로 같은 파일을 건드리지 않고 병렬로** 돈다. 그래서 이 티켓의 핵심 산출물은 동작보다 **경계**다.

근거와 세부 동작은 [spec](../spec.md)의 Implementation Decisions(자리, 데이터 모델, 셋리스트 상태, 생성 계획, 의존성)에 있다. 원본은 `/Users/jiwoo/dev/projects/praise-ppt`에 있고 읽기만 한다. 커밋 메시지에 원래 저장소를 적는다.

### 도메인 `_lib` (React 없음, 테스트 있음)

- 타입: 곡(곡 목록의 곡, 올린 곡), 슬라이드(번호 + 이미지 주소), 배경, 셋리스트 항목.
- 이미지 도메인 상수 한 곳, 곡 목록 곡의 슬라이드 목록을 R2 주소 규칙으로 다시 만드는 함수.
- 색 프리셋 8개, 공통 배경 기본값(흰색), 배경 이름 정하기(프리셋 이름 / `#RRGGBB` / "업로드 이미지").
- 셋리스트 조작과 직렬화 — seam 2. spec의 "셋리스트 상태"와 Testing Decisions 2번을 전부 덮는다.
- 생성 계획 — seam 3. spec의 "생성 계획"과 Testing Decisions 3번을 전부 덮는다.

### 라우트와 상태 (React)

- 의존성을 더한다: `pptxgenjs`, `@dnd-kit/core`·`sortable`·`modifiers`·`utilities`. 05–10은 `package.json`을 고치지 않는다.
- 페이지와 루트 클라이언트 컴포넌트. 루트가 갖는 상태:
  - 셋리스트 훅(localStorage 키 `praise-ppt:setlist`, 쓰기 실패는 조용히 넘김)
  - 곡 목록 불러오기: 페이지가 열린 뒤 `/praise-ppt/songs.json`(정적 파일, [04](04-song-list-json.md)가 만든다)을 받는다. 상태는 불러오는 중·성공·실패다. 불러온 뒤 곡 목록에 없는 `songId >= 0` 항목을 셋리스트에서 뺀다
  - 올린 곡 목록(메모리, id는 -1부터 하나씩 줄여 배정)과 id로 곡을 찾는 함수(곡 목록 + 올린 곡)
  - 공통 배경(저장하지 않음)
  - 열린 서랍: 없음 / 슬라이드 편집(곡) / 배경(공통 또는 곡). 한 번에 하나만 열린다
  - 생성 계획 길이("총 N장")
- 곡 목록 JSON 모양은 `[{ "id": number, "title": string, "slideCount": number }]`, 곡 목록 순서 그대로다. 04가 이 모양으로 쓴다.

### 빈 컴포넌트와 props

아래 일곱 구역을 각각 별도 파일의 빈 컴포넌트로 만들고 루트에서 렌더한다. 각 구역의 props는 그 티켓이 루트를 고치지 않고 끝낼 수 있을 만큼 **전부** 넘긴다(필요한 상태와 콜백). 빈 컴포넌트는 구역 이름만 보여 주면 된다.

| 구역 | 채우는 티켓 |
| - | - |
| 검색(입력·결과 수·결과 목록·빈 상태) | [05](05-search.md) |
| PPT 올리기 | [06](06-ppt-upload.md) |
| 셋리스트 순서 목록 | [07](07-setlist-order.md) |
| 셋리스트 상세(공통 배경 막대 자리 제외), 곡 카드, 슬라이드 편집 서랍 | [08](08-setlist-detail-slide-editor.md) |
| 공통 배경 막대, 배경 서랍 | [09](09-background.md) |
| 만들기 버튼, 만들기 창 | [10](10-pptx-generation.md) |

- 공통 배경 막대는 셋리스트 상세 안에 보이지만 09가 채우는 별도 컴포넌트다. 루트(또는 상세의 빈 껍데기)가 자리를 잡아 둔다.
- 곡 카드의 "곡별 배경" 버튼과 "슬라이드 편집" 버튼은 루트의 서랍 열기 콜백을 부른다.
- 만들기 창은 만들기에 필요한 것(셋리스트, 곡 찾기 함수, 공통 배경, 또는 생성 계획을 만드는 함수)을 props로 받는다.
- 각 구역 컴포넌트 안에서 하위 컴포넌트·훅을 더 나누는 것은 그 티켓의 자유다.

## 완료 조건

- [x] `pnpm dev`로 `/tools/praise-ppt`가 열리고 일곱 구역의 빈 컴포넌트가 보인다
- [x] `pnpm build`(테스트 포함), `pnpm lint`, `pnpm typecheck`가 통과한다. `output: "export"`가 깨지지 않는다
- [x] 셋리스트 조작·직렬화 테스트가 spec Testing Decisions 2번의 경우를 모두 덮는다
- [x] 생성 계획 테스트가 spec Testing Decisions 3번의 경우를 모두 덮는다
- [x] `songs.json`이 없으면 곡 목록 상태가 "실패"가 되고 페이지는 깨지지 않는다
- [x] 새로고침해도 셋리스트(제외 집합·곡별 배경 포함)가 남는다 — 개발자 도구에서 localStorage 값을 넣어 확인한다
- [x] 위 표의 각 구역이 별도 파일이고, props만으로 05–10이 루트를 고치지 않고 끝낼 수 있다. props 목록을 이 파일 `## Comments`에 구역별로 적는다
- [x] 의존성 다섯 개가 `package.json`에 있고 `jszip`, `@tanstack/react-query`는 없다

## Comments

### 구현 결과 (2026-11-02)

모든 코드는 `app/tools/praise-ppt/` 아래에 있다. 루트 `_components/praise-ppt.tsx`가 상태를 들고 구역에 props로 나눈다. 05–10은 루트와 다른 구역 파일을 고치지 않는다. props가 모자라면 고치지 말고 여기에 적는다.

**도메인 `_lib`** (React 없음, 테스트 옆에)

| 파일 | 내보내는 것 |
| - | - |
| `song.ts` | `IMAGE_ORIGIN`(도메인 상수 한 곳), `CATALOG_URL`(`/praise-ppt/songs.json`), `CatalogEntry`, `Slide { index, image }`, `Song { id, title, slides }`, `FindSong`, `isUploadedId`, `catalogSong`(R2 주소 규칙), `parseCatalog`(id 양수·`slideCount ≥ 1` 검사) |
| `background.ts` | `Background`, `COLOR_PRESETS`(8개), `DEFAULT_BACKGROUND`(흰색), `backgroundName`, `isBackground`(hex 6자리·`data:image/` 검사) |
| `setlist.ts` (seam 2) | `SetlistEntry { songId, excluded: ReadonlySet<number>, background? }`, `Setlist`, `SETLIST_STORAGE_KEY`, `appliedBackground`, 조작 함수(`addSong` `removeSong` `toggleSong` `moveSong` `toggleSlide` `includeAllSlides` `excludeAllSlides` `setSongBackground` `clearSongBackground` `pruneMissing`), `serializeSetlist`, `parseSetlist`(같은 곡이 두 번 있어도 틀린 모양) |
| `plan.ts` (seam 3) | `PlannedSlide { image, background }`, `Plan`(`{ ok: true, slides }` 또는 `{ ok: false, error }`), `planSlides`, `countUsedSlides`("N장 사용") |

**React 쪽 공용** (`_components`)

- `setlist-state.ts` — `useSetlist()`, `setlistActions`. `useSyncExternalStore`로 메모리 값을 기준으로 두고 localStorage에는 사본을 쓴다. 쓰기 실패는 넘긴다.
- `catalog.ts` — `useCatalog()`, `Catalog`(`loading` / `error` / `success` + `songs`). 404·깨진 JSON·틀린 모양은 `error`다.
- `background-style.ts` — `backgroundStyle(bg)`. 08(썸네일)과 09(미리보기)가 함께 쓰니 미리 둔다. 두 티켓이 같은 파일을 만들지 않게 하려는 것이다.

**구역별 props** — 빈 컴포넌트마다 `eslint-disable-next-line` 한 줄이 있다. 채우는 티켓이 지운다.

| 구역 | 파일 | props |
| - | - | - |
| 05 검색 | `search.tsx` | `catalog: Catalog`, `isInSetlist(songId)`, `onToggleSong(songId)` |
| 06 PPT 올리기 | `ppt-upload.tsx` | `onAddSong(title, slides: Slide[])` — 루트가 -1부터 id를 배정해 올린 곡에 더하고 셋리스트 맨 뒤에 담는다. 제목에서 확장자를 떼는 것은 06이 한다 |
| 07 순서 목록 | `setlist-order.tsx` | `setlist`, `findSong`, `onRemove(songId)`, `onMove(from, to)` |
| 08 셋리스트 상세 | `setlist-detail.tsx` | `setlist`, `findSong`, `commonBackground`, `slideTotal`(생성 계획 길이), `commonBackgroundBar: ReactNode`(09 막대 자리, 그리기만 한다), `onClearAll()`, `onOpenSlideEditor(songId)`, `onOpenSongBackground(songId)`. 곡 카드 파일은 08이 이 아래에 만든다 |
| 08 슬라이드 편집 서랍 | `slide-editor.tsx` | `song`, `entry`, `commonBackground`, `onToggleSlide(index)`, `onIncludeAll()`, `onExcludeAll()`, `onClose()` — 이 곡에 묶여 있다. 열렸을 때만 그리고 `key`가 곡 id다 |
| 09 공통 배경 막대 | `common-background-bar.tsx` | `background`, `onOpen()` |
| 09 배경 서랍 | `background-drawer.tsx` | `target: BackgroundTarget`(`{ scope: "common" }` 또는 `{ scope: "song", title, hasSongBackground, onResetToCommon() }`), `background`(그 범위에 지금 적용된 배경), `onChange(bg)`, `onClose()` — 열렸을 때만 그리고 범위·곡이 바뀌면 `key`가 바뀐다 |
| 10 만들기 버튼·창 | `build.tsx` | `songCount`(셋리스트 길이, 0이면 버튼을 막는다), `plan: Plan` — 창의 상태와 `.pptx` 쓰기 모듈은 10이 이 아래에 둔다. 만드는 동안 셋리스트를 바꿀 수 없으니 계획 값을 받는다. "다시 시도"도 같은 `plan`이다 |

- 서랍은 루트의 상태 하나(`slides` / `common-background` / `song-background` / 없음)라 한 번에 하나만 열린다. 곡이 셋리스트에서 빠지면 그 곡의 서랍은 그려지지 않는다.
- 10: `songCount`는 셋리스트 길이라 곡 목록에서 찾지 못한 곡까지 센다. 곡 목록을 불러오면 그런 곡은 정리되므로 보통은 같다. 성공 창의 곡 수를 계획 기준으로 세려면 여기에 적는다.
- 확인: `songs.json`이 없으면 404로 `error`가 되고 페이지는 그대로 돈다. 임시 `songs.json`으로 열면 곡 목록에 없는 항목이 localStorage에서 빠지고 제외 집합·곡별 배경은 새로고침 뒤에도 남는다.
