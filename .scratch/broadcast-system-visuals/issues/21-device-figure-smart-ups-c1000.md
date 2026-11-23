# 21: APC Smart-UPS C1000 생김새 그림

Type: task
Status: resolved
Blocked by: 10

## 무엇을 하나

음향 UPS(APC Smart-UPS C1000)의 앞·뒤 그림을 06의 틀에 더한다. 정전 때 볼 표시등과 버튼을 알아보게 한다. 정확한 모델 번호(SMC1000 등)는 매뉴얼에서 확인한다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/smart-ups-c1000-figure.ts`, `slug`는 `smart-ups-c1000`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

- **그림.** `_lib/smart-ups-c1000-figure.ts`. 앞은 앞 덮개(Bezel)와 그 위쪽의 표시창 둘레다. Online/On Battery LED, UPS ON/OFF button, Site Wiring Fault/Alert LED, Display interface, MUTE button, DISPLAY button을 Installation Guide 6쪽 그림 배열대로 그렸고, 아래 덮개에 인쇄된 `APC`, `Smart-UPS`, `C 1000`과 오른쪽 옆면 뒤쪽 통풍구는 데이터시트 사진을 따랐다. 뒤는 Installation Guide 5쪽 1000/1500 VA 230 Vac 그림(su0325e)대로 USB port, Serial port, Battery connector, Circuit breaker/Overload protection, UPS input(C14), Outlets(C13 8구), Chassis ground screw다.
- **판.** 데이터에 정확한 모델 번호가 없어 판을 정할 수 없다. 한국에서 쓰는 230V 판(SMC1000I 계열)으로 그리고 캡션에 밝혔다. 120V 판(SMC1000)은 뒷면 콘센트와 입력이 다르다. `system.ts`의 음향 UPS에 `toConfirm` "정확한 모델 번호(뒷면 라벨)"(칸 `model`)을 더했다.
- **그리지 않은 것.** 표시창의 화면 내용, 뒷면 라벨과 인쇄 글자(매뉴얼 그림에 없다), 바닥 받침. 매뉴얼 그림에 축척이 없어 부품 자리는 그림에서 재서 데이터시트 치수(171 × 439 × 219mm)로 늘렸고, 몇 mm쯤 어긋날 수 있다고 캡션에 적었다. 앞 덮개 윗모서리의 경사는 사진을 보고 단순화했다.
- **단자 대조.** 데이터의 음향 UPS 연결 둘(전압조정기 → 음향 UPS, 음향 UPS → 음향 콘솔)에 `port`가 없어 어긋남이 없다. `aliases`는 비어 있다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test` 통과. `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했다. `ANATOMY_AUDIT=1` audit은 두 시점 모두 0건, 선 끝 검사(`scripts/lines.mjs`)는 두 시점·두 테마 모두 0건이다. 렌더링한 PNG를 매뉴얼 그림과 견주어 봤다.
- **크기.** SVG는 앞 15KB, 뒤 38KB, 그림 파일은 gzip 9KB쯤이다.
