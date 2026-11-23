# 17: Nextwill NWBM-200HD 생김새 그림

Type: task
Status: open
Blocked by: 10

## 무엇을 하나

TV 채널 변환기(Nextwill NWBM-200HD)의 앞·뒤 그림을 06의 틀에 더한다. 확인 필요 14번(뒷면 연결)을 확인할 때 기준이 된다. 공식 매뉴얼을 구할 수 있는지부터 본다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/nwbm-200hd-figure.ts`, `slug`는 `nwbm-200hd`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

2026-11-18. 제조사 공식 매뉴얼을 찾지 못해 그리지 않았다. Status는 open으로 둔다.

- **제조사.** NWBM-200HD는 ㈜넥스윌(Nextwill, 대전 유성구)의 장비다. 방송통신기자재 적합인증 번호가 `NWB-NWBM-200HD`(2010-10-25, 기기명 "8VSB HD Media Caster")라는 것은 검색 결과의 인증 정보로만 봤다.
- **제조사 홈페이지(`nextwill.com`)에서 찾아본 곳.**
  - 사업영역의 주요사업·핵심기술·국방분야·민수분야, 연혁. 지금 사업은 국방 RF와 5G·6G 통신 장비뿐이고 방송 변조기나 NWBM 계열은 어디에도 없다.
  - 게시판 검색에서 `NWBM`, `8VSB`, `Caster`, `모듈레이터`, `방송`은 모두 "검색된 자료가 하나도 없습니다"다. 자료실 같은 게시판(`pds`, `data`, `download`, `support`)은 없다.
  - 첫 화면의 "국문 회사소개서"·"English PR" 버튼은 링크가 비어 있다(`href="#"`). 영문 페이지에도 제품 언급이 없다.
- **그 밖에 본 곳.**
  - 웹 검색(한국어·영어, 모델명·"HD Media Caster"·"8VSB")에서 나온 것은 판매 사이트의 상품 페이지(`matv.co.kr`, `eav.kr`)뿐이다. 공식 출처가 아니라 근거로 쓰지 않았다.
  - `fccid.io`의 인증 기록 페이지는 봇 확인을 요구해 열지 않았다.
  - Internet Archive에서 옛 `nextwill.com`을 찾으려 했으나 그때 서비스가 꺼져 있었다. 2010년 무렵 홈페이지에 제품 자료가 있었는지는 아직 모른다.
- **단자 대조.** 그림이 없어 하지 않았다. `system.ts`의 이 장비 연결 둘(`미상 → TV 채널 변환기`, `TV 채널 변환기 → 교회 내 TV`)에는 `port`가 없다. `system.ts`는 고치지 않았다.
- **다음에 할 수 있는 것.** 사람이 정한다.
  1. Internet Archive가 돌아오면 옛 `nextwill.com`에서 제품 페이지나 매뉴얼 PDF를 다시 찾는다.
  2. 제조사 홈페이지의 대표 연락처로 매뉴얼을 요청한다.
  3. 공식 매뉴얼이 끝내 없으면, 방송실 실물의 앞·뒷면 사진을 근거로 그려도 되는지 정한다. 지금 [map](../map.md) Decisions는 근거를 제조사 공식 매뉴얼로 정해 두었다.
