# 14: Drawmer DA-6 생김새 그림

Type: task
Status: resolved
Blocked by: 10

## 무엇을 하나

오디오 분배기(Drawmer DA-6)의 앞·뒤 그림을 06의 틀에 더한다. 출력1·2·4·6에 라벨이 붙어 있고 확인 필요 5·10번과 이어진다.

- 근거는 제조사 공식 매뉴얼이다. 출처(제목·판·URL·쪽)와 치수를 [device-manuals.md](../device-manuals.md)에 적는다. PDF는 커밋하지 않는다.
- 그림 모듈은 `_lib/da-6-figure.ts`, `slug`는 `da-6`다. `device-figures.ts`와 `device-figure-ids.ts`에 더한다. 단자 부품은 `device-connectors.ts`를 쓴다.

## 끝난 조건

- 앞·뒤 두 시점이 있고, 뒷면 단자는 매뉴얼 이름으로 모두 그려져 있다.
- 매뉴얼에 없는 것은 그리지 않고 캡션(caveat)에 밝힌다.
- `system.ts`의 `port`가 매뉴얼 단자 이름과 어긋나면 고치기 전에 목록으로 보이고 사람이 정한다.
- `UPDATE_FIGURE_ORDER=1 pnpm test`로 순서를 저장했고, `ANATOMY_AUDIT=1 pnpm test`와 anatomy `scripts/lines.mjs` 선 끝 검사가 0건이다. 렌더링한 그림을 보고 확인했다.

## 건드리지 않는 것

- 다른 장비의 그림 모듈.

## Answer

- **그림.** `_lib/da-6-figure.ts`. 앞은 랙 귀(긴 구멍 넷), INPUT 칸(손잡이 둘, 표시등 2줄 × 6), OUTPUT 1–6 칸(칸마다 이름 띠, 손잡이 둘, MONO·STEREO 표시등 둘과 버튼), OUTPUT MONITOR 칸(표시등 2줄 × 8, SELECT CHANNEL·H/PHONE 손잡이, 헤드폰 단자), 상표다. 손잡이 둘레 눈금과 숫자도 그렸다. 뒤는 왼쪽부터 전원 단자와 퓨즈 서랍, OUTPUTS CHANNEL 6–1(칸마다 RIGHT·LEFT XLR 수), AUX. OUTPUT(L·R 잭), INPUT(RIGHT·LEFT XLR 암)이다.
- **근거.** 매뉴얼(PDF 12쪽)에는 앞면 일부 그림(PDF 8–9)과 치수(PDF 11, 482 × 44 × 200mm)만 있고 뒷면 그림이 없다. 뒷면과 앞면 전체 배열은 Drawmer 제품 페이지의 앞·뒷면 선 그림을 따랐고, XLR 암수는 같은 페이지의 뒷면 사진으로 정했다. 자리는 선 그림에서 재서 mm로 옮겼다. [device-manuals.md](../device-manuals.md)에 적었다.
- **단자 부품.** `device-connectors.ts`에 `xlr`(수·암), `quarterJack`(6.35mm, 둥근·육각 너트), `iecInlet`(C14와 퓨즈 서랍)을 더했다.
- **그리지 않은 것.** 앞면 이름 띠에 붙은 실제 라벨("스트리밍" 등), 옆면 나사, 안쪽 출력 트랜스포머(옵션)는 그리지 않았다. 매뉴얼과 그림에 전원 스위치가 없다. 제품 페이지 사진에는 `INPUT`이 `INPUTS`로 인쇄돼 있어 생산 시기마다 다를 수 있다. 캡션에 밝힌다.
- **단자 대조.** 데이터의 `port` 둘이 뒷면 이름과 다르다. 고치지 않았고, 테스트가 통과하도록 그림의 `aliases`로 임시로 이었다. 고칠지는 사람이 정한다.
  - `출력1` → `CHANNEL 1`(뒷면 OUTPUTS, RIGHT·LEFT XLR 2개. 앞면 칸 이름은 `OUTPUT 1`). 근거: 제품 페이지 선 그림, 매뉴얼 PDF 12 블록 다이어그램의 "Channel 1 Left/Right Output".
  - `출력4` → `CHANNEL 4`. 근거 같다.
  - 입력 쪽 연결(음향 콘솔 → 오디오 분배기)은 `port`가 비어 있어 대조할 것이 없다. 단자 이름은 `INPUT`이다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test` 통과. `ANATOMY_AUDIT=1`로 두 시점 audit 0건. 선 끝 검사(`scripts/lines.mjs`)는 두 시점·두 테마 모두 0건이다. 인쇄된 묶음선(MONO·STEREO 가지, H/PHONE 괄호, OUTPUTS·INPUT 밑줄)은 글자 앞에서 끊기는 인쇄 표시라 `free`로 표시했다. 헤드리스 Chrome으로 렌더링해 선 그림·사진과 비교했다.
- **SVG 크기.** 앞 244KB, 뒤 156KB다.
