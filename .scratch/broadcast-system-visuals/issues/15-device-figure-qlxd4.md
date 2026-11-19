# 15: Shure QLXD4 생김새 그림

Type: task
Status: resolved
Blocked by: 10

## 무엇을 하나

무선 마이크 수신기 1~4, 무선 마이크 수신기 5~6(Shure QLXD4)의 앞·뒤 그림을 06의 틀에 더한다. 장비 행 두 개가 모델 하나다. 그림 하나를 두 장비 id가 함께 쓴다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/qlxd4-figure.ts`, `slug`는 `qlxd4`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

- **그림.** `_lib/qlxd4-figure.ts`. 앞은 매뉴얼 11쪽 ①–⑩대로 화면, 화살표 버튼 둘, menu·enter·sync 버튼, audio·rf·ir 표시등, IR 창, 전원 스위치와 SHURE·QLXD4 인쇄다. 뒤는 12쪽 ⑪–⑱대로 전원선 고리, 전원 단자, Ethernet(표시등 둘), reset, antenna B, mic / line 스위치, XLR 출력(귀 둘 달린 받침판과 핀 구멍 셋), 1/4" 출력, antenna A와 덮개 끝의 나사 자리 둘이다. 단자 아래 인쇄된 글자(`power`, `antenna B`, `mic / line`, `inst / aux`, `antenna A`, `reset`)도 넣었다. 자리는 두 그림에서 재서 mm로 옮겼다.
- **치수.** 47쪽: 41 × 197 × 151mm(H × W × D). [device-manuals.md](../device-manuals.md)에 적었다.
- **그리지 않은 것.** 화면에 뜨는 내용, 옆면(랙 귀 나사 구멍)은 그리지 않았다. 바닥 발은 7쪽 그림대로 넷을 붙여 그렸지만 사용자가 붙이는 부품이라 실물에 있는지는 모른다. 발 두께와 앞 베젤 두께는 매뉴얼에 없어 정해 넣었다. 캡션에 밝힌다.
- **단자 이름.** 매뉴얼은 두 BNC를 묶어 `Antenna Connectors`라 부른다. 뒷면에 `antenna A`·`antenna B`로 인쇄돼 있어 `Antenna Connector A`·`Antenna Connector B`로 나눴다. 나머지는 매뉴얼 이름 그대로다.
- **틀: 그림 하나를 여러 장비가 같이 쓴다.** `DeviceFigure`에 `sharedWith?: string[]`를 더했다. `id`가 첫 장비이고, `sharedWith`에 같은 그림을 쓰는 다른 장비 id를 적는다. `device-figures.ts`의 `figureIds(figure)`가 둘을 이어 돌려준다.
  - `device-figure-ids.ts`에는 그림을 쓰는 장비 id를 모두 적는다. 두 id의 "생김새 보기" 버튼이 같은 dialog를 연다.
  - `DeviceFigureHost`가 장비 id마다 dialog 항목을 만들고, 꽂힌 상대는 `pluggedInto({ id, aliases })`로 장비마다 따로 찾는다. 그림 파일 주소(`src`)는 같아서 dialog가 한 번만 받는다. dialog와 route는 고치지 않았다. route는 그림마다 파일 하나를 그대로 만든다.
  - `device-figures.test.ts`는 장비 id마다 돈다. id 목록 대조, 장비 데이터에 있는지와 겹치지 않는지, `port` 대조, 꽂힌 상대가 그림의 이름에 있는지를 두 id 모두 본다. 같이 쓰는 그림에서 꽂힌 상대를 장비마다 따로 찾는지 보는 테스트를 더했다.
  - 이름에 `"`가 든 단자(`1/4" Instrument/Auxiliary Output`)가 있어, 테스트가 SVG 속성과 맞춰 볼 때 `"`도 `&quot;`로 바꾼다.
- **단자 대조.** `무선 마이크 수신기 1~4`의 연결에는 `port`가 없다. 어긋남은 하나다.
  - `무선 마이크 수신기 5~6`의 `출력` → `XLR Audio Output`(12쪽 ⑰). 연결의 `signal`이 XLR이라 이 단자로 본다. 데이터를 고칠지 사람이 정할 때까지 그림의 `aliases`가 `출력`을 `XLR Audio Output`으로 임시로 잇는다. 고치면 `aliases`를 비운다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test` 통과. `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했다. anatomy audit은 두 시점 모두 0건이다(시점마다 1.5초쯤). 선 끝 검사(`scripts/lines.mjs`)는 두 시점·두 테마 모두 0건이다. 헤드리스로 렌더링한 PNG를 매뉴얼 그림과 견줘 봤다. 뒤 시점은 BNC가 아래 인쇄 글자를 가리지 않도록 앞보다 낮게(18°) 본다.
- **SVG 크기.** 앞 43KB, 뒤 67KB다.
