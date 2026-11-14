# 07: RC-IP100 생김새 그림

Type: task
Status: resolved
Blocked by: 06

## 무엇을 하나

PTZ 컨트롤러(Canon RC-IP100)의 앞·뒤 그림을 06의 틀에 더한다. 근거는 [device-manuals.md](../device-manuals.md)다.

## 시작 조건

사람이 06의 그림을 실물과 비교한 뒤 시작하기로 했으나, 2026-11-14에 사람이 비교를 기다리지 않고 진행하라고 했다.

## 끝난 조건

06과 같다.

## Answer

- **그림.** `_lib/rc-ip100-figure.ts`. 앞은 터치 패널, 컨트롤 레버와 그 머리의 F3 손잡이, USER 버튼 둘, F1·F2·F4 손잡이, 줌 레버, ALARM·POWER 표시등이다. 뒤는 매뉴얼 21쪽 순서대로 전원 스위치, 와이어 클램프, DC 12V, LAN, SERVICE, TALLY(D-sub 9), SETTING 스위치, SERIAL이다.
- **그리지 않은 것.** 버튼에 인쇄된 글자와 터치 패널 화면은 매뉴얼 그림에 없어 비웠다. 뒷면에는 매뉴얼의 단자 이름만 적었다. 앞쪽 높이와 조작부 기울기는 치수 그림의 옆모습에서 쟀다.
- **단자 부품을 올렸다.** BNC, D-sub, RJ-45, 나사와 납작한·둥근 구멍 단자를 `_lib/device-connectors.ts`로 옮겨 AV-HS410과 같이 쓴다.
- **단자 대조.** 데이터의 `LAN`을 매뉴얼의 `LAN terminal`로 잇는 `aliases` 하나가 있다. `SERIAL terminal`이 `LAN terminal`과 같은 RJ-45 모양이라는 것을 이름 옆에 적었다.
- **검증.** 06과 같다. audit과 선 끝 검사는 두 시점 모두 0건이다. SVG는 앞 91KB, 뒤 110KB다.
