# 19: Botex DC-2448 생김새 그림

Type: task
Status: resolved
Blocked by: 10

## 무엇을 하나

조명 콘솔(Botex DC-2448)의 앞·뒤 그림을 06의 틀에 더한다. 앞면 페이더와 라벨 자리를 알아보게 한다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/dc-2448-figure.ts`, `slug`는 `dc-2448`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

- **그림.** `_lib/dc-2448-figure.ts`. 앞(윗면)은 매뉴얼 10–12쪽 그림대로 채널 페이더 48개와 FLASH 버튼 48개, PRESET A·B 표시등 48개, SCENES 표시등 24개, 조작부의 버튼 20개, 페이더 다섯(MASTER·MASTER B·FADE·SPEED·AUDIO LEVEL), 표시창(세 자리), 포그 머신 버튼과 표시등, 그 밖의 표시등을 그린다. 페이더마다 홈과 0–10 눈금이 있다. 뒤는 13쪽 순서대로 `POWER` 스위치, `DC IN`, `MIDI THRU`·`OUT`·`IN`, `DMX OUT`, `AUDIO`, `REMOTE`, `FOG MACHINE`이다. 자리는 그림에서 재서 mm로 옮겼다(윗면은 716 × 267mm, 뒷면은 윗판 폭 716mm에 맞췄다).
- **이름.** 앞은 매뉴얼의 번호 매긴 항목을 구역 16개로 묶었다(페이더 구역 7, 조작부 9). 버튼 하나하나가 아니라 줄·구역 단위다. 장비 데이터 `notes`의 라벨 메모(①강대상 등)는 사람이 붙인 것이라 그림에 넣지 않았다.
- **단자 부품.** `device-connectors.ts`에 `xlrFemale`(3핀 XLR 암, PUSH 걸쇠와 나사 둘)과 `din5`(DIN 5핀)를 더했다.
- **그리지 않은 것·추정.** 매뉴얼에 옆모습이 없어 윗면은 평평하게 그렸다. 몸통 높이 약 47mm는 뒷면 그림 비율로 잰 값이라 사양의 80mm와 다르다. 고무 발의 자리는 추정이다. 랙에 달 때 떼는 플라스틱 판은 그림에 없어 그리지 않았다. 28쪽은 DMX 입력(XLR 수)을 적지만 뒷면 그림에 없어 그리지 않았다. 캡션에 밝힌다.
- **단자 대조.** 조명 콘솔 연결(→ 본당 조명, DMX)에 `port`가 없어 대조할 것이 없다. `aliases`는 비어 있다. 나중에 `port`를 적는다면 매뉴얼 이름은 `DMX OUT`이다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test` 통과. anatomy audit은 두 시점 모두 0건이다. 선 끝 검사(`scripts/lines.mjs`)는 두 시점·두 테마 모두 0건. 렌더링한 PNG를 매뉴얼 그림과 견줘 봤다.
- **SVG 크기.** 앞 346KB(gzip 58KB), 뒤 50KB(gzip 9KB).
