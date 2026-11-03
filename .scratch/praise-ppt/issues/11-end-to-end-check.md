# 11: 브라우저와 PowerPoint로 끝까지 확인

Status: ready-for-human
Blocked by: 02, 04, 05, 06, 07, 08, 09, 10

## 무엇을 하나

모든 조각이 `main`에 들어온 뒤, 실제 브라우저에서 담당자의 흐름을 처음부터 끝까지 밟고 결과 `.pptx`를 PowerPoint에서 열어 본다. pptxgenjs 호출, 이미지 `fetch`, 다운로드는 테스트 seam 밖이라 이것으로 확인한다([spec](../spec.md) Testing Decisions).

PowerPoint로 여는 일이 있어 사람이 한다. 브라우저 흐름은 에이전트가 먼저 밟아도 된다.

## 완료 조건

- [x] 배포된 chambit(또는 `pnpm build` 결과를 정적으로 띄운 것)에서 `/tools/praise-ppt`가 열리고 곡 목록이 불러와진다
- [x] 곡 목록 곡 셋 이상과 올린 곡 하나(`.ppt` 하나, `.pptx` 하나면 더 좋다)를 셋리스트에 담고 순서를 바꾼다
- [x] 일부 장을 빼고, 공통 배경을 색으로, 한 곡의 곡별 배경을 이미지로 정한다
- [x] 새로고침하면 곡 목록 곡의 셋리스트·제외·곡별 배경이 남고 올린 곡은 빠진다(다시 올린 뒤 진행)
- [ ] 만들기가 성공하고 `찬양_YYYYMMDD.pptx`가 받힌다
- [ ] PowerPoint에서 열면 16:9이고, 순서·뺀 장·배경이 화면에서 정한 대로이며, 투명 가사가 배경 위에 제대로 보인다
- [x] 문제가 있으면 해당 티켓 번호와 함께 `## Comments`에 적는다

## Comments

### 에이전트 브라우저 확인 (2026-11-03)

`feat/praise-ppt`에서 갈라진 `feat/praise-ppt-11-end-to-end-check`(`8488715`)를 `pnpm dev`로 `http://localhost:3000`에 띄워 Claude 앱 내장 브라우저로 밟았다. 정적 빌드가 아니라 dev 서버다. 파일 고르기 창 대신 `DataTransfer`로 input에 파일을 넣었고, 다운로드는 `<a download>` 클릭 때 같은 Blob을 로컬 중계 서버로 보내 저장했다.

받은 파일: `/Users/jiwoo/dev/projects/chambit-studio/fixtures/praise-ppt/찬양_20261103.pptx`(2,884,776 바이트, gitignore된 `fixtures/`)

#### 밟은 흐름과 결과

1. 통과 — `/tools/praise-ppt`가 열리고 "예수"로 검색하면 50곡이 나온다. 썸네일이 R2 커스텀 도메인에서 뜬다.
2. 통과 — 곡 목록 곡 셋(id 52·30·51)과 올린 곡 `.pptx` 하나(`praise-ppt/scripts/test-output.pptx`, 5장)를 담았다. 키보드(Space·↑·Space)로 순서를 두 번 바꿔 `52 → 30 → 올린 곡 → 51`이 됐다. 포인터 끌기는 내장 브라우저가 중간 이동 없이 한 번에 옮겨서 확인하지 못했다.
   - `.ppt` 찬양 표본은 없다. Office 템플릿 `prottpln.ppt`(그림 없음)를 넣으면 "Pictures 스트림을 찾을 수 없습니다 — 지원되는 PPT 형식이 아닙니다"가 뜨고 셋리스트는 그대로다. 블로그 형식 `.ppt` 추출은 사람이 확인한다.
3. 통과 — 52의 2·7번 장을 뺐다("6장 사용 · 2장 제외 · 8장 중"). 공통 배경을 남색으로, 30의 곡별 배경을 이미지(1600×900 주황 PNG)로 정했다. 썸네일이 각각 남색·주황 위에 보이고 30 카드에 "곡별 배경: 업로드 이미지"가 뜬다.
4. 통과 — 새로고침하면 순서(52 → 30 → 51)·52의 제외·30의 곡별 배경이 남고 올린 곡은 빠진다. 공통 배경은 흰색으로 돌아간다(spec "공통 배경은 저장하지 않는다"대로). `localStorage`의 `praise-ppt:setlist`에도 올린 곡(음수 id)이 없다. 올린 곡을 다시 올려 셋째 자리로 옮기고 5번 장을 뺐다. 공통 배경을 다시 남색으로 정했다. 총 28장(6 + 7 + 4 + 11).
5. **실패** — "PPT 만들기 · 4곡"을 누르면 "슬라이드 이미지를 받지 못했습니다: https://praise-ppt-images.chambitstudio.com/images/52/0.png"로 실패한다. 아래 문제 1. 테스트 쪽에서 썸네일 이미지 26개를 `fetch(src, { cache: "reload" })`로 다시 받아 캐시를 바꾼 뒤에는 성공했다: `찬양_20261103.pptx`, 4곡, 28장, 2.75 MB. "다운로드"를 누르면 그 이름으로 받힌다.
6. 사람 몫(PowerPoint) — 받은 파일을 풀어 본 결과는 아래에 있다. PowerPoint로 여는 확인은 하지 않았다.

