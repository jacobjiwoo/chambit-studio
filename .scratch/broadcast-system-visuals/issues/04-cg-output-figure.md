# 04: CG 출력 원리 anatomy 그림

Type: task
Status: ready-for-agent
Blocked by: —

## 무엇을 하나

장비 목록표의 "CG 출력 원리 (하드웨어)" 절에 anatomy skill로 그린 인터랙티브 그림을 넣는다. 결정과 이유는 [map](../map.md) Decisions에 있다. 그리기 전에 anatomy `SKILL.md`와 `references/craft.md`, `references/react.md`를 읽는다.

1. **무엇을 보이나** — CG PC 문자발생기 보드가 FILL과 KEY 두 신호를 내고, 영상 스위처의 DSK가 KEY 모양대로 PGM을 오려 FILL을 채운다. DSK ON/OFF로 CG가 켜지고 꺼지며, 카메라를 바꿔도 CG가 남는다. 이 절의 산문에 있는 사실만 그린다. 절에 없는 동작을 지어내지 않는다.
2. **크기** — skill의 Figure(부품 40–80개, 하나의 메커니즘)로 시작한다.
3. **kit 위치** — anatomy `kit/`을 복사한다. React를 import하는 파일은 `app/docs/broadcast-system/_components/`에, 아닌 파일은 `_lib/`에 둔다([project-structure.md](../../../.claude/rules/project-structure.md)). 파일 이름은 kebab-case로 맞춘다. MIT 라이선스 고지를 복사한 kit 옆에 둔다.
4. **배치** — 정적 그림은 서버 컴포넌트, 움직임은 `"use client"` 컴포넌트 하나. 정적 export에서 동작해야 한다.

## 건드리지 않는 것

장비 목록표에서는 "CG 출력 원리" 절만 만진다. 산문은 그림 아래 캡션·설명으로 남긴다.

## 끝난 조건

- skill의 Verify를 따른다. 케이블·둥근 부품이 있으면 audit이 `audit passed`로 끝난다. 데스크톱·휴대폰 폭, 밝은·어두운 테마, 움직임 여러 순간을 캡처해 사람이 확인한다.
- `prefers-reduced-motion`에서 움직이지 않는다.
- `pnpm lint && pnpm typecheck && pnpm test`, `pnpm build`가 통과한다. kit 복사본 때문에 lint 규칙을 끄게 되면 끄는 범위와 이유를 Answer에 적는다.
