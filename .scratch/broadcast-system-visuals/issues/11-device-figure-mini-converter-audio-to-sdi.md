# 11: Blackmagic Mini Converter Audio to SDI 생김새 그림

Type: task
Status: resolved
Blocked by: 10

## 무엇을 하나

오디오 임베더(Blackmagic Mini Converter Audio to SDI)의 앞·뒤 그림을 06의 틀에 더한다. 영상과 소리가 처음 합쳐지는 곳이다. 꺼지면 주 송출·백업 송출·백업 녹화가 모두 끊긴다. 상판 SDI LOCK 표시등을 알아보게 한다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/mini-converter-audio-to-sdi-figure.ts`, `slug`는 `mini-converter-audio-to-sdi`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

- **그림.** `_lib/mini-converter-audio-to-sdi-figure.ts`. 단자가 상자의 두 끝에 나뉘어 있어 앞은 SDI 쪽 끝, 뒤는 오디오 쪽 끝을 본다. 앞은 왼쪽부터 POWER +12V, SDI IN, ALT SDI IN, SDI OUT(BNC 셋), Mini-B USB Port, SDI LOCK 표시등과 윗면의 케이블 타이 구멍이다. 뒤는 CH 1–4 오디오 잭(1/4인치 TRS) 넷이다. 윗면에 인쇄된 단자 이름, 제품 이름, 로고와 덮개가 끝면보다 튀어나온 모양, 앞쪽 옆면의 나사 둘을 매뉴얼 그림과 치수 사진대로 넣었다. 자리는 매뉴얼 62쪽 윗면 그림에서 재서 mm로 옮겼다.
- **치수.** Tech Specs 4.52 × 3.63 × 0.90in(114.8 × 92.2 × 22.9mm). 4.52in은 단자까지 잰 길이라 몸통 길이는 62쪽 그림의 비율로 97.5mm로 잡았다. [device-manuals.md](../device-manuals.md)에 적었다.
- **그리지 않은 것.** 설정 스위치 8개는 바닥에 설명표가 있다고만 하고 이 모델의 스위치 자리 그림이 없어 그리지 않았다. 로고 쪽 긴 옆면도 매뉴얼 그림에 없어 비웠다. 끝면에서 단자의 높이는 사진에서 어림했다. 캡션에 밝힌다.
- **SDI LOCK.** 이름은 윗면 인쇄로만 있고, 표시등은 5쪽 그림의 USB 단자 옆 작은 구멍 자리에 그렸다. 데이터의 `notes`는 "상판 SDI LOCK 표시등"이라 적었는데, 매뉴얼 그림으로는 글자가 윗면에 있고 불은 SDI 쪽 끝면에 있는 것으로 보인다. 실물로 확인할 거리다.
- **틀.** 끝면에 단자가 있는 장비를 위해 `device-figure.ts`에 `endPlane`과 `Plane.across`를 더했다. 기존 그림은 SVG와 저장된 순서가 그대로다. 단자가 두 시점에 나뉘므로 `device-figures.test.ts`의 단자 대조를 "뒤 그림"에서 "앞·뒤 그림"으로 넓혔고, 이름의 `&`를 `&amp;`로 바꿔 찾는다.
- **단자 대조.** `SDI IN`, `SDI OUT`은 매뉴얼 이름과 같다. 어긋나는 것은 하나다.
  - `CH1·CH2` → `CH 1 ANALOG or CH 1&2 AES/EBU`와 `CH 2 ANALOG or CH 3&4 AES/EBU`(잭 둘), 62쪽. 데이터는 L·R 두 선을 한 끝점으로 적었다.
  - 테스트가 깨지지 않게 `aliases`에 `CH1·CH2` → `CH 1 ANALOG or CH 1&2 AES/EBU`를 임시로 넣었다. 그래서 그림에는 CH 1 잭에만 꽂힌 것으로 보인다. 데이터를 어떻게 고칠지(연결을 둘로 나눌지) 사람이 정한다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test` 통과. anatomy audit(`ANATOMY_AUDIT=1`)은 두 시점 모두 0건, 선 끝 검사(`scripts/lines.mjs`)는 두 시점·두 테마 모두 0건이다. 렌더링한 PNG를 매뉴얼 그림·치수 사진과 비교했다. SVG는 앞 51KB, 뒤 30KB다.
