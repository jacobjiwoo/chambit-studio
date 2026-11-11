# 장비 생김새 그림의 근거 매뉴얼

장비 생김새 그림([map](map.md) Decisions)은 아래 문서의 그림과 각부 명칭을 보고 그린다. PDF는 커밋하지 않는다. 읽은 날은 2026-11-11이다.

| 장비 `id` | 모델 | 문서 | 참고한 쪽 |
| - | - | - | - |
| 영상 스위처 | Panasonic AV-HS410 | [Operating Instructions, Basics](https://eww.pass.panasonic.co.jp/pro-av/support/dload/hs410_ver201/operation_base_e.pdf) (2012, 40쪽. 표지 모델 AV-HS410N) | 앞면 17–26, 뒷면 27, 치수 37 |
| PTZ 컨트롤러 | Canon RC-IP100 | [User Manual (Basic)](https://gdlp01.c-wss.com/gds/4/0300041534/01/rcip10sm-e.pdf) BIE-7291-000 (2021, 24쪽) | 각부 명칭 21, 치수 23 |
| 백업 송출 장비 | AJA HELO Plus | [Installation and Operation Guide v2.1r3](https://www.aja.com/support/item-download/10154/AJA_HELO-Plus_Manual_v2.1r3.pdf) (2026-01-06, 115쪽) | 앞면 12–14, 뒷면 15–16 |

## 읽으며 확인한 것

- **AV-HS410** — 440 × 158 × 361mm. 뒷면 단자 이름은 `SDI INPUTS 1`–`8`, `SDI OUTPUTS 1`–`5`, `DVI-D IN`, `DVI-D OUT`, `REF`, `LAN`, `EDITOR`, `COM`, `TALLY/GPI 1`·`2`, `SIGNAL GND`, `~ AC IN`, `POWER`, `BOOT`, `SLOT A`·`B`다. `SDI OUTPUTS 1`은 같은 신호가 BNC 둘로 나온다. DVI는 DVI-D만 되고 DVI-I 케이블은 쓸 수 없다.
- **RC-IP100** — 350 × 182 × 110mm. 뒷면은 왼쪽부터 Power switch, Wire Clamp, `DC 12V`, `LAN`, `SERVICE`, `TALLY`(D-sub 9), `SETTING` switch, `SERIAL`(RS-422)이다. `SERIAL`은 `LAN`과 같은 RJ-45 모양이다.
- **HELO Plus** — 뒷면은 왼쪽부터 `AUDIO IN`, `AUDIO OUT`, `SDI IN`, `SDI OUT`, `HDMI IN`, `HDMI OUT`, `USB CONFIG`, `LAN`, `PWR`이다. 앞면은 `RECORD`, `STREAM`, `AUDIO LEVEL`, reset, `USB STORAGE`, `SD CARD`, `POWER STATUS`다.

## 아직 못 한 것

- AV-HS410E판 문서와 뒷면 대조. 읽은 문서의 표지 모델은 AV-HS410N이다.
- HELO Plus 치수. 사양 부록에서 찾는다.
