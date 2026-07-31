# 01 — 프로토타입 이식 · `app/prototype/` 삭제 · 정적 export · `git init`

**What to build:** 저장소가 공개돼도 안전한 상태에서 출발한다. 앱을 열면 `/`에 도구 목록(링크
한 개)이 뜨고, 거기서 `/subtitle-extractor`로 가면 드롭존이 화면을 채운다. 저장소 어디에도
설교 원고 전문이 없고, 빌드는 정적 파일 뭉치로 떨어진다.

이것은 tracer bullet이 아니라 **prefactor이자 안전장치**다. 스펙이 못 박은 순서가 그대로 방어
수단이므로 이 티켓이 무조건 먼저 선다 — 이식 → 삭제 → `git init`. 순서를 바꾸면 gitignore
하나에만 기대게 된다.

**Blocked by:** None — can start immediately.

**Status:** resolved — 커밋 `fd6e33c`

## 순서를 지킨다

1. **옮긴다.** 사람이 눈으로 확인하고 확정한 결과물을 다시 타이핑하면 확인된 것이 미확인으로
   되돌아간다. `toNabiTxt`(BOM + CRLF + 빈 줄)·`downloadName`·`charCount`와 화면 부품
   `variant-f`를 `app/subtitle-extractor/`(`_lib/`, `_components/`)로 옮긴다. 옮기면서
   `// PROTOTYPE` 주석, 지어낸 `SCENARIOS`, `reclassify`/`withUnknownColors`(모르는 색 상태를
   만들어내려고 쓴 것), `fixtures.json` 의존을 떼어낸다.
2. **지운다.** `app/prototype/`을 통째로 삭제한다. `fixtures.json`이 애초에 존재하지 않는
   상태에서 저장소가 시작돼야 한다.
3. **그다음 `git init`.**

`Doc`/`Block`/`Verdict` 타입은 이 티켓에서 확정하지 않는다 — 프로토타입이 화면을 그리려고
발명한 모양이고 규칙 층의 진짜 출력과 일치하는지 검증된 적이 없다. 04에서 다시 본다.
지금은 옮겨 온 부품이 타입 체크를 통과할 만큼만 손댄다.

- [x] `toNabiTxt` · `downloadName` · `charCount`가 `app/subtitle-extractor/_lib/`에 있고, 나비CG
      출력 규격(UTF-8 BOM · CRLF · 자막 사이 빈 줄 하나 · 끝에 개행 없음)이 프로토타입과 동일하다
- [x] `variant-f`의 화면 부품이 `app/subtitle-extractor/_components/`에 있고 `fixtures.json`을
      import하지 않는다
- [x] `app/prototype/` 디렉터리가 존재하지 않는다
- [x] `.gitignore`에 `*.hwp`, `*.hwpx`, `*-nabi.txt`와 로컬 fixture 폴더가 추가돼 있고, 기존
      `create-next-app` 기본 항목은 그대로다
- [x] `git init` 후 첫 커밋에 설교 원고 전문이 한 글자도 들어 있지 않다 (커밋 트리 전수 확인)
- [x] `/`가 create-next-app 보일러플레이트가 아니라 도구 목록(서버 컴포넌트, 링크 한 개)이다
- [x] `/subtitle-extractor`가 드롭존을 보여준다 — 파일을 놓아도 아직 아무 일도 일어나지 않는다
      (04에서 배선한다)
- [x] `next.config.ts`에 `output: 'export'`가 켜져 있고 `pnpm build`가 통과한다