#### 받은 `.pptx`를 풀어 본 결과

- `ppt/presentation.xml`의 `<p:sldSz cx="9144000" cy="5143500"/>` — 10 × 5.625 inch, 16:9다.
- 슬라이드 28장. 장마다 `<p:pic>` 하나가 `(0, 0)`부터 `9144000 × 5143500`으로 가득 놓인다.
- 슬라이드 이미지를 R2 원본·올린 파일 미디어와 MD5로 맞춰 본 순서와 배경:

| 장 | 이미지 | 배경 |
| - | - | - |
| 1–6 | 52번 0·2·3·4·5·7 (1·6 빠짐) | `srgbClr 1A1A40`(남색) |
| 7–13 | 30번 0–6 | 이미지 — 올린 주황 PNG와 같은 바이트 |
| 14–17 | 올린 곡 1–4장 (5장 빠짐) | `srgbClr 1A1A40` |
| 18–28 | 51번 0–10 | `srgbClr 1A1A40` |

- 곡 목록 곡의 이미지는 RGBA PNG(IHDR color type 6, 1152×648)라 배경 위에 투명 가사가 놓인다. 단 14–17장은 문제 2 때문에 가사가 아니라 불투명 배경 그림이다.

#### 찾은 문제

1. **[10] [02] 썸네일을 본 뒤에는 만들기가 늘 CORS로 실패한다.** 썸네일 `<img>`(08, `slide-thumb.tsx`)는 `crossorigin` 없이 R2 이미지를 받는다. Origin 없는 요청의 R2 응답에는 `Access-Control-Allow-Origin`도 `Vary: Origin`도 없고 `cache-control: public, max-age=31536000`이라, 브라우저가 이 응답을 캐시해 두었다가 `_lib/pptx.ts`의 `fetch(src)`에 그대로 쓴다. 콘솔: `Access to fetch at '.../images/51/6.png' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.` 같은 페이지에서 `fetch(u)`는 실패, `fetch(u, { cache: "reload" })`는 200, 그 뒤 `fetch(u)`도 200이다. 담당자는 만들기 전에 반드시 썸네일을 보니 배포 도메인에서도 같은 일이 난다. 02의 `curl` 확인은 처음부터 Origin을 붙인 요청이라 이 경우를 잡지 못했다. 고칠 자리 후보: 썸네일 `<img crossOrigin="anonymous">`(08), `fetch`에 `cache` 옵션(10), Cloudflare에서 응답에 늘 `Vary: Origin`을 붙이기(02). 고치지 않았다.
2. **[06] 배경을 이미지로 깐 `.pptx`를 올리면 가사가 아니라 배경이 슬라이드로 뽑힌다.** `test-output.pptx`는 장마다 `<p:bg>`의 `blipFill`(`Slide-N-image-1.png`, 다섯 장 모두 같은 불투명 RGB PNG)과 가사 `<p:pic>`(`image-N-2.png`, RGBA)을 가진다. 추출은 spec대로 "슬라이드 XML에서 처음 나오는 `<a:blip r:embed>`"를 쓰는데 `<p:bg>`가 먼저 나와서 다섯 장이 모두 같은 배경 그림이 된다. 구현이 아니라 spec(원본 동작) 문제다. 이 도구가 곡별 배경을 이미지로 정해 만든 `.pptx`를 다시 올려도 같은 일이 날 것이다(직접 확인은 하지 않았다). `<p:bg>` 밖의 blip을 먼저 보거나 `.ppt` 갈래처럼 RGBA PNG를 우선하는 쪽을 검토할 만하다.
3. **[07] (사소) 순서 끌기의 스크린 리더 안내가 영어다.** 키보드로 놓으면 dnd-kit 기본 문구 `Draggable item -1 was dropped over droppable area 51`이 live region에 남는다. 안내 문구(`announcements`)를 한국어로 주지 않았다.

### 찾은 문제 고침 (2026-11-03)

`fix/praise-ppt-11-findings`에서 세 문제를 고쳤다. 문제 1은 썸네일 `<img>`(`slide-thumb.tsx`)에 `crossOrigin="anonymous"`를 붙여 처음부터 CORS 응답이 캐시되게 했다. R2 URL을 쓰는 `<img>`는 이것 하나이고, 배경은 data URL이다. `pptx.ts`의 `fetch`는 교차 출처라 기본이 `mode: "cors"`여서 손대지 않았다. 문제 2는 `.pptx` 추출이 `<p:bg>`를 뺀 본문에서 blip을 먼저 찾고, 본문에 그림이 없을 때만 배경 그림을 쓰게 했다. 배경 + 가사 그림 테스트를 먼저 실패시키고 고쳤고, spec의 user story 32와 `.pptx` 추출 설명을 고쳤다. 문제 3은 `setlist-order.tsx`의 `DndContext`에 한국어 `announcements`와 `screenReaderInstructions`를 주어 곡 제목과 1부터 센 자리로 안내하게 했다. `pnpm lint`·`pnpm typecheck`·`pnpm test`·`pnpm build`는 통과했다. 브라우저로 다시 밟는 확인(썸네일을 본 뒤 만들기, 실물 `test-output.pptx` 올리기, 스크린 리더 안내)은 하지 않았다.
