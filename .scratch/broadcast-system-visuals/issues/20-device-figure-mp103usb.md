# 20: Numark MP103USB 생김새 그림

Type: task
Status: resolved
Blocked by: 10

## 무엇을 하나

CD/USB 플레이어(Numark MP103USB)의 앞·뒤 그림을 06의 틀에 더한다. 쓰는 단자(LINE OUT)와 쓰지 않는 단자를 구분해 보인다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/mp103usb-figure.ts`, `slug`는 `mp103usb`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

- **그림.** `_lib/mp103usb-figure.ts`. 앞은 매뉴얼 4쪽 번호 1–25를 모두 그린다: POWER SWITCH, CD 넣는 곳(테두리·문·틈), 세워 박힌 USB 단자, EJECT, 손가락 홈 26개가 난 JOG WHEEL, FOLDER, TRACK KNOB, SOURCE 표시등(CD·USB), LCD, 버튼 줄 8개, 인쇄된 테 안의 LOOP IN·LOOP OUT·RELOOP·CUE·PLAY / PAUSE, MASTER TEMPO와 표시등, PITCH와 범위 표시등 셋, TAP, PITCH BEND -/+ 둘, 눈금이 있는 PITCH FADER다. 뒤는 6쪽 그림대로 BALANCED OUTPUT(XLR R·L), LINE OUT(RCA L·R), DIGITAL OUT(RCA), VOLTAGE SELECTOR, POWER PLUG CONNECTOR, 윗변 홈, 덮개 테두리다. 부품 자리는 PDF 벡터 그림의 pt 좌표로 재서 옮겼고, 그 pt 값을 코드에 그대로 둔다.
- **단자 부품을 더했다.** `device-connectors.ts`에 `xlr`과 `rca`를 더했다.
- **치수.** 23쪽: 483 × 269 × 89mm. 높이와 깊이는 이 값이다. 가로는 앞면 그림의 비율로 422mm로 그렸다. 매뉴얼 그림에 랙 귀가 없고 그림의 가로:세로가 약 4.7:1이라, 483mm(19인치)는 랙 귀를 포함한 값으로 보인다. 캡션에 밝힌다.
- **그리지 않은 것·짐작한 것.** 랙 귀, 발, 윗면 무늬는 그림에 없어 그리지 않았다. 번호에 가려진 버튼 글자(버튼 줄 앞 넷, 루프·CUE·PLAY, TAP)와 LCD 화면 내용은 비웠다. LCD 위 버튼 묶음의 인쇄 글자도 번호에 가려 읽히지 않아 비웠다. 옆모습이 없어 버튼·JOG WHEEL이 튀어나온 높이, 뒷면 패널이 덮개 안으로 들어간 깊이(6mm)는 짐작이다. 전압 스위치 손잡이는 230V 쪽에 그렸다. 캡션에 밝힌다.
- **단자 대조.** 데이터의 `port`는 `LINE OUT` 하나이고, 뒷면에 인쇄된 이름과 같아 `aliases`는 비어 있다. 장비 `ports` 글 "BALANCED OUT·DIGITAL OUT 미사용 추정"의 단자 이름은 매뉴얼과 이렇게 대조된다. 글은 고치지 않았다. 고칠지는 사람이 정한다.
  - `BALANCED OUT` → `BALANCED OUTPUT`(6쪽 그림의 인쇄 글자. 목록 이름은 `BALANCED OUTPUTS (XLR)`)
  - `DIGITAL OUT` → 인쇄 글자와 같다(목록 이름은 `DIGITAL OUTPUT`)
- **`toConfirm`.** 더하지 않았다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test` 통과. `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했다. anatomy audit(`ANATOMY_AUDIT=1`)은 두 시점 모두 0건이다. 발이 없어 몸통을 `stand.chassis`로 바닥에 놓았다. 선 끝 검사(`scripts/lines.mjs`)는 두 시점·두 테마 모두 0건이다. 헤드리스로 그린 PNG를 매뉴얼 4·6쪽 그림과 나란히 보고 확인했다.
- **SVG 크기.** 앞 116KB, 뒤 41KB.
