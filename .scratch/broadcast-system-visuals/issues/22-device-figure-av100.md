# 22: 세계전원(WE) Sound Clinic AV100 생김새 그림

Type: task
Status: open
Blocked by: 10

## 무엇을 하나

전압조정기(세계전원(WE) Sound Clinic AV100)의 앞·뒤 그림을 06의 틀에 더한다. 켜는 순서 ①POWER 차단기 ②OUT ON이 본체에 있다. 공식 매뉴얼을 구할 수 있는지부터 본다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/av100-figure.ts`, `slug`는 `av100`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

그리지 않았다. 공식 매뉴얼에서 앞·뒷면 그림을 찾지 못해서다. Status는 open으로 둔다. 2026-11-18에 찾아본 것이다.

- **제조사.** 주식회사 세계전원(영문 WORLD ELECTRIC)이다. 공식 홈페이지는 <http://www.ups21.net/>이고, 다아라의 업체 페이지 <https://ups21.bizdaara.com/>도 같은 회사다.
- **홈페이지에 있는 것.** 메뉴는 회사소개(인사말, 전원장치의 용도, 회사개요, 카달로그, 인증서, 오시는 길), 생산품목(AVR, UPS, 정류기, 충전기, IVR), 납품거래처, 고객센터(문의하기, Q&A)다. 매뉴얼·자료실 메뉴는 없다. 페이지 19개를 모두 받아 "Sound Clinic", "AV100", "클리닉"을 찾았으나 한 곳도 나오지 않는다. 생산품목 AVR 페이지는 1–300kVA 산업용 AVR의 전기적 특성과 용량별 외함 크기만 있고, 모델 이름과 앞·뒷면 그림은 없다.
- **카탈로그.** 카달로그 페이지의 `download/catalog_150224.pdf`는 비밀번호를 물어 받을 수 없다(`401 Authorization Required`). 2015년판으로 보이고 AV100이 실렸는지 알 수 없다.
- **웹 검색.** "세계전원 Sound Clinic AV100", "사운드클리닉 AVR 절연트랜스", "Sound Clinic Balanced Power" 등으로 찾았다. 같은 이름의 다른 제품(ATOLL AV100 앰프, ZVOX AV100 사운드바, TIC AVP100, Harman/Kardon AVR 100)만 나오고 이 장비의 문서는 없다. 판매 사이트 사진·설명도 찾지 못했다.

### 단자 대조

`system.ts`에서 이 장비의 연결(건물 전원 → 전압조정기, 전압조정기 → 하위 장비, 전압조정기 → 음향 UPS)에는 `port`가 없다. 장비 `notes`의 "POWER 차단기", "OUT ON(파란 버튼)", "BY-PASS"는 본체 운전요령에서 온 표기인데, 대조할 매뉴얼이 없어 맞는지 알 수 없다. 고친 것은 없다.

### 다음에 할 수 있는 것

사람이 정한다.

1. 제조사 고객센터(홈페이지 문의하기)에 AV100 사용설명서나 카탈로그 비밀번호를 묻는다.
2. 방송실에서 본체 앞·뒷면과 운전요령 표를 찍는다. 다만 map의 결정은 근거를 제조사 매뉴얼로 정했으므로, 사진을 근거로 그리려면 그 결정부터 고친다.
