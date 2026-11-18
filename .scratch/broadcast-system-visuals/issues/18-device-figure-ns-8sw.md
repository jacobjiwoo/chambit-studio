# 18: LEEM NS-8SW 생김새 그림

Type: task
Status: open
Blocked by: 10

## 무엇을 하나

영상 전원 시퀀서(LEEM NS-8SW)의 앞·뒤 그림을 06의 틀에 더한다. 켜는 순서와 채널 할당(확인 필요 11번)을 확인할 때 기준이 된다. 공식 매뉴얼을 구할 수 있는지부터 본다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/ns-8sw-figure.ts`, `slug`는 `ns-8sw`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

그리지 않았다. 공식 매뉴얼이 제조사 사이트에 있지만 내려받지 못했다. Status는 open으로 둔다. 2026-11-18에 찾아본 것은 아래와 같다.

- **찾은 곳.** 웹 검색(한국어·영어)에는 판매 사이트만 나왔다. 제조사 (주)임산업 사이트 `leem.co.kr`의 자료실(`/customer/archives`)에는 카탈로그, 회사소개서, QX48 Quick Guide뿐이다. 제품 페이지 [NS-8SW](https://www.leem.co.kr/information/powersupply?idx=96)에 NS series 공용 매뉴얼 `SEQUENCE_POWERSUPPLY.pdf`와 `NS-8SW.zip`, `NS-8SW.hwp`가 걸려 있다.
- **못 내려받은 이유.** 사이트의 다운로드 주소(`/main/file_down`)가 브라우저 밖의 요청에 PDF 대신 "올바른 방법으로 이용해 주십시오." 경고 페이지를 돌려준다. 이 제한을 돌아가는 요청은 하지 않았다.
- **제품 페이지에서 읽은 것.** 페이지 Specification은 8 CH와 Direct out 1CH(CH1은 항상 전원), CH load 220V / 10A 2200W, Total max load 220V / 45A 9900W, CH interval 2 sec, 출력 단자 Standard three wire AC connector, Link cable RJ-45, 480(W) × 89(H) × 305.5(D)mm, 10kg이다. 본문은 1번 채널이 항상 켜져 있고 2–8번이 차례로 켜지며 8번부터 2번까지 거꾸로 꺼진다고 설명한다.
- **매뉴얼이 필요한 까닭.** 제품 페이지의 앞면 사진과 뒷면 사진·선 그림은 600px 이하라 앞면 글자(버튼 이름, `DIRECT OUT` 정격)를 다 읽을 수 없다. 뒷면 사진에 인쇄된 총 부하 숫자가 Specification의 9900W와 달라 보인다. 전기 장비라 이런 숫자와 이름을 사진에서 짐작해 그리지 않는다.
- **단자 대조.** `system.ts`에서 이 장비를 잇는 연결 네 개(공유기, 멀티뷰, 백업 녹화기, 백업 송출 장비)에는 `port`가 없다. 대조할 것이 없고 고친 것도 없다.

이어 하려면 사람이 브라우저로 위 제품 페이지의 "매뉴얼" 링크를 열어 PDF를 저장소 밖에 받아 두고 이 티켓을 다시 시작한다.
