# 장비 생김새 그림의 근거 매뉴얼

장비 생김새 그림([map](map.md) Decisions)은 아래 문서의 그림과 각부 명칭을 보고 그린다. PDF는 커밋하지 않는다. 읽은 날은 2026-11-11이다.

| 장비 `id` | 모델 | 문서 | 참고한 쪽 |
| - | - | - | - |
| 영상 스위처 | Panasonic AV-HS410 | [Operating Instructions, Basics](https://eww.pass.panasonic.co.jp/pro-av/support/dload/hs410_ver201/operation_base_e.pdf) (2012, 40쪽. 표지 모델 AV-HS410N) | 앞면 17–26, 뒷면 27, 치수 37 |
| PTZ 컨트롤러 | Canon RC-IP100 | [User Manual (Basic)](https://gdlp01.c-wss.com/gds/4/0300041534/01/rcip10sm-e.pdf) BIE-7291-000 (2021, 24쪽) | 각부 명칭 21, 치수 23 |
| 백업 송출 장비 | AJA HELO Plus | [Installation and Operation Guide v2.1r3](https://www.aja.com/support/item-download/10154/AJA_HELO-Plus_Manual_v2.1r3.pdf) (2026-01-06, 115쪽) | 앞면 12–14, 뒷면 15–16, 치수 100 |
| 조명 콘솔 | Botex DC-2448 Light Operator | [User Manual](https://fast-images.static-thomann.de/pics/atg/atgdata/document/manual/216405_c_216405_v2_en_online.pdf) Thomann, ID 216405 V2 (2024-01-11, 32쪽) | 윗면 10–12, 뒷면 13, 사양 27–28 |

## 읽으며 확인한 것

- **AV-HS410** — 440 × 158 × 361mm. 뒷면 단자 이름은 `SDI INPUTS 1`–`8`, `SDI OUTPUTS 1`–`5`, `DVI-D IN`, `DVI-D OUT`, `REF`, `LAN`, `EDITOR`, `COM`, `TALLY/GPI 1`·`2`, `SIGNAL GND`, `~ AC IN`, `POWER`, `BOOT`, `SLOT A`·`B`다. `SDI OUTPUTS 1`은 같은 신호가 BNC 둘로 나온다. DVI는 DVI-D만 되고 DVI-I 케이블은 쓸 수 없다.
- **RC-IP100** — 350 × 182 × 110mm. 뒷면은 왼쪽부터 Power switch, Wire Clamp, `DC 12V`, `LAN`, `SERVICE`, `TALLY`(D-sub 9), `SETTING` switch, `SERIAL`(RS-422)이다. `SERIAL`은 `LAN`과 같은 RJ-45 모양이다.
- **HELO Plus** — 215.9 × 139.7 × 25.9mm. 뒷면은 왼쪽부터 `AUDIO IN`, `AUDIO OUT`, `SDI IN`, `SDI OUT`, `HDMI IN`, `HDMI OUT`, `USB CONFIG`, `LAN`, `PWR`이다. 앞면은 `RECORD`, `STREAM`, `AUDIO LEVEL`, reset, `USB STORAGE`, `SD CARD`, `POWER STATUS`다.
- **DC-2448** — 716 × 80 × 267mm(W × H × D, 27쪽). 읽은 날은 2026-11-19다. 뒷면은 뒤에서 본 왼쪽부터 `POWER`, `DC IN`, `MIDI THRU`·`OUT`·`IN`(DIN 5핀), `DMX OUT`(3핀 XLR), `AUDIO`(RCA), `REMOTE`(6.35mm 스테레오 잭), `FOG MACHINE`(DIN 5핀)이다. 윗면에 인쇄된 이름은 "SCENE SETTER-48 / DC-2448 48CH Dimmer Console"이다. 옆모습 그림은 없다. 뒷면 그림 비율로 재면 몸통 높이가 약 47mm라 사양의 80mm와 다르다. 28쪽은 DMX 입력(XLR 수 단자)도 있다고 적지만 13쪽 뒷면 그림과 단자 목록에는 `DMX OUT`만 있다. 9쪽은 9V 어댑터라 하고 27쪽 사양은 12–20V라 해서 서로 다르다.

## 아직 못 한 것

- AV-HS410E판 문서와 뒷면 대조. 읽은 문서의 표지 모델은 AV-HS410N이다.
