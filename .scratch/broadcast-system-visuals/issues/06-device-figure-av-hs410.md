# 06: 장비 생김새 그림의 공통 틀과 AV-HS410

Type: task
Status: claimed
Blocked by: —

## 무엇을 하나

영상 스위처(Panasonic AV-HS410)의 생김새를 anatomy 그림 두 장(앞·뒤)으로 그리고, 다른 장비 그림이 같이 쓸 틀을 만든다. 결정과 이유는 [map](../map.md) Decisions에, 근거 매뉴얼은 [device-manuals.md](../device-manuals.md)에 있다. 그리기 전에 anatomy `SKILL.md`와 `references/craft.md`, `references/react.md`를 읽는다.

1. **그림** — 앞 시점은 조작 패널(디스플레이, 크로스포인트, 전환부, 메모리·숫자 키, 사용자 버튼, 포지셔너)을 버튼 개수대로 그린다. 뒤 시점은 단자를 매뉴얼 27쪽 배열대로 그린다. 옵션 슬롯은 비워 둔다.
2. **단자 목록** — 그림 모듈이 단자 이름 목록을 내보낸다. 그림이 있는 장비의 `system.ts` `port`가 이 목록에 있는지 테스트가 본다. 그 과정에서 나온 어긋남은 Answer에 목록으로 적고, 데이터는 승인받아 고친다.
3. **틀** — 앞·뒤 넘기기, 단자·구역을 누르거나 올리면 이름이 나오는 것, `port`가 적힌 단자의 "○○가 꽂혀 있다" 표시, "생김새 보기" 버튼과 dialog. 장비 목록표 행과 신호 흐름도 자세히에서 같은 dialog를 연다.

## 건드리지 않는 것

신호 흐름도의 배치·칠하기, 장비 목록표의 표 구조. 버튼 하나를 더할 뿐이다.

## 끝난 조건

- 04와 같은 검증(anatomy Verify, 밝은·어두운 테마, 데스크톱·휴대폰 폭 캡처).
- 휴대폰 너비에서 단자 이름이 읽힌다.
- `pnpm lint && pnpm typecheck && pnpm test`, `pnpm build`가 통과한다.
- 끝나면 멈추고 사람이 실물과 비교한다.
