# 13: Colorlight X8E 생김새 그림

Type: task
Status: open
Blocked by: 10

## 무엇을 하나

LED 프로세서(Colorlight X8E)의 앞·뒤 그림을 06의 틀에 더한다. 확인 필요 14번(뒷면 연결)을 확인할 때 기준이 된다. 앞면 버튼·화면도 그린다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/x8e-figure.ts`, `slug`는 `x8e`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

그리지 않았다. 제조사 공식 매뉴얼에서 X8E의 앞·뒷면 그림을 찾지 못해서다(2026-11-19). 공식 문서가 나오면 이 티켓을 다시 연다.

- **Colorlight 다운로드 센터.** 영문(`www.colorlightinside.com/service/download/`)과 중문 다운로드 센터의 문서 분류, 사이트 검색(`/search/?keyword=X8E`, `X8e`, `X8`)을 봤다. X8E로 나오는 것은 펌웨어 묶음 `Sender-X8E-V1.40(...).zip` 하나뿐이고 규격서·사용 설명서는 없다. 이름이 비슷한 X8m(규격서, X8m&X12m Quick Start Guide)과 X16E(중문 규격서 V1.1)는 있지만 다른 모델이라 쓰지 않았다.
- **예전 공식 다운로드 서버.** Wayback Machine의 CDX 목록에서 `colorlightinside.com` 전체와 `support.colorlightinside.com/uploads/`를 찾았다. `download.colorlightinside.com`에 X8(`X8-User Manual V1.2`)과 X16E(`X16E-User Manual V1.0`, `X16E-Specification V1.0`)는 있었지만 X8E 파일은 없었다. X16E 매뉴얼 보관본은 1MB에서 잘려 열리지 않았다.
- **쓰지 않은 것.** 판매점·재판매사(led-mall, yipinglink, eager-led 등)의 규격 소개와 DSPPA DP-X8E 데이터시트는 제조사 공식 문서가 아니라 근거로 쓰지 않았다. 판매점 소개마다 입력 단자 구성도 서로 다르다.
- **단자 대조.** 그림이 없으니 대조하지 않았다. `system.ts`의 LED 프로세서 연결 `port: "HDMI1"`은 그대로다.
- **다음 길.** 실물 앞·뒷면 사진, 장비와 함께 온 종이 설명서, Colorlight 기술 지원 문의 가운데 하나가 있어야 그릴 수 있다. 사진으로 그릴지는 사람이 정한다.
