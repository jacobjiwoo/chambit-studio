# 장비 생김새 그림의 근거 매뉴얼

장비 생김새 그림([map](map.md) Decisions)은 아래 문서의 그림과 각부 명칭을 보고 그린다. PDF는 커밋하지 않는다. 읽은 날은 2026-11-11이다.

| 장비 `id` | 모델 | 문서 | 참고한 쪽 |
| - | - | - | - |
| 영상 스위처 | Panasonic AV-HS410 | [Operating Instructions, Basics](https://eww.pass.panasonic.co.jp/pro-av/support/dload/hs410_ver201/operation_base_e.pdf) (2012, 40쪽. 표지 모델 AV-HS410N) | 앞면 17–26, 뒷면 27, 치수 37 |
| PTZ 컨트롤러 | Canon RC-IP100 | [User Manual (Basic)](https://gdlp01.c-wss.com/gds/4/0300041534/01/rcip10sm-e.pdf) BIE-7291-000 (2021, 24쪽) | 각부 명칭 21, 치수 23 |
| 백업 송출 장비 | AJA HELO Plus | [Installation and Operation Guide v2.1r3](https://www.aja.com/support/item-download/10154/AJA_HELO-Plus_Manual_v2.1r3.pdf) (2026-01-06, 115쪽) | 앞면 12–14, 뒷면 15–16, 치수 100 |
| 오디오 임베더 | Blackmagic Mini Converter Audio to SDI | [Blackmagic Converters Installation and Operation Manual](https://documents.blackmagicdesign.com/UserManuals/BlackmagicConvertersManual.pdf) (2024년 7월, 1035쪽. 영어는 3–95쪽), [Tech Specs](https://www.blackmagicdesign.com/products/miniconverters/techspecs)의 [치수 사진](https://images.blackmagicdesign.com/images/products/miniconverters/techspecs/physical-specifications/mini-converter-audio-to-sdi-imperial@2x.jpg) (2026-11-19에 읽음) | 윗면 그림·단자 62, 스위치 63–64, 전원·케이블 타이 5, ALT SDI 6 |
| 오디오 분배기 | Drawmer DA6 | [DA6 Operators' Manual](https://www.drawmer.com/uploads/manuals/da6_operators_manual.pdf) (판 표기 없음, PDF 생성 2008, 12쪽). 뒷면은 [제품 페이지](https://www.drawmer.com/products/signal-distribution/da6.php)의 앞·뒷면 선 그림 `images/da6_line.png`와 뒷면 사진 `images/da6 rear just above.png` | 조작부 PDF 8–9(인쇄 6–7), 연결·전원 PDF 4–6, 치수 PDF 11 |
| 무선 마이크 수신기 1~4, 무선 마이크 수신기 5~6 | Shure QLXD4 | [QLX-D Wireless System user manual](https://pubs.shure.com/view/guide/QLXD/en-US.pdf) 8.2판 (2025-H, 60쪽. 2026-11-18에 읽음) | 바닥 발 7, 앞·뒷면 11–12, 치수 47 |
| 안테나 분배기 A, 안테나 분배기 B | Shure UA844+SWB | [UA844SWB User Guide](https://pubs.shure.com/view/guide/UA844/en-US.pdf) 27A21406 (Rev. 2, 2013, 6쪽. 2026-11-18에 읽음) | 치수 2, 앞·뒷면 3 |
| 조명 콘솔 | Botex DC-2448 Light Operator | [User Manual](https://fast-images.static-thomann.de/pics/atg/atgdata/document/manual/216405_c_216405_v2_en_online.pdf) Thomann, ID 216405 V2 (2024-01-11, 32쪽) | 윗면 10–12, 뒷면 13, 사양 27–28 |

## 읽으며 확인한 것

- **AV-HS410** — 440 × 158 × 361mm. 뒷면 단자 이름은 `SDI INPUTS 1`–`8`, `SDI OUTPUTS 1`–`5`, `DVI-D IN`, `DVI-D OUT`, `REF`, `LAN`, `EDITOR`, `COM`, `TALLY/GPI 1`·`2`, `SIGNAL GND`, `~ AC IN`, `POWER`, `BOOT`, `SLOT A`·`B`다. `SDI OUTPUTS 1`은 같은 신호가 BNC 둘로 나온다. DVI는 DVI-D만 되고 DVI-I 케이블은 쓸 수 없다.
- **RC-IP100** — 350 × 182 × 110mm. 뒷면은 왼쪽부터 Power switch, Wire Clamp, `DC 12V`, `LAN`, `SERVICE`, `TALLY`(D-sub 9), `SETTING` switch, `SERIAL`(RS-422)이다. `SERIAL`은 `LAN`과 같은 RJ-45 모양이다.
- **HELO Plus** — 215.9 × 139.7 × 25.9mm. 뒷면은 왼쪽부터 `AUDIO IN`, `AUDIO OUT`, `SDI IN`, `SDI OUT`, `HDMI IN`, `HDMI OUT`, `USB CONFIG`, `LAN`, `PWR`이다. 앞면은 `RECORD`, `STREAM`, `AUDIO LEVEL`, reset, `USB STORAGE`, `SD CARD`, `POWER STATUS`다.
- **Mini Converter Audio to SDI** — Tech Specs 4.52 × 3.63 × 0.90in(114.8 × 92.2 × 22.9mm). 4.52in은 단자까지 잰 길이라 몸통은 62쪽 윗면 그림의 비율로 97.5mm로 잡았다. 단자 이름은 `CH 1 ANALOG or CH 1&2 AES/EBU`–`CH 4 ANALOG or CH 7&8 AES/EBU`(1/4인치 TRS 잭 넷, 한쪽 끝), 반대쪽 끝에 `Mini-B USB Port`(인쇄 없음), `SDI OUT`, `ALT SDI IN`, `SDI IN`, `POWER +12V`다. USB 말고는 이름이 윗면에 인쇄돼 있다. `SDI LOCK`은 윗면 인쇄로만 이름이 있고, 표시등은 5쪽 그림의 USB 단자 옆 작은 구멍으로 보인다. 설정 스위치 8개가 있고 설명표는 바닥에 인쇄돼 있다(63–64쪽). 이 모델의 스위치 자리 그림은 없다.
- **DA6** — 482 × 44 × 200mm(랙 1U). 몸통 폭 434.6mm는 선 그림에서 쟀다. 매뉴얼에는 뒷면 그림이 없다. 뒷면 단자는 선 그림에서 왼쪽부터 전원 단자(퓨즈 서랍 붙음, `AC POWER ONLY 50/60Hz 30VA`), `OUTPUTS`의 `CHANNEL 6`–`CHANNEL 1`(칸마다 `RIGHT`·`LEFT` XLR 수), `AUX. OUTPUT`(`L`·`R` 6.35mm TRS), `INPUT`(`RIGHT`·`LEFT` XLR 암)이다. 제품 페이지 사진에는 `INPUT`이 `INPUTS`로 인쇄돼 있다. 앞면은 매뉴얼 이름으로 `Input L&R`, `Input Display`, `Output L&R`, `Mono/Stereo`, `Chan Select`, `H/Phone`, `Output Display`와 헤드폰 단자다. 전원 스위치는 매뉴얼과 그림 어디에도 없다.
- **QLXD4** — 41 × 197 × 151mm(H × W × D). 앞면은 매뉴얼 ①–⑩: `Display`, `Arrow Buttons`, `Enter Button`, `Sync Button`, `Power Switch`, `Audio LED`, `Menu Button`, `RF LED`, `IR Window`, `Sync LED`. 뒷면은 뒤에서 본 왼쪽부터 `Power Cord Strain Relief`, `Power Supply Jack`, `Ethernet Port`, `Receiver Reset`, antenna B, `Mic/Line Switch`, `XLR Audio Output`, `1/4" Instrument/Auxiliary Output`, antenna A다. 매뉴얼은 두 BNC를 묶어 `Antenna Connectors`라 부르고, 단자 옆에 `antenna A`·`antenna B`로 인쇄돼 있어 그림에서는 `Antenna Connector A`·`B`로 나눴다. mic / line 스위치는 XLR 출력에만 걸린다(39쪽 문제 해결). 바닥 발 4개는 사용자가 붙이는 부품이다.
- **UA844SWB** — 45 × 483 × 172mm(H × W × D), 1U 랙. 앞면은 매뉴얼 ①·②·③·⑩: `Antenna A Connector`(앞에서 왼쪽), `Power Indicator`, `Antenna B Connector`(오른쪽), `Power Switch`. 전원 스위치는 나라에 따라 없는 장비도 있다(2쪽 Note). 뒷면은 뒤에서 본 왼쪽부터 `RF Input, Antenna B`, `RF Output B Connectors`(BNC 넷), `14 to 18 Vdc Power Input`, `14 to 18 Vdc Power Output`(넷), `RF Output A Connectors`(BNC 넷), `RF Input, Antenna A`다. 안테나 입력 옆에 `12V ⎓ OUT 150mA CLASS 2`가 인쇄돼 있다. DC 출력은 모두 합쳐 2.5A까지다. 뒷몸통의 폭은 매뉴얼에 없다.
- **DC-2448** — 716 × 80 × 267mm(W × H × D, 27쪽). 읽은 날은 2026-11-19다. 뒷면은 뒤에서 본 왼쪽부터 `POWER`, `DC IN`, `MIDI THRU`·`OUT`·`IN`(DIN 5핀), `DMX OUT`(3핀 XLR), `AUDIO`(RCA), `REMOTE`(6.35mm 스테레오 잭), `FOG MACHINE`(DIN 5핀)이다. 윗면에 인쇄된 이름은 "SCENE SETTER-48 / DC-2448 48CH Dimmer Console"이다. 옆모습 그림은 없다. 뒷면 그림 비율로 재면 몸통 높이가 약 47mm라 사양의 80mm와 다르다. 28쪽은 DMX 입력(XLR 수 단자)도 있다고 적지만 13쪽 뒷면 그림과 단자 목록에는 `DMX OUT`만 있다. 9쪽은 9V 어댑터라 하고 27쪽 사양은 12–20V라 해서 서로 다르다.

## 아직 못 한 것

- AV-HS410E판 문서와 뒷면 대조. 읽은 문서의 표지 모델은 AV-HS410N이다.
