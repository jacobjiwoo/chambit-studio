# 12: Datavideo DAC-8P 생김새 그림

Type: task
Status: needs-info
Blocked by: 10

## 무엇을 하나

SDI-HDMI 변환기(Datavideo DAC-8P)의 앞·뒤 그림을 06의 틀에 더한다. 확인 필요 3번(입력과 나머지 단자)을 실물에서 확인할 때 단자 그림이 기준이 된다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/dac-8p-figure.ts`, `slug`는 `dac-8p`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

그리지 않았다. 제조사 도메인에서 공식 매뉴얼을 받지 못했다. 2026-11-18.

- **찾아본 곳.** Datavideo 제품 페이지 `https://www.datavideo.com/global/product/DAC-8P`(검색 결과로는 LEGACY 표시, 다운로드 칸에 "DAC-8P Instruction Manual" 2021-07-26이 있다고 나온다), 같은 사이트의 지역판(`/us/`, `/af/…/export`)과 사양 비교 PDF(`/af/`·`/fr/product/compare/export/DAC-8P?format=pdf`). 모두 Cloudflare 봇 확인 화면("Just a moment...")이 HTTP 403으로 막아 내용을 읽지 못했다. 봇 확인은 우회하지 않는다. Internet Archive도 그날 내려가 있었다.
- **제조사 도메인 밖에 있는 사본.** 판매점 AV Pro Supply가 올린 "DAC-8P SDI TO HDMI CONVERTER Instruction Manual"(`https://files.avprosupply.com/files/attachments/17193/datavideo-hdmi-video-converter-dac8p-manual.pdf`, 12쪽, 판 표기 Jul-12.2017)이 있다. Datavideo 저작권 표기가 있는 같은 문서로 보인다. 앞면 7–8쪽, 뒷면 8–9쪽에 그림이 있고 치수는 105mm(W) × 120mm(D) × 38mm(H)다. 앞면은 SDI BNC 둘(왼쪽 HD/SD-SDI Input, 오른쪽 Loop Thru Output), RCA 오디오 입력 L/R, 오디오 소스를 고르는 Mini Switch(CH 1, CH 2 RESERVED), 뒷면은 DC In Socket(12V), Power Switch, HDMI Output이다. 공식 사이트의 2021년 판과 같은지는 확인하지 못했다. 다른 사본으로 calgarytechrent.com의 Quick Start Guide, cdn.iceshop.nl의 PDF가 검색됐다. DAC-8P 4K, DAC-8PA는 다른 제품이라 섞지 않는다.
- **정할 것.** 판매점 사본을 근거로 그려도 되는지, 아니면 사람이 브라우저로 제조사 페이지에서 매뉴얼을 받아 저장소 밖에 두고 경로를 알려 줄지.
- **단자 대조.** `system.ts`의 이 장비 연결 셋(영상 스위처 → 변환기, 변환기 → 오디오 임베더, 변환기 → 백업 송출 장비) 모두 변환기 쪽 `port`가 비어 있어 어긋남이 없다. 고친 것도 더한 `toConfirm`도 없다.
