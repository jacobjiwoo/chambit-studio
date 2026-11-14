# 08: HELO Plus 생김새 그림

Type: task
Status: resolved
Blocked by: 06

## 무엇을 하나

백업 송출 장비(AJA HELO Plus)의 앞·뒤 그림을 06의 틀에 더한다. 근거는 [device-manuals.md](../device-manuals.md)다. 치수는 사양 부록에서 찾아 적는다.

## 시작 조건

사람이 06의 그림을 실물과 비교한 뒤 시작하기로 했으나, 2026-11-14에 사람이 비교를 기다리지 않고 진행하라고 했다.

## 끝난 조건

06과 같다.

## Answer

- **그림.** `_lib/helo-plus-figure.ts`. 앞은 RECORD·STREAM 버튼과 표시등, 음량 표시(L·R 두 줄에 LED 일곱 개씩), 리셋 구멍, USB STORAGE 단자, SD CARD 슬롯, 전원 표시등이다. 뒤는 매뉴얼 Figure 4 순서대로 AUDIO IN, AUDIO OUT, SDI IN, SDI OUT, HDMI IN, HDMI OUT, USB CONFIG, LAN, PWR이다. 윗면 가장자리에 인쇄된 이름과 로고도 넣었다. 뒤 시점에서 로고가 뒤집혀 보이는 것은 매뉴얼의 뒷면 사진과 같다.
- **치수.** 매뉴얼 100쪽: 215.9 × 139.7 × 25.9mm. [device-manuals.md](../device-manuals.md)에 적었다.
- **재는 한계.** 부품의 가로 자리는 비스듬히 찍힌 사진에서 재서 몇 mm쯤 어긋날 수 있다. 캡션에 밝힌다.
- **단자 대조.** 데이터의 `port` 다섯(`AUDIO IN`, `SDI IN`, `SDI OUT`, `HDMI IN`, `LAN`)이 모두 인쇄된 이름과 같아 `aliases`가 비어 있다.
- **글자 방향.** `textOn`에 `turn`을 더했다. 윗면 뒤쪽 가장자리처럼 뒤에서 읽도록 인쇄된 글자에 쓴다.
- **검증.** 06과 같다. audit과 선 끝 검사는 두 시점 모두 0건이다. SVG는 앞 52KB, 뒤 55KB다.
- **페이지 크기.** 세 장비가 다 들어간 장비 목록표 페이지는 2.0MB(gzip 323KB), 신호 흐름도 페이지는 1.35MB(gzip 223KB)다. `pnpm test`는 27초쯤 걸린다.
