# 06: PPT 파일 올리기

Status: resolved
Blocked by: 03

## 무엇을 만드나

담당자가 곡 목록에 없는 곡을 `.ppt`·`.pptx` 파일로 올려 **올린 곡**으로 **셋리스트**에 담는다. spec 유저 스토리 22–33.

세부는 [spec](../spec.md)의 "슬라이드 추출 (`_lib`)"과 "화면"의 PPT 올리기 항목에 있다. 원본은 `/Users/jiwoo/dev/projects/praise-ppt`의 `extract-ppt-client`다. 동작과 오류 문구를 그대로 옮기되 `.pptx`의 ZIP은 JSZip 대신 `fflate`로 푼다.

- 슬라이드 추출은 `_lib`이고 seam 1이다. spec Testing Decisions 1번의 경우를 모두 덮는다. 테스트는 `.ppt`를 `cfb`로, `.pptx`를 `fflate`로 테스트 안에서 손으로 지어 넣는다. 선례는 `app/subtitle-extractor/_lib/hwp.test.ts`다.
- 화면: 파일 고르기(`accept=".ppt,.pptx"`), 상태 idle·추출 중·오류, 추출 중엔 버튼 비활성, 고른 뒤 input 값을 비워 같은 파일을 다시 고를 수 있게, 새로고침하면 사라진다는 안내. 확장자 검사를 고르기 직후 먼저 한다. 오류는 추출 오류 메시지를 그대로 보여 준다.
- 스타일 없이 의미 있는 HTML로 쓴다.

**맡는 범위:** [03](03-foundation.md)이 만든 PPT 올리기 구역 컴포넌트와 그 아래, 슬라이드 추출 `_lib`. 루트와 다른 구역은 고치지 않는다. props가 모자라면 고치지 말고 `## Comments`에 적는다.

## 완료 조건

- [x] 추출 테스트가 spec Testing Decisions 1번의 경우를 모두 덮고 `pnpm test`로 통과한다
- [x] 블로그 형식 `.ppt`를 올리면 투명 PNG 가사만 슬라이드로 뽑힌다. 투명 PNG가 없는 `.ppt`는 PNG·JPEG 전부가 뽑힌다
- [x] `.pptx`를 올리면 `presentation.xml` 순서대로 각 슬라이드의 첫 그림이 뽑히고, 그림 없는 슬라이드는 건너뛴다
- [x] 올린 파일 이름(확장자 뺀 것)이 곡 제목이 되어 셋리스트 맨 뒤에 담긴다
- [x] PPT가 아닌 파일, 추출 실패 파일에서 각각의 안내가 보이고, 같은 파일을 다시 고를 수 있다
- [x] 실물 PPT 회귀 테스트를 더한다면 `fixtures/`에 두고 없으면 skip한다
- [x] `pnpm build`, `pnpm lint`, `pnpm typecheck`가 통과한다

## Comments

### 구현 결과 (2026-11-02)

- 추출은 `_lib/extract-slides.ts`의 `extractSlides(file)`이다. 오류는 `ExtractError`이고 화면은 `message`를 그대로 보여 준다. `isPptName`, `titleFromFileName`도 같은 파일에 있다.
- `.pptx`는 `unzipSync`에 `filter`를 걸어 XML·`.rels`·PNG·JPEG만 푼다. 원본 JSZip처럼 읽는 것만 풀어 동영상·폰트가 든 파일에서 메모리와 멈춤을 줄인다.
- 실물 PPT 회귀 테스트(`fixtures/`)는 더하지 않았다. 완료 조건의 "더한다면"이라 선택이다.
- props는 03이 정한 `onAddSong(title, slides)`로 충분했다. 루트는 고치지 않았다.
- 화면은 실제 브라우저에서 올려 보지 않았다. 테스트와 `pnpm build`로만 확인했다.
