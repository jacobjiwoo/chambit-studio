# 찬양 PPT 이전

Label: `wayfinder:map`

## Destination

별도 저장소 `praise-ppt`에서 돌던 찬양 PPT 서비스를 chambit-studio의 `/tools/praise-ppt`로 옮긴다. **기능만 옮기고 디자인은 옮기지 않는다** — 화면은 chambit 디자인 시스템이 생기면 그때 입힌다.

사용자가 하는 일은 그대로다. 곡을 검색하거나 PPT를 올려 셋리스트에 담고, 곡마다 뺄 슬라이드와 배경을 정해 `.pptx` 한 벌로 내려받는다.

## Notes

**원래 이 저장소에 들어올 기능이었다.** 따로 작업했을 뿐이고 이번에 합친다. 우선순위는 *서비스를 옮기는 것* 하나이고, 판단이 갈리면 단순한 쪽을 고른다.

**praise-ppt의 모양** — Astro SSR + Cloudflare Workers. D1(포스트 7,343건·파일 22,007개), R2(`praise-ppt-storage`, 슬라이드 PNG 57,285장·약 7.2 GB), KV(rate limit). API는 `search`·`image`(R2 프록시)·`build-ppt`(서버에서 pptxgenjs)·`sync`(RSS→D1)·`files`·`download`(tistory 프록시) 여섯 개다. 셋리스트는 이미 localStorage에, 사용자가 올린 PPT의 슬라이드 추출은 이미 브라우저에 있다.

**chambit의 모양** — `output: "export"` 정적 배포, 서버 없음, public 저장소, 인증 없음. 서버 기능 여섯 개가 그대로는 못 들어온다. 이 맵의 결정 대부분이 여기서 나온다.

**실측** — 슬라이드 경로는 7,343곡 전부 `images/{id}/{n}.png` 규칙을 따른다(예외 0). 그래서 경로는 장수만 있으면 다시 만들어진다. 슬라이드 0장인 곡이 72개다. 곡 목록 JSON 무게:

| 담는 것 | 원본 | gzip |
| - | - | - |
| id·제목·장수 | 419 KB | **219 KB** |
| + tistory URL(인코딩) | 2.5 MB | 545 KB |
| + tistory URL(디코딩) | 1.0 MB | 386 KB |

URL이 무게 대부분이다. `data/posts.json`은 4월 18일 스냅샷이라 기준이 아니다 — **원격 D1이 기준이다.**

## Decisions so far

- **정적 구조를 지킨다. 서버 기능은 전부 브라우저와 정적 파일로 옮긴다.** chambit을 OpenNext로 Workers에 올리는 길도 따져 봤다. API를 거의 그대로 옮길 수 있다는 이점이 있지만 `next.config.ts`의 "열린 문" 결정을 저장소 전체에서 뒤집고, 무료 플랜 CPU 10 ms에 서버 PPT 생성이 걸릴 수 있다. 무엇보다 아래 결정들만으로 기능이 전부 돈다 — 서버가 따로 주는 것은 rate limit 하나다. 서버가 꼭 필요한 기능이 생기면 그때 따로 정한다.
- **데이터는 지금 상태로 얼린다.** 크롤링·이미지 추출·RSS 동기화는 옮기지 않는다. 새 곡은 PPT 업로드로만 들어온다. 그래서 크롤링 비밀번호와 R2 자격증명이 public 저장소에 들어올 일이 없다.
- **곡 목록은 id·제목·장수만 담은 정적 JSON이고, 검색은 브라우저에서 한다**(gzip 219 KB). 원본 글 링크와 첨부 파일(PPT·NWC) 다운로드는 뺀다 — 원본 다운로드는 tistory 프록시 없이는 CORS에 막힌다. 필요해지면 디코딩 URL을 더한다(386 KB).
- **이미지는 R2 커스텀 도메인 `praise-ppt-images.chambitstudio.com`에서 바로 받는다.** CORS는 chambit 도메인과 localhost만 연다. `.pptx`에 넣으려면 브라우저가 이미지 바이트를 `fetch`해야 해서 CORS가 필요하다. 서브도메인은 한 단계여야 무료 Universal SSL이 덮는다. 범용 이름(`assets.`)도 따져 봤지만 버킷이 `praise-ppt-storage`이고 경로에 도구 표시가 없어 이름과 실제가 어긋난다. 같이 쓸 두 번째 도구가 생기면 버킷을 옮기고 도메인 상수 한 줄을 바꾼다. `r2.dev`는 개발용이라 쓰지 않는다.
- **`.pptx`는 브라우저에서 pptxgenjs로 만든다.** 생성 버튼을 누를 때 dynamic import한다. `fflate`로 직접 짜는 길은 새벽기도 PPT에서 검증됐지만 다시 쓸 코드가 많다. 이미지만 까는 PPT라 pptxgenjs의 약점(텍스트 조판)이 걸리지 않는다.
- **디자인은 버린다.** `_lib`·훅·상태·타입은 옮기고, 컴포넌트는 스타일 없는 의미 있는 HTML로 다시 쓴다. 아이콘 15개, 토큰, `DESIGN.md`는 버린다. 드래그 정렬(dnd-kit)은 동작이라 살린다. 배경색 프리셋 8개는 산출물(PPT 배경)이라 기능이다. 검색이 로컬이 되므로 TanStack Query는 들이지 않는다.
- **테스트는 `_lib`에만 붙인다** — 슬라이드 추출(PPT·PPTX), 셋리스트 직렬화, 셋리스트에서 생성할 슬라이드 목록 만들기(제외·배경 적용). 화면 테스트는 디자인 시스템 뒤로 미룬다.
- **라우트는 `/tools/praise-ppt`다.** 원래 저장소 이름이라 옛 기록과 이어지고, `dawn-prayer-ppt`와 `<무엇>-ppt` 꼴로 짝이 맞는다. `worship-ppt`는 새벽기도 PPT까지 덮어 넓다.
- **코드는 복사한다.** git 히스토리는 가져오지 않고 커밋 메시지에 원래 저장소를 적는다. praise-ppt의 규칙(`no-memoization`, 약어 금지, `code-style`)은 들이지 않는다.
- **저작권자 허락은 받았다.** 원 블로그(cwy0675.tistory.com)의 슬라이드를 인증 없는 공개 사이트에서 내보낸다.
- **praise-ppt 배포는 이전이 끝나고 실제로 써 본 뒤에 내린다.** Worker·D1·KV를 지우고 R2는 남긴다. 지우는 일은 사람이 한다.

## Fog

사람이 Cloudflare 대시보드에서 할 일과 순서가 남았다.

- 원격 D1에서 마지막 스냅샷을 export한다 — 곡 목록 JSON의 재료이고, D1을 지우기 전에 해야 한다
- `chambitstudio.com`과 R2 버킷이 같은 계정에 있는지 확인하고, 커스텀 도메인과 CORS를 붙인다
- 이전 후 praise-ppt Worker·D1·KV를 지운다
