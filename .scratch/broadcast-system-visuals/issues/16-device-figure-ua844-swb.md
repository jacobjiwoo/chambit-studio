# 16: Shure UA844+SWB 생김새 그림

Type: task
Status: resolved
Blocked by: 10, 15

## 무엇을 하나

안테나 분배기 A, 안테나 분배기 B(Shure UA844+SWB)의 앞·뒤 그림을 06의 틀에 더한다. 장비 행 두 개가 모델 하나다. 그림 하나를 두 장비 id가 함께 쓴다. 15가 만든 공유 방식을 따른다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/ua844-swb-figure.ts`, `slug`는 `ua844-swb`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

- **그림.** `_lib/ua844-swb-figure.ts`. 앞은 매뉴얼 3쪽대로 1U 랙 패널, 랙 귀의 긴 구멍 넷, 아래쪽 홈 셋, 육각 너트 위의 안테나 단자 A·B, POWER 표시등, 전원 스위치(I·● 인쇄), `UHF ANTENNA/POWER DISTRIBUTION SYSTEM`과 SHURE·UA844SWB 인쇄다. 뒤는 ANTENNA B 입력, RF OUTPUT B 넷, POWER IN, POWER OUT 넷, RF OUTPUT A 넷, ANTENNA A 입력과 인쇄된 칸·괄호선·글자, 위쪽의 U자 홈이다.
- **치수.** 2쪽: 45 × 483 × 172mm(H × W × D). [device-manuals.md](../device-manuals.md)에 적었다.
- **매뉴얼에 없어 정한 것.** 뒷몸통의 폭은 매뉴얼에 없어 랙 장비의 흔한 폭 432mm로 잡고, 뒷면 그림의 가로를 그 폭에 맞춰 옮겼다. 뒷면 그림은 가로세로 비율이 앞면과 맞지 않아 세로는 몸통 높이에 맞췄다. 발은 그리지 않았다. 캡션에 밝힌다.
- **그리지 않은 것.** 뒷면의 인증 표시(CE 등)와 왼쪽 아래의 작은 구멍은 뜻을 알 수 없어 그리지 않았다.
- **전원 스위치.** 매뉴얼은 앞면 전원 스위치가 나라에 따라 있다고 한다. 그림에는 매뉴얼 그림대로 넣고, 실물에 있는지 모른다고 캡션과 이름 목록에 적었다. `toConfirm`은 더하지 않았다.
- **틀.** 15의 `sharedWith`를 그대로 쓴다. `id`가 안테나 분배기 A, `sharedWith`가 안테나 분배기 B다. 틀은 고치지 않았다.
- **단자 이름.** 앞면 안테나 단자 둘은 `kind: "area"`로 앞 시점에 단다. 테스트가 단자(`port`)는 뒤 시점에 있기를 바라서다. RF 출력 넷과 전원 출력 넷은 매뉴얼처럼 묶음 이름 하나로 단다.
- **단자 대조.** 두 장비의 연결에 `port`가 없어 어긋남이 없다. `aliases`는 비어 있다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test` 통과. `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했다. anatomy audit은 두 시점 모두 0건이다. 선 끝 검사(`scripts/lines.mjs`)는 두 시점·두 테마 모두 0건이다. 헤드리스로 렌더링한 PNG를 매뉴얼 그림과 견줘 봤다.
- **SVG 크기.** 앞 23KB, 뒤 80KB다.
